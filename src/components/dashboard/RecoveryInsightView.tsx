'use client';

import React from 'react';
import WeeklyReportView from './WeeklyReportView';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Lock, Brain, PieChart, BarChart3 } from 'lucide-react';
import ActionableInsightCard from './ActionableInsightCard';
import MealNutrientChart from './MealNutrientChart';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GuardianNudgeCard from './GuardianNudgeCard';

interface RecoveryInsightViewProps {
    unifiedData: any;
}

export default function RecoveryInsightView({ unifiedData }: RecoveryInsightViewProps) {
    const { user, insights, score, assetStats } = unifiedData;
    const [recommendedProducts, setRecommendedProducts] = React.useState<any[]>([]);
    const [weeklyReport, setWeeklyReport] = React.useState<any>(null);
    const userTier = user?.grade?.toUpperCase() || 'NONE';
    const userRole = user?.role || 'member';
    const isAdmin = ['admin', 'superadmin'].includes(userRole);
    const isPremium = isAdmin || ['RESTART', 'BLACK'].includes(userTier);
    const displayScore = score?.totalScore || 0;
    const isGuardian = user?.footballRole === 'guardian';

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="text-center space-y-2">
                <Badge className="bg-primary text-obsidian border-none text-[10px] font-black px-3 py-1 uppercase tracking-widest">Precision Intelligence</Badge>
                <h2 className="text-3xl font-black text-obsidian tracking-tight italic">전문 데이터 분석</h2>
                <p className="text-slate text-sm font-medium">유니클이 분석한 당신의 회복 패턴과 최적화 솔루션입니다.</p>
            </div>

            {/* AI Manager Summary Section */}
            <section>
                <Card className="bg-white border border-line rounded-[32px] overflow-hidden shadow-xl shadow-obsidian/5 hover:shadow-2xl transition-all">
                    <CardContent className="p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                        <div className="w-20 h-20 md:w-28 md:h-28 bg-mist rounded-[24px] flex items-center justify-center shadow-inner shrink-0 overflow-hidden border border-line/50">
                            <img 
                                src="/images/characters/char_dday.png" 
                                alt="Youniqle Manager" 
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <h3 className="font-black text-2xl text-obsidian tracking-tight flex items-center gap-2">
                                    <Brain className="w-6 h-6 text-primary" />
                                    유니클 매니저 통합 코멘트
                                </h3>
                                <Badge className="bg-obsidian text-mist border-none text-[10px] font-black tracking-widest uppercase px-3 py-1">
                                    {isPremium ? 'Expert Analysis' : 'Standard Analysis'}
                                </Badge>
                            </div>
                            <p className="text-lg text-obsidian font-bold leading-relaxed italic">
                                {weeklyReport?.summary ? (
                                    `"${weeklyReport.summary}"`
                                ) : isPremium ? (
                                    `"${displayScore >= 70 
                                        ? '현재 회복 흐름이 매우 우수합니다. 수면 데이터 분석 결과, 깊은 수면 단계 진입이 빨라지고 있습니다. 이 리듬을 유지한다면 다음 주에는 신체적 가동 범위가 15% 이상 개선될 것으로 예측됩니다.' 
                                        : '회복 지수가 불안정한 흐름을 보이고 있습니다. 어제 기록된 높은 피로도는 수면 전 블루라이트 노출과 연관이 있을 수 있습니다. 오늘부터 수면 전 30분 디지털 디톡스를 권장합니다.'}"` 
                                ) : (
                                    `"${displayScore >= 70 
                                        ? '전반적으로 양호한 상태입니다. 꾸준한 기록이 좋은 성과를 내고 있습니다.' 
                                        : '신체적 피로도가 감지되었습니다. 충분한 휴식과 수분 섭취가 필요합니다.'}"` 
                                )}
                            </p>
                            {!isPremium && (
                                <p className="text-[10px] text-slate/40 font-bold flex items-center justify-center md:justify-start gap-1">
                                    <Lock className="w-3 h-3 opacity-50" />
                                    기본 분석 리포트 (프리미엄 등급에서 정밀 예측 데이터가 활성화됩니다)
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Parent Nudge Card (Conditional) */}
            {isGuardian && (
                <GuardianNudgeCard 
                    playerName={user?.name || '선수'} 
                    fatigueLevel={displayScore < 50 ? 'HIGH' : displayScore < 80 ? 'MEDIUM' : 'LOW'} 
                />
            )}

            {/* Weekly Report Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-obsidian tracking-tight flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-chapter-accent" />
                        주간 회복 리포트
                    </h3>
                </div>
                <WeeklyReportView onDataLoaded={(prods, report) => {
                    setRecommendedProducts(prods);
                    if (report) setWeeklyReport(report);
                }} />
            </section>

            {/* Data-driven Insights (If available) */}
            {(insights?.posture || insights?.meal) && (
                <section className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black text-obsidian tracking-tight flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-reward-gold" />
                            영역별 정밀 가이드
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {insights.posture && (
                            <ActionableInsightCard type="posture" insight={insights.posture} />
                        )}
                        {insights.meal && (
                            <div className="space-y-8">
                                <ActionableInsightCard type="meal" insight={insights.meal} />
                                <MealNutrientChart
                                    nutrients={insights.meal.nutrients}
                                    advice={insights.meal.suggestion}
                                />
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Locked Advanced Metrics (For Non-Premium) */}
            {!isPremium && (
                <Card className="bg-mist/30 border border-line border-dashed rounded-[32px] p-6 md:p-10 text-center relative overflow-hidden">
                    <div className="space-y-6 relative z-10">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <Lock className="w-8 h-8 text-slate/40" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-obsidian/40">정밀 예측 분석 잠금</h3>
                            <p className="text-xs text-slate/50 font-medium">바이오 리듬 예측, 장기 회복 트렌드, 전문 의료진 가이드 등의 고도화된 기능은<br />RESTART 등급 이상의 멤버십에서 제공됩니다.</p>
                        </div>
                        <Link 
                            href="/membership" 
                            className="inline-block bg-obsidian text-reward-gold border border-reward-gold/30 px-8 py-3 rounded-xl font-black text-sm hover:bg-obsidian/90 transition-all shadow-xl"
                        >
                            멤버십 혜택 보기
                        </Link>
                    </div>
                </Card>
            )}
            {/* Recommended Products (Moved to the very bottom) */}
            {recommendedProducts && recommendedProducts.length > 0 && (
                <section className="space-y-4 pt-8 border-t border-line/30">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black text-obsidian tracking-tight flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-reward-gold" />
                            유니클 샵 맞춤 추천 상품
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {recommendedProducts.map((prod: any, idx: number) => (
                            <div 
                                key={idx} 
                                onClick={() => {
                                    if (prod.productId) {
                                        window.location.href = `/shop/product/${prod.productId}`;
                                    }
                                }}
                                className="flex flex-col bg-white border border-line rounded-[32px] overflow-hidden shadow-xl shadow-obsidian/5 hover:shadow-2xl transition-all cursor-pointer group"
                            >
                                {/* Product Image */}
                                <div className="relative aspect-video w-full overflow-hidden bg-mist">
                                    {prod.imageUrl ? (
                                        <img 
                                            src={prod.imageUrl} 
                                            alt={prod.name} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl">
                                            🛍️
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-obsidian/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-widest">
                                        유니클 Pick
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <h5 className="text-base font-black text-obsidian group-hover:text-chapter-accent transition-colors leading-tight">
                                        {prod.name}
                                    </h5>
                                    
                                    {prod.price > 0 && (
                                        <p className="text-base font-black text-obsidian/90 mt-1">
                                            {prod.price.toLocaleString()}원
                                        </p>
                                    )}

                                    <div className="mt-3 bg-mist/50 p-4 rounded-2xl border border-line/40 flex-1">
                                        <p className="text-xs font-bold text-slate/70 leading-relaxed">
                                            💡 {prod.reason}
                                        </p>
                                    </div>

                                    <div className="mt-6">
                                        <Button className="w-full h-12 bg-obsidian text-white rounded-xl font-black text-xs uppercase tracking-widest group-hover:bg-chapter-accent transition-colors">
                                            상품 자세히 보기
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
