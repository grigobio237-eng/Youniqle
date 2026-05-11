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
  const days = Array.from({ length: 7 }, (_, i) => {
    const existing = data.find(d => d.day === i + 1);
    return existing || { day: i + 1, date: '', type: 'NONE', rhythmScore: 0 };
  });

  return (
    <div className="w-full space-y-16 py-12 overflow-visible">
      {/* 7-Day Progress Header */}
      <div className="space-y-8 text-center">
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-primary/5 text-primary rounded-full border border-primary/10">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-[0.3em]">Recovery Flow</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
          당신의 7일은 하나의<br />아름다운 흐름이 됩니다.
        </h2>
        
        {/* Progress Summary Bar */}
        <div className="max-w-xl mx-auto space-y-5 px-6">
          <div className="flex justify-between items-end px-2">
            <span className="text-xs font-bold text-foreground/30 tracking-[0.3em] uppercase">
              {currentDay >= 7 ? 'COMPLETE' : `DAY ${currentDay} / 7`}
            </span>
            <span className="text-5xl font-bold text-primary tracking-tighter">
              {Math.min(100, Math.round((currentDay / 7) * 100))}%
            </span>
          </div>
          <div className="h-5 bg-background/50 rounded-full overflow-hidden border border-white/20 p-1.5 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(currentDay / 7) * 100}%` }}
              className="h-full bg-primary rounded-full shadow-lg shadow-primary/30"
            />
          </div>
        </div>
      </div>

      {/* 🏹 Organic Node Timeline */}
      <div className="w-full py-16 overflow-visible">
        <div className="relative flex items-center w-full max-w-5xl mx-auto px-8">
          {/* Background Connecting Line */}
          <div className="absolute left-8 right-8 h-[2px] bg-background/50 top-1/2 -translate-y-1/2 z-0" />
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: Math.min(1, currentDay / 7) }}
            className="absolute left-8 right-8 h-[2px] bg-primary top-1/2 -translate-y-1/2 z-1 origin-left shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
          />

          {days.map((dayObj, idx) => {
            const dayNum = dayObj.day;
            const isCompleted = dayNum <= currentDay;
            const isCurrent = dayNum === currentDay;
            const isTop = idx % 2 === 0;

            return (
              <motion.div 
                key={dayNum}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="relative flex-1 flex justify-center z-10"
              >
                {/* Node Label (Top/Bottom) */}
                <div className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-500 ${
                  isTop ? '-top-14' : '-bottom-14'
                }`}>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isCompleted ? 'text-foreground/60' : 'text-foreground/20'}`}>
                    Day {dayNum}
                  </span>
                  {isCompleted && (
                    <CheckCircle2 className={`w-3 h-3 mt-1 ${idx % 2 === 0 ? 'text-primary' : 'text-secondary-container'}`} />
                  )}
                </div>

                {/* The Node (Organic Pebble Shape) */}
                <div className="relative">
                  <div 
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-700 shadow-xl ${
                      isCompleted 
                        ? (idx % 2 === 0 ? 'bg-primary text-white' : 'bg-secondary-container text-white')
                        : 'bg-background border border-white/40 text-foreground/20'
                    } ${isCurrent ? 'scale-125 ring-8 ring-primary/10 z-20 shadow-primary/20' : 'z-10'}`}
                  >
                    <span className="text-[11px] font-bold">D{dayNum}</span>
                  </div>

                  {/* Pulse Effect for Current Day */}
                  {isCurrent && (
                    <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20 z-0" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
