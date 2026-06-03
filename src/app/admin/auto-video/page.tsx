
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, AlertCircle, CheckCircle2, ArrowRight, Trash2, ShoppingBag, Users, Camera, Tv, Film, Scissors } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { removeBackground } from '@imgly/background-removal';
import { toast } from 'sonner';
import Image from 'next/image';

interface Project {
    _id: string;
    topic: string;
    projectType: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    createdAt: string;
    finalVideoUrl?: string;
    workflow?: {
        currentStep: string;
        errors: string[];
    };
}

export default function AutoVideoPage() {
    const [topic, setTopic] = useState('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [productName, setProductName] = useState(''); // New: Product name specifically
    const [productImage, setProductImage] = useState<string | null>(null);
    const [productCutout, setProductCutout] = useState<string | null>(null); // New: Background removed product
    const [modelImage, setModelImage] = useState<string | null>(null);
    const [modelCutout, setModelCutout] = useState<string | null>(null); // New: Background removed model
    const [uploading, setUploading] = useState<string | null>(null); // 'product' | 'model'
    const router = useRouter();

    useEffect(() => {
        fetchProjects();
        const interval = setInterval(fetchProjects, 10000); // Poll slower
        return () => clearInterval(interval);
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/admin/video/projects');
            const data = await res.json();
            if (data.projects) {
                setProjects(data.projects);
            }
        } catch (error) {
            console.error('Failed to fetch projects', error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'model') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(type);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;

                // 1. Original Upload
                const res = await fetch('/api/admin/video/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64, folder: 'video-assets' })
                });
                const data = await res.json();

                if (res.ok && data.url) {
                    if (type === 'product') setProductImage(data.url);
                    else setModelImage(data.url);

                    // 2. Background Removal (Concurrent)
                    toast.info(`${type === 'product' ? '상품' : '모델'} 이미지에서 배경을 제거하여 정밀 분석용 에셋을 생성합니다...`);
                    try {
                        const blob = await removeBackground(base64, {
                            model: 'medium',
                            publicPath: `${window.location.origin}/imgly-assets/`
                        });
                        const cutoutReader = new FileReader();
                        cutoutReader.onloadend = async () => {
                            const cutoutBase64 = cutoutReader.result as string;
                            const cutoutRes = await fetch('/api/admin/video/upload', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    image: cutoutBase64,
                                    folder: 'video-assets-cutout',
                                    fileName: `cutout_${type}_${Date.now()}.png`
                                })
                            });
                            const cutoutData = await cutoutRes.json();
                            if (cutoutRes.ok && cutoutData.url) {
                                if (type === 'product') setProductCutout(cutoutData.url);
                                else setModelCutout(cutoutData.url);
                                toast.success(`${type === 'product' ? '상품' : '모델'} 추출 완료! (정밀 분석 준비됨)`);
                            }
                        };
                        cutoutReader.readAsDataURL(blob);
                    } catch (bgError) {
                        console.warn('Background removal failed, will use original for analysis', bgError);
                    }
                } else {
                    alert('업로드 실패: ' + data.error);
                }
                setUploading(null);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Upload error', error);
            setUploading(null);
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!confirm('정말로 이 프로젝트를 삭제하시겠습니까? 복구할 수 없습니다.')) return;

        try {
            const res = await fetch(`/api/admin/video/${projectId}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (res.ok) {
                // Remove from state immediately
                setProjects((prev) => prev.filter((p) => p._id !== projectId));
            } else {
                alert('삭제 실패: ' + data.error);
            }
        } catch (error) {
            console.error('Failed to delete project', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const handleCreateProject = async () => {
        if (!topic || !selectedType) {
            alert('영상 주제를 입력해주세요.');
            return;
        }

        // 상품 홍보의 경우 상품명과 필수 파일 체크
        if (selectedType === 'product_promo') {
            if (!productName) {
                alert('상품명을 입력해주세요.');
                return;
            }
            if (!productImage) {
                alert('상품 이미지를 업로드해주세요.');
                return;
            }
        }

        setGenerating(selectedType);
        try {
            const res = await fetch('/api/admin/video/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    productName: selectedType === 'product_promo' ? productName : undefined,
                    projectType: selectedType,
                    initialAssets: selectedType === 'product_promo' ? [
                        { type: 'image', role: 'product', path: productImage },
                        { type: 'image', role: 'product_cutout', path: productCutout },
                        { type: 'image', role: 'model', path: modelImage },
                        { type: 'image', role: 'model_cutout', path: modelCutout }
                    ].filter(a => a.path) : []
                }),
            });

            const data = await res.json();

            if (res.ok && data.projectId) {
                setTopic('');
                setProductName('');
                setSelectedType(null);
                setProductImage(null);
                setModelImage(null);
                router.push(`/admin/auto-video/${data.projectId}`);
            } else {
                alert('Failed to create project: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            alert('Error creating project');
        } finally {
            setGenerating(null);
        }
    };

    const projectTypes = [
        { id: 'shortform', label: '1. 숏폼 생성', icon: <Film className="w-5 h-5 mr-3" />, color: 'bg-primary hover:bg-primary/90', desc: '현재 완성된 자동영상 제작' },
        { id: 'product_promo', label: '2. 상품 홍보 숏폼', icon: <ShoppingBag className="w-5 h-5 mr-3" />, color: 'bg-blue-600 hover:bg-blue-700', desc: '이미지로 상품을 효과적으로 홍보' },
        { id: 'influencer_promo', label: '3. 인플루언서 상품 홍보', icon: <Users className="w-5 h-5 mr-3" />, color: 'bg-purple-600 hover:bg-purple-700', desc: '만들어 놓은 인플루언서의 상품 홍보' },
        { id: 'influencer_vlog', label: '4. 인플루언서 브이로그', icon: <Camera className="w-5 h-5 mr-3" />, color: 'bg-orange-600 hover:bg-orange-700', desc: '인플루언서의 일상 숏폼 제작' },
        { id: 'influencer_long', label: '5. 인플루언서 롱폼', icon: <Tv className="w-5 h-5 mr-3" />, color: 'bg-red-600 hover:bg-red-700', desc: '인플루언서의 전문적인 긴 영상' },
    ];

    const currentType = projectTypes.find(t => t.id === selectedType);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">자동 영상 생성 (Auto Video) (V2)</h1>
                    <p className="text-muted-foreground mt-2">
                        유니클 에이전트와 함께 단계별로 영상을 기획하고 제작합니다.
                    </p>
                </div>
            </div>

            {/* Input & Action Section */}
            <Card className="border-2 border-primary/20 overflow-hidden shadow-lg">
                {!selectedType ? (
                    <>
                        <CardHeader className="bg-muted/30">
                            <CardTitle>새 프로젝트 기획하기</CardTitle>
                            <CardDescription>먼저 제작하고 싶은 영상의 유형을 선택해 주세요.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projectTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        className={`flex items-start p-4 rounded-xl border-2 border-transparent hover:border-primary/50 hover:bg-muted/50 transition-all text-left group shadow-sm`}
                                        onClick={() => setSelectedType(type.id)}
                                    >
                                        <div className={`p-3 rounded-lg ${type.color} text-white mr-4 shrink-0 shadow-md`}>
                                            {type.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{type.label}</h3>
                                            <p className="text-sm text-muted-foreground mt-1 leading-snug">{type.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </>
                ) : (
                    <>
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className={`p-2 rounded-md ${currentType?.color} text-white mr-3`}>
                                        {currentType?.icon}
                                    </div>
                                    <div>
                                        <CardTitle>{currentType?.label}</CardTitle>
                                        <CardDescription>{currentType?.desc}</CardDescription>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setSelectedType(null);
                                    setProductImage(null);
                                    setModelImage(null);
                                }}>유형 다시 선택</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8 pb-10 max-w-4xl mx-auto space-y-8">
                            {/* 상품 홍보 채널 전용 업로드 단계 */}
                            {selectedType === 'product_promo' && (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold block ml-1 text-blue-600">상품명 (품명) 정확히 입력 *</label>
                                        <Input
                                            placeholder="예: 갤럭시 S24 울트라 티타늄 그레이"
                                            value={productName}
                                            onChange={(e) => setProductName(e.target.value)}
                                            className="text-lg py-6 px-5 border-2 focus-visible:ring-blue-500 shadow-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold flex items-center text-blue-600">
                                                <ShoppingBag className="w-4 h-4 mr-2" /> 상품 사진 업로드 *
                                            </label>
                                            <div className="aspect-square bg-muted/20 border-2 border-dashed rounded-xl flex items-center justify-center relative overflow-hidden hover:bg-muted/40 transition-colors group">
                                                {productImage ? (
                                                    <Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized src={productImage} alt="Product" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center p-4">
                                                        {uploading === 'product' ? (
                                                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                                        ) : (
                                                            <>
                                                                <Play className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2 rotate-90" />
                                                                <p className="text-sm text-muted-foreground">클릭하여 상품 이미지를 업로드하세요</p>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    title="상품 이미지 업로드"
                                                    onChange={(e) => handleFileUpload(e, 'product')}
                                                    disabled={uploading !== null}
                                                />
                                                {productImage && (
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                                                        <Badge variant="secondary">이미지 변경</Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-bold flex items-center text-purple-600">
                                                <Users className="w-4 h-4 mr-2" /> 배경/모델 사진 업로드 (선택)
                                            </label>
                                            <div className="aspect-square bg-muted/20 border-2 border-dashed rounded-xl flex items-center justify-center relative overflow-hidden hover:bg-muted/40 transition-colors group">
                                                {modelImage ? (
                                                    <Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized src={modelImage} alt="Model" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center p-4">
                                                        {uploading === 'model' ? (
                                                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                                        ) : (
                                                            <>
                                                                <Play className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2 rotate-90" />
                                                                <p className="text-sm text-muted-foreground">클릭하여 모델 이미지를 업로드하세요</p>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    title="모델 이미지 업로드"
                                                    onChange={(e) => handleFileUpload(e, 'model')}
                                                    disabled={uploading !== null}
                                                />
                                                {modelImage && (
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                                                        <Badge variant="secondary">이미지 변경</Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="text-sm font-bold block ml-1 text-primary">프로젝트 기획 텍스트 입력</label>
                                <div className="flex gap-3">
                                    <Input
                                        placeholder={selectedType === 'product_promo' ? "업로드한 상품을 어떻게 홍보할까요? (예: 고급스러운 분위기를 강조해줘)" : "어떤 영상을 만들고 싶으신가요? (예: 황사 일요일 코믹 에피소드)"}
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="text-lg py-7 px-5 border-2 focus-visible:ring-primary shadow-sm"
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                                    />
                                    <Button
                                        size="lg"
                                        className="h-auto py-4 px-8 font-bold text-lg shadow-md"
                                        onClick={handleCreateProject}
                                        disabled={generating !== null || !topic || (selectedType === 'product_promo' && (!productImage || !productName))}
                                    >
                                        {generating ? (
                                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> 생성 중...</>
                                        ) : (
                                            <><Play className="mr-2 h-5 w-5 fill-current" /> 프로젝트 생성</>
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground ml-1">
                                    {selectedType === 'product_promo' ? "이미지, 상품명 및 기획이 준비되면 '프로젝트 생성'을 클릭하세요." : "엔터 키를 누르거나 '프로젝트 생성' 버튼을 클릭하면 유니클 트렌드 분석이 시작됩니다."}
                                </p>
                            </div>
                        </CardContent>
                    </>
                )}
            </Card>

            {/* Project List */}
            <h2 className="font-semibold mt-8 text-xl">내 프로젝트 ({projects.length})</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                    <Card
                        key={project._id}
                        className="overflow-hidden border hover:border-primary transition-all cursor-pointer group relative"
                        onClick={() => router.push(`/admin/auto-video/${project._id}`)}
                    >
                        {/* Delete Button */}
                        <button
                            className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent card click
                                handleDeleteProject(project._id);
                            }}
                            title="프로젝트 삭제"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg truncate w-2/3 group-hover:text-primary transition-colors" title={project.topic}>
                                    {project.topic}
                                </CardTitle>
                                <div className="shrink-0 flex gap-2">
                                    <Badge variant="outline">{
                                        project.projectType === 'shortform' ? '숏폼' :
                                            project.projectType === 'product_promo' ? '상품홍보' :
                                                project.projectType === 'influencer_promo' ? '인플홍보' :
                                                    project.projectType === 'influencer_vlog' ? '브이로그' :
                                                        project.projectType === 'influencer_long' ? '롱폼' : '일반'
                                    }</Badge>
                                    {project.status === 'completed' && <Badge className="bg-green-500">완료</Badge>}
                                    {project.status === 'pending' && <Badge variant="secondary">기획 중</Badge>}
                                    {project.status === 'failed' && <Badge variant="destructive">실패</Badge>}
                                    {project.status === 'running' && <Badge className="bg-blue-500">제작 중</Badge>}
                                </div>
                            </div>
                            <CardDescription className="text-xs">
                                {new Date(project.createdAt).toLocaleString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Workflow Progress */}
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground flex justify-between">
                                        <span>진행 단계</span>
                                        <span>{project.status === 'completed' ? '완료' : '편집 중'}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${project.status === 'completed' ? 'bg-green-500 w-full' : 'bg-primary w-1/3'
                                                }`}
                                        />
                                    </div>
                                </div>

                                {project.finalVideoUrl ? (
                                    <div className="aspect-video bg-black rounded-md overflow-hidden relative">
                                        <video src={project.finalVideoUrl} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Play className="text-white w-10 h-10 fill-current" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="aspect-video bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground text-sm border border-dashed group-hover:bg-muted/30 transition-colors">
                                        <ArrowRight className="h-5 w-5 mr-2" />
                                        이어서 작업하기
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {projects.length === 0 && !loading && (
                <div className="py-12 text-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                    <p className="text-lg">아직 생성된 프로젝트가 없습니다.</p>
                    <p className="text-sm">위 입력창에 주제를 입력하고 '시작하기'를 눌러보세요!</p>
                </div>
            )}
        </div>
    );
}

