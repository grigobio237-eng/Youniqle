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

                                <div className="grid grid-cols-2 gap-px bg-obsidian/5 rounded-xl md:rounded-2xl overflow-hidden border border-obsidian/5">
                                    {item.canvasSize && (
                                        <div className="p-3 md:p-8 bg-white/40 space-y-1 md:space-y-2">
                                            <span className="text-[6px] md:text-[9px] font-black uppercase tracking-widest text-obsidian/30">CANVAS SIZE</span>
                                            <p className="font-black text-obsidian text-xs md:text-lg">{item.canvasSize}</p>
                                        </div>
                                    )}
                                    {Object.entries(item.specs).map(([key, value]) => (
                                        <div key={key} className="p-3 md:p-8 bg-white/40 space-y-1 md:space-y-2">
                                            <span className="text-[6px] md:text-[9px] font-black uppercase tracking-widest text-obsidian/30">{key}</span>
                                            <p className="font-black text-obsidian text-xs md:text-lg">{value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 md:space-y-6 pt-2">
                                    <div className="flex flex-col gap-2 md:gap-4 pb-3 md:pb-4 border-b border-obsidian/5">
                                        {item.rental && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-[8px] md:text-[10px] font-black text-[#D4AF37] uppercase tracking-widest italic">렌탈 (월)</span>
                                                <span className="text-lg md:text-2xl font-black text-obsidian tracking-tighter">₩{parsePrice(item.rental).toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-[8px] md:text-[10px] font-black text-obsidian/30 uppercase tracking-widest italic">가치 산정액</span>
                                            <span className="text-xl md:text-4xl font-black text-obsidian tracking-tighter">₩{parsePrice(item.price).toLocaleString()}</span>
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
