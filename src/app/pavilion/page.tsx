'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Fingerprint, ChevronRight, ShoppingCart, User as UserIcon, Menu, ArrowRight, X, Heart, Sparkles, LayoutGrid, Info, CheckCircle2, ArrowLeft, Image as LucideImage, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Direct imports
import ConventionCenter from '@/components/convention/ConventionCenter';
import ElevatorUI from '@/components/convention/ElevatorUI';
import ArtGalleryUI from '@/components/pavilion/ArtGalleryUI';

// --- Types ---
export interface PavilionItem {
    id: string;
    type: 'ARTWORK' | 'PRODUCT' | 'COACHING' | 'MEDICAL' | 'OMAKASE';
    title: string;
    subtitle?: string;
    description: string;
    specs: Record<string, string>;
    price: string;
    rental?: string; // Monthly rental price
    image?: string;
    canvasSize?: string; // Canvas size (e.g., "50.0 x 60.0 cm (15호)")
}

export interface FloorOwner {
    id: string;
    name: string;
    role: string;
    bio: string;
    image?: string;
    items: PavilionItem[];
}

export default function PavilionPage() {
    const router = useRouter();
    const [activeFloor, setActiveFloor] = useState(1);
    const [mounted, setMounted] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [engineStatus, setEngineStatus] = useState<'LOADING' | 'READY' | 'FAIL'>('LOADING');

    // DB Data
    const [pavilionData, setPavilionData] = useState<Record<number, FloorOwner[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    // Initial Artist Data with Portraits
    const ARTIST_PORTRAITS: Record<string, string> = {
        'artist-a': '/artist_master_a.png',
        'artist-b': '/artist_master_b.png'
    };

    // Unified State (Floor-Aware)
    const [selectedOwner, setSelectedOwner] = useState<FloorOwner | null>(null);
    const [isInsideRoom, setIsInsideRoom] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PavilionItem | null>(null);
    const [isImageZoomed, setIsImageZoomed] = useState(false);
    const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'STANDARD' | 'ART_GRID' | 'ART_BIO'>('STANDARD');
    const [galleryOffset, setGalleryOffset] = useState(0); // 1층 갤러리 좌우 이동 오프셋

    // Omakase Suite State (5F)
    const [omakaseSelection, setOmakaseSelection] = useState<PavilionItem[]>([]);
    const [budget, setBudget] = useState(50000000); // Default 50M KRW
    const [omakaseFilterFloor, setOmakaseFilterFloor] = useState<number | null>(null);

    useEffect(() => {
        setMounted(true);
        fetchPavilionData();
    }, []);

    const fetchPavilionData = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/pavilion');
            if (res.ok) {
                const data = await res.json();

                // Floor 2 (상점)는 별도 API에서 상품 데이터 로드
                const floor2Res = await fetch('/api/pavilion/products?floorId=floor-2');
                if (floor2Res.ok) {
                    const productsData = await floor2Res.json(); // 중복 호출 제거
                    // Floor 2 데이터 구조 생성
                    data[2] = [{
                        id: 'shop-products',
                        name: 'Recovery Shop',
                        role: '상품 전시',
                        bio: '회복을 위한 다양한 상품을 만나보세요',
                        image: '/artist_master_a.png', // 기본 이미지
                        items: productsData.items || []
                    }];
                }

                setPavilionData(data);
            }
        } catch (error) {
            console.error('Failed to load pavilion data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Specialist Click
    const handleArtistClick = useCallback((id: string) => {
        setSelectedArtistId(id);
        if (activeFloor === 1 || activeFloor === 2) {
            setViewMode('ART_BIO');
        }
        const owner = (pavilionData[activeFloor] || []).find(o => o.id === id);
        if (owner) {
            setSelectedOwner(owner);
        }
    }, [activeFloor, pavilionData]);

    const handleArtworkClick = useCallback((itemId: string) => {
        if (selectedOwner) {
            const item = selectedOwner.items.find(i => i.id === itemId);
            if (item) {
                // Floor 2 (상점)인 경우 상품 상세 페이지로 라우팅
                if (activeFloor === 2 && (item as any).productId) {
                    router.push(`/products/${(item as any).productId}`);
                } else {
                    // 1층 갤러리는 기존 모달 표시
                    setSelectedItem(item);
                }
            }
        }
    }, [selectedOwner, activeFloor, router]);

    // Handle Floor change
    const handleFloorChange = useCallback((floor: number) => {
        setActiveFloor(floor);
        setSelectedOwner(null);
        setIsInsideRoom(false);
        setSelectedItem(null);
        setSelectedArtistId(null);

        if (floor === 1 || floor === 2) {
            setViewMode('ART_GRID');
        } else {
            setViewMode('STANDARD');
        }
    }, []);

    const handleEngineReady = useCallback(() => {
        setEngineStatus('READY');
    }, []);

    // Set initial view mode for Floor 1 when data loads
    useEffect(() => {
        if (mounted && !isLoading && (activeFloor === 1 || activeFloor === 2) && Object.keys(pavilionData).length > 0) {
            setViewMode('ART_GRID');
        }
    }, [mounted, isLoading, activeFloor, pavilionData]);

    const currentFloorOwners = useMemo(() => pavilionData[activeFloor] || [], [pavilionData, activeFloor]);

    if (!mounted) return null;

    return (
        <main className="relative w-full h-screen overflow-hidden bg-white font-sans selection:bg-[#D4AF37] selection:text-white">
            {/* 3D Masterpiece Environment */}
            <div className="absolute inset-0 z-0">
                <ConventionCenter
                    activeFloor={activeFloor}
                    selectedArtistId={selectedArtistId}
                    selectedOwner={selectedOwner}
                    selectedItemId={selectedItem?.id || null}
                    isInsideRoom={isInsideRoom}
                    onReady={handleEngineReady}
                    onArtistClick={handleArtistClick}
                    onArtworkClick={handleArtworkClick}
                    onEnterRoom={() => {
                        setIsInsideRoom(true);
                        setViewMode('STANDARD');
                    }}
                    floorData={(activeFloor === 1 || activeFloor === 2) && !isInsideRoom ? [] : currentFloorOwners}
                    panOffset={galleryOffset}
                />
            </div>

            {/* Gallery Navigation Arrows (Only inside 1st floor gallery) */}
            {activeFloor === 1 && isInsideRoom && !selectedItem && (
                <>
                    <button
                        onClick={() => setGalleryOffset(prev => prev - 20)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-6 md:p-10 text-obsidian/10 hover:text-obsidian/30 transition-all pointer-events-auto group"
                    >
                        <LucideImage className="w-12 h-12 md:w-20 md:h-20 rotate-180 opacity-20 group-hover:opacity-100 transition-opacity" />
                        <span className="sr-only">이전 작품</span>
                        {/* 화살표 아이콘 대신 사용자가 투명한 화살표를 원하므로 Chevron 사용 */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ChevronRight className="w-full h-full rotate-180 opacity-10 group-hover:opacity-40" />
                        </div>
                    </button>
                    <button
                        onClick={() => setGalleryOffset(prev => prev + 20)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-6 md:p-10 text-obsidian/10 hover:text-obsidian/30 transition-all pointer-events-auto group"
                    >
                        <LucideImage className="w-12 h-12 md:w-20 md:h-20 opacity-20 group-hover:opacity-100 transition-opacity" />
                        <span className="sr-only">다음 작품</span>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ChevronRight className="w-full h-full opacity-10 group-hover:opacity-40" />
                        </div>
                    </button>
                </>
            )}

            {/* Art Gallery 2D Overlays */}
            {(activeFloor === 1 || activeFloor === 2) && viewMode !== 'STANDARD' && (
                <ArtGalleryUI
                    viewMode={viewMode === 'ART_GRID' ? 'GRID' : 'BIO'}
                    artists={currentFloorOwners.map((o: FloorOwner) => ({
                        id: o.id,
                        name: o.name,
                        role: o.role,
                        bio: o.bio,
                        image: (o.image && o.image.trim() !== '') ? o.image : (ARTIST_PORTRAITS[o.id] || ARTIST_PORTRAITS['artist-a'])
                    }))}
                    selectedArtistId={selectedArtistId}
                    onArtistSelect={handleArtistClick}
                    onEnterGallery={() => {
                        setIsInsideRoom(true);
                        setViewMode('STANDARD');
                    }}
                    onBack={() => setViewMode('ART_GRID')}
                    title={activeFloor === 2 ? "Prestige Shop" : "Art Gallery"}
                    subtitle={activeFloor === 2 ? "Curated for Recovery" : "Visionaries of Recovery"}
                    enterButtonText={activeFloor === 2 ? "상점 입장하기" : "갤러리 입장하기"}
                />
            )}

            {/* Premium UI Overlay Layer - Elevated to z-50 to ensure navigation is always visible */}
            <div className="relative z-50 w-full h-full pointer-events-none">
                {/* HUD: Header */}
                {!selectedItem && (
                    <div className="absolute top-0 left-0 w-full p-6 md:p-12 flex justify-between items-start pointer-events-auto">
                        <div className="flex items-center gap-6 md:gap-12">
                            <div className="flex items-center gap-4 text-obsidian">
                                <Link href="/" className="hover:opacity-70 transition-opacity">
                                    <LucideImage className="w-8 h-8 md:w-10 md:h-10" />
                                </Link>
                                <div className="space-y-0.5">
                                    <h1 className="text-sm md:text-xl font-black tracking-tighter uppercase italic leading-none">
                                        {activeFloor === 1 ? 'Art Gallery' : activeFloor === 2 ? 'Prestige Shop' : activeFloor === 3 ? 'Dynamic Coaching' : activeFloor === 4 ? 'Medical Archive' : 'Omakase Suite'}
                                    </h1>
                                    <p className="text-[6px] md:text-[8px] font-black opacity-30 uppercase tracking-widest">Floor {activeFloor} Control Center</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 md:gap-6">
                            <div className="px-3 py-1.5 md:px-6 md:py-3 rounded-full bg-white/80 backdrop-blur-xl shadow-2xl border border-white flex items-center gap-2 md:gap-4">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#10b981] animate-pulse" />
                                <span className="text-[7px] md:text-[10px] font-black text-obsidian uppercase tracking-widest italic">Biometric Auth Active</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Level Navigator */}
                {!isInsideRoom && !selectedItem && (
                    <div className="pointer-events-auto">
                        <ElevatorUI activeFloor={activeFloor} onFloorChange={handleFloorChange} />
                    </div>
                )}

                {/* --- Owner Mini Bio --- */}
                <AnimatePresence>
                    {selectedOwner && !isInsideRoom && !selectedItem && activeFloor !== 1 && activeFloor !== 2 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] md:w-full max-w-xl bg-white/50 backdrop-blur-3xl p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-white/40 shadow-2xl text-center pointer-events-auto"
                        >
                            <button onClick={() => setSelectedOwner(null)} className="absolute -top-4 -right-4 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-obsidian/20 hover:text-obsidian hover:rotate-90 transition-all">
                                <X className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                            <div className="space-y-4 md:space-y-6">
                                <span className="px-3 py-1 bg-[#D4AF37] text-white font-black text-[7px] md:text-[9px] uppercase tracking-[0.4em] rounded-full">{selectedOwner.role}</span>
                                <h2 className="text-2xl md:text-5xl font-black text-obsidian tracking-tighter uppercase italic">{selectedOwner.name}</h2>
                                <p className="text-xs md:text-sm font-medium text-obsidian/60 leading-relaxed italic line-clamp-2">"{selectedOwner.bio}"</p>
                                <div className="pt-4 md:pt-6">
                                    <button
                                        onClick={() => setIsInsideRoom(true)}
                                        className="w-full h-14 md:h-16 bg-obsidian text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 group"
                                    >
                                        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                                        {activeFloor === 5 ? '오마카세 빌더 입장' : '입장하기'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- Item Detail Overlay --- */}
                <AnimatePresence>
                    {selectedItem && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[9999] bg-white/95 backdrop-blur-3xl flex flex-col items-center justify-start p-6 md:p-12 pt-28 md:pt-32 pointer-events-auto overflow-y-auto"
                        >
                            <button
                                onClick={() => {
                                    setSelectedItem(null);
                                    setIsImageZoomed(false);
                                }}
                                className="fixed top-8 right-8 md:top-12 md:right-12 flex items-center gap-4 text-obsidian/40 hover:text-obsidian group z-[210]"
                            >
                                <span className="font-black uppercase tracking-widest text-[8px] md:text-[10px] hidden md:block">상세 정보 닫기</span>
                                <div className="p-3 md:p-4 bg-obsidian/5 rounded-full group-hover:bg-obsidian transition-all group-hover:scale-110">
                                    <X className="w-5 h-5 md:w-7 md:h-7 group-hover:text-white transition-colors" />
                                </div>
                            </button>

                            <div className="max-w-[1400px] w-full grid grid-cols-1 xl:grid-cols-5 gap-8 md:gap-16 items-center pb-12">
                                <motion.div
                                    initial={{ x: -100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="xl:col-span-3 aspect-[4/5] md:aspect-auto md:h-[70vh] bg-obsidian rounded-[32px] md:rounded-[60px] relative overflow-hidden shadow-2xl border-[8px] md:border-[20px] border-white group cursor-zoom-in"
                                    onClick={() => setIsImageZoomed(true)}
                                >
                                    {selectedItem.image ? (
                                        <img
                                            src={selectedItem.image}
                                            alt={selectedItem.title}
                                            className="w-full h-full object-contain object-top bg-white transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/20 via-obsidian to-transparent flex items-center justify-center">
                                            <LucideImage className="w-16 h-16 md:w-32 md:h-32 text-white/5 animate-pulse" />
                                        </div>
                                    )}
                                </motion.div>

                                <div className="xl:col-span-2 space-y-6 md:space-y-12 text-left">
                                    <div className="space-y-3 md:space-y-6">
                                        <div className="flex items-center gap-4">
                                            <span className="px-2 py-0.5 bg-[#D4AF37] text-white font-black text-[6px] md:text-[9px] uppercase tracking-widest rounded">{selectedItem.type}</span>
                                        </div>
                                        <h3 className="text-2xl md:text-7xl font-black text-obsidian tracking-tighter uppercase italic leading-tight md:leading-none">
                                            {selectedItem.title}
                                        </h3>
                                        <p className="text-xs md:text-2xl font-serif text-obsidian/50 leading-relaxed italic border-l-2 md:border-l-4 border-[#D4AF37] pl-3 md:pl-8">
                                            "{selectedItem.description}"
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-px bg-obsidian/5 rounded-xl md:rounded-2xl overflow-hidden border border-obsidian/5">
                                        {selectedItem.canvasSize && (
                                            <div className="p-3 md:p-8 bg-white/40 space-y-1 md:space-y-2">
                                                <span className="text-[6px] md:text-[9px] font-black uppercase tracking-widest text-obsidian/30">CANVAS SIZE</span>
                                                <p className="font-black text-obsidian text-xs md:text-lg">{selectedItem.canvasSize}</p>
                                            </div>
                                        )}
                                        {Object.entries(selectedItem.specs).map(([key, value]) => (
                                            <div key={key} className="p-3 md:p-8 bg-white/40 space-y-1 md:space-y-2">
                                                <span className="text-[6px] md:text-[9px] font-black uppercase tracking-widest text-obsidian/30">{key}</span>
                                                <p className="font-black text-obsidian text-xs md:text-lg">{value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-3 md:space-y-6 pt-2">
                                        <div className="flex flex-col gap-2 md:gap-4 pb-3 md:pb-4 border-b border-obsidian/5">
                                            {selectedItem.rental && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[8px] md:text-[10px] font-black text-[#D4AF37] uppercase tracking-widest italic">렌탈 (월)</span>
                                                    <span className="text-lg md:text-2xl font-black text-obsidian tracking-tighter">₩{parseInt(selectedItem.rental.replace(/[^0-9]/g, '') || '0').toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <span className="text-[8px] md:text-[10px] font-black text-obsidian/30 uppercase tracking-widest italic">가치 산정액</span>
                                                <span className="text-xl md:text-4xl font-black text-obsidian tracking-tighter">₩{parseInt(selectedItem.price.replace(/[^0-9]/g, '') || '0').toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                                            <button className="h-12 md:h-20 bg-obsidian text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-4">
                                                <ShoppingCart size={14} className="md:w-[18px] md:h-[18px]" />
                                                담기
                                            </button>
                                            <button className="h-12 md:h-20 border-2 border-obsidian/10 text-obsidian rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-obsidian hover:text-white transition-all">
                                                문의하기
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- Image Zoom Modal --- */}
                <AnimatePresence>
                    {isImageZoomed && selectedItem && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl cursor-zoom-out"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsImageZoomed(false);
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="relative w-full h-full flex items-center justify-center pointer-events-none"
                            >
                                <img
                                    src={selectedItem.image}
                                    alt={selectedItem.title}
                                    className="max-w-full max-h-full object-contain shadow-2xl pointer-events-auto"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsImageZoomed(false);
                                    }}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- Omakase Builder (5F) --- */}
                {activeFloor === 5 && isInsideRoom && !selectedItem && (
                    <div className="absolute inset-0 md:inset-x-12 md:bottom-12 md:top-24 pointer-events-auto flex flex-col md:flex-row gap-6 bg-obsidian md:bg-transparent overflow-y-auto p-6 md:p-0">
                        <div className="w-full md:w-[400px] flex flex-col gap-6">
                            <div className="bg-white/10 md:bg-obsidian rounded-[32px] p-6 md:p-10 border border-white/10 shadow-2xl flex flex-col gap-6">
                                <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest">운용 예산 설정</span>
                                <h4 className="text-2xl md:text-4xl font-black text-white tracking-tighter">₩{budget.toLocaleString()}</h4>
                                <input
                                    type="range" min="10000000" max="200000000" step="10000000"
                                    value={budget} onChange={(e) => setBudget(Number(e.target.value))}
                                    className="w-full h-2 bg-white/10 rounded-full appearance-none accent-[#D4AF37] cursor-pointer"
                                />
                                <div className="h-px bg-white/10" />
                                <div className="flex justify-between items-end text-white">
                                    <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">현재 선택 총액</span>
                                    <span className={`text-xl font-black ${omakaseSelection.reduce((acc: number, item: PavilionItem) => acc + parseInt(item.price.replace(/[^0-9]/g, '') || '0'), 0) > budget ? 'text-status-danger' : 'text-white'}`}>
                                        ₩{omakaseSelection.reduce((acc: number, item: PavilionItem) => acc + parseInt(item.price.replace(/[^0-9]/g, '') || '0'), 0).toLocaleString()}
                                    </span>
                                </div>
                                <button className="w-full h-16 bg-[#D4AF37] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">
                                    패키지 확정하기
                                </button>
                            </div>

                            <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-[32px] border border-white/10 p-6 overflow-y-auto">
                                <h5 className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-4">선택 목록 ({omakaseSelection.length})</h5>
                                <div className="space-y-3">
                                    {omakaseSelection.map((item, idx) => (
                                        <div key={`${item.id}-${idx}`} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div>
                                                <p className="text-[7px] font-black text-[#D4AF37] uppercase">{item.type}</p>
                                                <p className="text-white font-black text-xs">{item.title}</p>
                                            </div>
                                            <button onClick={() => setOmakaseSelection(prev => prev.filter(i => i.id !== item.id))} className="text-white/20 hover:text-white">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 bg-white/5 backdrop-blur-3xl rounded-[32px] md:rounded-[60px] border border-white/10 p-6 md:p-12 overflow-y-auto">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 md:mb-12">
                                <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic">오마카세 <span className="text-[#D4AF37]">인벤토리</span></h3>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setOmakaseFilterFloor(null)} className={`px-4 py-2 rounded-full border text-[8px] font-black uppercase tracking-widest transition-all ${omakaseFilterFloor === null ? 'bg-[#D4AF37] border-[#D4AF37] text-white' : 'border-white/10 text-white/40 hover:border-white/30'}`}>전체</button>
                                    {[1, 2, 3, 4].map(f => (
                                        <button key={f} onClick={() => setOmakaseFilterFloor(f)} className={`px-4 py-2 rounded-full border text-[8px] font-black uppercase tracking-widest transition-all ${omakaseFilterFloor === f ? 'bg-[#D4AF37] border-[#D4AF37] text-white' : 'border-white/10 text-white/40 hover:border-white/30'}`}>{f}층</button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(pavilionData)
                                    .filter(([f]) => omakaseFilterFloor === null || Number(f) === omakaseFilterFloor)
                                    .flatMap(([_, owners]) => owners.flatMap(o => o.items))
                                    .filter(item => item.type !== 'OMAKASE')
                                    .map((item, idx) => {
                                        const isSelected = omakaseSelection.find(i => i.id === item.id);
                                        return (
                                            <div
                                                key={`${item.id}-${idx}`}
                                                onClick={() => {
                                                    if (isSelected) setOmakaseSelection(prev => prev.filter(i => i.id !== item.id));
                                                    else setOmakaseSelection(prev => [...prev, item]);
                                                }}
                                                className={`p-6 rounded-[24px] border-2 cursor-pointer transition-all duration-300 ${isSelected ? 'bg-[#D4AF37] border-[#D4AF37] scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${isSelected ? 'bg-white text-obsidian' : 'bg-[#D4AF37] text-white'}`}>{item.type}</span>
                                                    <span className={`text-sm font-black ${isSelected ? 'text-white' : 'text-white/40'}`}>{item.price}</span>
                                                </div>
                                                <h4 className="text-xl font-black text-white uppercase italic mb-1">{item.title}</h4>
                                                <p className="text-[10px] text-white/40 line-clamp-2">{item.description}</p>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Bottom Navigation --- */}
                {isInsideRoom && !selectedItem && (
                    <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col md:flex-row items-center gap-4 md:gap-8 pointer-events-auto w-[calc(100%-48px)] md:w-auto">
                        <button
                            onClick={() => {
                                setIsInsideRoom(false);
                                if (activeFloor === 1 || activeFloor === 2) setViewMode('ART_GRID');
                            }}
                            className="w-full md:w-auto px-6 py-4 md:px-10 md:py-5 bg-obsidian text-white rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.4em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
                        >
                            <ArrowLeft size={16} /> {activeFloor}층 로비로 돌아가기
                        </button>
                        <div className="w-full md:w-auto px-6 py-3 md:px-10 md:py-4 bg-white/80 backdrop-blur-2xl rounded-full border border-white shadow-2xl flex flex-col items-center">
                            <span className="text-[7px] font-black text-obsidian/20 uppercase tracking-[0.5em]">Specialist Workspace</span>
                            <span className="text-[9px] font-black text-obsidian uppercase italic tracking-widest text-center">{selectedOwner?.name}의 개인 전용 공간</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Immersive Intro */}
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 1 } }}
                        className="absolute inset-0 z-[500] bg-white flex flex-col items-center justify-center p-6"
                    >
                        <div className="max-w-4xl w-full text-center space-y-12">
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                <span className="text-xs font-black text-obsidian/40 uppercase tracking-[0.8em] block mb-4">지금 당신은</span>
                                <h1 className="text-5xl md:text-9xl font-black text-obsidian tracking-tighter leading-tight uppercase italic">
                                    MASTERPIECE<br /><span className="text-[#D4AF37]">PAVILION</span>
                                    <br /><span className="text-base md:text-2xl tracking-normal not-italic opacity-40 block mt-4">에 입장하고 계십니다</span>
                                </h1>
                            </motion.div>

                            <motion.button
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                                onClick={() => setShowIntro(false)}
                                className="group relative"
                            >
                                <div className="absolute -inset-10 bg-[#D4AF37]/20 rounded-full blur-3xl animate-pulse" />
                                <div className="relative h-24 md:h-32 px-16 md:px-32 bg-obsidian text-white font-black text-xl md:text-2xl rounded-full flex items-center justify-center gap-6 group-hover:scale-110 transition-all border-4 border-white shadow-2xl">
                                    가상 체험 시작하기
                                    <ArrowRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-4 transition-transform" />
                                </div>
                            </motion.button>
                            <p className="text-[10px] font-black text-obsidian/20 uppercase tracking-[0.4em] italic">V8.0 PRESTIGE EDITION</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
