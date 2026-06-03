'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, RotateCcw, Wind, Heart, Moon, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Breathing Patterns
const PATTERNS = {
    '4-7-8': {
        name: '4-7-8 휴식 호흡',
        description: '깊은 이완과 숙면을 돕는 호흡법',
        steps: [
            { label: '숨 들이마시기', duration: 4000, scale: 1.5, text: 'Inhale' },
            { label: '숨 참기', duration: 7000, scale: 1.5, text: 'Hold' },
            { label: '숨 내뱉기', duration: 8000, scale: 1.0, text: 'Exhale' },
        ],
        color: 'from-indigo-400 to-purple-400',
    },
    'box': {
        name: '박스 호흡 (4-4-4-4)',
        description: '집중력 향상과 스트레스 해소',
        steps: [
            { label: '숨 들이마시기', duration: 4000, scale: 1.5, text: 'Inhale' },
            { label: '숨 참기', duration: 4000, scale: 1.5, text: 'Hold' },
            { label: '숨 내뱉기', duration: 4000, scale: 1.0, text: 'Exhale' },
            { label: '숨 참기', duration: 4000, scale: 1.0, text: 'Hold' },
        ],
        color: 'from-emerald-400 to-teal-400',
    },
    'calm': {
        name: '1분 진정 호흡',
        description: '빠르게 마음을 가라앉히는 호흡',
        steps: [
            { label: '숨 들이마시기', duration: 5000, scale: 1.5, text: 'Inhale' },
            { label: '숨 내뱉기', duration: 5000, scale: 1.0, text: 'Exhale' },
        ],
        color: 'from-blue-400 to-sky-400',
    }
};

type PatternKey = keyof typeof PATTERNS;

