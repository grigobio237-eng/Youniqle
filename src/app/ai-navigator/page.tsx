'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AreaChart, Area, LineChart, Line, XAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Sparkles, ArrowRight, Zap, Package, Calendar, ChevronRight, RefreshCw, ExternalLink, Store, AlertTriangle, Activity, Image as ImageIcon, CheckCircle2, Lock, Download, Share2, Shield, History, Archive } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import { DetailedDiagnosisModal } from '@/components/diagnosis/DetailedDiagnosisModal';
import QuickInquirySection from '@/components/diagnosis/QuickInquirySection';
import ClinicConsultationSection from '@/components/home/ClinicConsultationSection';
import { DeepDiagnosisModal } from '@/components/diagnosis/DeepDiagnosisModal';
import { DiagnosisRadarChart } from '@/components/charts/DiagnosisRadarChart';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useRecovery } from '@/contexts/RecoveryContext';
import { AccessControl } from '@/lib/logic/access-control';
import MembershipUpsellDialog from '@/components/auth/MembershipUpsellDialog';
import RecoveryNoteSection from '@/components/dashboard/RecoveryNoteSection';

// 카테고리별 상태 메시지
const CATEGORY_STATUS_MESSAGES: Record<string, Record<string, { message: string; action: string; actionLink: string }>> = {
    critical: {
        physical: { message: '신체 피로가 심각한 수준입니다. 즉각적인 휴식이 필요합니다.', action: '긴급 스트레칭', actionLink: '/utils?tool=stretch' },
        mental: { message: '정신적 스트레스가 한계에 도달했습니다.', action: '긴급 상담', actionLink: '/ai-advice' },
        sleep: { message: '수면 부족이 건강을 위협하고 있습니다.', action: '수면 환경 체크', actionLink: '/utils?tool=sleep' },
        lifestyle: { message: '생활 패턴의 전면적인 재정립이 필요합니다.', action: '수분 밸런스 체크', actionLink: '/utils?tool=water' }
    },
    low: {
        physical: { message: '신체 피로가 누적되고 있습니다.', action: '오피스 스트레칭', actionLink: '/utils?tool=stretch' },
        mental: { message: '스트레스 관리가 필요한 상태입니다.', action: '호흡법 가이드', actionLink: '/utils/breathing' },
        sleep: { message: '수면 패턴 개선이 필요합니다.', action: '수면 루틴 설계', actionLink: '/utils?tool=sleep' },
        lifestyle: { message: '생활 습관을 점검해 보세요.', action: '생활 밸런스 점검', actionLink: '/utils' }
    },
    mid: {
        physical: { message: '신체 상태는 양호하지만 관리가 필요합니다.', action: '회복의 궤적', actionLink: '/dashboard' },
        mental: { message: '정서적으로 안정적인 편입니다.', action: '정서의 심해', actionLink: '/dashboard' },
        sleep: { message: '수면 품질은 괜찮은 편입니다.', action: '수면의 리듬', actionLink: '/dashboard' },
        lifestyle: { message: '생활 패턴이 비교적 규칙적입니다.', action: '일상의 온기', actionLink: '/dashboard' }
    },
    high: {
        physical: { message: '신체 상태가 매우 좋습니다!', action: '최상의 활력', actionLink: '/dashboard' },
        mental: { message: '멘탈이 매우 건강합니다!', action: '내면의 확장', actionLink: '/dashboard' },
        sleep: { message: '수면 품질이 우수합니다!', action: '고요의 깊이', actionLink: '/dashboard' },
        lifestyle: { message: '생활 습관이 이상적입니다!', action: '삶의 조화', actionLink: '/dashboard' }
    }
};

// 점수 레벨 계산
const getScoreLevel = (score: number, maxScore: number = 40): string => {
    const percentage = (score / maxScore) * 100;
    if (percentage < 25) return 'critical';
    if (percentage < 50) return 'low';
    if (percentage < 75) return 'mid';
    return 'high';
};

// 태그 매핑
const CATEGORY_TAG_MAP: Record<string, string[]> = {
    physical: ['chronic_fatigue', 'muscle_pain'],
    mental: ['mental_care', 'stress'],
    sleep: ['sleep_lack'],
    lifestyle: ['stress', 'chronic_fatigue']
};

