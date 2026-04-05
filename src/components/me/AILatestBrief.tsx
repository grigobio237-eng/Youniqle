'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, ArrowRight, Activity, Moon, Utensils, Dumbbell } from 'lucide-react';
import Link from 'next/link';

interface AILatestBriefProps {
    solution: any;
    createdAt?: string;
}

export default function AILatestBrief({ solution, createdAt }: AILatestBriefProps) {
    if (!solution) return null;

    const items = [
        { icon: Dumbbell, title: "Exercise", content: solution.exercise, color: "text-blue-500", bg: "bg-blue-50" },
        { icon: Utensils, title: "Nutrition", content: solution.nutrition, color: "text-green-500", bg: "bg-green-50" },
        { icon: Moon, title: "Sleep", content: solution.sleep, color: "text-indigo-500", bg: "bg-indigo-50" },
    ];

    return (
        <div className="bg-obsidian rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-2xl relative overflow-hidden text-white group h-full">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                        <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">AI Weekly Brief</p>
                        <h3 className="text-xl font-black tracking-tight">AI 맞춤 리커버리 요약</h3>
                    </div>
                </div>
                {createdAt && (
                    <span className="text-[10px] font-bold text-white/60">
                        {new Date(createdAt).toLocaleDateString()}
                    </span>
                )}
            </div>

            <p className="text-sm font-medium text-slate-300 leading-relaxed mb-8 relative z-10 line-clamp-2">
                {solution.analysis}
            </p>

            <div className="grid grid-cols-1 gap-4 relative z-10 mb-8">
                {items.slice(0, 2).map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-[24px] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                            <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black opacity-70 uppercase mb-1">{item.title}</p>
                            <p className="text-xs font-bold leading-snug line-clamp-1">{item.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            <Link href="/diagnosis/report" className="relative z-10 w-full py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
                View Full Report <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
}
