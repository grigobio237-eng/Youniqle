'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCcw, Sparkles, Loader2, ArrowLeft, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface PostureResult {
    subjectName: string;
    score: number;
    turtleNeckAngle: string;
    shoulderBalance: string;
    summary: string;
    analysisTable: Array<{ label: string, value: string, benefit: string }>;
    futureDirection: string;
}

export default function PostureScanner() {
    const [status, setStatus] = useState<'idle' | 'webcam' | 'analyzing' | 'result'>('idle');
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [result, setResult] = useState<PostureResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
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

    const stopWebcam = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraReady(false);
    }, [stream]);

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
            console.error(err);
            toast.error("카메라를 시작할 수 없습니다. 권한을 확인해주세요.");
        }
    };

    useEffect(() => {
        let isMounted = true;
        const attachStream = async () => {
            if (status === 'webcam' && stream && videoRef.current) {
                if (videoRef.current.srcObject !== stream) {
                    videoRef.current.srcObject = stream;
                }
                try {
                    await videoRef.current.play();
                    if (videoRef.current.readyState >= 3) {
                        setTimeout(() => { if (isMounted) setIsCameraReady(true); }, 500);
                    }
                } catch (playError) {
                    console.error("[Posture] Play error:", playError);
                }
            }
        };
        const timer = setTimeout(attachStream, 100);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [status, stream]);

    const captureImage = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            setCapturedImage(dataUrl);
            stopWebcam();
            analyzePosture(dataUrl);
        }
    };

    const analyzePosture = async (imageData: string) => {
        setStatus('analyzing');
        setLoading(true);
        try {
            const response = await fetch('/api/ai/posture-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageData }),
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setResult(data);
            setStatus('result');
        } catch (err: any) {
            toast.error(err.message || "분석 중 오류가 발생했습니다.");
            setStatus('idle');
        } finally {
            setLoading(false);
        }
    };

    const resetAnalysis = () => {
        stopWebcam();
        setCapturedImage(null);
        setResult(null);
        setStatus('idle');
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-[40px] overflow-hidden">
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
            />

            <div className="relative aspect-video bg-obsidian/5 rounded-[32px] overflow-hidden border border-line">
                <AnimatePresence mode="wait">
                    {status === 'idle' && (
                        <motion.div 
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6"
                        >
                            <div className="w-20 h-20 bg-chapter-accent/10 rounded-3xl flex items-center justify-center">
                                <Camera className="w-10 h-10 text-chapter-accent" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black italic text-obsidian uppercase">Ready to Analyze</h3>
                                <p className="text-slate/60 text-sm max-w-xs mx-auto">
                                    상반선 혹은 전신이 잘 보이도록<br />정면 사진을 촬영하거나 업로드해주세요.
                                </p>
                            </div>
                            <Button 
                                onClick={startWebcam}
                                className="bg-obsidian text-white h-14 px-8 rounded-2xl font-black italic tracking-widest uppercase hover:scale-105 transition-transform"
                            >
                                Start Posture Scan
                            </Button>
                        </motion.div>
                    )}

                    {status === 'webcam' && (
                        <motion.div key="webcam" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black">
                            {!isCameraReady && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-obsidian z-20">
                                    <Loader2 className="w-12 h-12 text-chapter-accent animate-spin mb-4" />
                                    <p className="text-white/60 font-bold tracking-widest uppercase text-[10px]">Camera Connecting...</p>
                                </div>
                            )}
                            <video 
                                ref={videoRef} 
                                autoPlay playsInline muted 
                                onLoadedMetadata={() => setIsCameraReady(true)}
                                onCanPlay={() => setIsCameraReady(true)}
                                onPlaying={() => setIsCameraReady(true)}
                                className={`w-full h-full object-cover transition-opacity duration-700 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`} 
                            />
                            {isCameraReady && (
                                <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center gap-6">
                                    <button 
                                        onClick={captureImage}
                                        className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-chapter-accent hover:scale-110 active:scale-95 transition-all"
                                        aria-label="사진 촬영"
                                    >
                                        <div className="w-14 h-14 bg-chapter-accent rounded-full flex items-center justify-center text-white">
                                            <Camera className="w-6 h-6" />
                                        </div>
                                    </button>
                                    <button 
                                        onClick={resetAnalysis}
                                        className="w-20 h-20 bg-obsidian/80 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-obsidian transition-colors"
                                        aria-label="카메라 끄기"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {status === 'analyzing' && (
                        <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center bg-white z-40">
                            <div className="relative w-48 h-48 mb-8">
                                <div className="absolute inset-0 border-4 border-chapter-accent/20 rounded-full" />
                                <div className="absolute inset-0 border-4 border-chapter-accent border-t-transparent rounded-full animate-spin" />
                                <div className="absolute inset-4 overflow-hidden rounded-full">
                                    {capturedImage && <img src={capturedImage} alt="Capture" className="w-full h-full object-cover grayscale opacity-50" />}
                                </div>
                            </div>
                            <h3 className="text-2xl font-black italic text-obsidian uppercase tracking-widest animate-pulse">Analyzing...</h3>
                            <p className="text-slate/40 text-[10px] font-black uppercase tracking-[0.4em] mt-4">Fine-tuning postural data</p>
                        </motion.div>
                    )}

                    {status === 'result' && result && (
                        <motion.div 
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute inset-0 overflow-y-auto bg-mist p-6"
                        >
                            <div className="max-w-xl mx-auto space-y-8 pb-12">
                                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-line text-center space-y-4">
                                    <Badge className="bg-chapter-accent/10 text-chapter-accent border-none font-black italic px-4 py-1">ANALYSIS COMPLETE</Badge>
                                    <h2 className="text-4xl font-black italic text-obsidian leading-tight">{result.subjectName}</h2>
                                    <div className="text-7xl font-black italic text-chapter-accent">{result.score}<span className="text-2xl opacity-30 ml-2">PTS</span></div>
                                    <p className="text-slate/60 text-sm leading-relaxed">{result.summary}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-6 rounded-[32px] border border-line">
                                        <p className="text-[10px] font-black text-slate uppercase tracking-widest mb-1">Turtle Neck</p>
                                        <p className="text-lg font-black italic text-obsidian">{result.turtleNeckAngle}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-[32px] border border-line">
                                        <p className="text-[10px] font-black text-slate uppercase tracking-widest mb-1">Shoulder Balance</p>
                                        <p className="text-lg font-black italic text-obsidian">{result.shoulderBalance}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-obsidian uppercase tracking-widest px-2">Detailed Metrics</h4>
                                    <div className="space-y-3">
                                        {result.analysisTable.map((item, idx) => (
                                            <div key={idx} className="bg-white/80 p-5 rounded-3xl border border-line flex justify-between items-center gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-mist rounded-2xl flex items-center justify-center">
                                                        <Activity className="w-5 h-5 text-chapter-accent" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-obsidian">{item.label}</p>
                                                        <p className="text-sm font-bold text-slate/60">{item.benefit}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black italic text-chapter-accent">{item.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-obsidian p-8 rounded-[40px] text-mist relative overflow-hidden group">
                                    <Sparkles className="absolute top-6 right-6 w-8 h-8 text-chapter-accent opacity-20 group-hover:rotate-12 transition-transform" />
                                    <div className="relative z-10 space-y-3">
                                        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-chapter-accent">Recovery Plan</h4>
                                        <p className="text-lg font-medium leading-relaxed italic">{result.futureDirection}</p>
                                    </div>
                                </div>

                                <Button 
                                    onClick={resetAnalysis}
                                    className="w-full h-16 rounded-[24px] border-2 border-line bg-white hover:bg-mist text-obsidian font-black italic uppercase tracking-widest"
                                >
                                    New Session
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function Activity({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
    );
}
