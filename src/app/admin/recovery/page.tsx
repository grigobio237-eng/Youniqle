'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { TrendingUp, Users, Activity, Calendar } from 'lucide-react';

function RecoveryAnalyticsContent() {
    const [period, setPeriod] = useState<'week' | 'month'>('week');

    // Mock data for charts
    const scoreData = [
        { date: '12/09', avgScore: 62, users: 45 },
        { date: '12/10', avgScore: 65, users: 48 },
        { date: '12/11', avgScore: 58, users: 52 },
        { date: '12/12', avgScore: 70, users: 50 },
        { date: '12/13', avgScore: 72, users: 55 },
        { date: '12/14', avgScore: 75, users: 60 },
        { date: '12/15', avgScore: 78, users: 58 }
    ];

    const categoryData = [
        { name: '피로', count: 120 },
        { name: '수면', count: 89 },
        { name: '붓기', count: 67 },
        { name: '감정', count: 54 },
        { name: '집중', count: 48 }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">회복 현황 분석</h1>
                    <p className="text-gray-500 mt-1">사용자들의 회복 점수 트렌드와 주요 지표를 분석합니다.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant={period === 'week' ? 'default' : 'outline'} size="sm" onClick={() => setPeriod('week')}>주간</Button>
                    <Button variant={period === 'month' ? 'default' : 'outline'} size="sm" onClick={() => setPeriod('month')}>월간</Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">평균 회복 점수</p>
                                <p className="text-3xl font-bold">78점</p>
                                <p className="text-xs text-green-500 flex items-center mt-1">
                                    <TrendingUp className="w-3 h-3 mr-1" /> +5% vs 지난주
                                </p>
                            </div>
                            <Activity className="w-10 h-10 text-primary/30" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">일일 체크 사용자</p>
                                <p className="text-3xl font-bold">58명</p>
                                <p className="text-xs text-green-500 flex items-center mt-1">
                                    <TrendingUp className="w-3 h-3 mr-1" /> +12% vs 지난주
                                </p>
                            </div>
                            <Users className="w-10 h-10 text-primary/30" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">연속 체크 기록</p>
                                <p className="text-3xl font-bold">7일</p>
                                <p className="text-xs text-gray-400 mt-1">최고 기록 보유자</p>
                            </div>
                            <Calendar className="w-10 h-10 text-primary/30" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">AI 조언 제공</p>
                                <p className="text-3xl font-bold">342회</p>
                                <p className="text-xs text-gray-400 mt-1">이번 주 누적</p>
                            </div>
                            <Activity className="w-10 h-10 text-primary/30" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>일별 평균 회복 점수</CardTitle>
                        <CardDescription>사용자 전체의 평균 점수 추이</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={scoreData}>
                                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="avgScore"
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                                        name="평균 점수"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>카테고리별 약점 분포</CardTitle>
                        <CardDescription>가장 많이 낮은 점수를 받은 항목</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData} layout="vertical">
                                    <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} axisLine={false} width={50} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} name="응답 수" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Insights */}
            <Card className="bg-gradient-to-r from-primary/5 to-white">
                <CardHeader>
                    <CardTitle>🔍 AI 인사이트</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border">
                        <p className="font-medium mb-1">📉 주말 수면 점수 하락 패턴 감지</p>
                        <p className="text-sm text-gray-600">금요일~일요일 사이 수면 점수가 평균 15% 하락합니다. 주말 수면 관리 콘텐츠 푸시를 권장합니다.</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                        <p className="font-medium mb-1">📈 연속 체크 유저의 회복 속도 2배</p>
                        <p className="text-sm text-gray-600">3일 이상 연속 체크한 사용자는 평균 회복 점수 상승률이 2배 높습니다. 리마인더 기능 강화를 권장합니다.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AdminRecoveryPage() {
    return (
        <AdminLayout>
            <RecoveryAnalyticsContent />
        </AdminLayout>
    );
}
