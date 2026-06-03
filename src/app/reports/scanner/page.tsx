'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, 
    Maximize2, 
    Clock, 
    CheckCircle2,
    Sparkles,
    Loader2,
    Brain,
    ChevronRight,
    Camera,
    Target,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function ScannerReportPage() {
    const [scans, setScans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [latestScan, setLatestScan] = useState<any>(null);
    const [selectedScan, setSelectedScan] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch full scan history
            const res = await fetch('/api/scan');
            const data = await res.json();
            const scanList = data.scans || [];
            
            // Sort by date descending
            const sortedScans = [...scanList].sort((a: any, b: any) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            
            setScans(sortedScans);
            if (sortedScans.length > 0) {
                setLatestScan(sortedScans[0]);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            'MEAL': '식단 분석',
            'HYDRATION': '수분 섭취',
            'SKIN': '피부 상태',
            'SLEEP': '수면 패턴',
            'ACTIVITY': '활동량',
            'ROUTINE': '루틴 체크',
            'BODY': '신체 변화',
            'MEDICAL_DOC': '병원 서류',
            'OTHER': '기타 분석'
        };
        return labels[category?.toUpperCase()] || category || '일반 분석';
    };

    return (
        <main className="min-h-screen bg-mist/30 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-line px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href="/reports" className="flex items-center gap-2 text-slate hover:text-obsidian transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                        <span className="font-bold text-sm">뒤로가기</span>
                    </Link>
                    <h1 className="font-black text-lg text-obsidian tracking-tight">유니클 스캐너 분석 히스토리</h1>
                    <div className="w-20" /> {/* Spacer */}
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-10 space-y-12">
                {/* Hero Summary - Latest Scan */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Camera className="w-6 h-6 text-obsidian" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-obsidian tracking-tight italic">최근 스캔 분석</h2>
                            <p className="text-sm text-slate font-medium">가장 최근에 촬영된 데이터 기반 분석 결과입니다.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="h-64 flex items-center justify-center bg-white border border-line rounded-[32px]">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : latestScan ? (
                        <Card className="bg-white border-line rounded-[32px] overflow-hidden shadow-xl shadow-obsidian/5 border-t-4 border-t-primary">
                            <CardContent className="p-0">
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    {/* Image Side */}
                                    <div className="relative aspect-square md:aspect-auto h-full min-h-[300px] bg-obsidian overflow-hidden">
                                        <Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized 
                                            src={latestScan.imageUrl} 
                                            alt="Scanner Analysis"
                                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent" />
                                        <div className="absolute bottom-6 left-6 flex items-center gap-2">
                                            <Badge className="bg-primary text-obsidian border-none font-black text-[10px] px-3 py-1">
                                                {getCategoryLabel(latestScan.category || latestScan.type)}
                                            </Badge>
                                            <span className="text-[10px] text-white/60 font-bold">
                                                {new Date(latestScan.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Side */}
                                    <div className="p-8 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs font-black text-primary uppercase tracking-[0.3em]">Youniqle Analysis Score</div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="font-black text-obsidian text-4xl">{latestScan.score || 0}</span>
                                                <span className="text-sm font-bold text-slate">pt</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-mist/30 p-5 rounded-2xl border border-line/50 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                                    <Brain className="w-12 h-12" />
                                                </div>
                                                <h4 className="text-xs font-black text-obsidian/40 uppercase tracking-widest mb-2">Summary</h4>
                                                <p className="text-sm font-bold text-obsidian leading-relaxed relative z-10">
                                                    {latestScan.summary || '분석 결과를 불러오는 중입니다.'}
                                                </p>
                                            </div>

                                            {/* Metrics Grid */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {Object.entries(latestScan.metrics || {}).map(([key, value]: [string, any], idx) => (
                                                    <div key={idx} className="bg-mist/20 p-3 rounded-xl border border-line/30">
                                                        <span className="block text-[9px] font-black text-slate/50 uppercase tracking-widest mb-1">{key}</span>
                                                        <span className="text-xs font-black text-obsidian">{String(value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Button 
                                            onClick={() => setSelectedScan(latestScan)}
                                            className="w-full bg-obsidian text-primary rounded-2xl font-black text-xs h-12 hover:scale-[1.02] transition-transform"
                                        >
                                            상세 리포트 보기
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 bg-white border border-line rounded-[32px]">
                            <p className="text-slate font-medium">아직 기록된 스캔 데이터가 없습니다.</p>
                            <Link href="/">
                                <Button className="bg-obsidian text-primary rounded-xl font-black text-xs px-6 py-4 h-auto">
                                    첫 스캔 시작하기
                                </Button>
                            </Link>
                        </div>
                    )}
                </section>

                {/* History List */}
                <section className="space-y-6">
                    <h3 className="font-black text-lg text-obsidian tracking-tight flex items-center gap-2 px-2">
                        <Clock className="w-5 h-5 text-chapter-accent" />
                        스캔 타임라인
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scans.length > 0 ? scans.map((s, idx) => (
                            <motion.div 
                                key={s._id || idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card 
                                    className="bg-white border-line rounded-2xl hover:border-primary transition-all cursor-pointer group overflow-hidden"
                                    onClick={() => setSelectedScan(s)}
                                >
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="w-16 h-16 shrink-0 bg-mist rounded-xl overflow-hidden">
                                            <Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized 
                                                src={s.imageUrl} 
                                                alt="Scan thumbnail"
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <Badge className="bg-mist text-slate border-none text-[8px] font-black px-2 py-0">
                                                    {getCategoryLabel(s.category || s.type)}
                                                </Badge>
                                                <span className="text-[10px] font-black text-obsidian">{s.score}pt</span>
                                            </div>
                                            <h4 className="font-bold text-obsidian text-xs truncate mb-1">
                                                {s.summary || '분석 요약 없음'}
                                            </h4>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3 h-3 text-slate/30" />
                                                <span className="text-[9px] text-slate/50 font-bold">
                                                    {new Date(s.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-line group-hover:text-primary transition-colors" />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )) : (
                            <div className="col-span-full text-center py-10 text-slate font-medium text-sm">기록된 스캔 내역이 없습니다.</div>
                        )}
                    </div>
                </section>
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!selectedScan} onOpenChange={() => setSelectedScan(null)}>
                <DialogContent className="max-w-2xl bg-white rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                    {selectedScan && (
                        <div className="flex flex-col max-h-[90vh]">
                            {/* Image Header */}
                            <div className="relative h-[300px] bg-obsidian">
                                <Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized 
                                    src={selectedScan.imageUrl} 
                                    alt="Full Scan"
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 to-transparent" />
                                <button 
                                    onClick={() => setSelectedScan(null)}
                                    aria-label="닫기"
                                    className="absolute top-6 right-6 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
                                >
                                    <ChevronLeft className="w-6 h-6 rotate-180" />
                                </button>
                                <div className="absolute bottom-6 left-8 space-y-2">
                                    <Badge className="bg-primary text-obsidian border-none font-black text-xs px-4 py-1.5 rounded-full">
                                        {getCategoryLabel(selectedScan.category || selectedScan.type)}
                                    </Badge>
                                    <div className="flex items-center gap-3 text-white">
                                        <span className="text-3xl font-black">{selectedScan.score}</span>
                                        <div className="h-8 w-px bg-white/20" />
                                        <span className="text-sm font-bold opacity-60">
                                            {new Date(selectedScan.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Details Content */}
                            <div className="p-8 space-y-8 overflow-y-auto">
                                <div className="space-y-4">
                                    <h4 className="font-black text-obsidian text-lg tracking-tight flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-primary" />
                                        유니클 분석 요약
                                    </h4>
                                    <p className="text-sm font-medium text-slate leading-relaxed bg-mist/30 p-6 rounded-3xl border border-line/50 italic">
                                        "{selectedScan.summary}"
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-black text-obsidian text-lg tracking-tight flex items-center gap-2">
                                        <Target className="w-5 h-5 text-chapter-accent" />
                                        상세 지표 (Metrics)
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {Object.entries(selectedScan.metrics || {}).map(([key, value]: [string, any], idx) => (
                                            <div key={idx} className="bg-white border border-line p-5 rounded-2xl shadow-sm">
                                                <span className="block text-[10px] font-black text-slate/40 uppercase tracking-widest mb-1.5">{key}</span>
                                                <span className="text-sm font-black text-obsidian">{String(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-obsidian rounded-3xl p-8 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <Zap className="w-24 h-24 text-primary" />
                                    </div>
                                    <div className="relative z-10 space-y-4">
                                        <h5 className="font-black text-primary text-xs uppercase tracking-[0.2em]">Coach Insight</h5>
                                        <p className="text-sm font-bold leading-relaxed text-mist/80">
                                            이 분석 데이터를 기반으로 당신의 회복 흐름이 설계됩니다. 
                                            지속적인 스캐닝을 통해 더 정밀한 유니클 가이드를 받아보세요.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </main>
    );
}
