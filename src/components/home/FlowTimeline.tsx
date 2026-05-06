'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';

interface FlowDay {
  day: number;
  date: string;
  type: 'PHOTO' | 'TEXT' | 'NONE';
  content?: string;
  rhythmScore: number;
  rhythmType?: string;
}

interface FlowTimelineProps {
  data: FlowDay[];
  currentDay: number;
}

export default function FlowTimeline({ data, currentDay }: FlowTimelineProps) {
  // 7 days logic
  const days = Array.from({ length: 7 }, (_, i) => {
    const existing = data.find(d => d.day === i + 1);
    return existing || { day: i + 1, date: '', type: 'NONE', rhythmScore: 0 };
  });

  return (
    <div className="w-full space-y-12 py-12 overflow-visible">
      {/* 7-Day Progress Header */}
      <div className="space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 bg-obsidian text-white rounded-full">
          <span className="text-[10px] font-black uppercase tracking-widest">7-Day Recovery Journey</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-obsidian tracking-tighter italic font-serif">
          당신의 7일은 하나의 흐름이 됩니다.
        </h2>
        
        {/* Progress Summary Bar */}
        <div className="max-w-xl mx-auto space-y-4 px-4">
          <div className="flex justify-between items-end px-2">
            <span className="text-sm font-black text-obsidian tracking-widest">
              {currentDay >= 7 ? 'JOURNEY COMPLETE' : `D-${7 - currentDay}`}
            </span>
            <span className="text-4xl font-black text-chapter-accent italic">
              {Math.min(100, Math.round((currentDay / 7) * 100))}%
            </span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-line p-1">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(currentDay / 7) * 100}%` }}
              className="h-full bg-chapter-accent rounded-full shadow-[0_0_15px_rgba(var(--chapter-accent-rgb),0.4)]"
            />
          </div>
        </div>
      </div>

      {/* 🏹 Arrow Process Flow Timeline */}
      <div className="w-full py-20 overflow-visible">
        <div className="relative flex items-center w-full max-w-5xl mx-auto px-4">
          {days.map((dayObj, idx) => {
            const dayNum = dayObj.day;
            const isCompleted = dayNum <= currentDay;
            const isCurrent = dayNum === currentDay;
            
            // Alternating colors: Navy (even idx) vs Gold (odd idx)
            const activeColor = idx % 2 === 0 ? 'bg-chapter-accent text-white' : 'bg-reward-gold text-obsidian';
            const bgColor = isCompleted ? activeColor : 'bg-slate-100 text-slate-400';
            
            // Alternating vertical position for labels: Top (even) vs Bottom (odd)
            const isTop = idx % 2 === 0;

            return (
              <motion.div 
                key={dayNum}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative flex-1 group"
              >
                {/* 🏷️ Info Section (Alternating Top/Bottom) */}
                <div className={`absolute left-1/2 -translate-x-1/2 w-32 text-center transition-all duration-500 z-30 ${
                  isTop ? '-top-16 group-hover:-top-20' : '-bottom-16 group-hover:-bottom-20'
                }`}>
                  {/* Vertical Line Connector */}
                  <div className={`absolute left-1/2 -translate-x-1/2 w-[1px] h-8 bg-line/50 ${
                    isTop ? 'bottom-0 translate-y-full' : 'top-0 -translate-y-full'
                  }`} />
                  
                  <div className="space-y-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-obsidian' : 'text-slate-300'}`}>
                      Day {dayNum}
                    </span>
                    {isCompleted && (
                      <div className="flex items-center justify-center gap-1">
                        <div className={`w-1 h-1 rounded-full ${idx % 2 === 0 ? 'bg-chapter-accent' : 'bg-reward-gold'}`} />
                        <span className="text-[9px] font-bold text-slate/60">Success</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 🏹 Arrow Segment Wrapper */}
                <div className="relative h-14 flex items-center">
                  <div 
                    className={`w-full h-full flex items-center justify-center transition-all duration-500 ${bgColor} ${
                      isCurrent ? 'ring-4 ring-chapter-accent/10 scale-105 z-20 shadow-xl' : 'z-10'
                    }`}
                    style={{
                      clipPath: idx === 0 
                        ? 'polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%)' 
                        : idx === 6
                        ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 10% 50%)'
                        : 'polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%, 10% 50%)',
                      marginLeft: idx === 0 ? '0' : '-2%'
                    }}
                  >
                    <span className="text-xs font-black tracking-tighter opacity-40">D{dayNum}</span>
                  </div>
                </div>

                {/* Pulse Indicator for Current Day */}
                {isCurrent && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-ping z-30 pointer-events-none" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
