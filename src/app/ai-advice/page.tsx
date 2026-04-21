'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, CheckCircle2, Zap, Brain, Activity, Clock, ArrowLeft, Loader2, Heart } from 'lucide-react';
import Link from 'next/link';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import { useSession } from 'next-auth/react';

export default function AiAdvicePage() {
    const { data: session, status } = useSession();
    const [advice, setAdvice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const fetchingRef = React.useRef(false);

    useEffect(() => {
        if (status === 'authenticated' && !fetchingRef.current) {
            fetchAdvice();
        } else if (status === 'unauthenticated') {
            setLoading(false);
        }
    }, [status]);

    const fetchAdvice = async () => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;
        try {
            setLoading(true);
            console.log('Fetching advice...');
            // 1. Try to get existing advice
            const res = await fetch('/api/ai/advice');
            const data = await res.json();

            if (data.advice) {
                setAdvice(data.advice);
                setLoading(false);
            } else if (data.error && data.error !== 'Advice not found') {
                console.error('API Error:', data.error);
                setLoading(false);
            } else {
                console.log('No advice found, generating new one...');
                // 2. If no advice, generate new one (POST)
                const storedScore = localStorage.getItem('recovery_last_score');
                let scoreVal = 40;
                if (storedScore) {
                    const parsed = parseInt(storedScore);
                    if (!isNaN(parsed)) scoreVal = parsed;
                }

                const generateRes = await fetch('/api/ai/advice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        scores: { q1: 50, q2: 40, q3: 60, q4: 55, q5: 45 }, // Mock detailed scores if not available
                        todayScore: scoreVal
                    })
                });
                const generateData = await generateRes.json();
                if (generateData.advice) {
                    setAdvice(generateData.advice);
                } else {
                    console.error('Generation failed:', generateData.error);
                }
                setLoading(false);
            }
        } catch (error) {
            console.error('Fetch advice error:', error);
            setLoading(false);
        } finally {
            fetchingRef.current = false;
        }
    };

    const handleToggle = async (itemId: string, currentStatus: boolean) => {
        if (!advice) return;
        setUpdating(itemId);
        try {
            const res = await fetch('/api/ai/advice', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adviceId: advice._id,
                    itemId,
                    isCompleted: !currentStatus
                })
            });
            const data = await res.json();
            setAdvice(data.advice);
        } catch (error) {
            console.error('Update item error:', error);
        } finally {
            setUpdating(null);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'PHYSICAL': return <Activity className="w-5 h-5" />;
            case 'MENTAL': return <Brain className="w-5 h-5" />;
            case 'SLEEP': return <Clock className="w-5 h-5" />;
            case 'NUTRITION': return <Heart className="w-5 h-5" />;
            default: return <Zap className="w-5 h-5" />;
        }
    };

    if (status === 'loading' || (loading && status === 'authenticated')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                    <p className="text-text-secondary font-bold">나를 위한 회복 솔루션 생성 중...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-mist rounded-3xl mx-auto flex items-center justify-center text-3xl">🔒</div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-obsidian">로그인이 필요합니다</h2>
                        <p className="text-text-secondary font-medium">개인화된 행동 조언을 받으려면 로그인해 주세요.</p>
                    </div>
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-background font-black rounded-2xl px-10 h-14">
                        <Link href="/auth/signin">로그인하기</Link>
                    </Button>
                </div>
            </div>
        );
    }

    if (!advice && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-mist rounded-3xl mx-auto flex items-center justify-center text-3xl">⚠️</div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-obsidian">조언을 불러올 수 없습니다</h2>
                        <p className="text-text-secondary font-medium">데이터 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.</p>
                    </div>
                    <Button onClick={() => fetchAdvice()} size="lg" className="bg-primary hover:bg-primary/90 text-background font-black rounded-2xl px-10 h-14">
                        다시 시도
                    </Button>
                </div>
            </div>
        );
    }

    const completedCount = advice?.adviceItems.filter((i: any) => i.isCompleted).length || 0;
    const progress = (completedCount / 3) * 100;

    return (
        <ChapterWrapper chapter="ai-navigator">
            <div className="min-h-screen bg-background pb-20">
                <div className="container mx-auto px-4 py-12 max-w-2xl">
                    <Link href="/" className="inline-flex items-center text-text-secondary hover:text-text-primary mb-12 transition-colors font-bold group">
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> 메인으로 돌아가기
                    </Link>

                    <header className="mb-16 text-center space-y-4">
                        <div className="inline-flex items-center px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black tracking-widest uppercase">
                            <Sparkles className="w-3.5 h-3.5 mr-2" />
                            Dynamic Recovery Coach
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-obsidian">오늘의 맞춤 행동 조언</h1>
                        <p className="text-lg text-slate font-medium max-w-md mx-auto leading-relaxed">
                            &quot;{advice?.aiComment}&quot;
                        </p>
                    </header>

                    <div className="relative mb-16 h-2 bg-mist rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="absolute top-0 left-0 h-full bg-primary"
                        />
                    </div>

                    <div className="space-y-6">
                        <AnimatePresence mode="popLayout">
                            {advice?.adviceItems.map((item: any, index: number) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className={`overflow-hidden border-2 transition-all duration-500 ${item.isCompleted ? 'border-primary/20 bg-primary/5' : 'border-line hover:border-primary/30 bg-surface'}`}>
                                        <CardContent className="p-0">
                                            <div className="flex items-stretch min-h-[120px]">
                                                <div className={`w-20 flex flex-col items-center justify-center border-r shrink-0 transition-colors ${item.isCompleted ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-mist/30 border-line text-slate'}`}>
                                                    {getCategoryIcon(item.category)}
                                                    <span className="text-[10px] font-black mt-2 tracking-tighter">{item.category}</span>
                                                </div>
                                                <div className="flex-1 p-8 flex items-center justify-between gap-6">
                                                    <p className={`text-xl font-bold leading-snug ${item.isCompleted ? 'text-obsidian/40 line-through' : 'text-obsidian'}`}>
                                                        {item.content}
                                                    </p>
                                                    <div className="relative shrink-0">
                                                        {updating === item.id ? (
                                                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                                        ) : (
                                                            <button
                                                                onClick={() => handleToggle(item.id, item.isCompleted)}
                                                                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${item.isCompleted ? 'bg-primary text-background shadow-lg scale-110' : 'bg-mist border border-line text-slate hover:border-primary/50'}`}
                                                            >
                                                                {item.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-2 h-2 rounded-full bg-slate/20" />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {completedCount === 3 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-16 p-10 bg-obsidian text-mist rounded-[40px] text-center shadow-2xl border border-primary/30 overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Sparkles className="w-32 h-32 text-primary" />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <div className="w-20 h-20 bg-primary/20 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-2">🏆</div>
                                <h3 className="text-3xl font-black tracking-tight">회복 프로토콜 완수!</h3>
                                <p className="text-mist/70 font-medium leading-relaxed">
                                    오늘의 모든 행동을 실천하셨습니다.<br />이 작은 실천들이 모여 당신의 완전한 회복을 만듭니다.
                                </p>
                                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-background font-black rounded-2xl px-10 h-14 mt-4 shadow-xl">
                                    <Link href="/">홈으로 가기</Link>
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    <div className="mt-20 pt-12 border-t border-line text-center">
                        <p className="text-text-secondary text-sm font-medium opacity-50">
                            조언은 사용자의 실시간 데이터와 제미나이 유니클 분석을 바탕으로 생성됩니다.
                        </p>
                    </div>
                </div>
            </div>
        </ChapterWrapper>
    );
}
