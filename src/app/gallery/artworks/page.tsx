'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
    Loader2, Search, Heart, LayoutGrid, RotateCcw, 
    ChevronLeft, ChevronRight, Star, ArrowUpRight, 
    X, Filter, MousePointer2 
} from 'lucide-react';
import { GalleryTabs } from '@/components/gallery/GalleryTabs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- Constants (Synced with Artfactory) ---
const GENRES = ['회화', '판화 및 에디션', '드로잉 및 스케치', '사진', '조각 및 설치', '디지털 아트', '기타'];
const STYLES = ['추상', '구상/재현', '팝 아트', '미니멀리즘', '인상주의', '초현실주의', '기타'];
const SUBJECTS = ['풍경', '인물', '정물', '동물', '기하학', '일상/사회', '기타'];
const SPACES = ['거실용', '침실용', '아이방', '사무실/카페'];
const SEASONS = ['봄', '여름', '가을', '겨울', '사계절'];

interface Artwork {
    id: string;
    title: string;
    description: string;
    image?: string;
    price?: string;
    rental?: string;
    isCurated: boolean;
    category: string;
    style: string;
    subject: string;
    space: string;
    season: string;
    specs?: {
        material?: string;
        year?: string;
        size?: string;
        ho?: number;
    };
    canvasSize?: string;
    rentalStatus?: string;
    artistName: string;
}

interface Artist {
    id: string;
    name: string;
    bio: string;
    image?: string;
    isSpotlight: boolean;
    specialty: string;
    items: Artwork[];
}

