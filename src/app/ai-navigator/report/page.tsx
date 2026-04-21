'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Activity, Moon, Sun, Brain } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function WeeklyReportPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const userName = session?.user?.name || '요원';

    // Mock Data for Weekly Analysis
    const weeklyData = [
        { day: '월', score: 65, avg: 70 },
        { day: '화', score: 72, avg: 70 },
        { day: '수', score: 68, avg: 70 },
        { day: '목', score: 85, avg: 70 },
        { day: '금', score: 55, avg: 72 }, // The drop mentioned in the previous analysis
        { day: '토', score: 48, avg: 75 },
        { day: '일', score: 80, avg: 75 },
    ];

    const categoryData = [
        { subject: '수면', A: 60, fullMark: 100 },
        { subject: '피로도', A: 85, fullMark: 100 },
        { subject: '스트레스', A: 70, fullMark: 100 },
        { subject: '신체활력', A: 50, fullMark: 100 },
        { subject: '집중력', A: 80, fullMark: 100 },
        { subject: '소화/순환', A: 65, fullMark: 100 },
    ];

    const weeklyAverage = 67;
    const lastWeekAverage = 72;
    const diff = weeklyAverage - lastWeekAverage;

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 800);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/ai-navigator">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <h1 className="text-lg font-bold">{userName} 님의 주간 회복 리포트</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-8">
                {/* 1. Summary Card */}
                <Card className="bg-white shadow-sm border-none">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-gray-500 text-sm font-medium flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> 12월 2주차 (12.09 ~ 12.15)
                                </CardTitle>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-gray-900">{weeklyAverage}점</span>
                                    <span className={`text-sm font-bold flex items-center ${diff >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                        {Math.abs(diff)}점 {diff >= 0 ? <TrendingUp className="w-3 h-3 ml-1" /> : <TrendingDown className="w-3 h-3 ml-1" />}
                                    </span>
                                    <span className="text-xs text-gray-400">지난주 대비</span>
                                </div>
                            </div>
                            <div className="bg-blue-50 p-2 rounded-full">
                                <Activity className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 bg-gray-50 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-gray-900 mb-1">&quot;{userName} 님, 주말 관리가 핵심이에요&quot;</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                평일 평균 점수는 양호하지만, 금요일부터 회복 점수가 급격히 떨어지는 패턴이 반복되고 있습니다.
                                이번 주말에는 고강도 활동보다는 정적인 휴식을 취해보는 것이 어떨까요?
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Weekly Trend Chart */}
                <div>
                    <h2 className="text-lg font-bold mb-4">요일별 회복 흐름</h2>
                    <Card className="overflow-hidden">
                        <CardContent className="p-6">
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weeklyData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar
                                            dataKey="score"
                                            fill="#3b82f6"
                                            radius={[4, 4, 0, 0]}
                                            barSize={20}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 flex justify-between text-xs text-gray-500 px-2">
                                <span>최저: 48점 (토)</span>
                                <span>최고: 85점 (목)</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. Category Radar Chart */}
                <div>
                    <h2 className="text-lg font-bold mb-4">{userName} 님의 회복 밸런스</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="p-4 flex items-center justify-center">
                                <div className="h-64 w-full max-w-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={categoryData}>
                                            <PolarGrid stroke="#e5e7eb" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar
                                                name={`${userName} 님의 점수`}
                                                dataKey="A"
                                                stroke="#2563eb"
                                                strokeWidth={2}
                                                fill="#3b82f6"
                                                fillOpacity={0.3}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-3">
                            <Card className="bg-red-50 border-none">
                                <CardContent className="p-4 flex items-start gap-3">
                                    <Moon className="w-5 h-5 text-red-500 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-red-700 text-sm">{userName} 님, 수면 부족 경고</h4>
                                        <p className="text-xs text-red-600 mt-1">
                                            평균 수면 시간이 5시간대로 떨어졌습니다.
                                            이번 주는 12시 이전 취침을 목표로 해보세요.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-green-50 border-none">
                                <CardContent className="p-4 flex items-start gap-3">
                                    <Brain className="w-5 h-5 text-green-500 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-green-700 text-sm">피로도 관리 우수</h4>
                                        <p className="text-xs text-green-600 mt-1">
                                            주중 짧은 휴식 루틴이 효과를 보고 있습니다.
                                            업무 중간 스트레칭 빈도가 늘었습니다.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* 4. Action Plan */}
                <div>
                    <h2 className="text-lg font-bold mb-4">다음 주 회복 제안</h2>
                    <div className="space-y-3">
                        <div className="bg-white p-5 rounded-xl border flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">PRIORITY 1</span>
                                <h3 className="font-bold">토요일 오전 늦잠 허용하기</h3>
                                <p className="text-sm text-gray-500">부족한 수면 부채를 갚기 위해 90분 더 주무세요.</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">PRIORITY 2</span>
                                <h3 className="font-bold">잠들기 전 스마트폰 30분 금지</h3>
                                <p className="text-sm text-gray-500">수면의 질을 높이기 위한 가장 확실한 방법입니다.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
