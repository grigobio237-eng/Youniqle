'use client';

import React, { useState, useRef } from 'react';
import { PRODUCT_CATEGORIES } from '@/constants/categories';
import { toast } from 'sonner';
import {
    Sparkles,
    RefreshCw,
    Download,
    CheckCircle2,
    ChevronRight,
    Image as ImageIcon,
    Layout,
    PencilLine,
    Check,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import html2canvas from 'html2canvas';

// --- Types ---
interface PageSegment {
    id: string;
    title: string;
    logicalSections: string[];
    keyMessage: string;
    visualPrompt: string;
    imageUrl?: string;
    isGenerating?: boolean;
}

interface PavilionProductInfo {
    name: string;
    keywords: string;
    minPrice: string;
    maxPrice: string;
    category: string;
    length: 5 | 7 | 9 | 'auto';
}

const PavilionDetailPlanner = () => {
    // --- State ---
    const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
    const [isGeneratingImages, setIsGeneratingImages] = useState(false);

    // Step 1 State
    const [info, setInfo] = useState<PavilionProductInfo>({
        name: '',
        keywords: '',
        minPrice: '',
        maxPrice: '',
        category: 'stem-cell',
        length: 'auto'
    });

    // Step 2 State (Thumbnail)
    const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);

    // Step 3 & 4 State (Segments/Planning)
    const [segments, setSegments] = useState<PageSegment[]>([]);
    const [generatedSummary, setGeneratedSummary] = useState('');

    // UI Refs
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const detailViewRef = useRef<HTMLDivElement>(null);

    // --- Actions ---

    // Step 1 -> 2: Start Thumbnail Generation
    const handleNextToStep2 = async () => {
        if (!info.name || !info.keywords) {
            toast.error('상품명과 핵심 키워드를 입력해주세요.');
            return;
        }
        setStep(2);
        // 자동 생성 시작
        handleGenerateThumbnail();
    };

    // Step 2: Generate Thumbnail based on Keywords
    const handleGenerateThumbnail = async () => {
        setIsGeneratingThumbnail(true);
        const tid = toast.loading('AI가 브랜드 이미지에 최적화된 썸네일을 생성 중...');
        try {
            const res = await fetch('/api/ai/thumbnail-builder/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: info.name,
                    style: 'premium',
                    category: 'stem-cell',
                    includeModel: true,
                    addText: true,
                    keywords: info.keywords,
                    isStemCellSolution: true,
                    // No reference image for Pavilion Builder
                })
            });
            const data = await res.json();
            if (data.success) {
                setThumbnailImage(data.imageUrl);
                toast.success('품격 있는 썸네일 생성 완료!', { id: tid });
            } else {
                throw new Error(data.error);
            }
        } catch (e) {
            toast.error('썸네일 생성 중 오류가 발생했습니다.', { id: tid });
        } finally {
            setIsGeneratingThumbnail(false);
        }
    };

    // Step 2 -> 3: Planning & Prompts
    const handleNextToStep3 = async () => {
        if (!thumbnailImage) {
            toast.error('썸네일 생성이 완료되어야 합니다.');
            return;
        }
        setLoading(true);
        const tid = toast.loading('무형 상품 특급 레이아웃 기획 중...');
        try {
            const res = await fetch('/api/ai/detail-builder/plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: info.name,
                    category: 'stem-cell',
                    price: info.minPrice, // Use minPrice for planning context
                    keywords: info.keywords,
                    length: info.length, // 분량 옵션 반영
                    isStemCellSolution: true
                })
            });
            const data = await res.json();
            if (data.success) {
                setSegments(data.plan.sections || []);
                setGeneratedSummary(data.plan.summary || '');
                setStep(3);
                toast.success('기획 및 프롬프트 작업 완료!', { id: tid });
            } else {
                throw new Error(data.error);
            }
        } catch (e) {
            toast.error('기획안 생성 실패', { id: tid });
        } finally {
            setLoading(false);
        }
    };

    // Step 3 -> 4: Generate All Detail Images
    const handleGenerateAllImages = async () => {
        setIsGeneratingImages(true);
        setStep(4);
        const tid = toast.loading('상세페이지 이미지들을 순차적으로 생성합니다...');

        try {
            const updatedSegments = [...segments];
            for (let i = 0; i < updatedSegments.length; i++) {
                const seg = updatedSegments[i];
                await handleRegenerateImage(seg.id);
            }
            toast.success('모든 이미지 생성 완료!', { id: tid });
        } catch (e) {
            toast.error('이미지 생성 중 일부 오류가 발생했습니다.');
        } finally {
            setIsGeneratingImages(false);
        }
    };

    const handleRegenerateImage = async (id: string) => {
        setSegments(prev => prev.map(s => s.id === id ? { ...s, isGenerating: true } : s));
        try {
            const seg = segments.find(s => s.id === id);
            if (!seg) return;

            const res = await fetch('/api/ai/detail-builder/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visualPrompt: seg.visualPrompt,
                    keyMessage: seg.keyMessage,
                    aspectRatio: "9:16",
                    sectionId: id,
                    isStemCellSolution: true
                })
            });
            const data = await res.json();
            if (data.success) {
                setSegments(prev => prev.map(s => s.id === id ? { ...s, imageUrl: data.imageUrl, isGenerating: false } : s));
            }
        } catch (e) {
            console.error(e);
            setSegments(prev => prev.map(s => s.id === id ? { ...s, isGenerating: false } : s));
        }
    };

    // 이미지 전체 다운로드 (Blob 방식 - CORS 해결)
    const handleDownloadAll = async () => {
        const tid = toast.loading('이미지를 준비 중입니다...');
        try {
            const downloadImage = async (url: string, filename: string) => {
                const response = await fetch(url);
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            };

            if (thumbnailImage) {
                await downloadImage(thumbnailImage, `${info.name}_썸네일.png`);
            }

            for (let i = 0; i < segments.length; i++) {
                const seg = segments[i];
                if (seg.imageUrl) {
                    await downloadImage(seg.imageUrl, `${info.name}_상세_${i + 1}.png`);
                }
            }
            toast.success('이미지 다운로드가 완료되었습니다.', { id: tid });
        } catch (error) {
            console.error('Download error:', error);
            toast.error('이미지 다운로드 중 오류가 발생했습니다.', { id: tid });
        }
    };

    // Step 4 -> 5: Inspection
    const handleNextToStep5 = () => {
        setStep(5);
    };

    // 베이스64 이미지를 파일 객체로 변환
    const base64ToFile = async (base64: string, filename: string): Promise<File> => {
        const res = await fetch(base64);
        const blob = await res.blob();
        return new File([blob], filename, { type: 'image/png' });
    };

    // Step 5: Final Submission/Post
    const handleFinalPost = async () => {
        if (!thumbnailImage) return toast.error('썸네일이 필요합니다.');
        setIsRegistering(true);
        const tid = toast.loading('파빌리온 5층 라운지에 솔루션을 게시하는 중...');

        try {
            const safeBaseName = `pavilion5_${Math.random().toString(36).substring(2, 8)}`;
            const imageUrls: string[] = [];

            // 1. 썸네일 업로드
            const thumbFile = await base64ToFile(thumbnailImage, `${safeBaseName}_thumb.png`);
            const thumbFormData = new FormData();
            thumbFormData.append('file', thumbFile);
            thumbFormData.append('folder', 'products/pavilion');
            const thumbRes = await fetch('/api/upload', { method: 'POST', body: thumbFormData });
            const thumbData = await thumbRes.json();
            if (thumbData.success) imageUrls.push(thumbData.url);

            // 2. 상세 이미지 업로드
            for (let i = 0; i < segments.length; i++) {
                if (segments[i].imageUrl) {
                    const file = await base64ToFile(segments[i].imageUrl!, `${safeBaseName}_detail_${i + 1}.png`);
                    const fd = new FormData();
                    fd.append('file', file);
                    fd.append('folder', 'products/pavilion-details');
                    const res = await fetch('/api/upload', { method: 'POST', body: fd });
                    const data = await res.json();
                    if (data.success) imageUrls.push(data.url);
                }
            }

            // 3. HTML 구성
            const descriptionHtml = imageUrls.slice(1).map((url, idx) => {
                const separator = url.includes('?') ? '&' : '?';
                return `<img src="${url}${separator}v=1" alt="detail_${idx}" style="max-width:100%; display:block; margin:0 auto;" />`;
            }).join('');

            const minVal = parseInt(info.minPrice.replace(/[^0-9]/g, '')) || 0;
            const maxVal = parseInt(info.maxPrice.replace(/[^0-9]/g, '')) || 0;

            // 4. API 쏘기
            const productData = {
                name: info.name,
                slug: info.name.toLowerCase().replace(/[^a-z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/g, '-').replace(/-+/g, '-') + '-' + Math.random().toString(36).substring(2, 7),
                price: minVal, // Sorting base
                minPrice: minVal,
                maxPrice: maxVal,
                category: 'stem-cell',
                summary: generatedSummary || info.keywords.slice(0, 100),
                description: descriptionHtml,
                descriptionIsHtml: true,
                images: imageUrls.map(url => ({ url })),
                stock: 999,
                status: 'active',
                approvalStatus: 'approved',
                pavilionFloorId: 'floor-5' // 5층 라운지 강제 지정
            };

            const regRes = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            if (regRes.ok) {
                toast.success('축하합니다! 줄기세포 솔루션이 활성화되었습니다.', { id: tid });
                setStep(1); // Reset
                setInfo({ name: '', keywords: '', minPrice: '', maxPrice: '', category: 'stem-cell', length: 'auto' });
                setThumbnailImage(null);
                setSegments([]);
            } else {
                const errData = await regRes.json();
                throw new Error(errData.error || '등록 중 서버 오류 발생');
            }
        } catch (e) {
            toast.error('등록 실패: ' + (e as Error).message, { id: tid });
        } finally {
            setIsRegistering(false);
        }
    };

    // --- Renders ---

    return (
        <div className="max-w-4xl mx-auto px-4 pb-20">
            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-12 bg-white/50 backdrop-blur-md p-6 rounded-[32px] border border-slate-100 shadow-sm sticky top-0 z-40">
                {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="flex items-center group">
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300
                            ${step === s ? 'bg-purple-600 text-white shadow-xl scale-110 ring-4 ring-purple-100' :
                                step > s ? 'bg-purple-100 text-purple-600' : 'bg-slate-50 text-slate-300 border border-slate-100'}
                        `}>
                            {step > s ? <Check size={18} /> : s}
                        </div>
                        {s < 5 && (
                            <div className={`w-8 md:w-16 h-1 mx-2 rounded-full transition-colors ${step > s ? 'bg-purple-200' : 'bg-slate-100'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Info */}
            {step === 1 && (
                <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-white animate-in slide-in-from-bottom-8 duration-500">
                    <CardContent className="p-8 md:p-12 space-y-8">
                        <div className="space-y-2">
                            <Badge className="bg-purple-50 text-purple-600 border-none px-3">Essential Information</Badge>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">기본 솔루션 정보 설정</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-500 uppercase tracking-widest pl-1">상품(솔루션) 이름</label>
                                    <Input
                                        value={info.name}
                                        onChange={e => setInfo({ ...info, name: e.target.value })}
                                        className="h-14 rounded-2xl border-slate-100 focus:border-purple-300 focus:ring-purple-100 text-lg font-bold"
                                        placeholder="예: 스킨부스터 리버스 에이징"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-500 uppercase tracking-widest pl-1">판매 가격 범위 설정</label>
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <Input
                                                type="text"
                                                value={info.minPrice}
                                                onChange={e => setInfo({ ...info, minPrice: e.target.value.replace(/[^0-9]/g, '') })}
                                                className="h-14 rounded-2xl border-slate-100 focus:border-purple-300 focus:ring-purple-100 font-bold pr-10"
                                                placeholder="최소 가격"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">원</span>
                                        </div>
                                        <span className="text-slate-300 font-black">~</span>
                                        <div className="relative flex-1">
                                            <Input
                                                type="text"
                                                value={info.maxPrice}
                                                onChange={e => setInfo({ ...info, maxPrice: e.target.value.replace(/[^0-9]/g, '') })}
                                                className="h-14 rounded-2xl border-slate-100 focus:border-purple-300 focus:ring-purple-100 font-bold pr-10"
                                                placeholder="최대 가격"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">원</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium pl-1">유저의 컨디션에 따라 유동적으로 제안될 가격의 범위를 설정합니다.</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-500 uppercase tracking-widest pl-1">핵심 회복 키워드</label>
                                <Textarea
                                    value={info.keywords}
                                    onChange={e => setInfo({ ...info, keywords: e.target.value })}
                                    className="h-[148px] rounded-2xl border-slate-100 focus:border-purple-300 focus:ring-purple-100 font-medium resize-none leading-relaxed"
                                    placeholder="무형의 상품이 돕는 실제 효과와 핵심 가치를 서술해주세요. AI가 이를 바탕으로 기획안을 작성합니다."
                                />
                            </div>
                        </div>

                        {/* Page Length Selection */}
                        <div className="space-y-4 pt-4 border-t border-slate-50">
                            <label className="text-sm font-black text-slate-500 uppercase tracking-widest pl-1">상세페이지 이미지 수량 (분량 설정)</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { val: 'auto', label: 'AI 추천' },
                                    { val: 5, label: '5장 (숏)' },
                                    { val: 7, label: '7장 (표준)' },
                                    { val: 9, label: '9장 (롱)' },
                                ].map((item) => (
                                    <button
                                        key={item.val}
                                        onClick={() => setInfo({ ...info, length: item.val as any })}
                                        className={`
                                            h-16 rounded-2xl text-sm font-black transition-all border-2
                                            ${info.length === item.val
                                                ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-lg shadow-purple-100'
                                                : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                                            }
                                        `}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium pl-1">솔루션의 복잡도와 정보량에 따라 적절한 분량을 선택하세요.</p>
                        </div>

                        <Button
                            onClick={handleNextToStep2}
                            className="w-full h-20 rounded-[32px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xl font-black transition-all group shadow-2xl shadow-purple-200/50 transform hover:-translate-y-1"
                        >
                            <span>다음 단계로 이동</span>
                            <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Thumbnail */}
            {step === 2 && (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="text-center space-y-3">
                        <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic">AI Brand Identity</h2>
                        <p className="text-slate-500 font-medium">키워드를 분석하여 솔루션에 가장 어울리는 프리미엄 썸네일을 생성합니다.</p>
                    </div>

                    <div className="max-w-xl mx-auto aspect-square bg-slate-50 rounded-[48px] border-4 border-white shadow-inner flex items-center justify-center overflow-hidden relative group">
                        {thumbnailImage ? (
                            <img src={thumbnailImage} className="w-full h-full object-cover" alt="Generated Thumbnail" />
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                                <span className="font-black text-purple-600 animate-pulse tracking-widest uppercase text-xs">Generating Masterpiece...</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 justify-center">
                        <Button
                            variant="outline"
                            disabled={isGeneratingThumbnail}
                            onClick={() => setStep(1)}
                            className="h-16 px-8 rounded-2xl font-bold border-slate-200 hover:bg-slate-50 gap-2"
                        >
                            <ArrowLeft size={18} />
                            이전으로
                        </Button>
                        <Button
                            variant="outline"
                            disabled={isGeneratingThumbnail}
                            onClick={handleGenerateThumbnail}
                            className="h-16 px-8 rounded-2xl font-bold border-slate-200 hover:bg-slate-50 gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${isGeneratingThumbnail ? 'animate-spin' : ''}`} />
                            다시 생성하기
                        </Button>
                        <Button
                            disabled={!thumbnailImage || isGeneratingThumbnail}
                            onClick={handleNextToStep3}
                            className="h-16 px-12 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-lg shadow-xl shadow-purple-200/40 transition-all hover:-translate-y-0.5"
                        >
                            기획안 확인하기
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Planning */}
            {step === 3 && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-2">
                            <Badge className="bg-slate-800 text-white rounded-full">Step 3. Planning & Prompts</Badge>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">상세페이지 이미지 기획안</h2>
                        </div>
                        <p className="text-sm font-bold text-slate-400">무형 상품의 가치를 시각화하는 AI 프롬프트가 준비되었습니다.</p>
                    </div>

                    {/* Summary Preview/Edit */}
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-purple-50/50 border border-purple-100 mb-6">
                        <CardContent className="p-6 space-y-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                <label className="text-xs font-black text-purple-600 uppercase tracking-widest pl-1">AI 썸네일 요약 문구</label>
                            </div>
                            <Textarea
                                value={generatedSummary}
                                onChange={e => setGeneratedSummary(e.target.value)}
                                className="min-h-[80px] rounded-2xl border-purple-100 focus:border-purple-300 focus:ring-purple-100 font-bold text-slate-700 bg-white"
                                placeholder="썸네일 카드에 노출될 짧고 매력적인 요약 문구입니다."
                            />
                            <p className="text-[10px] text-slate-400 font-medium pl-1">상세페이지의 매력을 한두 문장으로 압축하여 썸네일 카드에 노출합니다.</p>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6">
                        {segments.map((seg, idx) => (
                            <Card key={seg.id} className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow bg-white">
                                <CardContent className="p-0">
                                    <div className="flex items-stretch flex-col md:flex-row">
                                        <div className="w-full md:w-16 bg-slate-50 flex items-center justify-center border-r border-slate-100">
                                            <span className="font-black text-slate-300 rotate-0 md:-rotate-90">PAGE {idx + 1}</span>
                                        </div>
                                        <div className="flex-1 p-6 space-y-6">
                                            <div className="flex flex-wrap gap-2">
                                                {seg.logicalSections.map(tag => (
                                                    <Badge key={tag} className="bg-blue-50 text-blue-600 border-none font-bold uppercase text-[10px]">{tag}</Badge>
                                                ))}
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Key Message</label>
                                                    <p className="text-lg font-black text-slate-800 leading-tight">{seg.keyMessage}</p>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Visual Prompt</label>
                                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{seg.visualPrompt}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => setStep(2)}
                            className="w-48 h-24 rounded-[32px] border-2 border-slate-100 font-bold text-slate-500 hover:bg-slate-50"
                        >
                            <ArrowLeft className="mr-2" size={18} />
                            이전으로
                        </Button>
                        <Button
                            onClick={handleGenerateAllImages}
                            className="flex-1 h-24 rounded-[32px] bg-gradient-to-r from-purple-600 via-indigo-700 to-slate-900 hover:scale-[1.02] transition-all font-black text-2xl shadow-2xl shadow-purple-200 group"
                        >
                            <span>✨ 프롬프트 반영 이미지 생성 시작</span>
                            <Zap className="ml-3 group-hover:animate-bounce" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 4: Generation */}
            {step === 4 && (
                <div className="space-y-12 animate-in fade-in duration-500">
                    <div className="text-center space-y-2">
                        <h2 className="text-4xl font-black text-slate-800 italic">Creating Visual Stories</h2>
                        <div className="flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                            <p className="text-slate-500 font-medium">기획된 고해상도 상세 이미지를 순차적으로 고해상도 생성 중입니다.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {segments.map((seg, idx) => (
                            <div key={seg.id} className="aspect-[9/16] bg-slate-50 rounded-[32px] overflow-hidden border border-slate-100 relative group">
                                {seg.imageUrl ? (
                                    <img src={seg.imageUrl} className="w-full h-full object-cover" alt={`Section ${idx + 1}`} />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
                                        <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Section {idx + 1}</p>
                                            <p className="text-[10px] text-slate-300 font-medium px-4">{seg.title}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center gap-6 pt-8">
                        <Button
                            variant="outline"
                            onClick={() => setStep(2)}
                            className="h-20 px-12 rounded-[28px] border-2 border-slate-100 font-bold text-slate-500 hover:bg-slate-50"
                        >
                            <ArrowLeft className="mr-2" size={18} />
                            이전 단계로
                        </Button>
                        <Button
                            disabled={segments.some(s => !s.imageUrl) || isGeneratingImages}
                            onClick={handleNextToStep5}
                            className="h-20 px-16 rounded-[28px] bg-gradient-to-r from-slate-800 to-slate-900 text-white border-none shadow-2xl font-black text-xl hover:from-purple-600 hover:to-indigo-600 transition-all transform hover:-translate-y-1"
                        >
                            전체 결과물 검수하기
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 5: Inspection & Post */}
            {step === 5 && (
                <div className="space-y-12 animate-in zoom-in-95 duration-500">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">최종 솔루션 검수</h2>
                            <p className="text-slate-500 font-medium whitespace-pre-line">파빌리온 5층 라운지에 등록되기 전 마지막 단계입니다.
                                게판 버튼 클릭 시 즉시 활성화됩니다.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleDownloadAll}
                                className="h-14 rounded-2xl gap-2 font-bold no-print border-2 border-slate-100"
                            >
                                <Download size={18} />
                                이미지 전체 다운로드
                            </Button>
                            <Button
                                onClick={() => setStep(4)}
                                variant="secondary"
                                className="h-14 px-6 rounded-2xl font-bold no-print bg-slate-100 hover:bg-slate-200"
                            >
                                <ArrowLeft size={18} />
                                이전
                            </Button>
                            <Button
                                onClick={handleFinalPost}
                                disabled={isRegistering}
                                className="h-14 px-10 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black gap-2 shadow-xl shadow-purple-200/50 no-print transition-all hover:scale-105"
                            >
                                {isRegistering ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />}
                                5층 라운지 즉시 게시
                            </Button>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="grid md:grid-cols-12 gap-8">
                        {/* Thumbnail Preview */}
                        <div className="md:col-span-4 space-y-4">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block pl-2">Representative Thumbnail</label>
                            <div className="aspect-square rounded-[40px] overflow-hidden border-8 border-white shadow-2xl bg-slate-100 mb-4">
                                {thumbnailImage && <img src={thumbnailImage} className="w-full h-full object-cover" alt="Final Thumbnail" />}
                            </div>

                            {/* Price range preview card */}
                            <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Exhibition Price Range</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-black text-slate-800">₩{Number(info.minPrice).toLocaleString()}</span>
                                    <span className="text-slate-300 font-bold">~</span>
                                    <span className="text-xl font-black text-slate-800">₩{Number(info.maxPrice).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Detail Page Preview */}
                        <div className="md:col-span-8 space-y-4">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block pl-2">Detail Page Contents</label>
                            <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-2xl shadow-slate-100 flex flex-col gap-0 overflow-hidden">
                                {segments.map((seg, i) => (
                                    <div key={seg.id} className="w-full aspect-[9/16] bg-slate-50">
                                        {seg.imageUrl && <img src={seg.imageUrl} className="w-full h-full object-cover" alt={`Final Page ${i + 1}`} />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PavilionDetailPlanner;
