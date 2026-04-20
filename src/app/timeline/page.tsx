'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    ChevronLeft, 
    Calendar, 
    Activity, 
    ImageIcon, 
    TrendingUp, 
    Clock, 
    Filter,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import Image from 'next/image';

interface TimelineItem {
    id?: string;
    imageUrl?: string;
    type: string;
    score: number;
    summary?: string;
    createdAt: string;
}

export default function ScanTimelinePage() {
    const router = useRouter();
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        async function fetchTimeline() {
            try {
                const res = await fetch('/api/user/timeline');
                if (res.ok) {
                    const data = await res.json();
                    setTimeline(data.timeline || []);
                }
            } catch (error) {
                console.error('Failed to fetch timeline:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchTimeline();
    }, []);

    const filteredTimeline = timeline.filter(item => {
        if (filter === 'ALL') return true;
        return item.type === filter;
    });

    const categories = ['ALL', ...Array.from(new Set(timeline.map(item => item.type)))];

    if (loading) {
        return (
            <div className="min-h-screen bg-mist flex flex-col items-center justify-center space-y-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-chapter-accent/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-chapter-accent border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-obsidian font-bold tracking-widest uppercase text-xs">Loading Timeline...</p>
            </div>
        );
    }

    return (
        <ChapterWrapper chapter="ai-navigator" className="bg-mist pb-24">
            <div className="container mx-auto max-w-4xl px-4 pt-12 md:pt-20">
                {/* Header */}
                <header className="mb-12 space-y-6">
                    <Button 
                        variant="ghost" 
                        onClick={() => router.back()}
                        className="p-0 hover:bg-transparent text-slate hover:text-obsidian transition-colors font-bold group"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                        돌아가기
                    </Button>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-black text-obsidian tracking-tighter italic font-serif">
                                Recovery Timeline
                            </h1>
                            <p className="text-slate font-medium opacity-60">
                                당신의 모든 회복 기록을 시간순으로 확인하세요.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-line shadow-sm overflow-x-auto no-scrollbar">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter(cat)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                                        filter === cat 
                                        ? 'bg-obsidian text-white shadow-lg' 
                                        : 'text-slate hover:bg-white'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Stats Summary - Optional but nice */}
                {timeline.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-line flex flex-col justify-between group hover:border-chapter-accent transition-all cursor-default">
                             <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black text-slate uppercase tracking-widest">Total Scans</span>
                                <Activity className="w-4 h-4 text-chapter-accent" />
                             </div>
                             <p className="text-3xl font-black text-obsidian">{timeline.length}</p>
                        </div>
                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-line flex flex-col justify-between group hover:border-chapter-accent transition-all cursor-default">
                             <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black text-slate uppercase tracking-widest">Avg. Score</span>
                                <TrendingUp className="w-4 h-4 text-status-good" />
                             </div>
                             <p className="text-3xl font-black text-obsidian">
                                {Math.round(timeline.reduce((acc, curr) => acc + curr.score, 0) / timeline.length)}
                             </p>
                        </div>
                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-line flex flex-col justify-between group hover:border-chapter-accent transition-all cursor-default">
                             <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black text-slate uppercase tracking-widest">Last Update</span>
                                <Clock className="w-4 h-4 text-slate opacity-40" />
                             </div>
                             <p className="text-xl font-bold text-obsidian">
                                {new Date(timeline[0].createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                             </p>
                        </div>
                    </div>
                )}

                {/* Timeline List */}
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-6 md:left-12 top-0 bottom-0 w-px bg-line/50 hidden md:block" />

                    <div className="space-y-12">
                        <AnimatePresence mode="popLayout">
                            {filteredTimeline.map((item, idx) => (
                                <motion.div
                                    key={item.id || idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="relative flex flex-col md:flex-row gap-8 items-start"
                                >
                                    {/* Timeline Marker */}
                                    <div className="hidden md:flex absolute left-12 top-8 -translate-x-1/2 w-4 h-4 bg-obsidian rounded-full border-4 border-mist z-10" />

                                    {/* Date Column (Desktop only) */}
                                    <div className="hidden md:block w-32 pt-6 text-right">
                                        <p className="text-xs font-black text-obsidian opacity-20 group-hover:opacity-100 transition-opacity">
                                            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate opacity-40 uppercase tracking-widest mt-1">
                                            {new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                        </p>
                                    </div>

                                    {/* Card Content */}
                                    <Card className="flex-1 w-full bg-white border-line shadow-sm hover:shadow-xl hover:border-chapter-accent transition-all rounded-[40px] overflow-hidden group">
                                        <CardContent className="p-0 flex flex-col md:flex-row h-full md:h-56">
                                            {/* Preview Image */}
                                            <div className="w-full md:w-56 h-56 md:h-full relative bg-mist flex-shrink-0">
                                                {item.imageUrl ? (
                                                    <Image 
                                                        src={item.imageUrl} 
                                                        alt={item.type} 
                                                        fill 
                                                        className="object-cover group-hover:scale-105 transition-transform duration-700" 
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate/20">
                                                        <ImageIcon className="w-12 h-12 mb-2" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">No Preview</span>
                                                    </div>
                                                )}
                                                <Badge className="absolute top-4 left-4 bg-obsidian text-white border-none font-black text-[9px] px-3 py-1 uppercase tracking-widest">
                                                    {item.type}
                                                </Badge>
                                            </div>

                                            {/* Detailed Text */}
                                            <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-3 h-3 text-slate opacity-40" />
                                                            <span className="text-xs font-bold text-slate md:hidden">
                                                                {new Date(item.createdAt).toLocaleDateString()}
                                                            </span>
                                                            <span className="text-xs font-bold text-slate hidden md:inline">
                                                                Recovery Insight Log
                                                            </span>
                                                        </div>
                                                        <div className="flex items-baseline gap-1 text-primary">
                                                            <span className="text-2xl font-black">{item.score}</span>
                                                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">PTS</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <h3 className="text-xl font-black text-obsidian tracking-tight leading-snug group-hover:text-chapter-accent transition-colors">
                                                        {item.summary || '상세 결과 내용을 입력 중입니다.'}
                                                    </h3>
                                                </div>

                                                <div className="mt-6 flex items-center justify-between border-t border-line/30 pt-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-full bg-mist flex items-center justify-center text-xs">👤</div>
                                                        <span className="text-[10px] font-black text-slate uppercase tracking-widest">AI Verified</span>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-mist">
                                                        View Full Report →
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredTimeline.length === 0 && (
                            <div className="py-32 text-center bg-white/50 backdrop-blur-sm rounded-[48px] border-2 border-dashed border-line">
                                <Activity className="w-20 h-20 text-line mx-auto mb-8 animate-pulse" />
                                <h3 className="text-2xl font-black text-obsidian tracking-tighter mb-4">
                                    기록된 타임라인이 없습니다.
                                </h3>
                                <p className="text-slate font-medium max-w-xs mx-auto mb-10 opacity-60">
                                    스캐너를 통해 첫 번째 회복 이정표를 남겨보세요.
                                </p>
                                <Button 
                                    onClick={() => router.push('/utils')}
                                    className="px-10 h-16 bg-obsidian text-white rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-transform"
                                >
                                    스캐너 시작하기
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Guide */}
                <footer className="mt-24 text-center space-y-6">
                    <div className="inline-flex items-center px-4 py-2 bg-chapter-accent/5 rounded-full text-chapter-accent text-[10px] font-black uppercase tracking-[0.2em]">
                        Autonomous Recovery Guide v2
                    </div>
                    <p className="text-xs text-slate font-medium opacity-40">
                        유니클의 모든 데이터는 귀하의 건강 지표 향상을 위해 암호화되어 관리됩니다.
                    </p>
                </footer>
            </div>
        </ChapterWrapper>
    );
}
