'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Unlock, Star, ChevronRight, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface AccessTierCardProps {
    currentTier: 'RESET' | 'REBORN' | 'RESTART';
}

const tierInfo = {
    RESET: {
        name: 'RESET',
        emoji: '🔄',
        color: 'from-slate-400 to-slate-500',
        colorClass: 'bg-slate-100 text-slate-600 border-slate-200',
        next: 'REBORN',
        description: '기본 접근 권한',
        benefits: ['Daily Recovery Gate', 'AI 네비게이터 기본 코칭']
    },
    REBORN: {
        name: 'REBORN',
        emoji: '⚡',
        color: 'from-blue-400 to-indigo-500',
        colorClass: 'bg-blue-100 text-blue-600 border-blue-200',
        next: 'RESTART',
        description: '5층 라운지 접근 가능',
        benefits: ['프라이빗 라운지 접근', 'AI 플랜 설계', '프리미엄 리포트']
    },
    RESTART: {
        name: 'RESTART',
        emoji: '👑',
        color: 'from-purple-400 to-violet-600',
        colorClass: 'bg-purple-100 text-purple-600 border-purple-200',
        next: null,
        description: '최고 권한 보유',
        benefits: ['전용 프라이빗 라운지', 'SAPIENET 랩 투어', '회복 큐레이터 자격']
    },
};

const tierOrder = ['RESET', 'REBORN', 'RESTART'] as const;

export default function AccessTierCard({ currentTier }: AccessTierCardProps) {
    const info = tierInfo[currentTier] || tierInfo.RESET;
    const currentTierIndex = tierOrder.indexOf(currentTier);

    return (
        <Link href="/membership">
            <Card className="h-full premium-card p-6 md:p-8 flex flex-col justify-between border-line relative overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Shield className="w-24 h-24 text-primary" />
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <Badge className={`${info.colorClass} mb-2 border`}>
                                {currentTier}
                            </Badge>
                            <h3 className="text-lg md:text-xl font-black text-obsidian tracking-tight">접근 권한</h3>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl">{info.emoji}</span>
                            <span className="text-[10px] md:text-xs font-bold text-slate block uppercase tracking-widest mt-1">Tier</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Tier Progress Indicator */}
                        <div className="flex gap-2">
                            {tierOrder.map((tier, idx) => (
                                <div
                                    key={tier}
                                    className={`flex-1 h-2 rounded-full transition-all ${idx <= currentTierIndex
                                            ? `bg-gradient-to-r ${info.color}`
                                            : 'bg-slate-200'
                                        }`}
                                />
                            ))}
                        </div>

                        <p className="text-xs text-slate-500 font-medium">
                            <span className="text-obsidian font-bold">{info.description}</span>
                        </p>

                        {/* Benefits Preview */}
                        <ul className="space-y-1">
                            {info.benefits.slice(0, 2).map((benefit, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                                    <Unlock className="w-3 h-3 text-chapter-accent" />
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-6 md:mt-8 pt-6 border-t border-line flex justify-between items-center group-hover:translate-x-1 transition-transform">
                    <span className="text-xs font-bold text-obsidian uppercase tracking-widest flex items-center gap-2">
                        멤버십 상세보기 <ChevronRight className="w-3 h-3" />
                    </span>
                    <div className="flex -space-x-2">
                        {tierOrder.map((tier, idx) => (
                            <div
                                key={tier}
                                className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white flex items-center justify-center ${idx <= currentTierIndex ? tierInfo[tier].colorClass : 'bg-slate-100'
                                    }`}
                            >
                                {idx <= currentTierIndex ? (
                                    <Star className="w-3 h-3 md:w-4 md:h-4" />
                                ) : (
                                    <Lock className="w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </Link>
    );
}
