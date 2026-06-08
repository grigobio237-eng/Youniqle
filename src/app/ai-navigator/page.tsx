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
import { motion, AnimatePresence } from 'framer-motion';

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
import EnvironmentalStatus from '@/components/navigator/EnvironmentalStatus';
import RoutineCard from '@/components/navigator/RoutineCard';
import DailySmallActions from '@/components/navigator/DailySmallActions';
import DailyFlowTimeline from '@/components/navigator/DailyFlowTimeline';
import ToolkitGrid from '@/components/navigator/ToolkitGrid';


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
    const [subActiveTab, setSubActiveTab] = useState<'diagnosis' | 'routine' | 'reflection'>('diagnosis');


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

            // 이전 날짜들 중 데이터가 없는 경우, 유려한 흐름을 위해 오늘 점수 기준 유기적 보간값 제공
            const dynamicHistory = last7Days.map((d, index) => {
                const dateLabel = d.date === today.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) ? '오늘' : d.date;
                const dbScore = timelineMap[d.date];
                if (dbScore !== undefined && dbScore !== null) {
                    return { date: dateLabel, score: Number(dbScore) };
                }
                
                // 이전 데이터가 없는 날은 오늘 점수를 기준으로 점진적인 변동(CGM 시뮬레이션) 적용
                // 인덱스별로 약간의 상승/하락 폭을 주어 유려한 시각적 흐름 연출
                const simulatedFluctuation = Math.sin(index) * 4.5;
                const simScore = Math.min(100, Math.max(0, Math.round(scoreVal + simulatedFluctuation)));
                return {
                    date: dateLabel,
                    score: simScore
                };
            });

            setScoreHistory(dynamicHistory);

            // 2. 리듬체크 기반 추천 API 호출
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

    // 레이더 차트 100점 만점 노멀라이즈 데이터
    const normalizedRadarData = radarData.map(d => ({
        category: d.category,
        score: Math.round(d.score * 2.5),
        fullMark: 100
    }));

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
            <div className="h-screen md:h-auto overflow-hidden md:overflow-visible flex flex-col bg-background text-text-primary relative max-h-screen md:max-h-none select-none pb-[72px] md:pb-20">
                {/* 1. Analysis Header & Weather (compact on mobile) */}
                <header className="h-[52px] md:h-[10vh] px-4 flex items-center justify-between border-b border-line/45 flex-shrink-0 bg-white/80 backdrop-blur-md relative z-20">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#0E3A3A] flex items-center justify-center text-white text-xs font-black shadow-inner">
                            {userName.substring(0, 1)}
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate/40 uppercase tracking-widest">회복 내비게이터</p>
                            <h2 className="text-sm font-black text-obsidian tracking-tight">오늘 리듬체크</h2>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <React.Suspense fallback={<div className="h-6 w-20 bg-mist animate-pulse rounded-full" />}>
                            <EnvironmentalStatus />
                        </React.Suspense>
                    </div>
                </header>

                {/* 2. Mini CGM Trend Area (compact on mobile) */}
                <section className="h-[110px] md:h-[180px] bg-white/40 border-b border-line flex-shrink-0 relative overflow-hidden flex flex-col justify-between p-2 md:p-3">
                    <div className="absolute inset-0 z-0 opacity-40">
                        {scoreHistory && scoreHistory.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={scoreHistory} margin={{ top: 12, right: 5, left: 5, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0D9488" stopOpacity={0.45}/>
                                            <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0.0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis 
                                        dataKey="date" 
                                        tickLine={false} 
                                        axisLine={false} 
                                        tick={{ fill: '#1e293b', fontSize: 9.5, fontWeight: 'black' }} 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="score" 
                                        stroke="#0D9488" 
                                        strokeWidth={2.5} 
                                        fillOpacity={1} 
                                        fill="url(#colorScore)" 
                                        dot={{ r: 3.5, fill: '#FFFFFF', stroke: '#0D9488', strokeWidth: 2 }}
                                        activeDot={{ r: 5, fill: '#0E3A3A', stroke: '#2DD4BF', strokeWidth: 2 }}
                                        connectNulls
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate/40">
                                측정 데이터 수집 중...
                            </div>
                        )}
                    </div>

                    <div className="relative z-10 flex justify-between items-center w-full">
                        <div className="flex gap-2">
                            <div className="bg-white/80 backdrop-blur-sm border border-obsidian/5 px-2.5 py-1 rounded-xl text-center shadow-sm">
                                <p className="text-[7px] font-black text-slate/40 uppercase">오늘 점수</p>
                                <p className="text-xs font-black text-[#0E3A3A]">{todayScore || 0}점</p>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm border border-obsidian/5 px-2.5 py-1 rounded-xl text-center shadow-sm">
                                <p className="text-[7px] font-black text-slate/40 uppercase">회복 자산</p>
                                <p className="text-xs font-black text-primary">{(assetStats?.precisionDiagnosis || 0) + (assetStats?.dailyRhythmLog || 0)}건</p>
                            </div>
                        </div>

                        {tomorrowForecast && (
                            <Button 
                                onClick={() => setIsForecastOpen(true)}
                                className="h-7 px-2.5 bg-[#0E3A3A] hover:bg-[#0E3A3A]/90 text-white text-[9px] font-black rounded-lg flex items-center gap-1 shadow-md shadow-[#0E3A3A]/10 transition-transform active:scale-95"
                            >
                                <Sparkles className="w-2.5 h-2.5 text-[#FFE066]" />
                                <span>내일 예보</span>
                            </Button>
                        )}
                    </div>
                </section>

                {/* 3. Responsive High-Level Tab Bar (Visible on both Desktop and Mobile) */}
                <div className="flex justify-between items-center px-3.5 py-3 md:px-6 md:py-4 bg-white border-b border-line flex-shrink-0">
                    <div className="flex gap-1 md:gap-2 bg-mist/30 p-0.5 md:p-1 rounded-2xl border border-line w-full md:w-auto">
                        <Button 
                            variant={activeTab === 'today-routine' ? 'default' : 'ghost'} 
                            onClick={() => { setActiveTab('today-routine'); setSubActiveTab('diagnosis'); }}
                            className={`flex-1 md:flex-initial rounded-xl h-9 md:h-10 px-2 md:px-5 text-[10px] md:text-xs font-black transition-all ${
                                activeTab === 'today-routine' 
                                    ? 'bg-[#0E3A3A] text-white shadow-md' 
                                    : 'text-slate/60 hover:text-slate'
                            }`}
                        >
                            리듬 데일리 ⚡
                        </Button>
                        <Button 
                            variant={activeTab === 'recovery-toolbox' ? 'default' : 'ghost'} 
                            onClick={() => setActiveTab('recovery-toolbox')}
                            className={`flex-1 md:flex-initial rounded-xl h-9 md:h-10 px-2 md:px-5 text-[10px] md:text-xs font-black transition-all ${
                                activeTab === 'recovery-toolbox' 
                                    ? 'bg-[#0E3A3A] text-white shadow-md' 
                                    : 'text-slate/60 hover:text-slate'
                            }`}
                        >
                            회복 툴박스 🧰
                        </Button>
                        <Button 
                            variant={activeTab === 'clinic' ? 'default' : 'ghost'} 
                            onClick={() => setActiveTab('clinic')}
                            className={`flex-1 md:flex-initial rounded-xl h-9 md:h-10 px-2 md:px-5 text-[10px] md:text-xs font-black transition-all ${
                                activeTab === 'clinic' 
                                    ? 'bg-[#0E3A3A] text-white shadow-md' 
                                    : 'text-slate/60 hover:text-slate'
                            }`}
                        >
                            회복 클리닉 🩺
                        </Button>
                    </div>
                </div>

                {/* 4. Sub-Segment Switcher (Only in Daily Loop) */}
                {activeTab === 'today-routine' && (
                    <div className="px-3.5 py-1.5 md:px-4 md:py-2 bg-mist/20 flex-shrink-0">
                        <div className="flex w-full bg-slate-100 p-0.5 rounded-2xl gap-0.5 border border-line/70">
                            {(['diagnosis', 'routine', 'reflection'] as const).map((tab) => {
                                const isActive = subActiveTab === tab;
                                const labels: Record<typeof tab, string> = {
                                    diagnosis: '리듬체크 🩺',
                                    routine: '오늘의 케어 ⚡',
                                    reflection: '회고 📝'
                                };
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setSubActiveTab(tab)}
                                        className={`flex-1 py-2 text-[10px] md:text-xs font-black rounded-xl transition-all ${
                                            isActive 
                                                ? 'bg-[#0E3A3A] text-white shadow-md' 
                                                : 'text-slate/60 hover:text-slate'
                                        }`}
                                    >
                                        {labels[tab]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 5. Focus Card Container */}
                <div className="flex-1 overflow-hidden flex flex-col bg-white p-3 md:p-6 relative rounded-t-[32px] md:rounded-[32px] shadow-2xl border-t border-line/40 md:border md:border-obsidian/5">
                    {!session ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <Lock className="w-8 h-8" />
                            </div>
                            <h3 className="text-base md:text-xl font-black text-obsidian tracking-tight">로그인이 필요한 서비스입니다</h3>
                            <p className="text-[11px] md:text-sm text-slate opacity-70 max-w-xs">나만의 맞춤형 회복 루틴과 기록을 시작하려면 로그인하세요.</p>
                            <Button asChild className="h-10 md:h-12 px-6 md:px-8 bg-[#0E3A3A] text-white font-black rounded-xl shadow-lg text-[11px] md:text-sm">
                                <Link href="/login">지금 바로 로그인하기</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col overflow-y-auto pr-0.5">
                            {activeTab === 'today-routine' && (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={subActiveTab}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex-1 flex flex-col h-full"
                                    >
                                        {subActiveTab === 'diagnosis' && (
                                            <div className="space-y-1.5 md:space-y-6">
                                                <div className="h-[105px] md:h-44 relative flex items-center justify-center bg-gradient-to-br from-[#0E3A3A]/5 to-[#0E3A3A]/[0.01] border border-[#0E3A3A]/10 rounded-2xl shadow-sm p-1 overflow-hidden">
                                                    {radarData.length > 0 ? (
                                                        <DiagnosisRadarChart data={normalizedRadarData} color="#0E3A3A" className="w-full h-full scale-105" />
                                                    ) : (
                                                        <div className="text-center p-4 space-y-2">
                                                            <span className="text-2xl md:text-3xl">🧘</span>
                                                            <h4 className="text-xs md:text-sm font-black text-obsidian">오늘의 건강을 리듬체크해 보세요</h4>
                                                            <p className="text-[9px] md:text-[10px] text-slate opacity-70">60초 리듬체크로 맞춤 그래프가 열립니다.</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {weakestInfo?.statusInfo ? (
                                                    <div className="bg-[#0E3A3A]/5 border-l-4 border-[#0E3A3A] p-2 md:p-4 rounded-r-lg md:rounded-r-[20px] space-y-0.5 md:space-y-1">
                                                        <Badge className="bg-[#0E3A3A] text-white font-black text-[8px] md:text-[9px] tracking-widest px-1.5 py-0.5 uppercase">
                                                            취약 리듬: {weakestInfo.category.toUpperCase()}
                                                        </Badge>
                                                        <p className="text-[10px] md:text-[11px] font-bold text-obsidian leading-normal md:leading-relaxed">
                                                            {userName} 님, {weakestInfo.statusInfo.message}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="bg-[#0E3A3A]/5 p-2.5 rounded-lg md:rounded-[20px] text-center">
                                                        <p className="text-[10px] md:text-[11px] font-bold text-[#0E3A3A]">모든 회복 리듬이 매우 안정적입니다! ✨</p>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 gap-2 md:gap-3">
                                                    <Button onClick={() => router.push('/diagnosis?type=60s')} className="h-10 md:h-12 bg-gradient-to-br from-emerald-500 to-teal-700 hover:from-emerald-600 hover:to-teal-800 text-white font-black rounded-lg md:rounded-xl flex flex-col justify-center items-center shadow-md shadow-emerald-500/10 hover:scale-[1.02] active:scale-95 transition-all duration-200 border-none">
                                                         <span className="text-[11px] md:text-xs text-white">60초 리듬체크</span>
                                                         <span className="text-[8px] md:text-[9px] text-white/80">바로 시작 ⚡</span>
                                                     </Button>
                                                     <Button onClick={() => router.push('/diagnosis?type=daily')} className="h-10 md:h-12 bg-gradient-to-br from-indigo-500 to-violet-700 hover:from-indigo-600 hover:to-violet-800 text-white font-black rounded-lg md:rounded-xl flex flex-col justify-center items-center shadow-md shadow-indigo-500/10 hover:scale-[1.02] active:scale-95 transition-all duration-200 border-none">
                                                         <span className="text-[11px] md:text-xs text-white">정밀 리듬 측정</span>
                                                         <span className="text-[8px] md:text-[9px] text-white/80">16가지 문항 ⚡</span>
                                                     </Button>
                                                 </div>
                                                 <div className="grid grid-cols-2 gap-2 md:gap-3">
                                                     <Button asChild variant="outline" className="h-8 md:h-9 rounded-md md:rounded-lg text-[9px] md:text-[10px] font-black bg-amber-50/80 border border-primary/30 text-amber-800 hover:bg-primary-container/50 hover:border-primary/30 shadow-sm active:scale-95 transition-all">
                                                         <Link href="/diagnosis?type=free">간단유형 확인</Link>
                                                     </Button>
                                                     <Button onClick={() => isClinicLocked ? setShowUpsell(true) : router.push('/diagnosis?type=personality')} variant="outline" className="h-8 md:h-9 rounded-md md:rounded-lg text-[9px] md:text-[10px] font-black bg-teal-50/80 border border-teal-200 text-teal-800 hover:bg-teal-100 hover:border-teal-300 shadow-sm active:scale-95 transition-all">
                                                         심층유형 확인
                                                     </Button>
                                                 </div>
                                            </div>
                                        )}

                                        {subActiveTab === 'routine' && (
                                            <div className="space-y-3 md:space-y-6 flex-1 flex flex-col">
                                                <React.Suspense fallback={<div className="h-48 w-full bg-mist animate-pulse rounded-2xl" />}>
                                                    <RoutineCard userStatus={categoryScores} initialData={routineData} />
                                                </React.Suspense>
                                                <div className="mt-1 border-t border-line/30 pt-2 hidden md:block">
                                                    <React.Suspense fallback={<div className="h-20 w-full bg-mist animate-pulse rounded-2xl" />}>
                                                        <DailyFlowTimeline />
                                                    </React.Suspense>
                                                </div>
                                            </div>
                                        )}

                                        {subActiveTab === 'reflection' && (
                                            <div className="flex-1 flex flex-col justify-start -mx-2">
                                                <RecoveryNoteSection />
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            )}

                            {activeTab === 'recovery-toolbox' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                                        <h2 className="text-xs md:text-sm font-black tracking-tight text-obsidian">회복 툴박스</h2>
                                    </div>
                                    <React.Suspense fallback={<div className="h-32 bg-mist animate-pulse rounded-2xl" />}>
                                        <ToolkitGrid />
                                    </React.Suspense>
                                    <div className="space-y-4 pt-6 border-t border-line/50">
                                        <h3 className="text-[11px] md:text-xs font-black tracking-tight text-[#0E3A3A]">추천 회복 도구</h3>
                                        <Card className="bg-surface border-2 border-dashed border-primary/10 rounded-2xl">
                                            <CardContent className="p-6 md:p-8 text-center space-y-2">
                                                <h4 className="text-[11px] md:text-xs font-black text-obsidian">유니클 셀렉션 준비 중</h4>
                                                <p className="text-[9px] md:text-[10px] text-slate opacity-60">프리미엄 큐레이션 제품이 곧 공개됩니다.</p>
                                                <Badge variant="outline" className="mt-2 border-primary/20 text-[8px] md:text-[9px] text-primary font-bold px-2 py-0.5">
                                                    공개 예정
                                                </Badge>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'clinic' && (
                                <div className="space-y-4 -mx-2">
                                    <React.Suspense fallback={<div className="h-48 bg-mist animate-pulse rounded-2xl" />}>
                                        <ClinicConsultationSection />
                                    </React.Suspense>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 6. Removed overlapping bottom floating bar in favor of responsive top high-level tab bar */}

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
                            <DialogTitle className="font-black text-obsidian tracking-tighter text-xl md:text-2xl">파트너사 이동</DialogTitle>
                            <DialogDescription className="text-xs md:text-sm text-slate font-medium pt-2 leading-relaxed">
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

                {/* 리듬체크 모달 */}
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
                            <div className="mb-2 text-4xl">🔭</div>
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
                                <span className="font-black text-text-primary tracking-tighter text-xl">{forecast.energyLevel}</span>
                                <span className="font-bold text-text-secondary opacity-40 mb-1.5 text-xl">%</span>
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
