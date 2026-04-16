'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
    ArrowLeft, Loader2, Share2, Heart, ShieldCheck, 
    X, Maximize2, ChevronLeft, Info, BadgeCheck, 
    ArrowUpRight, Download, MousePointer2
} from 'lucide-react';

export default function ArtworkDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [artwork, setArtwork] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isZoomed, setIsZoomed] = useState(false);
    const id = params?.id;

    useEffect(() => {
        const fetchArtwork = async () => {
            if (!id) return;
            try {
                const res = await fetch('/api/gallery');
                const data = await res.json();
                
                let found: any;
                for (const artist of data as any[]) {
                    if (artist.items) {
                        const hit = (artist.items as any[]).find((item: any) => item.id === id);
                        if (hit) {
                            found = { 
                                ...hit, 
                                artistName: artist.name,
                                artistBio: artist.bio,
                                artistImage: artist.image 
                            };
                            break;
                        }
                    }
                }
                setArtwork(found);
            } catch (err) {
                console.error("Failed to load artwork detail", err);
            } finally {
                setLoading(false);
            }
        };

        fetchArtwork();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-12 h-12 text-chapter-accent animate-spin" />
            </div>
        );
    }

    if (!artwork) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <h1 className="text-2xl font-serif italic text-obsidian mb-8">작품을 찾을 수 없습니다</h1>
                <Button onClick={() => router.push('/gallery/artworks')} variant="outline" className="rounded-full px-8">
                    아카이브로 돌아가기
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-obsidian selection:bg-chapter-accent selection:text-white">
            <div className="container mx-auto max-w-7xl px-4 py-12 md:py-24">
                
                {/* Navigation Header */}
                <div className="max-w-7xl mx-auto mb-16">
                    <div className="flex justify-between items-center bg-gray-50/50 rounded-[40px] px-8 py-4 border border-line/10">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-3 text-slate hover:text-obsidian transition-all font-black text-[10px] tracking-[0.3em] uppercase group"
                        >
                            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Back to Archive
                        </button>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate/40 uppercase tracking-widest hidden md:block">Arts Factory Certified</span>
                            <div className="flex gap-2">
                                <button title="Share" aria-label="Share artwork" className="p-3 hover:bg-white rounded-full transition-colors text-slate"><Share2 className="w-4 h-4" /></button>
                                <button title="Like" aria-label="Add to favorites" className="p-3 hover:bg-white rounded-full transition-colors text-slate"><Heart className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                    
                    {/* Visual Section - Protection Enabled */}
                    <div className="space-y-8 sticky top-32">
                        <div 
                            className="relative aspect-[3/4] rounded-[40px] overflow-hidden shadow-2xl cursor-zoom-in group select-none"
                            onContextMenu={(e) => e.preventDefault()}
                            onClick={() => setIsZoomed(true)}
                        >
                            <Image
                                src={artwork.image}
                                alt={artwork.title}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority
                                draggable={false}
                            />
                            {/* Texture/Grain Overlay */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/pinstripe-light.png')]" />
                            
                            {/* Hover UI */}
                            <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/10 transition-colors duration-500 overflow-hidden flex items-center justify-center">
                                <div className="bg-white/95 backdrop-blur-md p-5 rounded-full scale-0 group-hover:scale-100 transition-all duration-500 shadow-2xl">
                                    <Maximize2 className="w-6 h-6 text-obsidian" />
                                </div>
                            </div>

                            {/* Corner Badges */}
                            <div className="absolute top-8 left-8">
                                <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-obsidian shadow-lg">
                                    {artwork.category}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xs font-bold text-slate uppercase tracking-widest opacity-60">
                            <span className="flex items-center gap-2">
                                <BadgeCheck className="w-4 h-4 text-status-good" /> Youniqle Certified Original
                            </span>
                            <span className="font-serif italic capitalize">Ref No. {artwork.id.slice(-8).toUpperCase()}</span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col pt-4">
                        <div className="border-b border-line/50 pb-12 mb-12">
                            <Reveal delay={0.1}>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-mist relative border border-line/20">
                                        <Image src={artwork.artistImage || "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80"} alt={artwork.artistName} fill className="object-cover" />
                                    </div>
                                    <span className="text-xs font-black tracking-[0.4em] text-slate uppercase">{artwork.artistName}</span>
                                </div>
                            </Reveal>
                            
                            <Reveal delay={0.2}>
                                <h1 className="text-5xl md:text-7xl font-serif font-light italic tracking-tighter leading-[1.1] text-obsidian mb-8">
                                    {artwork.title}
                                </h1>
                            </Reveal>

                            <Reveal delay={0.3}>
                                <div className="flex flex-wrap gap-3">
                                    {['정품인증', artwork.style, artwork.subject, artwork.space].filter(v => v && v !== 'None' && v !== 'All').map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-gray-50 text-[10px] font-bold text-slate/60 uppercase tracking-tighter rounded-full border border-line/5">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </Reveal>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 gap-y-12 gap-x-12 mb-16">
                            <Reveal delay={0.4}>
                                <div>
                                    <h2 className="text-[10px] uppercase tracking-[0.4em] text-slate/40 mb-4 font-black">Dimensions</h2>
                                    <div className="space-y-1">
                                        <p className="font-black text-xl text-obsidian tracking-tighter italic font-serif">
                                            {artwork.canvasSize}
                                        </p>
                                        <p className="text-[11px] font-bold text-slate/40 tracking-widest">{artwork.specs?.ho || 0}호</p>
                                    </div>
                                </div>
                            </Reveal>
                            <Reveal delay={0.45}>
                                <div>
                                    <h2 className="text-[10px] uppercase tracking-[0.4em] text-slate/40 mb-4 font-black">Specifications</h2>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center border-b border-line/20 pb-2">
                                            <span className="text-[11px] text-slate/40 font-bold uppercase tracking-tighter">Material</span>
                                            <span className="text-xs text-obsidian font-black">{artwork.specs?.material || 'Mixed Media'}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-line/20 pb-2">
                                            <span className="text-[11px] text-slate/40 font-bold uppercase tracking-tighter">Year</span>
                                            <span className="text-xs text-obsidian font-black">{artwork.specs?.year || '2025'}</span>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        </div>

                        {/* Description */}
                        <Reveal delay={0.5}>
                            <div className="mb-20">
                                <h2 className="text-[10px] uppercase tracking-[0.4em] text-slate/40 mb-6 font-black">Description</h2>
                                <p className="font-serif italic leading-loose text-slate/80 text-lg sm:text-xl whitespace-pre-wrap max-w-xl">
                                    {artwork.description || "이 작품에 대한 상세 설명이 준비 중입니다."}
                                </p>
                            </div>
                        </Reveal>

                        {/* Pricing & CTA */}
                        <div className="bg-gray-50 rounded-[40px] p-8 lg:p-12 mb-12">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-12">
                                <div className="space-y-2">
                                    <span className="text-[10px] text-slate/40 font-black uppercase tracking-[0.3em] block">Estimated Value</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-obsidian/30 tracking-tighter italic font-serif group-hover:opacity-100 transition-opacity">₩ {artwork.price}</span>
                                    </div>
                                </div>
                                <div className="space-y-2 sm:border-l sm:border-line/20 sm:pl-12">
                                    <span className="text-[10px] text-chapter-accent font-black uppercase tracking-[0.3em] block">Monthly Rental</span>
                                    <span className="text-4xl font-black text-obsidian tracking-tighter italic font-serif">₩ {artwork.rental || '문의'}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button className="w-full h-20 bg-obsidian text-white rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-chapter-accent transition-all duration-500 shadow-xl flex items-center justify-center gap-4 group">
                                    작품 소장 및 렌탈 상담하기 <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                                
                                <div className="pt-8 mt-8 border-t border-line/20">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-obsidian mb-4 underline underline-offset-4">Notice (비고)</h3>
                                    <ul className="text-[11px] font-bold text-slate/50 space-y-3">
                                        <li className="flex gap-3 leading-relaxed tracking-tight">
                                            <span className="text-obsidian">•</span> 
                                            <span>렌탈 서비스는 거치 기간 없이 3개월 단위로 큐레이션 교체가 가능합니다.</span>
                                        </li>
                                        <li className="flex gap-3 leading-relaxed tracking-tight">
                                            <span className="text-obsidian">•</span> 
                                            <span>운송 및 전문 설치 서비스가 포함되어 있습니다. (서울/경기 외 지역 별도 문의)</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Zoom Overlay */}
            <AnimatePresence>
                {isZoomed && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-obsidian text-white flex items-center justify-center p-4 md:p-12 cursor-zoom-out select-none"
                        onClick={() => setIsZoomed(false)}
                    >
                        <motion.button 
                            title="Close zoom view"
                            aria-label="Close zoom view"
                            className="absolute top-12 right-12 z-[100] text-white/40 hover:text-white transition-colors"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            onClick={() => setIsZoomed(false)}
                        >
                            <X className="w-12 h-12" />
                        </motion.button>

                        <motion.div 
                            className="relative w-full h-full"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", damping: 30 }}
                        >
                            <Image
                                src={artwork.image}
                                alt={artwork.title}
                                fill
                                className="object-contain"
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                            />
                        </motion.div>
                        
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-[0.5em] uppercase text-white/20">
                            Arts Factory Visual Intelligence Protection
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Styling */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');
                .font-serif { font-family: 'Cormorant Garamond', serif; }
            `}</style>
        </div>
    );
}

// --- Helper Components ---

function Reveal({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            {children}
        </motion.div>
    );
}