// New Components
const EnvironmentalStatus = React.lazy(() => import('@/components/navigator/EnvironmentalStatus'));
const RoutineCard = React.lazy(() => import('@/components/navigator/RoutineCard'));
const DailySmallActions = React.lazy(() => import('@/components/navigator/DailySmallActions'));
const DailyFlowTimeline = React.lazy(() => import('@/components/navigator/DailyFlowTimeline'));
const ToolkitGrid = React.lazy(() => import('@/components/navigator/ToolkitGrid'));

export default function AiNavigatorPage() {
    const { data: session } = useSession();
    const { trackEvent } = useActivityTracker();
    const { journey } = useRecovery();
    const router = useRouter();

    const [scoreHistory, setScoreHistory] = useState<any[]>([]);
    const [todayScore, setTodayScore] = useState(0);
    const [categoryScores, setCategoryScores] = useState<any>(null);
    const [weakestCategory, setWeakestCategory] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [aiAdvice, setAiAdvice] = useState<string>('');
    const [tomorrowForecast, setTomorrowForecast] = useState<any>(null);
    const [isForecastOpen, setIsForecastOpen] = useState(false);
    const [assetStats, setAssetStats] = useState<any>(null);

    const userName = session?.user?.name || '유저';

    // 외부 상품 관련 상태
    const [externalProducts, setExternalProducts] = useState<any[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [bridgeDialogOpen, setBridgeDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [diagnosisModalOpen, setDiagnosisModalOpen] = useState(false);
    const [diagnosisModalStep, setDiagnosisModalStep] = useState<'intro' | 'result'>('intro');
    const [deepDiagnosisModalOpen, setDeepDiagnosisModalOpen] = useState(false);

    const [protocols, setProtocols] = useState<any[]>([]);
    const [timelineItems, setTimelineItems] = useState<any[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [showUpsell, setShowUpsell] = useState(false);
    const [activeTab, setActiveTab] = useState('today-routine');
    const [routineData, setRoutineData] = useState<any>(null);
    const [dailyMissions, setDailyMissions] = useState<any>(null);


    const userTier = AccessControl.getUserGroup(session?.user);
    const isClinicLocked = userTier === 'RESET' || userTier === 'NONE';

    const fetchedRef = React.useRef(false);

    useEffect(() => {
        setIsMounted(true);
        if (!fetchedRef.current) {
            fetchedRef.current = true;
            fetchData();
        }
    }, []);

    const fetchData = async () => {
        setLoading(true);

        try {
            // 1. 타임라인 및 상태 데이터 가져오기 (실제 DB 데이터)
            const [timelineRes, statusRes] = await Promise.all([
                fetch('/api/user/timeline'),
                fetch('/api/user/status?minimal=true')
            ]);

            let latestScore = 0;
            let timelineData: any = { timeline: [] };
            if (timelineRes.ok) {
                timelineData = await timelineRes.json();
                setTimelineItems(timelineData.timeline || []);
                if (timelineData.timeline?.length > 0) {
                    latestScore = timelineData.timeline[0].score || 0;
                }
            }

            if (statusRes.ok) {
                const statusData = await statusRes.json();
                setAssetStats(statusData.assetStats);
            }

            // localStorage에서 점수 불러오기 (백업용)
            const scoreVal = latestScore || (localStorage.getItem('recovery_last_score') ? parseInt(localStorage.getItem('recovery_last_score')!) : 40);
            setTodayScore(scoreVal);

            // DB 타임라인 데이터를 7일 그래프용으로 변환 (최근 7일 빈 날짜는 보간됨)
            const today = new Date();
            const last7Days = Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(today.getDate() - (6 - i));
                return {
                    date: d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
                    fullDate: d.toISOString().split('T')[0]
                };
            });

            const timelineMap = (timelineData.timeline || []).reduce((acc: any, item: any) => {
                const d = new Date(item.createdAt);
                const dateKey = d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
                if (!acc[dateKey] || item.score > acc[dateKey]) {
                    acc[dateKey] = item.score; // 같은 날짜면 가장 높은 점수 유지
                }
                return acc;
            }, {});

            const dynamicHistory = last7Days.map(d => ({
                date: d.date === today.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) ? '오늘' : d.date,
                score: timelineMap[d.date] || null // 데이터가 없으면 null 반환하여 곡선 보간(connectNulls) 활용
            }));
            
            // 오늘 데이터가 null이면 현재 scoreVal를 넣어줌 (최소한의 연결점)
            if (dynamicHistory[6].score === null) {
                 dynamicHistory[6].score = scoreVal;
            }

            setScoreHistory(dynamicHistory);

            // 2. 진단 기반 추천 API 호출
            const diagResponse = await fetch('/api/recommendations/diagnosis?limit=4&protocols=true&content=true');
            if (diagResponse.ok) {
                const diagData = await diagResponse.json();
                setProtocols(diagData.recommendations || []);

                if (diagData.metadata?.categoryScores) {
                    setCategoryScores(diagData.metadata.categoryScores);
                }
                if (diagData.metadata?.weakestCategory) {
                    setWeakestCategory(diagData.metadata.weakestCategory);
                }
            }

            // 3. AI 조언 API 호출
            const adviceResponse = await fetch('/api/ai/navigator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scores: { q1: 80, q2: 70, q3: 90, q4: 85, q5: scoreVal },
                    yesterdayScore: 85
                })
            });

            if (adviceResponse.ok) {
                const adviceData = await adviceResponse.json();
                setAiAdvice(adviceData.comment);
                setTomorrowForecast(adviceData.tomorrowForecast);
            }

            // 4. 루틴 통합 가져오기
            const [morningRoutineRes, dailyRoutineRes] = await Promise.all([
                fetch('/api/ai/routine', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ timeSlot: '오전 루틴', userStatus: { score: scoreVal } })
                }),
                fetch('/api/ai/routine', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ timeSlot: 'DAILY', userStatus: { score: scoreVal } })
                })
            ]);

            if (morningRoutineRes.ok) setRoutineData(await morningRoutineRes.json());
            if (dailyRoutineRes.ok) setDailyMissions(await dailyRoutineRes.json());

            await fetchExternalProducts();

        } catch (e) {
            console.error("AI Navigator Fetch Error", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchExternalProducts = async (shuffle: boolean = false) => {
        setProductsLoading(true);
        try {
            const weakest = weakestCategory?.category || 'physical';
            const tags = CATEGORY_TAG_MAP[weakest] || ['chronic_fatigue', 'muscle_pain'];

            const params = new URLSearchParams({
                tags: tags.join(','),
                limit: '4',
                includeInternal: 'true'
            });

            // 셔플 파라미터 추가 (새로고침 시)
            if (shuffle) {
                params.append('shuffle', 'true');
            }

            const response = await fetch(`/api/recommendations/external?${params}`);
            if (response.ok) {
                const data = await response.json();
                const allProducts = [
                    ...(data.internalProducts || []),
                    ...(data.externalProducts || [])
                ].slice(0, 4);
                setExternalProducts(allProducts);
            }
        } catch (e) {
            console.error('External products fetch error:', e);
        } finally {
            setProductsLoading(false);
        }
    };

    const handleExternalClick = (product: any) => {
        trackEvent('recommendation_click', {
            itemId: product.id,
            itemType: 'product',
            metadata: { source: 'external', mall: product.mallName }
        });
        if (product.isExternal) {
            setSelectedProduct(product);
            setBridgeDialogOpen(true);
        }
    };


    const handleConfirmNavigation = () => {
        if (selectedProduct?.link) {
            window.open(selectedProduct.link, '_blank', 'noopener,noreferrer');
        }
        setBridgeDialogOpen(false);
        setSelectedProduct(null);
    };

    // 레이더 차트 데이터
    const radarData = categoryScores ? [
        { category: 'PHYSICAL', score: categoryScores.physical || 0, fullMark: 40 },
        { category: 'MENTAL', score: categoryScores.mental || 0, fullMark: 40 },
        { category: 'SLEEP', score: categoryScores.sleep || 0, fullMark: 40 },
        { category: 'LIFESTYLE', score: categoryScores.lifestyle || 0, fullMark: 40 }
    ] : [];

    // 가장 낮은 카테고리 정보
    const weakestInfo = weakestCategory ? {
        ...weakestCategory,
        statusInfo: CATEGORY_STATUS_MESSAGES[weakestCategory.level]?.[weakestCategory.category] || null
    } : null;

    const getLevelBadgeColor = (level: string) => {
        switch (level) {
            case 'critical': return 'bg-status-danger text-white';
            case 'low': return 'bg-status-amber text-obsidian';
            case 'mid': return 'bg-status-normal text-white';
            case 'high': return 'bg-status-good text-white';
            default: return 'bg-slate text-white';
        }
    };

    return (
        <ChapterWrapper chapter="ai-navigator">
            <div className="min-h-screen bg-background text-text-primary pb-20">
                {/* 1. Analysis Header & Asset Dashboard */}
                <section className="relative pt-12 pb-8 border-b border-line overflow-hidden">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-5xl mx-auto">
                            {!session && (
                                <div className="mb-10 p-8 bg-primary/5 border-2 border-primary/20 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in slide-in-from-top-6 duration-700 shadow-2xl shadow-primary/5">
                                    <div className="flex items-center gap-6 text-left">
                                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                                            <Lock className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-obsidian tracking-tight">로그인이 필요한 서비스입니다</h3>
                                            <p className="text-base font-medium text-slate opacity-70">나만의 맞춤형 회복 루틴과 기록을 확인하려면 로그인하세요.</p>
                                        </div>
                                    </div>
                                    <Button asChild className="h-14 px-10 bg-primary text-background font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                                        <Link href="/login">지금 바로 로그인하기</Link>
                                    </Button>
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-8">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black tracking-widest uppercase border border-primary/20">
                                        유니클 회복 내비게이터
                                    </div>
                                    <h1 className="text-5xl md:text-7xl font-black text-obsidian tracking-tighter">오늘 리듬체크</h1>
                                    <React.Suspense fallback={<div className="h-10 w-40 bg-mist animate-pulse rounded-full" />}>
                                        <EnvironmentalStatus />
                                    </React.Suspense>
                                </div>
                                
                                {/* Real-time Asset Summary Dashboard */}
                                <div className="w-full md:w-auto bg-white rounded-[32px] p-5 border border-obsidian/5 shadow-xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate/40 uppercase tracking-tighter mb-1">총 회복 자산</p>
                                            <div className="flex items-end gap-1">
                                                <span className="text-3xl font-black text-obsidian">{(assetStats?.precisionDiagnosis || 0) + (assetStats?.dailyRhythmLog || 0)}</span>
                                                <span className="text-[10px] font-bold text-slate/40 mb-1.5">건</span>
                                            </div>
                                        </div>
                                        <div className="w-px h-10 bg-line/50" />
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate/40 uppercase tracking-tighter mb-1">회복 포인트</p>
                                            <div className="flex items-end gap-1">
                                                <span className="text-3xl font-black text-primary">{assetStats?.totalInsights || 0}</span>
                                                <span className="text-[10px] font-bold text-primary/40 mb-1.5">점</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
 
                {/* 2. Main Tabbed Interface */}
                <section className="py-8">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto">
                            
                            <Tabs 
                                value={activeTab} 
                                onValueChange={setActiveTab} 
                                className="w-full"
                            >
                                <TabsList className="grid w-full grid-cols-4 h-14 rounded-2xl bg-surface/50 border border-line p-1 mb-10 sticky top-4 z-50 backdrop-blur-md">
                                    <TabsTrigger value="today-routine" className="rounded-xl text-xs md:text-sm font-black data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                                        오늘의 루틴
                                    </TabsTrigger>
                                    <TabsTrigger value="today-record" className="rounded-xl text-xs md:text-sm font-black data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                                        오늘의 기록
                                    </TabsTrigger>
                                    <TabsTrigger value="recovery-toolbox" className="rounded-xl text-xs md:text-sm font-black data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                                        회복 툴박스
                                    </TabsTrigger>
                                    <TabsTrigger value="clinic" className="rounded-xl text-xs md:text-sm font-black data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                                        회복 클리닉
                                    </TabsTrigger>
                                </TabsList>
 
                                {/* TAB 1: 오늘의 루틴 */}
                                <TabsContent value="today-routine" className="space-y-10 outline-none">
                                    <div className="space-y-12">
                                        {/* 섹션 1: 시간대별 회복 루틴 */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-xl font-black tracking-tight text-obsidian flex items-center gap-2">
                                                    <Sparkles className="w-5 h-5 text-primary fill-current" />
                                                    지금 바로 회복하세요
                                                </h2>
                                                <Badge variant="outline" className="text-[10px] font-black border-primary/30 text-primary">유니클 최적화</Badge>
                                            </div>
                                            
                                            <React.Suspense fallback={<div className="h-96 w-full bg-mist animate-pulse rounded-[2rem]" />}>
                                                <RoutineCard userStatus={categoryScores} initialData={routineData} />
                                            </React.Suspense>
                                        </div>
 
                                        {/* 섹션 2: 오늘 하루의 회복 미션 */}
                                        <div>
                                            <React.Suspense fallback={<div className="h-48 w-full bg-mist animate-pulse rounded-3xl" />}>
                                                <DailySmallActions 
                                                    score={
                                                        categoryScores && Object.values(categoryScores).length > 0 
                                                            ? Math.round((Object.values(categoryScores) as number[]).reduce((a: number, b: number) => a + b, 0) / Object.values(categoryScores).length)
                                                            : 50
                                                    } 
                                                    initialData={dailyMissions}
                                                />
                                            </React.Suspense>
                                        </div>

                                        {/* 섹션 3: 데일리 회복 타임라인 */}
                                        <div>
                                            <React.Suspense fallback={<div className="h-32 w-full bg-mist animate-pulse rounded-3xl" />}>
                                                <DailyFlowTimeline />
                                            </React.Suspense>
                                        </div>

                                        {/* 섹션 4: 오늘의 마음 기록 (대시보드 통합 버전) */}
                                        <div className="-mx-4 md:-mx-8">
                                            <RecoveryNoteSection />
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* TAB 2: 오늘의 기록 */}
                                <TabsContent value="today-record" className="space-y-12 outline-none pt-4">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                                                <Zap className="w-5 h-5 fill-current" />
                                            </div>
                                            <h2 className="text-xl font-black tracking-tight">유형 확인 및 정밀 기록</h2>
                                        </div>

                                        {weakestInfo?.statusInfo ? (
                                            <Card className={`bg-surface border-l-4 ${weakestInfo.level === 'critical' ? 'border-l-status-danger' : 'border-l-primary'} overflow-hidden shadow-xl`}>
                                                <CardContent className="p-8 space-y-6">
                                                    <Badge className={`${getLevelBadgeColor(weakestInfo.level)} text-[10px] font-black uppercase tracking-widest px-3 py-1`}>
                                                        {weakestInfo.level === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                                        {weakestInfo.category.toUpperCase()} {weakestInfo.level.toUpperCase()}
                                                    </Badge>
                                                    <h3 className="text-2xl font-black text-text-primary leading-tight">
                                                        {userName} 님, {weakestInfo.statusInfo.message}
                                                    </h3>
                                                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                                        <Button asChild size="lg" className="h-16 w-full sm:w-auto bg-primary text-background font-black rounded-2xl px-8 shadow-lg shadow-primary/20 transition-transform hover:scale-105">
                                                            <Link href="/diagnosis?type=free">간단유형 확인하기 (단순)</Link>
                                                        </Button>
                                                        <Button onClick={() => isClinicLocked ? setShowUpsell(true) : router.push('/diagnosis?type=personality')} variant="outline" size="lg" className="h-16 w-full sm:w-auto rounded-2xl px-8 font-black border-2 border-primary/20 text-primary">
                                                            심층유형 확인하기 (정밀)
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            <Card className="bg-surface border-2 border-dashed border-primary/20 rounded-[32px]">
                                                <CardContent className="p-10 text-center space-y-6">
                                                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-3xl">🧘</div>
                                                    <h3 className="text-2xl font-black text-text-primary">심층 진단이 필요합니다</h3>
                                                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                                                        <Button asChild className="h-12 bg-primary text-background font-black rounded-xl px-6">
                                                            <Link href="/diagnosis?type=free">간단유형 확인하기 (단순)</Link>
                                                        </Button>
                                                        <Button onClick={() => isClinicLocked ? setShowUpsell(true) : router.push('/diagnosis?type=personality')} variant="outline" className="h-12 border-2 border-line rounded-xl px-6 font-black">
                                                            심층유형 확인하기 (정밀)
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        <Card className="bg-white border-primary/10 rounded-[32px] overflow-hidden shadow-xl hover:shadow-primary/5 cursor-pointer group transition-all" onClick={() => router.push('/?action=diagnose')}>
                                            <CardContent className="p-8 flex items-center justify-between gap-6">
                                                <div className="flex-1 space-y-3">
                                                    <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">1일 루틴</Badge>
                                                    <h3 className="text-2xl font-black text-obsidian group-hover:text-primary transition-colors">60초 리듬체크</h3>
                                                    <p className="text-sm font-medium text-slate opacity-80">사진 한 장으로 시작하는 일상의 회복 기록</p>
                                                </div>
                                                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">📸</div>
                                            </CardContent>
                                        </Card>
                                        
                                        <Card className="bg-surface border-2 border-reward-gold/20 rounded-[32px] overflow-hidden cursor-pointer hover:border-reward-gold/50 transition-all shadow-xl shadow-reward-gold/5" onClick={() => router.push('/diagnosis?type=daily')}>
                                            <CardContent className="p-8 flex items-center justify-between gap-6">
                                                <div className="flex-1 space-y-3">
                                                    <Badge className="bg-reward-gold/20 text-obsidian border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">정밀 리듬 측정</Badge>
                                                    <h3 className="text-2xl font-black text-obsidian">오늘의 회복 리듬 측정</h3>
                                                    <p className="text-sm font-medium text-slate opacity-70">16가지 정밀 질문으로 분석하는 오늘의 에너지</p>
                                                </div>
                                                <div className="w-16 h-16 bg-reward-gold rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-lg shadow-reward-gold/20">
                                                    ⚡
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                {/* TAB 3: 회복 툴박스 */}
                                <TabsContent value="recovery-toolbox" className="space-y-12 outline-none pt-4">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <h2 className="text-xl font-black tracking-tight">회복 툴박스</h2>
                                        </div>
                                        <React.Suspense fallback={<div className="grid grid-cols-2 gap-4"><div className="h-32 bg-mist animate-pulse rounded-3xl" /></div>}>
                                            <ToolkitGrid />
                                        </React.Suspense>
                                    </div>
                                    <div className="space-y-8 pt-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                                                    <Store className="w-5 h-5" />
                                                </div>
                                                <h2 className="text-xl font-black tracking-tight">추천 회복 도구</h2>
                                            </div>
                                        </div>
                                        
                                        <Card className="bg-surface border-2 border-dashed border-primary/10 rounded-[32px] overflow-hidden">
                                            <CardContent className="p-12 text-center space-y-4">
                                                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-2">
                                                    <Package className="w-10 h-10 text-primary/30" />
                                                </div>
                                                <h3 className="text-2xl font-black text-obsidian tracking-tighter">유니클 셀렉션 준비 중</h3>
                                                <p className="text-sm font-medium text-slate/60 leading-relaxed max-w-sm mx-auto">
                                                    당신의 완벽한 회복 리듬을 완성할 유니클만의 프리미엄 큐레이션 제품들이 곧 공개됩니다.
                                                </p>
                                                <Badge variant="outline" className="mt-4 border-primary/20 text-primary font-bold px-4 py-1">
                                                    공개 예정
                                                </Badge>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                {/* TAB 4: 회복 클리닉 */}
                                <TabsContent value="clinic" className="space-y-12 outline-none pt-4">
                                    <div className="space-y-8 relative mb-16">
                                        <div className="absolute -left-4 md:-left-20 -top-4 text-5xl md:text-[140px] font-black text-obsidian/[0.02] md:text-obsidian/[0.03] leading-none select-none pointer-events-none z-0">CLI</div>
                                        <div className="relative z-10 -mx-6 md:-mx-12">
                                            <ClinicConsultationSection />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </section>

                {/* Forecast Modal */}
                <ForecastModal
                    open={isForecastOpen}
                    onOpenChange={setIsForecastOpen}
                    forecast={tomorrowForecast}
                    userName={userName}
                />

                {/* 브릿지 팝업 */}
                <Dialog open={bridgeDialogOpen} onOpenChange={setBridgeDialogOpen}>
                    <DialogContent className="sm:max-w-md rounded-[32px] p-8">
                        <DialogHeader className="text-center">
                            <div className="w-16 h-16 bg-[#0E3A3A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ExternalLink className="w-8 h-8 text-[#0E3A3A]" />
                            </div>
                            <DialogTitle className="text-xl font-black text-obsidian">파트너사 페이지로 이동</DialogTitle>
                            <DialogDescription className="text-slate font-medium pt-2 leading-relaxed">
                                Youniqle이 추천하는 회복 파트너사 페이지로 이동합니다.
                             </DialogDescription>
                        </DialogHeader>

                        {selectedProduct && (
                            <div className="bg-mist/50 rounded-2xl p-4 my-4">
                                <div className="flex gap-4">
                                    {selectedProduct.image && (
                                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white">
                                            <Image src={selectedProduct.image} alt={selectedProduct.title} width={64} height={64} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-obsidian text-sm line-clamp-2">{selectedProduct.title}</p>
                                        <p className="text-lg font-black text-primary mt-1">{selectedProduct.priceFormatted}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="flex-col gap-3 sm:flex-col">
                            <Button onClick={handleConfirmNavigation} className="w-full h-14 rounded-2xl bg-[#0E3A3A] hover:bg-[#0E3A3A]/90 text-mist font-black">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                파트너사로 이동하기
                            </Button>
                            <Button variant="ghost" onClick={() => setBridgeDialogOpen(false)} className="w-full h-12 rounded-2xl text-slate font-bold">
                                취소
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* 진단 모달 */}
                <DetailedDiagnosisModal
                    open={diagnosisModalOpen}
                    onOpenChange={setDiagnosisModalOpen}
                    initialStep={diagnosisModalStep}
                    onUnlockPaid={() => {
                        setDiagnosisModalOpen(false);
                        setDeepDiagnosisModalOpen(true);
                    }}
                />

                <DeepDiagnosisModal
                    open={deepDiagnosisModalOpen}
                    onOpenChange={setDeepDiagnosisModalOpen}
                />

                <MembershipUpsellDialog 
                    open={showUpsell} 
                    onOpenChange={setShowUpsell} 
                    title="클리닉 케어는 리본 등급 이상 전용입니다"
                    description="전문적인 회복 설계와 클리닉 연계 서비스를 이용하시려면 멤버십을 업그레이드하세요."
                />
            </div>
        </ChapterWrapper>
    );
}

function ForecastModal({ open, onOpenChange, forecast, userName }: { open: boolean, onOpenChange: (open: boolean) => void, forecast: any, userName: string }) {
    if (!forecast) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-[40px] shadow-2xl bg-surface">
                <div className="relative">
                    <DialogHeader className="sr-only">
                        <DialogTitle>내일의 회복 예보</DialogTitle>
                        <DialogDescription>분석한 {userName} 님의 내일 컨디션입니다.</DialogDescription>
                    </DialogHeader>

                    <div className="h-48 bg-gradient-to-br from-obsidian to-primary/20 flex flex-col items-center justify-center relative overflow-hidden p-8">
                        <div className="absolute inset-0 opacity-10">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <circle cx="50" cy="50" r="40" fill="white" />
                            </svg>
                        </div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="text-4xl mb-2">🔭</div>
                            <h2 className="text-2xl font-black text-primary tracking-tighter uppercase">{forecast.status}</h2>
                        </div>
                    </div>

                    <div className="p-10 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black tracking-widest uppercase px-2">회복 예측</Badge>
                                <div className="text-xs font-bold text-text-secondary opacity-40 uppercase tracking-widest">내일의 에너지 레벨</div>
                            </div>

                            <div className="flex items-end gap-3">
                                <span className="text-5xl font-black text-text-primary tracking-tighter">{forecast.energyLevel}</span>
                                <span className="text-xl font-bold text-text-secondary opacity-40 mb-1.5">%</span>
                            </div>

                            <div className="h-2 bg-line rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-1000 ease-out energy-bar" />
                                <style jsx>{`
                                    .energy-bar {
                                        width: ${forecast.energyLevel}%;
                                    }
                                `}</style>
                            </div>
                        </div>

                        <div className="bg-background/50 border border-line p-6 rounded-[24px]">
                            <p className="text-text-primary font-medium leading-relaxed opacity-80 italic">
                                "{forecast.description}"
                            </p>
                        </div>

                        <Button
                            className="w-full h-14 rounded-2xl bg-obsidian text-mist font-black shadow-xl"
                            onClick={() => onOpenChange(false)}
                        >
                            확인 완료
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
