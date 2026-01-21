'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Palette, ShoppingBag, Users, Cross, Coffee, Home, Crosshair, Stethoscope } from 'lucide-react';

interface ElevatorUIProps {
    activeFloor: number;
    onFloorChange: (floor: number) => void;
}

export default function ElevatorUI({ activeFloor, onFloorChange }: ElevatorUIProps) {
    const floors = [
        { id: 5, label: '05', name: 'Lounge', icon: <Coffee className="w-5 h-5" /> },
        { id: 4, label: '04', name: 'Medical', icon: <Stethoscope className="w-5 h-5" /> },
        { id: 3, label: '03', name: 'Coaching', icon: <Users className="w-5 h-5" /> },
        { id: 2, label: '02', name: 'Shop', icon: <ShoppingBag className="w-5 h-5" /> },
        { id: 1, label: '01', name: 'Gallery', icon: <Palette className="w-5 h-5" /> },
    ];

    const isDarkTheme = false;
    const baseTextColor = 'text-obsidian';
    const mutedTextColor = 'text-obsidian/20';
    const hoverTextColor = 'text-obsidian/40';
    const borderColor = 'border-obsidian/10';
    const barBg = 'bg-obsidian/5';

    return (
        <>
            {/* Desktop Vertical Menu */}
            <div className="hidden md:flex fixed left-10 top-1/2 -translate-y-1/2 z-50 flex-col gap-6">
                <div className="flex flex-col items-center gap-2 mb-4">
                    <div className={`w-1 h-32 ${barBg} relative rounded-full overflow-hidden`}>
                        <motion.div
                            className="absolute bottom-0 w-full bg-[#D4AF37]"
                            animate={{ height: `${(activeFloor / 5) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 100 }}
                        />
                    </div>
                </div>

                {floors.map((floor) => (
                    <button
                        key={floor.id}
                        onClick={() => onFloorChange(floor.id)}
                        className="group relative flex items-center gap-4 outline-none"
                    >
                        <div className="flex flex-col items-end">
                            <span className={`text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeFloor === floor.id ? 'text-[#D4AF37]' : `${mutedTextColor} group-hover:${hoverTextColor}`}`}>
                                {floor.name}
                            </span>
                            <span className={`text-2xl font-black tracking-tighter transition-all duration-300 ${activeFloor === floor.id ? `${baseTextColor} scale-125` : `${mutedTextColor} group-hover:${hoverTextColor}`}`}>
                                {floor.label}
                            </span>
                        </div>

                        <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${activeFloor === floor.id ? 'bg-[#D4AF37] border-[#D4AF37] scale-125 shadow-lg shadow-[#D4AF37]/30' : `${borderColor} group-hover:border-obsidian/20`}`} />

                        {activeFloor === floor.id && (
                            <motion.div
                                layoutId="elevator-indicator"
                                className="absolute -right-4 w-1 h-8 bg-[#D4AF37] rounded-full"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Mobile Bottom Tab Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-10 pointer-events-none">
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="bg-white/90 backdrop-blur-2xl border border-slate-100 rounded-[32px] shadow-2xl overflow-hidden pointer-events-auto flex items-stretch justify-around p-2"
                >
                    {[...floors].reverse().map((floor) => (
                        <button
                            key={floor.id}
                            onClick={() => onFloorChange(floor.id)}
                            className="relative flex-1 flex flex-col items-center justify-center py-4 gap-1 outline-none transition-all"
                        >
                            <div className={`transition-all duration-300 ${activeFloor === floor.id ? 'text-[#D4AF37] scale-110' : 'text-obsidian/30'}`}>
                                {floor.icon}
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-tighter transition-all ${activeFloor === floor.id ? 'text-obsidian opacity-100' : 'text-obsidian opacity-20'}`}>
                                {floor.id}F
                            </span>
                            {activeFloor === floor.id && (
                                <motion.div
                                    layoutId="mobile-indicator"
                                    className="absolute bottom-1 w-1 h-1 bg-[#D4AF37] rounded-full"
                                />
                            )}
                        </button>
                    ))}
                </motion.div>
            </div>
        </>
    );
}
