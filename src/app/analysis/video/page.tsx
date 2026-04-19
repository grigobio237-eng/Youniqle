'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, Loader2, X, Check, ArrowLeft, Activity, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface PostureResult {
    subjectName: string;
    score: number;
    turtleNeckAngle: string;
    shoulderBalance: string;
    summary: string;
    analysisTable: { label: string; value: string; benefit: string; }[];
    futureDirection: string;
}

export default function PostureAnalysisPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [status, setStatus] = useState<'idle' | 'webcam' | 'scanning' | 'result'>('idle');
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [result, setResult] = useState<PostureResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Device Detection ---
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

    // Camera Logic
    const startWebcam = async () => {
        if (isMobile) {
            fileInputRef.current?.click();
            return;
        }

        setIsCameraReady(false);
        try {
            const constraints: MediaStreamConstraints = {
                video: { 
                    facingMode: 'user', 
                    width: { ideal: 1280, max: 1920 }, 
                    height: { ideal: 720, max: 1080 } 
                },
                audio: false
            };
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
            setStatus('webcam');
        } catch (err: any) {
            console.error("Camera Error:", err);
            // Fallback for generic video if specific constraints fail
            try {
                const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                setStream(fallbackStream);
                setStatus('webcam');
            } catch (fallbackErr) {
                toast.error("카메라를 시작할 수 없습니다. 권한 설정을 확인해주세요.");
            }
        }
    };

    const stopWebcam = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
                console.log("[Posture] Track stopped:", track.label);
            });
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        let isMounted = true;
        
        const attachStream = async () => {
            if (status === 'webcam' && stream && videoRef.current) {
                console.log("[Posture] Attaching stream to video element");
                
                // If it's already the same stream, don't re-assign
                if (videoRef.current.srcObject !== stream) {
                    videoRef.current.srcObject = stream;
                }
                
                try {
                    await videoRef.current.play();
                    // Initial fallback: if it's already playing, hide loader soon
                    if (videoRef.current.readyState >= 3) {
                        setTimeout(() => { if (isMounted) setIsCameraReady(true); }, 500);
                    }
                } catch (playError) {
                    console.error("[Posture] Play error:", playError);
                }
            }
        };

        const timer = setTimeout(attachStream, 100); // Small delay to wait for animation mount
        
        return () => {
            isMounted = false;
            clearTimeout(timer);
            if (status !== 'webcam') stopWebcam();
        };
    }, [status, stream, stopWebcam]);

    const captureSnapshot = () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
            toast.error("카메라 로딩 중입니다. 잠시만 기다려주세요.");
            return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(videoRef.current, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(base64);
        stopWebcam();
        analyzePosture(base64);
    };

    const analyzePosture = async (imageData: string) => {
        setStatus('scanning');
        setLoading(true);
        try {
            const response = await fetch('/api/ai/posture-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageData })
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();
            setResult(data);
            setStatus('result');
        } catch (err) {
            toast.error("분석 중 오류가 발생했습니다. 다시 촬영해주세요.");
            setStatus('idle');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-mist p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => {
                        stopWebcam();
                        router.back();
                    }} className="rounded-full">
                        <ArrowLeft className="w-6 h-6 mr-2" /> 돌아가기
                    </Button>
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-chapter-accent" />
                        <span className="text-xs font-black uppercase tracking-widest text-chapter-accent">Youniqle Posture Tracker</span>
                    </div>
                </header>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                const base64 = event.target?.result as string;
                                setCapturedImage(base64);
                                analyzePosture(base64);
                            };
                            reader.readAsDataURL(file);
                        }
                    }} 
                    accept="image/*" 
                    className="hidden" 
                    {...({ capture: 'environment' } as any)}
                    aria-label="자세 사진 업로드"
                    title="자세 사진 업로드"
                />

                <main>
                    <AnimatePresence mode="wait">
                        {status === 'idle' && (
                            <motion.div 
                                key="idle" 
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center space-y-8 py-20"
                            >
                                <div className="space-y-4">
                                    <h1 className="text-4xl md:text-6xl font-black text-obsidian tracking-tight">
                                        당신의 회복 자세는<br />어떤 상태인가요?
                                    </h1>
                                    <p className="text-lg text-slate/60 font-medium">
                                        스냅샷 촬영 한 번으로 거북목과 체형 밸런스를 분석합니다.
                                    </p>
                                </div>
                                <div className="relative group inline-block">
                                    <div className="absolute -inset-4 bg-chapter-accent/20 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Button 
                                        onClick={startWebcam} 
                                        size="lg" 
                                        className="relative bg-chapter-accent text-white h-20 px-12 rounded-3xl text-xl font-black shadow-2xl hover:scale-105 transition-all"
                                    >
                                        <Camera className="w-6 h-6 mr-3" /> 카메라 시작하기
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {status === 'webcam' && (
                            <motion.div 
                                key="webcam" 
                                initial={{ opacity: 0, scale: 0.9 }} 
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="relative aspect-square md:aspect-video bg-obsidian rounded-[40px] overflow-hidden shadow-2xl border-4 border-white"
                            >
                                {!isCameraReady && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-obsidian z-20">
                                        <Loader2 className="w-12 h-12 text-chapter-accent animate-spin mb-4" />
                                        <p className="text-white/60 font-bold tracking-widest uppercase text-[10px]">Camera Connecting...</p>
                                    </div>
                                )}
                                <video 
                                    ref={videoRef} 
                                    autoPlay 
                                    playsInline 
                                    muted 
                                    onLoadedMetadata={() => setIsCameraReady(true)}
                                    onCanPlay={() => setIsCameraReady(true)}
                                    onPlaying={() => setIsCameraReady(true)}
                                    className={`w-full h-full object-cover transition-opacity duration-700 ${isCameraReady ? 'opacity-100' : 'opacity-0'} grayscale-[0.3]`} 
                                />
                                
                                {/* Silhouette Guide Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 z-10">
                                    <div className="w-[60%] h-[80%] border-4 border-dashed border-white rounded-[100px] flex items-center justify-center">
                                            <p className="text-white text-xs font-black uppercase tracking-widest text-center">동그라미 안에 얼굴과 어깨를 맞춰주세요</p>
                                    </div>
                                </div>

                                <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-6 px-10 z-30">
                                    <Button 
                                        onClick={captureSnapshot} 
                                        size="lg" 
                                        className="bg-white text-obsidian h-20 w-20 rounded-full shadow-2xl border-4 border-chapter-accent transition-transform hover:scale-110 active:scale-95"
                                    >
                                        <div className="w-12 h-12 bg-chapter-accent rounded-full flex items-center justify-center text-white">
                                            <Check className="w-8 h-8" />
                                        </div>
                                    </Button>
                                    <Button 
                                        onClick={() => {
                                            stopWebcam();
                                            setStatus('idle');
                                            setIsCameraReady(false);
                                        }} 
                                        variant="outline"
                                        className="bg-white/10 backdrop-blur-md border-white/20 text-white h-20 w-20 rounded-full hover:bg-white/20"
                                    >
                                        <X className="w-8 h-8" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {status === 'scanning' && (
                            <motion.div 
                                key="scanning" 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-20 space-y-12"
                            >
                                <div className="relative w-48 h-48">
                                    <motion.div 
                                        animate={{ rotate: 360 }} 
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 border-t-4 border-b-4 border-chapter-accent rounded-full"
                                    />
                                    <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center overflow-hidden border border-line shadow-inner">
                                        {capturedImage && <img src={capturedImage} className="w-full h-full object-cover opacity-50" alt="Captured" />}
                                        <div className="absolute inset-0 flex items-center justify-center bg-chapter-accent/10">
                                            <Loader2 className="w-12 h-12 text-chapter-accent animate-spin" />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center space-y-4">
                                    <h3 className="text-3xl font-black text-obsidian tracking-tight uppercase">Youniqle Posture Synthesis</h3>
                                    <p className="text-slate/60 font-bold animate-pulse text-lg">이미지 데이터로부터 골격 구조를 추적하고 있습니다...</p>
                                </div>
                            </motion.div>
                        )}

                        {status === 'result' && result && (
                            <motion.div 
                                key="result" 
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                            >
                                {/* Left: Score & Image */}
                                <Card className="rounded-[40px] overflow-hidden border-none shadow-2xl bg-white group">
                                    <CardContent className="p-10 space-y-8">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <h3 className="text-sm font-black text-chapter-accent tracking-widest uppercase">Analysis Result</h3>
                                                <p className="text-3xl font-black text-obsidian tracking-tight">{result.subjectName}</p>
                                            </div>
                                            <div className="bg-chapter-accent text-white w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                <span className="text-2xl font-black leading-none">{result.score}</span>
                                                <span className="text-[10px] uppercase font-bold opacity-70">Points</span>
                                            </div>
                                        </div>

                                        <div className="aspect-square rounded-3xl overflow-hidden bg-mist border border-line relative">
                                            {capturedImage && <img src={capturedImage} className="w-full h-full object-cover" alt="Posture" />}
                                            <div className="absolute top-4 left-4 bg-obsidian/80 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold border border-white/20">
                                                <Activity className="w-4 h-4 inline-block mr-2 text-chapter-accent" /> 유니클 스켈레톤 스캔 활성화
                                            </div>
                                        </div>

                                        <p className="text-lg font-bold text-slate leading-relaxed italic border-l-4 border-chapter-accent pl-6">
                                            "{result.summary}"
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Right: Details & Next Action */}
                                <div className="flex flex-col gap-6">
                                    <Card className="rounded-[40px] border-none shadow-xl bg-obsidian text-white overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-chapter-accent/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                        <CardContent className="p-10 space-y-6">
                                            <div className="flex items-center gap-3">
                                                <Zap className="w-6 h-6 text-reward-gold" />
                                                <span className="text-sm font-black uppercase tracking-widest opacity-80">Critical Observations</span>
                                            </div>
                                            <div className="space-y-4">
                                                {result.analysisTable.map((item, idx) => (
                                                    <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 hover:bg-white/10 transition-colors">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-black uppercase text-chapter-accent tracking-wider">{item.label}</span>
                                                            <span className="text-xs font-bold text-mist">{item.value}</span>
                                                        </div>
                                                        <p className="text-sm text-mist/60 leading-snug">{item.benefit}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="rounded-[40px] border-none shadow-xl bg-white overflow-hidden group">
                                        <CardContent className="p-8 space-y-6">
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck className="w-6 h-6 text-status-good" />
                                                <span className="text-xs font-black uppercase tracking-widest text-slate/50">Next Action</span>
                                            </div>
                                            <p className="text-obsidian font-bold leading-relaxed">{result.futureDirection}</p>
                                            <Button 
                                                onClick={() => router.push('/ai-navigator')} 
                                                className="w-full h-16 bg-chapter-accent text-white rounded-2xl font-black text-lg group-hover:scale-[1.02] transition-transform shadow-xl"
                                            >
                                                대시보드에서 자세 관리 시작
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                onClick={() => setStatus('idle')}
                                                className="w-full h-12 text-slate/60 font-bold hover:text-chapter-accent"
                                            >
                                                다시 촬영하기
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
