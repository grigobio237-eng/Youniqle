'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCw, Sparkles, Loader2, Upload, X, Check, Brain, Activity, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRecovery } from '@/contexts/RecoveryContext';
import { useSession } from 'next-auth/react';
import MembershipUpsellDialog from '@/components/auth/MembershipUpsellDialog';
import { Save } from 'lucide-react';
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
    
    // PC Webcam States
    const { data: session } = useSession();
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [showWebcam, setShowWebcam] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Device Detection
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

    // 2. PC Webcam Logic
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
        setShowWebcam(true); // 권한 요청 전 즉시 활성화하여 화면 깜빡임 방지
        try {
            const constraints: MediaStreamConstraints = {
                video: true 
            };
            
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
        } catch (err: any) {
            setShowWebcam(false);
            console.error("Webcam Error:", err);
            toast.info("카메라 연결에 실패하여 파일 업로드로 전환합니다.");
            setTimeout(() => {
                fileInputRef.current?.click();
            }, 300);
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
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/webp', 0.8));
            };
        });
    };

    // 3. Analysis Logic
    const analyzeImage = async (imageData: string) => {
        setStatus('scanning');
        setLoading(true);
        setHasSaved(false); // Reset save state for new scan
        stopWebcam();

        try {
            const compressedData = await compressImage(imageData);
            setCapturedImage(compressedData);

            const response = await fetch('/api/ai/life-snap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: compressedData, journey, snapType })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Analysis failed');
            }

            const data = await response.json();

            if (data.isMismatch) {
                toast.error(data.mismatchReason || "선택하신 카테고리와 맞지 않는 사진입니다. 정확한 사진을 다시 올려주세요.");
                setStatus('idle');
                return;
            }

            finishProgress();
            await new Promise(r => setTimeout(r, 800));

            setResult(data);
            setStatus('result');

            // 로그인한 경우 타임라인에 자동 저장 (WebP)
            if (session?.user?.email) {
                autoSaveResult(data, compressedData);
            }
        } catch (err: any) {
            console.error('Analysis Error:', err);
            toast.error(err.message || "유니클 분석 중 오류가 발생했습니다.");
            setStatus('idle');
        } finally {
            setLoading(false);
        }
    };

    const autoSaveResult = async (analysisResult: AnalysisResult, imageData: string) => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/scan/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: analysisResult.type || 'OTHER',
                    imageData: imageData,
                    score: analysisResult.matchScore,
                    summary: analysisResult.summary,
                    metrics: {
                        ...analysisResult.analysisTable,
                        futureDirection: analysisResult.futureDirection
                    }
                })
            });

            if (response.ok) {
                const resData = await response.json();
                setHasSaved(true);
                toast.success('분석 결과가 타임라인에 자동으로 기록되었습니다.');

                // 게이미피케이션 보상 알림
                const gf = resData.data?.gamification;
                if (gf && gf.rewardPoints > 0) {
                    setTimeout(() => {
                        toast.success(gf.gamificationMessage, {
                            style: { background: '#D4AF37', color: '#1A1A1A', fontWeight: 'bold' }
                        });
                    }, 500); // 이전 토스트와 겹치지 않게 딜레이
                }
            }
        } catch (err) {
            console.error("Auto-save failed:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveToTimeline = async () => {
        if (!session) {
            toast.error("로그인이 필요한 기능입니다.");
            return;
        }

        if (hasSaved) {
            toast.info("이미 저장된 결과입니다.");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch('/api/scan/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: result?.type || 'OTHER',
                    imageData: capturedImage,
                    score: result?.matchScore,
                    summary: result?.summary,
                    metrics: {
                        ...result?.analysisTable,
                        futureDirection: result?.futureDirection
                    }
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || '저장에 실패했습니다.');
            }
            
            const resData = await response.json();
            setHasSaved(true);
            toast.success('스캔 타임라인에 기록되었습니다.');

            // 게이미피케이션 보상 알림
            const gf = resData.data?.gamification;
            if (gf && gf.rewardPoints > 0) {
                setTimeout(() => {
                    toast.success(gf.gamificationMessage, {
                        style: { background: '#D4AF37', color: '#1A1A1A', fontWeight: 'bold' }
                    });
                }, 500);
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            toast.error("카메라 영상이 아직 준비되지 않았습니다. 잠시만 기다려주세요.");
            return;
        }

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
            className="relative aspect-[4/3] rounded-[40px] overflow-hidden bg-obsidian group cursor-pointer border-4 border-white/5 shadow-2xl"
        >
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&q=80')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-obsidian/80" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-xl border border-white/10 group-hover:scale-110 transition-all duration-500">
                    <Camera className="w-8 h-8 text-white/50" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xs font-black text-chapter-accent tracking-widest uppercase bg-chapter-accent/10 px-3 py-1 rounded-full inline-block">Life Snap</h3>
                    <p className="text-white font-black text-2xl md:text-3xl leading-snug break-keep px-4">
                        사진 한 장으로<br />오늘의 회복 상태를<br />기록하세요
                    </p>
                </div>
            </div>

            <Sparkles className="absolute top-8 right-8 w-6 h-6 text-chapter-accent animate-pulse" />
        </div>
    );

    const renderSelectTypeView = () => (
        <div className="w-full h-full md:relative md:aspect-[4/3] md:rounded-[40px] overflow-hidden bg-white group cursor-pointer md:border md:border-line md:shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-line bg-mist">
                <div>
                    <h3 className="text-lg font-black text-obsidian tracking-tight">어떤 스냅을 기록할까요?</h3>
                    <p className="text-xs font-bold text-slate/60">당신의 일상을 카테고리에 맞게 선택해주세요.</p>
                </div>
                <button 
                    onClick={() => setStatus('idle')} 
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate/50 hover:text-obsidian hover:bg-line transition-colors"
                    aria-label="닫기"
                    title="닫기"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-1 gap-2">
                    {[
                        { id: 'MEAL', emoji: '🍱', title: '음식 사진', desc: '식사 패턴 기록' },
                        { id: 'HYDRATION', emoji: '💧', title: '물/음료 사진', desc: '수분·카페인·음주 습관 기록' },
                        { id: 'SKIN', emoji: '✨', title: '얼굴/피부 사진', desc: '외형 컨디션 변화 기록' },
                        { id: 'SLEEP', emoji: '🛏️', title: '침실/수면환경 사진', desc: '수면 루틴 기록' },
                        { id: 'ACTIVITY', emoji: '🏃', title: '운동/산책 사진', desc: '활동량 기록' },
                        { id: 'ROUTINE', emoji: '💊', title: '영양제/관리제품 사진', desc: '자기관리 루틴 기록' },
                        { id: 'BODY', emoji: '🤕', title: '몸 상태 메모 사진', desc: '피로·붓기·통증 느낌 기록' },
                        { id: 'MEDICAL_DOC', emoji: '📄', title: '병원 서류 사진', desc: '얼굴, 민감 정보는 가리고 등록해주세요' },
                        { id: 'OTHER', emoji: '📸', title: '기타 사진', desc: '기타 일상 기록' },
                    ].map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                if (cat.id === 'MEDICAL_DOC') {
                                    toast.warning("얼굴이나 민감한 정보가 포함된 경우, 원하지 않는 부분은 가리고 등록해주세요.", { duration: 6000 });
                                }
                                setSnapType(cat.id);
                                setStatus('idle');
                                if (isMobile) fileInputRef.current?.click();
                                else startWebcam();
                            }}
                            className="flex items-center text-left gap-4 p-4 rounded-2xl border border-transparent hover:border-chapter-accent/20 hover:bg-chapter-accent/5 transition-all bg-mist/30"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white flex flex-shrink-0 items-center justify-center text-2xl shadow-sm">
                                {cat.emoji}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black text-obsidian">{cat.title}</h4>
                                <p className="text-[11px] font-bold text-slate/60 mt-0.5 break-keep">{cat.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderWebcamView = () => (
        <div className="relative aspect-[4/3] rounded-[40px] overflow-hidden bg-black border-4 border-white/10 shadow-2xl">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 bg-gradient-to-t from-black/60 to-transparent">
                <Button size="lg" onClick={handleCapture} title="사진 촬영" aria-label="사진 촬영" className="w-20 h-20 rounded-full bg-white p-1 hover:scale-105 active:scale-95 transition-all">
                    <div className="w-full h-full rounded-full border-4 border-obsidian flex items-center justify-center bg-chapter-accent/20">
                        <div className="w-12 h-12 rounded-full bg-chapter-accent" />
                    </div>
                </Button>
                <Button variant="ghost" onClick={stopWebcam} className="absolute top-6 right-6 text-white/60 hover:text-white" aria-label="카메라 끄기" title="카메라 끄기">
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

        // CLINICAL_PRE requires a medical category to start
        const canStartDiagnosis = journey === 'WELLNESS' || (journey && medicalCategory && treatmentType);

        const renderJourneySelector = () => (
            <div className="space-y-4 pt-4 border-t border-line">
                <p className="text-[10px] font-black text-slate/50 uppercase tracking-widest text-center mb-6 px-10">당신의 현재 회복 상황을 선택해주세요</p>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => { setJourney('WELLNESS'); setSelectionStep('READY'); }}
                        className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 ${journey === 'WELLNESS' ? 'border-chapter-accent bg-chapter-accent/5' : 'border-line bg-white hover:border-chapter-accent/20'}`}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-mist flex items-center justify-center text-2xl">🌿</div>
                        <div className="text-center">
                            <p className="text-sm font-black text-obsidian">웰니스</p>
                            <p className="text-[9px] font-bold text-slate/50 mt-1">일상 회복</p>
                        </div>
                    </button>
                    <button 
                        onClick={() => { setSelectionStep('CATEGORY'); }}
                        className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 ${journey?.startsWith('CLINICAL') ? 'border-chapter-accent bg-chapter-accent/5' : 'border-line bg-white hover:border-chapter-accent/20'}`}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-mist flex items-center justify-center text-2xl">🏥</div>
                        <div className="text-center">
                            <p className="text-sm font-black text-obsidian">클리닉</p>
                            <p className="text-[9px] font-bold text-slate/50 mt-1">병원/시술/수술</p>
                        </div>
                    </button>
                </div>
            </div>
        );

        const renderCategorySelector = () => (
            <div className="space-y-4 pt-4 border-t border-line animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black text-slate/50 uppercase tracking-widest px-2">상담/진료 분야를 선택하세요</p>
                    <button onClick={() => setSelectionStep('JOURNEY')} className="text-[10px] font-black text-chapter-accent hover:underline">이전으로</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'PLASTIC', label: '성형/피부', emoji: '✨' },
                        { id: 'ORTHOPEDIC', label: '정형/재활', emoji: '🦴' },
                        { id: 'INTERNAL', label: '내과/건강검진', emoji: '🩺' },
                        { id: 'GENERAL', label: '일반/외과', emoji: '🏥' }
                    ].map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => { setMedicalCategory(cat.id as any); setSelectionStep('STAGE'); }}
                            className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${medicalCategory === cat.id ? 'border-chapter-accent bg-chapter-accent/5' : 'border-line bg-white'}`}
                        >
                            <span className="text-xl">{cat.emoji}</span>
                            <span className="text-xs font-black text-obsidian">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        );

        const renderStageSelector = () => (
            <div className="space-y-4 pt-4 border-t border-line animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black text-slate/50 uppercase tracking-widest px-2">시기 선택 (전/후)</p>
                    <button onClick={() => setSelectionStep('CATEGORY')} className="text-[10px] font-black text-chapter-accent hover:underline">이전으로</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => { setJourney('CLINICAL_PRE'); setSelectionStep('TYPE'); }}
                        className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 ${journey === 'CLINICAL_PRE' ? 'border-chapter-accent bg-chapter-accent/5' : 'border-line bg-white'}`}
                    >
                        <div className="text-2xl">⏳</div>
                        <p className="text-sm font-black text-obsidian">시술/수술 전</p>
                    </button>
                    <button 
                        onClick={() => { setJourney('CLINICAL_POST'); setSelectionStep('TYPE'); }}
                        className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 ${journey === 'CLINICAL_POST' ? 'border-chapter-accent bg-chapter-accent/5' : 'border-line bg-white'}`}
                    >
                        <div className="text-2xl">🚀</div>
                        <p className="text-sm font-black text-obsidian">시술/수술 후</p>
                    </button>
                </div>
            </div>
        );

        const renderTypeSelector = () => (
            <div className="space-y-4 pt-4 border-t border-line animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black text-slate/50 uppercase tracking-widest px-2">시술 vs 수술 구분</p>
                    <button onClick={() => setSelectionStep('STAGE')} className="text-[10px] font-black text-chapter-accent hover:underline">이전으로</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => { setTreatmentType('PROCEDURE'); setSelectionStep('READY'); }}
                        className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 ${treatmentType === 'PROCEDURE' ? 'border-chapter-accent bg-chapter-accent/5' : 'border-line bg-white'}`}
                    >
                        <div className="text-2xl">💉</div>
                        <p className="text-sm font-black text-obsidian">시술</p>
                    </button>
                    <button 
                        onClick={() => { setTreatmentType('SURGERY'); setSelectionStep('READY'); }}
                        className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 ${treatmentType === 'SURGERY' ? 'border-chapter-accent bg-chapter-accent/5' : 'border-line bg-white'}`}
                    >
                        <div className="text-2xl">🔪</div>
                        <p className="text-sm font-black text-obsidian">수술</p>
                    </button>
                </div>
            </div>
        );

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative">
                <Card className="rounded-[40px] border-none shadow-2xl overflow-hidden bg-white relative">
                    {isDiagnosing && (
                        <div className="absolute top-0 left-0 right-0 h-1.5 z-50 bg-mist overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-chapter-accent"
                                transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                            />
                        </div>
                    )}
                    <div className="relative h-64 overflow-hidden">
                        {capturedImage && <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between text-white">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-chapter-accent/20 text-chapter-accent border-chapter-accent/30 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 backdrop-blur-md">
                                        {categoryMap[result.type as keyof typeof categoryMap]?.icon || '📸'} {categoryMap[result.type as keyof typeof categoryMap]?.label || '기타'}
                                    </Badge>
                                </div>
                                <h4 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter">{result.subjectName}</h4>
                                <div className="text-[10px] font-black uppercase tracking-widest text-chapter-accent flex items-center gap-1">
                                    <Activity className="w-3 h-3" /> Recovery Point
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-black uppercase tracking-widest block mb-1 opacity-60">POINT</span>
                                <span className="text-2xl md:text-4xl font-black italic">{result.matchScore}<span className="text-sm opacity-40">/100</span></span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setStatus('idle')} 
                            className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white/60 transition-colors"
                            aria-label="결과 닫기"
                            title="결과 닫기"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <CardContent className="p-8 space-y-8">
                        {/* 1. Summary Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate/60">
                                <Brain className="w-4 h-4 text-reward-gold" /> Personalized Summary
                            </div>
                            <p className="text-lg md:text-2xl font-black leading-tight text-obsidian bg-mist/30 p-5 rounded-[32px] border border-line/30 italic">
                                "{result.summary}"
                            </p>
                        </div>

                        {/* 2. Nutrition & Impact Table */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate/60">
                                <Activity className="w-4 h-4 text-chapter-accent" /> Recovery Analysis
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {result.analysisTable?.map((item, idx) => (
                                    <div key={idx} className="flex flex-col p-5 rounded-[24px] bg-white border border-line/50 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black text-slate/60 uppercase tracking-widest">{item.label}</span>
                                            <Badge variant="outline" className="text-[10px] font-bold border-chapter-accent/20 text-chapter-accent bg-chapter-accent/5">
                                                {item.value}
                                            </Badge>
                                        </div>
                                        <p className="text-xs font-bold text-obsidian leading-snug">
                                            {item.benefit}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Future Direction */}
                        <div className="p-6 rounded-[32px] bg-obsidian text-white space-y-3 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-chapter-accent/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/70 relative z-10">
                                <Sparkles className="w-4 h-4 text-chapter-accent" /> Next Step Guide
                            </div>
                            <p className="text-sm font-bold leading-relaxed relative z-10">
                                {result.futureDirection}
                            </p>
                        </div>

                        {/* Nudge to Diagnosis */}
                        <div className="pt-6 border-t border-line">
                            <Button 
                                onClick={() => onStart(result || undefined, capturedImage || undefined)}
                                disabled={isDiagnosing}
                                size="lg" 
                                className={`w-full h-16 md:h-20 rounded-[24px] text-lg md:text-xl font-black shadow-2xl transition-all group relative overflow-hidden ${isDiagnosing ? 'bg-mist' : 'bg-chapter-accent hover:bg-chapter-accent/90 text-white shadow-chapter-accent/20'}`}
                            >
                                {isDiagnosing ? (
                                    <>
                                        {/* Progress Bar Layer */}
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            className="absolute inset-y-0 left-0 bg-chapter-accent z-0"
                                            transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                                        />
                                        
                                        {/* Base Text (Black, shown on light background) */}
                                        <div className="absolute inset-0 flex items-center justify-center z-10 text-slate/40">
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>60초 리듬체크 준비 중...</span>
                                                <span className="tabular-nums opacity-60">{Math.round(progress)}%</span>
                                            </div>
                                        </div>

                                        {/* Inverted Text (White, shown over the chapter-accent progress bar) */}
                                        <motion.div 
                                            className="absolute inset-y-0 left-0 overflow-hidden z-20 flex items-center bg-chapter-accent"
                                            style={{ width: `${progress}%` }}
                                        >
                                            <div className="w-[500px] flex items-center justify-center text-white px-8">
                                                <div className="flex items-center gap-3 w-full justify-center">
                                                    <Sparkles className="w-6 h-6 animate-pulse" />
                                                    <span className="whitespace-nowrap">60초 리듬체크 준비 중...</span>
                                                    <span className="tabular-nums font-black">{Math.round(progress)}%</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </>
                                ) : (
                                    <div className="relative z-10 flex items-center justify-center text-white">
                                        <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                                        <span>60초 리듬체크 시작하기</span>
                                        <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </Button>
                        </div>
                        <div className="flex items-center justify-center gap-2 py-2">
                            <span className="w-2 h-2 rounded-full bg-chapter-accent animate-pulse" />
                            <span className="text-[10px] font-black text-chapter-accent uppercase tracking-widest">Step 01. 오늘의 스냅 완료</span>
                        </div>
                        
                        <Button variant="ghost" onClick={() => setStatus('idle')} className="w-full h-14 rounded-2xl text-slate/60 font-bold hover:bg-mist transition-all">
                            다른 대상 스캔하기 <RefreshCw className="ml-2 w-4 h-4" />
                        </Button>
                    </CardContent>
                </Card>
                <MembershipUpsellDialog open={showUpsell} onOpenChange={setShowUpsell} />
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
                    <motion.div 
                        key="select_type" 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed inset-0 z-[100] md:relative md:inset-auto md:z-auto"
                    >
                        {renderSelectTypeView()}
                    </motion.div>
                )}
                
                {status === 'scanning' && (
                    <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative aspect-[4/3] rounded-[40px] bg-obsidian flex flex-col items-center justify-center text-mist overflow-hidden">
                        {capturedImage && <img src={capturedImage} alt="Scanning" className="absolute inset-0 w-full h-full object-cover opacity-20" />}
                        <AIProgressOverlay 
                            active={loading} 
                            progress={scanProgress} 
                            message={statusMessage} 
                            variant="compact"
                        />
                    </motion.div>
                )}
                
                {status === 'result' && renderResultView()}
            </AnimatePresence>
            <canvas ref={canvasRef} className="hidden" />
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleMobileCapture} 
                aria-label="회복 데이터 스캔을 위한 이미지 업로드"
                {...({ capture: 'environment' } as any)}
            />
        </div>
    );
}
