'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, CheckCircle2, Sparkles, Activity, Brain, Clock, PlusCircle, ArrowRight, Loader2, Zap, Sparkle, Heart, Flame, ShieldAlert, Check } from 'lucide-react';
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

    // Premium interactive selection states
    const [selectedScore, setSelectedScore] = useState<number | null>(null);
    const [showBridge, setShowBridge] = useState(false);
    const [bridgeTargetStep, setBridgeTargetStep] = useState<number>(0);
    const [simulatedAnalysisStep, setSimulatedAnalysisStep] = useState<number>(0);

    const DEFAULT_LIKERT_OPTIONS = [
        { label: '전혀 그렇지 않다', score: 1 },
        { label: '그렇지 않다', score: 2 },
        { label: '보통이다', score: 3 },
        { label: '그렇다', score: 4 },
        { label: '매우 그렇다', score: 5 },
    ];

    const fetchedRef = React.useRef<string | null>(null);

    useEffect(() => {
        if (type !== 'daily' && fetchedRef.current !== type) {
            loadQuestions().catch(err => {
                console.error("loadQuestions error inside mount hook:", err);
            });
            fetchedRef.current = type;
        }
    }, [type]);

    const getLoadingText = (prog: number) => {
        if (prog < 40) return "유니클 회복 패턴 매칭 중...";
        if (prog < 75) return "회복 데이터를 수집하고 있습니다...";
        if (prog < 90) return "맞춤형 리듬 질문을 생성하고 있습니다...";
        if (prog < 99) return "리듬체크지를 정교하게 조율하는 중...";
        return "분석 완료! 문진을 시작합니다.";
    };

    const loadQuestions = async () => {
        setLoadingQuestions(true);
        setLoadingProgress(0);
        
        let currentProgress = 0;
        let isDone = false;

        const progressInterval = setInterval(() => {
            if (isDone) return;
            
            if (currentProgress < 75) {
                currentProgress += Math.random() * 3 + 1; 
            } else if (currentProgress < 90) {
                currentProgress += Math.random() * 1.5 + 0.3; 
            } else if (currentProgress < 99) {
                currentProgress += 0.1; 
            }
            
            const nextVal = Math.min(99, currentProgress);
            setLoadingProgress(nextVal);
        }, 80);

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

        isDone = true;
        clearInterval(progressInterval);

        const formattedQuestions = loadedQuestions.map((q: any) => ({
            ...q,
            options: (q.options && q.options.length > 0) ? q.options : DEFAULT_LIKERT_OPTIONS
        }));
        
        setQuestions(formattedQuestions);

        let finishVal = currentProgress;
        await new Promise<void>((resolve) => {
            const finishInterval = setInterval(() => {
                finishVal += 8.5; 
                if (finishVal >= 100) {
                    setLoadingProgress(100);
                    clearInterval(finishInterval);
                    resolve();
                } else {
                    setLoadingProgress(finishVal);
                }
            }, 16);
        });

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

    // Calculate dynamic chapters
    const totalQ = questions.length || 16;
    let currentChapter = 1;
    let totalChapters = 3;
    let chapterName = "신체 컨디션 및 에너지 리듬체크";
    let bridgeText = "";

    if (totalQ <= 5) {
        // For 60s check-in
        totalChapters = 2;
        if (step < 3) {
            currentChapter = 1;
            chapterName = "오늘의 신체 및 멘탈 상태";
            bridgeText = "훌륭합니다! 전반부 피드백을 기록했습니다. 이제 마지막 오늘의 일상 에너지 마무리를 진행해 볼까요?";
        } else {
            currentChapter = 2;
            chapterName = "일일 생활 리듬 체크";
        }
    } else {
        // For 16 questions or personality
        totalChapters = 3;
        const qPerChapter = Math.ceil(totalQ / 3);
        if (step < qPerChapter) {
            currentChapter = 1;
            chapterName = "신체 피로도 및 활력 수준";
            bridgeText = "수고하셨습니다! 신체 피로 점수 조정을 무사히 마쳤습니다. 이제 2장인 마음의 누적 피로와 멘탈 회복도를 가볍게 짚어볼까요?";
        } else if (step < qPerChapter * 2) {
            currentChapter = 2;
            chapterName = "마음 스트레스 및 정신 탄력성";
            bridgeText = "훌륭합니다! 멘탈 복원력 스코어 연산을 마쳤습니다. 마지막 3장인 매일의 영양 섭취 및 일상 생활 리듬 리듬체크으로 넘어가 보겠습니다.";
        } else {
            currentChapter = 3;
            chapterName = "일반 식습관 및 수면 밸런스";
        }
    }

    const handleAnswerIndex = (score: number) => {
        setSelectedScore(score);
        
        const currentQuestion = questions[step];
        const newAnswers = { ...answers, [currentQuestion.id]: score };
        
        setTimeout(() => {
            setAnswers(newAnswers);
            setSelectedScore(null);

            // Determine if chapter is transitioning to show bridge
            const qPerChapter = Math.ceil(totalQ / 3);
            const isTransition60s = totalQ <= 5 && step === 2;
            const isTransition16 = totalQ > 5 && (step === qPerChapter - 1 || step === qPerChapter * 2 - 1);

            if (isTransition60s || isTransition16) {
                setBridgeTargetStep(step + 1);
                setShowBridge(true);
            } else if (step < questions.length - 1) {
                setStep(step + 1);
            } else {
                calculateAndSaveResults(newAnswers);
            }
        }, 300);
    };

    const handleBridgeNext = () => {
        setShowBridge(false);
        setStep(bridgeTargetStep);
    };

    const calculateAndSaveResults = async (finalAnswers: Record<string | number, number>) => {
        setIsSaving(true);
        setSimulatedAnalysisStep(1); // Stage 1 of checklist loader

        // Simulated highly aesthetic progress stages to match premium expectation
        await new Promise(r => setTimeout(r, 900));
        setSimulatedAnalysisStep(2);
        await new Promise(r => setTimeout(r, 800));
        setSimulatedAnalysisStep(3);
        await new Promise(r => setTimeout(r, 700));

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
                const min = questions.length; 
                const max = questions.length * 5; 
                const percentage = max > min ? ((total - min) / (max - min)) * 100 : 0;
                
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
            setSimulatedAnalysisStep(0);
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
                    {/* A. Loading State Screen */}
                    {isSaving && (
                        <motion.div
                            key="saving-analysis"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white border border-line rounded-[40px] p-8 md:p-12 shadow-2xl space-y-10 text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Activity className="w-40 h-40 text-primary" />
                            </div>

                            <div className="space-y-3">
                                <Badge className="bg-[#D4B06F]/15 text-[#D4B06F] border-none px-4 py-1 text-xs font-black tracking-widest uppercase">
                                    AI Recovery Analyzer
                                </Badge>
                                <h2 className="text-lg md:text-3xl font-black text-obsidian tracking-tighter">
                                    회복 패턴 매칭 시퀀스
                                </h2>
                                <p className="text-[11px] md:text-sm text-slate font-semibold max-w-sm mx-auto">
                                    기록된 문항을 지능형 매트릭스로 분석해 고유한 바이오리듬 예측 커브를 생성하고 있습니다.
                                </p>
                            </div>

                            {/* Sequential indicators Checklist */}
                            <div className="max-w-md mx-auto bg-mist/20 border border-line/40 rounded-3xl p-6 text-left space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black
                                            ${simulatedAnalysisStep >= 1 ? 'bg-reward-gold text-obsidian' : 'bg-line/40 text-slate/40'}
                                        `}>
                                            {simulatedAnalysisStep > 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "1"}
                                        </div>
                                        <span className={`text-sm font-bold ${simulatedAnalysisStep >= 1 ? 'text-obsidian' : 'text-slate/40'}`}>
                                            신체 누적 피로지수 정량 연산
                                        </span>
                                    </div>
                                    {simulatedAnalysisStep >= 1 && (
                                        <span className="text-[10px] font-black text-reward-gold animate-pulse">
                                            {simulatedAnalysisStep > 1 ? "완료" : "연산 중..."}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black
                                            ${simulatedAnalysisStep >= 2 ? 'bg-reward-gold text-obsidian' : 'bg-line/40 text-slate/40'}
                                        `}>
                                            {simulatedAnalysisStep > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "2"}
                                        </div>
                                        <span className={`text-sm font-bold ${simulatedAnalysisStep >= 2 ? 'text-obsidian' : 'text-slate/40'}`}>
                                            멘탈 회복 및 수면 스트레스 대조
                                        </span>
                                    </div>
                                    {simulatedAnalysisStep >= 2 && (
                                        <span className="text-[10px] font-black text-reward-gold animate-pulse">
                                            {simulatedAnalysisStep > 2 ? "완료" : "대조 중..."}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black
                                            ${simulatedAnalysisStep >= 3 ? 'bg-reward-gold text-obsidian' : 'bg-line/40 text-slate/40'}
                                        `}>
                                            3
                                        </div>
                                        <span className={`text-sm font-bold ${simulatedAnalysisStep >= 3 ? 'text-obsidian' : 'text-slate/40'}`}>
                                            개인 맞춤형 12주 호전 기대 커브 생성
                                        </span>
                                    </div>
                                    {simulatedAnalysisStep >= 3 && (
                                        <span className="text-[10px] font-black text-reward-gold animate-pulse animate-bounce">
                                            구축 완료
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-slate font-bold text-xs">
                                <Loader2 className="animate-spin text-reward-gold w-4 h-4" />
                                정밀 리포트를 바인딩하고 있습니다...
                            </div>
                        </motion.div>
                    )}

                    {/* B. Empathetic Comfort Bridge Screen */}
                    {showBridge && !isSaving && (
                        <motion.div
                            key="comfort-bridge"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white border border-line rounded-[40px] p-8 md:p-12 shadow-2xl text-center space-y-8 relative overflow-hidden"
                        >
                            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#D4B06F]/5 rounded-full pointer-events-none" />
                            
                            <div className="w-20 h-20 bg-reward-gold/10 rounded-full flex items-center justify-center mx-auto shadow-inner text-reward-gold">
                                <Heart className="w-10 h-10 fill-current animate-pulse" />
                            </div>

                            <div className="space-y-3">
                                <Badge className="bg-reward-gold/15 text-reward-gold border-none px-4 py-1 text-[10px] font-black tracking-widest uppercase">
                                    Chapter Completed
                                </Badge>
                                <h2 className="text-lg md:text-3xl font-black text-obsidian tracking-tight leading-tight">
                                    성공적으로 기록되었습니다!
                                </h2>
                                <p className="text-slate font-semibold text-xs md:text-sm leading-relaxed px-4 max-w-md mx-auto">
                                    {bridgeText}
                                </p>
                            </div>

                            <Button
                                onClick={handleBridgeNext}
                                className="w-full max-w-sm h-16 bg-obsidian hover:bg-reward-gold text-white hover:text-obsidian text-lg font-black rounded-2xl shadow-xl transition-all border-none"
                            >
                                다음 챕터로 진행하기
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </motion.div>
                    )}

                    {/* C. Intro Screen */}
                    {step === -1 && !isSaving && !showBridge && (
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
                                <h1 className="font-black text-obsidian tracking-tighter leading-tight text-xl md:text-4xl">
                                    {type === '60s' ? (
                                        <>60초 오늘의 리듬체크</>
                                    ) : type === 'daily' ? (
                                        <>오늘의 회복 리듬 측정</>
                                    ) : (
                                        <>당신의 내면 세계를<br /><span className="text-chapter-accent">분석합니다</span></>
                                    )}
                                </h1>
                                <p className="text-[11px] md:text-sm text-slate font-medium max-w-md mx-auto">
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
                                        ) : '리듬체크 시작하기'}
                                    </span>
                                </Button>
                                <Button variant="ghost" asChild className="text-slate font-bold text-sm md:text-base">
                                    <Link href="/dashboard">나중에 하기</Link>
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* D. Questions Active Screen */}
                    {step >= 0 && step < questions.length && !isSaving && !showBridge && (
                        <motion.div
                            key={`step-${step}`}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            className="space-y-6 md:space-y-10"
                        >
                            {/* Header progress */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <span className={`text-[10px] md:text-xs font-black ${theme.text} uppercase tracking-widest bg-white border border-line px-3 py-1 rounded-full shadow-sm`}>
                                            Chapter {currentChapter}/{totalChapters}: {chapterName}
                                        </span>
                                        <h2 className="text-lg md:text-2xl font-black text-obsidian tracking-tight leading-snug pt-1">
                                            #{step + 1}. {questions[step]?.text || questions[step]?.question}
                                        </h2>
                                    </div>
                                    <span className="font-black text-slate text-sm md:text-lg shrink-0 ml-4">{step + 1}/{questions.length}</span>
                                </div>
                                <Progress value={progress} className={`h-2 rounded-full bg-white border border-line [&>div]:${theme.progress} transition-all`} />
                            </div>

                            {/* Upgraded 5-point premium Likert selection */}
                            <div className="space-y-8 py-8 bg-white border border-line shadow-2xl rounded-[32px] p-6 relative">
                                <div className="absolute left-0 top-0 bottom-0 w-2 bg-reward-gold" />
                                
                                <div className="flex justify-between text-[10px] font-black text-slate/50 uppercase tracking-widest px-4">
                                    <span>전혀 아니다</span>
                                    <span>매우 그렇다</span>
                                </div>

                                <div className="relative flex items-center justify-between max-w-md mx-auto px-6">
                                    {/* Central connecting bar */}
                                    <div className="absolute left-10 right-10 h-[3px] bg-line z-0" />
                                    
                                    {[1, 2, 3, 4, 5].map((score) => {
                                        const isSelected = selectedScore === score;
                                        
                                        // Dynamic sizing based on choice extreme
                                        const sizes = {
                                            1: 'w-10 h-10', // Strongly Disagree
                                            2: 'w-8 h-8',   // Disagree
                                            3: 'w-6 h-6',   // Neutral
                                            4: 'w-8 h-8',   // Agree
                                            5: 'w-10 h-10'  // Strongly Agree
                                        }[score];

                                        const activeColors = {
                                            1: 'bg-red-500 border-red-500 shadow-red-500/30 text-white',
                                            2: 'bg-orange-400 border-orange-400 shadow-orange-400/20 text-white',
                                            3: 'bg-slate-400 border-slate-400 shadow-slate-400/20 text-white',
                                            4: 'bg-emerald-400 border-emerald-400 shadow-emerald-400/20 text-white',
                                            5: 'bg-secondary border-emerald-600 shadow-emerald-600/30 text-white'
                                        }[score];

                                        const hoverColors = {
                                            1: 'hover:border-red-500 hover:bg-red-50',
                                            2: 'hover:border-orange-400 hover:bg-orange-50',
                                            3: 'hover:border-slate-400 hover:bg-surface',
                                            4: 'hover:border-emerald-400 hover:bg-emerald-50',
                                            5: 'hover:border-emerald-600 hover:bg-emerald-50'
                                        }[score];

                                        const labels = {
                                            1: '전혀',
                                            2: '비동의',
                                            3: '보통',
                                            4: '동의',
                                            5: '매우'
                                        }[score];

                                        return (
                                            <div key={score} className="flex flex-col items-center gap-2 z-10">
                                                <button
                                                    onClick={() => handleAnswerIndex(score)}
                                                    className={`
                                                        rounded-full border-2 bg-white transition-all duration-300 transform hover:scale-115 flex items-center justify-center font-black text-xs shadow-md
                                                        ${sizes}
                                                        ${isSelected ? activeColors : `border-line ${hoverColors} text-slate/50`}
                                                    `}
                                                    aria-label={labels}
                                                >
                                                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                </button>
                                                <span className={`text-[9px] font-black tracking-tight ${isSelected ? 'text-obsidian' : 'text-slate/40'}`}>
                                                    {labels}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-center pt-2">
                                <Button 
                                    variant="ghost" 
                                    className="text-slate font-bold text-xs md:text-sm h-8 hover:text-obsidian" 
                                    onClick={() => step > 0 && setStep(step - 1)}
                                    disabled={step === 0}
                                >
                                    <ChevronLeft className="mr-1 w-3.5 h-3.5" /> 이전 질문으로
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* E. Result Screen */}
                    {step === questions.length && result && !isSaving && !showBridge && (
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
                                <h2 className="text-lg md:text-3xl font-black text-obsidian tracking-tighter">리듬체크가 완료되었습니다!</h2>
                                <p className="text-[11px] md:text-sm text-slate font-medium">분석된 데이터를 바탕으로 개인화 솔루션을 구성했습니다.</p>
                            </div>

                            <Card className={`bg-white ${type === 'daily' ? 'border-reward-gold/30 shadow-reward-gold/5' : 'border-line'} border-2 rounded-[40px] p-10 shadow-2xl text-center space-y-8 relative overflow-hidden`}>
                                {type === 'daily' && <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.05),transparent)] pointer-events-none" />}
                                
                                <div className="space-y-2 relative z-10">
                                    <div className="text-sm font-black text-slate uppercase tracking-widest opacity-40">Total Recovery Score</div>
                                    <div className={`text-xl font-black ${type === 'daily' ? 'text-reward-gold' : 'text-chapter-accent'} tracking-tighter`}>
                                        {result.totalScore}
                                    </div>
                                </div>

                                <p className="text-lg md:text-2xl font-bold text-obsidian leading-tight relative z-10">
                                    {result.summary || "훌륭한 회복 리듬을 보여주고 계십니다."}
                                </p>

                                {result.reward && (
                                    <motion.div 
                                        initial={{ scale: 0, rotate: -10 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', damping: 12, delay: 0.5 }}
                                        className="relative z-10"
                                    >
                                        <Badge className="bg-reward-gold text-obsidian px-8 py-3 rounded-2xl font-black shadow-[0_10px_30px_rgba(212,175,55,0.3)] border-none text-xl">
                                            <Sparkles className="w-5 h-5 mr-2 fill-current" />
                                            +{result.reward} PT 획득!
                                        </Badge>
                                    </motion.div>
                                )}
                            </Card>

                            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                                <Button size="lg" asChild className={`h-20 flex-1 text-xl font-black rounded-3xl ${(type === 'daily' || type === '60s') ? 'bg-obsidian hover:bg-reward-gold hover:text-obsidian text-white border-none' : 'bg-chapter-accent text-white border-none'} shadow-xl transition-all`}>
                                    <Link href="/dashboard">대시보드로 돌아가기</Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild className="h-20 flex-1 font-black rounded-3xl border-2 border-line hover:border-obsidian transition-all text-xl">
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

export default function DiagnosisClient() {
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
