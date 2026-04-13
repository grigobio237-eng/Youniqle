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

export interface AnalysisResult {
    subjectName: string;
    type: 'MEAL' | 'SPACE' | 'STATE' | 'OTHER';
    summary: string;
    analysisTable: { label: string; value: string; benefit: string; }[];
    futureDirection: string;
    matchScore: number;
}

export default function HeroScanner({ onStart }: { onStart: (data?: AnalysisResult) => void }) {
    const { journey, setJourney, medicalCategory, setMedicalCategory } = useRecovery();
    const [isMobile, setIsMobile] = useState(false);
    const [status, setStatus] = useState<'idle' | 'scanning' | 'result'>('idle');
    const [loading, setLoading] = useState(false);
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
        try {
            const constraints: MediaStreamConstraints = {
                video: true 
            };
            
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
            setShowWebcam(true);
        } catch (err: any) {
            console.error("Webcam Error:", err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                toast.error("카메라 권한이 거부되었습니다. 주소창의 카메라 아이콘을 눌러 권한을 허용해주세요.");
            } else {
                toast.error("카메라를 시작할 수 없습니다. 다른 프로그램에서 카메라를 사용 중인지 확인해주세요.");
            }
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
                resolve(canvas.toDataURL('image/jpeg', 0.8));
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

            const response = await fetch('/api/ai/food-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: compressedData, journey })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Analysis failed');
            }

            const data = await response.json();
            setResult(data);
            setStatus('result');
        } catch (err: any) {
            console.error('Analysis Error:', err);
            toast.error(err.message || "유니클 분석 중 오류가 발생했습니다.");
            setStatus('idle');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToTimeline = async () => {
        if (!session) {
            toast.error("로그인이 필요한 기능입니다.");
            return;
        }

        const pass = (session.user as any).passInfo;
        const isActivePass = pass && pass.status === 'ACTIVE' && pass.type !== 'NONE';

        if (!isActivePass) {
            setShowUpsell(true);
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
                    metrics: result?.analysisTable
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || '저장에 실패했습니다.');
            }
            
            toast.success('스캔 타임라인에 기록되었습니다.');
            setHasSaved(true);
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
        analyzeImage(canvas.toDataURL('image/png'));
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
            onClick={() => isMobile ? fileInputRef.current?.click() : startWebcam()}
            className="relative aspect-[4/3] rounded-[40px] overflow-hidden bg-obsidian group cursor-pointer border-4 border-white/5 shadow-2xl"
        >
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&q=80')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-obsidian/80" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-xl border border-white/10 group-hover:scale-110 transition-all duration-500">
                    <Camera className="w-8 h-8 text-white/50" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Ready to Scan</h3>
                    <p className="text-white/60 text-xs font-bold leading-relaxed break-keep px-4">
                        당신이 머무는 공간, 보는 것과 듣는 것,<br />
                        그리고 먹는 모든 것이 회복의 조각입니다.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="border-white/20 text-white/70 font-black text-[9px] uppercase tracking-widest bg-white/5">MEAL</Badge>
                    <Badge variant="outline" className="border-white/20 text-white/70 font-black text-[9px] uppercase tracking-widest bg-white/5">SPACE</Badge>
                    <Badge variant="outline" className="border-white/20 text-white/70 font-black text-[9px] uppercase tracking-widest bg-white/5">STATE</Badge>
                </div>
            </div>

            <Sparkles className="absolute top-8 right-8 w-6 h-6 text-chapter-accent animate-pulse" />
            
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

    const renderWebcamView = () => (
        <div className="relative aspect-[4/3] rounded-[40px] overflow-hidden bg-black border-4 border-white/10 shadow-2xl">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 bg-gradient-to-t from-black/60 to-transparent">
                <Button size="lg" onClick={handleCapture} className="w-20 h-20 rounded-full bg-white p-1 hover:scale-105 active:scale-95 transition-all">
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
        
        // CLINICAL_PRE requires a medical category to start
        const canStartDiagnosis = journey === 'WELLNESS' || journey === 'CLINICAL_POST' || (journey === 'CLINICAL_PRE' && medicalCategory !== null);

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <Card className="rounded-[40px] border-none shadow-2xl overflow-hidden bg-white">
                    <div className="relative h-64 overflow-hidden">
                        {capturedImage && <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between text-white">
                            <div>
                                <h4 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter">{result.subjectName}</h4>
                                <div className="text-[10px] font-black uppercase tracking-widest text-chapter-accent flex items-center gap-1">
                                    <Activity className="w-3 h-3" /> Recovery Point
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-black uppercase tracking-widest block mb-1 opacity-60">SCORE</span>
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
                        <div className="pt-6 border-t border-line space-y-4">
                            {!hasSaved ? (
                                <Button 
                                    onClick={handleSaveToTimeline}
                                    disabled={isSaving}
                                    variant="outline"
                                    className="w-full h-14 rounded-2xl border-2 border-chapter-accent/20 text-chapter-accent font-black uppercase tracking-widest hover:bg-chapter-accent/5 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    스캔 타임라인에 저장하기
                                </Button>
                            ) : (
                                <div className="w-full h-14 rounded-2xl bg-status-normal/10 border-2 border-status-normal/20 text-status-normal flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest">
                                    <Check className="w-5 h-5" /> 저장 완료
                                </div>
                            )}

                            <Button 
                                onClick={() => onStart(result || undefined)}
                                size="lg" 
                                disabled={!canStartDiagnosis}
                                className={`w-full h-16 md:h-20 rounded-[24px] text-lg md:text-xl font-black shadow-2xl transition-all group relative overflow-hidden ${
                                    !canStartDiagnosis ? 'bg-mist text-slate/50' : 'bg-chapter-accent hover:bg-chapter-accent/90 text-white shadow-chapter-accent/20'
                                }`}
                            >
                                {canStartDiagnosis && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />}
                                <Sparkles className={`w-6 h-6 mr-3 transition-transform ${canStartDiagnosis ? 'group-hover:rotate-12' : ''}`} />
                                60초 정밀 진단 시작하기
                                <ArrowRight className={`ml-3 w-6 h-6 transition-transform ${canStartDiagnosis ? 'group-hover:translate-x-1' : ''}`} />
                            </Button>
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
                
                {status === 'scanning' && (
                    <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative aspect-[4/3] rounded-[40px] bg-obsidian flex flex-col items-center justify-center text-mist">
                        <Loader2 className="w-12 h-12 animate-spin mb-4 text-chapter-accent" />
                        <h4 className="text-xl font-black italic tracking-widest animate-pulse uppercase">YOUNIQLE Analyzing...</h4>
                        {capturedImage && <img src={capturedImage} alt="Scanning" className="absolute inset-0 w-full h-full object-cover opacity-20" />}
                        <motion.div 
                            initial={{ top: "-10%" }}
                            animate={{ top: "110%" }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-1 bg-chapter-accent shadow-[0_0_15px_rgba(var(--chapter-accent-rgb),0.8)] z-10"
                        />
                    </motion.div>
                )}
                
                {status === 'result' && renderResultView()}
            </AnimatePresence>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
