'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, CheckCircle2, Sparkles, Activity, Brain, Clock, PlusCircle, ArrowRight, Loader2, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FULL_DIAGNOSIS_QUESTIONS } from '@/lib/data/full-diagnosis-questions';
import { FREE_DIAGNOSIS_QUESTIONS } from '@/lib/data/diagnosis-questions'; 
import { SimcheungDiagnosisEngine } from '@/lib/logic/simcheung-diagnosis';

function DiagnosisContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session } = useSession();
    const type = searchParams?.get('type') || 'free'; // daily, personality, or free
    
    const [step, setStep] = useState(-1); // -1: Intro, 0~N: Questions, N+1: Result
    const [answers, setAnswers] = useState<Record<string | number, number>>({});
    const [questions, setQuestions] = useState<any[]>([]);
    const [result, setResult] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [dailyTheme, setDailyTheme] = useState<string>('');
    const [dailyGreeting, setDailyGreeting] = useState<string>('');

    const DEFAULT_LIKERT_OPTIONS = [
        { label: '전혀 그렇지 않다', score: 1 },
        { label: '그렇지 않다', score: 2 },
        { label: '보통이다', score: 3 },
        { label: '그렇다', score: 4 },
        { label: '매우 그렇다', score: 5 },
    ];

    const fetchedRef = React.useRef<string | null>(null);

    useEffect(() => {
        // 'daily'가 아닌 경우(정적 질문)에만 즉시 로드
        if (type !== 'daily' && fetchedRef.current !== type) {
            loadQuestions();
            fetchedRef.current = type;
        }
    }, [type]);

    const loadQuestions = async () => {
        setLoadingQuestions(true);
        setLoadingProgress(10); // 시작점
        
        // 시뮬레이션된 프로그레스 업데이트 (API 응답 전까지 시각적 만족감 제공)
        const progressInterval = setInterval(() => {
            setLoadingProgress(prev => (prev < 90 ? prev + 2 : prev));
        }, 200);

        try {
            let loadedQuestions = [];
            if (type === 'daily') {
                const res = await fetch('/api/diagnosis/dynamic-questions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userName: session?.user?.name || '요원' })
                });
                if (res.ok) {
                    const data = await res.json();
                    loadedQuestions = data.questions || [];
                    setDailyTheme(data.theme || '');
                    setDailyGreeting(data.greeting || '');
                } else {
                    // Fallback to static set if API fails
                    loadedQuestions = (FREE_DIAGNOSIS_QUESTIONS || []).slice(0, 16);
                    setDailyTheme('오늘의 회복 리듬체크');
                }
            } else if (type === 'personality') {
                loadedQuestions = FULL_DIAGNOSIS_QUESTIONS;
            } else {
                loadedQuestions = FREE_DIAGNOSIS_QUESTIONS || [];
            }

            const formattedQuestions = loadedQuestions.map((q: any) => ({
                ...q,
                options: q.options || DEFAULT_LIKERT_OPTIONS
            }));
            
            setQuestions(formattedQuestions);
            setLoadingProgress(100);
            return formattedQuestions; // 결과 반환
        } catch (error) {
            console.error('Failed to load questions', error);
            return [];
        } finally {
            clearInterval(progressInterval);
            setLoadingQuestions(false);
        }
    };

    const handleStartDiagnosis = async () => {
        if (questions.length > 0) {
            setStep(0);
            return;
        }
        const loaded = await loadQuestions();
        if (loaded && loaded.length > 0) {
            setStep(0);
        }
    };

    const handleAnswer = (option: any) => {
        const currentQuestion = questions[step];
        const newAnswers = { ...answers, [currentQuestion.id]: option.score };
        setAnswers(newAnswers);

        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            calculateAndSaveResults(newAnswers);
        }
    };

    const calculateAndSaveResults = async (finalAnswers: Record<string | number, number>) => {
        setIsSaving(true);
        try {
            let calculationResult;
            if (type === 'personality') {
                calculationResult = SimcheungDiagnosisEngine.calculateResults({ 
                    answers: finalAnswers as any, 
                    questions: questions as any 
                });
            } else if (type === 'free') {
                calculationResult = SimcheungDiagnosisEngine.calculateFreeDiagnosis(finalAnswers as any, questions);
            } else {
                const total = Object.values(finalAnswers).reduce((a, b) => a + b, 0);
                const max = questions.length * 5;
                const percentage = (total / max) * 100;
                
                calculationResult = {
                    totalScore: Math.round(percentage),
                    summary: "오늘의 회복 리듬이 측정되었습니다. 포인트를 획득하셨습니다!",
                    reward: 100,
                    type: 'daily'
                };
            }

            setResult(calculationResult);

            await fetch('/api/diagnosis/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    answers: finalAnswers,
                    result: calculationResult,
                    points: type === 'daily' ? 100 : 0
                })
            });

            setStep(questions.length); 
        } catch (err) {
            console.error('Save error', err);
            setStep(questions.length); 
        } finally {
            setIsSaving(false);
        }
    };

    const progress = questions.length > 0 ? ((step + 1) / questions.length) * 100 : 0;

    const getThemeColors = () => {
        if (type === 'daily') {
            return {
                accent: 'bg-reward-gold',
                text: 'text-obsidian',
                border: 'hover:border-reward-gold',
                progress: 'bg-reward-gold',
                button: 'bg-obsidian hover:bg-reward-gold',
                badge: 'bg-reward-gold text-obsidian'
            };
        }
        return {
            accent: 'bg-chapter-accent',
            text: 'text-chapter-accent',
            border: 'hover:border-chapter-accent',
            progress: 'bg-chapter-accent',
            button: 'bg-obsidian hover:bg-chapter-accent',
            badge: 'bg-chapter-accent/10 text-chapter-accent'
        };
    };

    const theme = getThemeColors();

    return (
        <div className={`min-h-screen ${type === 'daily' ? 'bg-[#F9F7F2]' : 'bg-mist'} flex flex-col items-center justify-center p-4 transition-colors duration-500`}>
            <div className="max-w-2xl w-full">
                <AnimatePresence mode="wait">
                    {step === -1 && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center space-y-10"
                        >
                            <div className="space-y-4">
                                <Badge className={`${theme.badge} border-none px-4 py-1.5 text-xs font-black tracking-[0.2em] uppercase`}>
                                    {type === 'daily' ? 'DAILY RECOVERY CHECK-IN' : 'CORE PERSONALITY DIAGNOSIS'}
                                </Badge>
                                <h1 className="text-5xl md:text-6xl font-black text-obsidian tracking-tighter leading-tight">
                                    {type === 'daily' ? (
                                        <>오늘의 회복 리듬 측정</>
                                    ) : (
                                        <>당신의 내면 세계를<br /><span className="text-chapter-accent">분석합니다</span></>
                                    )}
                                </h1>
                                <p className="text-slate font-medium text-lg max-w-md mx-auto">
                                    {type === 'daily' 
                                        ? (dailyGreeting || '16개의 AI 최적화 질문으로 오늘 하루의 에너지를 확인하고 100PT를 받으세요.')
                                        : '정교한 질문을 통해 당신만의 고유한 회복 프로토콜을 설계합니다.'}
                                </p>
                            </div>

                            {type === 'daily' && dailyTheme && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-reward-gold/10 border border-reward-gold/20 p-4 rounded-2xl max-w-sm mx-auto"
                                >
                                    <span className="text-reward-gold font-black text-sm uppercase tracking-tighter flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 mr-2" /> {dailyTheme}
                                    </span>
                                </motion.div>
                            )}

                            <div className="flex flex-col gap-4">
                                <Button 
                                    size="lg" 
                                    onClick={handleStartDiagnosis} 
                                    disabled={loadingQuestions}
                                    className={`h-20 text-2xl font-black rounded-3xl ${theme.button} text-white transition-all shadow-2xl relative overflow-hidden`}
                                >
                                    {/* Progress Background Overlay */}
                                    {loadingQuestions && (
                                        <motion.div 
                                            className="absolute left-0 top-0 bottom-0 bg-white/20 z-0"
                                            initial={{ width: '0%' }}
                                            animate={{ width: `${loadingProgress}%` }}
                                            transition={{ ease: "linear" }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center justify-center">
                                        {loadingQuestions ? (
                                            <>
                                                <Loader2 className="animate-spin mr-3 w-6 h-6" />
                                                질문 분석 중... {loadingProgress}%
                                            </>
                                        ) : '진단 시작하기'}
                                    </span>
                                </Button>
                                <Button variant="ghost" asChild className="text-slate font-bold">
                                    <Link href="/dashboard">나중에 하기</Link>
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step >= 0 && step < questions.length && (
                        <motion.div
                            key={`step-${step}`}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-12"
                        >
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <span className={`text-sm font-black ${theme.text} uppercase tracking-widest`}>
                                            {questions[step]?.category || 'Recovery'} Analysis
                                        </span>
                                        <h2 className="text-3xl font-black text-obsidian tracking-tight">
                                            #{step + 1}. {questions[step]?.text || questions[step]?.question}
                                        </h2>
                                    </div>
                                    <span className="font-black text-slate text-xl">{step + 1}/{questions.length}</span>
                                </div>
                                <Progress value={progress} className={`h-3 rounded-full bg-white border border-line [&>div]:${theme.progress}`} />
                            </div>

                            <div className="grid gap-4">
                                {questions[step]?.options.map((option: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(option)}
                                        className={`p-6 text-left bg-white border-2 border-transparent rounded-[24px] ${theme.border} hover:shadow-xl transition-all group flex items-center justify-between`}
                                    >
                                        <span className="text-xl font-bold text-obsidian group-hover:text-obsidian">{option.label}</span>
                                        <ChevronRight className={`w-6 h-6 text-line group-hover:${theme.text} transition-transform group-hover:translate-x-1`} />
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-center">
                                <Button variant="ghost" className="text-slate font-bold" onClick={() => step > 0 && setStep(step - 1)}>
                                    <ChevronLeft className="mr-1 w-4 h-4" /> 이전 질문으로
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === questions.length && result && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-10 py-10"
                        >
                            <div className="text-center space-y-4">
                                <div className={`w-24 h-24 ${type === 'daily' ? 'bg-reward-gold' : 'bg-chapter-accent'} rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl`}>
                                    <CheckCircle2 className="w-12 h-12 text-white" />
                                </div>
                                <h2 className="text-4xl font-black text-obsidian tracking-tighter">진단이 완료되었습니다!</h2>
                                <p className="text-slate font-medium">분석된 데이터를 바탕으로 개인화 솔루션을 구성했습니다.</p>
                            </div>

                            <Card className={`bg-white ${type === 'daily' ? 'border-reward-gold/30 shadow-reward-gold/5' : 'border-line'} border-2 rounded-[40px] p-10 shadow-2xl text-center space-y-8 relative overflow-hidden`}>
                                {type === 'daily' && <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.05),transparent)] pointer-events-none" />}
                                
                                <div className="space-y-2 relative z-10">
                                    <div className="text-sm font-black text-slate uppercase tracking-widest opacity-40">Total Recovery Score</div>
                                    <div className={`text-8xl font-black ${type === 'daily' ? 'text-reward-gold' : 'text-chapter-accent'} tracking-tighter`}>
                                        {result.totalScore}
                                    </div>
                                </div>

                                <p className="text-2xl font-bold text-obsidian leading-tight relative z-10">
                                    {result.summary || "훌륭한 회복 리듬을 보여주고 계십니다."}
                                </p>

                                {result.reward && (
                                    <motion.div 
                                        initial={{ scale: 0, rotate: -10 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', damping: 12, delay: 0.5 }}
                                        className="relative z-10"
                                    >
                                        <Badge className="bg-reward-gold text-obsidian text-xl px-8 py-3 rounded-2xl font-black shadow-[0_10px_30px_rgba(212,175,55,0.3)] border-none">
                                            <Sparkles className="w-5 h-5 mr-2 fill-current" />
                                            +{result.reward} PT 획득!
                                        </Badge>
                                    </motion.div>
                                )}
                            </Card>

                            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                                <Button size="lg" asChild className={`h-20 flex-1 text-xl font-black rounded-3xl ${type === 'daily' ? 'bg-obsidian hover:bg-reward-gold hover:text-obsidian' : 'bg-chapter-accent'} text-white shadow-xl transition-all`}>
                                    <Link href="/dashboard">대시보드로 돌아가기</Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild className="h-20 flex-1 text-xl font-black rounded-3xl border-2 border-line hover:border-obsidian transition-all">
                                    <Link href="/ai-navigator">AI 네비게이터 확인</Link>
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function DiagnosisPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-mist flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-chapter-accent" />
            </div>
        }>
            <DiagnosisContent />
        </Suspense>
    );
}
