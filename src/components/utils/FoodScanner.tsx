'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Camera, RefreshCw, Sparkles, ChevronRight, Loader2, ArrowRight, 
    X, ChefHat, Activity, Brain, Clock, PlusCircle, Upload 
} from 'lucide-react';
import { useAIProgress } from '@/hooks/use-ai-progress';
import { AIProgressOverlay } from '@/components/shared/AIProgressOverlay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

// API 응답 타입 정의
interface AnalysisResult {
    foodName: string;
    recoveryPoints: string[];
    analysis: string;
    matchScore: number;
    scoreContext: {
        isMissing: boolean;
        isStale: boolean;
        lastSeen?: string;
    };
}

export default function FoodScanner() {
    // --- State ---
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
    const [status, setStatus] = useState<'idle' | 'scanning' | 'result'>('idle');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const { progress, statusMessage, finish: finishProgress } = useAIProgress(loading);

    // --- Refs ---
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Camera Logic ---
    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraActive(false);
    }, [stream]);

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

    useEffect(() => {
        return () => stopCamera();
    }, [stopCamera]);

    const startCamera = async () => {
        if (isMobile) {
            fileInputRef.current?.click();
            return;
        }

        try {
            const constraints = {
                video: {
                    facingMode: cameraFacing,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
            setIsCameraActive(true);
            setStatus('idle');
            setResult(null);
            setCapturedImage(null);
        } catch (err) {
            console.error("Camera access error:", err);
            toast.error("카메라 접근 권한이 필요합니다. 브라우저 설정을 확인해주세요.");
        }
    };

    const toggleCamera = () => {
        const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
        setCameraFacing(nextFacing);
        stopCamera();
        setTimeout(() => startCamera(), 100);
    };

    // --- Analysis Logic ---
    const analyzeImage = async (imageData: string) => {
        setCapturedImage(imageData);
        setStatus('scanning');
        setLoading(true);

        try {
            const response = await fetch('/api/ai/food-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageData, journey: 'WELLNESS' })
            });

            if (!response.ok) throw new Error('Analysis failed');
            
            finishProgress();
            // 시각적 피드백
            await new Promise(r => setTimeout(r, 800));

            const data = await response.json();
            setResult(data);
            setStatus('result');
            stopCamera();
        } catch (err) {
            console.error("Analysis Error:", err);
            toast.error("유니클 분석 중 오류가 발생했습니다. 다시 시도해주세요.");
            setStatus('idle');
        } finally {
            setLoading(false);
        }
    };

    const handleCameraCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/png');
            analyzeImage(imageData);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error("이미지 파일만 업로드 가능합니다.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = event.target?.result as string;
            analyzeImage(imageData);
        };
        reader.readAsDataURL(file);
    };

    // --- Render Helpers ---
    const renderIdleView = () => (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 bg-gradient-to-br from-indigo-950 to-obsidian text-mist text-center p-8">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                <Camera className="w-12 h-12 opacity-50" />
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-black italic tracking-tighter uppercase">YOUNIQLE Recovery Scanner</h3>
                <p className="opacity-60 font-medium">당신의 한 끼가 가져올 회복 데이터를 확인하세요.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <Button size="lg" onClick={startCamera} className="btn-primary flex-1 h-16 text-lg rounded-3xl shadow-xl">
                    촬영하기 <Camera className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 h-16 text-lg rounded-3xl border-2 border-white/20 bg-white/5 hover:bg-white/10 text-white"
                >
                    사진 업로드 <Upload className="ml-2 w-5 h-5" />
                </Button>
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
                aria-label="음식 이미지 파일 선택"
                title="음식 이미지 파일 선택"
                {...({ capture: 'environment' } as any)}
            />
        </div>
    );

    const renderActiveCameraView = () => (
        <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            
            {/* Viewfinder */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-white/20 rounded-[40px] border-dashed" />
            </div>

            {/* Controls */}
            {status === 'idle' && (
                <div className="absolute bottom-10 inset-x-0 flex items-center justify-center gap-6 px-10">
                    <button 
                        onClick={toggleCamera} 
                        className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
                        aria-label="카메라 전환"
                    >
                        <RefreshCw className="w-6 h-6 text-white" />
                    </button>
                    <button 
                        onClick={handleCameraCapture}
                        className="w-24 h-24 rounded-full bg-white p-1 shadow-2xl hover:scale-105 active:scale-95 transition-all group"
                        aria-label="음식 촬영 및 분석"
                    >
                        <div className="w-full h-full rounded-full border-4 border-obsidian flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-chapter-accent/10 flex items-center justify-center group-hover:bg-chapter-accent transition-colors">
                                <ChefHat className="w-8 h-8 text-obsidian group-hover:text-white" />
                            </div>
                        </div>
                    </button>
                    <button 
                        onClick={() => { stopCamera(); setIsCameraActive(false); }}
                        className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
                        aria-label="카메라 닫기"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>
            )}
        </>
    );

    const renderAnalysisResult = () => {
        if (!result) return null;
        return (
            <motion.div
                key="result-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                {/* Left: Food Profile */}
                <Card className="rounded-[40px] border-none shadow-2xl overflow-hidden bg-white">
                    <div className="relative aspect-square">
                        {capturedImage && <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent" />
                        <div className="absolute bottom-8 left-8 right-8 text-white space-y-2">
                            <Badge className="bg-chapter-accent text-obsidian px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest">FOOD IDENTIFIED</Badge>
                            <h2 className="text-4xl font-black italic tracking-tighter uppercase">{result.foodName}</h2>
                        </div>
                    </div>
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-center gap-2 text-obsidian font-black uppercase tracking-widest text-xs">
                            <Sparkles className="w-4 h-4" /> RECOVERY MATCH SCORE
                        </div>
                        <div className="flex items-end gap-3 text-7xl font-black italic tracking-tighter">
                            {result.matchScore}
                            <span className="text-2xl opacity-20 mb-2">/100</span>
                        </div>
                        <div className="w-full bg-mist h-2 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${result.matchScore}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="bg-chapter-accent h-full shadow-[0_0_10px_rgba(var(--chapter-accent-rgb),0.5)]"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Right: AI Analysis */}
                <div className="space-y-6">
                    <Card className="rounded-[40px] border-none shadow-2xl bg-obsidian text-mist">
                        <CardContent className="p-8 space-y-8">
                            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest opacity-60">
                                <Brain className="w-5 h-5 text-reward-gold" /> YOUNIQLE EXPERT ANALYSIS
                            </div>
                            <p className="text-lg font-medium leading-relaxed italic">"{result.analysis}"</p>
                            <div className="space-y-4">
                                {result.recoveryPoints.map((point, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + idx * 0.1 }}
                                        className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-chapter-accent shadow-[0_0_10px_rgba(var(--chapter-accent-rgb),1)]" />
                                        <span className="font-bold text-sm">{point}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Nudge Section */}
                    {(result.scoreContext.isMissing || result.scoreContext.isStale) && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                            <Link href="/diagnosis">
                                <Card className="rounded-[30px] border-2 border-dashed border-chapter-accent/40 hover:border-chapter-accent bg-chapter-accent/5 transition-all group overflow-hidden cursor-pointer">
                                    <CardContent className="p-6 flex items-center gap-6">
                                        <div className="w-16 h-16 bg-chapter-accent rounded-2xl flex items-center justify-center text-obsidian shrink-0 group-hover:scale-110 transition-transform">
                                            <Activity className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-black tracking-tight text-obsidian">
                                                {result.scoreContext.isMissing ? "개인 맞춤 피드백이 필요하신가요?" : "최신 회복 데이터로 분석 받아보세요!"}
                                            </h4>
                                            <p className="text-sm font-medium text-slate">
                                                {result.scoreContext.isMissing 
                                                    ? "오늘의 정밀 진단을 완료하면 더 자세한 피드백을 드릴 수 있어요." 
                                                    : "회복 데이터가 7일 이상 경과되었습니다. 다시 진단하여 정밀도를 높여보세요."}
                                            </p>
                                        </div>
                                        <div className="ml-auto opacity-20 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight className="w-6 h-6 text-obsidian" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    )}

                    <Button size="lg" onClick={() => { startCamera(); }} className="w-full h-16 rounded-3xl border-2 border-obsidian bg-transparent text-obsidian hover:bg-obsidian hover:text-white transition-all font-black text-lg">
                        다른 음식 분석하기 <RefreshCw className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <AnimatePresence mode="wait">
                {(status === 'idle' || status === 'scanning') ? (
                    <motion.div
                        key="scanner-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative"
                    >
                        <div className="relative aspect-[4/3] md:aspect-video rounded-[40px] overflow-hidden bg-obsidian border-4 border-white/10 shadow-2xl">
                            {!isCameraActive ? renderIdleView() : renderActiveCameraView()}
                            
                            {/* Scanning Overlay */}
                            <AIProgressOverlay 
                                active={loading} 
                                progress={progress} 
                                message={statusMessage} 
                                variant="compact"
                            />
                        </div>
                    </motion.div>
                ) : (
                    renderAnalysisResult()
                )}
            </AnimatePresence>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
