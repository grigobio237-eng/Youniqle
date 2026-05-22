'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    ChevronLeft, 
    Activity, 
    Clock, 
    CheckCircle2,
    Sparkles,
    Loader2,
    Brain,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    AreaChart,
    Area,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis
} from 'recharts';
import { AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ALL_QUESTIONS } from '@/lib/data/diagnosis-questions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function DailyHistoryPage() {
    const [diagnoses, setDiagnoses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [insight, setInsight] = useState<any>(null);
    const [insightLoading, setInsightLoading] = useState(true);
    const [selectedDiagnosis, setSelectedDiagnosis] = useState<any>(null);
    const [period, setPeriod] = useState('1D'); // 1D(일), 1M(월), 1Y(년)
    const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);

    useEffect(() => {
        fetchData();
        fetchInsight();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/diagnosis');
            const data = await res.json();
            // Filter only daily diagnoses
            const daily = (data.diagnoses || []).filter((d: any) => 
                ['DAILY', 'FREE'].includes(d.type?.toUpperCase())
            );
            setDiagnoses(daily);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInsight = async () => {
        try {
            const res = await fetch('/api/ai/reports/daily-trend');
            const data = await res.json();
            
            // Handle both stringified and object content
            let insightData = data.insight;
            if (typeof insightData === 'string') {
                try {
                    // Try to parse if it's a JSON string
                    if (insightData.trim().startsWith('{')) {
                        insightData = JSON.parse(insightData);
                    }
                } catch (e) {
                    console.error('Failed to parse insight JSON string', e);
                }
            }
            setInsight({ ...data, insight: insightData });
        } catch (error) {
            console.error('Insight fetch error:', error);
        } finally {
            setInsightLoading(false);
        }
    };

    // Prepare chart data based on selected period
    const getChartData = () => {
        if (diagnoses.length === 0) return [];
        
        const now = new Date();
        let filtered = [...diagnoses];

        // 1. 기간 필터링
        if (period === '1M') {
            const monthAgo = new Date();
            monthAgo.setMonth(now.getMonth() - 1);
            filtered = diagnoses.filter(d => new Date(d.createdAt) >= monthAgo);
        } else if (period === '1Y') {
            const yearAgo = new Date();
            yearAgo.setFullYear(now.getFullYear() - 1);
            filtered = diagnoses.filter(d => new Date(d.createdAt) >= yearAgo);
        }

        // 데이터가 너무 적으면 전체 데이터를 보여줌 (UX 보완)
        const targetData = filtered.length > 1 ? filtered : diagnoses.slice(0, 10);

        // 2. 집계 및 포맷팅
        if (period === '1Y') {
            // 연도별 평균
            const yearly = targetData.reduce((acc: any, d: any) => {
                const date = new Date(d.createdAt);
                const year = `${date.getFullYear()}년`;
                if (!acc[year]) acc[year] = { sum: 0, count: 0 };
                acc[year].sum += d.totalScore;
                acc[year].count += 1;
                return acc;
            }, {});
            return Object.entries(yearly).map(([date, data]: any) => ({
                date,
                score: Math.round(data.sum / data.count)
            })).sort((a, b) => a.date.localeCompare(b.date));
        } else if (period === '1M') {
            // 월별 평균
            const monthly = targetData.reduce((acc: any, d: any) => {
                const date = new Date(d.createdAt);
                const month = `${date.getMonth() + 1}월`;
                if (!acc[month]) acc[month] = { sum: 0, count: 0 };
                acc[month].sum += d.totalScore;
                acc[month].count += 1;
                return acc;
            }, {});
            return Object.entries(monthly).map(([date, data]: any) => ({
                date,
                score: Math.round(data.sum / data.count)
            })).reverse();
        }

        // 1D (일): 개별 기록 나열 (최근 20개, MM.DD. 형식)
        return targetData.slice(0, 20).reverse().map(d => {
            const dateObj = new Date(d.createdAt);
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            return {
                date: `${mm}.${dd}.`,
                score: d.totalScore,
                fullDate: dateObj.toLocaleString()
            };
        });
    };

    // Unified Terminology Helper
    const getDiagnosisTitle = (d: any) => {
        const count = d.answers?.length || 0;
        const type = d.type?.toUpperCase() || '';

        // 1. 5 questions = 60초 리듬체크
        if (count === 5) return '60초 리듬체크';

        // 2. 16 questions = 오늘의 회복 리듬 측정
        if (count === 16) return '오늘의 회복 리듬 측정';

        // 3. Other specific types from Rhythm Check page
        if (type === 'SIMPLE' || (count > 20 && count < 30)) return '간편 문진';
        if (type === 'PRECISION' || type === 'PRECISE' || count >= 30) return '정밀 문진';

        // Fallback to original title or generic
        return d.resultTitle || '리커버리 체크';
    };

    const chartData = getChartData();

    return (
        <main className="min-h-screen bg-mist/30 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-line px-4 md:px-6 py-3.5 md:py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
                    <Link href="/reports" className="flex items-center gap-1 text-slate hover:text-obsidian transition-colors shrink-0">
                        <ChevronLeft className="w-5 h-5" />
                        <span className="font-bold text-xs md:text-sm hidden xs:inline-block">뒤로가기</span>
                    </Link>
                    <h1 className="font-black text-sm sm:text-base md:text-lg text-obsidian tracking-tight text-center flex-1 truncate">
                        60초 리듬체크 히스토리
                    </h1>
                    <div className="w-8 xs:w-16 shrink-0" /> {/* Balanced Spacer */}
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8 md:space-y-12">
                {/* Hero Summary */}
                <section className="space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                            <Activity className="w-5 h-5 md:w-6 md:h-6 text-obsidian" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-obsidian tracking-tight italic">회복 흐름 분석</h2>
                            <p className="text-xs md:text-sm text-slate font-medium">당신의 컨디션 변화 추이를 확인하세요.</p>
                        </div>
                    </div>

                    {/* Chart Card */}
                    <Card className="bg-white border-line rounded-[24px] md:rounded-[32px] overflow-hidden shadow-xl shadow-obsidian/5">
                        <CardContent className="p-4 md:p-8">
                            <div className="flex justify-end mb-4 md:mb-6">
                                <div className="inline-flex bg-mist/50 p-0.5 md:p-1 rounded-lg md:rounded-xl border border-line/50">
                                    {[
                                        { id: '1D', label: '일' },
                                        { id: '1M', label: '월' },
                                        { id: '1Y', label: '년' }
                                    ].map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setPeriod(p.id)}
                                            className={`px-3 md:px-4 py-1 md:py-1.5 rounded-md md:rounded-lg text-[9px] md:text-[10px] font-black transition-all ${
                                                period === p.id 
                                                ? 'bg-obsidian text-primary shadow-md' 
                                                : 'text-slate/60 hover:text-obsidian'
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {loading ? (
                                <div className="h-48 md:h-64 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                </div>
                            ) : chartData.length > 0 ? (
                                <div className="h-48 md:h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#C0FF00" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#C0FF00" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                                            <XAxis 
                                                dataKey="date" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} 
                                                dy={8}
                                            />
                                            <YAxis 
                                                domain={[0, 100]} 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}}
                                            />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: '#111', 
                                                    border: 'none', 
                                                    borderRadius: '12px',
                                                    color: '#fff',
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    padding: '8px 12px'
                                                }}
                                                itemStyle={{ color: '#C0FF00' }}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="score" 
                                                stroke="#C0FF00" 
                                                strokeWidth={3}
                                                fillOpacity={1} 
                                                fill="url(#colorScore)" 
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-48 md:h-64 flex flex-col items-center justify-center text-center space-y-3">
                                    <p className="text-slate font-medium text-xs md:text-sm">아직 기록된 회복 데이터가 없습니다.</p>
                                    <Link href="/ai-navigator">
                                        <Button className="bg-obsidian text-primary rounded-xl font-black text-xs px-5 py-3 h-auto">
                                            첫 리듬체크 시작하기
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                {/* AI Insight Section */}
                <section className="space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="font-black text-sm md:text-lg text-obsidian tracking-tight flex items-center gap-2">
                            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
                            유니클 리커버리 인사이트
                        </h3>
                        {insight?.analyzedAt && (
                            <span className="text-[9px] md:text-[10px] font-bold text-slate/50">
                                분석 시점: {new Date(insight.analyzedAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>

                    <Card className="bg-obsidian text-white rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10 hidden sm:block">
                            <Brain className="w-32 h-32" />
                        </div>
                        <CardContent className="p-5 md:p-10 relative z-10 space-y-5 md:space-y-6">
                            {insightLoading ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-4 bg-white/10 rounded w-3/4" />
                                    <div className="h-4 bg-white/10 rounded w-full" />
                                    <div className="h-4 bg-white/10 rounded w-5/6" />
                                </div>
                            ) : typeof insight?.insight === 'string' ? (
                                <div className="prose prose-invert max-w-none text-mist/80 text-xs md:text-base leading-relaxed font-medium">
                                    <div dangerouslySetInnerHTML={{ __html: insight.insight.replace(/\n/g, '<br/>') }} />
                                </div>
                            ) : insight?.insight ? (
                                <div className="space-y-6 md:space-y-8">
                                    {/* 1. Headline & Summary */}
                                    <div className="space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                            <h4 className="text-lg md:text-2xl lg:text-3xl font-black text-white leading-tight tracking-tighter">
                                                "{insight.insight.headline}"
                                            </h4>
                                            {insight.insight.statusBadge && (
                                                <Badge className={`self-start shrink-0 px-3 py-1 rounded-full font-black text-[9px] md:text-[10px] tracking-widest ${
                                                    insight.insight.statusBadge === 'EXCELLENT' ? 'bg-primary text-obsidian' :
                                                    insight.insight.statusBadge === 'GOOD' ? 'bg-reward-gold text-obsidian' :
                                                    insight.insight.statusBadge === 'CAUTION' ? 'bg-orange-500 text-white' :
                                                    'bg-red-500 text-white'
                                                }`}>
                                                    {insight.insight.statusBadge}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-mist/70 text-xs md:text-base leading-relaxed font-medium">
                                            {insight.insight.summary}
                                        </p>
                                    </div>

                                    {/* 2. Radar Chart & Missions Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center">
                                        {/* Radar Chart */}
                                        {insight.insight.radarData && (
                                            <div className="h-56 md:h-64 w-full bg-white/5 rounded-2xl md:rounded-3xl p-2 md:p-4 flex items-center justify-center">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={insight.insight.radarData}>
                                                        <PolarGrid stroke="#ffffff20" />
                                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff60', fontSize: 9, fontWeight: 700 }} />
                                                        <Radar
                                                            name="Score"
                                                            dataKey="A"
                                                            stroke="#C0FF00"
                                                            fill="#C0FF00"
                                                            fillOpacity={0.6}
                                                        />
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}

                                        {/* Missions */}
                                        <div className="space-y-3">
                                            <p className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.3em]">Next Actions</p>
                                            {insight.insight.missions?.map((m: any, i: number) => (
                                                <div key={i} className="bg-white/10 border border-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4 group hover:bg-white/20 transition-all">
                                                    <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 bg-primary/20 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                        <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[8px] md:text-[9px] font-black text-primary/60 uppercase tracking-widest truncate">{m.category}</p>
                                                        <h5 className="text-xs md:text-sm font-bold text-white mb-0.5 truncate">{m.title}</h5>
                                                        <p className="text-[9px] md:text-[10px] text-mist/40 font-medium truncate">{m.effect} • {m.reward}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 3. Detailed Analysis (Redesigned Toggle) */}
                                    {insight.insight.detailedAnalysis && (
                                        <div className="pt-5 border-t border-white/10">
                                            <button 
                                                onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                                                className={`w-full flex items-center justify-between p-4 md:p-6 rounded-[20px] md:rounded-[28px] transition-all duration-500 group border-2 ${
                                                    isAnalysisExpanded 
                                                    ? 'bg-primary border-primary shadow-[0_20px_40px_rgba(192,255,0,0.2)]' 
                                                    : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 md:gap-5 min-w-0 text-left">
                                                    <div className={`w-10 h-10 md:w-14 md:h-14 shrink-0 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 overflow-hidden shadow-inner ${
                                                        isAnalysisExpanded ? 'bg-obsidian/10' : 'bg-primary'
                                                    }`}>
                                                        <img 
                                                            src="/images/characters/char_diagnosis.png" 
                                                            alt="Youniqle Analysis Character" 
                                                            className="w-8 h-8 md:w-11 md:h-11 object-contain transform group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className={`block text-xs sm:text-base md:text-lg font-black tracking-tight transition-colors duration-500 truncate ${
                                                            isAnalysisExpanded ? 'text-obsidian' : 'text-white'
                                                        }`}>
                                                            분석 원인 및 상세 가이드 {isAnalysisExpanded ? '닫기' : '보기'}
                                                        </span>
                                                        <p className={`text-[8px] md:text-[11px] font-bold uppercase tracking-widest mt-0.5 truncate ${
                                                            isAnalysisExpanded ? 'text-obsidian/40' : 'text-primary/60'
                                                        }`}>
                                                            {isAnalysisExpanded ? 'Click to close detail' : 'Click to explore deep dive'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-500 shrink-0 ${
                                                    isAnalysisExpanded 
                                                    ? 'bg-obsidian text-primary rotate-90' 
                                                    : 'bg-primary text-obsidian shadow-lg group-hover:scale-110 animate-bounce-x'
                                                }`}>
                                                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                                                </div>
                                            </button>
                                            
                                            <style jsx>{`
                                                @keyframes bounce-x {
                                                    0%, 100% { transform: translateX(0); }
                                                    50% { transform: translateX(5px); }
                                                }
                                                .animate-bounce-x {
                                                    animation: bounce-x 1s infinite;
                                                }
                                            `}</style>
                                            
                                            <AnimatePresence>
                                                {isAnalysisExpanded && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="mt-4 p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 border border-white/5 prose prose-invert prose-xs md:prose-sm max-w-none text-mist/60 leading-relaxed font-medium">
                                                            <ReactMarkdown>{insight.insight.detailedAnalysis}</ReactMarkdown>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-mist/50 italic text-xs md:text-sm">데이터 분석을 기다리고 있습니다...</p>
                            )}
                            
                            <div className="pt-3 border-t border-white/10 flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest">
                                <CheckCircle2 className="w-3 h-3" />
                                Personalized analysis by Youniqle Gemini
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* History List */}
                <section className="space-y-4 md:space-y-6">
                    <h3 className="font-black text-sm md:text-lg text-obsidian tracking-tight flex items-center gap-2 px-1">
                        <Clock className="w-4 h-4 md:w-5 md:h-5 text-chapter-accent" />
                        타임라인 기록
                    </h3>

                    <div className="space-y-3 md:space-y-4">
                        {diagnoses.length > 0 ? diagnoses.map((d, idx) => (
                            <motion.div 
                                key={d._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card 
                                    className="bg-white border-line rounded-xl md:rounded-2xl hover:border-primary transition-all cursor-pointer group overflow-hidden"
                                    onClick={() => setSelectedDiagnosis(d)}
                                >
                                    <CardContent className="p-3.5 md:p-5 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                            <div className="w-10 h-10 md:w-12 md:h-12 bg-mist rounded-lg md:rounded-xl flex flex-col items-center justify-center shrink-0">
                                                <span className="text-[8px] md:text-[10px] font-black text-slate leading-none">
                                                    {new Date(d.createdAt).toLocaleString('ko-KR', { month: 'short' })}
                                                </span>
                                                <span className="text-sm md:text-lg font-black text-obsidian leading-none mt-0.5 md:mt-1">
                                                    {new Date(d.createdAt).getDate()}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-black text-xs md:text-base text-obsidian tracking-tight truncate">{getDiagnosisTitle(d)}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge className="bg-mist text-slate border-none text-[8px] md:text-[9px] font-bold px-1.5 py-0">
                                                        {new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Badge>
                                                    <span className="text-[9px] md:text-[10px] text-slate/50 font-medium truncate">
                                                        {d.answers?.length || 0}개 문항 답변
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 md:gap-6 shrink-0">
                                            <div className="text-right">
                                                <span className="block text-[8px] md:text-[10px] font-black text-slate/40 uppercase tracking-widest leading-none">Score</span>
                                                <span className="text-base md:text-xl font-black text-obsidian leading-none">{d.totalScore}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-line group-hover:text-primary transition-colors" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )) : (
                            <div className="text-center py-10 text-slate font-medium text-xs md:text-sm">기록된 타임라인이 없습니다.</div>
                        )}
                    </div>
                </section>
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!selectedDiagnosis} onOpenChange={() => setSelectedDiagnosis(null)}>
                <DialogContent className="max-w-2xl bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-8 max-h-[85vh] overflow-y-auto w-[92vw] sm:w-full">
                    <DialogHeader className="mb-4 md:mb-6">
                        <DialogTitle className="text-lg md:text-2xl font-black text-obsidian flex items-center gap-2 italic">
                            <Activity className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                            기록 상세 정보
                        </DialogTitle>
                        <p className="text-xs md:text-sm text-slate font-medium">
                            {selectedDiagnosis && new Date(selectedDiagnosis.createdAt).toLocaleString()}
                        </p>
                    </DialogHeader>

                    {selectedDiagnosis && (
                        <div className="space-y-6 md:space-y-8">
                            {/* Score Overview */}
                            <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 md:gap-4">
                                {Object.entries(selectedDiagnosis.categoryScores || {}).map(([key, val]: any) => (
                                    <div key={key} className="bg-mist/50 p-3 md:p-4 rounded-xl md:rounded-2xl text-center">
                                        <span className="text-[8px] md:text-[10px] font-black text-slate/60 uppercase tracking-widest block mb-1">{key}</span>
                                        <span className="text-sm md:text-lg font-black text-obsidian">{val}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Answers List */}
                            <div className="space-y-3 md:space-y-4">
                                <h4 className="font-black text-sm md:text-base text-obsidian flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-chapter-accent" />
                                    체크 항목 및 답변
                                </h4>
                                <div className="space-y-2 md:space-y-3">
                                    {selectedDiagnosis.answers?.map((item: any, idx: number) => {
                                        const resolvedQuestion = item.question === 'Unknown' || !item.question
                                            ? ALL_QUESTIONS.find(q => q.id === item.questionId)?.text || item.question
                                            : item.question;
                                        
                                        const resolvedCategory = item.category === 'Unknown' || !item.category
                                            ? ALL_QUESTIONS.find(q => q.id === item.questionId)?.category || item.category
                                            : item.category;
 
                                        return (
                                            <div key={idx} className="bg-mist/30 p-3.5 md:p-4 rounded-xl md:rounded-2xl border border-line/50">
                                                <p className="text-[8px] md:text-[10px] font-black text-chapter-accent uppercase tracking-widest mb-1">{resolvedCategory}</p>
                                                <p className="text-xs md:text-sm font-bold text-obsidian leading-snug mb-2">{resolvedQuestion}</p>
                                                <div className="flex items-center justify-between">
                                                    <Badge className="bg-obsidian text-white border-none text-[9px] md:text-[10px] font-black px-2.5 py-0.5">
                                                        {item.answer}
                                                    </Badge>
                                                    <span className="text-[9px] md:text-[10px] font-black text-slate/40 tracking-tighter">
                                                        영향도: {item.score}pt
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Recommendation Summary */}
                            <div className="bg-primary/10 border border-primary/20 p-5 md:p-6 rounded-[20px] md:rounded-[24px]">
                                <h4 className="font-black text-obsidian text-xs md:text-sm mb-2 flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    코치 한마디
                                </h4>
                                <p className="text-xs md:text-sm font-medium text-obsidian/80 leading-relaxed italic">
                                    {selectedDiagnosis.resultDescription}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </main>
    );
}
