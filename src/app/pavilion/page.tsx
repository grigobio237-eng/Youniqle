'use client';

import React, { Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LucideImage, ArrowLeft, X, ChevronRight, Loader2, Search, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Hook & Components
import { usePavilionState } from '@/hooks/usePavilionState';
import ConventionCenter from '@/components/convention/ConventionCenter';
import ElevatorUI from '@/components/convention/ElevatorUI';
import {
    LoungeContent,
    ItemDetailModal,
    ScheduleBookingModal,
    OnboardingGuide
} from '@/components/pavilion';

// Floor Components
import Floor1Gallery from '@/components/pavilion/floors/Floor1Gallery';
import Floor2Shop from '@/components/pavilion/floors/Floor2Shop';
import Floor3Coaching from '@/components/pavilion/floors/Floor3Coaching';
import Floor4Medical from '@/components/pavilion/floors/Floor4Medical';

function PavilionContent() {
    const s = usePavilionState();

    if (!s.mounted) return null;

    return (
        <main className="relative w-full h-screen overflow-hidden bg-white font-sans selection:bg-[#D4AF37] selection:text-white">
            {/* 3D Environment */}
            {s.isInsideRoom && (
                <div className="absolute inset-0 z-0 text-obsidian">
                    <ConventionCenter
                        activeFloor={s.activeFloor}
                        selectedArtistId={s.selectedArtistId}
                        selectedOwner={s.selectedOwner}
                        selectedItemId={s.selectedItem?.id || null}
                        isInsideRoom={s.isInsideRoom}
                        onReady={() => { }}
                        onArtistClick={s.handleArtistClick}
                        onArtworkClick={s.handleArtworkClick}
                        onEnterRoom={s.enterRoom}
                        floorData={s.currentFloorOwners}
                        panOffset={s.galleryOffset}
                    />
                </div>
            )}

            {/* Gallery Navigation Arrows */}
            {s.activeFloor === 1 && s.isInsideRoom && !s.selectedItem && (
                <>
                    <button
                        onClick={() => s.setGalleryOffset(prev => prev - 20)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-6 md:p-10 text-obsidian/10 hover:text-obsidian/30 transition-all pointer-events-auto group"
                    >
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ChevronRight className="w-full h-full rotate-180 opacity-10 group-hover:opacity-40" />
                        </div>
                    </button>
                    <button
                        onClick={() => s.setGalleryOffset(prev => prev + 20)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-6 md:p-10 text-obsidian/10 hover:text-obsidian/30 transition-all pointer-events-auto group"
                    >
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ChevronRight className="w-full h-full opacity-10 group-hover:opacity-40" />
                        </div>
                    </button>
                </>
            )}

            {/* Floors: 2D Lobby Content */}
            <AnimatePresence mode="wait">
                {!s.isInsideRoom && (
                    <motion.div
                        key={s.activeFloor}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 z-10"
                    >
                        {s.activeFloor <= 4 && s.filteredOwners.length === 0 && s.searchQuery && (
                            <div className="flex flex-col items-center justify-center h-full text-obsidian/20 space-y-6">
                                <Search className="w-16 h-16 opacity-20" />
                                <div className="text-center space-y-2">
                                    <p className="text-xl font-black italic uppercase tracking-tighter">No Results Found</p>
                                    <p className="text-[10px] font-bold tracking-widest uppercase">' {s.searchQuery} ' 에 대한 검색 결과가 없습니다.</p>
                                </div>
                                <button
                                    onClick={() => s.setSearchQuery('')}
                                    className="px-6 py-2 bg-obsidian text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                                >
                                    검색어 초기화
                                </button>
                            </div>
                        )}

                        {s.activeFloor === 1 && (
                            <Floor1Gallery
                                viewMode={s.viewMode}
                                owners={s.filteredOwners}
                                selectedArtistId={s.selectedArtistId}
                                onArtistSelect={s.handleArtistClick}
                                onEnterGallery={s.enterRoom}
                                onBack={() => s.setViewMode('ART_GRID')}
                            />
                        )}
                        {s.activeFloor === 2 && (
                            <Floor2Shop
                                viewMode={s.viewMode}
                                owners={s.filteredOwners}
                                selectedArtistId={s.selectedArtistId}
                                onArtistSelect={s.handleArtistClick}
                                onEnterGallery={s.enterRoom}
                                onBack={() => s.setViewMode('ART_GRID')}
                                onItemClick={s.handleArtworkClick}
                            />
                        )}
                        {s.activeFloor === 3 && (
                            <Floor3Coaching
                                viewMode={s.viewMode}
                                owners={s.filteredOwners}
                                selectedArtistId={s.selectedArtistId}
                                onArtistSelect={s.handleArtistClick}
                                onEnterGallery={s.enterRoom}
                                onBack={() => s.setViewMode('ART_GRID')}
                                onViewSchedule={() => s.setShowScheduleModal(true)}
                            />
                        )}
                        {s.activeFloor === 4 && (
                            <Floor4Medical
                                viewMode={s.viewMode}
                                owners={s.filteredOwners}
                                selectedArtistId={s.selectedArtistId}
                                onArtistSelect={s.handleArtistClick}
                                onEnterGallery={s.enterRoom}
                                onBack={() => s.setViewMode('ART_GRID')}
                                onViewSchedule={() => s.setShowScheduleModal(true)}
                            />
                        )}
                        {s.activeFloor === 5 && !s.showIntro && (
                            <LoungeContent owners={s.currentFloorOwners} />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 5F Access Shadow Nudge */}
            <AnimatePresence>
                {s.showLoungeNudge && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-luxury-navy/90 backdrop-blur-3xl flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="max-w-2xl w-full bg-white rounded-[32px] md:rounded-[48px] overflow-y-auto max-h-[90vh] shadow-2xl relative p-8 md:p-20 text-center space-y-8 md:space-y-10 scrollbar-hide"
                        >
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-luxury-gold/10 blur-[80px] rounded-full" />

                            <div className="space-y-6 relative">
                                <div className="w-20 h-20 bg-luxury-gold/5 rounded-3xl flex items-center justify-center mx-auto text-luxury-gold mb-8">
                                    <Lock className="w-10 h-10" />
                                </div>
                                <Badge className="bg-luxury-gold/10 text-luxury-gold border-none font-black px-4 py-1.5 uppercase tracking-widest text-[10px]">Access Restricted</Badge>
                                <h2 className="text-3xl md:text-5xl font-black text-luxury-navy tracking-tighter italic">
                                    Private <span className="luxury-gold-text tracking-normal">Mastery Lounge</span>
                                </h2>
                                <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
                                    5층 프라이빗 라운지는 유니클의 <b className="text-luxury-navy">REBORN</b> 등급 이상 회원에게만 허락된 최상위 회복 공간입니다.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Requirement</p>
                                    <p className="text-xs font-black text-luxury-navy">500 Points</p>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Consistency</p>
                                    <p className="text-xs font-black text-luxury-navy">30 Days Streak</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 justify-center items-center pt-4">
                                <Button
                                    onClick={() => s.setShowLoungeNudge(false)}
                                    variant="ghost"
                                    className="h-16 px-10 rounded-2xl font-black text-slate-400 hover:text-luxury-navy text-xs"
                                >
                                    나중에 둘러보기
                                </Button>
                                <Button className="h-16 px-10 rounded-2xl bg-luxury-navy text-white font-black hover:scale-105 transition-all shadow-xl shadow-luxury-navy/20 text-xs" asChild>
                                    <Link href="/membership">내 등급 올리기 <ArrowRight className="ml-2 w-5 h-5 text-luxury-gold" /></Link>
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium UI Overlay Layer */}
            <div className="relative z-50 w-full h-full pointer-events-none">
                {!s.selectedItem && (
                    <div className="absolute top-0 left-0 w-full p-6 md:p-12 flex justify-between items-start pointer-events-none transition-all">
                        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 w-full pointer-events-auto">
                            <div className="flex items-center gap-4 text-obsidian shrink-0">
                                <Link href="/" className="hover:opacity-70 transition-opacity">
                                    <LucideImage className="w-8 h-8 md:w-10 md:h-10" />
                                </Link>
                                <div className="space-y-0.5">
                                    <h1 className="text-sm md:text-xl font-black tracking-tighter uppercase italic leading-none">
                                        {s.activeFloor <= 1 ? '아트 갤러리' : s.activeFloor === 2 ? '프레스티지 샵' : s.activeFloor === 3 ? '다이내믹 코칭' : s.activeFloor === 4 ? '메디컬 아카이브' : '프라이빗 라운지'}
                                    </h1>
                                    <p className="text-[6px] md:text-[8px] font-black opacity-30 uppercase tracking-widest">{s.activeFloor}F 전용 관리 시스템</p>
                                </div>
                            </div>

                            {/* Center Search Bar */}
                            {s.activeFloor <= 4 && !s.isInsideRoom && (
                                <div className="flex-1 max-w-xl mx-auto w-full group">
                                    <div className="relative">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian/30 group-focus-within:text-obsidian transition-colors" />
                                        <input
                                            type="text"
                                            placeholder={`${s.activeFloor === 1 ? '아티스트 또는 작품명' : s.activeFloor === 2 ? '럭셔리 상품명' : '프로그램명 또는 전문가'} 검색...`}
                                            value={s.searchQuery}
                                            onChange={(e) => s.setSearchQuery(e.target.value)}
                                            className="w-full h-14 md:h-16 pl-14 pr-6 bg-slate-50 border-none rounded-full text-xs font-bold text-obsidian placeholder:text-obsidian/20 focus:ring-2 focus:ring-obsidian/5 transition-all outline-none shadow-sm group-hover:bg-slate-100 transition-colors"
                                        />
                                        {s.searchQuery && (
                                            <button
                                                onClick={() => s.setSearchQuery('')}
                                                className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-200 rounded-full transition-colors"
                                            >
                                                <X className="w-4 h-4 text-obsidian/40" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Level Navigator */}
                {!s.isInsideRoom && !s.selectedItem && (
                    <div className="pointer-events-auto">
                        <ElevatorUI activeFloor={s.activeFloor} onFloorChange={s.handleFloorChange} />
                    </div>
                )}

                {/* Bottom Navigation (Inside Room) */}
                {s.isInsideRoom && !s.selectedItem && (
                    <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col md:flex-row items-center gap-4 md:gap-8 pointer-events-auto w-[calc(100%-48px)] md:w-auto">
                        <button
                            onClick={s.exitRoom}
                            className="w-full md:w-auto px-6 py-4 md:px-10 md:py-5 bg-obsidian text-white rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.4em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
                        >
                            <ArrowLeft size={16} /> {s.activeFloor}층 로비로 돌아가기
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ItemDetailModal
                item={s.selectedItem}
                isImageZoomed={s.isImageZoomed}
                onClose={s.closeItem}
                onZoom={() => s.setIsImageZoomed(true)}
                onCloseZoom={() => s.setIsImageZoomed(false)}
            />

            <ScheduleBookingModal
                show={s.showScheduleModal}
                onClose={() => s.setShowScheduleModal(false)}
                owner={s.selectedOwner}
                selectedProgramId={s.selectedProgramId}
                selectedProgramPrice={s.selectedProgramPrice}
                bookingDate={s.bookingDate}
                bookingSlot={s.bookingSlot}
                isBooking={s.isBooking}
                onSelectProgram={(id, title, price) => {
                    s.setSelectedProgramId(id);
                    s.setSelectedProgramTitle(title);
                    s.setSelectedProgramPrice(price);
                }}
                onSelectDate={s.setBookingDate}
                onSelectSlot={s.setBookingSlot}
                onSubmit={() => { }} // Placeholder
                modalTitle={s.activeFloor === 4 ? '의료 상담 스케줄 확인' : '코칭 스케줄 확인'}
                programLabel={s.activeFloor === 4 ? '상담 프로그램 선택' : '코칭 프로그램 선택'}
                dateLabel={s.activeFloor === 4 ? '상담 가능 날짜 선택' : '활동 가능 날짜 선택'}
                submitLabel={s.activeFloor === 4 ? '예약하기' : '결제 및 예약하기'}
            />

            <OnboardingGuide
                show={s.showOnboarding}
                onClose={s.dismissOnboarding}
            />

            {/* Intro */}
            <AnimatePresence>
                {s.showIntro && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 1 } }}
                        className="absolute inset-0 z-[500] bg-white flex flex-col items-center justify-center p-6"
                        onClick={s.dismissIntro}
                    >
                        <div className="max-w-4xl w-full text-center space-y-12">
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                <span className="text-xs font-black text-obsidian/40 uppercase tracking-[0.8em] block mb-4">지금 당신은</span>
                                <h1 className="text-5xl md:text-9xl font-black text-obsidian tracking-tighter leading-tight uppercase italic">
                                    MASTERPIECE<br /><span className="text-[#D4AF37]">PAVILION</span>
                                </h1>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="group relative cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    s.dismissIntro();
                                }}
                            >
                                <div className="absolute -inset-10 bg-[#D4AF37]/20 rounded-full blur-3xl animate-pulse" />
                                <div className="relative h-24 md:h-32 px-16 md:px-32 bg-obsidian text-white font-black text-xl md:text-2xl rounded-full flex items-center justify-center gap-6 group-hover:scale-110 transition-all border-4 border-white shadow-2xl text-center">
                                    가상 체험 시작하기
                                    <ArrowLeft className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-4 transition-transform rotate-180" />
                                </div>
                            </motion.div>
                            <p className="text-[10px] font-black text-obsidian/20 uppercase tracking-[0.4em] italic">V8.0 PRESTIGE EDITION</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}

export default function PavilionPage() {
    return (
        <Suspense fallback={
            <div className="w-full h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 animate-spin text-obsidian/20" />
            </div>
        }>
            <PavilionContent />
        </Suspense>
    );
}
