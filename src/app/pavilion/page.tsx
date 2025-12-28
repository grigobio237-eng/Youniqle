// [GALLERY_MASTERPIECE_V8] - Immersive First-Person Commerce Gallery
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Info, ArrowLeft, RefreshCw, AlertCircle, X, ArrowRight, User, Image as LucideImage, ShoppingCart, Calendar, Ruler, Award } from 'lucide-react';
import Link from 'next/link';

// Direct imports
import ConventionCenter from '@/components/convention/ConventionCenter';
import ElevatorUI from '@/components/convention/ElevatorUI';

// --- Types & Mock Data ---
// --- Unified Types & Multi-Floor Data ---
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

export const PAVILION_DATA: Record<number, FloorOwner[]> = {
    1: [ // Art Gallery
        {
            id: 'artist-a',
            name: 'Master A',
            role: 'Media Artist',
            bio: '디지털 생명력과 회복의 메시지를 담는 미디어 아트의 거장입니다.',
            items: [
                { id: 'art-a1', type: 'ARTWORK', title: 'Eternal Recovery I', description: '영원한 회복의 첫 번째 전조를 시각화한 대작입니다.', specs: { size: '250x250cm', medium: 'Digital mix' }, price: '₩25,000,000', rental: '₩1,200,000' },
                { id: 'art-a2', type: 'ARTWORK', title: 'Soul Resonance', description: '영혼의 공명을 담은 위치 가변형 작품입니다.', specs: { size: '180x210cm', medium: 'NFT Board' }, price: '₩18,000,000', rental: '₩800,000' },
                { id: 'art-a3', type: 'ARTWORK', title: 'Flow of Vitality', description: '생명력의 흐름을 유기적인 곡선으로 표현한 디지털 캔버스입니다.', specs: { size: '120x120cm', medium: 'LED Matrix' }, price: '₩12,500,000', rental: '₩500,000' },
            ]
        },
        {
            id: 'artist-b',
            name: 'Master B',
            role: 'Digital Sculptor',
            bio: '가상 공간에서의 형태와 질감을 재정의하는 디지털 조각가입니다.',
            items: [
                { id: 'art-b1', type: 'ARTWORK', title: 'Virtual Form', description: '가상 세계의 본질을 담은 조각 작품입니다.', specs: { platform: 'Unity 3D', format: 'Interactive' }, price: '₩12,000,000' },
                { id: 'art-b2', type: 'ARTWORK', title: 'Cybernetic Anatomy', description: '인간과 기계의 융합을 탐구하는 디지털 정밀 조형물입니다.', specs: { format: 'USDZ', textures: '8K PBR' }, price: '₩15,500,000' },
            ]
        },
        {
            id: 'artist-c',
            name: 'Master C',
            role: 'Abstract Painter',
            bio: '무의식의 흐름을 강렬한 색채로 표현하는 추상화가입니다.',
            items: [
                { id: 'art-c3', type: 'ARTWORK', title: 'Chaos & Order', description: '혼돈 속에서 발견하는 회복의 질서입니다.', specs: { material: 'Oil on Canvas', size: '150x150cm' }, price: '₩30,000,000' },
                { id: 'art-c4', type: 'ARTWORK', title: 'Ethereal Calm', description: '깊은 명상 상태에서 영감을 얻은 평온한 색채의 정수입니다.', specs: { material: 'Acrylic on Linen', size: '200x200cm' }, price: '₩22,000,000' },
            ]
        }
    ],
    2: [ // Prestige Shop
        {
            id: 'shop-a',
            name: 'Elena Vance',
            role: 'Luxury Curator',
            bio: '전 세계 최상위 1%를 위한 회복 솔루션 아이템을 큐레이션합니다.',
            items: [
                { id: 'shop-p1', type: 'PRODUCT', title: 'Nano-Ceramic Kit', description: '스위스 연구소의 기술력이 집약된 세포 재생 홈케어 시스템입니다.', specs: { tech: 'Nano-Cell', origin: 'Switzerland' }, price: '₩3,500,000' },
                { id: 'shop-p2', type: 'PRODUCT', title: 'Obsidian Diffuser', description: '심신 안정을 돕는 아이슬란드산 고밀도 흑요석 디퓨저 세트입니다.', specs: { material: 'Volcanic Rock', scent: 'Deep Forest' }, price: '₩850,000' },
                { id: 'shop-p3', type: 'PRODUCT', title: 'Silk Sleep Aura', description: '숙면을 위한 100% 최고급 실크 및 은 이온 항균 처리 침구 세트입니다.', specs: { material: 'Mulberry Silk', tech: 'Silver Ion' }, price: '₩2,100,000' },
            ]
        },
        {
            id: 'shop-b',
            name: 'Tech Master X',
            role: 'Bio-Hacking Specialist',
            bio: '최첨단 바이오 해킹 디바이스를 통해 신체 기능을 최적화합니다.',
            items: [
                { id: 'shop-p4', type: 'PRODUCT', title: 'Neural Sync Headset', description: '뇌파를 동기화하여 순식간에 깊은 휴식 상태로 유도하는 헤드셋입니다.', specs: { sensor: 'Dry EEG', channels: '16' }, price: '₩4,800,000' },
                { id: 'shop-p5', type: 'PRODUCT', title: 'Oxygen Infusion Chamber', description: '고농도 산소 공급을 통해 빠른 피로 회복을 돕는 개인용 챔버입니다.', specs: { pressure: '1.5 ATA', oxygen: '95%' }, price: '₩15,000,000' },
            ]
        }
    ],
    3: [ // Dynamic Coaching
        {
            id: 'coach-a',
            name: 'Coach Leon',
            role: 'Performance specialist',
            bio: '국가대표 선수들의 컨디셔닝을 담당하는 신체 회복 전문가입니다.',
            items: [
                { id: 'coach-c1', type: 'COACHING', title: 'Neuro-Muscle Reset', description: '신경계와 근육의 조화를 되찾아주는 1:1 리셋 프로그램입니다.', specs: { duration: '90min', level: 'Professional' }, price: '₩450,000 / Session' },
                { id: 'coach-c2', type: 'COACHING', title: 'Mobility Flow VR', description: 'VR 환경에서 진행되는 맞춤형 가동성 향상 코칭입니다.', specs: { tech: 'VR-Track', focus: 'Mobility' }, price: '₩1,200,000 / 10회' },
            ]
        },
        {
            id: 'coach-b',
            name: 'Mind Master J',
            role: 'Mental Health Coach',
            bio: '고도의 집중력과 멘탈 회복을 돕는 정석 멘탈 코치입니다.',
            items: [
                { id: 'coach-c3', type: 'COACHING', title: 'Zen Focus Strategy', description: '비즈니스 리더들을 위한 고도의 집중력 유지 및 스트레스 관리 전략입니다.', specs: { duration: '60min', sessions: 'Monthly' }, price: '₩800,000' },
                { id: 'coach-c4', type: 'COACHING', title: 'Breath Control Master', description: '호흡법을 통한 자율신경계 조절 및 불안 해소 프로그램입니다.', specs: { focus: 'Breathing', level: 'All-Levels' }, price: '₩300,000' },
            ]
        }
    ],
    4: [ // Medical Archive
        {
            id: 'med-a',
            name: 'Dr. Sarah',
            role: 'Medical Director',
            bio: '유전자 분석 기반의 정밀 의료 솔루션을 제공하는 의학 박사입니다.',
            items: [
                { id: 'med-m1', type: 'MEDICAL', title: 'Genome Recovery Plan', description: '유전자 분석을 통해 설계된 개인맞춤형 재생 치료 플랜입니다.', specs: { analysis: 'Whole Genome', duration: '3 Months' }, price: '₩12,000,000' },
                { id: 'med-m2', type: 'MEDICAL', title: 'IV Nutrient Infusion', description: '세포 활성화를 위한 고농축 영양 수액 테라피입니다.', specs: { type: 'Intravenous', effect: 'Cellular Regen' }, price: '₩350,000' },
            ]
        },
        {
            id: 'med-b',
            name: 'Dr. Kim',
            role: 'Longevity Researcher',
            bio: '항노화 및 장수 과학을 전문으로 하는 내과 전문의입니다.',
            items: [
                { id: 'med-m3', type: 'MEDICAL', title: 'Anti-Aging Protocol', description: '텔로미어 관리 및 생체 시계를 되돌리는 의학적 가이드를 제공합니다.', specs: { focus: 'Telomeres', cycles: '6 Months' }, price: '₩25,000,000' },
                { id: 'med-m4', type: 'MEDICAL', title: 'Metabolic Detox', description: '대사 기능을 정상화하고 체내 독소를 제거하는 집중 케어입니다.', specs: { program: '7 Days Detox', monitor: '24/7' }, price: '₩1,800,000' },
            ]
        }
    ],
    5: [ // Omakase Suite
        {
            id: 'omakase-master',
            name: 'The Orchestrator',
            role: 'Custom Architect',
            bio: '당신만의 완벽한 회복 여정을 위한 모든 아이템을 조율합니다.',
            items: [
                { id: 'omakase-o1', type: 'OMAKASE', title: 'Ultimate Recovery Suite', description: '1~4층의 모든 혜택이 집약된 단 하나의 맞춤형 패키지입니다.', specs: { customization: 'Full-Range', concierge: '24/7' }, price: 'Custom Quote' },
                { id: 'omakase-o2', type: 'OMAKASE', title: 'Executive Wellness Pass', description: '핵심 케어 요소만 엄선하여 바쁜 경영진을 위해 설계된 집중 패키지입니다.', specs: { quick: 'Yes', quality: 'Top-Tier' }, price: '₩80,000,000' },
            ]
        }
    ]
};

export default function PavilionPage() {
    const [activeFloor, setActiveFloor] = useState(1);
    const [mounted, setMounted] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [engineStatus, setEngineStatus] = useState<'LOADING' | 'READY' | 'FAIL'>('LOADING');

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
        const timer = setTimeout(() => {
            if (engineStatus === 'LOADING' && !showIntro) setEngineStatus('FAIL');
        }, 12000);
        return () => clearTimeout(timer);
    }, [engineStatus, showIntro]);

    // Handle Specialist Click
    const onArtistClick = (id: string) => {
        const owner = PAVILION_DATA[activeFloor]?.find(o => o.id === id);
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
                                {Object.entries(PAVILION_DATA)
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
