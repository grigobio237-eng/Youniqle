'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import MinigameGrid from '@/components/utils/MinigameGrid';
import ContentGrid from '@/components/utils/ContentGrid';

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
        description: '신장과 체중으로 건강 지수 계산',
        icon: '🧮',
        category: ['계산', '건강'],
        href: '/utils/bmi',
        badge: '무료',
        stats: { users: '2.5k', rating: 4.9 },
    },
    {
        id: 'dday',
        title: 'D-Day 계산',
        description: '날짜 계산 및 디데이',
        icon: '📅',
        category: ['계산'],
        href: '/utils/dday',
        badge: '무료',
        stats: { users: '3.1k', rating: 4.6 },
    },
    {
        id: 'unit',
        title: '단위 변환기',
        description: '길이, 무게, 온도 변환',
        icon: '📏',
        category: ['계산'],
        href: '/utils/unit',
        badge: '무료',
        stats: { users: '1.8k', rating: 4.7 },
    },
    {
        id: 'currency',
        title: '환율 계산기',
        description: '실시간 환율 변환',
        icon: '💱',
        category: ['계산'],
        href: '/utils/currency',
        badge: '인기',
        stats: { users: '5.2k', rating: 4.8 },
    },
    {
        id: 'memo',
        title: '간편 메모장',
        description: '빠르게 메모하고 자동 저장',
        icon: '📝',
        category: ['생산성'],
        href: '/utils/memo',
        badge: '인기',
        stats: { users: '8.3k', rating: 4.9 },
    },
    {
        id: 'todo',
        title: '할 일 관리',
        description: 'Todo List 체크리스트',
        icon: '✅',
        category: ['생산성'],
        href: '/utils/todo',
        badge: '무료',
        stats: { users: '6.7k', rating: 4.8 },
    },
    {
        id: 'qr',
        title: 'QR 코드 생성',
        description: 'URL, 텍스트를 QR로 변환',
        icon: '📱',
        category: ['이미지'],
        href: '/utils/qr',
        badge: '인기',
        stats: { users: '7.1k', rating: 4.9 },
    },
    {
        id: 'compress',
        title: '이미지 포맷 변환',
        description: 'JPG, PNG, WEBP 변환',
        icon: '🔄',
        category: ['이미지'],
        href: '/utils/compress',
        badge: '무료',
        stats: { users: '5.6k', rating: 4.7 },
    },
    {
        id: 'remove-bg',
        title: 'AI 배경 제거',
        description: '자동 배경 제거',
        icon: '✨',
        category: ['이미지'],
        href: '/utils/remove-bg',
        badge: '인기',
        stats: { users: '12.3k', rating: 4.9 },
    },
    {
        id: 'weather',
        title: '날씨 정보',
        description: '상세 날씨 확인',
        icon: '🌦️',
        category: ['검색'],
        href: '/utils/weather',
        badge: '무료',
        stats: { users: '9.2k', rating: 4.8 },
    },
    {
        id: 'breathing',
        title: '마음 챙김 호흡',
        description: '4-7-8 호흡, 명상 타이머',
        icon: '🧘',
        category: ['건강', '생산성'],
        href: '/utils/breathing',
        badge: 'NEW',
        stats: { users: '200+', rating: 5.0 },
    },
    {
        id: 'mbti',
        title: '나만의 진단 (MBTI)',
        description: '성격, 피부 타입 분석 및 추천',
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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 text-white text-center shadow-lg">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">실생활 유틸리티 허브</h1>
                    <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
                        하나의 플랫폼에서 모든 일상을 해결하세요
                        <br className="hidden md:inline" /> 총 {utilities.length}개의 편리한 도구를 무료로 사용하실 수 있습니다
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-4 -mt-8 flex-grow pb-16">
                <Tabs defaultValue="utilities" className="w-full">
                    {/* Floating Tab List */}
                    <div className="flex justify-center mb-8">
                        <TabsList className="bg-white p-1 rounded-full shadow-lg border border-gray-100 h-auto">
                            <TabsTrigger
                                value="utilities"
                                className="rounded-full px-8 py-3 text-base font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all"
                            >
                                유틸리티
                            </TabsTrigger>
                            <TabsTrigger
                                value="minigames"
                                className="rounded-full px-8 py-3 text-base font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all"
                            >
                                미니게임
                            </TabsTrigger>
                            <TabsTrigger
                                value="contents"
                                className="rounded-full px-8 py-3 text-base font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all"
                            >
                                컨텐츠
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Tab 1: Utilities */}
                    <TabsContent value="utilities" className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                        {/* Categories */}
                        <div className="flex flex-wrap justify-center gap-2">
                            {categories.map((cat) => (
                                <Button
                                    key={cat}
                                    variant={selectedCategory === cat ? 'default' : 'outline'}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`rounded-full px-6 transition-all ${selectedCategory === cat ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-white hover:bg-gray-50'
                                        }`}
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>

                        {/* Utility Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredUtilities.map((util) => (
                                <Link href={util.href} key={util.id} className="block group">
                                    <Card className="h-full hover:shadow-xl transition-all duration-300 border-none shadow-md bg-white overflow-hidden group-hover:-translate-y-1">
                                        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl mr-4 group-hover:scale-110 transition-transform duration-300">
                                                {util.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                        {util.title}
                                                    </CardTitle>
                                                    {util.badge && (
                                                        <Badge variant={util.badge === 'NEW' ? 'default' : 'secondary'} className={`${util.badge === 'NEW' ? 'bg-orange-500' : 'bg-blue-100 text-blue-700'}`}>
                                                            {util.badge}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-base text-gray-600 mb-4">{util.description}</CardDescription>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {util.category.map((cat) => (
                                                    <Badge key={cat} variant="outline" className="text-xs text-gray-500 font-normal">
                                                        #{cat}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="pt-0 flex justify-between items-center text-sm text-gray-400 border-t bg-gray-50/50 p-4">
                                            <div className="flex items-center gap-3">
                                                {util.stats?.users && (
                                                    <span className="flex items-center gap-1">
                                                        👤 {util.stats.users}
                                                    </span>
                                                )}
                                                {util.stats?.rating && (
                                                    <span className="flex items-center gap-1 text-yellow-500 font-medium">
                                                        ⭐ {util.stats.rating}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                                바로가기 <span className="ml-1">→</span>
                                            </span>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Tab 2: Minigames */}
                    <TabsContent value="minigames" className="animate-in fade-in zoom-in-95 duration-300">
                        <div className="mb-4 text-center text-gray-500">
                            잠시 머리를 식히고 동료들과 함께 즐겨보세요! 🎮
                        </div>
                        <MinigameGrid />
                    </TabsContent>

                    {/* Tab 3: Contents */}
                    <TabsContent value="contents" className="animate-in fade-in zoom-in-95 duration-300">
                        <div className="mb-4 text-center text-gray-500">
                            파트너와 관리자가 엄선한 꿀팁 영상들을 만나보세요 📺
                        </div>
                        <ContentGrid />
                    </TabsContent>
                </Tabs>
            </main>

            <footer className="bg-white border-t py-12 text-center text-gray-500">
                <div className="container mx-auto px-4">
                    <p className="mb-2">© 2024 Youniqle Utility Hub. All rights reserved.</p>
                    <p className="text-sm">
                        실생활에 필요한 다양한 도구들을 지속적으로 업데이트하고 있습니다.
                    </p>
                </div>
            </footer>
        </div>
    );
}
