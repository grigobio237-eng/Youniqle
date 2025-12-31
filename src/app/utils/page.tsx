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
                <div className="relative overflow-hidden rounded-[40px] bg-obsidian text-mist p-12 lg:p-20 group">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent opacity-50"></div>
                    <div className="relative z-10 max-w-2xl space-y-6">
                        <Badge className="bg-white/20 text-white hover:bg-white/30 border-none px-4 py-1.5 rounded-full backdrop-blur-md">
                            Utility Hub v2.0
                        </Badge>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none italic">
                            SUPERCHARGED<br />EXPERIENCE
                        </h1>
                        <p className="text-xl lg:text-2xl font-medium opacity-60 leading-relaxed max-w-lg">
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
    const [hours, setHours] = useState(7.5);
    const [quality, setQuality] = useState('good');

    const handleSave = () => {
        // AI 엔진에 데이터를 전송하는 시뮬레이션
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-[40px] shadow-2xl bg-surface">
                <div className="relative">
                    <DialogHeader className="sr-only">
                        <DialogTitle>수면 리커버리 기록</DialogTitle>
                        <DialogDescription>어젯밤의 수면 데이터를 입력하세요.</DialogDescription>
                    </DialogHeader>

                    <div className="h-48 bg-gradient-to-br from-[#1A1D21] to-[#2D333B] flex flex-col items-center justify-center relative overflow-hidden p-8">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                        <div className="relative z-10 flex flex-col items-center text-white">
                            <div className="text-4xl mb-2 animate-pulse">🌙</div>
                            <h2 className="text-2xl font-black tracking-tighter uppercase">Sleep Analysis</h2>
                        </div>
                    </div>

                    <div className="p-10 space-y-10">
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <label className="text-xs font-black text-slate uppercase tracking-widest opacity-40">Sleep Duration</label>
                                <div className="text-3xl font-black text-obsidian">{hours} <span className="text-sm">Hours</span></div>
                            </div>
                            <input
                                type="range"
                                min="3" max="12" step="0.5"
                                value={hours}
                                onChange={(e) => setHours(parseFloat(e.target.value))}
                                className="w-full h-2 bg-mist rounded-full appearance-none cursor-pointer accent-obsidian"
                            />
                        </div>

                        <div className="space-y-6">
                            <label className="text-xs font-black text-slate uppercase tracking-widest opacity-40">Sleep Quality</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { id: 'poor', icon: '😫', label: '나쁨' },
                                    { id: 'fair', icon: '😑', label: '보통' },
                                    { id: 'good', icon: '🙂', label: '좋음' },
                                    { id: 'great', icon: '🤩', label: '완벽' }
                                ].map((q) => (
                                    <button
                                        key={q.id}
                                        onClick={() => setQuality(q.id)}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${quality === q.id
                                            ? 'border-obsidian bg-obsidian text-mist shadow-lg transform -translate-y-1'
                                            : 'border-line bg-white text-slate hover:border-line-heavy'
                                            }`}
                                    >
                                        <span className="text-xl">{q.icon}</span>
                                        <span className="text-[10px] font-black">{q.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-mist/30 p-6 rounded-3xl border border-line border-dashed">
                            <p className="text-[11px] text-slate font-medium leading-relaxed italic text-center">
                                "이 데이터는 내일 네비게이터의 '회복 예보'에 직접적인 영향을 미쳐 분석 정밀도를 42% 향상시킵니다."
                            </p>
                        </div>

                        <Button
                            className="w-full h-14 rounded-2xl bg-obsidian text-mist font-black shadow-xl"
                            onClick={handleSave}
                        >
                            데이터 동기화 완료
                        </Button>
                    </div>

                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors z-20"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function WaterModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const [intake, setIntake] = useState(1250);
    const goal = 2000;
    const progress = (intake / goal) * 100;

    const handleAdd = (amount: number) => {
        setIntake(prev => Math.min(prev + amount, 4000));
    };

    const getStatusMessage = () => {
        if (progress >= 100) return "오늘의 목표를 달성했습니다! 완벽한 밸런스예요.";
        if (progress >= 70) return "거의 다 왔어요! 조금만 더 보충해볼까요?";
        return "신진대사를 위해 수분이 조금 더 필요해 보입니다.";
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-[40px] shadow-2xl bg-surface">
                <div className="relative">
                    <DialogHeader className="sr-only">
                        <DialogTitle>수분 밸런스 체크</DialogTitle>
                        <DialogDescription>오늘의 수분 섭취량을 기록하고 관리하세요.</DialogDescription>
                    </DialogHeader>

                    {/* Visual Progress Header */}
                    <div className="h-64 bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center relative overflow-hidden p-8">
                        {/* Dynamic Wave Background (Simplified) */}
                        <div
                            className="absolute bottom-0 left-0 w-full bg-white/20 transition-all duration-1000 ease-out"
                            style={{ height: `${progress}%` }}
                        />

                        <div className="relative z-10 flex flex-col items-center text-white">
                            <div className="text-6xl mb-4 animate-bounce">💧</div>
                            <div className="text-5xl font-black tracking-tighter mb-1">{intake} <span className="text-xl opacity-60">ml</span></div>
                            <div className="text-sm font-bold opacity-60 uppercase tracking-widest">Daily Progress {Math.round(progress)}%</div>
                        </div>
                    </div>

                    <div className="p-10 space-y-8">
                        <div className="text-center space-y-2">
                            <p className="text-obsidian font-bold text-lg leading-tight">
                                {getStatusMessage()}
                            </p>
                            <p className="text-sm text-slate font-medium opacity-60">일일 목표: {goal}ml</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-4 bg-mist rounded-full overflow-hidden border border-line">
                            <div
                                className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Controls */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleAdd(250)}
                                className="h-20 rounded-2xl border-2 border-line hover:border-blue-500 bg-white transition-all flex flex-col items-center justify-center gap-1 group"
                            >
                                <span className="text-xl group-hover:scale-120 transition-transform">🥛</span>
                                <span className="text-[10px] font-black uppercase text-slate tracking-widest">Add 250ml</span>
                            </button>
                            <button
                                onClick={() => handleAdd(500)}
                                className="h-20 rounded-2xl border-2 border-line hover:border-blue-500 bg-white transition-all flex flex-col items-center justify-center gap-1 group"
                            >
                                <span className="text-xl group-hover:scale-120 transition-transform">🥤</span>
                                <span className="text-[10px] font-black uppercase text-slate tracking-widest">Add 500ml</span>
                            </button>
                        </div>

                        <Button
                            className="w-full h-14 rounded-2xl bg-obsidian text-mist font-black shadow-xl"
                            onClick={() => onOpenChange(false)}
                        >
                            오늘의 리포트 저장
                        </Button>
                    </div>

                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors z-20"
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
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const steps = [
        { title: 'Neck Reset', icon: '🧘', desc: '목과 승모근의 긴장 데이터를 수평으로 정렬합니다.', time: 15 },
        { title: 'Shoulder Unlock', icon: '🙆', desc: '견갑골 주변의 경직도를 45도 각도로 완화합니다.', time: 20 },
        { title: 'Spine Decompress', icon: '🤸', desc: '척추 사이의 공간을 확보하여 신경 전도율을 최적화합니다.', time: 30 }
    ];

    useEffect(() => {
        if (isPlaying && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsPlaying(false);
            if (step < steps.length - 1) {
                // Next step logic could go here
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
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-[40px] shadow-2xl bg-surface">
                <div className="relative">
                    <DialogHeader className="sr-only">
                        <DialogTitle>오피스 리셋 스트레칭</DialogTitle>
                        <DialogDescription>1분 만에 신체 밸런스를 회복하세요.</DialogDescription>
                    </DialogHeader>

                    <div className="h-64 bg-[#F8F9FA] flex flex-col items-center justify-center relative overflow-hidden p-8 border-b border-line">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-mist/20"></div>

                        <div className="relative z-10 flex flex-col items-center text-obsidian">
                            <div className="w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center text-6xl mb-4 relative">
                                {steps[step].icon}
                                {isPlaying && (
                                    <div className="absolute inset-0 rounded-full border-4 border-obsidian animate-ping opacity-20"></div>
                                )}
                            </div>
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase">{steps[step].title}</h2>
                        </div>
                    </div>

                    <div className="p-10 space-y-10">
                        <div className="text-center space-y-4">
                            <p className="text-slate font-medium leading-relaxed opacity-60 px-4">
                                {steps[step].desc}
                            </p>
                            <div className="text-6xl font-black italic tracking-tighter text-obsidian ordinal">
                                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className="w-20 h-20 rounded-2xl border-2 border-line text-obsidian hover:bg-mist"
                                onClick={togglePlay}
                            >
                                {isPlaying ? <Pause className="w-8 h-8 font-black" /> : <Play className="w-8 h-8 font-black fill-current" />}
                            </Button>
                            <Button
                                className="flex-1 h-20 rounded-2xl bg-obsidian text-mist font-black text-xl shadow-xl flex items-center justify-between px-8 group"
                                onClick={handleNext}
                            >
                                <span>{step === steps.length - 1 ? 'RECOVERY COMPLETED' : 'NEXT PROTOCOL'}</span>
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                            </Button>
                        </div>

                        <div className="flex justify-center gap-2">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-12 bg-obsidian' : 'w-2 bg-line'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute top-4 right-4 w-10 h-10 bg-obsidian/10 backdrop-blur rounded-full flex items-center justify-center text-obsidian hover:bg-obsidian/20 transition-colors z-20"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
