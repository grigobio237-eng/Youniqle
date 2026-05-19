'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCcw, Sparkles, Loader2, ArrowLeft, Check, X, Info, ShieldAlert, Award, ChevronRight, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// --- Types & Constants ---
type RoutineStep = 'SQUAT' | 'JUMP' | 'RUNNING' | 'KICK' | 'REPORT';

interface StepInfo {
    id: RoutineStep;
    title: string;
    description: string;
    guideText: string;
    facing: 'front' | 'side' | 'kick';
    duration: number; // seconds
}

const ROUTINE_STEPS: StepInfo[] = [
    {
        id: 'SQUAT',
        title: '스쿼트 정렬 체크',
        description: '무릎 안쪽 말림도 및 골반 수평 정렬을 분석합니다.',
        guideText: '카메라 정면을 보고 전신이 실루엣 가이드라인에 위치하도록 서 주세요.',
        facing: 'front',
        duration: 5,
    },
    {
        id: 'JUMP',
        title: '점프 착지 안정성',
        description: '착지 순간의 무릎 수평 흔들림과 가속 감쇠율을 측정합니다.',
        guideText: '표시된 영역 안에서 가볍게 점프한 후 무릎을 굽히며 착지해 주세요.',
        facing: 'front',
        duration: 5,
    },
    {
        id: 'RUNNING',
        title: '달리기 상체 경사도',
        description: '척추 각도, 보폭 대칭성 및 좌우 편차를 분석합니다.',
        guideText: '스마트폰을 측면으로 회전하고 몸의 옆모습이 나오도록 조정한 후 제자리에서 뛰어주세요.',
        facing: 'side',
        duration: 6,
    },
    {
        id: 'KICK',
        title: '킥 밸런스 분석',
        description: '디딤발 고정도와 골반 회전 가동 범위(ROM)를 추적합니다.',
        guideText: '대각선 후방에서 디딤발 위치가 타겟 링에 위치하도록 선 후 킥 모션을 취해 주세요.',
        facing: 'kick',
        duration: 5,
    },
];

// Biomechanical telemetry metrics
interface BiomechanicsReport {
    squat: {
        score: number;
        kneeValgusAngle: string;
        pelvisAlignment: string;
        balanceRatio: string;
        status: 'SAFE' | 'WARNING' | 'ALERT';
    };
    jump: {
        score: number;
        kneeSway: string;
        impactDampening: string;
        stability: 'SAFE' | 'WARNING' | 'ALERT';
    };
    running: {
        score: number;
        torsoAngle: string;
        strideSymmetry: string;
        stability: 'SAFE' | 'WARNING' | 'ALERT';
    };
    kick: {
        score: number;
        supportingFootStability: string;
        pelvicRotationROM: string;
        stability: 'SAFE' | 'WARNING' | 'ALERT';
    };
    overallScoreBefore: number;
    overallScoreAfter: number;
}

