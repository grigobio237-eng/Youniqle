'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Camera, PenLine, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';

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
  // 7 days placeholder
  const days = Array.from({ length: 7 }, (_, i) => {
    const existing = data.find(d => d.day === i + 1);
    return existing || { day: i + 1, date: '', type: 'NONE', rhythmScore: 0 };
  });

  return (
    <div className="w-full space-y-12 py-12">
      {/* 7-Day Progress Header */}
      <div className="space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 bg-obsidian text-white rounded-full">
          <span className="text-[10px] font-black uppercase tracking-widest">7-Day Recovery Journey</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-obsidian tracking-tighter italic font-serif">
          당신의 7일은 하나의 흐름이 됩니다.
        </h2>
        
        {/* Progress Bar */}
        <div className="max-w-xl mx-auto space-y-4">
          <div className="flex justify-between items-end px-2">
            <span className="text-sm font-black text-obsidian tracking-widest">
              {currentDay >= 7 ? 'JOURNEY COMPLETE' : `D-${7 - currentDay}`}
            </span>
            <span className="text-4xl font-black text-chapter-accent italic">{Math.min(100, Math.round((currentDay / 7) * 100))}%</span>
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

      {/* Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 md:gap-2">
        {days.map((day, idx) => {
          const isActive = day.day === currentDay;
          const isCompleted = day.day < currentDay || (day.day === currentDay && day.type !== 'NONE');
          const isFuture = day.day > currentDay;

          return (
            <div key={idx} className="relative group">
              {/* Connector line for desktop */}
              {idx < 6 && (
                <div className="hidden md:block absolute top-1/2 left-full w-full h-[2px] bg-line -translate-y-1/2 z-0" />
              )}

              <motion.div
                whileHover={!isFuture ? { y: -5 } : {}}
                className={`relative z-10 p-6 rounded-[32px] border-2 transition-all text-center space-y-4 h-full flex flex-col items-center justify-between
                  ${isActive ? 'bg-white border-chapter-accent shadow-2xl scale-105' : ''}
                  ${isCompleted && !isActive ? 'bg-slate-50 border-line/50 opacity-80' : ''}
                  ${isFuture ? 'bg-slate-50/50 border-line border-dashed opacity-40' : ''}
                `}
              >
                <div className="space-y-1">
                  <span className={`text-[10px] font-black tracking-widest uppercase ${isActive ? 'text-chapter-accent' : 'text-slate'}`}>
                    Day {day.day < 10 ? `0${day.day}` : day.day}
                  </span>
                  {isCompleted && (
                    <div className="flex justify-center">
                      <CheckCircle2 className="w-4 h-4 text-chapter-accent" />
                    </div>
                  )}
                </div>

                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl flex items-center justify-center shadow-inner border border-line/30 group-hover:rotate-3 transition-transform">
                  {day.type === 'PHOTO' ? (
                    <Camera className="w-8 h-8 text-chapter-accent" />
                  ) : day.type === 'TEXT' ? (
                    <PenLine className="w-8 h-8 text-obsidian" />
                  ) : (
                    <div className="text-2xl font-black text-slate/20">?</div>
                  )}
                </div>

                <div className="space-y-1">
                  {day.rhythmScore > 0 ? (
                    <>
                      <span className="block text-xl font-black text-obsidian italic tabular-nums">{day.rhythmScore}</span>
                      <span className="block text-[8px] font-bold text-slate uppercase">Point</span>
                    </>
                  ) : (
                    <span className="block text-xs font-bold text-slate/30">기록 대기</span>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Next Nudge Footer */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto p-10 bg-obsidian text-white rounded-[40px] text-center space-y-8 relative overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-chapter-accent/20 blur-[80px] rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-reward-gold/5 blur-[60px] rounded-full -ml-24 -mb-24" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <Sparkles className="w-8 h-8 text-reward-gold" />
            </div>
          </div>
          <h3 className="text-3xl md:text-4xl font-black tracking-tight italic font-serif leading-tight">
            {currentDay < 3 
              ? "기록이 쌓이면 패턴이 보입니다." 
              : "당신만의 회복 패턴을 발견했습니다."}
          </h3>
          <p className="text-mist/70 font-medium text-base md:text-lg leading-relaxed max-w-lg mx-auto whitespace-pre-line">
            {currentDay < 3 
              ? "3일째부터는 반복되는 신호를 탐지할 수 있습니다.\n내일도 잊지 말고 당신의 리듬을 남겨주세요."
              : "저녁 시간대에 급격한 에너지 하락이 관찰됩니다.\n패턴 분석 결과를 확인하고 루틴을 조정해보세요."}
          </p>
        </div>
        
        <div className="relative z-10 pt-4">
          <Link 
            href={currentDay < 7 ? "/dashboard" : "/ai-navigator/report"}
            className="w-full h-20 bg-white text-obsidian rounded-[24px] font-black text-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl group"
          >
            {currentDay < 7 ? "오늘의 기록 계속하기" : "7일 완성 리포트 보기"} 
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Next step in your recovery journey</p>
        </div>
      </motion.div>
    </div>
  );
}
