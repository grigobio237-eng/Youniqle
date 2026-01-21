'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Package, CheckCircle2, ArrowRight, CreditCard, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FloorOwner } from '@/hooks/usePavilionState';

interface ScheduleBookingModalProps {
    show: boolean;
    onClose: () => void;
    owner: FloorOwner | null;
    selectedProgramId: string | null;
    selectedProgramPrice: string | null;
    bookingDate: string | null;
    bookingSlot: string | null;
    isBooking: boolean;
    onSelectProgram: (id: string, title: string, price: string) => void;
    onSelectDate: (date: string) => void;
    onSelectSlot: (slot: string) => void;
    onSubmit: () => void;
    // New props for generalization
    modalTitle?: string;
    programLabel?: string;
    dateLabel?: string;
    submitLabel?: string;
}

export default function ScheduleBookingModal({
    show,
    onClose,
    owner,
    selectedProgramId,
    selectedProgramPrice,
    bookingDate,
    bookingSlot,
    isBooking,
    onSelectProgram,
    onSelectDate,
    onSelectSlot,
    onSubmit,
    modalTitle = '코칭 스케줄 확인',
    programLabel = '코칭 프로그램 선택',
    dateLabel = '활동 가능 날짜 선택',
    submitLabel = '결제 및 예약하기'
}: ScheduleBookingModalProps) {
    if (!owner) return null;

    const selectedDay = owner.schedule?.find(s => s.date === bookingDate);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[10000] bg-obsidian/60 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 pointer-events-auto"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="p-8 md:p-12 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-6 h-6 text-[#D4AF37]" />
                                    <h3 className="text-2xl md:text-4xl font-black text-obsidian uppercase italic tracking-tighter">{modalTitle}</h3>
                                </div>
                                <p className="text-xs font-bold text-obsidian/40 uppercase tracking-widest leading-none mt-1">
                                    {owner.name} 마스터의 가능 시간입니다.
                                </p>
                            </div>
                            <button onClick={onClose} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-obsidian transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 bg-slate-50/30">
                            {/* Program Selection Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] ml-2">{programLabel}</span>
                                    {selectedProgramPrice && (
                                        <Badge className="bg-obsidian text-white font-black px-4 py-1 rounded-full">
                                            {Number(selectedProgramPrice).toLocaleString()}원
                                        </Badge>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {owner.items.map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => onSelectProgram(item.id, item.title, item.price)}
                                            className={`p-6 rounded-[32px] border-2 transition-all flex flex-col gap-4 text-left group ${selectedProgramId === item.id ? 'border-[#D4AF37] bg-white shadow-xl scale-[1.02]' : 'border-white bg-white/50 hover:border-slate-200 shadow-sm'}`}
                                        >
                                            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 relative">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <Package size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h5 className={`font-black tracking-tight mb-1 ${selectedProgramId === item.id ? 'text-obsidian' : 'text-slate-600'}`}>{item.title}</h5>
                                                <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
                                                    {Number(item.price).toLocaleString()} KRW
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Date Selection */}
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] ml-2">{dateLabel}</span>
                                    <div className="space-y-2">
                                        {owner.schedule && owner.schedule.length > 0 ? (
                                            owner.schedule.map((day, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => onSelectDate(day.date)}
                                                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${bookingDate === day.date ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-lg' : 'border-white bg-white hover:border-slate-200 shadow-sm'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-3 rounded-xl transition-colors ${bookingDate === day.date ? 'bg-[#D4AF37] text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                                                            <Calendar size={18} />
                                                        </div>
                                                        <span className={`text-sm font-black tracking-tight ${bookingDate === day.date ? 'text-obsidian' : 'text-slate-600'}`}>{day.date}</span>
                                                    </div>
                                                    <Badge className={day.type === 'FULL_DAY' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'bg-amber-50 text-amber-600 font-bold'}>
                                                        {day.type === 'FULL_DAY' ? '1일 단위' : '시간 단위'}
                                                    </Badge>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center border-4 border-dashed border-slate-100 rounded-[32px] bg-white/50">
                                                <Calendar className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">현재 등록된 스케줄이 없습니다.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Time Selection */}
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] ml-2">상세 시간 선택</span>
                                    <div className="bg-white rounded-[32px] p-6 min-h-[300px] shadow-sm border border-slate-100">
                                        {!bookingDate ? (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-40">
                                                <ArrowRight size={48} className="rotate-90 md:rotate-0" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">날짜를 먼저 선택해주세요</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {selectedDay?.type === 'FULL_DAY' ? (
                                                    <div className="p-8 text-center space-y-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                                        <CheckCircle2 className="w-12 h-12 text-indigo-400 mx-auto" />
                                                        <p className="text-sm font-bold text-indigo-900 leading-relaxed">
                                                            해당 날짜는 1일 단위로 신청이 가능합니다.<br />아래 신청 버튼을 눌러주세요.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {selectedDay?.slots?.map((slot, sIdx) => (
                                                            <button
                                                                key={sIdx}
                                                                disabled={slot.isBooked}
                                                                onClick={() => onSelectSlot(slot.time)}
                                                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${slot.isBooked ? 'opacity-30 grayscale cursor-not-allowed bg-slate-50 border-transparent' : bookingSlot === slot.time ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-obsidian shadow-md' : 'border-slate-50 bg-slate-50 hover:bg-slate-100 text-slate-400'}`}
                                                            >
                                                                <Clock className={`w-4 h-4 ${bookingSlot === slot.time ? 'text-[#D4AF37]' : 'text-slate-300'}`} />
                                                                <span className="text-sm font-black tracking-widest">{slot.time}</span>
                                                                {slot.isBooked && <span className="text-[8px] font-black uppercase tracking-widest text-red-500">Reservated</span>}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-12 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left">
                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Selected Schedule</p>
                                <h4 className="text-lg md:text-xl font-black text-obsidian tracking-tighter italic">
                                    {bookingDate ? `${bookingDate} ${bookingSlot || (selectedDay?.type === 'FULL_DAY' ? '1일 단위' : '')}` : '날짜와 시간을 선택하세요'}
                                </h4>
                            </div>
                            <button
                                disabled={!bookingDate || !selectedProgramId || (selectedDay?.type === 'HOURLY' && !bookingSlot) || isBooking}
                                onClick={onSubmit}
                                className="w-full md:w-auto px-16 h-20 bg-obsidian text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 disabled:bg-slate-200 disabled:scale-100 disabled:cursor-not-allowed shadow-2xl transition-all flex items-center justify-center gap-4"
                            >
                                {isBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard size={20} />}
                                {selectedProgramPrice ? `${Number(selectedProgramPrice).toLocaleString()}원 ${submitLabel}` : '프로그램을 선택하세요'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