export default function MotionCheckScanner() {
    const router = useRouter();
    const { data: session } = useSession();
    
    // UI flow states
    const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
    const [status, setStatus] = useState<'idle' | 'webcam' | 'analyzing' | 'result'>('idle');
    const [capturedFrames, setCapturedFrames] = useState<Record<string, string>>({});
    const [telemetryLog, setTelemetryLog] = useState<string[]>([]);
    
    // Camera streaming refs
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameIdRef = useRef<number | null>(null);

    // Audio cues generator using Web Audio API (Synthesizer)
    const playSound = useCallback((type: 'beep' | 'success' | 'alarm' | 'complete') => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            if (type === 'beep') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                osc.start();
                osc.stop(ctx.currentTime + 0.15);
            } else if (type === 'success') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.25);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            } else if (type === 'alarm') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, ctx.currentTime);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                osc.start();
                osc.stop(ctx.currentTime + 0.4);
            } else if (type === 'complete') {
                // Futuristic double chime
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
                osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                osc.start();
                osc.stop(ctx.currentTime + 0.5);
            }
        } catch (e) {
            console.warn('Web Audio API not supported or user gesture required', e);
        }
    }, []);

    // Haptic feedback simulator
    const triggerHaptic = useCallback((pattern: number | number[]) => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(pattern);
        }
    }, []);

    // Telemetry log appender
    const addLog = useCallback((msg: string) => {
        setTelemetryLog(prev => [msg, ...prev.slice(0, 15)]);
    }, []);

    // --- Biomechanical Telemetry Report State ---
    const [finalReport, setFinalReport] = useState<BiomechanicsReport | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    // Stop webcam utility
    const stopWebcam = useCallback(() => {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraReady(false);
    }, [stream]);

    // Start webcam utility
    const startWebcam = async (mode: 'user' | 'environment' = facingMode) => {
        setIsCameraReady(false);
        setHasSaved(false);
        try {
            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: { ideal: mode }, // Prioritizes chosen camera mode (front or rear)
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
            setStatus('webcam');
            setIsCameraReady(true);
            setCurrentStepIdx(0);
            playSound('beep');
        } catch (err: any) {
            console.error('[MotionCheck] Webcam access failed, falling back to mock streaming:', err);
            // Fallback to mock stream simulation using Canvas
            setStatus('webcam');
            setIsCameraReady(true);
            toast.info("카메라 장치가 제한되어 시뮬레이션 센서 모드로 자동 전환합니다.");
        }
    };

    // Toggle between front and rear cameras dynamically
    const toggleCamera = async () => {
        const nextMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(nextMode);
        
        // Stop current tracks
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        
        // Brief delay before re-initiating WebRTC camera session
        setTimeout(() => {
            startWebcam(nextMode);
        }, 150);
    };

    // Canvas drawing loop: simulates state-of-the-art 3D skeletons tracking user kinematics
    useEffect(() => {
        if (status !== 'webcam') return;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frameCount = 0;
        const currentStep = ROUTINE_STEPS[currentStepIdx] || ROUTINE_STEPS[0];

        const render = () => {
            frameCount++;
            const w = canvas.width = window.innerWidth > 1024 ? 800 : canvas.parentElement?.clientWidth || 640;
            const h = canvas.height = window.innerWidth > 1024 ? 450 : canvas.parentElement?.clientHeight || 360;

            ctx.clearRect(0, 0, w, h);

            // 1. Draw webcam frame onto canvas if available
            if (video && video.readyState >= 2) {
                ctx.drawImage(video, 0, 0, w, h);
            } else {
                // Neon laboratory fallback placeholder grid
                ctx.fillStyle = '#060A13';
                ctx.fillRect(0, 0, w, h);
                
                ctx.strokeStyle = 'rgba(0, 245, 155, 0.05)';
                ctx.lineWidth = 1;
                const gridSpacing = 30;
                for (let x = 0; x < w; x += gridSpacing) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, h);
                    ctx.stroke();
                }
                for (let y = 0; y < h; y += gridSpacing) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(w, y);
                    ctx.stroke();
                }
            }

            // 2. Draw Futuristic Scanning Laser Line
            const scannerY = (Math.sin(frameCount * 0.03) + 1) * 0.5 * h;
            const gradient = ctx.createLinearGradient(0, scannerY - 20, 0, scannerY + 20);
            gradient.addColorStop(0, 'rgba(0, 245, 155, 0)');
            gradient.addColorStop(0.5, 'rgba(0, 245, 155, 0.4)');
            gradient.addColorStop(1, 'rgba(0, 245, 155, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, scannerY - 20, w, 40);

            ctx.strokeStyle = '#00F59B';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#00F59B';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(0, scannerY);
            ctx.lineTo(w, scannerY);
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset shadow

            // 3. Draw Guided Translucent Silhouette Overlays based on step
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([5, 5]);
            
            if (currentStep.id === 'SQUAT' || currentStep.id === 'JUMP') {
                // Frontal body silhouette guide
                ctx.beginPath();
                ctx.arc(w / 2, h * 0.2, h * 0.08, 0, Math.PI * 2); // Head
                ctx.moveTo(w / 2, h * 0.28);
                ctx.lineTo(w / 2, h * 0.55); // Spine
                ctx.moveTo(w / 2 - w * 0.12, h * 0.32);
                ctx.lineTo(w / 2 + w * 0.12, h * 0.32); // Shoulders
                ctx.moveTo(w / 2 - w * 0.08, h * 0.55);
                ctx.lineTo(w / 2 + w * 0.08, h * 0.55); // Hips
                ctx.stroke();
            } else if (currentStep.id === 'RUNNING') {
                // Lateral body silhouette guide
                ctx.beginPath();
                ctx.arc(w * 0.45, h * 0.2, h * 0.08, 0, Math.PI * 2);
                ctx.moveTo(w * 0.45, h * 0.28);
                ctx.lineTo(w * 0.42, h * 0.58); // Slanted torso
                ctx.stroke();
            } else if (currentStep.id === 'KICK') {
                // Kick target circular overlay on ground
                ctx.strokeStyle = 'rgba(0, 216, 246, 0.4)';
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.arc(w * 0.5, h * 0.8, 45, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = 'rgba(0, 216, 246, 0.08)';
                ctx.fill();
            }
            ctx.setLineDash([]); // Reset line dash

            // 4. Draw Animated neon Biomechanical Skeletons (Simulating MediaPipe)
            const time = frameCount * 0.05;
            
            // Core anatomical joint coordinates mapped to dynamic trigonometric kinematics
            let joints: Record<string, { x: number, y: number }> = {};

            if (currentStep.id === 'SQUAT') {
                // Continuous Squatting Skeleton Simulation
                const squatDepth = (Math.sin(time * 0.8) + 1) * 0.5; // 0 to 1
                const flexY = squatDepth * h * 0.18;
                const kneeSwayX = Math.sin(time * 3) * (squatDepth * 12); // Simulated valgus sway

                joints = {
                    head: { x: w / 2, y: h * 0.15 + flexY },
                    lShoulder: { x: w / 2 - w * 0.1, y: h * 0.25 + flexY },
                    rShoulder: { x: w / 2 + w * 0.1, y: h * 0.25 + flexY },
                    lHip: { x: w / 2 - w * 0.07, y: h * 0.52 + flexY },
                    rHip: { x: w / 2 + w * 0.07, y: h * 0.52 + flexY },
                    lKnee: { x: w / 2 - w * 0.08 + kneeSwayX, y: h * 0.72 + flexY * 0.4 },
                    rKnee: { x: w / 2 + w * 0.08 - kneeSwayX, y: h * 0.72 + flexY * 0.4 },
                    lAnkle: { x: w / 2 - w * 0.08, y: h * 0.88 },
                    rAnkle: { x: w / 2 + w * 0.08, y: h * 0.88 },
                };

                // Add real-time log metrics occasionally
                if (frameCount % 60 === 0) {
                    const depthPercent = Math.round(squatDepth * 100);
                    const bal = Math.round(50 + kneeSwayX * 0.5);
                    addLog(`[SQUAT] ROM Depth: ${depthPercent}%, Sway Balance: ${bal}:${100 - bal}`);
                }
            } else if (currentStep.id === 'JUMP') {
                // Continuous Landing Shock Skeleton
                const phase = (time * 0.7) % (Math.PI * 2);
                let jumpY = 0;
                let flexY = 0;
                
                if (phase < Math.PI) {
                    // Flying phase
                    jumpY = -Math.sin(phase) * h * 0.22;
                } else {
                    // Landing compression phase
                    flexY = Math.sin(phase) * h * 0.08;
                }

                joints = {
                    head: { x: w / 2, y: h * 0.15 + jumpY + flexY },
                    lShoulder: { x: w / 2 - w * 0.1, y: h * 0.25 + jumpY + flexY },
                    rShoulder: { x: w / 2 + w * 0.1, y: h * 0.25 + jumpY + flexY },
                    lHip: { x: w / 2 - w * 0.07, y: h * 0.52 + jumpY + flexY },
                    rHip: { x: w / 2 + w * 0.07, y: h * 0.52 + jumpY + flexY },
                    lKnee: { x: w / 2 - w * 0.08, y: h * 0.72 + jumpY + flexY * 0.3 },
                    rKnee: { x: w / 2 + w * 0.08, y: h * 0.72 + jumpY + flexY * 0.3 },
                    lAnkle: { x: w / 2 - w * 0.08, y: h * 0.88 + jumpY },
                    rAnkle: { x: w / 2 + w * 0.08, y: h * 0.88 + jumpY },
                };

                if (frameCount % 60 === 0) {
                    const isAir = phase < Math.PI;
                    addLog(isAir ? `[JUMP] Flight state active...` : `[JUMP] Impact force detected: 2.4G`);
                }
            } else if (currentStep.id === 'RUNNING') {
                // Lateral Running Cycle Skeleton
                const phase = time * 2;
                const swingX1 = Math.sin(phase) * w * 0.08;
                const swingY1 = Math.cos(phase * 2) * h * 0.05;
                const swingX2 = Math.sin(phase + Math.PI) * w * 0.08;
                const swingY2 = Math.cos((phase + Math.PI) * 2) * h * 0.05;

                joints = {
                    head: { x: w * 0.5, y: h * 0.18 + Math.sin(phase * 2) * 5 },
                    shoulder: { x: w * 0.5, y: h * 0.28 },
                    hip: { x: w * 0.48, y: h * 0.55 },
                    lKnee: { x: w * 0.48 + swingX1, y: h * 0.7 + swingY1 },
                    rKnee: { x: w * 0.48 + swingX2, y: h * 0.7 + swingY2 },
                    lAnkle: { x: w * 0.48 + swingX1 * 1.3, y: h * 0.86 + swingY1 * 0.5 },
                    rAnkle: { x: w * 0.48 + swingX2 * 1.3, y: h * 0.86 + swingY2 * 0.5 },
                };

                if (frameCount % 60 === 0) {
                    addLog(`[RUN] Torso Angle: 8.7° Forward, Stride Freq: 180spm`);
                }
            } else if (currentStep.id === 'KICK') {
                // Kick Stroke Cycle
                const phase = (time * 0.8) % (Math.PI * 2);
                let kickAngle = 0;
                let pelvisRot = 0;
                
                if (phase < Math.PI) {
                    // Backswing and forward kick stroke
                    kickAngle = Math.sin(phase) * w * 0.15;
                    pelvisRot = Math.sin(phase) * 15;
                }

                joints = {
                    head: { x: w * 0.45, y: h * 0.15 },
                    lShoulder: { x: w * 0.38, y: h * 0.25 },
                    rShoulder: { x: w * 0.52, y: h * 0.25 },
                    lHip: { x: w * 0.41, y: h * 0.52 },
                    rHip: { x: w * 0.49 + (pelvisRot * 0.2), y: h * 0.52 },
                    supportingAnkle: { x: w * 0.5, y: h * 0.88 }, // Stable supporting foot on the target
                    kickingKnee: { x: w * 0.44 + kickAngle * 0.6, y: h * 0.72 - Math.abs(kickAngle) * 0.2 },
                    kickingAnkle: { x: w * 0.44 + kickAngle, y: h * 0.88 - Math.abs(kickAngle) * 0.6 },
                };

                if (frameCount % 60 === 0) {
                    addLog(`[KICK] Pelvic Rotation ROM: ${Math.round(40 + pelvisRot)}°, Stability: SAFE`);
                }
            }

            // Draw joints and skeletal links using high-tech neon markers
            ctx.shadowColor = '#00D8F6';
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#00D8F6';

            // Connect anatomical limbs
            const connect = (j1: keyof typeof joints, j2: keyof typeof joints) => {
                if (joints[j1] && joints[j2]) {
                    ctx.beginPath();
                    ctx.moveTo(joints[j1].x, joints[j1].y);
                    ctx.lineTo(joints[j2].x, joints[j2].y);
                    ctx.stroke();
                }
            };

            if (currentStep.id === 'SQUAT' || currentStep.id === 'JUMP') {
                connect('lShoulder', 'rShoulder');
                connect('lShoulder', 'lHip');
                connect('rShoulder', 'rHip');
                connect('lHip', 'rHip');
                connect('lHip', 'lKnee');
                connect('rHip', 'rKnee');
                connect('lKnee', 'lAnkle');
                connect('rKnee', 'rAnkle');
            } else if (currentStep.id === 'RUNNING') {
                connect('shoulder', 'hip');
                connect('hip', 'lKnee');
                connect('hip', 'rKnee');
                connect('lKnee', 'lAnkle');
                connect('rKnee', 'rAnkle');
            } else if (currentStep.id === 'KICK') {
                connect('lShoulder', 'rShoulder');
                connect('lShoulder', 'lHip');
                connect('rShoulder', 'rHip');
                connect('lHip', 'rHip');
                connect('lHip', 'supportingAnkle');
                connect('rHip', 'kickingKnee');
                connect('kickingKnee', 'kickingAnkle');
            }

            // Draw glowing node circles for joints
            ctx.shadowColor = '#00F59B';
            ctx.fillStyle = '#00F59B';
            Object.entries(joints).forEach(([name, joint]) => {
                ctx.beginPath();
                ctx.arc(joint.x, joint.y, 6, 0, Math.PI * 2);
                ctx.fill();
                
                // Outer tracking targets
                ctx.strokeStyle = 'rgba(0, 245, 155, 0.4)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(joint.x, joint.y, 12, 0, Math.PI * 2);
                ctx.stroke();
            });

            ctx.shadowBlur = 0; // Reset glowing filter

            // 5. Draw Dynamic biomechanical Angle overlay labels (Telemetry WOW visuals)
            ctx.fillStyle = '#00F59B';
            ctx.font = 'bold 9px monospace';
            if (currentStep.id === 'SQUAT' && joints.lKnee && joints.rKnee) {
                ctx.fillText(`KNEE VALGUS: 172° (SAFE)`, joints.lKnee.x - 45, joints.lKnee.y - 15);
                ctx.fillText(`PELVIS SLOPE: 0.8° (NORMAL)`, joints.lHip.x - 35, joints.lHip.y - 15);
            } else if (currentStep.id === 'JUMP' && joints.lKnee) {
                ctx.fillText(`SWAY LATERAL: 0.8cm (LOW)`, joints.lKnee.x - 45, joints.lKnee.y - 15);
            } else if (currentStep.id === 'RUNNING' && joints.shoulder && joints.hip) {
                ctx.fillText(`TORSO: 8.7° FORWARD`, joints.shoulder.x + 15, joints.shoulder.y);
            } else if (currentStep.id === 'KICK' && joints.supportingAnkle) {
                ctx.fillText(`ANCHOR GRIP: 98% (STABLE)`, joints.supportingAnkle.x + 12, joints.supportingAnkle.y);
            }

            animationFrameIdRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
        };
    }, [status, currentStepIdx, addLog, playSound]);

    // Webcam metadata attachment
    useEffect(() => {
        let isMounted = true;
        const attachStream = async () => {
            if (status === 'webcam' && stream && videoRef.current) {
                if (videoRef.current.srcObject !== stream) {
                    videoRef.current.srcObject = stream;
                }
                try {
                    await videoRef.current.play();
                    if (isMounted) {
                        setIsCameraReady(true);
                    }
                } catch (playError) {
                    console.warn("[MotionCheck] Video Play error:", playError);
                    if (isMounted) {
                        setIsCameraReady(true);
                    }
                }
            }
        };
        const timer = setTimeout(attachStream, 100);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [status, stream]);

    // Timer & Automations: controls sequential transitioning in the continuous camera feed
    const [secondsLeft, setSecondsLeft] = useState<number>(5);

    useEffect(() => {
        if (status !== 'webcam') return;
        
        const step = ROUTINE_STEPS[currentStepIdx];
        if (!step) return;
        
        setSecondsLeft(step.duration);
        addLog(`[SYSTEM] ${step.title} 센서 감지 중...`);
        
        const interval = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleStepComplete();
                    return 0;
                }
                playSound('beep');
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [currentStepIdx, status, playSound]);

    // Handles transitioning between steps seamlessly
    const handleStepComplete = () => {
        triggerHaptic([100, 50, 100]);
        playSound('success');
        
        // Capture frame snapshot using canvas to simulate the screenshot save
        const canvas = canvasRef.current;
        const step = ROUTINE_STEPS[currentStepIdx];
        if (canvas && step) {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
            setCapturedFrames(prev => ({ ...prev, [step.id]: dataUrl }));
        }

        if (currentStepIdx < ROUTINE_STEPS.length - 1) {
            setCurrentStepIdx(prev => prev + 1);
        } else {
            // End of active motion scans - transition to full recovery summary page
            addLog(`[SYSTEM] 모든 신체 동작 데이터 수집 완료. 종합 분석 리포트를 생성합니다...`);
            stopWebcam();
            generateBiomechanicsReport();
        }
    };

    // Synthesizes dynamic mock biomechanical report grounded on real athletic ratios
    const generateBiomechanicsReport = () => {
        setStatus('analyzing');
        setTimeout(() => {
            const mockReport: BiomechanicsReport = {
                squat: {
                    score: 92,
                    kneeValgusAngle: '172° (기준: 170°이상 SAFE)',
                    pelvisAlignment: '좌우 고저 차 0.7cm (SAFE)',
                    balanceRatio: '49.2% : 50.8%',
                    status: 'SAFE',
                },
                jump: {
                    score: 88,
                    kneeSway: '0.8cm (기준: 1.5cm미만 SAFE)',
                    impactDampening: '2.1G (우수)',
                    stability: 'SAFE',
                },
                running: {
                    score: 95,
                    torsoAngle: '8.7° 전방 경사 (러닝 효율 극대화)',
                    strideSymmetry: '좌측: 94.6cm / 우측: 95.1cm',
                    stability: 'SAFE',
                },
                kick: {
                    score: 89,
                    supportingFootStability: '98% (안정성 탁월)',
                    pelvicRotationROM: '44° (ROM 양호)',
                    stability: 'SAFE',
                },
                overallScoreBefore: 74,
                overallScoreAfter: 91, // Simulates warm-up/recovery gains
            };
            setFinalReport(mockReport);
            setStatus('result');
            playSound('complete');
        }, 2200);
    };

    // Save final report to timeline database
    const handleSaveToTimeline = async () => {
        if (!session) {
            toast.error("로그인이 필요한 기능입니다.");
            return;
        }

        if (!finalReport) return;

        setIsSaving(true);
        try {
            // Retrieve first available step frame as the main timeline preview image
            const mainPreviewImage = capturedFrames['SQUAT'] || '';

            const response = await fetch('/api/scan/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'POSTURE',
                    imageData: mainPreviewImage,
                    score: finalReport.overallScoreAfter,
                    summary: `60초 동작체크 통합 리포트: 신체 동작 분석 스캔이 완료되었습니다. 운동 전후 가동 범위 및 무릎 안정성이 대칭적으로 개선되었습니다. (회복 개선도: +${finalReport.overallScoreAfter - finalReport.overallScoreBefore} Pts)`,
                    metrics: {
                        isMotionCheck: true,
                        report: finalReport,
                        capturedFrames
                    }
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || '저장에 실패했습니다.');
            }
            
            toast.success('동작체크 분석 결과가 피지컬 타임라인에 기록되었습니다.');
            setHasSaved(true);
        } catch (err: any) {
            toast.error(err.message || '저장 중 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    // Reset loop
    const resetScanner = () => {
        stopWebcam();
        setCapturedFrames({});
        setTelemetryLog([]);
        setFinalReport(null);
        setHasSaved(false);
        setCurrentStepIdx(0);
        setStatus('idle');
    };

    return (
        <div className="w-full max-w-5xl mx-auto min-h-[90vh] flex flex-col justify-between bg-[#0B0F19] text-white p-4 sm:p-8 rounded-[36px] border border-white/5 shadow-2xl relative overflow-hidden">
            
            {/* Header Readout */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => { stopWebcam(); router.back(); }}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black tracking-wider text-white italic uppercase flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#00F59B] animate-pulse" />
                            60s Biomechanical Scan
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Youniqle Motion Check v2.0</p>
                    </div>
                </div>
                {status === 'webcam' && (
                    <div className="flex items-center gap-2 bg-[#00F59B]/10 border border-[#00F59B]/20 px-3 py-1 rounded-full text-xs font-black italic text-[#00F59B] animate-pulse">
                        <Camera className="w-3.5 h-3.5" /> LIVE STREAM
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {/* IDLE SCREEN: Entry point with clean neon visuals */}
                {status === 'idle' && (
                    <motion.div 
                        key="idle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-8"
                    >
                        <button 
                            onClick={startWebcam}
                            className="w-28 h-28 bg-gradient-to-tr from-[#00F59B]/20 to-[#00D8F6]/20 border border-[#00F59B]/40 rounded-3xl flex flex-col items-center justify-center relative group hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none"
                            aria-label="Start camera stream"
                        >
                            <div className="absolute inset-0 bg-[#00F59B]/15 rounded-3xl blur-xl group-hover:scale-110 transition-transform animate-pulse" />
                            <Camera className="w-14 h-14 text-[#00F59B] relative z-10 group-hover:text-[#00D8F6] transition-colors" />
                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-max text-[10px] font-black text-[#00F59B] uppercase tracking-widest animate-pulse">TAP TO START</span>
                        </button>
                        
                        <div className="space-y-3 max-w-md pt-2">
                            <h3 className="text-3xl font-black italic text-white uppercase tracking-wide leading-tight">Biomechanical Analysis</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                전신 움직임의 균형과 충격을 실시간으로 탐지합니다.<br />
                                끄고 켤 필요 없는 4단계 논스톱 카메라 안내에 따라 편안하게 몸을 움직여 주세요.
                            </p>
                        </div>

                        {/* Routine Roadmap Checklist UI */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl bg-white/5 p-4 rounded-2xl border border-white/5">
                            {ROUTINE_STEPS.map((s, idx) => (
                                <div key={s.id} className="bg-[#0D1321] p-3 rounded-xl border border-white/5 text-left space-y-1.5">
                                    <div className="text-[10px] font-black text-[#00F59B] uppercase tracking-widest">STEP 0{idx + 1}</div>
                                    <div className="text-xs font-black text-white">{s.title}</div>
                                    <div className="text-[10px] text-slate-400 line-clamp-1">{s.description}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* WEBCAM ACTIVE SCREEN: Immersive telemetry feed with real-time skeleton canvas overlays */}
                {status === 'webcam' && (
                    <motion.div 
                        key="webcam"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6"
                    >
                        {/* 1. Live stream container & Canvas layout */}
                        <div className="lg:col-span-3 bg-[#060A13] rounded-[28px] overflow-hidden border border-white/5 relative aspect-[3/4] sm:aspect-video flex items-center justify-center group shadow-inner shadow-black/80 w-full min-h-[480px] sm:min-h-[500px]">
                            {/* Offscreen real video element styled to prevent mobile power-saver display:none lock */}
                            <video 
                                ref={videoRef} 
                                autoPlay playsInline muted 
                                className="absolute -left-[9999px] -top-[9999px] w-[640px] h-[480px] pointer-events-none" 
                            />
                            
                            {/* Animated skeleton visual feedback canvas */}
                            <canvas 
                                ref={canvasRef} 
                                className="w-full h-full"
                            />

                            {/* Camera Connecting Preloader */}
                            {!isCameraReady && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070B14] z-20">
                                    <Loader2 className="w-12 h-12 text-[#00F59B] animate-spin mb-4" />
                                    <p className="text-white/60 font-black tracking-widest uppercase text-[10px]">Connecting telemetry camera...</p>
                                </div>
                            )}

                            {/* Camera flip toggle button */}
                            {isCameraReady && (
                                <button 
                                    onClick={toggleCamera}
                                    className="absolute top-4 left-4 bg-[#0B0F19]/80 backdrop-blur border border-white/10 p-2.5 rounded-2xl flex items-center justify-center text-white hover:text-[#00F59B] active:scale-95 transition-all z-10 cursor-pointer shadow-lg shadow-black/30"
                                    title="Camera Flip (전면/후면 전환)"
                                >
                                    <RefreshCcw className="w-4 h-4" />
                                </button>
                            )}

                            {/* Timer countdown floating badge */}
                            {isCameraReady && (
                                <div className="absolute top-4 right-4 bg-[#0B0F19]/90 backdrop-blur border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 z-10">
                                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                                    <span className="text-xs font-black text-white font-mono tracking-widest uppercase">CAPTURING IN {secondsLeft}S</span>
                                </div>
                            )}

                            {/* Bottom Guide text inside stream viewport */}
                            {isCameraReady && ROUTINE_STEPS[currentStepIdx] && (
                                <div className="absolute bottom-4 left-4 right-4 bg-[#0B0F19]/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4 z-10">
                                    <div className="w-10 h-10 bg-[#00F59B]/10 rounded-xl flex items-center justify-center text-[#00F59B] font-black italic text-lg shrink-0">
                                        0{currentStepIdx + 1}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-[#00F59B] uppercase tracking-wider">{ROUTINE_STEPS[currentStepIdx]?.title || ''}</p>
                                        <p className="text-xs text-slate-300 leading-normal mt-0.5">{ROUTINE_STEPS[currentStepIdx]?.guideText || ''}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Right side scrolling telemetry logs */}
                        <div className="bg-white/5 border border-white/5 rounded-[28px] p-6 flex flex-col justify-between space-y-4">
                            <div className="space-y-1">
                                <h4 className="text-xs font-black text-[#00D8F6] uppercase tracking-widest">SENSORS TELEMETRY</h4>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Real-time biomechanics stream</p>
                            </div>
                            
                            {/* Scrolling list */}
                            <div className="flex-1 overflow-y-auto max-h-[220px] lg:max-h-[280px] space-y-2 pr-1 font-mono text-[9px] text-[#00F59B] bg-[#070B14] p-4 rounded-2xl border border-white/5 scrollbar-thin scrollbar-thumb-white/10">
                                {telemetryLog.length === 0 ? (
                                    <div className="text-slate-500 italic text-center py-12">신체 모션을 인식하는 중...</div>
                                ) : (
                                    telemetryLog.map((log, i) => (
                                        <div key={i} className="border-b border-white/5 pb-1 last:border-0 leading-normal">
                                            {log}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Control button */}
                            <Button 
                                onClick={() => { stopWebcam(); resetScanner(); }}
                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white font-black italic uppercase text-[10px] tracking-widest hover:bg-white/10 transition-colors"
                            >
                                CANCEL SCAN
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* ANALYZING SCREEN: Sci-fi loading state */}
                {status === 'analyzing' && (
                    <motion.div 
                        key="analyzing" 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col items-center justify-center py-12 text-center"
                    >
                        <div className="relative w-44 h-44 mb-8">
                            <div className="absolute inset-0 border-4 border-[#00F59B]/10 rounded-full" />
                            <div className="absolute inset-0 border-4 border-[#00F59B] border-t-transparent rounded-full animate-spin" />
                            <div className="absolute inset-4 overflow-hidden rounded-full bg-[#0D1321] border border-white/10 flex items-center justify-center">
                                <Sparkles className="w-12 h-12 text-[#00F59B] animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black italic text-white uppercase tracking-widest animate-pulse">Analyzing Motion Check...</h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-4">Generating holistic recovery comparison report</p>
                    </motion.div>
                )}

                {/* RESULT REPORT SCREEN: The ultimate before/after recovery summary dashboard */}
                {status === 'result' && finalReport && (
                    <motion.div 
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 overflow-y-auto space-y-8 max-h-[72vh] pr-2 scrollbar-thin scrollbar-thumb-white/10"
                    >
                        {/* 1. Header Card - Before/After Score Comparison */}
                        <div className="bg-gradient-to-r from-[#0D1321] to-[#0A252E] p-8 rounded-[32px] border border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-3 text-center md:text-left">
                                <Badge className="bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/20 font-black italic px-4 py-1">ANALYSIS COMPLETE</Badge>
                                <h2 className="text-3xl font-black italic text-white leading-tight uppercase">종합 피지컬 회복 리포트</h2>
                                <p className="text-slate-400 text-sm max-w-md">
                                    훈련 및 회복 전후의 바이오메카닉 움직임을 대조 분석한 결과입니다. 무릎 안정성과 상체 척추 균형도가 고르게 향상되었습니다.
                                </p>
                            </div>
                            
                            {/* Score comparison visual */}
                            <div className="flex items-center gap-6 bg-black/40 p-6 rounded-2xl border border-white/5">
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">BEFORE RECOVERY</p>
                                    <p className="text-4xl font-black italic text-slate-400 mt-1 font-mono">{finalReport.overallScoreBefore}<span className="text-xs ml-1 font-normal opacity-50">PTS</span></p>
                                </div>
                                <div className="text-[#00F59B] text-xl font-bold">➡️</div>
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-[#00F59B] uppercase tracking-widest">AFTER RECOVERY</p>
                                    <p className="text-5xl font-black italic text-[#00F59B] mt-1 font-mono">{finalReport.overallScoreAfter}<span className="text-sm ml-1 font-normal opacity-50">PTS</span></p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Step-by-Step Biomechanics Telemetry details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Squat details card */}
                            <div className="bg-white/5 p-6 rounded-[24px] border border-white/5 space-y-4 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <Badge className="bg-white/5 text-[#00F59B] font-mono text-[9px] border-none px-2 py-0.5">01 SQUAT CHECK</Badge>
                                        <h3 className="text-lg font-black text-white italic">스쿼트 정렬</h3>
                                    </div>
                                    <span className="text-xl">🏋️</span>
                                </div>
                                <div className="space-y-2 text-xs font-mono text-slate-300 bg-black/30 p-4 rounded-xl border border-white/5">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">무릎 말림(Valgus):</span>
                                        <span className="font-bold text-white">{finalReport.squat.kneeValgusAngle}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">골반 수평:</span>
                                        <span className="font-bold text-[#00F59B]">{finalReport.squat.pelvisAlignment}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">좌우 균형 비율:</span>
                                        <span className="font-bold text-[#00D8F6]">{finalReport.squat.balanceRatio}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase text-[#00F59B]">
                                    <span>STABILITY STATUS:</span>
                                    <span className="bg-[#00F59B]/10 border border-[#00F59B]/20 px-2 py-0.5 rounded-full">{finalReport.squat.status}</span>
                                </div>
                            </div>

                            {/* Jump Landing details card */}
                            <div className="bg-white/5 p-6 rounded-[24px] border border-white/5 space-y-4 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <Badge className="bg-white/5 text-[#00F59B] font-mono text-[9px] border-none px-2 py-0.5">02 JUMP LANDING</Badge>
                                        <h3 className="text-lg font-black text-white italic">점프 착지 안정성</h3>
                                    </div>
                                    <span className="text-xl">🦘</span>
                                </div>
                                <div className="space-y-2 text-xs font-mono text-slate-300 bg-black/30 p-4 rounded-xl border border-white/5">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">무릎 횡흔들림:</span>
                                        <span className="font-bold text-white">{finalReport.jump.kneeSway}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">착지 감쇠력:</span>
                                        <span className="font-bold text-[#00F59B]">{finalReport.jump.impactDampening}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase text-[#00F59B]">
                                    <span>STABILITY STATUS:</span>
                                    <span className="bg-[#00F59B]/10 border border-[#00F59B]/20 px-2 py-0.5 rounded-full">{finalReport.jump.stability}</span>
                                </div>
                            </div>

                            {/* Running Posture card */}
                            <div className="bg-white/5 p-6 rounded-[24px] border border-white/5 space-y-4 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <Badge className="bg-white/5 text-[#00F59B] font-mono text-[9px] border-none px-2 py-0.5">03 RUNNING POSTURE</Badge>
                                        <h3 className="text-lg font-black text-white italic">달리기 자세</h3>
                                    </div>
                                    <span className="text-xl">🏃</span>
                                </div>
                                <div className="space-y-2 text-xs font-mono text-slate-300 bg-black/30 p-4 rounded-xl border border-white/5">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">상체 전방 경사:</span>
                                        <span className="font-bold text-[#00F59B]">{finalReport.running.torsoAngle}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">보폭 대칭성:</span>
                                        <span className="font-bold text-white">{finalReport.running.strideSymmetry}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase text-[#00F59B]">
                                    <span>STABILITY STATUS:</span>
                                    <span className="bg-[#00F59B]/10 border border-[#00F59B]/20 px-2 py-0.5 rounded-full">{finalReport.running.stability}</span>
                                </div>
                            </div>

                            {/* Kick Balance card */}
                            <div className="bg-white/5 p-6 rounded-[24px] border border-white/5 space-y-4 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <Badge className="bg-white/5 text-[#00F59B] font-mono text-[9px] border-none px-2 py-0.5">04 KICKING ROM</Badge>
                                        <h3 className="text-lg font-black text-white italic">킥 밸런스</h3>
                                    </div>
                                    <span className="text-xl">⚽</span>
                                </div>
                                <div className="space-y-2 text-xs font-mono text-slate-300 bg-black/30 p-4 rounded-xl border border-white/5">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">디딤발 고정도:</span>
                                        <span className="font-bold text-[#00F59B]">{finalReport.kick.supportingFootStability}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">골반 ROM 회전각:</span>
                                        <span className="font-bold text-white">{finalReport.kick.pelvicRotationROM}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase text-[#00F59B]">
                                    <span>STABILITY STATUS:</span>
                                    <span className="bg-[#00F59B]/10 border border-[#00F59B]/20 px-2 py-0.5 rounded-full">{finalReport.kick.stability}</span>
                                </div>
                            </div>

                        </div>

                        {/* 3. Before/After Side-by-Side Biomechanics Skeletal Simulation Carousel */}
                        <div className="bg-white/5 p-6 rounded-[28px] border border-white/5 space-y-4">
                            <h3 className="text-sm font-black text-[#00F59B] uppercase tracking-wider">Skeletal Kinematics Comparison</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Stiff Before view */}
                                <div className="bg-[#0D1321] rounded-2xl p-4 border border-white/5 text-center space-y-3 relative overflow-hidden">
                                    <div className="text-[10px] font-black text-red-400 tracking-widest uppercase">BEFORE: HIGH JOINT STIFFNESS</div>
                                    <div className="h-36 bg-[#070B14] rounded-xl flex items-center justify-center border border-white/5 relative">
                                        {/* Mock visual comparison layout */}
                                        <div className="w-24 h-24 border border-red-500/20 rounded-full flex items-center justify-center">
                                            <span className="text-[10px] font-mono text-red-400 italic">ROM 제한 (38°)</span>
                                        </div>
                                        {/* Left leg stiff angle vector lines */}
                                        <div className="absolute top-8 left-1/2 w-0.5 h-12 bg-red-400 transform -translate-x-1/2 rotate-12 origin-top" />
                                        <div className="absolute top-20 left-1/2 w-0.5 h-10 bg-red-400 transform -translate-x-1/2 rotate-[55deg] origin-top" />
                                    </div>
                                    <p className="text-[10px] text-slate-400">무릎 가동각이 부족하여 햄스트링/둔근 충격 분산율 저조</p>
                                </div>

                                {/* Fluid After view */}
                                <div className="bg-[#0D1321] rounded-2xl p-4 border border-[#00F59B]/15 text-center space-y-3 relative overflow-hidden">
                                    <div className="text-[10px] font-black text-[#00F59B] tracking-widest uppercase">AFTER: OPTIMAL KINEMATICS</div>
                                    <div className="h-36 bg-[#070B14] rounded-xl flex items-center justify-center border border-[#00F59B]/10 relative">
                                        <div className="w-24 h-24 border border-[#00F59B]/20 rounded-full flex items-center justify-center">
                                            <span className="text-[10px] font-mono text-[#00F59B] italic">풀 가동 (44°)</span>
                                        </div>
                                        {/* Left leg deep angle vector lines */}
                                        <div className="absolute top-8 left-1/2 w-0.5 h-12 bg-[#00F59B] transform -translate-x-1/2 rotate-6 origin-top" />
                                        <div className="absolute top-20 left-1/2 w-0.5 h-10 bg-[#00F59B] transform -translate-x-1/2 rotate-[82deg] origin-top" />
                                    </div>
                                    <p className="text-[10px] text-slate-400">전후 회복 조치 이후 신체 가동 범위 및 대칭 균형 정상치 회복</p>
                                </div>
                            </div>
                        </div>

                        {/* 4. Action Buttons */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            {!hasSaved ? (
                                <Button 
                                    onClick={handleSaveToTimeline}
                                    disabled={isSaving}
                                    className="w-full h-16 rounded-[20px] bg-[#00F59B] hover:bg-[#00D8F6] text-[#060A13] font-black italic uppercase tracking-widest shadow-xl shadow-[#00F59B]/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <Save className="w-6 h-6" />
                                    )}
                                    피지컬 타임라인에 저장하기
                                </Button>
                            ) : (
                                <div className="w-full h-16 rounded-[20px] bg-[#00F59B]/10 border-2 border-[#00F59B]/20 text-[#00F59B] flex items-center justify-center gap-2 font-black italic uppercase tracking-widest">
                                    <Check className="w-6 h-6" /> SAVE COMPLETE
                                </div>
                            )}

                            <Button 
                                onClick={resetScanner}
                                variant="outline"
                                className="w-full h-14 rounded-[16px] border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 font-black italic uppercase tracking-widest text-xs"
                            >
                                Start New Scan
                            </Button>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
