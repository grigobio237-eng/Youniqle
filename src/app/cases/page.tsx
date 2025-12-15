'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data for Cases
const CASES = [
    {
        id: 1,
        title: '30대 직장인, 만성피로 탈출기',
        category: '만성피로',
        budget: '50~100만원',
        period: '3개월',
        emotion: '무기력함 → 활기참',
        summary: '아침에 눈을 뜨는 게 고통이었지만, 이제는 알람 없이 일어납니다.',
        graphData: [
            { name: '1주', score: 20 },
            { name: '4주', score: 45 },
            { name: '8주', score: 70 },
            { name: '12주', score: 85 },
        ],
        tags: ['#수면장애', '#번아웃', '#영양불균형'],
    },
    {
        id: 2,
        title: '40대, 원인 모를 붓기와 통증',
        category: '통증/붓기',
        budget: '100만원 이상',
        period: '6개월',
        emotion: '무거움 → 가벼움',
        summary: '다리가 코끼리 같았는데, 이제는 좋아하는 구두를 다시 신습니다.',
        graphData: [
            { name: '1주', score: 30 },
            { name: '8주', score: 50 },
            { name: '16주', score: 75 },
            { name: '24주', score: 90 },
        ],
        tags: ['#하체비만', '#염증관리', '#순환장애'],
    },
    {
        id: 3,
        title: '20대, 감정 기복과 집중력 저하',
        category: 'MENTAL',
        budget: '30만원 이하',
        period: '2개월',
        emotion: '불안 → 평온',
        summary: '작은 일에도 예민했는데, 마음의 중심이 잡힌 기분이에요.',
        graphData: [
            { name: '1주', score: 40 },
            { name: '3주', score: 55 },
            { name: '6주', score: 70 },
            { name: '8주', score: 80 },
        ],
        tags: ['#불면증', '#스트레스', '#루틴교정'],
    },
];

export default function CasesPage() {
    const [filter, setFilter] = useState('ALL');

    const filteredCases = filter === 'ALL'
        ? CASES
        : CASES.filter(c => c.category === filter || c.budget.includes(filter));

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold mb-4">🔍 리얼 회복 케이스</h1>
                <p className="text-xl text-text-secondary word-keep-all max-w-2xl mx-auto">
                    화려한 "Before/After 사진"은 없습니다.<br />
                    오직 <b>진짜 변화된 삶의 이야기</b>와 <b>회복 데이터</b>만 있습니다.<br />
                    당신과 비슷한 고민을 가진 분들의 여정을 확인해보세요.
                </p>
            </div>

            {/* Filter Section */}
            <div className="flex justify-center mb-12 flex-wrap gap-2">
                <Button
                    variant={filter === 'ALL' ? 'default' : 'outline'}
                    onClick={() => setFilter('ALL')}
                    className="rounded-full"
                >
                    전체 보기
                </Button>
                <Button
                    variant={filter === '만성피로' ? 'default' : 'outline'}
                    onClick={() => setFilter('만성피로')}
                    className="rounded-full"
                >
                    #만성피로
                </Button>
                <Button
                    variant={filter === '통증/붓기' ? 'default' : 'outline'}
                    onClick={() => setFilter('통증/붓기')}
                    className="rounded-full"
                >
                    #통증/붓기
                </Button>
                <Button
                    variant={filter === 'MENTAL' ? 'default' : 'outline'}
                    onClick={() => setFilter('MENTAL')}
                    className="rounded-full"
                >
                    #멘탈케어
                </Button>
            </div>

            {/* Cases Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                    {filteredCases.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            layout
                        >
                            <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden border-t-4 border-t-primary">
                                <CardHeader className="bg-gray-50/50 pb-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="secondary" className="mb-2">{item.category}</Badge>
                                        <span className="text-xs text-gray-400">{item.period} 소요</span>
                                    </div>
                                    <CardTitle className="text-lg font-bold">{item.title}</CardTitle>
                                    <CardDescription className="text-primary font-medium mt-1">
                                        {item.emotion}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {/* Graph Simulation */}
                                    <div className="h-32 w-full mb-6 bg-white rounded-lg p-2 border border-dashed">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={item.graphData}>
                                                <Tooltip
                                                    contentStyle={{ fontSize: '12px', borderRadius: '4px' }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="score"
                                                    stroke="#2563eb"
                                                    strokeWidth={3}
                                                    dot={{ r: 3 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                        <p className="text-center text-xs text-gray-400 mt-1">회복 점수 변화 추이</p>
                                    </div>

                                    <p className="mb-6 text-gray-700 leading-relaxed font-serif">
                                        "{item.summary}"
                                    </p>

                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        {item.tags.map(tag => (
                                            <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* CTA Box */}
            <div className="mt-16 text-center bg-primary/5 rounded-2xl p-8 sm:p-12">
                <h3 className="text-2xl font-bold mb-4">나도 이렇게 될 수 있을까요?</h3>
                <p className="text-gray-600 mb-8">
                    당신의 상태도 충분히 좋아질 수 있습니다. <br />
                    익명의 데이터가 증명하는 회복의 힘을 믿으세요.
                </p>
                <div className="flex gap-4 justify-center">
                    <Button size="lg" variant="default" className="rounded-full px-8">
                        내 회복 점수 다시 확인하기
                    </Button>
                    <Button size="lg" variant="outline" className="rounded-full px-8">
                        나와 비슷한 사례 더 찾기
                    </Button>
                </div>
            </div>
        </div>
    );
}
