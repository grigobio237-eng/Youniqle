'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

export default function Hero({ onStart }: { onStart: () => void }) {
  return (
    <div className="hero-cinematic noise-texture bg-mist relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className="absolute -top-[15%] -left-[10%] w-[50%] h-[50%] bg-chapter-accent/10 rounded-full blur-[150px]" />
        <div className="absolute -bottom-[15%] -right-[10%] w-[50%] h-[50%] bg-reward-gold/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-4xl mx-auto space-y-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 px-6">
        {/* Hero Headline */}
        <div className="space-y-10">
          <div className="space-y-4">
            <span className="text-[10px] font-black text-chapter-accent uppercase tracking-[1em] block mb-4 opacity-70">Scientific Recovery</span>
            <h1 className="font-serif-display text-obsidian tracking-tighter leading-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block mb-4">지금 필요한 회복은</span>
              <div className="flex flex-wrap justify-center items-center gap-x-3 md:gap-x-6">
                <span className="text-slate/40 font-light italic">느낌이 아니라</span>
                <span className="text-chapter-accent font-black relative inline-block">
                  진단
                  <span className="absolute -bottom-2 left-0 w-full h-1 md:h-2 bg-chapter-accent/30 rounded-full" />
                </span>
                <span className="text-obsidian">입니다.</span>
              </div>
            </h1>
          </div>
          <p className="text-lg md:text-xl text-slate/70 font-medium leading-relaxed max-w-xl mx-auto word-keep-all">
            60초 안에 현재 상태를 정밀하게 확인하고,<br className="hidden sm:block" />
            당신에게 최적화된 회복의 경로를 제안받으세요.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col gap-5 w-full max-w-sm mx-auto">
          <Button onClick={onStart} size="lg" className="btn-primary w-full h-16 md:h-[72px] text-base md:text-lg rounded-[20px] shadow-2xl shadow-chapter-accent/15 hover:-translate-y-0.5 transition-transform duration-300">
            <Sparkles className="w-5 h-5 mr-2.5" />
            60초 회복 진단 시작하기
          </Button>
          <div className="flex justify-center items-center gap-6 text-xs text-slate/60 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> 회복 점수</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> 맞춤 경로</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> 행동 제안</span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="pt-10 border-t border-line/50">
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-xs text-slate/60 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-status-good/80" />
              <span>정보·연결·설계 플랫폼</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-status-good/80" />
              <span>7일 이내 100% 환불</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-status-good/80" />
              <span>(주)사피에넷 운영</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
