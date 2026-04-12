'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle, ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import HeroScanner, { AnalysisResult } from './HeroScanner';
import { useRecovery } from '@/contexts/RecoveryContext';
import { motion } from 'framer-motion';

export default function Hero({ onStart }: { onStart: (data?: AnalysisResult) => void }) {
  const { journey, resetJourney } = useRecovery();

  return (
    <div id="scanner" className="hero-cinematic noise-texture bg-mist relative overflow-hidden pt-20 pb-20 md:pt-32 md:pb-32">
      {/* Decorative Blur Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className="absolute -top-[15%] -left-[10%] w-[50%] h-[50%] bg-chapter-accent/10 rounded-full blur-[150px]" />
        <div className="absolute -bottom-[15%] -right-[10%] w-[50%] h-[50%] bg-reward-gold/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Brand & Diagnosis */}
          <div className="space-y-12 animate-in fade-in slide-in-from-left-8 duration-700 order-2 lg:order-1">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-[10px] md:text-xs font-black text-chapter-accent uppercase tracking-[0.8em] opacity-70">Scientific Recovery</span>
                {journey && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 bg-chapter-accent/10 text-chapter-accent px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                    <Activity className="w-3 h-3" /> {journey} MODE
                    <button onClick={resetJourney} className="ml-2 hover:underline opacity-60">CHANGE</button>
                  </motion.div>
                )}
              </div>
              <h1 className="text-[1.75rem] md:text-6xl font-serif-display text-obsidian leading-[1.1] tracking-tight">
                당신이 머무는 공간,<br />
                보는 것과 듣는 것,<br />
                그리고 먹는 모든 것이<br />
                <span className="text-chapter-accent underline decoration-mist decoration-8 underline-offset-4">회복의 조각</span>입니다.
              </h1>
              <p className="text-base md:text-xl text-slate/70 font-medium leading-relaxed">
                식단, 사운드, 시각 데이터를 통합한 <br className="hidden md:block" />
                유니클만의 맞춤형 회복 큐레이션
              </p>
              
              <div className="pt-4 space-y-6">
                <div className="flex flex-wrap gap-4">
                  <Button onClick={onStart} size="lg" className="btn-primary h-12 md:h-16 px-8 rounded-2xl text-base md:text-lg font-black shadow-xl shadow-chapter-accent/20 group">
                    <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    60초 정밀 진단 시작
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <div className="text-sm font-bold text-chapter-accent flex items-center gap-2">
                  <div className="w-2 h-2 bg-chapter-accent rounded-full animate-pulse" />
                  60초 진단으로 맞춤 회복 피드백 받기
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-8 text-xs text-slate/60 font-black uppercase tracking-widest">
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-chapter-accent/40" /> 회복 점수 리포트</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-chapter-accent/40" /> 시술/수술 케어</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-chapter-accent/40" /> 일상 리듬 설계</span>
            </div>
          </div>

          {/* Right: The AI Scanner Hook */}
          <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 order-1 lg:order-2 flex justify-center lg:block">
            <div className="absolute -inset-4 bg-gradient-to-tr from-chapter-accent/5 to-reward-gold/5 rounded-[60px] blur-3xl opacity-50" />
            <div className="relative w-full">
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-chapter-accent/5 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-reward-gold/5 rounded-full blur-3xl animate-pulse delay-1000" />
              <HeroScanner onStart={onStart} />
            </div>
            
            {/* Contextual Nudge Bubble */}
            <div className="absolute -bottom-6 -left-6 md:-left-12 bg-white p-4 rounded-[30px] shadow-2xl border border-line animate-bounce max-w-[180px] hidden md:block">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-chapter-accent animate-ping" />
                <span className="text-[10px] font-black text-obsidian uppercase tracking-widest">Youniqle LIVE</span>
              </div>
              <p className="text-[11px] font-bold text-slate leading-snug">
                지금 먹는 음식,<br />회복에 도움이 될까요?<br />
                <span className="text-chapter-accent">사진으로 바로 확인!</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
