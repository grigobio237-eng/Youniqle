'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Image as LucideImage } from 'lucide-react';
import { PavilionItem } from '@/hooks/usePavilionState';

interface ItemDetailModalProps {
    item: PavilionItem | null;
    isImageZoomed: boolean;
    onClose: () => void;
    onZoom: () => void;
    onCloseZoom: () => void;
}

export default function ItemDetailModal({
    item,
    isImageZoomed,
    onClose,
    onZoom,
    onCloseZoom
}: ItemDetailModalProps) {
    if (!item) return null;

    const parsePrice = (priceStr: string) => {
        return parseInt(priceStr.replace(/[^0-9]/g, '') || '0');
    };

    return (
        <>
            {/* Item Detail Overlay */}
            <AnimatePresence>
                {item && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[9999] bg-white/95 backdrop-blur-3xl flex flex-col items-center justify-start p-6 md:p-12 pt-28 md:pt-32 pointer-events-auto overflow-y-auto"
                    >
                        <button
                            onClick={onClose}
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
                                onClick={onZoom}
                            >
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        onContextMenu={(e) => e.preventDefault()}
                                        draggable={false}
                                        style={{ userSelect: 'none', WebkitUserDrag: 'none' } as any}
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
                                        <span className="px-2 py-0.5 bg-[#D4AF37] text-white font-black text-[6px] md:text-[9px] uppercase tracking-widest rounded">{item.type}</span>
                                    </div>
                                    <h3 className="text-2xl md:text-7xl font-black text-obsidian tracking-tighter uppercase italic leading-tight md:leading-none">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs md:text-2xl font-serif text-obsidian/50 leading-relaxed italic border-l-2 md:border-l-4 border-[#D4AF37] pl-3 md:pl-8">
                                        "{item.description}"
                                    </p>
                                </div>

                                {/* Specs Section - Clean 2-Column Grid */}
                                <div className="grid grid-cols-2 gap-8 py-2">
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase">SIZE</span>
                                        <p className="font-serif italic text-xl text-obsidian">{item.canvasSize || 'Variable'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase">MATERIAL</span>
                                        <p className="font-serif italic text-xl text-obsidian">{item.specs.material || 'Mixed Media'}</p>
                                    </div>
                                </div>

                                {/* Pricing & Actions Section - With Top Border */}
                                <div className="space-y-8 pt-8 border-t border-gray-100">
                                    <div className="flex flex-col gap-2">
                                        {/* Ownership Price */}
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase">OWNERSHIP</span>
                                            <span className="font-serif italic text-2xl text-gray-500">
                                                {item.price === 'Price on Request' ? 'Price on Request' : `₩${Number(parsePrice(item.price)).toLocaleString()}`}
                                            </span>
                                        </div>

                                        {/* Rental Price - Highlighted */}
                                        {item.rental && (
                                            <div className="flex items-baseline justify-between mt-2">
                                                <span className="text-[10px] font-bold text-[#D4AF37] tracking-[0.3em] uppercase">MONTHLY RENTAL</span>
                                                <span className="font-black text-4xl text-obsidian tracking-tighter">
                                                    <span className="text-lg align-top mr-1 font-serif italic text-[#D4AF37]">₩</span>
                                                    {Number(parsePrice(item.rental)).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <button className="h-14 border border-black text-black text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                                            구매 문의하기
                                        </button>
                                        <button
                                            disabled={!item.rental}
                                            className="h-14 bg-black text-white text-[11px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {item.rental ? '대여 신청하기' : '대여 불가'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image Zoom Modal */}
            <AnimatePresence>
                {isImageZoomed && item && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl cursor-zoom-out"
                        onClick={(e) => {
                            e.stopPropagation();
                            onCloseZoom();
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full h-full flex items-center justify-center pointer-events-none"
                        >
                            <img
                                src={item.image}
                                alt={item.title}
                                onContextMenu={(e) => e.preventDefault()}
                                draggable={false}
                                style={{ userSelect: 'none', WebkitUserDrag: 'none' } as any}
                                className="max-w-full max-h-full object-contain shadow-2xl pointer-events-auto"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCloseZoom();
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
