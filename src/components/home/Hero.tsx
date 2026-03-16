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

      <div className="max-w-2xl mx-auto space-y-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 px-6">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-5 py-2.5 bg-obsidian text-mist rounded-full text-[10px] font-black tracking-[0.25em] uppercase">
          <span>Founder Pass Now Open</span>
        </div>

        {/* Hero Headline */}
        <div className="space-y-8">
          <h1 className="font-serif-display text-4xl sm:text-5xl md:text-7xl text-obsidian leading-[1.15] tracking-tight">
            당신의 회복을,<br />
            <span className="text-chapter-accent italic">'시스템'</span>으로.
          </h1>
          <p className="text-lg md:text-xl text-slate/80 font-light leading-relaxed max-w-md mx-auto">
            유전자 · 웰니스 · 회복 설계를 하나의 구조로 완성합니다.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col gap-5 w-full max-w-sm mx-auto">
          <Button asChild size="lg" className="btn-primary w-full h-16 md:h-[72px] text-base md:text-lg rounded-[16px] shadow-2xl shadow-chapter-accent/15 hover:-translate-y-0.5 transition-transform duration-300">
            <Link href="/founder-pass">
              <Sparkles className="w-5 h-5 mr-2.5" />
              Founder Pass 시작하기
            </Link>
          </Button>
          <p className="text-xs text-slate/50 tracking-wide">
            ESSENCE 39만원 · BALANCE 69만원 · MIRACLE 99만원
          </p>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
          <Button variant="ghost" onClick={onStart} className="h-12 px-6 rounded-full text-sm font-medium hover:bg-obsidian/5 border border-line">
            무료 60초 진단 체험
          </Button>
          <Button variant="ghost" asChild className="h-12 px-6 rounded-full text-sm font-medium hover:bg-obsidian/5">
            <Link href="/products">큐레이션 보기 <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
          </Button>
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
