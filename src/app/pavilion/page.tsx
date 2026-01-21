'use client';

import React, { Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LucideImage, ArrowLeft, X, ChevronRight, ShoppingCart, Loader2 } from 'lucide-react';
import Link from 'next/link';

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
            {/* 3D Environment - 방 내부(isInsideRoom)일 때만 렌더링 */}
            {s.isInsideRoom && (
                <div className="absolute inset-0 z-0">
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

            {/* Gallery Navigation Arrows (Only inside 1st floor gallery) */}
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

            {/* Floors: 2D Lobby Content (Animated) */}
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
                        {s.activeFloor === 1 && (
                            <Floor1Gallery
                                viewMode={s.viewMode}
                                owners={s.currentFloorOwners}
                                selectedArtistId={s.selectedArtistId}
                                onArtistSelect={s.handleArtistClick}
                                onEnterGallery={s.enterRoom}
                                onBack={() => s.setViewMode('ART_GRID')}
                            />
                        )}
                        {s.activeFloor === 2 && (
                            <Floor2Shop
                                viewMode={s.viewMode}
                                owners={s.currentFloorOwners}
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
                                owners={s.currentFloorOwners}
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
                                owners={s.currentFloorOwners}
                                selectedArtistId={s.selectedArtistId}
                                onArtistSelect={s.handleArtistClick}
                                onEnterGallery={s.enterRoom}
                                onBack={() => s.setViewMode('ART_GRID')}
                                onViewSchedule={() => s.setShowScheduleModal(true)}
                            />
                        )}
                        {s.activeFloor === 5 && !s.showIntro && <LoungeContent />}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium UI Overlay Layer */}
            <div className="relative z-50 w-full h-full pointer-events-none">
                {/* HUD: Header */}
                {!s.selectedItem && (
                    <div className="absolute top-0 left-0 w-full p-6 md:p-12 flex justify-between items-start pointer-events-auto">
                        <div className="flex items-center gap-6 md:gap-12">
                            <div className="flex items-center gap-4 text-obsidian">
                                <Link href="/" className="hover:opacity-70 transition-opacity">
                                    <LucideImage className="w-8 h-8 md:w-10 md:h-10" />
                                </Link>
                                <div className="space-y-0.5">
                                    <h1 className="text-sm md:text-xl font-black tracking-tighter uppercase italic leading-none">
                                        {s.activeFloor === 1 ? 'Art Gallery' : s.activeFloor === 2 ? 'Prestige Shop' : s.activeFloor === 3 ? 'Dynamic Coaching' : s.activeFloor === 4 ? 'Medical Archive' : 'Private Lounge'}
                                    </h1>
                                    <p className="text-[6px] md:text-[8px] font-black opacity-30 uppercase tracking-widest">Floor {s.activeFloor} Control Center</p>
                                </div>
                            </div>
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
                onSubmit={() => { }} // Placeholder or handle within hook
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
                                <div className="relative h-24 md:h-32 px-16 md:px-32 bg-obsidian text-white font-black text-xl md:text-2xl rounded-full flex items-center justify-center gap-6 group-hover:scale-110 transition-all border-4 border-white shadow-2xl">
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

