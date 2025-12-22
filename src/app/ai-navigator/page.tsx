'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Sun, Moon, Coffee, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AiNavigatorPage() {
    const [scoreHistory, setScoreHistory] = React.useState<any[]>([]);
    const [todayScore, setTodayScore] = React.useState(0);
    const [activeTab, setActiveTab] = React.useState('MORNING');

    const [loading, setLoading] = useState(true);
    const [aiAdvice, setAiAdvice] = useState<string>('');

    useEffect(() => {
        // 1. Fetch History (Mock for now)
        const mockData = [
            { date: '12/09', score: 65 },
            { date: '12/10', score: 70 },
            { date: '12/11', score: 60 },
            { date: '12/12', score: 75 },
            { date: '12/13', score: 80 },
            { date: '12/14', score: 85 },
            // Today will be added dynamically
        ];

        // 2. Load today's score and call AI
        const fetchAIAdvice = async () => {
            const storedScore = localStorage.getItem('recovery_last_score');
            const scoreVal = storedScore ? parseInt(storedScore) : 88;
            setTodayScore(scoreVal);

            // Add today to graph
            setScoreHistory([...mockData, { date: 'Today', score: scoreVal }]);

            try {
                // Call Mock AI API
                const response = await fetch('/api/ai/navigator', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        scores: { q1: 80, q2: 70, q3: 90, q4: 85, q5: scoreVal }, // Simulated detailed scores
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
        <div className="container mx-auto px-4 py-8">
            {/* 1. Header & Score Graph */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">🤖 AI 회복 네비게이터</h1>
                <p className="text-gray-500 mb-6">당신의 회복 패턴을 분석하여 최적의 루틴을 제안합니다.</p>

                <Card className="bg-gradient-to-br from-primary/5 to-white border-primary/20">
                    <CardContent className="p-6">
                        <div className="flex items-end justify-between mb-4">
                            <div>
                                <span className="text-sm text-gray-500 block mb-1">오늘의 회복 점수</span>
                                <span className="text-4xl font-black text-primary">{todayScore}점</span>
                            </div>
                            <div className="text-right">
                                <span className="text-sm text-gray-500 block mb-1">AI 한줄 코멘트</span>
                                <span className="text-sm font-bold bg-white px-3 py-1 rounded-full border shadow-sm">
                                    {loading ? "AI 분석 중..." : `"${aiAdvice || '오늘도 회복하는 하루 되세요!'}"`}
                                </span>
                            </div>
                        </div>

                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={scoreHistory}>
                                    <XAxis
                                        dataKey="date"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#9ca3af' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 2. Daily Routine Checklist */}
            <div className="mb-12">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    오늘의 회복 미션
                </h2>

                <Tabs defaultValue="MORNING" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 rounded-xl p-1">
                        <TabsTrigger value="MORNING" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Sun className="w-4 h-4 mr-2 text-orange-500" /> 아침
                        </TabsTrigger>
                        <TabsTrigger value="DAY" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Coffee className="w-4 h-4 mr-2 text-brown-500" /> 낮
                        </TabsTrigger>
                        <TabsTrigger value="NIGHT" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Moon className="w-4 h-4 mr-2 text-indigo-500" /> 밤
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="MORNING" className="space-y-3">
                        <RoutineItem title="기상 직후 물 한 잔 마시기" time="07:00" />
                        <RoutineItem title="창문 열고 1분 환기 (햇빛 보기)" time="07:05" />
                        <RoutineItem title="가벼운 폼롤러 스트레칭" time="07:15" />
                    </TabsContent>

                    <TabsContent value="DAY" className="space-y-3">
                        <RoutineItem title="점심 식사 후 10분 산책" time="12:30" />
                        <RoutineItem title="오후 3시, 영양제(마그네슘) 섭취" time="15:00" />
                        <RoutineItem title="의자에서 하는 라운드숄더 교정" time="16:00" />
                    </TabsContent>

                    <TabsContent value="NIGHT" className="space-y-3">
                        <RoutineItem title="잠들기 2시간 전 조명 낮추기" time="21:00" />
                        <RoutineItem title="따뜻한 차 한 잔" time="21:30" />
                        <RoutineItem title="스마트폰 멀리 두고 눕기" time="23:00" />
                    </TabsContent>
                </Tabs>
            </div>

            {/* 2.5 Recommended Kit (Ad / Solution) */}
            <div className="mb-12">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    🛍️ 오늘의 맞춤 회복 도구
                </h2>
                <Card className="overflow-hidden border-primary/20 shadow-md transition-all hover:shadow-lg">
                    <div className="flex flex-col md:flex-row">
                        <div className="bg-primary/5 p-8 flex items-center justify-center md:w-1/3">
                            <div className="text-6xl">💊</div>
                        </div>
                        <div className="p-6 md:w-2/3 flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">만성 피로 삭제 팩</h3>
                                    <p className="text-sm text-gray-500">지친 당신을 위한 에너지 부스터</p>
                                </div>
                                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">추천</span>
                            </div>
                            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                "오늘 회복 점수가 70점 미만입니다. <br />
                                충분한 휴식과 함께 마그네슘이 포함된 이 팩을 섭취해보세요. 아침이 달라집니다."
                            </p>
                            <Button className="w-full md:w-auto" asChild>
                                <Link href="/products/1">
                                    최저가로 지금 구매하기 (35,000원)
                                </Link>
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* 3. AI Weekly Report Preview */}
            <div>
                <h2 className="text-xl font-bold mb-4">주간 분석 리포트</h2>
                <Card className="bg-gray-900 text-white border-none">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-400 text-sm">12월 2주차 분석</span>
                            <Button size="sm" variant="outline" className="text-black bg-white hover:bg-gray-200" asChild>
                                <Link href="/ai-navigator/report">전체 리포트 보기</Link>
                            </Button>
                        </div>
                        <h3 className="text-lg font-bold mb-2">"주말 수면 패턴이 불규칙해요."</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            평일에는 평균 7시간을 잘 주무시지만, 금요일과 토요일에 수면 시간이 4시간으로 줄어듭니다.
                            이로 인해 월요일 오전의 회복 점수가 15점 이상 떨어지고 있습니다.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}

function RoutineItem({ title, time }: { title: string; time: string }) {
    const [checked, setChecked] = useState(false);

    return (
        <div className={`flex items-center p-4 rounded-xl border transition-all ${checked ? 'bg-primary/5 border-primary/30' : 'bg-white hover:border-gray-300'}`}>
            <Checkbox
                id={`routine-${title}`}
                checked={checked}
                onCheckedChange={(c) => setChecked(c as boolean)}
                className="w-6 h-6 mr-4 rounded-full"
            />
            <div className="flex-1">
                <label
                    htmlFor={`routine-${title}`}
                    className={`font-medium cursor-pointer ${checked ? 'text-gray-400 line-through' : 'text-gray-900'}`}
                >
                    {title}
                </label>
            </div>
            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                {time}
            </span>
        </div>
    );
}
