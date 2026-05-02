'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, ThumbsUp, AlertTriangle, Target, ShoppingBag, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function WeeklyReportView() {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/dashboard/report');
            if (res.ok) {
                const result = await res.json();
                if (result.data) {
                    setReport(result.data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch report:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = async () => {
        try {
            setGenerating(true);
            const res = await fetch('/api/dashboard/report', { method: 'POST' });
            const result = await res.json();

            if (!res.ok) {
                toast.error(result.error || '리포트 생성에 실패했습니다.');
                return;
            }

            setReport(result.data);
            toast.success('이번 주 회복 리포트가 성공적으로 발행되었습니다!');
        } catch (error) {
            console.error('Failed to generate report:', error);
            toast.error('리포트 생성 중 오류가 발생했습니다.');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-chapter-accent" />
            </div>
        );
    }

    if (!report) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="w-24 h-24 bg-mist rounded-full flex items-center justify-center shadow-sm border border-line overflow-hidden">
                    <img src="/images/characters/char_diagnosis.png" alt="진단 리포트 캐릭터" className="w-16 h-16 object-contain" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-obsidian tracking-tight">이번 주 리포트가 없습니다.</h3>
                    <p className="text-slate/60 text-sm font-bold mt-2 max-w-[280px]">
                        지난 7일간 기록하신 라이프 스냅을 바탕으로 AI가 주간 회복 리포트를 생성해 드립니다.
                    </p>
                </div>
                <Button
                    onClick={handleGenerateReport}
                    disabled={generating}
                    className="w-full max-w-[280px] h-14 rounded-2xl bg-obsidian text-white font-black tracking-widest hover:scale-105 transition-transform shadow-xl"
                >
                    {generating ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            AI 분석 중...
                        </>
                    ) : (
                        <>
                            <TrendingUp className="w-5 h-5 mr-2" />
                            리포트 생성하기
                        </>
                    )}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* 1. Score & Summary */}
            <div className="bg-white rounded-[32px] p-8 border border-line shadow-sm text-center relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-chapter-accent/10 rounded-full blur-3xl" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate/50 mb-2">Weekly Recovery Score</h4>
                <div className="text-6xl font-black italic text-obsidian tracking-tighter mb-4">
                    {report.score}<span className="text-2xl text-slate/30">/100</span>
                </div>
                <p className="text-sm font-bold text-obsidian bg-mist px-4 py-3 rounded-2xl inline-block relative z-10">
                    "{report.summary}"
                </p>
            </div>

            {/* 2. Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-mist/50 p-6 rounded-[24px] border border-line space-y-4">
                    <div className="flex items-center gap-2 text-status-normal font-black uppercase text-xs tracking-widest">
                        <ThumbsUp className="w-4 h-4" /> 긍정적인 신호
                    </div>
                    <ul className="space-y-2">
                        {report.strengths?.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm font-bold text-obsidian">
                                <CheckCircle className="w-4 h-4 text-status-normal mt-0.5 shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-mist/50 p-6 rounded-[24px] border border-line space-y-4">
                    <div className="flex items-center gap-2 text-status-critical font-black uppercase text-xs tracking-widest">
                        <AlertTriangle className="w-4 h-4" /> 주의할 부분
                    </div>
                    <ul className="space-y-2">
                        {report.weaknesses?.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm font-bold text-obsidian">
                                <div className="w-4 h-4 rounded-full bg-status-critical/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-status-critical" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* 3. Action Plan */}
            <div className="bg-obsidian text-white p-6 rounded-[32px] space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-chapter-accent/20 blur-3xl -mt-16 -mr-16" />
                <div className="flex items-center gap-2 text-chapter-accent font-black uppercase text-xs tracking-widest relative z-10">
                    <Target className="w-4 h-4" /> 다음 주 행동 가이드
                </div>
                <p className="text-sm font-bold leading-relaxed relative z-10">
                    {report.actionPlan}
                </p>
            </div>

            {/* 4. Recommended Products */}
            {report.recommendedProducts && report.recommendedProducts.length > 0 && (
                <div className="bg-white p-8 rounded-[32px] border border-line space-y-6 shadow-md">
                    <div className="flex items-center gap-2 text-reward-gold font-black uppercase text-xs tracking-widest">
                        <ShoppingBag className="w-4 h-4" /> 유니클 샵 맞춤 추천 상품
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {report.recommendedProducts.map((prod: any, idx: number) => (
                            <div 
                                key={idx} 
                                onClick={() => {
                                    if (prod.productId) {
                                        window.location.href = `/shop/product/${prod.productId}`;
                                    }
                                }}
                                className="flex flex-col bg-mist/30 border border-line/50 rounded-[24px] overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                            >
                                {/* Product Image */}
                                <div className="relative aspect-video w-full overflow-hidden bg-slate/10">
                                    {prod.imageUrl ? (
                                        <img 
                                            src={prod.imageUrl} 
                                            alt={prod.name} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl bg-slate/5">
                                            🛍️
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-obsidian/80 backdrop-blur-md text-white text-xs font-black px-3 py-1 rounded-xl">
                                        AI Pick
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="p-6 flex flex-col flex-1">
                                    <h5 className="text-lg font-black text-obsidian group-hover:text-chapter-accent transition-colors">
                                        {prod.name}
                                    </h5>
                                    
                                    {prod.price > 0 && (
                                        <p className="text-base font-bold text-obsidian/90 mt-1">
                                            {prod.price.toLocaleString()}원
                                        </p>
                                    )}

                                    <p className="text-xs font-bold text-slate/70 mt-3 bg-white p-3 rounded-xl border border-line/40 flex-1">
                                        💡 {prod.reason}
                                    </p>

                                    <div className="mt-6 w-full py-3 bg-obsidian text-white text-center text-sm font-black rounded-xl group-hover:bg-chapter-accent transition-colors">
                                        상품 자세히 보기
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
