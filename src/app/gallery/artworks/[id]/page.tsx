'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Share2, Heart, ShieldCheck } from 'lucide-react';

export default function ArtworkDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [artwork, setArtwork] = useState<any>(null);
    const [loading, setLoading] = useState(true);
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
                            found = { ...hit, artistName: artist.name };
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
            <div className="min-h-screen flex items-center justify-center bg-mist">
                <Loader2 className="w-12 h-12 text-chapter-accent animate-spin" />
            </div>
        );
    }

    if (!artwork) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-mist">
                <h1 className="text-2xl font-black text-obsidian mb-4">작품을 찾을 수 없습니다</h1>
                <Button onClick={() => router.push('/gallery/artworks')} variant="outline">
                    갤러리로 돌아가기
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto max-w-7xl px-4 py-8 md:py-16">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center text-slate font-bold hover:text-obsidian transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    갤러리로 돌아가기
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    {/* Visual Section */}
                    <div className="flex flex-col space-y-4">
                        <div className="relative aspect-[4/5] md:aspect-auto md:h-[700px] w-full bg-mist rounded-3xl overflow-hidden shadow-2xl">
                            {artwork.image ? (
                                <Image
                                    src={artwork.image}
                                    alt={artwork.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-6xl text-slate/30 bg-slate/5">🎨</div>
                            )}
                        </div>
                        <div className="flex justify-between items-center px-4">
                            <span className="text-sm font-bold text-slate flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-status-good" /> 정품 인증 완료
                            </span>
                            <div className="flex gap-4">
                                <button title="Like" className="p-3 bg-mist rounded-full hover:bg-slate/10 transition-colors text-slate hover:text-chapter-accent">
                                    <Heart className="w-5 h-5" />
                                </button>
                                <button title="Share" className="p-3 bg-mist rounded-full hover:bg-slate/10 transition-colors text-slate">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Information Section */}
                    <div className="flex flex-col justify-center">
                        <div className="mb-8">
                            <div className="uppercase text-sm font-black tracking-[0.3em] text-slate mb-4">
                                {artwork.artistName}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-obsidian tracking-tight mb-6 leading-tight">
                                {artwork.title}
                            </h1>
                            <div className="text-xl font-bold text-slate mb-8 flex items-baseline gap-4">
                                <span>{artwork.price}</span>
                                {artwork.rental && (
                                    <span className="text-sm text-chapter-accent bg-chapter-accent/10 px-3 py-1 rounded-full">
                                        렌탈 {artwork.rental}/월
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="bg-mist rounded-[32px] p-8 space-y-6 mb-10 border border-line">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate mb-2">Artwork Details</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-slate uppercase">Material</p>
                                    <p className="font-extrabold text-obsidian text-sm mt-1">{artwork.specs?.material || 'Mixed Media'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate uppercase">Dimensions</p>
                                    <div className="mt-1">
                                        <p className="font-extrabold text-obsidian text-sm">
                                            {artwork.canvasSize || 'Various Dimensions'}
                                        </p>
                                        {artwork.hoSize && (
                                            <p className="text-[11px] font-bold text-slate/60 mt-0.5">{artwork.hoSize}호</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate uppercase">Year</p>
                                    <p className="font-extrabold text-obsidian text-sm mt-1">{artwork.specs?.year || '2025'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate uppercase">Status</p>
                                    <p className={`font-extrabold text-sm mt-1 ${artwork.rentalStatus === 'rented' ? 'text-slate' : 'text-status-good'}`}>
                                        {artwork.rentalStatus === 'rented' ? '대여 중 (예약 가능)' : '즉시 구매/렌탈 가능'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-10">
                            <h3 className="text-lg font-black text-obsidian mb-4">작품 설명</h3>
                            <p className="text-slate font-medium leading-relaxed">
                                {artwork.description || (
                                    <span className="italic text-slate/70">"{artwork.title}"은 작가의 내면의 깊은 힐링 과정을 시각화한 작품입니다. 
                                    복잡한 현대 사회를 살아가는 이들에게 시각적인 평온함과 심리적인 안정을 선사합니다. 
                                    질감과 형태의 조화는 당신의 잃어버린 감각을 재생시키는 특별한 파동을 지니고 있습니다.</span>
                                )}
                            </p>
                        </div>

                        <div className="mt-auto flex flex-col sm:flex-row gap-4">
                            <Button className="flex-1 h-16 rounded-2xl text-lg font-black bg-obsidian text-white hover:bg-obsidian/90 shadow-xl" disabled={artwork.rentalStatus === 'rented'}>
                                {artwork.rentalStatus === 'rented' ? '판매 완료' : '작품 소장하기'}
                            </Button>
                            {artwork.rental && (
                                <Button className="flex-1 h-16 rounded-2xl text-lg font-black border-2 border-chapter-accent text-chapter-accent hover:bg-chapter-accent/5 bg-transparent" disabled={artwork.rentalStatus === 'rented'}>
                                    렌탈 상담 예약
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

