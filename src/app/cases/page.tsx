'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Plus, Quote, ArrowRight } from 'lucide-react';
import ChapterWrapper from '@/components/layout/ChapterWrapper';

// Mock Data for Cases
const CASES = [
    {
        id: 1,
        title: '30대 직장인, 만성피로 탈출기',
        category: '만성피로',
        budget: '50~100만원',
        period: '3개월',
        oneLiner: '아침에 눈을 뜨는 게 고통이었지만, 이제는 알람 없이 일어납니다.',
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
        oneLiner: '다리가 코끼리 같았는데, 이제는 좋아하는 구두를 다시 신습니다.',
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
        oneLiner: '작은 일에도 예민했는데, 마음의 중심이 잡힌 기분이에요.',
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
    const [activeTab, setActiveTab] = React.useState('OFFICIAL');

    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [aiCases, setAiCases] = React.useState<any[]>([]);
    const [userSymptom, setUserSymptom] = React.useState('');
    const [userAge, setUserAge] = React.useState('');

    React.useEffect(() => {
        const savedCases = localStorage.getItem('youniqle_ai_cases');
        if (savedCases) {
            try {
                setAiCases(JSON.parse(savedCases));
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
                body: JSON.stringify({ symptom: userSymptom, age: userAge })
            });

            if (response.ok) {
                const newCase = await response.json();
                const enhancedCase = { ...newCase, id: Date.now(), isAiGenerated: true, budget: '맞춤형' };
                const updated = [enhancedCase, ...aiCases];
                setAiCases(updated);
                localStorage.setItem('youniqle_ai_cases', JSON.stringify(updated));
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
        <ChapterWrapper chapter="cases" className="container mx-auto px-4 py-20 min-h-screen">
            <div className="max-w-4xl mx-auto text-center mb-24 space-y-6">
                <div className="inline-flex items-center px-4 py-1.5 bg-chapter-accent/5 text-chapter-accent rounded-full text-[10px] font-black tracking-widest uppercase border border-chapter-accent/20">
                    Real Recovery Insights
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-text-primary tracking-tighter">회복이 데이터가 되는 순간</h1>
                <p className="text-xl text-text-secondary leading-relaxed font-medium">
                    Youniqle에는 과장된 전후 사진이 존재하지 않습니다.<br />
                    오직 <b className="text-text-primary">진실된 변화의 기록</b>과 <b className="text-text-primary">검증된 수치</b>만이 당신의 회복을 증명합니다.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-20">
                <TabsList className="flex justify-center bg-transparent gap-4 mb-16">
                    <TabsTrigger value="OFFICIAL" className="px-8 py-3 rounded-full border border-line text-text-secondary data-[state=active]:bg-chapter-accent data-[state=active]:text-background data-[state=active]:border-chapter-accent font-black transition-all">공식 인증 사례</TabsTrigger>
                    <TabsTrigger value="AI_SIMULATION" className="px-8 py-3 rounded-full border border-line text-text-secondary data-[state=active]:bg-chapter-accent data-[state=active]:text-background data-[state=active]:border-chapter-accent font-black transition-all">AI 가상 사례 (Beta)</TabsTrigger>
                </TabsList>

                <TabsContent value="OFFICIAL" className="space-y-12">
                    <div className="flex justify-center flex-wrap gap-2">
                        {['ALL', '만성피로', '통증/붓기', 'MENTAL'].map((f) => (
                            <Button
                                key={f}
                                variant="outline"
                                onClick={() => setFilter(f)}
                                className={`rounded-full px-6 font-bold transition-all ${filter === f ? 'bg-text-primary text-background border-text-primary' : 'bg-transparent text-text-secondary border-line'}`}
                            >
                                {f === 'ALL' ? '전체' : `#${f}`}
                            </Button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredCases.map((item) => (
                                <CaseCard key={item.id} item={item} />
                            ))}
                        </AnimatePresence>
                    </div>
                </TabsContent>

                <TabsContent value="AI_SIMULATION">
                    {aiCases.length === 0 ? (
                        <div className="text-center py-24 bg-surface/50 rounded-[40px] border-2 border-dashed border-line">
                            <Sparkles className="w-16 h-16 text-chapter-accent mx-auto mb-6 opacity-40" />
                            <h3 className="text-2xl font-black mb-4">시뮬레이션 데이터가 없습니다.</h3>
                            <p className="text-text-secondary mb-10 text-lg font-medium opacity-70">"내 조건에서 어떤 변화가 가능할까?"<br />AI에게 당신의 증상을 물려주세요.</p>
                            <Button onClick={() => setIsDialogOpen(true)} className="bg-chapter-accent hover:bg-chapter-accent/90 text-background font-black rounded-2xl h-14 px-10 shadow-xl">
                                <Plus className="w-5 h-5 mr-3" /> 첫 번째 사례 생성
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

            <div className="mt-20 py-16 px-8 rounded-[48px] bg-surface border border-line flex flex-col items-center text-center space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-chapter-accent/30"></div>
                <h3 className="text-3xl font-black tracking-tighter">당신도 '회복 데이터'의 주인공이 될 수 있습니다.</h3>
                <p className="text-text-secondary text-lg font-medium max-w-xl opacity-80 leading-relaxed">
                    수천 명의 데이터가 증명하는 최적의 회복 경로를 안내해드립니다. <br />
                    지금 바로 AI 전문가와 무료 진단을 시작해보세요.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Button size="lg" className="bg-chapter-accent hover:bg-chapter-accent/90 text-background font-black rounded-2xl h-16 px-10" asChild>
                        <Link href="/diagnosis">내 회복 점수 진단하기</Link>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="border-line font-black rounded-2xl h-16 px-10 hover:bg-white/5"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <Sparkles className="w-5 h-5 mr-3 text-chapter-accent" />
                        AI 시뮬레이션 돌려보기
                    </Button>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-surface border-line sm:max-w-lg rounded-[32px] overflow-hidden p-8 shadow-2xl">
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="flex items-center gap-3 text-2xl font-black">
                            <Sparkles className="w-6 h-6 text-chapter-accent" />
                            AI 시뮬레이터
                        </DialogTitle>
                        <DialogDescription className="text-text-secondary font-medium leading-relaxed">
                            현재 겪고 있는 증상을 상세하게 입력해주세요. <br />AI가 가장 유사한 성공적인 <b>회복 로드맵</b>을 설계해드립니다.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-8">
                        <div className="space-y-3">
                            <Label htmlFor="symptom" className="text-xs font-black uppercase tracking-widest text-text-secondary ml-1">상태 기술</Label>
                            <Textarea
                                id="symptom"
                                placeholder="예: 30대 후반, 극심한 야근 후 아침에 몸이 붓고 기력이 없습니다."
                                value={userSymptom}
                                onChange={(e) => setUserSymptom(e.target.value)}
                                className="bg-background border-line min-h-[140px] rounded-2xl focus:border-chapter-accent transition-all p-5"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="age" className="text-xs font-black uppercase tracking-widest text-text-secondary ml-1">연령 및 성별</Label>
                            <Input
                                id="age"
                                placeholder="예: 40대 초반 남성"
                                value={userAge}
                                onChange={(e) => setUserAge(e.target.value)}
                                className="bg-background border-line h-14 rounded-2xl focus:border-chapter-accent transition-all px-5"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-3">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-14 font-bold text-text-secondary">취소</Button>
                        <Button onClick={handleGenerateCase} disabled={!userSymptom || isGenerating} className="bg-chapter-accent hover:bg-chapter-accent/90 text-background font-black h-14 px-8 rounded-2xl shadow-lg">
                            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : '로드맵 설계 시작'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ChapterWrapper>
    );
}

function CaseCard({ item, isAi = false }: { item: any, isAi?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
        >
            <Card className="bg-surface border-line rounded-[32px] overflow-hidden group hover:border-chapter-accent transition-all duration-500 shadow-xl flex flex-col h-full">
                <CardHeader className="p-8 pb-4 space-y-4">
                    <div className="flex justify-between items-start">
                        <Badge className={`bg-chapter-accent/10 text-chapter-accent border-none font-black text-[10px] tracking-widest rounded-md ${isAi ? 'bg-primary/10 text-primary' : ''}`}>
                            {isAi ? 'AI ANALYSIS' : item.category.toUpperCase()}
                        </Badge>
                        <span className="text-[10px] font-black text-text-secondary opacity-40 uppercase tracking-widest">{item.period} Journey</span>
                    </div>
                    <h3 className="text-xl font-black text-text-primary leading-tight">{item.title}</h3>
                </CardHeader>

                <CardContent className="p-8 pt-0 space-y-8 flex-1 flex flex-col">
                    {/* Score Graph */}
                    <div className="h-40 w-full relative">
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-chapter-accent/5 to-transparent pointer-events-none rounded-b-2xl"></div>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={item.graphData}>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1A1D21',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(233,226,214,0.1)',
                                        color: '#E9E2D6',
                                        fontSize: '12px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="var(--chapter-accent)"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: 'var(--chapter-accent)', strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-black text-chapter-accent uppercase tracking-widest opacity-60">Recovery index trend</p>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div className="relative pl-8">
                            <Quote className="absolute left-0 top-0 w-6 h-6 text-chapter-accent opacity-20 rotate-180" />
                            <p className="text-lg font-bold text-text-primary leading-relaxed italic tracking-tight">
                                {isAi ? item.oneLiner || item.summary : item.oneLiner}
                            </p>
                        </div>

                        {isAi && item.habitChanges && (
                            <div className="p-5 rounded-2xl bg-background border border-line space-y-3">
                                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Key Habit Shifts</h4>
                                <ul className="space-y-2">
                                    {item.habitChanges.slice(0, 3).map((h: string, i: number) => (
                                        <li key={i} className="text-sm font-medium text-text-secondary flex items-start gap-2">
                                            <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                                            {h}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-line space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {item.tags.map((tag: string) => (
                                <span key={tag} className="text-[10px] font-bold text-text-secondary opacity-50">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <Button className="w-full bg-background border border-line hover:border-chapter-accent hover:bg-chapter-accent/5 text-text-primary font-black h-12 rounded-xl group transition-all" asChild>
                            <Link href={isAi ? "/products" : `/products/${item.product?.id || '1'}`}>
                                {isAi ? '추천 제품 보기' : `${item.product?.name} 확인`}
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
