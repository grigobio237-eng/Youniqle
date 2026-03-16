'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Loader2, Search, Heart, LayoutGrid, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { GalleryTabs } from '@/components/gallery/GalleryTabs';
import Link from 'next/link';

interface Artwork {
    id: string;
    title: string;
    description: string;
    image?: string;
    price?: string;
    rental?: string;
    specs?: {
        material?: string;
        year?: string;
    };
    canvasSize?: string;
    rentalStatus?: string;
    artistName: string;
}

export default function ArtworksPage() {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const res = await fetch('/api/gallery');
                const data = await res.json();
                
                const allArtworks: Artwork[] = [];
                data.forEach((artist: any) => {
                    if (artist.items) {
                        artist.items.forEach((item: any) => {
                            if (item.type === 'ARTWORK') {
                                allArtworks.push({
                                    ...item,
                                    artistName: artist.name
                                });
                            }
                        });
                    }
                });

                setArtworks(allArtworks);
            } catch (err) {
                console.error("Failed to load artworks:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, []);

    const filteredArtworks = artworks.filter(art => 
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        art.artistName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination Logic
    const totalPages = Math.max(1, Math.ceil(filteredArtworks.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedArtworks = filteredArtworks.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

    return (
        <div className="min-h-screen bg-white py-20 px-4 font-sans text-[#121212]">
            <div className="container mx-auto max-w-7xl">
                <GalleryTabs activeTab="artworks" />
                
                {/* Hero Section */}
                <div className="mb-20 mt-12">
                    <div className="max-w-4xl">
                        <span className="text-sm font-black tracking-[0.3em] uppercase text-slate/60 mb-4 block">Arts Factory Curation</span>
                        <h1 className="text-6xl md:text-7xl font-light mb-8 tracking-tight font-serif italic">전체 컬렉션</h1>
                        <p className="text-slate/70 font-medium text-lg max-w-2xl leading-relaxed italic">
                            "아츠팩토리가 큐레이션한 모든 작품들을 한자리에서 만나보세요."
                        </p>
                    </div>

                    {/* Search Bar - Arts Factory Style */}
                    <div className="mt-12 relative max-w-2xl">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate/40">
                            <Search className="w-6 h-6" />
                        </div>
                        <input 
                            type="text"
                            placeholder="작품명 또는 작가명을 검색해보세요..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-[30px] h-16 pl-16 pr-8 text-lg font-serif italic focus:ring-0 focus:outline-none placeholder:text-slate/30"
                        />
                    </div>

                    {/* Filter Bar - Simplified */}
                    <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-line pb-6 pt-2">
                        {['장르', '스타일', '주제', '공간', '색상', '가격', '크기'].map(filter => (
                            <button key={filter} className="text-[11px] font-black uppercase tracking-wider text-slate hover:text-obsidian transition-colors flex items-center gap-1">
                                {filter} <span className="text-[8px] opacity-30 italic font-light">전체</span>
                            </button>
                        ))}
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="text-[11px] font-black text-slate uppercase ml-auto flex items-center gap-2 hover:text-chapter-accent transition-colors"
                        >
                            <RotateCcw className="w-3 h-3" /> RESET
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-obsidian" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                            {paginatedArtworks.map((art, idx) => (
                                <motion.div 
                                    key={art.id} 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05, duration: 0.5 }}
                                    className="group cursor-pointer"
                                >
                                    <Link href={`/gallery/artworks/${art.id}`} className="block">
                                        <div className="relative aspect-[3/4] mb-6 overflow-hidden rounded-[20px] bg-gray-100 transition-shadow duration-500 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                                            {art.image ? (
                                                <Image 
                                                    src={art.image} 
                                                    alt={art.title}
                                                    fill
                                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-4xl text-slate/30">🎨</div>
                                            )}
                                            
                                            {/* Hover Overlay - Arts Factory Style */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] flex flex-col justify-end p-8 text-white">
                                                <div className="absolute top-6 right-6 flex flex-col gap-3">
                                                    <button title="Like" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-obsidian transition-all">
                                                        <Heart className="w-5 h-5" />
                                                    </button>
                                                    <button title="View Detail" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-obsidian transition-all">
                                                        <LayoutGrid className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                <div className="space-y-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">회화</p>
                                                    <h3 className="text-2xl font-light font-serif italic leading-tight">{art.title}</h3>
                                                    <p className="text-sm font-medium opacity-80 mb-4">{art.artistName}</p>
                                                    
                                                    <div className="pt-4 border-t border-white/20 flex flex-col gap-1">
                                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                                                            <span>월 렌탈료</span>
                                                            <span className="text-sm">₩ {art.rental || '문의'}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter opacity-60">
                                                            <span>구매가</span>
                                                            <span className="text-xs">₩ {art.price}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Text Info - Arts Factory Style */}
                                        <div className="space-y-1.5 px-2">
                                            <h3 className="text-lg font-bold text-obsidian leading-tight tracking-tight">
                                                {art.title}
                                            </h3>
                                            <div className="flex justify-between items-baseline">
                                                <p className="text-xs font-bold text-slate/60 uppercase tracking-widest leading-none">
                                                    {art.artistName}
                                                </p>
                                                <span className="text-[10px] font-medium text-slate/40 tracking-tighter">회화</span>
                                            </div>
                                            <div className="pt-2 flex flex-col gap-0.5">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-slate/40 uppercase tracking-tighter">월 렌탈료</span>
                                                    <span className="text-[11px] font-black text-obsidian">₩ {art.rental || '문의'}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-slate/40 uppercase tracking-tighter">구매가</span>
                                                    <span className="text-[11px] font-black text-chapter-accent">₩ {art.price}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination UI - Match Arts Factory */}
                        {totalPages > 1 && (
                            <div className="mt-32 flex items-center justify-center gap-6 border-t border-line pt-12">
                                <button 
                                    title="Previous Page"
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className={`p-1 transition-colors ${currentPage === 1 ? 'opacity-10 cursor-not-allowed' : 'hover:text-chapter-accent'}`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }).map((_, i) => {
                                        const pageNum = i + 1;
                                        const isFirst = pageNum === 1;
                                        const isLast = pageNum === totalPages;
                                        const isCurrent = pageNum === currentPage;
                                        const isNear = Math.abs(pageNum - currentPage) <= 1;

                                        if (isFirst || isLast || isCurrent || isNear) {
                                            return (
                                                <button
                                                    key={i}
                                                    title={`Page ${pageNum}`}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold transition-all duration-300 ${
                                                        isCurrent 
                                                            ? 'bg-obsidian text-white shadow-lg' 
                                                            : 'text-slate/40 hover:text-obsidian'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        }

                                        if (
                                            (pageNum === 2 && currentPage > 3) ||
                                            (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                                        ) {
                                            return <span key={i} className="text-slate/30 px-1">...</span>;
                                        }

                                        return null;
                                    })}
                                </div>

                                <button 
                                    title="Next Page"
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className={`p-1 transition-colors ${currentPage === totalPages ? 'opacity-10 cursor-not-allowed' : 'hover:text-chapter-accent'}`}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
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
