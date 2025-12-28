'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, ArrowRight, Zap, Package, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ChapterWrapper from '@/components/layout/ChapterWrapper';

export default function AiNavigatorPage() {
    const [scoreHistory, setScoreHistory] = React.useState<any[]>([]);
    const [todayScore, setTodayScore] = React.useState(0);
    const [loading, setLoading] = useState(true);
    const [aiAdvice, setAiAdvice] = useState<string>('');

    useEffect(() => {
        const mockData = [
            { date: '12/09', score: 65 },
            { date: '12/10', score: 70 },
            { date: '12/11', score: 60 },
            { date: '12/12', score: 75 },
            { date: '12/13', score: 80 },
            { date: '12/14', score: 85 },
        ];

        const fetchAIAdvice = async () => {
            const storedScore = localStorage.getItem('recovery_last_score');
            const scoreVal = storedScore ? parseInt(storedScore) : 88;
            setTodayScore(scoreVal);
            setScoreHistory([...mockData, { date: '오늘', score: scoreVal }]);

            try {
                const response = await fetch('/api/ai/navigator', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        scores: { q1: 80, q2: 70, q3: 90, q4: 85, q5: scoreVal },
                        yesterdayScore: 85
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    setAiAdvice(data.comment);
                }
            } catch (e) {
                console.error("AI Fetch Error", e);
            } finally {
                setLoading(false);
            }
        };

        fetchAIAdvice();
    }, []);

    return (
        <ChapterWrapper chapter="ai-navigator">
            <div className="min-h-screen bg-background text-text-primary pb-20">
                {/* 1. Analysis Header (Data Visual) */}
                <section className="relative py-16 border-b border-line overflow-hidden">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto space-y-12">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black tracking-widest uppercase">
                                        <Sparkles className="w-3 h-3 mr-2" />
                                        Real-time Analysis
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter">AI 리커버리<br />네비게이터</h1>
                                </div>
                                <div className="bg-surface/50 border border-line p-6 rounded-[32px] flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Recovery Score</div>
                                        <div className="text-4xl font-black text-primary">{todayScore}</div>
                                    </div>
                                    <div className="text-xs font-medium text-text-secondary leading-tight opacity-60">
                                        지난 7일 대비<br /><span className="text-primary font-bold">+12% 향상됨</span>
                                    </div>
                                </div>
                            </div>

                            {/* Score Graph */}
                            <div className="h-40 w-full opacity-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={scoreHistory}>
                                        <XAxis dataKey="date" hide />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1A1D21', borderRadius: '16px', border: '1px solid rgba(233,226,214,0.1)', color: '#E9E2D6' }}
                                            itemStyle={{ color: '#4A90E2' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="score"
                                            stroke="var(--chapter-accent)"
                                            strokeWidth={4}
                                            dot={{ r: 4, fill: 'var(--chapter-accent)', strokeWidth: 0 }}
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Linear Funnel Structure */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-2xl mx-auto space-y-24">

                            <div className="space-y-8 relative">
                                <div className="absolute -left-20 -top-14 text-[140px] font-black text-obsidian/[0.03] leading-none select-none pointer-events-none">01</div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                                        <Zap className="w-5 h-5 fill-current" />
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight">오늘의 1분 처방</h2>
                                </div>

                                <Card className="bg-surface border-line border-l-4 border-l-primary overflow-hidden group">
                                    <CardContent className="p-10 space-y-6">
                                        <div className="space-y-2">
                                            <div className="text-xs font-bold text-primary tracking-widest uppercase">Immediate Action</div>
                                            <h3 className="text-3xl font-black text-text-primary">
                                                기상 직후, 온수 <span className="text-primary">200ml</span>를 천천히 음미하며 마시세요.
                                            </h3>
                                        </div>
                                        <p className="text-text-secondary text-lg font-medium leading-relaxed opacity-80">
                                            오늘 당신의 체내 수분 밀도가 낮게 감지되었습니다.
                                            급격한 각성보다는 부드러운 순환을 통해 신진대사를 깨우는 것이 오늘의 핵심 회복 전략입니다.
                                        </p>
                                        <div className="pt-4">
                                            <div className="flex items-center gap-4 p-4 rounded-3xl bg-background/50 border border-line">
                                                <Checkbox id="action-1" className="w-6 h-6 border-2 border-primary data-[state=checked]:bg-primary" />
                                                <label htmlFor="action-1" className="text-lg font-bold text-text-primary cursor-pointer select-none">지금 수행 완료</label>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Step 2: 1 necessary product */}
                            <div className="space-y-8 relative pt-12">
                                <div className="absolute -left-20 -top-4 text-[140px] font-black text-obsidian/[0.03] leading-none select-none pointer-events-none">02</div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight">최적의 회복 도구</h2>
                                </div>

                                <Link href="/products/recovery-kit" className="block group">
                                    <Card className="bg-surface border-line group-hover:border-primary transition-all duration-500 overflow-hidden">
                                        <div className="flex flex-col md:flex-row">
                                            <div className="md:w-1/2 bg-background p-12 flex items-center justify-center overflow-hidden">
                                                <div className="w-40 h-40 relative group-hover:scale-110 transition-transform duration-700">
                                                    {/* Product Illustration Placeholder */}
                                                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl"></div>
                                                    <div className="relative z-10 w-full h-full flex items-center justify-center text-8xl">🧬</div>
                                                </div>
                                            </div>
                                            <CardContent className="md:w-1/2 p-10 flex flex-col justify-center space-y-6">
                                                <div className="space-y-2">
                                                    <div className="inline-flex px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-black tracking-widest uppercase">Solution</div>
                                                    <h3 className="text-2xl font-black">딥 리커버리 미네랄 팩</h3>
                                                    <p className="text-sm text-text-secondary font-medium opacity-60">오늘 당신의 생체 리듬에 부족한 마그네슘과 아연을 보충합니다.</p>
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-line">
                                                    <div className="text-xl font-black">48,000원</div>
                                                    <Button variant="ghost" className="text-primary font-black gap-2 group-hover:translate-x-1 transition-transform">
                                                        구매하기 <ArrowRight className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </div>
                                    </Card>
                                </Link>
                            </div>

                            {/* Step 3: Check tomorrow */}
                            <div className="space-y-8 relative pt-12">
                                <div className="absolute -left-20 -top-4 text-[140px] font-black text-obsidian/[0.03] leading-none select-none pointer-events-none">03</div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight">내일의 예보</h2>
                                </div>

                                <Card className="bg-surface/30 border-dashed border-2 border-line rounded-[32px]">
                                    <CardContent className="p-10 flex items-center justify-between">
                                        <div className="space-y-2">
                                            <div className="text-xs font-bold text-text-secondary opacity-50 uppercase tracking-widest">Next Schedule</div>
                                            <h4 className="text-xl font-black text-text-primary/70">내일 오전 08:30 분석 업데이트</h4>
                                            <p className="text-sm text-text-secondary font-medium">숙면 데이터를 바탕으로 내일의 회복 전략이 수립됩니다.</p>
                                        </div>
                                        <Button size="icon" variant="outline" className="rounded-full w-12 h-12 border-line text-text-secondary opacity-40">
                                            <ChevronRight />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </ChapterWrapper>
    );
}
