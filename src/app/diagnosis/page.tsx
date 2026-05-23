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
    const journey = searchParams?.get('journey');
    
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
            loadQuestions().catch(err => {
                console.error("Gracefully handled loadQuestions error inside mount hook:", err);
            });
            fetchedRef.current = type;
        }
    }, [type]);

    const getLoadingText = (prog: number) => {
        if (prog < 40) return "유니클 회복 패턴 매칭 중...";
        if (prog < 75) return "회복 데이터를 수집하고 있습니다...";
        if (prog < 90) return "맞춤형 리듬 질문을 생성하고 있습니다...";
        if (prog < 99) return "진단지를 정교하게 조율하는 중...";
        return "분석 완료! 문진을 시작합니다.";
    };

    const loadQuestions = async () => {
        setLoadingQuestions(true);
        setLoadingProgress(0);
        
        let currentProgress = 0;
        let isDone = false;

        // 지능형 slow-start 가속 시뮬레이션 타이머
        const progressInterval = setInterval(() => {
            if (isDone) return;
            
            if (currentProgress < 75) {
                currentProgress += Math.random() * 2 + 0.5; // 처음엔 신중하게 천천히
            } else if (currentProgress < 90) {
                currentProgress += Math.random() * 0.8 + 0.15; // 75~90% 구간 더 천천히 진행
            } else if (currentProgress < 99) {
                currentProgress += 0.05; // 90% 이상 대기 정체 방어선 (초미세 진행)
            }
            
            const nextVal = Math.min(99, currentProgress);
            setLoadingProgress(nextVal);
        }, 100);

        let loadedQuestions = [];

        try {
            if (type === '60s') {
                const isForce = searchParams?.get('force') === 'true';
                const urlSuffix = isForce ? '?force=true' : '';
                const res = await fetch(`/api/questions/daily${urlSuffix}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (res.ok) {
                    const data = await res.json();
                    loadedQuestions = data.question?.questions || [];
                    setDailyTheme(data.question?.theme || '오늘의 60초 회복 리듬체크');
                    setDailyGreeting('오늘 하루 나의 회복 에너지를 체크하고 100PT를 받으세요.');
                } else {
                    throw new Error('Daily questions API failed');
                }
            } else if (type === 'daily') {
                const res = await fetch('/api/diagnosis/dynamic-questions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userName: session?.user?.name || '유저' })
                });
                if (res.ok) {
                    const data = await res.json();
                    loadedQuestions = data.questions || [];
                    setDailyTheme(data.theme || '');
                    setDailyGreeting(data.greeting || '');
                } else {
                    throw new Error('Dynamic questions API failed');
                }
            } else if (type === 'personality') {
                loadedQuestions = FULL_DIAGNOSIS_QUESTIONS;
            } else {
                loadedQuestions = FREE_DIAGNOSIS_QUESTIONS || [];
            }
        } catch (error) {
            console.error('Failed to load questions, applying premium fallback:', error);
            // API 500 등 실패 시에도 완벽한 5개 Fallback 질문 준비
            if (type === '60s') {
                loadedQuestions = [
                    { id: "f1", category: "Physical", text: "오늘 나의 전반적인 신체 컨디션과 에너지는 아주 좋은 편이다." },
                    { id: "f2", category: "Mindset", text: "오늘 하루를 시작할 때 내 마음은 아주 편안하고 여유로웠다." },
                    { id: "f3", category: "Emotional", text: "최근에 스트레스나 일상적인 피로감이 거의 느껴지지 않는다." },
                    { id: "f4", category: "Social", text: "요즘 주변 사람들과 이야기하고 소통할 때 큰 즐거움을 느낀다." },
                    { id: "f5", category: "Physical", text: "신체적으로 특별히 통증이나 뻐근하게 굳은 부위가 없다." }
                ];
                setDailyTheme('60초 회복 리듬체크');
            } else {
                loadedQuestions = (FREE_DIAGNOSIS_QUESTIONS || []).slice(0, 16);
                setDailyTheme('오늘의 회복 리듬체크');
            }
        }

        // 성공하든 실패하든 무조건 타이머 해제 후 60fps 초고속 피날레 가속 개시
        isDone = true;
        clearInterval(progressInterval);

        const formattedQuestions = loadedQuestions.map((q: any) => ({
            ...q,
            options: (q.options && q.options.length > 0) ? q.options : DEFAULT_LIKERT_OPTIONS
        }));
        
        setQuestions(formattedQuestions);

        // 데이터 응답 확인/가공 직후 99% -> 100% 초고속 피날레 가시화
        let finishVal = currentProgress;
        await new Promise<void>((resolve) => {
            const finishInterval = setInterval(() => {
                finishVal += 6.5; // 빠르게 쭈욱 끌어올림
                if (finishVal >= 100) {
                    setLoadingProgress(100);
                    clearInterval(finishInterval);
                    resolve();
                } else {
                    setLoadingProgress(finishVal);
                }
            }, 16);
        });

        // 60초 리듬체크 및 일일 리듬체크 진입 시 번거로운 인트로 버튼 없이 질문지 즉시 진입!
        if (type === '60s' || type === 'daily') {
            setStep(0);
        }
        
        setLoadingQuestions(false);
        return formattedQuestions;
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
                    type: type === '60s' ? 'daily' : type,
                    journey,
                    answers: finalAnswers,
                    result: calculationResult,
                    points: (type === 'daily' || type === '60s') ? 100 : 0
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
        if (type === 'daily' || type === '60s') {
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
        <div className={`min-h-screen ${(type === 'daily' || type === '60s') ? 'bg-[#F9F7F2]' : 'bg-mist'} flex flex-col items-center justify-start md:justify-center p-4 pt-3 md:pt-4 transition-colors duration-500`}>
            <div className="max-w-2xl w-full mt-2 md:mt-0">
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
                                    {type === '60s' ? '60s RECOVERY CHECK-IN' : type === 'daily' ? 'DAILY RECOVERY CHECK-IN' : 'CORE PERSONALITY DIAGNOSIS'}
                                </Badge>
                                <h1 className="text-5xl md:text-6xl font-black text-obsidian tracking-tighter leading-tight">
                                    {type === '60s' ? (
                                        <>60초 오늘의 리듬체크</>
                                    ) : type === 'daily' ? (
                                        <>오늘의 회복 리듬 측정</>
                                    ) : (
                                        <>당신의 내면 세계를<br /><span className="text-chapter-accent">분석합니다</span></>
                                    )}
                                </h1>
                                <p className="text-slate font-medium text-lg max-w-md mx-auto">
                                    {type === '60s'
                                        ? '사진 촬영이나 번거로운 과정 없이, 오늘 나의 몸과 마음을 직관적으로 확인하고 100PT를 받으세요.'
                                        : type === 'daily' 
                                            ? (dailyGreeting || '16개의 AI 최적화 질문으로 오늘 하루의 에너지를 확인하고 100PT를 받으세요.')
                                            : '정교한 질문을 통해 당신만의 고유한 회복 프로토콜을 설계합니다.'}
                                </p>
                            </div>

                            {(type === 'daily' || type === '60s') && dailyTheme && (
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

                            <div className="flex flex-col gap-3">
                                <Button 
                                    size="lg" 
                                    onClick={handleStartDiagnosis} 
                                    disabled={loadingQuestions}
                                    className={`h-16 md:h-20 ${loadingQuestions ? 'text-base md:text-lg' : 'text-xl md:text-2xl'} font-black rounded-2xl md:rounded-3xl ${theme.button} text-white transition-all shadow-xl relative overflow-hidden`}
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
                                    <span className="relative z-10 flex items-center justify-center px-4">
                                        {loadingQuestions ? (
                                            <>
                                                <Loader2 className="animate-spin mr-2 w-5 h-5 shrink-0" />
                                                <span className="tracking-tight text-white truncate max-w-[200px] sm:max-w-none">{getLoadingText(loadingProgress)}</span>
                                                <span className="ml-1.5 font-mono bg-white/20 px-1.5 py-0.2 rounded-full text-xs shrink-0">{Math.round(loadingProgress)}%</span>
                                            </>
                                        ) : '진단 시작하기'}
                                    </span>
                                </Button>
                                <Button variant="ghost" asChild className="text-slate font-bold text-sm md:text-base">
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
                            className="space-y-4 md:space-y-8"
                        >
                            <div className="space-y-3 md:space-y-5">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-0.5">
                                        <span className={`text-[10px] md:text-xs font-black ${theme.text} uppercase tracking-widest`}>
                                            {questions[step]?.category || 'Recovery'} Analysis
                                        </span>
                                        <h2 className="text-lg md:text-2xl font-black text-obsidian tracking-tight leading-snug">
                                            #{step + 1}. {questions[step]?.text || questions[step]?.question}
                                        </h2>
                                    </div>
                                    <span className="font-black text-slate text-sm md:text-lg shrink-0 ml-4">{step + 1}/{questions.length}</span>
                                </div>
                                <Progress value={progress} className={`h-2 rounded-full bg-white border border-line [&>div]:${theme.progress}`} />
                            </div>

                            <div className="grid gap-1.5 md:gap-3">
                                {questions[step]?.options.map((option: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(option)}
                                        className={`p-3.5 md:p-5 text-left bg-white border-2 border-transparent rounded-[16px] md:rounded-[24px] ${theme.border} hover:shadow-md transition-all group flex items-center justify-between`}
                                    >
                                        <span className="text-sm md:text-base font-bold text-obsidian group-hover:text-obsidian">{option.label}</span>
                                        <ChevronRight className={`w-4 h-4 md:w-5 md:h-5 text-line group-hover:${theme.text} transition-transform group-hover:translate-x-1`} />
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-center pt-2">
                                <Button variant="ghost" className="text-slate font-bold text-xs md:text-sm h-8" onClick={() => step > 0 && setStep(step - 1)}>
                                    <ChevronLeft className="mr-1 w-3.5 h-3.5" /> 이전 질문으로
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
                                <Button size="lg" asChild className={`h-20 flex-1 text-xl font-black rounded-3xl ${(type === 'daily' || type === '60s') ? 'bg-obsidian hover:bg-reward-gold hover:text-obsidian text-white' : 'bg-chapter-accent text-white'} shadow-xl transition-all`}>
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
