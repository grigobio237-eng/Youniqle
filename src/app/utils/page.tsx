'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import MinigameGrid from '@/components/utils/MinigameGrid';
import ContentGrid from '@/components/utils/ContentGrid';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import { ArrowRight, Box, Compass, Play, Wrench } from 'lucide-react';

type Category = '전체' | '검색' | '이미지' | '계산' | '학습' | '생산성' | '건강';

interface UtilityCard {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: Category[];
    href: string;
    badge?: string;
    stats?: {
        users?: string;
        rating?: number;
    };
}

const utilities: UtilityCard[] = [
    {
        id: 'bmi',
        title: 'BMI 계산기',
        description: '신장과 체중으로 건강 지수 분석',
        icon: '🧮',
        category: ['계산', '건강'],
        href: '/utils/bmi',
        badge: 'PROTO',
        stats: { users: '2.5k', rating: 4.9 },
    },
    {
        id: 'dday',
        title: 'D-Day 계산',
        description: '날짜 계산 및 디데이 관리',
        icon: '📅',
        category: ['계산'],
        href: '/utils/dday',
        badge: 'FREE',
        stats: { users: '3.1k', rating: 4.6 },
    },
    {
        id: 'unit',
        title: '단위 변환기',
        description: '길이, 무게, 온도 정밀 변환',
        icon: '📏',
        category: ['계산'],
        href: '/utils/unit',
        badge: 'FREE',
        stats: { users: '1.8k', rating: 4.7 },
    },
    {
        id: 'currency',
        title: '환율 계산기',
        description: '실시간 국제 환율 변환',
        icon: '💱',
        category: ['계산'],
        href: '/utils/currency',
        badge: 'HOT',
        stats: { users: '5.2k', rating: 4.8 },
    },
    {
        id: 'memo',
        title: '간편 메모장',
        description: '빠른 기록 및 자동 동기화',
        icon: '📝',
        category: ['생산성'],
        href: '/utils/memo',
        badge: 'HOT',
        stats: { users: '8.3k', rating: 4.9 },
    },
    {
        id: 'todo',
        title: '할 일 관리',
        description: '효율적인 Todo 체크리스트',
        icon: '✅',
        category: ['생산성'],
        href: '/utils/todo',
        badge: 'FREE',
        stats: { users: '6.7k', rating: 4.8 },
    },
    {
        id: 'qr',
        title: 'QR 코드 생성',
        description: 'URL 및 텍스트 데이터 변환',
        icon: '📱',
        category: ['이미지'],
        href: '/utils/qr',
        badge: 'HOT',
        stats: { users: '7.1k', rating: 4.9 },
    },
    {
        id: 'compress',
        title: '이미지 최적화',
        description: 'JPG, PNG, WEBP 포맷 변환',
        icon: '🔄',
        category: ['이미지'],
        href: '/utils/compress',
        badge: 'FREE',
        stats: { users: '5.6k', rating: 4.7 },
    },
    {
        id: 'remove-bg',
        title: 'AI 배경 제거',
        description: '딥러닝 기반 이미지 누끼 제거',
        icon: '✨',
        category: ['이미지'],
        href: '/utils/remove-bg',
        badge: 'AI',
        stats: { users: '12.3k', rating: 4.9 },
    },
    {
        id: 'weather',
        title: '날씨 정보',
        description: '글로벌 정밀 기상 데이터',
        icon: '🌦️',
        category: ['검색'],
        href: '/utils/weather',
        badge: 'FREE',
        stats: { users: '9.2k', rating: 4.8 },
    },
    {
        id: 'breathing',
        title: '마음 챙김 호흡',
        description: '4-7-8 자율신경 회복 프로토콜',
        icon: '🧘',
        category: ['건강', '생산성'],
        href: '/utils/breathing',
        badge: 'RECO',
        stats: { users: '200+', rating: 5.0 },
    },
    {
        id: 'mbti',
        title: '나만의 진단',
        description: '피부 타입 및 성향 정밀 분석',
        icon: '🧬',
        category: ['건강', '생산성'],
        href: '/utils/mbti',
        badge: 'NEW',
        stats: { users: 'Hot', rating: 4.9 },
    },
];

