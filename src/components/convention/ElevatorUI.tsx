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
            <div className="flex flex-col gap-10 items-center justify-center h-full">
                {floors.map((floor) => (
                    <button
                        key={floor.id}
                        onClick={() => onFloorChange(floor.id)}
                        className="group relative flex flex-col items-center gap-2 outline-none transition-all duration-300"
                    >
                        <div className="flex flex-col items-center">
                            <span className={`text-[8px] font-black uppercase tracking-[0.3em] transition-all duration-300 mb-1 ${activeFloor === floor.id ? 'text-[#D4AF37]' : 'text-obsidian/20 group-hover:text-obsidian/40'}`}>
                                {floor.name}
                            </span>
                            <span className={`text-2xl font-black tracking-tighter transition-all duration-300 ${activeFloor === floor.id ? 'text-obsidian scale-125' : 'text-obsidian/20 group-hover:text-obsidian/40'}`}>
                                {floor.label}
                            </span>
                        </div>

                        {activeFloor === floor.id && (
                            <motion.div
                                layoutId="elevator-indicator"
                                className="w-1 h-6 bg-[#D4AF37] rounded-full mt-1"
                            />
                        )}
                        {activeFloor !== floor.id && (
                            <div className="w-1.5 h-1.5 rounded-full border border-obsidian/10 mt-1" />
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
