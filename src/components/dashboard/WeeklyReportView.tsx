'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, ThumbsUp, AlertTriangle, Target, ShoppingBag, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function WeeklyReportView({ onDataLoaded }: { onDataLoaded?: (products: any[], report?: any) => void }) {
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
                    if (onDataLoaded) {
                        onDataLoaded(result.data.recommendedProducts || [], result.data);
                    }
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
            if (onDataLoaded) {
                onDataLoaded(result.data.recommendedProducts || [], result.data);
            }
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
            <div className="flex justify-center items-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-chapter-accent" />
            </div>
        );
    }

    if (!report) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                <div className="w-20 h-20 bg-mist rounded-full flex items-center justify-center shadow-sm border border-line overflow-hidden">
                    <img src="/images/characters/char_diagnosis.png" alt="진단 리포트 캐릭터" className="w-12 h-12 object-contain" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-obsidian tracking-tight">이번 주 리포트가 없습니다.</h3>
                    <p className="text-slate/60 text-sm font-bold mt-2 max-w-[280px]">
                        지난 7일간 기록하신 라이프 스냅을 바탕으로 유니클이 주간 회복 리포트를 생성해 드립니다.
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
                            유니클 분석 중...
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
            <div className="bg-white rounded-[32px] p-6 border border-line shadow-xl shadow-obsidian/5 text-center relative overflow-hidden">
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
                <div className="bg-mist/50 p-5 rounded-[24px] border border-line space-y-3">
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
                <div className="bg-mist/50 p-5 rounded-[24px] border border-line space-y-3">
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
            <div className="bg-obsidian text-white p-5 md:p-6 rounded-[32px] space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-chapter-accent/20 blur-3xl -mt-16 -mr-16" />
                <div className="flex items-center gap-2 text-chapter-accent font-black uppercase text-xs tracking-widest relative z-10">
                    <Target className="w-4 h-4" /> 다음 주 행동 가이드
                </div>
                <p className="text-sm font-bold leading-relaxed relative z-10">
                    {report.actionPlan}
                </p>
            </div>

        </div>
    );
}
