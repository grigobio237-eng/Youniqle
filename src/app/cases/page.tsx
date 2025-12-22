'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Plus } from 'lucide-react';

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
        product: { name: '만성 피로 삭제 팩', price: '35,000원', id: 1 }
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
        product: { name: '붓기 삭제 펌킨 티', price: '29,800원', id: 2 }
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
        product: { name: '스트레스 번아웃 케어 키트', price: '55,000원', id: 3 }
    },
];

export default function CasesPage() {
    const [filter, setFilter] = React.useState('ALL');
    const [activeTab, setActiveTab] = React.useState('OFFICIAL'); // 'OFFICIAL' | 'AI_SIMULATION'

    // AI Generation State
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [aiCases, setAiCases] = React.useState<any[]>([]);
    const [userSymptom, setUserSymptom] = React.useState('');
    const [userAge, setUserAge] = React.useState('');

    // Load AI cases from localStorage on mount
    React.useEffect(() => {
        const savedCases = localStorage.getItem('youniqle_ai_cases');
        if (savedCases) {
            try {
                const parsed = JSON.parse(savedCases);
                console.log('✅ Loaded AI cases from storage:', parsed.length);
                setAiCases(parsed);
            } catch (e) {
                console.error('Failed to parse saved AI cases:', e);
            }
        }
    }, []);

    const filteredCases = filter === 'ALL'
        ? CASES
        : CASES.filter(c => c.category === filter || c.budget.includes(filter));

    const handleGenerateCase = async () => {
        if (!userSymptom) return;

        setIsGenerating(true);
        try {
            const response = await fetch('/api/ai/generate-case', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symptom: userSymptom,
                    age: userAge
                })
            });

            if (response.ok) {
                const newCase = await response.json();
                // Add ID and enhance data for UI compatibility
                const enhancedCase = {
                    ...newCase,
                    id: Date.now(),
                    isAiGenerated: true,
                    budget: '맞춤형', // AI response doesn't strictly follow budget, fallback
                };

                setAiCases([enhancedCase, ...aiCases]);

                // Save to localStorage for persistence
                localStorage.setItem('youniqle_ai_cases', JSON.stringify([enhancedCase, ...aiCases]));
                console.log('✅ Saved AI case to localStorage');

                setActiveTab('AI_SIMULATION');
                setIsDialogOpen(false);
                setUserSymptom('');
                setUserAge('');
            }
        } catch (e) {
            console.error(e);
            alert('케이스 생성 중 오류가 발생했습니다.');
        } finally {
            setIsGenerating(false);
        }
    };

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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 bg-gray-100 p-1 rounded-xl">
                    <TabsTrigger value="OFFICIAL" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">공식 인증 사례</TabsTrigger>
                    <TabsTrigger value="AI_SIMULATION" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">AI 시뮬레이션 사례 (Beta)</TabsTrigger>
                </TabsList>

                <TabsContent value="OFFICIAL">
                    {/* Filter Section */}
                    <div className="flex justify-center mb-8 flex-wrap gap-2">
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

                    {/* Official Cases Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {filteredCases.map((item) => (
                                <CaseCard key={item.id} item={item} />
                            ))}
                        </AnimatePresence>
                    </div>
                </TabsContent>

                <TabsContent value="AI_SIMULATION">
                    {aiCases.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-bold mb-2">아직 생성된 사례가 없습니다.</h3>
                            <p className="text-gray-500 mb-6">"나와 같은 고민을 가진 사람은 어떻게 회복했을까?"<br />AI에게 물어보고 가상의 로드맵을 확인해보세요.</p>
                            <Button onClick={() => setIsDialogOpen(true)} className="rounded-full">
                                <Plus className="w-4 h-4 mr-2" /> 첫 번째 사례 만들기
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <AnimatePresence>
                                {aiCases.map((item) => (
                                    <CaseCard key={item.id} item={item} isAi={true} />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* CTA Box (Footer) */}
            <div className="mt-16 text-center bg-primary/5 rounded-2xl p-8 sm:p-12">
                <h3 className="text-2xl font-bold mb-4">내 고민도 해결될 수 있을까요?</h3>
                <p className="text-gray-600 mb-8">
                    망설이지 말고 AI에게 물어보세요. <br />
                    당신의 회복 가능성을 미리 시뮬레이션해드립니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" variant="default" className="rounded-full px-8" asChild>
                        <Link href="/">
                            내 회복 점수 다시 확인하기
                        </Link>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full px-8"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <Sparkles className="w-4 h-4 mr-2 text-primary" />
                        AI로 내 회복 사례 찾아보기
                    </Button>
                </div>
            </div>

            {/* AI Generation Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                            AI 회복 사례 시뮬레이터
                        </DialogTitle>
                        <DialogDescription>
                            현재 겪고 있는 증상이나 고민을 입력하시면,<br />AI가 가장 유사한 <b>회복 성공 로드맵</b>을 보여드립니다.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="symptom">가장 큰 고민거리가 무엇인가요?</Label>
                            <Textarea
                                id="symptom"
                                placeholder="예: 30대 남자인데, 매일 야근으로 아침에 일어나기가 너무 힘들어요. 주말에는 잠만 자는데도 피로가 안 풀려요."
                                value={userSymptom}
                                onChange={(e) => setUserSymptom(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="age">연령대 (선택)</Label>
                            <Input
                                id="age"
                                placeholder="예: 30대 후반"
                                value={userAge}
                                onChange={(e) => setUserAge(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
                        <Button onClick={handleGenerateCase} disabled={!userSymptom || isGenerating} className="bg-purple-600 hover:bg-purple-700">
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    분석 중...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    시뮬레이션 시작
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Sub-component for clean rendering
function CaseCard({ item, isAi = false }: { item: any, isAi?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
        >
            <Card className={`h-full hover:shadow-xl transition-all duration-300 overflow-hidden border-t-4 ${isAi ? 'border-t-purple-500 border-2 border-purple-100' : 'border-t-primary'}`}>
                <CardHeader className={`pb-4 ${isAi ? 'bg-purple-50/50' : 'bg-gray-50/50'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <Badge variant={isAi ? "outline" : "secondary"} className={`mb-2 ${isAi ? 'border-purple-200 text-purple-600 bg-white' : ''}`}>
                            {isAi ? 'AI SIMULATION' : item.category}
                        </Badge>
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
                                    stroke={isAi ? "#9333ea" : "#2563eb"}
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

                    {/* Habit Changes (AI only) */}
                    {isAi && item.habitChanges && (
                        <div className="mb-6 bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                            <h4 className="text-sm font-bold text-purple-900 mb-2">🔄 실천한 습관 변화</h4>
                            <ul className="space-y-1">
                                {item.habitChanges.map((habit: string, idx: number) => (
                                    <li key={idx} className="text-sm text-purple-800 flex items-start">
                                        <span className="mr-2 text-purple-400">•</span>
                                        <span>{habit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-auto mb-4">
                        {item.tags.map((tag: string) => (
                            <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Product CTA */}
                    {(item.product || item.productRecommendation) && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-400 mb-2">{isAi ? '이 증상에 추천하는 솔루션' : '이 분이 실제로 사용한 키트'}</p>
                            <Button className={`w-full text-white hover:opacity-90 ${isAi ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-900'}`} asChild>
                                {isAi ? (
                                    <Link href="/products">
                                        {item.productRecommendation?.name} 보기
                                    </Link>
                                ) : (
                                    <Link href={`/products/${item.product.id}`}>
                                        {item.product.name} 구매하기 <span className="ml-2 text-xs opacity-70">({item.product.price})</span>
                                    </Link>
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