export default function BreathingPage() {
    const [activePattern, setActivePattern] = useState<PatternKey>('4-7-8');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [cycles, setCycles] = useState(0);
    const [showGuide, setShowGuide] = useState(true);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const pattern = PATTERNS[activePattern];
    const currentStep = pattern.steps[currentStepIndex];

    // Timer Logic
    useEffect(() => {
        if (!isPlaying) return;

        const currentDuration = pattern.steps[currentStepIndex].duration;

        timerRef.current = setTimeout(() => {
            setCurrentStepIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % pattern.steps.length;
                if (nextIndex === 0) {
                    setCycles(c => c + 1);
                }
                return nextIndex;
            });
        }, currentDuration);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isPlaying, currentStepIndex, pattern.steps]);

    const startBreathing = () => {
        setIsPlaying(true);
        setCurrentStepIndex(0);
        setCycles(0);
    };

    const stopBreathing = () => {
        setIsPlaying(false);
        if (timerRef.current) clearTimeout(timerRef.current);
        setCurrentStepIndex(0);
    };


    // Restart when pattern changes
    useEffect(() => {
        setIsPlaying(false);
        if (timerRef.current) clearTimeout(timerRef.current);
        setCurrentStepIndex(0);
        setCycles(0);
    }, [activePattern]);

    return (
        <div className="container max-w-2xl mx-auto py-8 px-4">
            <div className="mb-4">
                <Link href="/utils">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 -ml-2">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        돌아가기
                    </Button>
                </Link>
            </div>

            <div className="text-center mb-8">
                <Badge variant="outline" className="mb-2 text-indigo-600 border-indigo-200 bg-indigo-50">
                    Healing & Recovery
                </Badge>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">마음 챙김 호흡</h1>
                <p className="text-gray-600">
                    잠시 멈추고 깊게 숨을 쉬어보세요. <br />
                    스트레스가 줄어들고 마음이 편안해집니다.
                </p>
            </div>

            <Card className="p-8 relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-none shadow-xl">
                {/* Background Decoration */}
                <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${pattern.color} blur-3xl`} />

                <div className="relative z-10 flex flex-col items-center">

                    {/* Pattern Selector */}
                    <div className="w-full max-w-xs mb-8">
                        <Select
                            value={activePattern}
                            onValueChange={(val) => setActivePattern(val as PatternKey)}
                            disabled={isPlaying}
                        >
                            <SelectTrigger className="w-full bg-white/80 backdrop-blur border-gray-200">
                                <SelectValue placeholder="호흡 패턴 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="4-7-8">🌙 4-7-8 숙면 호흡</SelectItem>
                                <SelectItem value="box">📦 박스 호흡 (집중)</SelectItem>
                                <SelectItem value="calm">🌊 1분 진정 호흡</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-center text-gray-500 mt-2">
                            {pattern.description}
                        </p>
                    </div>

                    {/* Breathing Visualizer */}
                    <div className="relative w-64 h-64 flex items-center justify-center mb-10">
                        {/* Outer Pulse Ring */}
                        {isPlaying && (
                            <motion.div
                                animate={{
                                    scale: currentStep.scale,
                                    opacity: [0.3, 0.1],
                                }}
                                transition={{
                                    duration: currentStep.duration / 1000,
                                    ease: "easeInOut"
                                }}
                                className={`absolute inset-0 rounded-full bg-gradient-to-r ${pattern.color}`}
                            />
                        )}

                        {/* Main Circle */}
                        <motion.div
                            animate={{
                                scale: isPlaying ? currentStep.scale : 1,
                            }}
                            transition={{
                                duration: currentStep.duration / 1000,
                                ease: "easeInOut"
                            }}
                            className={`relative w-32 h-32 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-r ${pattern.color} text-white`}
                        >
                            <div className="text-center">
                                <span className="block text-lg font-bold">
                                    {isPlaying ? currentStep.label : '준비'}
                                </span>
                                {isPlaying && (
                                    <span className="text-xs opacity-80 font-mono">
                                        {currentStep.text}
                                    </span>
                                )}
                            </div>
                        </motion.div>

                        {/* Progress Ring (Conceptual) */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none opacity-20">
                            <circle
                                cx="128"
                                cy="128"
                                r="120"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                className="text-gray-400"
                            />
                        </svg>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-6">
                        {!isPlaying ? (
                            <Button
                                onClick={startBreathing}
                                size="lg"
                                className={`h-16 px-8 rounded-full shadow-lg bg-gradient-to-r ${pattern.color} hover:opacity-90 transition-opacity flex items-center gap-2`}
                            >
                                <Play className="h-6 w-6 text-white fill-current" />
                                <span className="font-bold text-white text-xl">시작</span>
                            </Button>
                        ) : (
                            <Button
                                onClick={stopBreathing}
                                size="lg"
                                variant="outline"
                                className="h-16 px-8 rounded-full border-2 flex items-center gap-2"
                            >
                                <Pause className="h-6 w-6 text-gray-600 fill-current" />
                                <span className="font-bold text-gray-600 text-xl">정지</span>
                            </Button>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="mt-8 flex gap-8 text-center text-gray-500 text-sm">
                        <div>
                            <span className="block font-bold text-lg text-gray-900">{cycles}</span>
                            <span>Cycles</span>
                        </div>
                        <div>
                            <span className="block font-bold text-lg text-gray-900">
                                {Math.floor((cycles * pattern.steps.reduce((acc, s) => acc + s.duration, 0)) / 1000 / 60)}:
                                {String(Math.floor((cycles * pattern.steps.reduce((acc, s) => acc + s.duration, 0)) / 1000) % 60).padStart(2, '0')}
                            </span>
                            <span>Time</span>
                        </div>
                    </div>

                </div>
            </Card>

            {/* Guide Section */}
            {/* Guide Section */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    onClick={() => !isPlaying && setActivePattern('4-7-8')}
                    className={`p-4 rounded-xl border shadow-sm text-center transition-all cursor-pointer hover:shadow-md 
                        ${activePattern === '4-7-8' ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 ${activePattern === '4-7-8' ? 'bg-indigo-200 text-indigo-700' : 'bg-indigo-100 text-indigo-600'}`}>
                        <Moon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm mb-1 text-gray-900">4-7-8 호흡법</h3>
                    <p className="text-xs text-gray-500">불면증 완화와 깊은 이완에 도움을 줍니다.</p>
                </div>

                <div
                    onClick={() => !isPlaying && setActivePattern('box')}
                    className={`p-4 rounded-xl border shadow-sm text-center transition-all cursor-pointer hover:shadow-md 
                        ${activePattern === 'box' ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-500' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 ${activePattern === 'box' ? 'bg-emerald-200 text-emerald-700' : 'bg-emerald-100 text-emerald-600'}`}>
                        <BoxIcon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm mb-1 text-gray-900">박스 호흡법</h3>
                    <p className="text-xs text-gray-500">미 해군 네이비씰이 사용하는 집중력 호흡입니다.</p>
                </div>

                <div
                    onClick={() => !isPlaying && setActivePattern('calm')}
                    className={`p-4 rounded-xl border shadow-sm text-center transition-all cursor-pointer hover:shadow-md 
                        ${activePattern === 'calm' ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 ${activePattern === 'calm' ? 'bg-blue-200 text-blue-700' : 'bg-blue-100 text-blue-600'}`}>
                        <Wind className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm mb-1 text-gray-900">진정 호흡</h3>
                    <p className="text-xs text-gray-500">긴장된 순간, 심박수를 빠르게 안정시킵니다.</p>
                </div>
            </div>
        </div>
    );
}

function Badge({ children, className, variant }: any) {
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>{children}</span>;
}

function BoxIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
    )
}