export default function ArtworksPage() {
    const router = useRouter();

    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filtering State
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        genre: 'All',
        style: 'All',
        subject: 'All',
        space: 'All',
        season: 'All',
        price: 'All',
        size: 'All'
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const res = await fetch('/api/gallery');
                const data = await res.json();
                setArtists(data);
            } catch (err) {
                console.error("Failed to load gallery hub:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchGallery();
    }, []);

    // Flatten all artworks
    const allArtworks = useMemo(() => {
        const artworks: Artwork[] = [];
        artists.forEach(artist => {
            artist.items.forEach(item => {
                artworks.push({
                    ...item,
                    artistName: artist.name
                });
            });
        });
        return artworks;
    }, [artists]);

    // Derived Data for Sections
    const curatedArtworks = useMemo(() => allArtworks.filter(a => a.isCurated).slice(0, 5), [allArtworks]);
    const spotlightArtist = useMemo(() => artists.find(a => a.isSpotlight) || artists[0], [artists]);

    // Filtering Logic
    const filteredArtworks = useMemo(() => {
        return allArtworks.filter(art => {
            const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                art.artistName.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesGenre = filters.genre === 'All' || art.category === filters.genre;
            const matchesStyle = filters.style === 'All' || art.style === filters.style;
            const matchesSubject = filters.subject === 'All' || art.subject === filters.subject;
            const matchesSpace = filters.space === 'All' || art.space === filters.space;
            const matchesSeason = filters.season === 'All' || art.season === filters.season;
            
            // Simplified Size check
            let matchesSize = true;
            if (filters.size !== 'All') {
                const ho = art.specs?.ho || 0;
                if (filters.size === 'S') matchesSize = ho <= 10;
                else if (filters.size === 'M') matchesSize = ho > 10 && ho <= 30;
                else if (filters.size === 'L') matchesSize = ho > 30 && ho <= 60;
                else if (filters.size === 'XL') matchesSize = ho > 60;
            }

            return matchesSearch && matchesGenre && matchesStyle && matchesSubject && matchesSpace && matchesSeason && matchesSize;
        });
    }, [allArtworks, searchQuery, filters]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredArtworks.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedArtworks = filteredArtworks.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filters]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setFilters({
            genre: 'All',
            style: 'All',
            subject: 'All',
            space: 'All',
            season: 'All',
            price: 'All',
            size: 'All'
        });
        setSearchQuery('');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <Loader2 className="w-12 h-12 animate-spin text-obsidian mb-4" />
                <p className="text-sm font-bold text-slate/40 tracking-widest uppercase">Recovery Gallery Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans text-[#121212] overflow-x-hidden">
            <div className="container mx-auto max-w-7xl px-4 py-20 pb-40">
                <GalleryTabs activeTab="artworks" />

                {/* 1. Hub Hero - Featured Section (Curated) */}
                {curatedArtworks.length > 0 && (
                    <section className="mt-16 mb-32">
                        <Reveal delay={0.1}>
                            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
                                <div className="max-w-2xl">
                                    <span className="text-xs font-black tracking-[0.4em] text-chapter-accent uppercase mb-4 block">Selection Series</span>
                                    <h2 className="text-6xl md:text-8xl font-light tracking-tighter font-serif italic leading-none">
                                        The Recovery <br /> Archive
                                    </h2>
                                </div>
                                <div className="hidden md:block w-32 h-[1px] bg-slate/20 mb-6" />
                            </div>
                        </Reveal>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            <div className="lg:col-span-7">
                                <Reveal delay={0.2}>
                                    <Link href={`/gallery/artworks/${curatedArtworks[0].id}`}>
                                        <div className="relative aspect-[4/3] rounded-[40px] overflow-hidden group shadow-2xl">
                                            <Image 
                                                src={curatedArtworks[0].image || ''} 
                                                alt={curatedArtworks[0].title}
                                                fill
                                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                                priority
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-12">
                                                <span className="text-xs font-bold text-white/60 mb-2 uppercase tracking-[0.2em]">Featured Artwork</span>
                                                <h3 className="text-4xl font-serif italic text-white">{curatedArtworks[0].title}</h3>
                                            </div>
                                        </div>
                                    </Link>
                                </Reveal>
                            </div>
                            <div className="lg:col-span-5 flex flex-col gap-12">
                                {curatedArtworks.slice(1, 3).map((art, idx) => (
                                    <Reveal key={art.id} delay={0.3 + idx * 0.1}>
                                        <Link href={`/gallery/artworks/${art.id}`} className="group flex items-center gap-8 bg-gray-50 p-6 rounded-[30px] hover:bg-mist transition-colors">
                                            <div className="relative w-32 h-32 rounded-2xl overflow-hidden shrink-0">
                                                <Image src={art.image || ''} alt={art.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-chapter-accent uppercase tracking-widest mb-1 block">Highlight 0{idx + 2}</span>
                                                <h4 className="text-xl font-serif italic mb-2">{art.title}</h4>
                                                <p className="text-xs font-bold text-slate/40 uppercase tracking-tighter">{art.artistName}</p>
                                            </div>
                                            <ArrowUpRight className="w-5 h-5 ml-auto text-slate/20 group-hover:text-chapter-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                        </Link>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* 2. Artist Spotlight Section */}
                {spotlightArtist && (
                    <section className="bg-obsidian text-white rounded-[40px] lg:rounded-[60px] p-8 sm:p-12 lg:p-24 mb-20 lg:mb-32 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none text-[20vw] font-black italic whitespace-nowrap -translate-y-1/2 translate-x-1/4">
                            SPOTLIGHT
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-32 items-center relative z-10">
                            <Reveal delay={0.1}>
                                <Link href={`/gallery/artists/${spotlightArtist.id}`} className="block group/img relative max-w-md mx-auto lg:mx-0">
                                    <div className="aspect-[3/4] rounded-[30px] md:rounded-[40px] overflow-hidden border border-white/10 p-3 md:p-4 bg-white/5 backdrop-blur-sm transition-all duration-500 group-hover/img:border-chapter-accent/30 group-hover/img:shadow-chapter-accent/10">
                                        <Image 
                                            src={spotlightArtist.image || "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2067&auto=format&fit=crop"} 
                                            alt={spotlightArtist.name} 
                                            fill 
                                            className="object-cover rounded-[20px] md:rounded-[30px] grayscale-[20%] group-hover/img:grayscale-0 group-hover/img:scale-[1.03] transition-all duration-1000" 
                                        />
                                    </div>
                                    <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 w-32 h-32 md:w-40 md:h-40 bg-chapter-accent rounded-full flex flex-col items-center justify-center text-obsidian shadow-2xl rotate-12 transition-transform duration-500 group-hover/img:scale-105 group-hover/img:rotate-6">
                                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tight text-center leading-tight">Artist <br /> Spotlight</span>
                                    </div>
                                </Link>
                            </Reveal>

                            <div className="space-y-8 lg:space-y-12">
                                <Reveal delay={0.2}>
                                    <div className="space-y-6">
                                        <span className="text-xs font-black tracking-[0.5em] text-chapter-accent uppercase block">이달의 추천 작가</span>
                                        <h2 className="text-4xl sm:text-7xl lg:text-9xl font-serif font-light italic leading-none tracking-tighter">
                                            {spotlightArtist.name}
                                        </h2>
                                        <Link href={`/gallery/artists/${spotlightArtist.id}`} className="block group/bio">
                                            <p className="text-sm sm:text-base lg:text-xl text-white/50 group-hover/bio:text-white/80 transition-colors font-serif italic leading-relaxed max-w-xl line-clamp-4 lg:line-clamp-6">
                                                {spotlightArtist.bio}
                                            </p>
                                            <span className="text-[10px] text-chapter-accent font-black tracking-widest uppercase mt-3 inline-flex items-center gap-1 opacity-60 group-hover/bio:opacity-100 transition-opacity">
                                                자세히 보기 <ArrowUpRight className="w-3 h-3" />
                                            </span>
                                        </Link>
                                    </div>
                                </Reveal>
                                
                                <Reveal delay={0.3}>
                                    <div className="flex flex-wrap gap-4 pt-8 border-t border-white/10">
                                        <Link href={`/gallery/artists/${spotlightArtist.id}`} className="group inline-flex items-center gap-6 px-10 py-5 bg-white text-obsidian rounded-full text-xs font-black uppercase tracking-widest hover:bg-chapter-accent transition-all duration-500">
                                            포트폴리오 전체보기 <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </Link>
                                    </div>
                                </Reveal>
                            </div>
                        </div>
                    </section>
                )}

                {/* 3. Browse Archive (The Grid) */}
                <section id="archive">
                    <Reveal delay={0.1}>
                        <div className="mb-16">
                            <span className="text-xs font-black tracking-[0.4em] text-slate/40 uppercase mb-4 block">Archive Hub</span>
                            <h2 className="text-6xl font-light font-serif italic tracking-tighter">전체 아카이브</h2>
                        </div>
                    </Reveal>

                    {/* Filter & Search Bar */}
                    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl pt-4 pb-8 mb-16 border-b border-line">
                        <div className="flex flex-col space-y-8">
                            {/* Search */}
                            <div className="relative max-w-xl group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate/30 group-focus-within:text-obsidian transition-colors">
                                    <Search className="w-6 h-6" />
                                </div>
                                <input 
                                    type="text"
                                    placeholder="작품명 또는 작가명을 검색해보세요..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-[32px] h-16 pl-16 pr-12 text-lg font-serif italic focus:ring-2 focus:ring-obsidian/5 focus:bg-white focus:outline-none transition-all placeholder:text-slate/30"
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery('')} 
                                        title="검색어 초기화"
                                        aria-label="Clear search query"
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate/30 hover:text-obsidian"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {/* Dropdown Filters (Option 1: Horizontal scrolling flex container on mobile, wraps on desktop) */}
                            <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none pb-3 lg:flex-wrap lg:overflow-x-visible items-center gap-x-6 lg:gap-x-8 gap-y-6 -mx-4 px-4 lg:mx-0 lg:px-0">
                                <FilterControl 
                                    label="장르" 
                                    options={GENRES} 
                                    value={filters.genre} 
                                    onChange={(v) => handleFilterChange('genre', v)} 
                                />
                                <FilterControl 
                                    label="스타일" 
                                    options={STYLES} 
                                    value={filters.style} 
                                    onChange={(v) => handleFilterChange('style', v)} 
                                />
                                <FilterControl 
                                    label="주제" 
                                    options={SUBJECTS} 
                                    value={filters.subject} 
                                    onChange={(v) => handleFilterChange('subject', v)} 
                                />
                                <FilterControl 
                                    label="공간" 
                                    options={SPACES} 
                                    value={filters.space} 
                                    onChange={(v) => handleFilterChange('space', v)} 
                                />
                                <FilterControl 
                                    label="크기" 
                                    options={['S', 'M', 'L', 'XL']} 
                                    labels={['~10호', '11~30호', '31~60호', '61호~']}
                                    value={filters.size} 
                                    onChange={(v) => handleFilterChange('size', v)} 
                                />
                                <FilterControl 
                                    label="계절" 
                                    options={SEASONS} 
                                    value={filters.season} 
                                    onChange={(v) => handleFilterChange('season', v)} 
                                />

                                <button 
                                    onClick={resetFilters}
                                    className="text-[10px] font-black text-slate uppercase ml-auto flex items-center gap-2 hover:text-chapter-accent transition-colors shrink-0 pl-4 border-l border-line lg:border-none lg:pl-0"
                                >
                                    <RotateCcw className="w-3 h-3" /> RESET
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mb-12 flex justify-between items-center text-xs font-bold text-slate/40 uppercase tracking-widest">
                        <span>결과 {filteredArtworks.length}건</span>
                        <div className="flex items-center gap-4">
                            <LayoutGrid className="w-4 h-4 text-obsidian" />
                            <span className="opacity-20">ListView</span>
                        </div>
                    </div>

                    {/* Grid (Optimized: grid-cols-2 on mobile viewports to prevent scrolling fatigue) */}
                    {paginatedArtworks.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-10 sm:gap-y-16">
                            {paginatedArtworks.map((art, idx) => (
                                <ArtworkCard key={art.id} art={art} delay={idx * 0.05} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 flex flex-col items-center justify-center bg-gray-50 rounded-[40px] border border-dashed border-slate/10">
                            <Search className="w-12 h-12 text-slate/20 mb-6" />
                            <p className="text-xl font-serif italic text-slate/40">검색 조건과 일치하는 작품이 없습니다.</p>
                            <button onClick={resetFilters} className="mt-6 text-sm font-black text-chapter-accent underline">필터 초기화</button>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-32 flex items-center justify-center gap-6 border-t border-line pt-12">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                title="이전 페이지"
                                aria-label="Previous page"
                                className={`p-4 rounded-full bg-mist text-slate hover:bg-obsidian hover:text-white transition-all ${currentPage === 1 ? 'opacity-10 cursor-not-allowed' : ''}`}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const pages = [];
                                    const windowSize = 5;
                                    let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
                                    let end = Math.min(totalPages, start + windowSize - 1);
                                    
                                    if (end - start + 1 < windowSize) {
                                        start = Math.max(1, end - windowSize + 1);
                                    }
                                    
                                    for (let i = start; i <= end; i++) {
                                        pages.push(i);
                                    }
                                    
                                    return pages.map(pageNum => (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold transition-all ${
                                                currentPage === pageNum ? 'bg-obsidian text-white' : 'text-slate/40 hover:text-obsidian'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ));
                                })()}
                            </div>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                title="다음 페이지"
                                aria-label="Next page"
                                className={`p-4 rounded-full bg-mist text-slate hover:bg-obsidian hover:text-white transition-all ${currentPage === totalPages ? 'opacity-10 cursor-not-allowed' : ''}`}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </section>
            </div>

            {/* Premium Styling */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');
                .font-serif { font-family: 'Cormorant Garamond', serif; }
            `}</style>
        </div>
    );
}

// --- Helper Components ---

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

function FilterControl({ label, options, value, onChange, labels }: { 
    label: string, 
    options: string[], 
    value: string, 
    onChange: (v: string) => void,
    labels?: string[]
}) {
    return (
        <div className="flex flex-col gap-1.5 min-w-[100px] shrink-0 border-l border-line/20 pl-4 first:border-none first:pl-0">
            <span className="text-[10px] font-black text-slate/40 uppercase tracking-widest">{label}</span>
            <select 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                title={label}
                aria-label={`${label} 필터`}
                className="bg-transparent border-none text-[13px] font-black p-0 focus:ring-0 cursor-pointer hover:text-chapter-accent transition-colors outline-none"
            >
                <option value="All">전체</option>
                {options.map((opt, i) => (
                    <option key={opt} value={opt}>{labels ? labels[i] : opt}</option>
                ))}
            </select>
        </div>
    );
}

function ArtworkCard({ art, delay }: { art: Artwork, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.5 }}
            className="group"
        >
            <Link href={`/gallery/artworks/${art.id}`} className="block">
                <div className="relative aspect-[3/4] mb-4 md:mb-6 overflow-hidden rounded-[20px] md:rounded-[32px] bg-gray-50 shadow-sm transition-all duration-500 group-hover:shadow-2xl">
                    {art.image ? (
                        <Image 
                            src={art.image} 
                            alt={art.title}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            sizes="(max-width: 768px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">🎨</div>
                    )}
                    
                    {/* Tags */}
                    <div className="absolute top-3 left-3 md:top-6 md:left-6 flex flex-wrap gap-1.5">
                        {art.isCurated && (
                            <span className="px-2 py-0.5 md:px-3 md:py-1 bg-chapter-accent text-white text-[8px] md:text-[9px] font-black rounded-full uppercase tracking-widest shadow-lg">Curated</span>
                        )}
                        <span className="px-2 py-0.5 md:px-3 md:py-1 bg-white/90 backdrop-blur-md text-obsidian text-[8px] md:text-[9px] font-black rounded-full uppercase tracking-widest shadow-sm translate-x-[-115%] group-hover:translate-x-0 transition-transform duration-500">{art.category}</span>
                    </div>

                    {/* Protection Overlay / Detail Trigger */}
                    <div className="absolute inset-0 bg-obsidian/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="w-9 h-9 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
                            <MousePointer2 className="w-4 h-4 md:w-5 md:h-5 text-obsidian" />
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5 md:space-y-2 px-1 md:px-2">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="text-sm sm:text-lg md:text-xl font-serif italic text-obsidian leading-tight group-hover:text-chapter-accent transition-colors line-clamp-2">{art.title}</h3>
                        <span className="text-[8px] md:text-[10px] font-black text-slate/30 uppercase tracking-tighter shrink-0">{art.specs?.ho || 0}호</span>
                    </div>
                    <p className="text-[9px] md:text-[10px] text-slate/50 font-black uppercase tracking-[0.2em]">{art.artistName}</p>
                    <div className="pt-1.5 md:pt-2 flex justify-between items-center border-t border-line/50">
                        <span className="text-[10px] md:text-[11px] font-black text-obsidian">₩ {art.rental || art.price}</span>
                        <span className="text-[8px] md:text-[9px] font-bold text-chapter-accent uppercase">{art.rental ? 'Monthly' : 'Sale'}</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
