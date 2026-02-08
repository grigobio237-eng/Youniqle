import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Image as LucideImage, MessageSquare } from 'lucide-react';
import { PavilionItem } from '@/hooks/usePavilionState';

interface ItemDetailModalProps {
    item: PavilionItem | null;
    floor?: number;
    artistId?: string;
    isImageZoomed: boolean;
    onClose: () => void;
    onZoom: () => void;
    onCloseZoom: () => void;
}

export default function ItemDetailModal({
    item,
    floor,
    artistId,
    isImageZoomed,
    onClose,
    onZoom,
    onCloseZoom
}: ItemDetailModalProps) {
    const { data: session } = useSession();
    const [isInquiryOpen, setIsInquiryOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inquiryForm, setInquiryForm] = useState({
        name: '',
        email: '',
        phone: '',
        type: 'product', // Default to product (buying)
        message: ''
    });
    if (!item) return null;

    console.log('ItemDetailModal item:', item);
    console.log('Rental Status:', item.rentalStatus);
    console.log('Rental Price:', item.rental);


    const parsePrice = (priceStr: string) => {
        return parseInt(priceStr.replace(/[^0-9]/g, '') || '0');
    };

    const handleInquirySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: inquiryForm.type,
                    subject: `[파빌리온 문의] ${item?.title}`,
                    content: inquiryForm.message,
                    name: inquiryForm.name || session?.user?.name,
                    email: inquiryForm.email || session?.user?.email,
                    phoneNumber: inquiryForm.phone,
                    floor: floor,
                    artistId: artistId,
                    tags: ['pavilion', item?.title, item?.id]
                })
            });

            if (res.ok) {
                alert('문의가 성공적으로 접수되었습니다.\n담당자가 확인 후 연락드리겠습니다.');
                setIsInquiryOpen(false);
                setInquiryForm({ name: '', email: '', phone: '', type: 'product', message: '' });
            } else {
                const data = await res.json();
                alert(data.error?.message || '문의 접수에 실패했습니다.');
            }
        } catch (error) {
            console.error(error);
            alert('오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openInquiry = (type: 'product' | 'payment') => { // reusing types: 'product' for buy, 'payment' for rent (mapped internally)
        setInquiryForm(prev => ({
            ...prev,
            type: type === 'product' ? 'product' : 'payment', // using existing API types. 'payment' -> rental? Or just use 'product' and specify in message.
            // Actually API allows: 'general', 'delivery', 'payment', 'product', 'technical', 'refund', 'partnership'
            // Let's use 'product' for Buy, and 'general' or 'payment' for Rent?
            // Or better: Use 'product' for both and differentiate in Subject/Content.
            // Let's stick to 'product' and add type details in content or subject.
            message: type === 'product'
                ? `작품명: ${item?.title}\n\n이 작품을 소장하고 싶습니다. 구매 절차를 안내해 주세요.`
                : `작품명: ${item?.title}\n\n이 작품을 렌탈하고 싶습니다. 렌탈 절차를 안내해 주세요.`
        }));
        setIsInquiryOpen(true);
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
                                    <h3 className="text-2xl md:text-7xl font-black text-obsidian tracking-tighter uppercase italic leading-tight md:leading-none flex items-center gap-4 flex-wrap">
                                        {item.title}
                                        {item.rentalStatus === 'rented' && (
                                            <span className="px-3 py-1 bg-red-500 text-white text-[10px] md:text-xs font-black tracking-widest rounded-full uppercase not-italic align-middle">RENTED</span>
                                        )}
                                        {item.rentalStatus === 'processing' && (
                                            <span className="px-3 py-1 bg-blue-500 text-white text-[10px] md:text-xs font-black tracking-widest rounded-full uppercase not-italic align-middle">PROCESSING</span>
                                        )}
                                        {item.rentalStatus === 'unavailable' && (
                                            <span className="px-3 py-1 bg-gray-500 text-white text-[10px] md:text-xs font-black tracking-widest rounded-full uppercase not-italic align-middle">UNAVAILABLE</span>
                                        )}
                                        {item.rentalStatus === 'available' && item.rental && (
                                            <span className="px-3 py-1 bg-green-600 text-white text-[10px] md:text-xs font-black tracking-widest rounded-full uppercase not-italic align-middle">RENTAL AVAILABLE</span>
                                        )}
                                    </h3>
                                    <p className="text-xs md:text-2xl font-serif text-obsidian/50 leading-relaxed italic border-l-2 md:border-l-4 border-[#D4AF37] pl-3 md:pl-8 whitespace-pre-line">
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

                                    {/* Unified Action Button */}
                                    <div className="w-full">
                                        <button
                                            onClick={() => openInquiry('product')}
                                            className="w-full h-16 bg-black text-white text-sm font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-3"
                                        >
                                            <MessageSquare size={20} />
                                            작품 문의 / 렌탈 신청
                                        </button>
                                        <p className="text-center text-xs text-gray-400 mt-3 font-medium">
                                            * 클릭 시 구매 또는 렌탈 상담을 위한 문의 양식이 나타납니다.
                                        </p>
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
            {/* Inquiry Modal */}
            <AnimatePresence>
                {isInquiryOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10001] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setIsInquiryOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setIsInquiryOpen(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-black"
                            >
                                <X size={24} />
                            </button>

                            <h3 className="text-2xl font-black text-obsidian mb-2">작품 문의 / 렌탈 신청</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                담당자가 내용을 확인 후 빠르게 연락드리겠습니다.
                            </p>

                            <form onSubmit={handleInquirySubmit} className="space-y-4">
                                {!session?.user && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">이름</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-obsidian transition-colors"
                                                placeholder="홍길동"
                                                value={inquiryForm.name}
                                                onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">이메일</label>
                                            <input
                                                type="email"
                                                required
                                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-obsidian transition-colors"
                                                placeholder="example@email.com"
                                                value={inquiryForm.email}
                                                onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">연락처</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-obsidian transition-colors"
                                        placeholder="010-1234-5678"
                                        value={inquiryForm.phone}
                                        onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">문의 유형</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setInquiryForm(prev => ({ ...prev, type: 'product', message: `작품명: ${item?.title}\n\n이 작품을 소장하고 싶습니다. 구매 절차를 안내해 주세요.` }))}
                                            className={`py-3 text-sm font-bold rounded-lg transition-colors ${inquiryForm.type === 'product' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                        >
                                            작품 구매 (소장)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setInquiryForm(prev => ({ ...prev, type: 'payment', message: `작품명: ${item?.title}\n\n이 작품을 렌탈하고 싶습니다. 렌탈 절차를 안내해 주세요.` }))}
                                            className={`py-3 text-sm font-bold rounded-lg transition-colors ${inquiryForm.type === 'payment' ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                        >
                                            렌탈 신청
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">문의 내용</label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-obsidian transition-colors resize-none"
                                        value={inquiryForm.message}
                                        onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-obsidian text-white h-14 rounded-lg font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 mt-4"
                                >
                                    {isSubmitting ? '전송 중...' : '문의 보내기'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
