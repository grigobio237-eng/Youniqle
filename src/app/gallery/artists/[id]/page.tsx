'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Loader2, Palette, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ArtistDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [artist, setArtist] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const id = params?.id;

    useEffect(() => {
        const fetchArtist = async () => {
            if (!id) return;
            try {
                const res = await fetch('/api/gallery');
                const data = await res.json();
                
                const found = data.find((a: any) => a.id === id);
                setArtist(found);
            } catch (err) {
                console.error("Failed to load artist detail", err);
            } finally {
                setLoading(false);
            }
        };

        fetchArtist();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-12 h-12 text-chapter-accent animate-spin" />
            </div>
        );
    }

    if (!artist) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
                <h1 className="text-3xl font-light font-serif italic text-obsidian mb-6">작가를 찾을 수 없습니다</h1>
                <Button onClick={() => router.push('/gallery/artists')} variant="outline" className="rounded-full px-8">
                    목록으로 돌아가기
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-32">
            <div className="container mx-auto max-w-7xl px-4 py-6 md:py-12">
                {/* Navigation */}
                <button 
                    onClick={() => router.back()}
                    className="flex items-center text-slate font-bold hover:text-obsidian transition-colors mb-8 md:mb-16 group"
                >
                    <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm uppercase tracking-widest font-black">Artists Lobby</span>
                </button>

                {/* Artist Profile Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-24 items-start mb-12 md:mb-32">
                    <div className="lg:col-span-4 flex flex-col items-center lg:items-start">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative w-64 h-64 md:w-80 md:h-80 overflow-hidden rounded-full shadow-2xl mb-4 md:mb-8 group"
                        >
                            {artist.image ? (
                                <Image
                                    src={artist.image}
                                    alt={artist.name}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-slate/20">
                                    <Palette className="w-32 h-32" />
                                </div>
                            )}
                        </motion.div>
                    </div>

                    <div className="lg:col-span-8 space-y-6 md:space-y-8">
                        <div>
                            <motion.span 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-block uppercase text-xs font-black tracking-[0.4em] text-chapter-accent mb-2 md:mb-4"
                            >
                                {artist.role || 'Featured Artist'}
                            </motion.span>
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl md:text-7xl font-light text-obsidian tracking-tight font-serif italic"
                            >
                                {artist.name}
                            </motion.h1>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="max-w-2xl border-l-2 border-line pl-6 md:pl-8 w-full"
                        >
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate mb-3 md:mb-6">Biography & Statement</h3>
                            <StructuredBio bio={artist.bio} />
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="pt-4 md:pt-8 flex gap-6"
                        >
                            <div className="flex flex-col items-center lg:items-start">
                                <span className="text-3xl font-light font-serif text-obsidian">{artist.items?.length || 0}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate/40">Artworks</span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Artworks Grid Section */}
                <section>
                    <div className="flex items-center justify-between mb-8 md:mb-16">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-light text-obsidian font-serif italic">Gallery Collection</h2>
                            <p className="text-sm font-bold text-slate/40 tracking-wider">WORKS BY {artist.name.toUpperCase()}</p>
                        </div>
                        <div className="h-px flex-1 bg-line mx-12 hidden md:block" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-10 sm:gap-y-16">
                        {artist.items?.map((item: any, idx: number) => (
                            <motion.div 
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group"
                            >
                                <Link href={`/gallery/artworks/${item.id}`} className="block">
                                    <div className="relative aspect-[3/4] mb-4 md:mb-6 overflow-hidden rounded-[20px] md:rounded-[32px] bg-mist shadow-sm transition-all duration-500 group-hover:shadow-2xl">
                                        {item.image ? (
                                            <Image 
                                                src={item.image} 
                                                alt={item.title}
                                                fill
                                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                                sizes="(max-width: 768px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-slate/20">
                                                <ImageIcon className="w-8 h-8 md:w-12 md:h-12" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-obsidian/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <div className="w-9 h-9 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center text-obsidian scale-75 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
                                                <ExternalLink className="w-4 h-4 md:w-5 md:h-5 text-obsidian" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-1 md:px-2 space-y-1.5 md:space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="text-sm sm:text-lg md:text-xl font-serif italic text-obsidian leading-tight group-hover:text-chapter-accent transition-colors line-clamp-2">{item.title}</h3>
                                            <span className="text-[8px] md:text-[10px] font-black text-slate/30 uppercase tracking-tighter shrink-0 pt-1">{item.specs?.year}</span>
                                        </div>
                                        <div className="pt-1.5 md:pt-2 flex justify-between items-center border-t border-line/50 text-[10px] md:text-xs">
                                            <span className="text-[9px] md:text-[10px] text-slate/50 font-bold uppercase tracking-wider line-clamp-1">{item.specs?.material || 'Mixed Media'}</span>
                                            <span className="text-[10px] md:text-[11px] font-black text-obsidian">₩ {item.price}</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {(!artist.items || artist.items.length === 0) && (
                        <div className="text-center py-32 border-2 border-dashed border-line rounded-[40px]">
                            <ImageIcon className="w-16 h-16 text-slate/20 mx-auto mb-6" />
                            <p className="text-lg font-serif italic text-slate/60">현재 등록된 작품이 없습니다.</p>
                        </div>
                    )}
                </section>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');
                
                .font-serif {
                    font-family: 'Cormorant Garamond', serif;
                }
            `}</style>
        </div>
    );
}

// --- Helper Components ---

function StructuredBio({ bio }: { bio: string }) {
    if (!bio) return null;

    // Normalizing newlines
    const lines = bio.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

    // Fallback: if lines are squashed but separated by ' / ', split them
    let processedLines = lines;
    if (lines.length <= 2 && bio.includes(' / ')) {
        processedLines = bio.split(' / ').map(item => item.trim()).filter(Boolean);
    }

    return (
        <div className="space-y-4">
            {processedLines.map((line, idx) => {
                // Determine if this line represents a sub-header (e.g. contains exhibition category or degree category)
                const isHeader = line.includes('개인전') || 
                                 line.includes('단체전') || 
                                 line.includes('학력') || 
                                 line.includes('경력') || 
                                 line.includes('수상') || 
                                 line.includes('초대전') || 
                                 line.includes('기획전') || 
                                 line.includes('그룹전') ||
                                 line.includes('협회전') ||
                                 line.includes('Artworks') ||
                                 line.includes('Biography');

                return (
                    <div key={idx} className={`relative pl-5 ${isHeader ? 'mt-8 first:mt-0' : ''}`}>
                        {/* Decorative bullet or timeline point */}
                        <div className={`absolute left-0 top-2.5 w-1.5 h-1.5 rounded-full ${isHeader ? 'bg-chapter-accent scale-125' : 'bg-slate/30'}`} />
                        <p className={`font-sans tracking-tight text-left leading-relaxed ${isHeader ? 'text-obsidian font-bold text-sm md:text-base font-serif italic' : 'text-slate/60 text-xs sm:text-sm'}`}>
                            {line}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
