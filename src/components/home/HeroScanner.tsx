'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCw, Sparkles, Loader2, Upload, X, Check, Brain, Activity, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRecovery } from '@/contexts/RecoveryContext';

interface AnalysisResult {
    foodName: string;
    recoveryPoints: string[];
    analysis: string;
    matchScore: number;
}

export default function HeroScanner({ onStart }: { onStart: () => void }) {
    const { journey, setJourney } = useRecovery();
    const [isMobile, setIsMobile] = useState(false);
    const [status, setStatus] = useState<'idle' | 'scanning' | 'result'>('idle');
    const [loading, setLoading] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    
    // PC Webcam States
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

    // 3. Analysis Logic
    const analyzeImage = async (imageData: string) => {
        setCapturedImage(imageData);
        setStatus('scanning');
        setLoading(true);
        stopWebcam();

        try {
            const response = await fetch('/api/ai/food-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageData, journey })
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();
            setResult(data);
            setStatus('result');
        } catch (err) {
            toast.error("AI 분석 중 오류가 발생했습니다.");
            setStatus('idle');
        } finally {
            setLoading(false);
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
                        식단, 시술 부위, 또는 회복 보조제를 촬영하세요.<br />
                        AI가 실시간으로 당신의 회복 점수를 분석합니다.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="border-white/20 text-white/40 font-black text-[9px] uppercase tracking-widest bg-white/5">MEAL</Badge>
                    <Badge variant="outline" className="border-white/20 text-white/40 font-black text-[9px] uppercase tracking-widest bg-white/5">AREA</Badge>
                    <Badge variant="outline" className="border-white/20 text-white/40 font-black text-[9px] uppercase tracking-widest bg-white/5">MEDS</Badge>
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
                <Button variant="ghost" onClick={stopWebcam} className="absolute top-6 right-6 text-white/60 hover:text-white">
                    <X className="w-6 h-6" />
                </Button>
            </div>
        </div>
    );

    const renderResultView = () => {
        if (!result) return null;
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <Card className="rounded-[40px] border-none shadow-2xl overflow-hidden bg-white">
                    <div className="relative h-64 overflow-hidden">
                        {capturedImage && <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between text-white">
                            <div>
                                <h4 className="text-3xl font-black italic uppercase tracking-tighter">{result.foodName}</h4>
                                <div className="text-[10px] font-black uppercase tracking-widest text-chapter-accent flex items-center gap-1">
                                    <Activity className="w-3 h-3" /> Recovery Point
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-black uppercase tracking-widest block mb-1 opacity-60">SCORE</span>
                                <span className="text-4xl font-black italic">{result.matchScore}<span className="text-lg opacity-40">/100</span></span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setStatus('idle')} 
                            className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white/60 transition-colors"
                            aria-label="결과 창 닫기"
                            title="닫기"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <CardContent className="p-8 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate/40">
                                <Brain className="w-4 h-4 text-reward-gold" /> Personalized Insight
                            </div>
                            <p className="text-lg font-medium leading-relaxed italic text-obsidian bg-mist/30 p-6 rounded-[32px] border border-line/30">
                                "{result.analysis}"
                            </p>
                        </div>

                        {/* Nudge to Diagnosis */}
                        <div className="pt-6 border-t border-line space-y-6">
                            <div className="text-center space-y-2">
                                <h4 className="text-xl font-black text-obsidian tracking-tight">회복 여정을 선택하세요</h4>
                                <p className="text-[10px] font-bold text-slate/40 uppercase tracking-widest">Select your path to get precision feedback</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setJourney('CLINICAL_PRE')} // Default to PRE if just clinical clicked
                                        className={`p-5 rounded-[24px] text-left border-4 transition-all duration-300 ${journey?.startsWith('CLINICAL') ? 'border-chapter-accent bg-chapter-accent/5' : 'border-line hover:border-chapter-accent'}`}
                                    >
                                        <div className="text-sm font-black text-obsidian uppercase mb-1 flex items-center gap-2">
                                            Clinical {journey?.startsWith('CLINICAL') && <Check className="w-3 h-3 text-chapter-accent" />}
                                        </div>
                                        <div className="text-[10px] text-slate/60 font-medium">시술/수술 전문 집중 케어</div>
                                    </button>
                                    <button 
                                        onClick={() => setJourney('WELLNESS')}
                                        className={`p-5 rounded-[24px] text-left border-4 transition-all duration-300 ${journey === 'WELLNESS' ? 'border-status-normal bg-status-normal/5' : 'border-line hover:border-status-normal'}`}
                                    >
                                        <div className="text-sm font-black text-obsidian uppercase mb-1 flex items-center gap-2">
                                            Wellness {journey === 'WELLNESS' && <Check className="w-3 h-3 text-status-normal" />}
                                        </div>
                                        <div className="text-[10px] text-slate/60 font-medium">일상 리듬 & 활력 최적화</div>
                                    </button>
                                </div>

                                {/* Clinical Sub-selection (Only shown if Clinical path is selected) */}
                                <AnimatePresence>
                                    {journey?.startsWith('CLINICAL') && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }} 
                                            animate={{ opacity: 1, height: 'auto' }} 
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-mist/50 p-4 rounded-[24px] border border-line overflow-hidden"
                                        >
                                            <div className="text-[10px] font-black text-slate/40 uppercase tracking-widest mb-3 text-center">세부 상황 선택</div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button 
                                                    onClick={() => setJourney('CLINICAL_PRE')}
                                                    className={`py-3 px-4 rounded-xl text-xs font-bold transition-all ${journey === 'CLINICAL_PRE' ? 'bg-chapter-accent text-white shadow-lg' : 'bg-white text-slate hover:bg-white/80'}`}
                                                >
                                                    시술 전 (준비)
                                                </button>
                                                <button 
                                                    onClick={() => setJourney('CLINICAL_POST')}
                                                    className={`py-3 px-4 rounded-xl text-xs font-bold transition-all ${journey === 'CLINICAL_POST' ? 'bg-chapter-accent text-white shadow-lg' : 'bg-white text-slate hover:bg-white/80'}`}
                                                >
                                                    시술 후 (회복)
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <Button 
                                onClick={onStart}
                                size="lg" 
                                disabled={!journey}
                                className={`w-full h-20 rounded-[24px] text-xl font-black shadow-2xl transition-all group relative overflow-hidden ${
                                    !journey ? 'bg-mist text-slate/30' : 'bg-chapter-accent hover:bg-chapter-accent/90 text-white shadow-chapter-accent/20'
                                }`}
                            >
                                {journey && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />}
                                <Sparkles className={`w-6 h-6 mr-3 transition-transform ${journey ? 'group-hover:rotate-12' : ''}`} />
                                60초 정밀 진단 시작하기
                                <ArrowRight className={`ml-3 w-6 h-6 transition-transform ${journey ? 'group-hover:translate-x-1' : ''}`} />
                            </Button>
                        </div>
                        
                        <Button variant="ghost" onClick={() => setStatus('idle')} className="w-full h-14 rounded-2xl text-slate/60 font-bold hover:bg-mist transition-all">
                            다른 음식 스캔하기 <RefreshCw className="ml-2 w-4 h-4" />
                        </Button>
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
                
                {status === 'scanning' && (
                    <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative aspect-[4/3] rounded-[40px] bg-obsidian flex flex-col items-center justify-center text-mist">
                        <Loader2 className="w-12 h-12 animate-spin mb-4 text-chapter-accent" />
                        <h4 className="text-xl font-black italic tracking-widest animate-pulse uppercase">AI Analyzing...</h4>
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
