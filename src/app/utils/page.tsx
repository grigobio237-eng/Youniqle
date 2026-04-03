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
import { useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight, Box, Compass, Play, Pause, Wrench, ChevronLeft, ChevronRight, X } from 'lucide-react';

type Category = '전체' | '검색' | '이미지' | '계산' | '학습' | '생산성' | '건강' | '회복';

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
        id: 'food-scanner',
        title: 'AI 회복 식단 스캐너',
        description: '카메라로 식단을 분석하고 현재 내 몸의 회복 데이터를 진단',
        icon: '🍱',
        category: ['건강', '회복', '이미지'],
        href: '/utils/food-scanner',
        badge: 'AI NEW',
        stats: { users: 'AI', rating: 5.0 },
    },
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
    {
        id: 'stretch',
        title: '오피스 리셋 스트레칭',
        description: '경직된 신체 데이터를 즉각적으로 유연하게 교정',
        icon: '🤸',
        category: ['건강', '생산성'],
        href: '/utils?tool=stretch',
        badge: 'FREE',
        stats: { users: 'NEW', rating: 5.0 },
    },
    {
        id: 'sleep',
        title: '나이트 리커버리',
        description: '어젯밤의 수면 정보를 분석하여 컨디션 부스팅',
        icon: '🌙',
        category: ['건강', '회복'],
        href: '/utils?tool=sleep',
        badge: 'HOT',
        stats: { users: 'AI', rating: 4.8 },
    },
    {
        id: 'water',
        title: '수분 밸런스 체크',
        description: '체내 수분 데이터를 정밀하게 추적하고 관리',
        icon: '💧',
        category: ['건강', '회복'],
        href: '/utils?tool=water',
        badge: 'BEST',
        stats: { users: 'PRO', rating: 4.9 },
    }
];

export default function UtilityPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-obsidian"></div>
            </div>
        }>
            <UtilsContent />
        </Suspense>
    );
}

function UtilsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category>('전체');
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [showWaterModal, setShowWaterModal] = useState(false);
    const [showStretchModal, setShowStretchModal] = useState(false);

    useEffect(() => {
        if (!searchParams) return;
        const tool = searchParams.get('tool');
        if (tool === 'sleep') {
            setShowRecoveryModal(true);
        } else if (tool === 'water') {
            setShowWaterModal(true);
        } else if (tool === 'stretch') {
            setShowStretchModal(true);
        }
    }, [searchParams]);

    const categories: Category[] = ['전체', '계산', '학습', '생산성', '이미지', '검색', '건강', '회복'];

    const filteredUtilities = utilities.filter(util => {
        const matchesSearch = util.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            util.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === '전체' || util.category.includes(selectedCategory);
        return matchesSearch && matchesCategory;
    });

    const handleToolClick = (id: string, href: string) => {
        if (id === 'sleep') {
            setShowRecoveryModal(true);
            router.push('/utils?tool=sleep');
        } else if (id === 'water') {
            setShowWaterModal(true);
            router.push('/utils?tool=water');
        } else if (id === 'stretch') {
            setShowStretchModal(true);
            router.push('/utils?tool=stretch');
        }
    };

    return (
        <ChapterWrapper chapter="utils">
            <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-20">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-[40px] bg-obsidian text-mist p-8 md:p-12 lg:p-20 group text-center md:text-left flex flex-col items-center md:items-start">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent opacity-50"></div>
                    <div className="relative z-10 max-w-2xl space-y-4 md:space-y-6">
                        <Badge className="bg-white/20 text-white hover:bg-white/30 border-none px-4 py-1.5 rounded-full backdrop-blur-md inline-block">
                            Utility Hub v2.0
                        </Badge>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-tight md:leading-none italic">
                            SUPERCHARGED<br />EXPERIENCE
                        </h1>
                        <p className="text-base md:text-xl lg:text-2xl font-medium opacity-60 leading-relaxed max-w-lg">
                            그리 고 바이오가 제안하는 고성능 유틸리티 도구들을 만나보세요. 단순한 기능을 넘어 최상의 경험을 제공합니다.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <div className="px-6 py-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                                <div className="text-2xl font-black italic">42+</div>
                                <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Available Tools</div>
                            </div>
                            <div className="px-6 py-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                                <div className="text-2xl font-black italic">1M+</div>
                                <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Active Users</div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity duration-1000 hidden lg:block">
                        <Box className="w-[500px] h-[500px] rotate-12" />
                    </div>
                </div>

                {/* Filter section */}
                <div className="space-y-12">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black italic tracking-tighter uppercase text-obsidian">Tool Kit</h2>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-6 py-2 rounded-full text-xs font-black transition-all tracking-widest uppercase ${selectedCategory === cat
                                            ? 'bg-obsidian text-white shadow-xl transform -translate-y-1'
                                            : 'bg-mist text-slate hover:bg-line-heavy'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="relative w-full lg:w-96">
                            <input
                                type="text"
                                placeholder="도구 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-16 bg-white border-2 border-line rounded-3xl px-8 focus:border-obsidian focus:ring-4 focus:ring-obsidian/5 transition-all outline-none font-bold placeholder:opacity-30"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-obsidian rounded-2xl flex items-center justify-center text-white">
                                <Compass className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredUtilities.map((util) => (
                            <Link
                                key={util.id}
                                href={util.href}
                                onClick={(e) => {
                                    if (util.href.startsWith('/utils?tool=')) {
                                        e.preventDefault();
                                        handleToolClick(util.id, util.href);
                                    }
                                }}
                            >
                                <Card className="group h-full border-2 border-line hover:border-obsidian rounded-[40px] transition-all hover:shadow-2xl overflow-hidden bg-white">
                                    <CardContent className="p-8 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="w-16 h-16 bg-mist rounded-3xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                                {util.icon}
                                            </div>
                                            {util.badge && (
                                                <Badge className={`border-none px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${util.badge === 'HOT' ? 'bg-orange-500 text-white animate-pulse' :
                                                    util.badge === 'AI' ? 'bg-obsidian text-white' :
                                                        'bg-slate/10 text-slate'
                                                    }`}>
                                                    {util.badge}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black italic tracking-tighter text-obsidian line-clamp-1">{util.title}</h3>
                                            <p className="text-sm font-medium text-slate opacity-60 line-clamp-2 leading-relaxed">
                                                {util.description}
                                            </p>
                                        </div>

                                        <div className="pt-4 flex items-center justify-between border-t border-line border-dashed">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-mist text-[8px] flex items-center justify-center font-black">
                                                        U{i}
                                                    </div>
                                                ))}
                                                <div className="text-[10px] font-black text-slate opacity-30 pl-3 self-center">
                                                    {util.stats?.users}+ Used
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] font-black text-obsidian">
                                                ★ {util.stats?.rating}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Additional Content Tabs */}
                <div className="space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase text-obsidian">Beyond Tools</h2>
                        <p className="text-slate opacity-60 font-medium">유틸리티 그 이상의 가치를 경험하세요.</p>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full max-w-[600px] mx-auto grid grid-cols-2 h-auto p-1.5 bg-mist rounded-[24px] border border-line mb-12">
                            <TabsTrigger value="minigame" className="rounded-[18px] py-4 font-black italic text-sm tracking-widest uppercase data-[state=active]:bg-obsidian data-[state=active]:text-white">
                                Mini Games
                            </TabsTrigger>
                            <TabsTrigger value="content" className="rounded-[18px] py-4 font-black italic text-sm tracking-widest uppercase data-[state=active]:bg-obsidian data-[state=active]:text-white">
                                Content Grid
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="minigame">
                            <MinigameGrid />
                        </TabsContent>
                        <TabsContent value="content">
                            <ContentGrid />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <RecoveryModal open={showRecoveryModal} onOpenChange={setShowRecoveryModal} />
            <WaterModal open={showWaterModal} onOpenChange={setShowWaterModal} />
            <StretchModal open={showStretchModal} onOpenChange={setShowStretchModal} />
        </ChapterWrapper>
    );
}

