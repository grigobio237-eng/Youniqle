
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getQuestionsForSession, DiagnosisQuestionData } from '@/lib/data/diagnosis-questions';
import { SimcheungDiagnosisEngine, FreeDiagnosisResult } from '@/lib/logic/simcheung-diagnosis';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, RefreshCw, X } from 'lucide-react';
import Link from 'next/link';

interface DetailedDiagnosisModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DetailedDiagnosisModal({ open, onOpenChange }: DetailedDiagnosisModalProps) {
    const [step, setStep] = useState<'intro' | 'test' | 'analyzing' | 'result'>('intro');
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [result, setResult] = useState<FreeDiagnosisResult | null>(null);
    const [questions, setQuestions] = useState<DiagnosisQuestionData[]>([]);

    // Reset when opened
    useEffect(() => {
        if (open && step === 'result') {
            // Keep result if already done? Or reset? Let's keep it for now unless explicitly reset.
            // Actually, if re-opening, maybe start fresh or show result?
            // Let's reset if it was closed.
        }
    }, [open]);

    const handleStart = () => {
        // Load questions based on session count
        const count = parseInt(localStorage.getItem('diagnosis_session_count') || '0', 10);
        const sessionQuestions = getQuestionsForSession(count);
        setQuestions(sessionQuestions);

        setStep('test');
        setCurrentQIndex(0);
        setAnswers({});
    };

    const handleAnswer = (score: number) => {
        const question = questions[currentQIndex];
        setAnswers(prev => ({ ...prev, [question.id]: score }));

        if (currentQIndex < questions.length - 1) {
            setTimeout(() => setCurrentQIndex(prev => prev + 1), 250); // Slight delay for visual feedback
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        setStep('analyzing');

        const res = SimcheungDiagnosisEngine.calculateFreeDiagnosis(answers, questions);
        setResult(res);

        // Update session count for rotation
        const count = parseInt(localStorage.getItem('diagnosis_session_count') || '0', 10);
        localStorage.setItem('diagnosis_session_count', (count + 1).toString());

        // Save to Server
        try {
            await fetch('/api/diagnosis/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'free',
                    result: res,
                    answers: answers
                })
            });

