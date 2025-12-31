// [GALLERY_MASTERPIECE_V8] - Immersive First-Person Commerce Gallery
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Info, ArrowLeft, RefreshCw, AlertCircle, X, ArrowRight, User, Image as LucideImage, ShoppingCart, Calendar, Ruler, Award } from 'lucide-react';
import Link from 'next/link';

// Direct imports
import ConventionCenter from '@/components/convention/ConventionCenter';
import ElevatorUI from '@/components/convention/ElevatorUI';

// --- Types ---
export interface PavilionItem {
    id: string;
    type: 'ARTWORK' | 'PRODUCT' | 'COACHING' | 'MEDICAL' | 'OMAKASE';
    title: string;
    subtitle?: string;
    description: string;
    specs: Record<string, string>;
    price: string;
    rental?: string;
    image?: string;
}

export interface FloorOwner {
    id: string;
    name: string;
    role: string;
    bio: string;
    items: PavilionItem[];
}

export default function PavilionPage() {
    const [activeFloor, setActiveFloor] = useState(1);
    const [mounted, setMounted] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [engineStatus, setEngineStatus] = useState<'LOADING' | 'READY' | 'FAIL'>('LOADING');

    // DB Data
    const [pavilionData, setPavilionData] = useState<Record<number, FloorOwner[]>>({});
    const [isDataLoading, setIsDataLoading] = useState(true);

    // Unified State (Floor-Aware)
    const [selectedOwner, setSelectedOwner] = useState<FloorOwner | null>(null);
    const [isInsideRoom, setIsInsideRoom] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PavilionItem | null>(null);

    // Omakase Suite State (5F)
    const [omakaseSelection, setOmakaseSelection] = useState<PavilionItem[]>([]);
    const [budget, setBudget] = useState(50000000); // Default 50M KRW
    const [omakaseFilterFloor, setOmakaseFilterFloor] = useState<number | null>(null);

    useEffect(() => {
        setMounted(true);
        fetchPavilionData();

        const timer = setTimeout(() => {
            if (engineStatus === 'LOADING' && !showIntro) setEngineStatus('FAIL');
        }, 12000);
        return () => clearTimeout(timer);
    }, [engineStatus, showIntro]);

    const fetchPavilionData = async () => {
        try {
            setIsDataLoading(true);
            const res = await fetch('/api/pavilion');
            if (res.ok) {
                const data = await res.json();
                setPavilionData(data);
            }
        } catch (error) {
            console.error('Failed to load pavilion data:', error);
        } finally {
            setIsDataLoading(false);
        }
    };

    // Handle Specialist Click
    const onArtistClick = (id: string) => {
        const owner = pavilionData[activeFloor]?.find(o => o.id === id);
        if (owner) {
            setSelectedOwner(owner);
        }
    };

    // Handle Floor change
    useEffect(() => {
        setSelectedOwner(null);
        setIsInsideRoom(false);
        setSelectedItem(null);
    }, [activeFloor]);

    if (!mounted) return null;

    return (
        <main className="relative w-full h-screen overflow-hidden bg-white font-sans selection:bg-[#D4AF37] selection:text-white">
            {/* 3D Masterpiece Environment */}
            <div className="absolute inset-0 z-0">
                <ConventionCenter
                    activeFloor={activeFloor}
                    selectedArtistId={selectedOwner?.id || null}
                    selectedOwner={selectedOwner}
                    isInsideRoom={isInsideRoom}
                    onReady={() => setEngineStatus('READY')}
                    onArtistClick={onArtistClick}
                    onArtworkClick={(itemId) => {
                        if (selectedOwner) {
                            const item = selectedOwner.items.find(i => i.id === itemId);
                            if (item) setSelectedItem(item);
                        }
                    }}
                    onEnterRoom={() => setIsInsideRoom(true)}
                    floorData={pavilionData[activeFloor] || []}
                />
            </div>

            {/* Premium UI Overlay Layer */}
            <div className="relative z-10 w-full h-full pointer-events-none">

                {/* HUD: Header (Minified for Immersive V8) */}
                {!selectedItem && (
                    <div className="absolute top-0 left-0 w-full p-12 flex justify-between items-start pointer-events-auto">
                        <div className="flex items-center gap-12">
                            <div className="flex items-center gap-4 text-obsidian">
                                <div className="space-y-0.5">
                                    <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">
                                        {activeFloor === 1 ? 'Art Gallery' : activeFloor === 2 ? 'Prestige Shop' : activeFloor === 3 ? 'Dynamic Coaching' : activeFloor === 4 ? 'Medical Archive' : 'Omakase Suite'}
                                    </h1>
                                    <p className="text-[8px] font-black opacity-30 uppercase tracking-widest">Floor {activeFloor} Control Center</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="px-6 py-3 rounded-full bg-white/80 backdrop-blur-xl shadow-2xl border border-white flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full bg-status-good animate-pulse" />
                                <span className="text-[10px] font-black text-obsidian uppercase tracking-widest italic">Biometric Auth Active</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Level Navigator - Hide when in deep interaction */}
                {!isInsideRoom && !selectedItem && (
                    <div className="pointer-events-auto">
                        <ElevatorUI activeFloor={activeFloor} onFloorChange={setActiveFloor} />
                    </div>
                )}

                {/* --- Owner Mini Bio (Accompanying the Magic Door) --- */}
                <AnimatePresence>
                    {selectedOwner && !isInsideRoom && !selectedItem && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white/50 backdrop-blur-3xl p-10 rounded-[48px] border border-white/40 shadow-2xl text-center pointer-events-auto"
                        >
                            <button onClick={() => setSelectedOwner(null)} className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-obsidian/20 hover:text-obsidian hover:rotate-90 transition-all">
                                <X className="w-6 h-6" />
                            </button>
                            <div className="space-y-6">
                                <span className="px-4 py-1 bg-[#D4AF37] text-white font-black text-[9px] uppercase tracking-[0.4em] rounded-full">{selectedOwner.role}</span>
                                <h2 className="text-5xl font-black text-obsidian tracking-tighter uppercase italic">{selectedOwner.name}</h2>
                                <p className="text-sm font-medium text-obsidian/60 leading-relaxed italic line-clamp-2">"{selectedOwner.bio}"</p>
                                <div className="pt-6">
                                    <button
                                        onClick={() => setIsInsideRoom(true)}
                                        className="w-full h-16 bg-obsidian text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 group pointer-events-auto"
                                    >
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        {activeFloor === 5 ? '오마카세 빌더 입장' : '갤러리 입장하기'}
                                    </button>
                                    <p className="mt-4 text-[9px] font-black text-obsidian/20 uppercase tracking-[0.4em] text-center">
                                        또는 3D 공간의 포탈을 클릭하세요
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- Item Detail Overlay (Immersive Commerce V8) --- */}
                <AnimatePresence>
                    {selectedItem && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[200] bg-white/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 pointer-events-auto"
                        >
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-12 right-12 flex items-center gap-4 text-obsidian/40 hover:text-obsidian group"
                            >
                                <span className="font-black uppercase tracking-widest text-[10px]">상세 정보 닫기</span>
                                <div className="p-4 bg-obsidian/5 rounded-full group-hover:bg-obsidian transition-all group-hover:scale-110">
                                    <X className="w-7 h-7 group-hover:text-white transition-colors" />
                                </div>
                            </button>

                            <div className="max-w-[1400px] w-full grid grid-cols-1 xl:grid-cols-5 gap-16 items-center">
                                {/* Large Visualization (xl-3) */}
                                <motion.div
                                    initial={{ x: -100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="xl:col-span-3 aspect-[4/5] bg-obsidian rounded-[60px] relative overflow-hidden shadow-[0_80px_100px_-20px_rgba(0,0,0,0.3)] border-[20px] border-white group"
                                >
                                    <div className="absolute inset-x-0 bottom-10 flex justify-center z-20">
                                        <div className="px-6 py-3 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full text-white font-black uppercase text-[10px] tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                            인터랙티브 고해상도 스캔 활성화됨
                                        </div>
                                    </div>
                                    {/* Mock Image Content */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/20 via-obsidian to-transparent flex items-center justify-center">
                                        <LucideImage className="w-32 h-32 text-white/5 animate-pulse" />
                                    </div>
                                </motion.div>

                                {/* Info & Commerce Section (xl-2) */}
                                <div className="xl:col-span-2 space-y-12 text-left">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <span className="px-3 py-1 bg-[#D4AF37] text-white font-black text-[9px] uppercase tracking-widest rounded">{selectedItem.type}</span>
                                            <span className="text-obsidian/40 font-black text-[10px] uppercase tracking-[0.2em]">보안 인증됨</span>
                                        </div>
                                        <h3 className="text-7xl font-black text-obsidian tracking-tighter uppercase italic leading-none drop-shadow-sm">
                                            {selectedItem.title}
                                        </h3>
                                        <p className="text-2xl font-serif text-obsidian/50 leading-relaxed italic border-l-4 border-[#D4AF37] pl-8">
                                            "{selectedItem.description}"
                                        </p>
                                    </div>

                                    {/* Specifications Grid */}
                                    <div className="grid grid-cols-2 gap-px bg-obsidian/5 rounded-3xl overflow-hidden border border-obsidian/5">
                                        {Object.entries(selectedItem.specs).map(([key, value]) => (
                                            <div key={key} className="p-8 bg-white/40 space-y-2">
                                                <div className="flex items-center gap-2 text-obsidian/30">
                                                    <Info className="w-3 h-3" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">{key}</span>
                                                </div>
                                                <p className="font-black text-obsidian text-lg">{value}</p>
                                            </div>
                                        ))}
                                        {Object.keys(selectedItem.specs).length % 2 !== 0 && (
                                            <div className="p-8 bg-white/40 flex items-center justify-center">
                                                <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em] italic">인증 완료</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Commerce Actions */}
                                    <div className="space-y-6 pt-4">
                                        <div className="flex items-center justify-between pb-4 border-b border-obsidian/5">
                                            <span className="text-xs font-black text-obsidian/30 uppercase tracking-widest italic">가치 산정액</span>
                                            <span className="text-4xl font-black text-obsidian tracking-tighter">{selectedItem.price}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <button className="h-20 bg-obsidian text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group">
                                                <ShoppingCart className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                                {selectedItem.type === 'ARTWORK' ? '컬렉션에 추가' :
                                                    selectedItem.type === 'PRODUCT' ? '장바구니 담기' :
                                                        selectedItem.type === 'COACHING' ? '세션 예약하기' :
                                                            selectedItem.type === 'MEDICAL' ? '검사 신청하기' : '컬렉션에 추가'}
                                            </button>
                                            <div className="space-y-2">
                                                <button className="w-full h-20 border-2 border-obsidian/10 hover:border-obsidian/40 text-obsidian rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all flex flex-col items-center justify-center gap-1 group">
                                                    <div className="flex items-center gap-2">
                                                        {selectedItem.type === 'ARTWORK' || selectedItem.type === 'PRODUCT' ? <Calendar className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                                                        {selectedItem.type === 'ARTWORK' ? '렌탈 플랜 적용' :
                                                            selectedItem.type === 'PRODUCT' ? '즉시 구매하기' :
                                                                selectedItem.type === 'COACHING' ? '코칭 문의하기' :
                                                                    selectedItem.type === 'MEDICAL' ? '상담 예약하기' : '상세 정보 문의'}
                                                    </div>
                                                    {selectedItem.rental && <span className="text-[9px] text-[#D4AF37] opacity-60 group-hover:opacity-100 transition-opacity">{selectedItem.rental}</span>}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- Omakase Builder (Exclusive to 5F Room) --- */}
                {activeFloor === 5 && isInsideRoom && !selectedItem && (
                    <div className="absolute inset-x-12 bottom-12 top-24 pointer-events-auto flex gap-12">
                        {/* Budget & Summary Column */}
                        <div className="w-[400px] flex flex-col gap-8">
                            <div className="bg-obsidian rounded-[48px] p-10 border border-white/10 shadow-2xl flex flex-col gap-8">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">운용 예산 설정</span>
                                    <div className="flex flex-col gap-4">
                                        <h4 className="text-4xl font-black text-white tracking-tighter">₩{budget.toLocaleString()}</h4>
                                        <input
                                            type="range" min="10000000" max="200000000" step="10000000"
                                            value={budget} onChange={(e) => setBudget(Number(e.target.value))}
                                            className="w-full h-2 bg-white/10 rounded-full appearance-none accent-[#D4AF37] cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-white/10" />

                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">현재 선택 총액</span>
                                        <span className={`text-2xl font-black ${omakaseSelection.reduce((acc, item) => acc + parseInt(item.price.replace(/[^0-9]/g, '') || '0'), 0) > budget ? 'text-status-error' : 'text-white'}`}>
                                            ₩{omakaseSelection.reduce((acc, item) => acc + parseInt(item.price.replace(/[^0-9]/g, '') || '0'), 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-[#D4AF37]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (omakaseSelection.reduce((acc, item) => acc + parseInt(item.price.replace(/[^0-9]/g, '') || '0'), 0) / budget) * 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <button className="w-full h-20 bg-[#D4AF37] text-white rounded-3xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(212,175,55,0.3)]">
                                    패키지 확정하기
                                </button>
                            </div>

                            <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-[48px] border border-white/10 p-10 overflow-y-auto">
                                <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">선택 목록 ({omakaseSelection.length})</h5>
                                <div className="space-y-4">
                                    {omakaseSelection.map((item, idx) => (
                                        <div key={`${item.id}-${idx}`} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group">
                                            <div>
                                                <p className="text-[9px] font-black text-[#D4AF37] uppercase">{item.type}</p>
                                                <p className="text-white font-black text-sm">{item.title}</p>
                                            </div>
                                            <button
                                                onClick={() => setOmakaseSelection(prev => prev.filter(i => i.id !== item.id))}
                                                className="p-2 text-white/20 hover:text-white hover:bg-white/10 rounded-full"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {omakaseSelection.length === 0 && (
                                        <div className="h-32 flex items-center justify-center text-white/20 text-[10px] font-black uppercase tracking-[0.3em] border-2 border-dashed border-white/10 rounded-3xl">
                                            선택된 항목 없음
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Inventory Column */}
                        <div className="flex-1 bg-white/5 backdrop-blur-3xl rounded-[60px] border border-white/10 p-12 overflow-y-auto">
                            <div className="flex items-center justify-between mb-12">
                                <h3 className="text-5xl font-black text-white tracking-tighter uppercase italic">오마카세 <span className="text-[#D4AF37]">인벤토리</span></h3>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setOmakaseFilterFloor(null)}
                                        className={`px-5 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${omakaseFilterFloor === null ? 'bg-[#D4AF37] border-[#D4AF37] text-white' : 'border-white/10 text-white/40 hover:border-white/30'}`}
                                    >
                                        전체 층 보기
                                    </button>
                                    {[1, 2, 3, 4].map(floor => (
                                        <button
                                            key={floor}
                                            onClick={() => setOmakaseFilterFloor(floor)}
                                            className={`px-5 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${omakaseFilterFloor === floor ? 'bg-[#D4AF37] border-[#D4AF37] text-white' : 'border-white/10 text-white/40 hover:border-white/30'}`}
                                        >
                                            {floor}층
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                {Object.entries(pavilionData)
                                    .filter(([floor]) => omakaseFilterFloor === null || Number(floor) === omakaseFilterFloor)
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
                                                className={`p-8 rounded-[40px] border-2 cursor-pointer transition-all duration-500
                                                ${isSelected ? 'bg-[#D4AF37] border-[#D4AF37] scale-105 shadow-2xl' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                                            >
                                                <div className="flex justify-between items-start mb-6">
                                                    <span className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest ${isSelected ? 'bg-white text-obsidian' : 'bg-[#D4AF37] text-white'}`}>
                                                        {item.type}
                                                    </span>
                                                    <span className={`text-lg font-black ${isSelected ? 'text-white' : 'text-white/40'}`}>
                                                        {item.price}
                                                    </span>
                                                </div>
                                                <h4 className={`text-2xl font-black uppercase italic mb-2 ${isSelected ? 'text-white' : 'text-white'}`}>{item.title}</h4>
                                                <p className={`text-xs opacity-60 line-clamp-2 ${isSelected ? 'text-white' : 'text-white/60'}`}>{item.description}</p>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Bottom Navigation (Inside Room Only) --- */}
                {isInsideRoom && !selectedItem && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 pointer-events-auto">
                        <button
                            onClick={() => setIsInsideRoom(false)}
                            className="px-10 py-5 bg-obsidian text-white rounded-full text-xs font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
                        >
                            <ArrowLeft className="w-4 h-4" /> {activeFloor}층 로비로 돌아가기
                        </button>
                        <div className="px-10 py-4 bg-white/80 backdrop-blur-2xl rounded-full border border-white shadow-2xl flex flex-col items-center">
                            <span className="text-[9px] font-black text-obsidian/20 uppercase tracking-[0.5em]">Specialist Workspace</span>
                            <span className="text-xs font-black text-obsidian uppercase italic tracking-widest">{selectedOwner?.name}의 개인 전용 공간</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Immersive Intro (V8 Masterpiece) */}
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 1 } }}
                        className="absolute inset-0 z-[500] bg-white flex flex-col items-center justify-center"
                    >
                        <div className="max-w-4xl text-center space-y-16">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <span className="text-[12px] font-black text-obsidian/40 uppercase tracking-[0.8em] block mb-4">지금 당신은</span>
                                <h1 className="text-9xl font-black text-obsidian tracking-[ -0.05em] leading-none uppercase italic">
                                    MASTERPIECE<br /><span className="text-[#D4AF37]">PAVILION</span>
                                    <br /><span className="text-[20px] tracking-normal not-italic opacity-40">에 입장하고 계십니다</span>
                                </h1>
                            </motion.div>

                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                onClick={() => setShowIntro(false)}
                                className="group relative"
                            >
                                <div className="absolute -inset-10 bg-[#D4AF37]/20 rounded-full blur-3xl animate-pulse group-hover:bg-[#D4AF37]/40 transition-all" />
                                <div className="relative h-32 px-24 bg-obsidian text-white font-black text-2xl rounded-full flex items-center justify-center gap-6 group-hover:scale-110 active:scale-95 transition-all border-4 border-white shadow-2xl shadow-obsidian/40">
                                    가상 체험 시작하기
                                    <ArrowRight className="w-8 h-8 group-hover:translate-x-4 transition-transform" />
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