// Sub-modals and component definitions
function RecoveryModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const [bedtimeHour, setBedtimeHour] = useState(23);
    const [bedtimeMin, setBedtimeMin] = useState(0);
    const [wakeHour, setWakeHour] = useState(7);
    const [wakeMin, setWakeMin] = useState(0);
    const [quality, setQuality] = useState('good');
    const [disturbances, setDisturbances] = useState<string[]>([]);
    const [isSaved, setIsSaved] = useState(false);

    const disturbanceOptions = [
        { id: 'woke_up', icon: '🌙', label: '중간에 깸' },
        { id: 'dreams', icon: '💭', label: '꿈' },
        { id: 'noise', icon: '🔊', label: '소음' },
        { id: 'temp', icon: '🌡️', label: '온도' },
        { id: 'stress', icon: '😰', label: '스트레스' },
        { id: 'phone', icon: '📱', label: '스마트폰' },
    ];

    const qualityOptions = [
        { id: 'poor', icon: '😫', label: '나쁨', color: 'border-red-400 bg-red-50' },
        { id: 'fair', icon: '😑', label: '보통', color: 'border-yellow-400 bg-yellow-50' },
        { id: 'good', icon: '🙂', label: '좋음', color: 'border-green-400 bg-green-50' },
        { id: 'great', icon: '🤩', label: '완벽', color: 'border-blue-400 bg-blue-50' }
    ];

    // 수면 시간 계산
    const calculateSleepDuration = () => {
        let bedtime = bedtimeHour * 60 + bedtimeMin;
        let waketime = wakeHour * 60 + wakeMin;

        if (waketime < bedtime) {
            waketime += 24 * 60; // 다음날로 넘어간 경우
        }

        const duration = waketime - bedtime;
        const hours = Math.floor(duration / 60);
        const mins = duration % 60;
        return { hours, mins, total: duration };
    };

    const sleepDuration = calculateSleepDuration();

    const toggleDisturbance = (id: string) => {
        setDisturbances(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const handleSave = () => {
        // localStorage에 저장
        const data = {
            bedtime: `${bedtimeHour.toString().padStart(2, '0')}:${bedtimeMin.toString().padStart(2, '0')}`,
            waketime: `${wakeHour.toString().padStart(2, '0')}:${wakeMin.toString().padStart(2, '0')}`,
            duration: sleepDuration.total,
            quality,
            disturbances,
            date: new Date().toISOString().split('T')[0]
        };
        localStorage.setItem('recovery_sleep_data', JSON.stringify(data));
        localStorage.setItem('recovery_last_score', String(Math.round(sleepDuration.hours * 10)));

        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
            onOpenChange(false);
        }, 1500);
    };

    const getSleepAdvice = () => {
        if (sleepDuration.hours >= 8) return { text: "충분한 수면 시간이에요! 👍", color: "text-green-600" };
        if (sleepDuration.hours >= 7) return { text: "적정 수면 시간이에요.", color: "text-blue-600" };
        if (sleepDuration.hours >= 6) return { text: "조금 더 자면 좋겠어요.", color: "text-yellow-600" };
        return { text: "수면이 많이 부족해요! 😴", color: "text-red-600" };
    };

    const advice = getSleepAdvice();

    // 저장 완료 화면
    if (isSaved) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-[40px] shadow-2xl bg-surface">
                    <div className="h-80 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        <div className="text-8xl mb-4 animate-bounce">✅</div>
                        <h2 className="text-2xl font-black">저장 완료!</h2>
                        <p className="text-white/70 mt-2">수면 데이터가 기록되었습니다</p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-[40px] shadow-2xl bg-surface max-h-[90vh] overflow-y-auto">
                <div className="relative">
                    <DialogHeader className="sr-only">
                        <DialogTitle>수면 리커버리 기록</DialogTitle>
                        <DialogDescription>어젯밤의 수면 데이터를 입력하세요.</DialogDescription>
                    </DialogHeader>

                    <div className="h-40 bg-gradient-to-br from-indigo-600 to-purple-700 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiPjwvcmVjdD4KPC9zdmc+')]"></div>
                        <div className="relative z-10 flex flex-col items-center text-white">
                            <div className="text-4xl mb-2">🌙</div>
                            <h2 className="text-xl font-black tracking-tight">수면 기록</h2>
                            <p className="text-sm text-white/70">어젯밤 수면을 기록해주세요</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* 시간 선택 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate uppercase tracking-widest">취침 시간</label>
                                <div className="flex items-center gap-1 bg-mist rounded-xl p-3">
                                    <select
                                        value={bedtimeHour}
                                        onChange={(e) => setBedtimeHour(parseInt(e.target.value))}
                                        className="bg-transparent text-2xl font-black text-obsidian w-14 text-center focus:outline-none"
                                        aria-label="취침 시간 (시)"
                                    >
                                        {Array.from({ length: 24 }, (_, i) => (
                                            <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                                        ))}
                                    </select>
                                    <span className="text-2xl font-black text-obsidian">:</span>
                                    <select
                                        value={bedtimeMin}
                                        onChange={(e) => setBedtimeMin(parseInt(e.target.value))}
                                        className="bg-transparent text-2xl font-black text-obsidian w-14 text-center focus:outline-none"
                                        aria-label="취침 시간 (분)"
                                    >
                                        {[0, 15, 30, 45].map(m => (
                                            <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate uppercase tracking-widest">기상 시간</label>
                                <div className="flex items-center gap-1 bg-mist rounded-xl p-3">
                                    <select
                                        value={wakeHour}
                                        onChange={(e) => setWakeHour(parseInt(e.target.value))}
                                        className="bg-transparent text-2xl font-black text-obsidian w-14 text-center focus:outline-none"
                                        aria-label="기상 시간 (시)"
                                    >
                                        {Array.from({ length: 24 }, (_, i) => (
                                            <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                                        ))}
                                    </select>
                                    <span className="text-2xl font-black text-obsidian">:</span>
                                    <select
                                        value={wakeMin}
                                        onChange={(e) => setWakeMin(parseInt(e.target.value))}
                                        className="bg-transparent text-2xl font-black text-obsidian w-14 text-center focus:outline-none"
                                        aria-label="기상 시간 (분)"
                                    >
                                        {[0, 15, 30, 45].map(m => (
                                            <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 총 수면 시간 */}
                        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-center">
                            <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mb-1">총 수면 시간</p>
                            <p className="text-3xl font-black text-indigo-700">
                                {sleepDuration.hours}시간 {sleepDuration.mins > 0 && `${sleepDuration.mins}분`}
                            </p>
                            <p className={`text-sm font-medium mt-1 ${advice.color}`}>{advice.text}</p>
                        </div>

                        {/* 수면 품질 */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate uppercase tracking-widest">수면 품질</label>
                            <div className="grid grid-cols-4 gap-2">
                                {qualityOptions.map((q) => (
                                    <button
                                        key={q.id}
                                        onClick={() => setQuality(q.id)}
                                        className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${quality === q.id
                                            ? `${q.color} border-2 shadow-md transform -translate-y-0.5`
                                            : 'border-line bg-white hover:border-line-heavy'
                                            }`}
                                    >
                                        <span className="text-2xl">{q.icon}</span>
                                        <span className="text-[10px] font-bold text-slate">{q.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 방해 요소 */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate uppercase tracking-widest">방해 요소 (선택)</label>
                            <div className="flex flex-wrap gap-2">
                                {disturbanceOptions.map((d) => (
                                    <button
                                        key={d.id}
                                        onClick={() => toggleDisturbance(d.id)}
                                        className={`px-3 py-2 rounded-full border-2 transition-all flex items-center gap-1.5 text-sm ${disturbances.includes(d.id)
                                            ? 'border-obsidian bg-obsidian text-mist'
                                            : 'border-line bg-white text-slate hover:border-line-heavy'
                                            }`}
                                    >
                                        <span>{d.icon}</span>
                                        <span className="font-medium">{d.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 저장 버튼 */}
                        <Button
                            className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl"
                            onClick={handleSave}
                        >
                            🌙 수면 기록 저장하기
                        </Button>
                    </div>

                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors z-20"
                        aria-label="모달 닫기"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function WaterModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const [intake, setIntake] = useState(0);
    const [goal, setGoal] = useState(2000);
    const [customAmount, setCustomAmount] = useState('');
    const [records, setRecords] = useState<{ time: string, amount: number, type: string }[]>([]);
    const [showGoalEdit, setShowGoalEdit] = useState(false);
    const progress = Math.min((intake / goal) * 100, 100);

    const drinkOptions = [
        { id: 'water', icon: '💧', label: '물', amount: 250 },
        { id: 'bigwater', icon: '🥤', label: '큰 잔', amount: 500 },
        { id: 'coffee', icon: '☕', label: '커피', amount: 200 },
        { id: 'tea', icon: '🍵', label: '차', amount: 150 },
    ];

    const handleAdd = (amount: number, type: string = '물') => {
        const newIntake = Math.min(intake + amount, 5000);
        setIntake(newIntake);

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        setRecords(prev => [...prev, { time: timeStr, amount, type }]);
    };

    const handleCustomAdd = () => {
        const amount = parseInt(customAmount);
        if (amount > 0 && amount <= 2000) {
            handleAdd(amount, '직접입력');
            setCustomAmount('');
        }
    };

    const handleReset = () => {
        setIntake(0);
        setRecords([]);
    };

    const getStatusMessage = () => {
        if (progress >= 100) return { text: "목표 달성! 🎉 오늘도 완벽한 수분 밸런스예요!", color: "text-green-600" };
        if (progress >= 80) return { text: "거의 다 왔어요! 조금만 더 마시면 목표 달성!", color: "text-chapter-accent" };
        if (progress >= 50) return { text: "절반 왔어요! 물 한 잔 더 마셔볼까요?", color: "text-blue-600" };
        if (progress >= 25) return { text: "좋은 시작이에요! 꾸준히 마셔주세요 💪", color: "text-slate" };
        return { text: "수분 섭취를 시작해볼까요? 건강의 첫걸음이에요!", color: "text-slate" };
    };

    const status = getStatusMessage();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-[40px] shadow-2xl bg-surface max-h-[90vh] overflow-y-auto">
                <div className="relative">
                    <DialogHeader className="sr-only">
                        <DialogTitle>수분 밸런스 체크</DialogTitle>
                        <DialogDescription>오늘의 수분 섭취량을 기록하고 관리하세요.</DialogDescription>
                    </DialogHeader>

                    {/* Visual Progress Header */}
                    <div className="h-56 bg-gradient-to-br from-blue-400 to-indigo-600 flex flex-col items-center justify-center relative overflow-hidden">
                        {/* Wave Background */}
                        <div className="absolute bottom-0 left-0 w-full bg-white/20 transition-all duration-1000 ease-out water-wave" />
                        <style jsx>{`
                            .water-wave {
                                height: ${progress}%;
                            }
                        `}</style>

                        {/* Bubbles animation */}
                        {progress < 100 && (
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute bottom-0 left-1/4 w-3 h-3 bg-white/30 rounded-full animate-bounce [animation-delay:0s]" />
                                <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-white/20 rounded-full animate-bounce [animation-delay:0.5s]" />
                                <div className="absolute bottom-0 left-3/4 w-4 h-4 bg-white/25 rounded-full animate-bounce [animation-delay:1s]" />
                            </div>
                        )}

                        <div className="relative z-10 flex flex-col items-center text-white">
                            <div className="text-5xl mb-3">{progress >= 100 ? '🎊' : '💧'}</div>
                            <div className="text-5xl font-black tracking-tighter">
                                {intake.toLocaleString()}
                                <span className="text-xl opacity-70 ml-1">ml</span>
                            </div>
                            <div className="text-sm font-bold opacity-70 mt-1 uppercase tracking-widest">
                                {Math.round(progress)}% 달성
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-5">
                        {/* 상태 메시지 */}
                        <div className="text-center">
                            <p className={`font-bold text-lg ${status.color}`}>{status.text}</p>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <span className="text-sm text-slate">목표:</span>
                                {showGoalEdit ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={goal}
                                            onChange={(e) => setGoal(Math.max(500, Math.min(5000, parseInt(e.target.value) || 2000)))}
                                            className="w-20 text-center border border-line rounded-lg px-2 py-1 text-sm font-bold"
                                            aria-label="수분 섭취 목표량 (ml)"
                                        />
                                        <span className="text-sm text-slate">ml</span>
                                        <button onClick={() => setShowGoalEdit(false)} className="text-xs text-blue-500 font-bold">확인</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setShowGoalEdit(true)} className="text-sm font-bold text-blue-600 hover:underline">
                                        {goal.toLocaleString()}ml 변경
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-3 bg-mist rounded-full overflow-hidden border border-line">
                            <div
                                className={`h-full transition-all duration-500 ease-out rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'} water-progress-bar`}
                            />
                            <style jsx>{`
                                .water-progress-bar {
                                    width: ${progress}%;
                                }
                            `}</style>
                        </div>

                        {/* 빠른 추가 버튼 */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-black text-slate uppercase tracking-widest">빠른 추가</h4>
                            <div className="grid grid-cols-4 gap-2">
                                {drinkOptions.map((drink) => (
                                    <button
                                        key={drink.id}
                                        onClick={() => handleAdd(drink.amount, drink.label)}
                                        className="p-3 rounded-2xl border-2 border-line hover:border-blue-400 bg-white transition-all flex flex-col items-center gap-1 group active:scale-95"
                                    >
                                        <span className="text-2xl group-hover:scale-110 transition-transform">{drink.icon}</span>
                                        <span className="text-[10px] font-bold text-slate">{drink.label}</span>
                                        <span className="text-[9px] text-slate/60">{drink.amount}ml</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 직접 입력 */}
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="직접 입력 (ml)"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCustomAdd()}
                                className="flex-1 border-2 border-line rounded-xl px-4 py-3 text-sm font-medium focus:border-blue-400 focus:outline-none"
                            />
                            <Button
                                onClick={handleCustomAdd}
                                disabled={!customAmount || parseInt(customAmount) <= 0}
                                className="px-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold"
                            >
                                추가
                            </Button>
                        </div>

                        {/* 오늘 기록 */}
                        {records.length > 0 && (
                            <div className="bg-mist/50 rounded-2xl p-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-black text-slate uppercase tracking-widest">오늘 기록</h4>
                                    <button onClick={handleReset} className="text-xs text-status-danger font-bold hover:underline">
                                        초기화
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                                    {records.slice(-6).map((record, idx) => (
                                        <span key={idx} className="bg-white px-3 py-1 rounded-full text-xs font-medium text-slate border border-line">
                                            {record.time} {record.type} {record.amount}ml
                                        </span>
                                    ))}
                                    {records.length > 6 && (
                                        <span className="bg-blue-100 px-3 py-1 rounded-full text-xs font-bold text-blue-600">
                                            +{records.length - 6}개 더
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 저장 버튼 */}
                        <Button
                            className="w-full h-14 rounded-2xl bg-obsidian text-mist font-black shadow-xl"
                            onClick={() => onOpenChange(false)}
                        >
                            {progress >= 100 ? '🎉 목표 달성! 저장하기' : '오늘의 기록 저장'}
                        </Button>
                    </div>

                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors z-20"
                        aria-label="모달 닫기"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function StretchModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const [step, setStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15);
    const [isCompleted, setIsCompleted] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const steps = [
        {
            title: '목 스트레칭',
            titleEn: 'Neck Reset',
            icon: '🧘',
            time: 15,
            shortDesc: '뻣뻣한 목 근육을 부드럽게 풀어줍니다',
            instructions: [
                '👉 편하게 의자에 앉아서 등을 꼿꼿이 펴주세요',
                '👉 어깨에 힘을 빼고, 양손은 무릎 위에 올려놓으세요',
                '👉 머리를 천천히 왼쪽으로 기울여 5초간 유지하세요',
                '👉 이번엔 오른쪽으로 기울여 5초간 유지하세요',
                '👉 마지막으로 천천히 고개를 아래로 숙여 5초간 유지!'
            ],
            tip: '💡 목을 돌릴 때 어깨가 따라 올라가지 않도록 주의하세요!'
        },
        {
            title: '어깨 풀기',
            titleEn: 'Shoulder Unlock',
            icon: '🙆',
            time: 20,
            shortDesc: '굳어있는 어깨를 시원하게 풀어줍니다',
            instructions: [
                '👉 양쪽 어깨를 귀에 닿을 만큼 으쓱~ 올려보세요',
                '👉 3초 동안 힘껏 올린 상태로 유지하세요',
                '👉 "후~" 숨을 내쉬면서 어깨를 툭 떨어뜨리세요',
                '👉 이 동작을 3번 반복해주세요',
                '👉 마지막으로 어깨를 뒤로 크게 5번 돌려주세요'
            ],
            tip: '💡 어깨를 돌릴 때 원을 크게 그린다고 상상하면 더 시원해요!'
        },
        {
            title: '허리 펴기',
            titleEn: 'Spine Decompress',
            icon: '🤸',
            time: 30,
            shortDesc: '오래 앉아서 굳은 허리를 시원하게 펴줍니다',
            instructions: [
                '👉 의자 끝에 앉아서 발을 바닥에 평평하게 놓으세요',
                '👉 양손을 머리 뒤에 깍지 끼고 하늘을 바라보세요',
                '👉 숨을 크게 들이마시면서 가슴을 활짝 펴주세요',
                '👉 5초간 유지한 후, 천천히 숨을 내쉬며 돌아오세요',
                '👉 이번엔 상체를 앞으로 숙여 발끝을 터치해보세요',
                '👉 마지막으로 허리를 좌우로 천천히 트위스트!'
            ],
            tip: '💡 허리가 아프면 무리하지 말고 할 수 있는 만큼만 하세요!'
        }
    ];

    useEffect(() => {
        if (isPlaying && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isPlaying) {
            setIsPlaying(false);
            // 자동으로 다음 단계 알림
            if (step < steps.length - 1) {
                setTimeout(() => {
                    setStep(prev => prev + 1);
                    setTimeLeft(steps[step + 1].time);
                }, 500);
            } else {
                setIsCompleted(true);
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, timeLeft, step]);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(prev => prev + 1);
            setTimeLeft(steps[step + 1].time);
            setIsPlaying(false);
        } else {
            setIsCompleted(true);
        }
    };

    const handlePrev = () => {
        if (step > 0) {
            setStep(prev => prev - 1);
            setTimeLeft(steps[step - 1].time);
            setIsPlaying(false);
        }
    };

    const handleReset = () => {
        setStep(0);
        setTimeLeft(steps[0].time);
        setIsPlaying(false);
        setIsCompleted(false);
    };

    const handleClose = () => {
        handleReset();
        onOpenChange(false);
    };

    // 완료 화면
    if (isCompleted) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-[40px] shadow-2xl bg-surface">
                    <div className="relative">
                        <DialogHeader className="sr-only">
                            <DialogTitle>스트레칭 완료</DialogTitle>
                            <DialogDescription>축하합니다! 오늘의 스트레칭을 완료했습니다.</DialogDescription>
                        </DialogHeader>

                        <div className="h-64 bg-gradient-to-br from-green-400 to-emerald-600 flex flex-col items-center justify-center relative overflow-hidden p-8">
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-10 left-10 text-6xl animate-bounce">🎉</div>
                                <div className="absolute bottom-10 right-10 text-6xl animate-bounce delay-150">✨</div>
                            </div>
                            <div className="relative z-10 flex flex-col items-center text-white text-center">
                                <div className="text-8xl mb-4">🏆</div>
                                <h2 className="text-3xl font-black tracking-tight">완료!</h2>
                                <p className="text-lg opacity-80 mt-2">오늘도 건강해졌어요</p>
                            </div>
                        </div>

                        <div className="p-10 space-y-6 text-center">
                            <div className="space-y-2">
                                <p className="text-2xl font-black text-obsidian">스트레칭 미션 성공! 🎊</p>
                                <p className="text-slate font-medium">
                                    3가지 스트레칭을 모두 완료했어요.<br />
                                    뻣뻣했던 몸이 한결 가벼워졌을 거예요!
                                </p>
                            </div>

                            <div className="bg-mist/50 rounded-2xl p-6 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate">완료한 스트레칭</span>
                                    <span className="font-bold text-obsidian">3가지</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate">소요 시간</span>
                                    <span className="font-bold text-obsidian">약 1분 5초</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate">오늘의 스트레칭</span>
                                    <span className="font-bold text-green-600">✓ 달성</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold" onClick={handleReset}>
                                    다시 하기
                                </Button>
                                <Button className="flex-1 h-14 rounded-2xl bg-obsidian text-mist font-black shadow-xl" onClick={handleClose}>
                                    완료 🎉
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const currentStep = steps[step];
    const progress = ((currentStep.time - timeLeft) / currentStep.time) * 100;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none rounded-[40px] shadow-2xl bg-surface max-h-[90vh] overflow-y-auto">
                <div className="relative">
                    <DialogHeader className="sr-only">
                        <DialogTitle>오피스 리셋 스트레칭</DialogTitle>
                        <DialogDescription>1분 만에 신체 밸런스를 회복하세요.</DialogDescription>
                    </DialogHeader>

                    {/* 헤더 */}
                    <div className="h-48 bg-gradient-to-br from-chapter-accent/90 to-chapter-accent flex flex-col items-center justify-center relative overflow-hidden p-6">
                        <div className="absolute top-3 left-4 text-xs font-black text-white/60 uppercase tracking-widest">
                            Step {step + 1} of {steps.length}
                        </div>

                        {/* 원형 타이머 */}
                        <div className="relative w-28 h-28">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="56" cy="56" r="50"
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="8"
                                    fill="none"
                                />
                                <circle
                                    cx="56" cy="56" r="50"
                                    stroke="white"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 50}`}
                                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                                    className="transition-all duration-1000 ease-linear"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                <span className="text-3xl">{currentStep.icon}</span>
                            </div>
                        </div>

                        <h2 className="text-xl font-black text-white mt-3 tracking-tight">{currentStep.title}</h2>
                        <p className="text-sm text-white/70 font-medium">{currentStep.shortDesc}</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* 타이머 */}
                        <div className="text-center">
                            <div className="text-5xl font-black text-obsidian tabular-nums">
                                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </div>
                            <p className="text-xs text-slate mt-1 uppercase tracking-widest">남은 시간</p>
                        </div>

                        {/* 상세 가이드 */}
                        <div className="bg-mist/50 rounded-2xl p-5 space-y-3">
                            <h4 className="font-black text-obsidian text-sm flex items-center gap-2">
                                📋 따라해 보세요!
                            </h4>
                            <div className="space-y-2">
                                {currentStep.instructions.map((instruction, idx) => (
                                    <p key={idx} className="text-sm text-obsidian/80 leading-relaxed pl-1">
                                        {instruction}
                                    </p>
                                ))}
                            </div>
                        </div>

                        {/* 팁 */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <p className="text-sm text-yellow-800 font-medium">
                                {currentStep.tip}
                            </p>
                        </div>

                        {/* 컨트롤 */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="w-14 h-14 rounded-xl border-2 border-line"
                                onClick={handlePrev}
                                disabled={step === 0}
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                            <Button
                                variant="outline"
                                className={`w-16 h-16 rounded-2xl border-2 ${isPlaying ? 'border-chapter-accent bg-chapter-accent/10' : 'border-obsidian text-obsidian hover:bg-obsidian hover:text-white'}`}
                                onClick={togglePlay}
                            >
                                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                            </Button>
                            <Button
                                className="flex-1 h-14 rounded-xl bg-obsidian text-mist font-black shadow-lg group"
                                onClick={handleNext}
                            >
                                {step === steps.length - 1 ? '완료하기 🎉' : '다음 동작'}
                                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>

                        {/* 단계 표시 */}
                        <div className="flex justify-center gap-2 pt-2">
                            {steps.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setStep(i);
                                        setTimeLeft(steps[i].time);
                                        setIsPlaying(false);
                                    }}
                                    className={`h-2 rounded-full transition-all duration-300 ${i === step
                                        ? 'w-8 bg-chapter-accent'
                                        : i < step
                                            ? 'w-2 bg-green-500'
                                            : 'w-2 bg-line'
                                        }`}
                                    aria-label={`${i + 1}단계로 이동`}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors z-20"
                        aria-label="모달 닫기"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