export default function UtilsPage() {
    const [selectedCategory, setSelectedCategory] = useState<Category>('전체');

    const categories: Category[] = ['전체', '검색', '이미지', '계산', '학습', '생산성', '건강'];

    const filteredUtilities =
        selectedCategory === '전체' ? utilities : utilities.filter((util) => util.category.includes(selectedCategory));

    return (
        <ChapterWrapper chapter="utils" className="min-h-screen bg-background flex flex-col">
            {/* Header Section */}
            <header className="py-24 text-center border-b border-line">
                <div className="container mx-auto px-4 space-y-8">
                    <div className="inline-flex items-center px-4 py-1.5 bg-chapter-accent/5 text-chapter-accent rounded-full text-[10px] font-black tracking-widest uppercase border border-chapter-accent/20">
                        Protocol Tools
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-text-primary tracking-tighter">회복 유틸리티 허브</h1>
                    <p className="text-xl text-text-secondary max-w-2xl mx-auto font-medium leading-relaxed opacity-60">
                        일상의 회복을 돕는 정밀한 도구들의 집합.<br className="hidden md:inline" />
                        본질에 집중하는 {utilities.length}개의 유틸리티를 경험하십시오.
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-4 flex-grow pb-32">
                <Tabs defaultValue="utilities" className="w-full mt-20">
                    {/* Premium Tab List */}
                    <div className="flex justify-center mb-16">
                        <TabsList className="bg-surface p-1 rounded-2xl border border-line h-auto flex gap-1">
                            {[
                                { val: 'utilities', label: '유틸리티', icon: <Wrench /> },
                                { val: 'minigames', label: '미니게임', icon: <Play /> },
                                { val: 'contents', label: '브랜드 가이드', icon: <Compass /> },
                            ].map((tab) => (
                                <TabsTrigger
                                    key={tab.val}
                                    value={tab.val}
                                    className="rounded-xl px-10 py-4 text-xs font-black tracking-widest uppercase data-[state=active]:bg-chapter-accent data-[state=active]:text-background transition-all flex items-center gap-2"
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {/* Tab 1: Utilities */}
                    <TabsContent value="utilities" className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
                        {/* Categories Selection */}
                        <div className="flex flex-wrap justify-center gap-3">
                            {categories.map((cat) => (
                                <Button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`rounded-full px-8 py-6 text-xs font-black tracking-widest uppercase transition-all border ${selectedCategory === cat
                                            ? 'bg-chapter-accent text-background border-chapter-accent'
                                            : 'bg-surface text-text-secondary border-line hover:border-chapter-accent/50'
                                        }`}
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>

                        {/* High-end Utility Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredUtilities.map((util) => (
                                <Link href={util.href} key={util.id} className="block group">
                                    <Card className="h-full bg-surface border-line hover:border-chapter-accent rounded-[32px] overflow-hidden transition-all duration-700 shadow-2xl hover:shadow-chapter-accent/5 transform hover:-translate-y-2">
                                        <CardHeader className="p-8 pb-4 flex flex-row items-center space-y-0">
                                            <div className="w-16 h-16 rounded-2xl bg-background border border-line flex items-center justify-center text-3xl mr-6 group-hover:bg-chapter-accent group-hover:text-background transition-all duration-500 shadow-inner">
                                                {util.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between gap-4">
                                                    <CardTitle className="text-xl font-black text-text-primary tracking-tight">
                                                        {util.title}
                                                    </CardTitle>
                                                    {util.badge && (
                                                        <Badge className={`border-none rounded-md px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${util.badge === 'HOT' || util.badge === 'AI'
                                                                ? 'bg-chapter-accent text-background'
                                                                : 'bg-background text-text-secondary opacity-40'
                                                            }`}>
                                                            {util.badge}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-8 pt-4">
                                            <CardDescription className="text-sm font-medium text-text-secondary opacity-60 mb-6 leading-relaxed">
                                                {util.description}
                                            </CardDescription>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {util.category.map((cat) => (
                                                    <span key={cat} className="text-[9px] font-black text-chapter-accent uppercase tracking-widest opacity-40">
                                                        # {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="px-8 py-6 flex justify-between items-center text-[10px] font-black tracking-widest uppercase border-t border-line/5 bg-background/30">
                                            <div className="flex items-center gap-4 text-text-secondary opacity-40">
                                                {util.stats?.users && (
                                                    <span className="flex items-center gap-1">
                                                        Users {util.stats.users}
                                                    </span>
                                                )}
                                                {util.stats?.rating && (
                                                    <span className="flex items-center gap-1 text-chapter-accent">
                                                        Rate {util.stats.rating}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-chapter-accent opacity-0 group-hover:opacity-100 transition-all flex items-center translate-x-4 group-hover:translate-x-0">
                                                Active <ArrowRight className="ml-2 w-3 h-3" />
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Other Tabs Content */}
                    <TabsContent value="minigames" className="animate-in fade-in zoom-in-95 duration-500 min-h-[400px]">
                        <div className="bg-surface border border-line rounded-[40px] p-12 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-chapter-accent/5 blur-[100px]"></div>
                            <MinigameGrid />
                        </div>
                    </TabsContent>

                    <TabsContent value="contents" className="animate-in fade-in zoom-in-95 duration-500 min-h-[400px]">
                        <div className="bg-surface border border-line rounded-[40px] p-12">
                            <ContentGrid />
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </ChapterWrapper>
    );
}
