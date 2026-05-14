'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCw, Sparkles, Loader2, Upload, X, Check, Brain, Activity, ArrowRight, Heart, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRecovery } from '@/contexts/RecoveryContext';
import { useSession } from 'next-auth/react';
import MembershipUpsellDialog from '@/components/auth/MembershipUpsellDialog';
import { useAIProgress } from '@/hooks/use-ai-progress';
import { AIProgressOverlay } from '@/components/shared/AIProgressOverlay';

export interface AnalysisResult {
    subjectName: string;
    type: 'MEAL' | 'HYDRATION' | 'SKIN' | 'SLEEP' | 'ACTIVITY' | 'ROUTINE' | 'BODY' | 'MEDICAL_DOC' | 'OTHER' | 'AUTO';
    summary: string;
    analysisTable: { label: string; value: string; benefit: string; }[];
    futureDirection: string;
    matchScore: number;
}

export default function HeroScanner({ onStart, isDiagnosing = false }: { onStart: (data?: AnalysisResult, image?: string) => void, isDiagnosing?: boolean }) {
    const { journey, setJourney, medicalCategory, setMedicalCategory, treatmentType, setTreatmentType } = useRecovery();
    const [selectionStep, setSelectionStep] = useState<'JOURNEY' | 'CATEGORY' | 'STAGE' | 'TYPE' | 'READY'>('JOURNEY');
    const [isMobile, setIsMobile] = useState(false);
    const [status, setStatus] = useState<'idle' | 'select_type' | 'scanning' | 'result'>('idle');
    const [snapType, setSnapType] = useState<string>('AUTO');
    const [loading, setLoading] = useState(false);
    
    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('60초 리듬체크 시작하기');

    // Sync with AI progress
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isDiagnosing) {
            setProgress(0);
            const startTime = Date.now();
            interval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                let newProgress = 0;
                if (elapsed < 10000) newProgress = (elapsed / 10000) * 80;
                else if (elapsed < 30000) newProgress = 80 + ((elapsed - 10000) / 20000) * 18;
                else newProgress = 98;
                
                setProgress(newProgress);
                if (newProgress < 30) setLoadingText('유니클이 상태를 분석 중입니다...');
                else if (newProgress < 60) setLoadingText('회복 데이터를 수집하고 있습니다...');
                else if (newProgress < 95) setLoadingText('맞춤형 질문을 설계 중입니다...');
                else setLoadingText('거의 다 되었습니다. 마지막 정리 중...');
            }, 100);
        } else {
            if (progress > 0) {
                setProgress(100);
                setTimeout(() => setProgress(0), 500);
            }
            setLoadingText('60초 리듬체크 시작하기');
        }
        return () => clearInterval(interval);
    }, [isDiagnosing]);

    const { progress: scanProgress, statusMessage, finish: finishProgress } = useAIProgress(loading);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [showUpsell, setShowUpsell] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    
    const { data: session } = useSession();
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [showWebcam, setShowWebcam] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const checkMobile = () => {
            const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isSmall = window.innerWidth < 1024;
            setIsMobile(isTouch || isSmall);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (showWebcam && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play().catch(e => console.error("Video play error:", e));
            };
        }
    }, [showWebcam, stream]);

    const startWebcam = async () => {
        if (isMobile) return;
        setShowWebcam(true);
        try {
            const constraints: MediaStreamConstraints = { video: true };
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
        } catch (err: any) {
            setShowWebcam(false);
            toast.info("카메라 연결에 실패하여 파일 업로드로 전환합니다.");
            setTimeout(() => { fileInputRef.current?.click(); }, 300);
        }
    };

    const stopWebcam = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setShowWebcam(false);
    }, [stream]);

    const compressImage = (base64: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1024;
                const MAX_HEIGHT = 1024;
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/webp', 0.8));
            };
        });
    };

    const analyzeImage = async (imageData: string) => {
        setStatus('scanning');
        setLoading(true);
        setHasSaved(false);
        stopWebcam();

        try {
            const compressedData = await compressImage(imageData);
            setCapturedImage(compressedData);
            const response = await fetch('/api/ai/life-snap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: compressedData, journey, snapType })
            });
            if (!response.ok) throw new Error('Analysis failed');
            const data = await response.json();
            if (data.isMismatch) {
                toast.error(data.mismatchReason || "선택하신 카테고리와 맞지 않는 사진입니다.");
                setStatus('idle');
                return;
            }
            finishProgress();
            await new Promise(r => setTimeout(r, 800));
            setResult(data);
            setStatus('result');
            if (session?.user?.email) autoSaveResult(data, compressedData);
        } catch (err: any) {
            toast.error("유니클 분석 중 오류가 발생했습니다.");
            setStatus('idle');
        } finally {
            setLoading(false);
        }
    };

    const autoSaveResult = async (analysisResult: AnalysisResult, imageData: string) => {
        setIsSaving(true);
        try {
            await fetch('/api/scan/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: analysisResult.type || 'OTHER',
                    imageData: imageData,
                    score: analysisResult.matchScore,
                    summary: analysisResult.summary,
                    metrics: { ...analysisResult.analysisTable, futureDirection: analysisResult.futureDirection }
                })
            });
            setHasSaved(true);
        } catch (err) {
            console.error("Auto-save failed:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        if (video.videoWidth === 0) return;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        analyzeImage(canvas.toDataURL('image/webp'));
    };

    const handleMobileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => analyzeImage(event.target?.result as string);
        reader.readAsDataURL(file);
    };

    const renderIdleView = () => (
        <div 
            onClick={() => {
                if (isMobile) fileInputRef.current?.click();
                else startWebcam();
            }}
            className="relative aspect-[16/10] md:aspect-[4/3] rounded-5xl overflow-hidden bg-surface group cursor-pointer border border-primary/10 shadow-2xl shadow-primary/5 transition-all duration-500 hover:shadow-primary/10"
        >
            <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&q=80')] bg-cover bg-center group-hover:scale-110 transition-transform duration-[2000ms]" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/40 to-background/90" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/60 flex items-center justify-center backdrop-blur-xl border border-white/40 group-hover:scale-110 transition-all duration-700 shadow-lg shadow-primary/10">
                    <Camera className="w-6 h-6 md:w-10 md:h-10 text-primary/60" />
                </div>
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 border border-primary/10">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Life Snap</span>
                    </div>
                    <p className="text-foreground font-bold text-xl md:text-3xl leading-snug break-keep px-4">
                        사진 한 장으로 전하는<br />오늘 나의 회복 이야기
                    </p>
                </div>
                <p className="text-foreground/40 text-sm font-medium">화면을 탭하여 시작하세요</p>
            </div>
        </div>
    );

    const renderSelectTypeView = () => (
        <div className="w-full h-full md:relative md:aspect-[4/3] md:rounded-5xl overflow-hidden bg-white group cursor-pointer md:border md:border-primary/10 md:shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-8 border-b border-line bg-mist/30">
                <div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight">어떤 스냅을 기록할까요?</h3>
                    <p className="text-sm font-medium text-foreground/40 mt-1">기록의 성격에 맞춰 카테고리를 선택해주세요.</p>
                </div>
                <button 
                    onClick={() => setStatus('idle')} 
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-foreground/30 hover:text-primary hover:bg-primary/5 transition-all shadow-sm"
                    aria-label="닫기"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="grid grid-cols-1 gap-3">
                    {[
                        { id: 'MEAL', emoji: '🍱', title: '음식 사진', desc: '오늘의 영양과 식사 패턴' },
                        { id: 'HYDRATION', emoji: '💧', title: '물/음료 사진', desc: '수분과 카페인 섭취 기록' },
                        { id: 'SKIN', emoji: '✨', title: '피부 컨디션', desc: '외형적인 회복의 변화' },
                        { id: 'SLEEP', emoji: '🛏️', title: '수면 환경', desc: '충분한 휴식을 위한 준비' },
                        { id: 'ACTIVITY', emoji: '🏃', title: '활동과 움직임', desc: '가벼운 산책이나 운동 기록' },
                        { id: 'ROUTINE', emoji: '💊', title: '자기관리 루틴', desc: '영양제나 관리 제품 기록' },
                        { id: 'BODY', emoji: '🤕', title: '불편한 부위', desc: '피로나 통증이 느껴지는 곳' },
                        { id: 'MEDICAL_DOC', emoji: '📄', title: '처방전/진단서', desc: '의료적인 기록과 안내문' },
                        { id: 'OTHER', emoji: '📸', title: '기타 일상', desc: '회복 과정의 모든 순간' },
                    ].map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setSnapType(cat.id);
                                setStatus('idle');
                                if (isMobile) fileInputRef.current?.click();
                                else startWebcam();
                            }}
                            className="flex items-center text-left gap-5 p-5 rounded-3xl border border-transparent hover:border-primary/10 hover:bg-primary/5 transition-all bg-mist/10"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white flex flex-shrink-0 items-center justify-center text-2xl shadow-sm border border-primary/5">
                                {cat.emoji}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-base font-bold text-foreground">{cat.title}</h4>
                                <p className="text-xs font-medium text-foreground/40 mt-0.5 break-keep">{cat.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderWebcamView = () => (
        <div className="relative aspect-[4/3] rounded-5xl overflow-hidden bg-black border border-primary/10 shadow-2xl">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                <Button onClick={handleCapture} className="w-24 h-24 rounded-full bg-white p-1.5 hover:scale-105 active:scale-95 transition-all shadow-2xl">
                    <div className="w-full h-full rounded-full border-4 border-primary/10 flex items-center justify-center bg-primary/20">
                        <div className="w-14 h-14 rounded-full bg-primary" />
                    </div>
                </Button>
                <Button variant="ghost" onClick={stopWebcam} className="absolute top-8 right-8 text-white/60 hover:text-white bg-white/10 backdrop-blur-md rounded-full w-12 h-12" aria-label="닫기">
                    <X className="w-6 h-6" />
                </Button>
            </div>
        </div>
    );

    const renderResultView = () => {
        if (!result) return null;
        const categoryMap = {
            MEAL: { label: '식단', icon: '🍱' },
            HYDRATION: { label: '수분', icon: '💧' },
            SKIN: { label: '피부', icon: '✨' },
            SLEEP: { label: '수면', icon: '🛏️' },
            ACTIVITY: { label: '활동', icon: '🏃' },
            ROUTINE: { label: '루틴', icon: '💊' },
            BODY: { label: '바디', icon: '🤕' },
            MEDICAL_DOC: { label: '서류', icon: '📄' },
            OTHER: { label: '기타', icon: '📸' },
            AUTO: { label: '분석중', icon: '🧠' }
        };

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <Card className="rounded-5xl border-none shadow-2xl shadow-primary/5 overflow-hidden bg-white">
                    {isDiagnosing && (
                        <div className="absolute top-0 left-0 right-0 h-1.5 z-50 bg-mist">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-primary"
                                transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                            />
                        </div>
                    )}
                    <div className="relative h-72 overflow-hidden">
                        {capturedImage && <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                        <div className="absolute bottom-8 left-10 right-10 flex items-end justify-between">
                            <div className="space-y-2">
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md">
                                    {categoryMap[result.type as keyof typeof categoryMap]?.icon} {categoryMap[result.type as keyof typeof categoryMap]?.label}
                                </Badge>
                                <h4 className="text-3xl font-bold tracking-tight">{result.subjectName}</h4>
                                <div className="text-[11px] font-bold uppercase tracking-widest text-primary/60 flex items-center gap-1.5">
                                    <Activity className="w-3.5 h-3.5" /> Recovery Insights
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold uppercase tracking-widest block mb-1 text-foreground/40">MATCH SCORE</span>
                                <span className="text-5xl font-black tracking-tighter text-primary">{result.matchScore}<span className="text-lg opacity-30">/100</span></span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setStatus('idle')} 
                            className="absolute top-8 right-8 p-3 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full text-foreground/40 hover:text-primary transition-all shadow-sm"
                            aria-label="닫기"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <CardContent className="p-10 space-y-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/30">
                                <Brain className="w-4 h-4" /> AI Personalized Summary
                            </div>
                            <div className="bg-mist/30 p-8 rounded-5xl border border-primary/5 italic text-2xl font-bold leading-tight text-foreground/80">
                                "{result.summary}"
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/30">
                                <Sprout className="w-4 h-4" /> Growth Analysis
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.analysisTable?.map((item, idx) => (
                                    <div key={idx} className="p-6 rounded-4xl bg-white border border-primary/10 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{item.label}</span>
                                            <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary bg-primary/5">
                                                {item.value}
                                            </Badge>
                                        </div>
                                        <p className="text-sm font-medium text-foreground/70 leading-relaxed">{item.benefit}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 rounded-5xl bg-foreground text-white space-y-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[80px] rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
                            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 relative z-10">
                                <Sparkles className="w-4 h-4 text-primary" /> Gentle Recovery Guide
                            </div>
                            <p className="text-base font-medium leading-relaxed relative z-10 text-white/90">
                                {result.futureDirection}
                            </p>
                        </div>

                        <div className="pt-6">
                            <Button 
                                onClick={() => onStart(result || undefined, capturedImage || undefined)}
                                disabled={isDiagnosing}
                                className={`w-full h-20 rounded-full text-xl font-bold shadow-2xl transition-all group relative overflow-hidden ${isDiagnosing ? 'bg-mist' : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'}`}
                            >
                                {isDiagnosing ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span>맞춤 질문 생성 중... {Math.round(progress)}%</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-3">
                                        <Heart className="w-6 h-6 animate-pulse" />
                                        <span>60초 리듬체크 시작하기</span>
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    return (
        <div className="w-full max-w-lg mx-auto">
            <AnimatePresence mode="wait">
                {status === 'idle' && (
                    <motion.div key="idle" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                        {showWebcam ? renderWebcamView() : renderIdleView()}
                    </motion.div>
                )}
                {status === 'select_type' && (
                    <motion.div key="select_type" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed inset-0 z-[100] md:relative md:inset-auto md:z-auto">
                        {renderSelectTypeView()}
                    </motion.div>
                )}
                {status === 'scanning' && (
                    <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative aspect-[4/3] rounded-5xl bg-mist flex flex-col items-center justify-center overflow-hidden">
                        {capturedImage && <img src={capturedImage} alt="Scanning" className="absolute inset-0 w-full h-full object-cover opacity-20" />}
                        <AIProgressOverlay active={loading} progress={scanProgress} message={statusMessage} variant="compact" />
                    </motion.div>
                )}
                {status === 'result' && renderResultView()}
            </AnimatePresence>
            <canvas ref={canvasRef} className="hidden" />
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleMobileCapture} aria-label="이미지 업로드" />
            <MembershipUpsellDialog open={showUpsell} onOpenChange={setShowUpsell} />
        </div>
    );
}
