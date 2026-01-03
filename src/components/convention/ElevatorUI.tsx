'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ElevatorUIProps {
    activeFloor: number;
    onFloorChange: (floor: number) => void;
}

export default function ElevatorUI({ activeFloor, onFloorChange }: ElevatorUIProps) {
    const floors = [
        { id: 5, label: '05', name: 'Omakase Suite' },
        { id: 4, label: '04', name: 'Medical Archive' },
        { id: 3, label: '03', name: 'Dynamic Coaching' },
        { id: 2, label: '02', name: 'Prestige Shop' },
        { id: 1, label: '01', name: 'Art Gallery' },
    ];

    const isDarkTheme = activeFloor === 5;
    const baseTextColor = isDarkTheme ? 'text-white' : 'text-obsidian';
    const mutedTextColor = isDarkTheme ? 'text-white/20' : 'text-obsidian/20';
    const hoverTextColor = isDarkTheme ? 'text-white/40' : 'text-obsidian/40';
    const borderColor = isDarkTheme ? 'border-white/10' : 'border-obsidian/10';
    const barBg = isDarkTheme ? 'bg-white/5' : 'bg-obsidian/5';

    return (
        <div className="fixed left-4 md:left-10 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 md:gap-6">
            <div className="flex flex-col items-center gap-1 md:gap-2 mb-2 md:mb-4">
                <div className={`w-0.5 md:w-1 h-16 md:h-32 ${barBg} relative rounded-full overflow-hidden`}>
                    <motion.div
                        className="absolute top-0 w-full bg-[#D4AF37]"
                        animate={{ height: `${(activeFloor / 5) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 100 }}
                    />
                </div>
            </div>

            {floors.map((floor) => (
                <button
                    key={floor.id}
                    onClick={() => onFloorChange(floor.id)}
                    className="group relative flex items-center gap-2 md:gap-4 outline-none"
                >
                    <div className="flex flex-col items-end">
                        <span className={`text-[6px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeFloor === floor.id ? 'text-[#D4AF37]' : `${mutedTextColor} group-hover:${hoverTextColor}`}`}>
                            {floor.name}
                        </span>
                        <span className={`text-base md:text-2xl font-black tracking-tighter transition-all duration-300 ${activeFloor === floor.id ? `${baseTextColor} scale-110 md:scale-125` : `${mutedTextColor} group-hover:${hoverTextColor}`}`}>
                            {floor.label}
                        </span>
                    </div>

                    <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full border-2 transition-all duration-300 ${activeFloor === floor.id ? 'bg-[#D4AF37] border-[#D4AF37] scale-110 md:scale-125 shadow-lg shadow-[#D4AF37]/30' : `${borderColor} group-hover:border-white/20`}`} />

                    {activeFloor === floor.id && (
                        <motion.div
                            layoutId="elevator-indicator"
                            className="absolute -right-2 md:-right-4 w-0.5 md:w-1 h-4 md:h-8 bg-[#D4AF37] rounded-full"
                        />
                    )}
                </button>
            ))}

            <div className="mt-4 md:mt-8 text-center">
                <p className={`text-[6px] md:text-[10px] font-black ${isDarkTheme ? 'text-[#D4AF37]/30' : 'text-[#D4AF37]/40'} uppercase tracking-[0.3em] vertical-text`}>
                    Level Navigator
                </p>
            </div>
        </div>
    );
}
