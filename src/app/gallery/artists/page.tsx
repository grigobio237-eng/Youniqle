'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Loader2, Palette, Search } from 'lucide-react';
import { GalleryTabs } from '@/components/gallery/GalleryTabs';
import Link from 'next/link';

interface Artist {
    id: string;
    name: string;
    role: string;
    bio: string;
    image?: string;
    items: any[];
}

export default function ArtistsPage() {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const res = await fetch('/api/gallery');
                const data = await res.json();
                
                const validArtists = data.filter((a: any) => a.items && a.items.length > 0);
                setArtists(validArtists);
            } catch (err) {
                console.error("Failed to load artists:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, []);

    const filteredArtists = artists.filter(artist => 
        artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.bio.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white py-10 md:py-20 px-4 font-sans text-[#121212]">
            <div className="container mx-auto max-w-7xl">
                <GalleryTabs activeTab="artists" />

                {/* Hero Section */}
                <div className="mb-10 md:mb-20 mt-6 md:mt-12">
                    <div className="max-w-4xl">
                        <span className="text-xs md:text-sm font-black tracking-[0.3em] uppercase text-slate/60 mb-2 md:mb-4 block text-center md:text-left">Meet Our Creators</span>
                        <h1 className="font-light mb-4 md:mb-8 tracking-tight font-serif italic text-center md:text-left text-4xl md:text-4xl">참여 작가</h1>
                        <p className="text-sm sm:text-base md:text-lg text-slate/70 font-medium max-w-2xl leading-relaxed italic text-center md:text-left mx-auto md:mx-0">
                            "Youniqle 프로젝트를 함께 만들어가는 특별한 아티스트들의 스토리와 철학을 만나보세요."
                        </p>
                    </div>

                    <div className="mt-6 md:mt-12 relative max-w-2xl mx-auto md:mx-0">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate/40">
                            <Search className="w-6 h-6" />
                        </div>
                        <input 
                            type="text"
                            placeholder="작가 이름을 검색해보세요..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-[30px] h-16 pl-16 pr-8 text-base md:text-lg font-serif italic focus:ring-0 focus:outline-none placeholder:text-slate/30"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-obsidian" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12 md:gap-y-24">
                        {filteredArtists.map((artist, idx) => (
                            <motion.div 
                                key={artist.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.6 }}
                                className="group cursor-pointer"
                            >
                                <Link href={`/gallery/artists/${artist.id}`} className="space-y-4 md:space-y-8 block">
                                    <div className="relative aspect-square overflow-hidden rounded-full max-w-[200px] sm:max-w-[260px] md:max-w-none mx-auto border border-line/10 transition-shadow duration-500 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] grayscale group-hover:grayscale-0 transition-all duration-700">
                                        {artist.image ? (
                                            <Image 
                                                src={artist.image} 
                                                alt={artist.name}
                                                fill
                                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-slate/20">
                                                <Palette className="w-24 h-24" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="text-center space-y-2 md:space-y-4 px-2 md:px-4">
                                        <div className="uppercase text-[11px] font-black tracking-[0.3em] text-chapter-accent">
                                            {artist.role || 'Artist'}
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-light text-obsidian tracking-tight font-serif italic">
                                            {artist.name}
                                        </h2>
                                        <p className="text-slate/60 font-medium text-sm leading-relaxed italic line-clamp-3">
                                            "{artist.bio}"
                                        </p>
                                        
                                        <div className="pt-4 md:pt-6 border-t border-line inline-block mx-auto group-hover:border-chapter-accent transition-colors">
                                            <span className="text-[10px] font-black tracking-widest text-obsidian uppercase group-hover:text-chapter-accent transition-colors">View Artist Profile ({artist.items?.length || 0})</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
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
