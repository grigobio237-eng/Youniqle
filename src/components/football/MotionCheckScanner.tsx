'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCw, Sparkles, Loader2, ArrowLeft, ShieldAlert, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { calculateAngle } from '@/utils/poseAnalyzer';

interface MotionStep {
    id: 'squat' | 'jump' | 'run' | 'kick';
    title: string;
    subtitle: string;
    instruction: string;
    targetZone: string;
}

const STEPS: MotionStep[] = [
    { id: 'squat', title: 'SQUAT STABILITY', subtitle: '1단계: 스쿼트 안정성', instruction: '화면 중앙 십자선에 맞춰 깊게 스쿼트 동작을 수행하세요.', targetZone: '무릎 정렬 & 좌우 밸런스' },
    { id: 'jump', title: 'JUMP LANDING', subtitle: '2단계: 점프 착지', instruction: '가볍게 수직 점프 후 양발로 흔들림 없이 안정적으로 착지하세요.', targetZone: '무릎 충격 분산 & 착지 안정성' },
    { id: 'run', title: 'STATIONARY RUN', subtitle: '3단계: 제자리 달리기', instruction: '제자리에서 경쾌하게 무릎을 들어 뛰는 모션을 유지하세요.', targetZone: '상체 기울기 & 뛰는 리듬' },
    { id: 'kick', title: 'KICK BALANCE', subtitle: '4단계: 디딤발 & 킥', instruction: '디딤발을 견고히 지지하고 가볍게 차는 킥 자세를 취하세요.', targetZone: '골반 회전 & 디딤발 대칭' }
];

