
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import StepTrend from './components/StepTrend';
import StepScript from './components/StepScript';
import StepImage from './components/StepImage';
import StepAudio from './components/StepAudio';
import StepVideo from './components/StepVideo';
import StepSynthesis from './components/StepSynthesis';
import Image from 'next/image';

interface VideoProject {
    _id: string;
    topic: string;
    projectType: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
    workflow?: {
        stepStatus?: Record<string, string>;
        currentStep?: string;
    };
}

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params?.id as string;

    const [project, setProject] = useState<VideoProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('trend');

    useEffect(() => {
        if (projectId) {
            fetchProject();
        }
    }, [projectId]);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/admin/video/${projectId}`);
            const data = await res.json();
            if (data.project) {
                setProject(data.project);
                // Initial load or if server step is ahead/different, but don't jump back if user is interacting
                const serverStep = data.project?.workflow?.currentStep;
                if (serverStep && (activeTab === 'trend' || activeTab === 'product_asset')) {
                    if (serverStep !== activeTab) {
                        setActiveTab(serverStep);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch project', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStep = async (stepId: string) => {
        try {
            await fetch(`/api/admin/video/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workflow: { currentStep: stepId }
                }),
            });
        } catch (e) {
            console.error('Failed to sync step', e);
        }
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        updateStep(value);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin w-8 h-8" /></div>;
    }

    if (!project) {
        return <div>Project not found</div>;
    }

    // 템플릿 기반 단계 구성 - 서버에서 내려온 정보 활용
    const workflowTemplate = project.workflow?.template || {
        steps: [
            { id: 'trend', title: '기획 (Trend)' },
            { id: 'script', title: '대본 (Script)' },
            { id: 'audio', title: '오디오 (Audio)' },
            { id: 'image', title: '이미지 (Image)' },
            { id: 'video', label: '영상 (Video)' },
            { id: 'synthesis', label: '완성 (Final)' }
        ]
    };

    // [중요] 기존 프로젝트들이 DB에 예전 순서(image -> audio)로 저장되어 있을 수 있으므로 UI에서 강제 정렬
    const orderedSteps = [...(workflowTemplate.steps || [])];
    const imageIdx = orderedSteps.findIndex(s => s.id === 'image');
    const audioIdx = orderedSteps.findIndex(s => s.id === 'audio');

    if (imageIdx !== -1 && audioIdx !== -1 && imageIdx < audioIdx) {
        // 이미지가 오디오보다 앞에 있으면 위치를 바꿈
        const temp = orderedSteps[imageIdx];
        orderedSteps[imageIdx] = orderedSteps[audioIdx];
        orderedSteps[audioIdx] = temp;
    }

    const steps = orderedSteps.map((s: any, idx: number) => ({
        id: s.id,
        label: `${idx + 1}. ${s.title || s.label}`
    }));

    const isProductPromo = project.projectType === 'product_promo';

    const getStepStatus = (stepId: string) => {
        return project.workflow?.stepStatus?.[stepId] || 'idle';
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/admin/auto-video')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {project.topic}
                        <Badge variant={project.status === 'completed' ? 'default' : 'outline'}>
                            {project.status === 'completed' ? '완료됨' : '제작 중'}
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        프로젝트 ID: {projectId} | 생성일: {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Stepper / Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList
                    className="grid w-full h-auto p-2 bg-muted/20"
                    style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
                >
                    {steps.map((step) => {
                        const status = getStepStatus(step.id);
                        const isCompleted = status === 'completed' || (isProductPromo && (step.id === 'product_asset' || step.id === 'model_asset'));
                        return (
                            <TabsTrigger
                                key={step.id}
                                value={step.id}
                                className="flex flex-col gap-1 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <div className="flex items-center gap-2">
                                    {isCompleted ? (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Circle className={`w-4 h-4 ${activeTab === step.id ? 'text-primary fill-primary/20' : 'text-muted-foreground'}`} />
                                    )}
                                    <span className="font-semibold">{step.label.includes('.') ? step.label.split('.')[1] : step.label}</span>
                                </div>
                                <span className="text-xs text-muted-foreground hidden lg:inline">
                                    {isCompleted ? '완료' : '대기'}
                                </span>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                <div className="mt-6">
                    {/* 상품 에셋 보기 (Product Promo 전용) */}
                    <TabsContent value="product_asset">
                        <Card>
                            <CardContent className="pt-6 flex flex-col items-center gap-4">
                                <h3 className="text-lg font-bold">1. 업로드된 상품 에셋</h3>
                                <div className="max-w-md w-full aspect-square rounded-xl overflow-hidden border-2 shadow-sm">
                                    <Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized src={project.workflow?.data?.assets?.find((a: any) => a.role === 'product')?.path} alt="Product" className="w-full h-full object-cover" />
                                </div>
                                <Button onClick={() => handleTabChange('model_asset')}>다음 (모델 에셋)</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="model_asset">
                        <Card>
                            <CardContent className="pt-6 flex flex-col items-center gap-4">
                                <h3 className="text-lg font-bold">2. 업로드된 모델 에셋</h3>
                                <div className="max-w-md w-full aspect-square rounded-xl overflow-hidden border-2 shadow-sm">
                                    <Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized src={project.workflow?.data?.assets?.find((a: any) => a.role === 'model')?.path} alt="Model" className="w-full h-full object-cover" />
                                </div>
                                <Button onClick={() => handleTabChange('trend')}>다음 (기획 분석)</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="trend">
                        <StepTrend project={project} onUpdate={fetchProject} onNext={() => setActiveTab('script')} />
                    </TabsContent>
                    <TabsContent value="script">
                        <StepScript project={project} onUpdate={fetchProject} onNext={() => setActiveTab('audio')} />
                    </TabsContent>
                    <TabsContent value="audio">
                        <StepAudio project={project} onUpdate={fetchProject} onNext={() => setActiveTab('image')} />
                    </TabsContent>
                    <TabsContent value="image">
                        <StepImage project={project} onUpdate={fetchProject} onNext={() => setActiveTab('video')} />
                    </TabsContent>
                    <TabsContent value="video">
                        <StepVideo project={project} onUpdate={fetchProject} onNext={() => setActiveTab('synthesis')} />
                    </TabsContent>
                    <TabsContent value="synthesis">
                        <StepSynthesis project={project} onUpdate={fetchProject} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
