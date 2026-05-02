'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Activity, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface ActionableInsightCardProps {
    type: 'posture' | 'meal';
    insight: {
        title: string;
        description: string;
        habits?: string[];
        exercises?: Array<{ title: string; visualType: string; link: string }>;
        suggestion?: string;
    };
}

export default function ActionableInsightCard({ type, insight }: ActionableInsightCardProps) {
    const isPosture = type === 'posture';

    return (
        <Card className="rounded-[40px] border-none overflow-hidden bg-obsidian text-mist shadow-2xl relative group">
            <div className={`absolute top-0 right-0 w-32 h-32 ${isPosture ? 'bg-chapter-accent/20' : 'bg-reward-gold/20'} rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700`} />
            
            <CardContent className="p-10 space-y-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${isPosture ? 'bg-chapter-accent/20 text-chapter-accent' : 'bg-reward-gold/20 text-reward-gold'}`}>
                        {isPosture ? <Activity className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Insight Focus</span>
                        <h3 className="text-xl font-black tracking-tight">{insight.title}</h3>
                    </div>
                </div>

                <p className="text-lg font-medium leading-relaxed italic opacity-80">
                    "{insight.description}"
                </p>

                <div className="space-y-6">
                    {/* Habit Checklist or Recommendation */}
                    {isPosture && insight.habits && (
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-chapter-accent flex items-center gap-2">
                                <BookOpen className="w-3 h-3" /> Core Habits
                            </h4>
                            <div className="space-y-2">
                                {insight.habits?.map((habit, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                                        <div className="w-2 h-2 rounded-full bg-chapter-accent" />
                                        <span className="text-sm font-bold">{habit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {insight.suggestion && (
                        <div className="p-6 bg-reward-gold/10 rounded-3xl border border-reward-gold/20 italic text-reward-gold font-bold">
                            "{insight.suggestion}"
                        </div>
                    )}
                </div>

                {isPosture && insight.exercises && (
                    <div className="pt-4 border-t border-white/10 flex flex-wrap gap-3">
                        {insight.exercises?.map((ex, idx) => (
                            <Button 
                                key={idx}
                                asChild
                                className="bg-chapter-accent hover:bg-chapter-accent/80 text-white rounded-xl font-black italic text-xs h-12 px-6"
                            >
                                <Link href={ex.link}>
                                    {ex.visualType === 'WEBTOON' ? '🎨 웹툰 가이드' : '📷 이미지 가이드'} : {ex.title}
                                </Link>
                            </Button>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