            // 3. Update LocalStorage for immediate Navigator reflection
            localStorage.setItem('recovery_last_score', res.totalScore.toString());
        } catch (error) {
            console.error('Failed to save result:', error);
        }

        // Simulate analysis delay
        setTimeout(() => {
            setStep('result');
        }, 1500);
    };

    const handleClose = () => onOpenChange(false);

    // Render Logic
    const currentQuestion = questions[currentQIndex];
    const progress = ((currentQIndex) / questions.length) * 100;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none rounded-[32px] bg-surface shadow-2xl h-[600px] flex flex-col">
                <DialogHeader className="sr-only">
                    <DialogTitle>심층 심리 진단</DialogTitle>
                    <DialogDescription>
                        심리 진단을 통해 당신의 상태를 분석하고 솔루션을 제공합니다.
                    </DialogDescription>
                </DialogHeader>
                <AnimatePresence mode="wait">
                    {step === 'intro' && (
                        <IntroView key="intro" onStart={handleStart} onClose={handleClose} />
                    )}
                    {step === 'test' && (
                        <TestView
                            key="test"
                            question={currentQuestion}
                            index={currentQIndex}
                            total={questions.length}
                            onAnswer={handleAnswer}
                            onClose={handleClose}
                        />
                    )}
                    {step === 'analyzing' && (
                        <AnalyzingView key="analyzing" />
                    )}
                    {step === 'result' && result && (
                        <ResultView key="result" result={result} onClose={handleClose} />
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}

// ---------------- Sub Components ----------------

function IntroView({ onStart, onClose }: { onStart: () => void, onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col h-full relative"
        >
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10 text-slate" onClick={onClose}>
                <X />
            </Button>

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 bg-gradient-to-b from-mist to-white">
                <div className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center mb-4">
                    <span className="text-4xl">🧠</span>
                </div>
                <div>
                    <h2 className="text-3xl font-black text-obsidian mb-4">심층 심리 진단</h2>
                    <p className="text-slate font-medium leading-relaxed max-w-sm mx-auto">
                        나의 마음, 감정, 관계, 신체 4가지 영역을<br />
                        정밀하게 분석하여<br />
                        현재 상태에 딱 맞는 회복 솔루션을 찾아드립니다.
                    </p>
                </div>
                <div className="flex gap-4 text-xs font-bold text-text-secondary uppercase tracking-widest">
                    <span>• 24 문항</span>
                    <span>• 약 3분 소요</span>
                    <span>• AI 정밀 분석</span>
                </div>
            </div>
            <div className="p-8 bg-white border-t border-line">
                <Button onClick={onStart} className="w-full h-14 rounded-2xl bg-primary text-background font-black text-lg shadow-lg hover:scale-[1.02] transition-transform">
                    지금 진단 시작하기
                </Button>
            </div>
        </motion.div>
    );
}

function TestView({ question, index, total, onAnswer, onClose }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full bg-white relative"
        >
            <div className="px-8 pt-8 pb-4">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-black text-primary/50 tracking-widest">QUESTION {index + 1}/{total}</span>
                    <Button variant="ghost" size="icon" className="text-slate -mr-2" onClick={onClose}><X className="w-5 h-5" /></Button>
                </div>
                <Progress value={(index / total) * 100} className="h-2 bg-mist" indicatorClassName="bg-primary" />
            </div>

            <div className="flex-1 flex flex-col justify-center px-8 pb-8">
                <h3 className="text-xl md:text-2xl font-bold text-obsidian leading-snug mb-12 text-center text-balance">
                    {question.text}
                </h3>

                <div className="space-y-3">
                    {[
                        { label: '매우 그렇다', score: 5 },
                        { label: '그렇다', score: 4 },
                        { label: '보통이다', score: 3 },
                        { label: '아니다', score: 2 },
                        { label: '전혀 아니다', score: 1 },
                    ].map((opt) => (
                        <button
                            key={opt.score}
                            onClick={() => onAnswer(opt.score)}
                            className="w-full p-4 rounded-xl border border-line text-slate hover:border-primary hover:bg-primary/5 hover:text-primary font-bold transition-all text-left flex justify-between group active:scale-[0.98]"
                        >
                            <span>{opt.label}</span>
                            <span className="w-5 h-5 rounded-full border border-line group-hover:border-primary flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

function AnalyzingView() {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col h-full items-center justify-center bg-obsidian text-white p-8 text-center"
        >
            <div className="relative mb-8">
                <RefreshCw className="w-16 h-16 animate-spin text-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">⚡️</span>
                </div>
            </div>
            <h2 className="text-2xl font-black mb-2">분석 중입니다...</h2>
            <p className="text-white/60">당신의 응답 패턴을 AI 모델과 대조하여<br />심층 리포트를 생성하고 있습니다.</p>
        </motion.div>
    );
}

function ResultView({ result, onClose }: { result: FreeDiagnosisResult, onClose: () => void }) {
    const chartData = [
        { subject: '마인드', A: result.convertedScores.Mindset, fullMark: 100 },
        { subject: '감정', A: result.convertedScores.Emotional, fullMark: 100 },
        { subject: '관계', A: result.convertedScores.Social, fullMark: 100 },
        { subject: '신체', A: result.convertedScores.Physical, fullMark: 100 },
    ];

    const lowestCatName =
        result.lowestCategory === 'Mindset' ? '마인드셋' :
            result.lowestCategory === 'Emotional' ? '감정 조절' :
                result.lowestCategory === 'Social' ? '사회적 관계' : '신체 활력';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col h-full bg-surface relative overflow-y-auto"
        >
            <div className="absolute top-0 w-full h-48 bg-obsidian rounded-b-[40px] z-0" />

            <div className="relative z-10 pt-8 px-6 pb-20 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6 text-white">
                    <div>
                        <div className="text-xs font-bold opacity-60 uppercase tracking-widest mb-1">Total Score</div>
                        <div className="text-4xl font-black tracking-tighter">{result.totalScore}<span className="text-lg opacity-50">/100</span></div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-white/80 hover:bg-white/10" onClick={onClose}><X /></Button>
                </div>

                <div className="bg-white rounded-[24px] shadow-xl border border-line p-6 mb-6 flex-shrink-0">
                    <div className="h-48 w-full -ml-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="My Score" dataKey="A" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-status-amber/10 border border-status-amber/20 rounded-2xl p-5">
                        <div className="text-xs font-black text-status-amber uppercase tracking-widest mb-2">Weakeness Analysis</div>
                        <h3 className="text-lg font-bold text-obsidian mb-2">
                            '{lowestCatName}' 케어가 시급합니다
                        </h3>
                        <p className="text-sm text-slate leading-relaxed">
                            4가지 영역 중 가장 에너지가 낮은 상태입니다.
                            이 부분을 방치하면 전체적인 회복 탄력성이 저하될 수 있습니다.
                        </p>
                    </div>

                    {/* Recommendation Logic Placeholders */}
                    <div className="bg-white rounded-2xl p-5 border border-line">
                        <div className="text-xs font-black text-primary uppercase tracking-widest mb-3">Recommended Solution</div>
                        <Button asChild onClick={onClose} className="w-full h-12 bg-primary text-background font-bold rounded-xl shadow-lg shadow-primary/20 cursor-pointer">
                            <Link href="/ai-advice">
                                맞춤형 회복 플랜 보기 <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
