'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
    ChevronLeft, 
    Brain, 
    Clock, 
    CheckCircle2,
    Sparkles,
    Loader2,
    ChevronRight,
    Search,
    Filter,
    ArrowRight,
    BookOpen,
    Info,
    TrendingUp,
    BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    LineChart,
    Line,
    Legend
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import ChapterWrapper from '@/components/layout/ChapterWrapper';

export default function PersonalityHistoryPage() {
    const router = useRouter();
    const [diagnoses, setDiagnoses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [guideOpen, setGuideOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/user/profile');
            const data = await res.json();
            
            // Filter personality-related diagnoses from userData.diagnosisResults
            const personality = (data.diagnosisResults || []).filter((d: any) => 
                ['PAID', 'DEEP', 'PERSONALITY', 'FREE'].includes(d.type?.toUpperCase())
            ).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            setDiagnoses(personality);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDiagnoses = diagnoses.filter(d => 
        d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(d.createdAt).toLocaleDateString().includes(searchTerm)
    );

    // Prepare chart data for personality factors trend
    const chartData = [...diagnoses].reverse().map(d => {
        const date = new Date(d.createdAt);
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        
        // Extract scores (handle different types)
        const type = d.type?.toUpperCase();
        let openness = 0, conscientiousness = 0, extraversion = 0, agreeableness = 0, neuroticism = 0;

        if (type === 'FREE' && d.scores) {
            // Mapping FREE categories to Big 5 approximations
            const s = d.scores;
            openness = s.Mindset || 0;
            conscientiousness = s.Physical || 0; // Approximation
            extraversion = s.Social || 0;
            agreeableness = s.Social || 0; // Approximation
            neuroticism = 100 - (s.Emotional || 50); // Emotional stability inverse
        } else {
            const s = d.metadata?.tScores?.domains || d.scores || {};
            openness = s.openness || s.O || 0;
            conscientiousness = s.conscientiousness || s.C || 0;
            extraversion = s.extraversion || s.E || 0;
            agreeableness = s.agreeableness || s.A || 0;
            neuroticism = s.neuroticism || s.N || 0;
        }
        
        return {
            date: `${mm}.${dd}`,
            '개방성': openness,
            '성실성': conscientiousness,
            '외향성': extraversion,
            '우호성': agreeableness,
            '신경증': neuroticism,
            total: d.totalScore
        };
    });

    const getReportTitle = (d: any) => {
        const type = d.type?.toUpperCase();
        if (type === 'FREE') return '간편 내면 데이터 분석';
        if (type === 'PAID' || type === 'DEEP' || type === 'PERSONALITY') return '프리미엄 내면 데이터 리포트';
        return d.title || '내면 데이터 리포트';
    };

    const getBadgeProps = (type: string) => {
        switch(type?.toUpperCase()) {
            case 'PAID':
            case 'DEEP':
            case 'PERSONALITY':
                return { label: 'PREMIUM', className: 'bg-reward-gold text-obsidian' };
            default:
                return { label: 'BASIC', className: 'bg-slate-200 text-slate-600' };
        }
    };

    return (
        <ChapterWrapper title="Inner Data History" subtitle="당신의 고유 기질과 내면 데이터 기록">
            <main className="min-h-screen bg-[#F8FAFC] pb-20">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <Link href="/reports" className="flex items-center gap-2 text-slate-500 hover:text-obsidian transition-colors group">
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-bold text-sm">리포트 허브</span>
                        </Link>
                        <h1 className="font-black text-lg text-obsidian tracking-tight">내면 데이터 리포트 히스토리</h1>
                        <div className="w-20" /> {/* Spacer */}
                    </div>
                </header>

                <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
                    {/* Hero Section */}
                    <section className="relative overflow-hidden bg-obsidian rounded-[40px] p-8 md:p-12 text-white shadow-2xl">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden p-1">
                                    <Image 
                                        src="/images/characters/char_diagnosis.png" 
                                        alt="Character Icon" 
                                        width={40} 
                                        height={40}
                                        className="object-contain"
                                    />
                                </div>
                                <Badge className="bg-primary/20 text-primary border-none font-black text-[10px] tracking-widest px-3 py-1">HISTORY HUB</Badge>
                            </div>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter">변하지 않는 당신의 가치, <br />내면의 지도를 확인하세요.</h2>
                                <p className="text-slate-400 mt-4 max-w-xl font-medium leading-relaxed">
                                    시간이 흐름에 따라 당신의 기질이 환경에 어떻게 적응하고 회복해 나가는지, <br />
                                    과거의 기록들을 통해 성장의 궤적을 발견할 수 있습니다.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Trend Analysis Section - NEW */}
                    {diagnoses.length > 0 && (
                        <motion.section 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between px-2">
                                <h3 className="font-black text-xl text-obsidian tracking-tight flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    내면 변화 트렌드
                                </h3>
                                <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold">
                                    최근 {diagnoses.length}개 데이터 분석
                                </Badge>
                            </div>

                            <Card className="bg-white border-slate-100 rounded-[40px] overflow-hidden shadow-xl shadow-slate-200/50">
                                <CardContent className="p-8 md:p-10">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                        <div className="lg:col-span-2">
                                            <div className="h-72 w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={chartData}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                                        <XAxis 
                                                            dataKey="date" 
                                                            axisLine={false} 
                                                            tickLine={false} 
                                                            tick={{fontSize: 11, fontWeight: 700, fill: '#94A3B8'}} 
                                                            dy={10}
                                                        />
                                                        <YAxis 
                                                            domain={[0, 100]} 
                                                            axisLine={false} 
                                                            tickLine={false} 
                                                            tick={{fontSize: 11, fontWeight: 700, fill: '#94A3B8'}}
                                                        />
                                                        <Tooltip 
                                                            contentStyle={{ 
                                                                backgroundColor: '#111', 
                                                                border: 'none', 
                                                                borderRadius: '20px',
                                                                color: '#fff',
                                                                fontSize: '12px',
                                                                fontWeight: '700',
                                                                padding: '12px 16px'
                                                            }}
                                                            itemStyle={{ padding: '2px 0' }}
                                                        />
                                                        <Legend 
                                                            verticalAlign="top" 
                                                            align="right" 
                                                            iconType="circle"
                                                            wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', fontWeight: '800' }}
                                                        />
                                                        <Line type="monotone" dataKey="개방성" stroke="#C0FF00" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                                        <Line type="monotone" dataKey="성실성" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                                        <Line type="monotone" dataKey="외향성" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                                        <Line type="monotone" dataKey="우호성" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                                        <Line type="monotone" dataKey="신경증" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center space-y-6">
                                            <div className="space-y-2">
                                                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                                                    <BarChart3 className="w-5 h-5 text-primary" />
                                                </div>
                                                <h4 className="text-xl font-black text-obsidian">성장 인사이트</h4>
                                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                                    {diagnoses.length >= 2 ? (
                                                        <>이전 기록 대비 <strong>{Math.abs(chartData[chartData.length-1].total - chartData[chartData.length-2].total)}레벨</strong>의 종합 회복 흐름 변화가 감지되었습니다. 주요 요인별 변화를 통해 당신의 적응 기제를 확인하세요.</>
                                                    ) : (
                                                        <>회복 기록 데이터가 쌓일수록 당신의 성격적 특성이 회복에 미치는 영향을 더욱 정밀하게 분석할 수 있습니다.</>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">최근 회복 지표</span>
                                                    <span className="text-2xl font-black text-obsidian">{chartData[chartData.length-1]?.total || 0}<span className="text-xs ml-0.5 text-slate-300">레벨</span></span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</span>
                                                    <Badge className="bg-primary text-obsidian border-none font-black text-[10px]">STABLE</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.section>
                    )}

                    {/* Search & Filter Bar */}
                    <section className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                                placeholder="날짜 또는 리포트 명칭으로 검색..." 
                                className="pl-12 bg-slate-50 border-none rounded-2xl h-12 text-sm font-medium focus-visible:ring-primary/30"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Button variant="outline" className="rounded-2xl h-12 border-slate-100 flex-1 md:flex-none">
                                <Filter className="w-4 h-4 mr-2" />
                                필터
                            </Button>
                            <Button className="bg-obsidian text-white rounded-2xl h-12 px-6 flex-1 md:flex-none" asChild>
                                <Link href="/diagnosis">새로운 회복 기록 시작</Link>
                            </Button>
                        </div>
                    </section>

                    {/* List Section */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-black text-xl text-obsidian tracking-tight flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                분석 타임라인
                            </h3>
                            <span className="text-xs font-bold text-slate-400">{filteredDiagnoses.length}개의 기록</span>
                        </div>

                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-4">
                                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                <p className="font-medium">기록을 불러오는 중입니다...</p>
                            </div>
                        ) : filteredDiagnoses.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredDiagnoses.map((d, idx) => {
                                    const badge = getBadgeProps(d.type);
                                    return (
                                        <motion.div
                                            key={d._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => router.push(`/diagnosis/report?type=personality&id=${d._id}`)}
                                            className="group cursor-pointer"
                                        >
                                            <Card className="bg-white border-slate-100 rounded-3xl hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                                <CardContent className="p-0 flex items-center h-24 md:h-32">
                                                    {/* Date Indicator */}
                                                    <div className="w-20 md:w-32 h-full bg-slate-50 flex flex-col items-center justify-center border-r border-slate-100">
                                                        <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                                                            {new Date(d.createdAt).toLocaleString('ko-KR', { month: 'short' })}
                                                        </span>
                                                        <span className="text-2xl md:text-3xl font-black text-obsidian leading-none">
                                                            {new Date(d.createdAt).getDate()}
                                                        </span>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 px-6 md:px-10 flex items-center justify-between">
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <Badge className={`${badge.className} border-none text-[9px] font-black tracking-widest px-2 py-0.5 rounded-md`}>
                                                                    {badge.label}
                                                                </Badge>
                                                                <span className="text-[10px] font-bold text-slate-400">
                                                                    {new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <h4 className="text-base md:text-xl font-black text-obsidian tracking-tight group-hover:text-primary transition-colors">
                                                                {getReportTitle(d)}
                                                            </h4>
                                                        </div>

                                                        <div className="flex items-center gap-6">
                                                            <div className="hidden md:flex items-center gap-2">
                                                                <div className="flex -space-x-1">
                                                                    {[1, 2, 3].map(i => (
                                                                        <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-200" />
                                                                    ))}
                                                                </div>
                                                                <span className="text-[10px] font-bold text-slate-400">Big 5 Mapped</span>
                                                            </div>
                                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary transition-colors">
                                                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-obsidian" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Brain className="w-8 h-8 text-slate-200" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800">기록을 찾을 수 없습니다</h4>
                                <p className="text-slate-400 text-sm mt-2">검색어를 변경하거나 새로운 회복 기록을 작성해 보세요.</p>
                                <Button className="mt-8 bg-obsidian text-white rounded-full px-8 h-12" asChild>
                                    <Link href="/diagnosis">새로운 회복 기록 시작</Link>
                                </Button>
                            </div>
                        )}
                    </section>

                    {/* Bottom Info */}
                    {/* Bottom Info Section
                        Structure:
                        - Container: Primary light background (bg-primary/5), rounded-40px, flex layout
                        - Text Content: Left-aligned title with icon and description
                        - CTA Button: Right-aligned premium obsidian button that triggers the Guidebook Dialog
                    */}
                    <section className="bg-primary/5 rounded-[40px] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-primary/10">
                        <div className="space-y-3 text-center md:text-left">
                            <h4 className="text-xl font-black text-obsidian flex items-center justify-center md:justify-start gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                성격은 변할 수 있을까요?
                            </h4>
                            <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-lg">
                                타고난 기질은 안정적이지만, 당신이 처한 환경과 회복 노력에 따라 표현되는 양상은 충분히 달라질 수 있습니다. <br />
                                유니클은 당신의 긍정적인 변화를 끝까지 추적하고 응원합니다.
                            </p>
                        </div>
                        <Button 
                            onClick={() => setGuideOpen(true)}
                            className="bg-obsidian text-white hover:bg-obsidian/90 rounded-2xl h-14 px-10 font-black group shadow-xl transition-all active:scale-95"
                        >
                            회복 가이드북 보기
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </section>
                </div>

                {/* Recovery Guidebook Modal */}
                <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
                    <DialogContent className="max-w-2xl bg-white rounded-[40px] p-0 overflow-hidden border-none shadow-2xl">
                        <div className="bg-obsidian p-10 text-white relative">
                            <div className="absolute top-0 right-0 p-10 opacity-10">
                                <BookOpen className="w-32 h-32 text-primary" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <Badge className="bg-primary/20 text-primary border-none font-black text-[10px] tracking-widest px-3 py-1">RECOVERY GUIDE</Badge>
                                <DialogTitle className="text-3xl font-black italic tracking-tighter">
                                    내면 데이터 기반 <br /><span className="text-primary">회복 전략 가이드북</span>
                                </DialogTitle>
                                <p className="text-slate-400 font-medium text-sm">
                                    기질을 이해하면 더 빠르고 편안한 회복이 가능해집니다.
                                </p>
                            </div>
                        </div>
                        
                        <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Info className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <h5 className="font-black text-obsidian tracking-tight">가이드북 활용법</h5>
                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                            이 가이드북은 당신의 Big 5 성격 데이터를 바탕으로 최적의 회복 환경을 설계하는 방법을 제안합니다. 각 기록 시점마다 변화하는 당신의 내면 상태에 맞춰 업데이트됩니다.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-3">
                                        <div className="text-[10px] font-black text-primary uppercase tracking-widest">Strategy 01</div>
                                        <h6 className="font-bold text-obsidian">심리적 안전 기지 구축</h6>
                                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                            높은 신경증 성향을 보일 경우, 소음이 차단된 독립된 회복 공간이 필수적입니다.
                                        </p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-3">
                                        <div className="text-[10px] font-black text-primary uppercase tracking-widest">Strategy 02</div>
                                        <h6 className="font-bold text-obsidian">루틴을 통한 회복 가속</h6>
                                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                            성실성이 높은 분들은 정해진 시간에 회복 보조제를 섭취하는 것만으로도 큰 심리적 안정을 얻습니다.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 text-center">
                                <p className="text-sm font-bold text-obsidian">상세한 맞춤형 가이드북은 현재 AI가 생성 중입니다.</p>
                                <p className="text-xs text-slate-500 mt-1">곧 정식 버전으로 만나보실 수 있습니다.</p>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <Button onClick={() => setGuideOpen(false)} className="bg-obsidian text-white rounded-2xl px-8 font-bold">
                                확인했습니다
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </ChapterWrapper>
    );
}
