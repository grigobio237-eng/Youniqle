'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Sparkles, ArrowRight, Zap, Package, Calendar, ChevronRight, RefreshCw, ExternalLink, Store, AlertTriangle, Activity, Image as ImageIcon } from 'lucide-react';
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
import { Lock } from 'lucide-react';


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

    const userName = session?.user?.name || '요원';

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
    const [activeTab, setActiveTab] = useState('personalization');
    const [showUpsell, setShowUpsell] = useState(false);

    const userTier = AccessControl.getUserGroup(session?.user);
    const isClinicLocked = userTier === 'RESET' || userTier === 'NONE';

    useEffect(() => {
        setIsMounted(true);
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);

        try {
            // 1. 타임라인 데이터 가져오기 (실제 DB 데이터)
            const timelineRes = await fetch('/api/user/timeline');
            let latestScore = 0;
            if (timelineRes.ok) {
                const timelineData = await timelineRes.json();
                setTimelineItems(timelineData.timeline || []);
                if (timelineData.timeline?.length > 0) {
                    latestScore = timelineData.timeline[0].score || 0;
                }
            }

            // localStorage에서 점수 불러오기 (백업용)
            const scoreVal = latestScore || (localStorage.getItem('recovery_last_score') ? parseInt(localStorage.getItem('recovery_last_score')!) : 40);
            setTodayScore(scoreVal);

            // 목데이터 히스토리 + 실제 오늘 데이터 조합
            const mockHistory = [
                { date: '12/09', score: 65 },
                { date: '12/10', score: 70 },
                { date: '12/11', score: 60 },
                { date: '12/12', score: 75 },
                { date: '12/13', score: 55 },
                { date: '12/14', score: 45 },
                { date: '오늘', score: scoreVal }
            ];
            setScoreHistory(mockHistory);

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
            const tags = CATEGORY_TAG_MAP[weakest] || ['chronic_fatigue'];

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
                {/* 1. Analysis Header */}
                <section className="relative py-16 border-b border-line overflow-hidden">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-5xl mx-auto space-y-12">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                                {/* 왼쪽: 헤더 + 점수 */}
                                <div className="space-y-6 flex-1">
                                    <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black tracking-widest uppercase">
                                        <Sparkles className="w-3 h-3 mr-2" />
                                        Real-time Analysis
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter">{userName} 님의<br />리커버리 네비게이터</h1>

                                    <div className="bg-surface/50 border border-line p-5 md:p-6 rounded-[24px] md:rounded-[32px] flex items-center gap-4 md:gap-6 w-full md:w-auto">
                                        <div className="flex-shrink-0">
                                            <div className="text-[10px] md:text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Recovery Score</div>
                                            <div className="text-4xl md:text-5xl font-black text-primary">{todayScore}</div>
                                        </div>
                                        <div className="text-[10px] md:text-xs font-medium text-text-secondary leading-tight opacity-60">
                                            지난 7일 대비<br />
                                            <span className={`font-bold ${todayScore > 50 ? 'text-status-good' : 'text-status-danger'}`}>
                                                {todayScore > 50 ? '+' : '-'}{Math.abs(todayScore - 50)}% 변화
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 오른쪽: 레이더 차트 */}
                                {isMounted && radarData.length > 0 && (
                                    <div className="w-full md:w-80 h-64 bg-surface/30 rounded-[32px] border border-line p-4">
                                        <DiagnosisRadarChart
                                            data={radarData.map(d => ({
                                                subject: d.category === 'PHYSICAL' ? '신체' :
                                                    d.category === 'MENTAL' ? '멘탈' :
                                                        d.category === 'SLEEP' ? '수면' : '생활',
                                                score: Math.round((d.score / d.fullMark) * 100), // Normalize to 100
                                                fullMark: 100
                                            }))}
                                            color="#0F172A" // Obsidian or use CSS var if supported, let's use a specific dark color for Navigator
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Score Graph */}
                            <div className="h-32 w-full opacity-80">
                                {isMounted && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={scoreHistory}>
                                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1A1D21', borderRadius: '16px', border: '1px solid rgba(233,226,214,0.1)', color: '#E9E2D6' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="score"
                                                stroke="var(--chapter-accent)"
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: 'var(--chapter-accent)', strokeWidth: 0 }}
                                                activeDot={{ r: 6, strokeWidth: 0 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. 유니클 맞춤 분석 리포트 (탭 구조 도입) */}
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto">
                            
                            <Tabs 
                                value={activeTab} 
                                onValueChange={(val) => {
                                    if (val === 'clinic' && isClinicLocked) {
                                        setShowUpsell(true);
                                    } else {
                                        setActiveTab(val);
                                    }
                                }} 
                                className="w-full"
                            >
                                <TabsList className="grid w-full grid-cols-2 h-16 rounded-2xl bg-surface/50 border border-line p-1.5 mb-16">
                                    <TabsTrigger value="personalization" className="rounded-xl text-base md:text-lg font-black data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                                        개인화 분석
                                    </TabsTrigger>
                                    <TabsTrigger value="clinic" className="rounded-xl text-base md:text-lg font-black data-[state=active]:bg-[#0E3A3A] data-[state=active]:text-mist data-[state=active]:shadow-sm">
                                        <div className="flex items-center gap-2">
                                            클리닉 케어
                                            {isClinicLocked && <Lock className="w-4 h-4 opacity-50" />}
                                        </div>
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="personalization" className="space-y-20">
                                    {/* Step 1: 카테고리별 상태 분석 */}
                                    <div className="space-y-8 relative">
                                        <div className="absolute -left-4 md:-left-20 -top-8 md:-top-14 text-5xl md:text-[140px] font-black text-obsidian/[0.02] md:text-obsidian/[0.03] leading-none select-none pointer-events-none">01</div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                                                <Zap className="w-5 h-5 fill-current" />
                                            </div>
                                            <h2 className="text-2xl font-black tracking-tight">{userName} 님을 위한 맞춤 분석 리포트</h2>
                                        </div>
                                        {weakestInfo?.statusInfo ? (
                                    <Card className={`bg-surface border-l-4 ${weakestInfo.level === 'critical' ? 'border-l-status-danger' : 'border-l-primary'} overflow-hidden shadow-xl`}>
                                        <CardContent className="p-8 space-y-6">
                                            <div className="flex items-center gap-3">
                                                <Badge className={`${getLevelBadgeColor(weakestInfo.level)} text-[10px] font-black uppercase tracking-widest px-3 py-1`}>
                                                    {weakestInfo.level === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                                    {weakestInfo.category.toUpperCase()} {weakestInfo.level.toUpperCase()}
                                                </Badge>
                                                <span className="text-sm font-bold text-text-secondary">{weakestInfo.score}/40점</span>
                                            </div>
                                            
                                            <h3 className="text-2xl font-black text-text-primary leading-tight">
                                                {userName} 님, {weakestInfo.statusInfo.message}
                                            </h3>

                                            <p className="text-text-secondary font-medium leading-relaxed opacity-80">
                                                {aiAdvice || '오늘의 분석 결과를 바탕으로 아래 추천 프로토콜을 확인하세요.'}
                                            </p>

                                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                                <Button asChild size="lg" className="h-16 w-full sm:w-auto bg-primary text-background font-black rounded-2xl px-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                                                    <Link href="/diagnosis?type=free">
                                                        24문항 약식 진단 <ArrowRight className="w-5 h-5 ml-2" />
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="outline" size="lg" className="h-16 w-full sm:w-auto rounded-2xl px-8 font-black border-2 border-primary/20 text-primary hover:bg-primary/5">
                                                    <Link href="/diagnosis?type=personality">
                                                        60문항 정밀 진단 <Zap className="w-4 h-4 ml-2 fill-current" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card className="bg-surface border-2 border-dashed border-primary/20 overflow-hidden rounded-[40px]">
                                        <CardContent className="p-12 text-center space-y-8">
                                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-4xl">🧘</div>
                                            <div className="space-y-3">
                                                <h3 className="text-3xl font-black text-text-primary">
                                                    아직 심층 진단을<br />완료하지 않았습니다
                                                </h3>
                                                <p className="text-slate font-medium text-lg opacity-60">
                                                    회복 기질 분석을 통해 나에게 딱 맞는<br />라이프 프로토콜을 제안받으세요.
                                                </p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                                <Button asChild size="lg" className="h-16 bg-primary text-background font-black rounded-2xl px-10">
                                                    <Link href="/diagnosis?type=free">약식 진단 시작 (60초)</Link>
                                                </Button>
                                                <Button asChild variant="outline" size="lg" className="h-16 border-2 border-line rounded-2xl px-10 font-black">
                                                    <Link href="/diagnosis?type=personality">정밀 진단 시작 (60문항)</Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                        )}
                                    </div>

                                    {/* Step 2: 심층 분석 리포트 */}
                            <div className="space-y-8 relative">
                                <div className="absolute -left-4 md:-left-20 -top-4 text-5xl md:text-[140px] font-black text-obsidian/[0.02] md:text-obsidian/[0.03] leading-none select-none pointer-events-none">02</div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight">심층 분석 리포트</h2>
                                </div>

                                <Card className="bg-white border-line rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => router.push('/diagnosis/report')}>
                                    <CardContent className="p-8 flex items-center justify-between gap-6">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-chapter-accent text-mist text-[10px] font-black uppercase tracking-widest">Premium Report</Badge>
                                                {isMounted && <span className="text-xs font-bold text-slate-400">최근 업데이트: {new Date().toLocaleDateString()}</span>}
                                            </div>
                                            <h3 className="text-2xl font-black text-obsidian leading-tight group-hover:text-primary transition-colors">
                                                {userName} 님의 심리 상태를<br />
                                                <span className="text-primary">가장 정밀하게</span> 분석했습니다.
                                            </h3>
                                            <p className="text-sm font-medium text-slate opacity-80 line-clamp-2">
                                                5가지 성격 요인과 30가지 세부 국면을 통해<br />
                                                나조차 몰랐던 내면의 데이터를 확인하세요.
                                            </p>
                                        </div>
                                        <div className="hidden md:flex flex-col items-center justify-center w-24 h-24 bg-mist rounded-2xl group-hover:bg-primary/10 transition-colors">
                                            <div className="text-3xl mb-1">📊</div>
                                            <div className="text-[10px] font-bold text-slate-400 group-hover:text-primary">View Report</div>
                                        </div>
                                    </CardContent>
                                    <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                                </Card>
                            </div>

                                </TabsContent>

                                <TabsContent value="clinic" className="space-y-20 pt-8">
                                    {/* Step 1: 시술 전 전용 회복 설계 (Bridge for High-Intent Users) */}
                                    <div className="space-y-8 relative">
                                <div className="absolute left-0 md:left-4 top-0 md:top-4 text-5xl md:text-[100px] font-black text-slate-900/[0.03] leading-none select-none pointer-events-none italic z-0 uppercase tracking-tighter">Event</div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight">Perfect Recovery Design</h2>
                                </div>

                                <Card className="bg-obsidian border-none rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl relative group">
                                    <div className="absolute top-0 right-0 w-[200px] h-[200px] md:w-[300px] md:h-[300px] bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/30 transition-all duration-700" />
                                    <CardContent className="p-8 md:p-10 relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-10">
                                        <div className="flex-1 space-y-4 md:space-y-6 text-center md:text-left">
                                            <Badge className="bg-primary text-background text-[10px] font-black uppercase tracking-widest px-3 py-1">Medical Event Only</Badge>
                                            <h3 className="text-2xl md:text-4xl font-black text-mist leading-tight tracking-tighter">
                                                시술은 끝났어도<br />
                                                <span className="text-[#00FFD1] drop-shadow-[0_0_15px_rgba(0,255,209,0.3)] italic">회복은 이제 시작</span>입니다.
                                            </h3>
                                            <p className="text-mist/70 text-sm md:text-base font-medium leading-relaxed max-w-md mx-auto md:mx-0">
                                                줄기세포·성형 시술을 앞두고 계신가요? <br />
                                                유니클의 정밀 문진을 통해 당신만의 72시간 집중 회복 프로토콜을 설계하세요.
                                            </p>
                                            <Button asChild size="lg" className="h-14 md:h-16 w-full md:w-auto px-10 rounded-[20px] bg-primary hover:bg-primary/90 text-background text-base md:text-lg font-black shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                                <Link href="/event/consultation">
                                                    심층 문진 시작하기 <ArrowRight className="w-5 h-5 ml-2" />
                                                </Link>
                                            </Button>
                                        </div>
                                        <div className="w-40 h-40 md:w-64 md:h-64 bg-mist/5 rounded-[32px] md:rounded-[40px] flex items-center justify-center text-5xl md:text-6xl relative overflow-hidden border border-mist/10 backdrop-blur-sm">
                                            🧭
                                            <div className="absolute inset-0 border-2 border-primary/20 rounded-[32px] md:rounded-[40px] animate-pulse" />
                                        </div>
                                    </CardContent>
                                    <div className="h-1 w-full bg-primary/30" />
                                </Card>
                            </div>

                                    {/* Step 2: 전문 회복 설계 */}
                                    <div className="space-y-8 relative mb-16">
                                        <div className="absolute -left-4 md:-left-20 -top-4 text-5xl md:text-[140px] font-black text-obsidian/[0.02] md:text-obsidian/[0.03] leading-none select-none pointer-events-none z-0">02</div>
                                        <div className="relative z-10 -mx-6 md:-mx-12">
                                            <ClinicConsultationSection />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            {/* 공통 컴포넌트: 하단에 유지 */}
                            <div className="space-y-20 mt-20 pt-10 border-t border-line/50">
                                {/* Step 3: 내일의 예보 (개인화 분석과 연동되지만 전역으로 표시) */}
                                <div className="space-y-8 relative">
                                    <div className="absolute -left-4 md:-left-20 -top-4 text-5xl md:text-[140px] font-black text-obsidian/[0.02] md:text-obsidian/[0.03] leading-none select-none pointer-events-none">03</div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight">{userName} 님의 내일 예보</h2>
                                </div>

                                <Card className="bg-surface/30 border-dashed border-2 border-line rounded-[32px] hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => setIsForecastOpen(true)}>
                                    <CardContent className="p-10 flex items-center justify-between">
                                        <div className="space-y-2">
                                            <div className="text-xs font-bold text-text-secondary opacity-50 uppercase tracking-widest">Next Schedule</div>
                                            <h4 className="text-xl font-black text-text-primary/70 group-hover:text-primary transition-colors">내일 오전 08:30 분석 업데이트</h4>
                                            <p className="text-sm text-text-secondary font-medium">숙면 데이터를 바탕으로 내일의 회복 전략이 수립됩니다.</p>
                                            <Link href="/utils?tool=sleep" className="inline-block pt-2 text-xs font-black text-primary hover:underline underline-offset-4">
                                                지금 숙면 데이터 입력하기 →
                                            </Link>
                                        </div>
                                        <Button size="icon" variant="outline" className="rounded-full w-12 h-12 border-line text-text-secondary opacity-40 group-hover:opacity-100 group-hover:bg-primary group-hover:text-background transition-all">
                                            <ChevronRight />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                                {/* Step 4: 실시간 리커버리 로그 */}
                                <div className="space-y-8 relative">
                                    <div className="absolute -left-4 md:-left-20 -top-4 text-5xl md:text-[140px] font-black text-obsidian/[0.02] md:text-obsidian/[0.03] leading-none select-none pointer-events-none">04</div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-chapter-accent/20 rounded-full flex items-center justify-center text-chapter-accent">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-2xl font-black tracking-tight">리커버리 타임라인</h2>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href="/timeline" className="text-xs font-bold opacity-60">전체보기</Link>
                                    </Button>
                                </div>

                                {timelineItems.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {timelineItems.slice(0, 3).map((item, idx) => (
                                            <Card key={idx} className="rounded-[24px] overflow-hidden border-line group hover:border-chapter-accent transition-all bg-white">
                                                <div className="aspect-square relative bg-mist">
                                                    {item.imageUrl ? (
                                                        <Image src={item.imageUrl} alt={item.type} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate/20">
                                                            <ImageIcon className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                    <Badge className="absolute top-3 left-3 bg-obsidian text-white text-[8px] font-black px-2">
                                                        {item.type}
                                                    </Badge>
                                                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] font-black text-obsidian shadow-sm">
                                                        SCORE {item.score}
                                                    </div>
                                                </div>
                                                <CardContent className="p-4">
                                                    <p className="text-[11px] font-bold text-slate/60 mb-1">
                                                        {isMounted && new Date(item.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                                    </p>
                                                    <p className="text-xs font-black text-obsidian line-clamp-1 truncate">{item.summary || '상세 데이터 없음'}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center rounded-[32px] bg-mist/30 border-2 border-dashed border-line">
                                        <p className="text-sm font-bold text-slate/40">아직 기록된 타임라인이 없습니다.<br />스캐너나 자세 분석을 시작해 보세요.</p>
                                    </div>
                                )}
                                
                                {journey === 'CLINICAL_POST' && (
                                    <Button asChild className="w-full h-16 rounded-2xl bg-chapter-accent text-white font-black text-lg shadow-xl shadow-chapter-accent/20">
                                        <Link href="/diagnosis/post-op">
                                            <Sparkles className="w-5 h-5 mr-2" /> 전문 사후 케어 기록 남기기
                                        </Link>
                                    </Button>
                                )}
                                <QuickInquirySection reportId="AI_NAVIGATOR_DASHBOARD" />
                            </div>

                                {/* Step 5: 유니클 추천 파트너 상품 */}
                                <div className="space-y-8 relative">
                                    <div className="absolute -left-4 md:-left-20 -top-4 text-5xl md:text-[140px] font-black text-obsidian/[0.02] md:text-obsidian/[0.03] leading-none select-none pointer-events-none">05</div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black tracking-tight">추천 회복 도구</h2>
                                            <p className="text-xs text-slate font-medium mt-1">자사 상품 + 파트너 큐레이션</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => fetchExternalProducts(true)} disabled={productsLoading}>
                                        <RefreshCw className={`w-4 h-4 mr-2 ${productsLoading ? 'animate-spin' : ''}`} />
                                        새로고침
                                    </Button>
                                </div>

                                {productsLoading ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="bg-white rounded-[24px] p-4 border border-line animate-pulse">
                                                <div className="aspect-square bg-mist rounded-xl mb-3" />
                                                <div className="h-4 w-3/4 bg-mist rounded mb-2" />
                                                <div className="h-5 w-1/2 bg-mist rounded" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {externalProducts.map((product) => (
                                            product.isInternal ? (
                                                <Link 
                                                    key={product.id} 
                                                    href={product.link} 
                                                    className="block group"
                                                    onClick={() => trackEvent('recommendation_click', {
                                                        itemId: product.id,
                                                        itemType: 'product',
                                                        metadata: { source: 'internal' }
                                                    })}
                                                >
                                                    <Card className="h-full border-line rounded-[24px] overflow-hidden shadow-sm hover:shadow-lg transition-all bg-white hover:border-primary">

                                                        <div className="aspect-square bg-mist relative overflow-hidden">
                                                            <Badge className="absolute top-3 left-3 bg-primary text-mist text-[9px] font-black z-10">YOUNIQLE</Badge>
                                                            {product.image ? (
                                                                <Image src={product.image} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center"><Package className="w-10 h-10 text-slate/20" /></div>
                                                            )}
                                                        </div>
                                                        <CardContent className="p-4">
                                                            <h3 className="text-sm font-bold text-obsidian line-clamp-2 mb-2 group-hover:text-primary transition-colors">{product.title}</h3>
                                                            <p className="text-lg font-black text-obsidian">{product.priceFormatted}</p>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            ) : (
                                                <div key={product.id} onClick={() => handleExternalClick(product)} className="block group cursor-pointer">
                                                    <Card className="h-full border-line rounded-[24px] overflow-hidden shadow-sm hover:shadow-lg transition-all bg-gradient-to-b from-white to-mist/30 hover:border-[#0E3A3A]/30">
                                                        <div className="aspect-square bg-mist relative overflow-hidden">
                                                            <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                                                                <Badge className="bg-[#0E3A3A] text-mist text-[9px] font-black shadow-md">PARTNER</Badge>
                                                                <ExternalLink className="w-4 h-4 text-white drop-shadow-lg" />
                                                            </div>
                                                            {product.image ? (
                                                                <Image src={product.image} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center"><Store className="w-10 h-10 text-slate/20" /></div>
                                                            )}
                                                        </div>
                                                        <CardContent className="p-4">
                                                            <h3 className="text-sm font-bold text-obsidian line-clamp-2 mb-2 group-hover:text-[#0E3A3A] transition-colors">{product.title}</h3>
                                                            <p className="text-lg font-black text-obsidian">{product.priceFormatted}</p>
                                                            {product.mallName && <p className="text-[10px] text-slate mt-1 truncate">{product.mallName}</p>}
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                )}
                                </div>
                            </div>
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
                                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black tracking-widest uppercase px-2">Prediction</Badge>
                                <div className="text-xs font-bold text-text-secondary opacity-40 uppercase tracking-widest">Energy Level</div>
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
