'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, MessageSquare, ChevronDown, User, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Reply {
    userName: string;
    role: string;
    content: string;
    date: string;
}

interface ReviewItem {
    id: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    date: string;
    content: string;
    isVerified: boolean;
    helpfulCount: number;
    replies?: Reply[];
}

interface PavilionReviewSectionProps {
    targetId: string;
    targetName: string;
}

// Mock Data for Phase 3 Initial Implementation
const MOCK_REVIEWS: Record<string, ReviewItem[]> = {
    'default': [
        {
            id: 'rev-1',
            userName: '서진우',
            rating: 5,
            date: '2024.01.12',
            content: '정말 많은 도움이 되었습니다. 제 고민을 깊이 들어주시고 실질적인 해법을 제시해주셔서 감사합니다.',
            isVerified: true,
            helpfulCount: 12,
            replies: [
                {
                    userName: '김미정 원장',
                    role: 'Representative',
                    content: '진우 님, 소중한 후기 감사합니다. 스스로의 회복력을 믿고 나아가시는 모습이 인상적이었습니다.',
                    date: '2024.01.13'
                }
            ]
        },
        {
            id: 'rev-2',
            userName: '이민아',
            rating: 4,
            date: '2024.01.05',
            content: '상담 분위기가 편안해서 좋았습니다. 다만 예약 시간이 조금 더 다양했으면 좋겠어요.',
            isVerified: true,
            helpfulCount: 5
        }
    ]
};

export default function PavilionReviewSection({ targetId, targetName }: PavilionReviewSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const reviews = MOCK_REVIEWS[targetId] || MOCK_REVIEWS['default'];

    const stats = useMemo(() => {
        const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
        return {
            average: avg.toFixed(1),
            total: reviews.length
        };
    }, [reviews]);

    return (
        <div className="mt-16 border-t border-slate-100 pt-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em] block mb-2">Experiences</span>
                    <h3 className="text-4xl font-black text-obsidian italic tracking-tighter uppercase leading-none">
                        Patient <span className="text-[#D4AF37]">Voices</span>
                    </h3>
                </div>

                <div className="flex items-center gap-8">
                    <button className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full bg-obsidian text-white font-black text-[10px] uppercase tracking-widest hover:bg-[#D4AF37] transition-all">
                        <Star size={12} />
                        Write Review
                    </button>
                    <div className="h-10 w-px bg-slate-100 hidden md:block" />
                    <div className="text-right">
                        <p className="text-[10px] font-black text-obsidian/30 uppercase tracking-widest mb-1">Average Rating</p>
                        <div className="flex items-center gap-2 justify-end">
                            <span className="text-3xl font-black text-obsidian italic">4.9</span>
                            <div className="flex text-[#D4AF37]">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                            </div>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-slate-100 hidden md:block" />
                    <div className="text-right">
                        <p className="text-[10px] font-black text-obsidian/30 uppercase tracking-widest mb-1">Total Reviews</p>
                        <p className="text-3xl font-black text-obsidian italic">{stats.total}</p>
                    </div>
                </div>
            </div>

            {/* Write Review Mobile Button */}
            <div className="md:hidden mb-12">
                <button className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-obsidian text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-obsidian/10">
                    <Star size={14} />
                    Write a Review
                </button>
            </div>

            <div className="space-y-8">
                {reviews.map((review, idx) => (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group relative bg-slate-50/50 rounded-[32px] p-8 md:p-10 border border-transparent hover:border-[#D4AF37]/20 hover:bg-white hover:shadow-2xl hover:shadow-[#D4AF37]/5 transition-all duration-500"
                    >
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* User Info */}
                            <div className="md:w-48 shrink-0 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300">
                                        {review.userAvatar ? <img src={review.userAvatar} className="w-full h-full object-cover rounded-2xl" /> : <User size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-black text-obsidian text-sm tracking-tight">{review.userName}</p>
                                        <p className="text-[10px] font-bold text-obsidian/30">{review.date}</p>
                                    </div>
                                </div>
                                {review.isVerified && (
                                    <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-none font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-tighter flex items-center gap-1.5 w-fit">
                                        <ShieldCheck size={10} />
                                        Verified Experience
                                    </Badge>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-6">
                                <div className="flex text-[#D4AF37] gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} strokeWidth={i < review.rating ? 0 : 2} />
                                    ))}
                                </div>
                                <p className="text-lg font-medium text-obsidian/70 leading-relaxed break-keep">
                                    {review.content}
                                </p>

                                <div className="flex items-center gap-6">
                                    <button className="flex items-center gap-2 text-xs font-black text-obsidian/30 hover:text-[#D4AF37] transition-colors uppercase tracking-widest">
                                        <ThumbsUp size={14} />
                                        Helpful {review.helpfulCount}
                                    </button>
                                    <button className="flex items-center gap-2 text-xs font-black text-obsidian/30 hover:text-obsidian transition-colors uppercase tracking-widest">
                                        <MessageSquare size={14} />
                                        Share
                                    </button>
                                </div>

                                {/* Replies */}
                                {review.replies && review.replies.map((reply, ridx) => (
                                    <div key={ridx} className="bg-white border border-slate-100 rounded-[24px] p-6 mt-8 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-obsidian flex items-center justify-center text-white text-[10px] font-black">
                                                    Y
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black text-obsidian uppercase tracking-tight">{reply.userName}</span>
                                                    <span className="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest ml-2">{reply.role}</span>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-bold text-obsidian/20">{reply.date}</span>
                                        </div>
                                        <p className="text-sm font-medium text-obsidian/60 leading-relaxed">
                                            {reply.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 flex justify-center">
                <button className="group flex items-center gap-4 px-8 py-4 rounded-full border border-slate-100 text-obsidian font-black uppercase tracking-[0.2em] text-[10px] hover:bg-obsidian hover:text-white transition-all">
                    Load More Reviews
                    <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