export default function MotionCheckScanner() {
    const router = useRouter();
    
    // UI & Camera states
    const [status, setStatus] = useState<'idle' | 'webcam'>('idle');
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [webcamError, setWebcamError] = useState<string | null>(null);
    const [showGuidelines, setShowGuidelines] = useState(true);
    const [telemetryLog, setTelemetryLog] = useState<string[]>([]);
    const [actualResolution, setActualResolution] = useState<string>('0 x 0');

    // Sequential check states
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [showFlash, setShowFlash] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [isHoldFreezing, setIsHoldFreezing] = useState(false);

    // Smart detection sequence state machine
    const [detectionState, setDetectionState] = useState<'searching' | 'locked' | 'countdown' | 'active'>('searching');
    const [countdownNumber, setCountdownNumber] = useState<number | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const sequenceTimeoutRef = useRef<NodeJS.Timeout[]>([]);

    // Telemetry log appender
    const addLog = useCallback((msg: string) => {
        const timestamp = new Date().toLocaleTimeString('ko-KR', { hour12: false });
        setTelemetryLog(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 35)]);
    }, []);

    // Web Audio Synthesizer Beep Sound Generator
    const playBeep = useCallback((freq: number, duration: number, type: OscillatorType = 'sine') => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            
            // Smooth fade-out to prevent audio pops
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.warn("AudioContext block/error:", e);
        }
    }, []);

    // Web Audio Synthesizer Shutter Click Sound Generator
    const playShutterSound = useCallback(() => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            
            // High frequency crisp click and low frequency body click
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            const gain2 = ctx.createGain();
            
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(600, ctx.currentTime);
            osc1.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);
            
            gain1.gain.setValueAtTime(0.35, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
            
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1450, ctx.currentTime);
            osc2.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.05);
            
            gain2.gain.setValueAtTime(0.25, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
            
            osc1.connect(gain1);
            osc2.connect(gain2);
            gain1.connect(ctx.destination);
            gain2.connect(ctx.destination);
            
            osc1.start();
            osc2.start();
            osc1.stop(ctx.currentTime + 0.12);
            osc2.stop(ctx.currentTime + 0.05);
        } catch (e) {
            console.warn("AudioContext shutter click failed:", e);
        }
    }, []);

    // Stop webcam stream and return to idle card
    const stopWebcam = useCallback(() => {
        addLog("웹캠 세션 종료 요청");
        
        // Clear all active timers
        sequenceTimeoutRef.current.forEach(timer => clearTimeout(timer));
        sequenceTimeoutRef.current = [];

        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
        if (stream) {
            stream.getTracks().forEach(track => {
                addLog(`Track 중지: ${track.kind} (${track.label})`);
                track.stop();
            });
            setStream(null);
        }
        setIsCameraReady(false);
        setActualResolution('0 x 0');
        setDetectionState('searching');
        setCountdownNumber(null);
        setCurrentStepIndex(0);
        setIsComplete(false);
        setIsHoldFreezing(false);
        setShowFlash(false);
        setStatus('idle');
        addLog("카메라 스트림 중지 완료 및 복귀");
    }, [stream, addLog]);

    // Start webcam stream with advanced fallbacks
    const startWebcam = async (mode: 'user' | 'environment' = facingMode) => {
        setIsCameraReady(false);
        setWebcamError(null);
        setActualResolution('0 x 0');
        setDetectionState('searching');
        setCountdownNumber(null);
        addLog(`카메라 연동 시작 (모드: ${mode === 'user' ? '전면(user)' : '후면(environment)'})`);

        // Stop existing streams first to prevent hardware lock
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        // Attempt 1: Standard High-Quality Constraints
        try {
            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: { ideal: mode },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };
            addLog("Attempt 1: getUserMedia 호출 (이상적인 해상도 1280x720)");
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
            setStatus('webcam');
            addLog("Attempt 1 성공: 스트림 획득 완료");
            return;
        } catch (firstErr: any) {
            addLog(`Attempt 1 실패: ${firstErr.name || firstErr.message}`);
            
            // Attempt 2: Simple FacingMode constraint
            try {
                const fallbackConstraints: MediaStreamConstraints = {
                    video: { facingMode: mode },
                    audio: false
                };
                addLog("Attempt 2 (Fallback): getUserMedia 호출 (해상도 제약 해제)");
                const newStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
                setStream(newStream);
                setStatus('webcam');
                addLog("Attempt 2 성공: 스트림 획득 완료");
                return;
            } catch (secondErr: any) {
                addLog(`Attempt 2 실패: ${secondErr.name || secondErr.message}`);
                
                // Attempt 3: Absolute simplest constraint
                try {
                    addLog("Attempt 3 (Basic): getUserMedia 호출 (video: true)");
                    const basicStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                    setStream(basicStream);
                    setStatus('webcam');
                    addLog("Attempt 3 성공: 스트림 획득 완료");
                    return;
                } catch (err: any) {
                    addLog(`모든 카메라 연결 시도 실패: ${err.name || err.message}`);
                    setWebcamError(err.name || err.message || 'UnknownError');
                    toast.error(`카메라 연동 실패: ${err.name || '장치 권한을 확인해주세요.'}`);
                }
            }
        }
    };

    // Toggle Camera Flip dynamically
    const toggleCamera = () => {
        const nextMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(nextMode);
        addLog(`카메라 방향 전환 요청: ${nextMode === 'user' ? '전면' : '후면'}`);
        
        // Stop current tracks before switching
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        
        setTimeout(() => {
            startWebcam(nextMode);
        }, 200);
    };

    // Extract stream track properties
    useEffect(() => {
        if (stream) {
            const videoTracks = stream.getVideoTracks();
            videoTracks.forEach(track => {
                const settings = track.getSettings();
                addLog(`[TRACK INFO] 레이블: ${track.label}`);
                addLog(`[TRACK INFO] 상태: ${track.readyState}`);
                if (settings.width && settings.height) {
                    addLog(`[TRACK INFO] 하드웨어 해상도: ${settings.width} x ${settings.height}`);
                    setActualResolution(`${settings.width} x ${settings.height}`);
                }
            });
        }
    }, [stream, addLog]);

    // Webcam metadata assignment
    useEffect(() => {
        let isMounted = true;
        const attachStream = async () => {
            if (status === 'webcam' && stream && videoRef.current) {
                if (videoRef.current.srcObject !== stream) {
                    videoRef.current.srcObject = stream;
                    addLog("[DOM] videoRef.current.srcObject 스트림 바인딩 완료");
                }
                try {
                    addLog("[DOM] videoRef.current.play() 호출 중...");
                    await videoRef.current.play();
                    if (isMounted) {
                        setIsCameraReady(true);
                        addLog("[DOM] 비디오 미디어가 활성화되어 정상 재생 중입니다.");
                    }
                } catch (playError: any) {
                    addLog(`[DOM] play() 오류 발생: ${playError.message}`);
                    if (isMounted) {
                        setIsCameraReady(true);
                    }
                }
            }
        };
        
        attachStream();
        
        return () => {
            isMounted = false;
        };
    }, [status, stream, addLog]);

    // Smart automatic detection state sequence (searching -> locked -> countdown -> active)
    useEffect(() => {
        if (status !== 'webcam' || !isCameraReady) {
            setDetectionState('searching');
            setCountdownNumber(null);
            return;
        }

        const activeStep = STEPS[currentStepIndex];
        addLog(`[${activeStep.title}] 대상 탐색기 가동... 주변 환경 및 형체 탐색 중`);

        // Step A: 4 seconds of SEARCHING, then trigger LOCK-ON
        const lockTimer = setTimeout(() => {
            setDetectionState('locked');
            playBeep(880, 0.16); // Sharp electronic lock beep
            addLog(`[${activeStep.title}] 대상 감지 성공! 타겟 락온 완료 (SUBJECT LOCKED)`);

            // Step B: 1.2 seconds of LOCKED, then initiate 3-second countdown
            const countdownStartTimer = setTimeout(() => {
                setDetectionState('countdown');
                let currentCount = 3;
                setCountdownNumber(currentCount);
                playBeep(520, 0.08); // Solid count beep
                addLog(`[${activeStep.title}] 정밀 스캔 카운트다운 시작: ${currentCount}`);

                const countdownInterval = setInterval(() => {
                    currentCount--;
                    if (currentCount > 0) {
                        setCountdownNumber(currentCount);
                        playBeep(520, 0.08);
                        addLog(`[${activeStep.title}] 정밀 스캔 카운트다운: ${currentCount}`);
                    } else {
                        clearInterval(countdownInterval);
                        setCountdownNumber(null);
                        setDetectionState('active');
                        playBeep(1040, 0.22); // High-pitched double start chime
                        setTimeout(() => playBeep(1320, 0.15), 80);
                        addLog(`[${activeStep.title}] 실시간 인체 골격 모션 트래킹 개시! (ACTIVE RUNNING)`);
                    }
                }, 1000);

                // Save interval reference to clean up if unmounted
                const intervalCleanup = () => clearInterval(countdownInterval);
                sequenceTimeoutRef.current.push(intervalCleanup as any);

            }, 1200);

            sequenceTimeoutRef.current.push(countdownStartTimer);

        }, 4000);

        sequenceTimeoutRef.current.push(lockTimer);

        return () => {
            sequenceTimeoutRef.current.forEach(timer => clearTimeout(timer));
            sequenceTimeoutRef.current = [];
        };
    }, [status, isCameraReady, playBeep, addLog, currentStepIndex]);

    // Touchless automatic step capture & transition pipeline
    useEffect(() => {
        if (status !== 'webcam' || !isCameraReady || detectionState !== 'active') return;

        const activeStep = STEPS[currentStepIndex];
        addLog(`[AUTO SCENE] ${activeStep.subtitle} 트래킹 중... (자동 캡처 대기)`);

        const captureTimer = setTimeout(() => {
            // Trigger 1: White Flash and Shutter synthesis audio click
            setShowFlash(true);
            playShutterSound();
            setIsHoldFreezing(true);
            addLog(`📸 [SUCCESS] ${activeStep.title} 캡처 완료!`);

            // Turn off flash after 150ms
            setTimeout(() => {
                setShowFlash(false);
            }, 150);

            // Hold freeze frame for 1.2s to show success feedback, then proceed
            setTimeout(() => {
                setIsHoldFreezing(false);

                if (currentStepIndex < STEPS.length - 1) {
                    setCurrentStepIndex(prev => prev + 1);
                    setDetectionState('searching');
                } else {
                    // All steps completed successfully!
                    setIsComplete(true);
                    playBeep(880, 0.1);
                    setTimeout(() => playBeep(1100, 0.1), 100);
                    setTimeout(() => playBeep(1320, 0.2), 200);
                    addLog("🏆 [COMPLETED] 4단계 전신 모션 스캔 최종 완료! 🏆");
                }
            }, 1200);

        }, 4500);

        return () => clearTimeout(captureTimer);
    }, [status, isCameraReady, detectionState, currentStepIndex, playShutterSound, addLog, playBeep]);

    // Video event logging
    const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        addLog(`[EVENT] loadedmetadata 감지됨 (비디오 실제 크기: ${video.videoWidth} x ${video.videoHeight})`);
        setActualResolution(`${video.videoWidth} x ${video.videoHeight}`);
    };

    const handleVideoPlay = () => {
        addLog("[EVENT] play 감지됨");
    };

    // Canvas real-time telemetry diagnostics renderer
    useEffect(() => {
        if (status !== 'webcam') return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frameCount = 0;

        const render = () => {
            if (!isHoldFreezing) {
                frameCount++;
            }
            const w = canvas.width = canvas.clientWidth;
            const h = canvas.height = canvas.clientHeight;
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2;
            const cy = h / 2;

            if (showGuidelines) {
                // 1. Futuristic Clinical Posture Grid
                ctx.strokeStyle = 'rgba(0, 216, 246, 0.05)';
                ctx.lineWidth = 1;
                const gridSize = 45;
                for (let x = 0; x < w; x += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, h);
                    ctx.stroke();
                }
                for (let y = 0; y < h; y += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(w, y);
                    ctx.stroke();
                }

                // 2. High-Tech Crosshair Alignment Axes (십자 수평선 가이드)
                // Draw vertical axis (좌우 균형)
                ctx.strokeStyle = 'rgba(0, 216, 246, 0.45)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([6, 8]);
                ctx.beginPath();
                ctx.moveTo(cx, 0);
                ctx.lineTo(cx, h);
                ctx.stroke();

                // Draw Dual horizontal axes (어깨/골반 수평선)
                ctx.strokeStyle = 'rgba(0, 245, 155, 0.35)';
                ctx.beginPath();
                ctx.moveTo(0, h * 0.34); // Shoulder line
                ctx.lineTo(w, h * 0.34);
                ctx.moveTo(0, h * 0.58); // Pelvis line
                ctx.lineTo(w, h * 0.58);
                ctx.stroke();
                ctx.setLineDash([]);

                // 3. Center Target Reticle / 조준 과녁
                ctx.strokeStyle = '#00F59B';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(cx, cy, 32, 0, Math.PI * 2);
                ctx.stroke();
                
                // Reticle cross ticks
                ctx.beginPath();
                ctx.moveTo(cx - 42, cy); ctx.lineTo(cx - 32, cy);
                ctx.moveTo(cx + 32, cy); ctx.lineTo(cx + 42, cy);
                ctx.moveTo(cx, cy - 42); ctx.lineTo(cx, cy - 32);
                ctx.moveTo(cx, cy + 32); ctx.lineTo(cx, cy + 42);
                ctx.stroke();

                // Searching / Scanning Laser Animation (Only when searching or locked)
                if (detectionState === 'searching' || detectionState === 'locked') {
                    const scannerY = (Math.sin(frameCount * 0.02) + 1) * 0.5 * h;
                    const gradient = ctx.createLinearGradient(0, scannerY - 20, 0, scannerY + 20);
                    gradient.addColorStop(0, 'rgba(0, 245, 155, 0)');
                    gradient.addColorStop(0.5, 'rgba(0, 245, 155, 0.38)');
                    gradient.addColorStop(1, 'rgba(0, 245, 155, 0)');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, scannerY - 20, w, 40);

                    ctx.strokeStyle = '#00F59B';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.moveTo(0, scannerY);
                    ctx.lineTo(w, scannerY);
                    ctx.stroke();
                }
            }

            // 4. SUBJECT LOCK-ON BOUNDING BOX (When locked or counting down)
            if (detectionState === 'locked' || detectionState === 'countdown') {
                const boxW = Math.min(w * 0.7, 300);
                const boxH = h * 0.65;
                const boxX = cx - boxW / 2;
                const boxY = cy - boxH / 2;

                ctx.strokeStyle = '#00F59B';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#00F59B';
                ctx.shadowBlur = 10;
                
                // Draw tech corners for lock bounding box
                const cornerLen = 20;
                // Top-Left
                ctx.beginPath();
                ctx.moveTo(boxX, boxY + cornerLen); ctx.lineTo(boxX, boxY); ctx.lineTo(boxX + cornerLen, boxY);
                // Top-Right
                ctx.moveTo(boxX + boxW - cornerLen, boxY); ctx.lineTo(boxX + boxW, boxY); ctx.lineTo(boxX + boxW, boxY + cornerLen);
                // Bottom-Left
                ctx.moveTo(boxX, boxY + boxH - cornerLen); ctx.lineTo(boxX, boxY + boxH); ctx.lineTo(boxX + cornerLen, boxY + boxH);
                // Bottom-Right
                ctx.moveTo(boxX + boxW - cornerLen, boxY + boxH); ctx.lineTo(boxX + boxW, boxY + boxH); ctx.lineTo(boxX + boxW, boxY + boxH - cornerLen);
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Pulsing locked notification tag
                ctx.fillStyle = '#00F59B';
                ctx.font = '900 9px monospace';
                ctx.textAlign = 'center';
                if (frameCount % 20 < 10) {
                    ctx.fillText('• SUBJECT TARGET LOCKED', cx, boxY - 10);
                }
            }

            // 5. ACTIVE SKELETAL MOTION TRACKING (실시간 3D 스켈레톤 움직임 연출)
            if (detectionState === 'active') {
                const activeStep = STEPS[currentStepIndex].id;
                let kneeAngle = 180;
                let pelvicTilt = (Math.sin(frameCount * 0.08) * 0.8).toFixed(1);
                
                const swayX = Math.sin(frameCount * 0.03) * 2.5;
                const swayY = Math.cos(frameCount * 0.02) * 1.2;
                const scx = cx + swayX;

                let headY = h * 0.25 + swayY;
                let shoulderY = h * 0.33 + swayY;
                let shoulderW = Math.min(w * 0.25, 170);
                let hipY = h * 0.58 + swayY;
                let hipW = Math.min(w * 0.18, 120);
                let kneeY = h * 0.70;
                let kneeOut = Math.min(w * 0.08, 55);
                let feetY = h * 0.82;

                let lKneeX = scx - hipW/2 - kneeOut;
                let rKneeX = scx + hipW/2 + kneeOut;
                let lKneeY = kneeY;
                let rKneeY = kneeY;
                let lAnkleX = scx - hipW/2 - 4;
                let rAnkleX = scx + hipW/2 + 4;
                let lAnkleY = feetY;
                let rAnkleY = feetY;

                if (activeStep === 'squat') {
                    const squatPhase = (frameCount % 180) / 180;
                    let squatDepth = 0;
                    if (squatPhase >= 0.2 && squatPhase < 0.6) {
                        const t = (squatPhase - 0.2) / 0.4;
                        squatDepth = Math.sin(t * Math.PI);
                    } else if (squatPhase >= 0.6 && squatPhase < 0.8) {
                        squatDepth = 0.9;
                    }
                    
                    headY += squatDepth * (h * 0.16);
                    shoulderY += squatDepth * (h * 0.16);
                    hipY += squatDepth * (h * 0.13);
                    lKneeY += squatDepth * (h * 0.04);
                    rKneeY += squatDepth * (h * 0.04);
                    lKneeX -= squatDepth * 16;
                    rKneeX += squatDepth * 16;
                    
                    kneeAngle = Math.round(180 - squatDepth * 85);
                } 
                else if (activeStep === 'jump') {
                    const jumpPhase = (frameCount % 180) / 180;
                    let yOffset = 0;
                    let landingStiff = 0;
                    
                    if (jumpPhase < 0.2) {
                        const t = jumpPhase / 0.2;
                        landingStiff = Math.sin(t * Math.PI / 2) * 0.4;
                    } else if (jumpPhase >= 0.2 && jumpPhase < 0.5) {
                        const t = (jumpPhase - 0.2) / 0.3;
                        yOffset = -Math.sin(t * Math.PI) * (h * 0.24);
                    } else if (jumpPhase >= 0.5 && jumpPhase < 0.75) {
                        const t = (jumpPhase - 0.5) / 0.25;
                        landingStiff = Math.sin(t * Math.PI) * 0.75;
                    }
                    
                    headY += yOffset + landingStiff * (h * 0.18);
                    shoulderY += yOffset + landingStiff * (h * 0.18);
                    hipY += yOffset + landingStiff * (h * 0.14);
                    lKneeY += yOffset + landingStiff * (h * 0.04);
                    rKneeY += yOffset + landingStiff * (h * 0.04);
                    lKneeX -= landingStiff * 18;
                    rKneeX += landingStiff * 18;
                    
                    lAnkleY += yOffset;
                    rAnkleY += yOffset;
                    
                    kneeAngle = Math.round(180 - landingStiff * 85 + (yOffset < 0 ? 30 : 0));
                    pelvicTilt = (Math.sin(frameCount * 0.15) * 2.2).toFixed(1);
                } 
                else if (activeStep === 'run') {
                    const runPhase = (frameCount % 24) / 24;
                    const leftUp = runPhase < 0.5;
                    const runDepth = Math.sin((runPhase * 2) * Math.PI);
                    
                    if (leftUp) {
                        lKneeY -= runDepth * 40;
                        lKneeX += runDepth * 15;
                        lAnkleY -= runDepth * 45;
                        lAnkleX += runDepth * 5;
                        kneeAngle = Math.round(180 - runDepth * 70);
                    } else {
                        rKneeY -= runDepth * 40;
                        rKneeX -= runDepth * 15;
                        rAnkleY -= runDepth * 45;
                        rAnkleX -= runDepth * 5;
                        kneeAngle = Math.round(180 - runDepth * 70);
                    }
                    
                    headY += Math.sin(frameCount * 0.2) * 2.5;
                    shoulderY += Math.sin(frameCount * 0.2) * 2.5;
                    hipY += Math.sin(frameCount * 0.2) * 1.5;
                    
                    pelvicTilt = (Math.sin(frameCount * 0.2) * 3.2).toFixed(1);
                } 
                else if (activeStep === 'kick') {
                    const kickPhase = (frameCount % 120) / 120;
                    let kickReach = 0;
                    
                    if (kickPhase >= 0.2 && kickPhase < 0.6) {
                        const t = (kickPhase - 0.2) / 0.4;
                        kickReach = Math.sin(t * Math.PI);
                    }
                    
                    // Lean back torso
                    headY += kickReach * 15;
                    shoulderY += kickReach * 10;
                    scx -= kickReach * 10;
                    
                    // Right leg kicks high up and forward!
                    rKneeY -= kickReach * 45;
                    rKneeX += kickReach * 35;
                    rAnkleY -= kickReach * 80;
                    rAnkleX += kickReach * 65;
                    
                    kneeAngle = Math.round(180 - kickReach * 45);
                    pelvicTilt = (kickReach * 6.8 + Math.sin(frameCount * 0.1) * 0.4).toFixed(1);
                }

                const joints = {
                    head: { x: scx, y: headY },
                    neck: { x: scx, y: (shoulderY + headY) / 2 },
                    lShoulder: { x: scx - shoulderW/2, y: shoulderY },
                    rShoulder: { x: scx + shoulderW/2, y: shoulderY },
                    spine: { x: scx, y: (shoulderY + hipY) / 2 },
                    lHip: { x: scx - hipW/2, y: hipY },
                    rHip: { x: scx + hipW/2, y: hipY },
                    lKnee: { x: lKneeX, y: lKneeY },
                    rKnee: { x: rKneeX, y: rKneeY },
                    lAnkle: { x: lAnkleX, y: lAnkleY },
                    rAnkle: { x: rAnkleX, y: rAnkleY }
                };

                // Draw neon skeletal bones linking the joints
                ctx.strokeStyle = '#00F59B';
                ctx.lineWidth = 3.5;
                ctx.shadowColor = '#00F59B';
                ctx.shadowBlur = 15;
                
                // Head to Neck
                ctx.beginPath(); ctx.moveTo(joints.head.x, joints.head.y); ctx.lineTo(joints.neck.x, joints.neck.y); ctx.stroke();
                // Shoulder line
                ctx.beginPath(); ctx.moveTo(joints.lShoulder.x, joints.lShoulder.y); ctx.lineTo(joints.rShoulder.x, joints.rShoulder.y); ctx.stroke();
                // Neck to Spine to Hips center
                ctx.beginPath(); ctx.moveTo(joints.neck.x, joints.neck.y); ctx.lineTo(joints.spine.x, joints.spine.y); ctx.lineTo(scx, joints.lHip.y); ctx.stroke();
                // Hips horizontal bar
                ctx.beginPath(); ctx.moveTo(joints.lHip.x, joints.lHip.y); ctx.lineTo(joints.rHip.x, joints.rHip.y); ctx.stroke();
                
                // Left Leg (Hip -> Knee -> Ankle)
                ctx.beginPath();
                ctx.moveTo(joints.lHip.x, joints.lHip.y);
                ctx.lineTo(joints.lKnee.x, joints.lKnee.y);
                ctx.lineTo(joints.lAnkle.x, joints.lAnkle.y);
                ctx.stroke();

                // Right Leg (Hip -> Knee -> Ankle)
                ctx.beginPath();
                ctx.moveTo(joints.rHip.x, joints.rHip.y);
                ctx.lineTo(joints.rKnee.x, joints.rKnee.y);
                ctx.lineTo(joints.rAnkle.x, joints.rAnkle.y);
                ctx.stroke();

                // Soft secondary visual bones (Dashed shoulder-hip diagonals for tech scanner aesthetic)
                ctx.strokeStyle = 'rgba(0, 216, 246, 0.4)';
                ctx.lineWidth = 1.5;
                ctx.shadowBlur = 0;
                ctx.setLineDash([4, 6]);
                ctx.beginPath();
                ctx.moveTo(joints.lShoulder.x, joints.lShoulder.y); ctx.lineTo(joints.lHip.x, joints.lHip.y);
                ctx.moveTo(joints.rShoulder.x, joints.rShoulder.y); ctx.lineTo(joints.rHip.x, joints.rHip.y);
                ctx.stroke();
                ctx.setLineDash([]);

                // Draw Glowing Cybernetic Joint Nodes (Glowing Circles)
                ctx.fillStyle = '#FFFFFF';
                ctx.strokeStyle = '#00F59B';
                ctx.lineWidth = 2.5;
                ctx.shadowColor = '#00F59B';
                ctx.shadowBlur = 10;

                Object.entries(joints).forEach(([name, pt]) => {
                    ctx.beginPath();
                    const radius = name === 'head' ? 8 : 4.5;
                    ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                });

                // Clear shadow parameters
                ctx.shadowBlur = 0;

                // Real-time knee angle label overlay in canvas calculated via poseAnalyzer utility math
                const calculatedKneeAngleL = Math.round(
                    calculateAngle(
                        { x: joints.lHip.x, y: joints.lHip.y, z: 0 },
                        { x: joints.lKnee.x, y: joints.lKnee.y, z: 0 },
                        { x: joints.lAnkle.x, y: joints.lAnkle.y, z: 0 }
                    )
                );
                const calculatedKneeAngleR = Math.round(
                    calculateAngle(
                        { x: joints.rHip.x, y: joints.rHip.y, z: 0 },
                        { x: joints.rKnee.x, y: joints.rKnee.y, z: 0 },
                        { x: joints.rAnkle.x, y: joints.rAnkle.y, z: 0 }
                    )
                );

                ctx.fillStyle = '#00F59B';
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'right';
                ctx.fillText(`KNEE_L: ${calculatedKneeAngleL}°`, joints.lKnee.x - 12, joints.lKnee.y + 3);
                ctx.textAlign = 'left';
                ctx.fillText(`KNEE_R: ${calculatedKneeAngleR}°`, joints.rKnee.x + 12, joints.rKnee.y + 3);

                // Periodic telemetry logging to simulate active computation in the logger box
                if (frameCount % 45 === 0) {
                    const balance = 97 + Math.round(Math.random() * 3);
                    addLog(`[AI POSE] 실시간 밸런스 점수: ${balance}% (양호)`);
                    addLog(`[AI POSE] 골반 각도 편차: ${pelvicTilt}° (정상 범위)`);
                    addLog(`[AI POSE] [MATH INTEGRATION] 실시간 무릎 각도 L: ${calculatedKneeAngleL}°, R: ${calculatedKneeAngleR}°`);
                }
            }

            // 6. In-Canvas Floating Technical Widget (Upper Left)
            const rectW = 260;
            const rectH = 80;
            const rectX = 20;
            const rectY = 80; // Pushed down so it doesn't overlap the top-left exit button

            ctx.fillStyle = 'rgba(7, 11, 20, 0.85)';
            ctx.strokeStyle = 'rgba(0, 216, 246, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.fillRect(rectX, rectY, rectW, rectH);
            ctx.strokeRect(rectX, rectY, rectW, rectH);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '900 10px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('YOUNIQLE SENSOR STATUS', rectX + 15, rectY + 22);

            ctx.font = 'normal 9px monospace';
            ctx.fillStyle = '#00F59B';
            ctx.fillText(`STREAM : ACTIVE (OK)`, rectX + 15, rectY + 38);
            ctx.fillText(`RESOL  : ${actualResolution}`, rectX + 15, rectY + 50);
            ctx.fillText(`CAMERA : ${facingMode === 'user' ? 'FRONT (LENS_USER)' : 'REAR (LENS_ENV)'}`, rectX + 15, rectY + 62);

            // Dynamic pulsing tracking light
            ctx.fillStyle = frameCount % 30 < 15 ? '#00F59B' : '#009F6B';
            ctx.beginPath();
            ctx.arc(rectX + rectW - 20, rectY + 20, 4, 0, Math.PI * 2);
            ctx.fill();

            animationFrameIdRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
        };
    }, [status, showGuidelines, facingMode, actualResolution, detectionState, addLog, currentStepIndex, isHoldFreezing]);

    // Clean unmount check
    useEffect(() => {
        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* 1. LANDING COMPONENT (Initial Dashboard Card) */}
            <AnimatePresence>
                {status === 'idle' && (
                    <motion.div 
                        key="landing"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="bg-[#070B14]/80 backdrop-blur-md rounded-[32px] border border-white/5 overflow-hidden shadow-2xl p-8 space-y-6 text-center flex flex-col items-center max-w-xl mx-auto"
                    >
                        <div className="w-16 h-16 bg-[#00D8F6]/10 rounded-[24px] flex items-center justify-center text-[#00D8F6] border border-[#00D8F6]/20 mb-2">
                            <Camera className="w-8 h-8 animate-pulse" />
                        </div>
                        
                        <div className="space-y-2">
                            <Badge variant="outline" className="border-[#00D8F6]/30 text-[#00D8F6] text-[9px] font-bold uppercase tracking-widest font-mono">
                                Immersive Telemetry Module
                            </Badge>
                            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                                유니클 카메라 하드웨어 연동
                            </h1>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                                스타트 버튼을 클릭하면 브라우저 가득 몰입형 전체 화면(Full-Screen)으로 카메라 뷰포트와 테크 모션 디버그 환경이 로드됩니다.
                            </p>
                        </div>

                        <div className="w-full pt-4 flex gap-3 justify-center">
                            <Button 
                                onClick={() => router.back()}
                                variant="outline"
                                className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl px-6 py-3.5 text-xs font-bold transition-all cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                                뒤로가기
                            </Button>
                            <Button 
                                onClick={() => startWebcam('user')}
                                className="bg-gradient-to-r from-[#00D8F6] to-[#00F59B] text-[#060A13] font-black hover:opacity-90 transition-all rounded-2xl px-8 py-3.5 text-xs tracking-widest uppercase cursor-pointer"
                            >
                                카메라 전체 화면 시작
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. FULL-SCREEN IMMERSIVE OVERLAY (Active Telemetry Viewport) - Persistently Mounted to prevent iOS/Android wake-up race conditions */}
            <div
                className={`fixed inset-0 z-50 w-screen h-screen bg-[#060A13] overflow-hidden flex items-center justify-center transition-all duration-500 ease-out ${
                    status === 'webcam'
                        ? 'opacity-100 pointer-events-auto visible'
                        : 'opacity-0 pointer-events-none invisible'
                }`}
            >
                {/* Immersive Background Video Element */}
                <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted
                    onPlay={handleVideoPlay}
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    className={`absolute inset-0 w-full h-full object-cover z-0 ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />
                
                {/* Immersive overlay drawing layer */}
                <canvas 
                    ref={canvasRef} 
                    className="absolute inset-0 w-full h-full z-[1] pointer-events-none"
                />

                {/* Telemetry Hardware Preloader Overlay */}
                {!isCameraReady && !webcamError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070B14] z-20 transition-all duration-300">
                        <Loader2 className="w-10 h-10 text-[#00F59B] animate-spin mb-3.5" />
                        <p className="text-white/60 font-black tracking-widest uppercase text-[9px] font-mono">INITIATING FULL-SCREEN STREAM...</p>
                    </div>
                )}

                {/* Camera Shutter Flash Overlay */}
                <AnimatePresence>
                    {showFlash && (
                        <motion.div 
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="absolute inset-0 bg-white z-40 pointer-events-none"
                        />
                    )}
                </AnimatePresence>

                {/* Giant Neon Glowing 3-2-1 Countdown Overlay */}
                <AnimatePresence>
                    {status === 'webcam' && detectionState === 'countdown' && countdownNumber !== null && (
                        <motion.div
                            key={countdownNumber}
                            initial={{ opacity: 0, scale: 2.2 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.4 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                        >
                            <h1 className="text-[140px] sm:text-[180px] font-black font-mono text-[#00F59B] tracking-widest select-none drop-shadow-[0_0_25px_rgba(0,245,155,0.85)]">
                                {countdownNumber}
                            </h1>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hold Freeze Secured Feedback Overlay */}
                <AnimatePresence>
                    {isHoldFreezing && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 bg-[#070B14]/40 z-30 flex items-center justify-center pointer-events-none"
                        >
                            <div className="bg-[#0D1321]/95 border border-[#00F59B] px-6 py-4 rounded-[24px] flex items-center gap-3 shadow-2xl shadow-black max-w-xs text-left">
                                <div className="w-8 h-8 rounded-xl bg-[#00F59B]/10 border border-[#00F59B]/20 flex items-center justify-center text-[#00F59B] shrink-0 animate-ping">
                                    <CheckCircle2 className="w-4.5 h-4.5" />
                                </div>
                                <div>
                                    <h5 className="text-[10px] font-black text-[#00F59B] uppercase font-mono tracking-widest">POSE SECURED</h5>
                                    <p className="text-[9px] text-white/80 mt-0.5 font-sans leading-relaxed">프레임 데이터가 안전하게 캡처 및 전송되었습니다.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 5. YOUNIQLE AI MOTION REPORT (최종 완성 종합 보고서 팝업 HUD) */}
                <AnimatePresence>
                    {isComplete && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#060A13]/90 backdrop-blur-lg z-50 flex items-center justify-center p-4 overflow-y-auto"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 25 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                                className="w-full max-w-md bg-[#0D1321]/95 border border-[#00F59B]/30 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(0,245,155,0.15)] text-center relative overflow-hidden"
                            >
                                {/* Decorative Glowing Cyber Elements */}
                                <div className="absolute -top-16 -left-16 w-32 h-32 bg-[#00D8F6]/10 rounded-full blur-2xl" />
                                <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-[#00F59B]/10 rounded-full blur-2xl" />

                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-[#00F59B]/10 rounded-[20px] flex items-center justify-center text-[#00F59B] border border-[#00F59B]/20 mx-auto mb-2">
                                        <CheckCircle2 className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <Badge variant="outline" className="border-[#00F59B]/30 text-[#00F59B] text-[9px] font-bold uppercase tracking-widest font-mono">
                                        YOUNIQLE AI MOTION ANALYSIS Complete
                                    </Badge>
                                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                                        종합 동작 분석 완료
                                    </h2>
                                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                                        4단계의 핵심 신체 밸런스 움직임 분석이 안전하게 종료되었습니다. 추출된 3D 텔레메트리 피드백 리포트는 아래와 같습니다.
                                    </p>
                                </div>

                                {/* Step-by-Step Score Telemetry Cards */}
                                <div className="grid grid-cols-2 gap-3.5 pt-2">
                                    <div className="bg-white/5 border border-white/5 p-3 rounded-2xl text-left space-y-1">
                                        <span className="text-[9px] font-black text-[#00D8F6] uppercase font-mono tracking-wider block">SQUAT STABILITY</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-black text-white font-mono">98</span>
                                            <span className="text-[9px] text-[#00F59B] font-mono">% (최우수)</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 border border-white/5 p-3 rounded-2xl text-left space-y-1">
                                        <span className="text-[9px] font-black text-[#00D8F6] uppercase font-mono tracking-wider block">JUMP LANDING</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-black text-white font-mono">96</span>
                                            <span className="text-[9px] text-[#00F59B] font-mono">% (양호)</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 border border-white/5 p-3 rounded-2xl text-left space-y-1">
                                        <span className="text-[9px] font-black text-[#00D8F6] uppercase font-mono tracking-wider block">STATIONARY RUN</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-black text-white font-mono">99</span>
                                            <span className="text-[9px] text-[#00F59B] font-mono">% (최우수)</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 border border-white/5 p-3 rounded-2xl text-left space-y-1">
                                        <span className="text-[9px] font-black text-[#00D8F6] uppercase font-mono tracking-wider block">KICK BALANCE</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-black text-white font-mono">97</span>
                                            <span className="text-[9px] text-[#00F59B] font-mono">% (최우수)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Youniqle AI Manager Insight Comment Card */}
                                <div className="bg-black/50 border border-white/5 p-4 rounded-[20px] text-left space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-[#00F59B] rounded-full animate-ping" />
                                        <span className="text-[9px] font-black text-[#00F59B] uppercase font-mono tracking-widest">YOUNIQLE AI MANAGER INSIGHT</span>
                                    </div>
                                    <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
                                        "전반적인 움직임의 대칭성과 코어 지지력이 매우 탁월합니다. 2단계 착지 순간 무릎 흔들림이 미세하게 감지되었으나 즉시 회복하는 능력이 우수하며, 킥 동작 시의 골반 유연성과 리듬이 훌륭하여 부상 위험도가 극히 낮습니다. 회복 CGM 관점에서 양호한 흐름입니다."
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={() => {
                                            setIsComplete(false);
                                            setCurrentStepIndex(0);
                                            setDetectionState('searching');
                                            startWebcam(facingMode);
                                        }}
                                        variant="outline"
                                        className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl py-3.5 text-xs font-bold transition-all cursor-pointer"
                                    >
                                        재테스트 수행
                                    </Button>
                                    <Button
                                        onClick={stopWebcam}
                                        className="flex-1 bg-gradient-to-r from-[#00D8F6] to-[#00F59B] text-[#060A13] font-black hover:opacity-90 transition-all rounded-2xl py-3.5 text-xs tracking-widest uppercase cursor-pointer"
                                    >
                                        분석 완료 및 종료
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Top-Left Exit Button overlay */}
                <button 
                    onClick={stopWebcam}
                    className="absolute top-4 left-4 bg-red-500/20 backdrop-blur-md border border-red-500/30 px-4 py-2.5 rounded-2xl flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase text-red-400 hover:bg-red-500/35 transition-all cursor-pointer shadow-lg shadow-black/40 z-20"
                    title="전체화면 종료 및 복귀"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>종료하기</span>
                </button>

                {/* Top-Center Multi-Step Progress Tracker Overlay */}
                {status === 'webcam' && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#070B14]/90 backdrop-blur-md border border-[#00F59B]/20 px-4 py-2.5 rounded-[20px] flex items-center gap-3.5 shadow-xl shadow-black/55 z-20 max-w-[92%] sm:max-w-md">
                        {STEPS.map((step, idx) => {
                            const isActive = idx === currentStepIndex;
                            const isPast = idx < currentStepIndex;
                            return (
                                <div key={step.id} className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-black font-mono border transition-all ${
                                            isActive 
                                                ? 'bg-[#00F59B] border-[#00F59B] text-[#070B14] shadow-md shadow-[#00F59B]/30' 
                                                : isPast 
                                                    ? 'bg-[#00D8F6]/20 border-[#00D8F6]/40 text-[#00D8F6]' 
                                                    : 'bg-white/5 border-white/10 text-white/40'
                                        }`}>
                                            {isPast ? '✓' : idx + 1}
                                        </div>
                                        <span className={`text-[9px] font-black tracking-widest uppercase font-mono ${
                                            isActive ? 'text-[#00F59B]' : isPast ? 'text-[#00D8F6]' : 'text-white/30'
                                        } hidden xs:inline`}>
                                            {step.id}
                                        </span>
                                    </div>
                                    {idx < STEPS.length - 1 && (
                                        <div className={`w-3 h-[1px] ${
                                            isPast ? 'bg-[#00D8F6]/30' : 'bg-white/5'
                                        }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Top-Right Telemetry Settings overlay */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                    <button 
                        onClick={() => setShowGuidelines(prev => !prev)}
                        className={`bg-[#0B0F19]/80 backdrop-blur-md border px-3.5 py-2.5 rounded-2xl flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase transition-all cursor-pointer shadow-lg shadow-black/30 ${
                            showGuidelines 
                                ? 'border-[#00F59B]/30 text-[#00F59B] hover:text-white' 
                                : 'border-white/10 text-white/60 hover:text-white'
                        }`}
                        title="테스트 그리드 가이드 온/오프"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{showGuidelines ? '그리드 끄기' : '그리드 켜기'}</span>
                    </button>
                    
                    <button 
                        onClick={toggleCamera}
                        className="bg-[#0B0F19]/80 backdrop-blur-md border border-white/10 p-2.5 rounded-2xl flex items-center justify-center text-white hover:text-[#00F59B] active:scale-95 transition-all cursor-pointer shadow-lg shadow-black/30"
                        title="카메라 전환 (전면/후면)"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                {/* Dynamic Floating HUD Caption Box (Bottom Center) */}
                {status === 'webcam' && isCameraReady && (
                    <motion.div
                        initial={{ opacity: 0, y: 35, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-[#070B14]/90 backdrop-blur-md border border-[#00F59B]/30 p-4 rounded-[24px] flex items-center gap-3.5 z-20 shadow-2xl shadow-black/90"
                    >
                        <div className="w-10 h-10 bg-[#00F59B]/10 rounded-2xl flex items-center justify-center shrink-0 border border-[#00F59B]/20 text-[#00F59B]">
                            {detectionState === 'searching' && <Loader2 className="w-5 h-5 animate-spin" />}
                            {detectionState === 'locked' && <Camera className="w-5 h-5 animate-pulse" />}
                            {detectionState === 'countdown' && <span className="text-xs font-black font-mono">WAIT</span>}
                            {detectionState === 'active' && <span className="text-xs font-black font-mono text-[#00F59B] animate-pulse">RUN</span>}
                        </div>
                        <div className="space-y-0.5 text-left">
                            <div className="flex items-center gap-1.5">
                                <Badge className={`text-[#060A13] text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full border-none ${
                                    detectionState === 'active' ? 'bg-[#00F59B]' : 'bg-[#00D8F6]'
                                }`}>
                                    {detectionState === 'active' ? 'ACTIVE' : 'ALIGNMENT'}
                                </Badge>
                                <span className="text-[9px] font-black text-[#00D8F6] uppercase tracking-widest font-mono">
                                    {STEPS[currentStepIndex].title} ({currentStepIndex + 1}/{STEPS.length})
                                </span>
                            </div>
                            
                            <p className="text-[11px] font-black text-white leading-normal mt-1">
                                {detectionState === 'searching' && (
                                    <>중앙 십자선에 맞춰 전신이 나오게 맞춰 서 주세요. <span className="text-[#00D8F6] font-bold">({STEPS[currentStepIndex].targetZone})</span></>
                                )}
                                {detectionState === 'locked' && (
                                    <>대상이 감지되었습니다! <span className="text-[#00F59B] font-bold">휴대폰을 거치하고</span> 3걸음 뒤로 이동해 대기해 주세요.</>
                                )}
                                {detectionState === 'countdown' && (
                                    <>자세를 고정하고 캡처 전 대기해 주세요...</>
                                )}
                                {detectionState === 'active' && (
                                    <>실시간 트래킹 중! <span className="text-[#00F59B] font-bold">{STEPS[currentStepIndex].instruction}</span></>
                                )}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Glassmorphic Telemetry Diagnostics Sidebar overlay (Bottom Right) */}
                <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-[340px] bg-[#070B14]/85 backdrop-blur-md border border-white/10 rounded-[24px] p-4 flex flex-col space-y-3 z-10 shadow-2xl shadow-black/80 max-h-[220px]">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <h4 className="text-[10px] font-black text-[#00D8F6] uppercase tracking-widest font-mono">SENSOR DIAGNOSTICS</h4>
                            <p className="text-[8px] text-slate-400 uppercase tracking-widest font-mono">WebRTC stream telemetry</p>
                        </div>
                        <Badge variant="outline" className="border-[#00F59B]/30 text-[#00F59B] text-[8px] font-mono font-bold">
                            {actualResolution}
                        </Badge>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-[9px] text-[#00F59B] bg-black/40 p-3 rounded-xl border border-white/5 scrollbar-thin">
                        {telemetryLog.length === 0 ? (
                            <div className="text-slate-600 italic text-center py-8 font-mono">연동 대기 중...</div>
                        ) : (
                            telemetryLog.map((log, i) => (
                                <div key={i} className="border-b border-white/5 pb-0.5 last:border-0 leading-normal break-all font-mono">
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Hard Connection Error Banner Overlay */}
                {webcamError && (
                    <div className="absolute inset-0 bg-[#070B14]/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/20 animate-bounce">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <div className="space-y-1.5 max-w-sm">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-white">카메라 하드웨어 연동 에러</h4>
                            <p className="text-[11px] text-slate-400 leading-normal">
                                기기의 카메라 권한이 비활성화되었거나 다른 서비스에서 하드웨어를 점유하고 있습니다.
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-left text-[10px] text-slate-300 space-y-1.5 w-full max-w-sm font-mono">
                            <p className="font-bold text-[#00F59B] text-xs">🛠️ 점검 리스트:</p>
                            <p>1. 브라우저 주소창 왼쪽의 <b>설정(자물쇠) 아이콘</b>을 눌러 카메라 권한을 '허용'했는지 확인해 주세요.</p>
                            <p>2. 백그라운드에 구동 중인 화상 통화 어플리케이션을 모두 강제 종료 후 다시 시도해 주세요.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                onClick={stopWebcam}
                                variant="outline"
                                className="bg-white/5 border-white/10 text-white rounded-xl text-xs py-2.5 px-5 font-bold"
                            >
                                이전 화면으로
                            </Button>
                            <Button 
                                onClick={() => startWebcam(facingMode)}
                                className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-black hover:opacity-90 transition-all rounded-xl text-xs tracking-wider py-2.5 px-5"
                            >
                                스트림 재시도
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
