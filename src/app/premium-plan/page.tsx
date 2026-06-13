'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, X, Sparkles } from 'lucide-react';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import MembershipTierCards from '@/components/home/MembershipTierCards';

export default function PremiumPlanPage() {
  return (
    <ChapterWrapper chapter="membership" className="container mx-auto px-4 py-8 md:py-20 pb-16 md:pb-40 min-h-screen">
      {/* Header */}
      <div className="mb-12 md:mb-24 text-center space-y-4 md:space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center px-4 py-1.5 bg-reward-gold/10 text-reward-gold rounded-full text-[10px] md:text-xs font-black tracking-[0.3em] uppercase border border-reward-gold/20">
          Premium Plan
        </div>
        <h1 className="font-black text-obsidian tracking-tighter leading-[1.2] break-keep text-2xl md:text-5xl">
          가장 깊이 있는 나를 만나는 시간,<br />
          <span className="text-reward-gold">프리미엄 플랜</span>
        </h1>
        <p className="text-xs md:text-base text-slate/70 leading-relaxed font-bold max-w-2xl mx-auto break-keep px-2">
          전문가 수준의 기질 분석과 1:1 맞춤형 솔루션을 통해 당신의 잠재력을 극대화하세요.
        </p>
      </div>

      {/* Plan Details */}
      <section className="max-w-4xl mx-auto mb-16 md:mb-20">
        <Card className="bg-obsidian rounded-[24px] md:rounded-[48px] border-reward-gold/30 shadow-2xl shadow-reward-gold/20 overflow-hidden p-6 md:p-12 relative text-white">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none p-8">
            <Sparkles className="w-48 h-48 text-reward-gold" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-white/10 pb-6">
              <h2 className="text-xl md:text-2xl font-black text-white">프리미엄 플랜 제공 혜택</h2>
              <div className="text-right">
                <span className="text-2xl md:text-3xl font-black text-reward-gold">29,800원</span>
                <span className="text-xs md:text-sm font-bold text-white/50 ml-1">/ 월</span>
              </div>
            </div>
            
            <ul className="space-y-6 text-sm md:text-base text-white/80 font-medium">
              <li className="flex items-start gap-3 md:gap-4">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mt-0.5 text-reward-gold shrink-0" />
                <div>
                  <strong className="block text-white text-base md:text-lg mb-1">심층 기질 분석 (30개 세부 국면)</strong>
                  <p className="break-keep text-xs md:text-sm text-white/60">표면적인 컨디션 분석을 넘어, 타고난 기질과 성향을 30개의 세부 항목으로 심층 분석합니다.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 md:gap-4">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mt-0.5 text-reward-gold shrink-0" />
                <div>
                  <strong className="block text-white text-base md:text-lg mb-1">AI 보이스 맞춤 명상</strong>
                  <p className="break-keep text-xs md:text-sm text-white/60">현재의 감정 상태와 스트레스 레벨에 맞춰 AI가 실시간으로 생성하는 나만의 명상 오디오를 제공합니다.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 md:gap-4">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mt-0.5 text-reward-gold shrink-0" />
                <div>
                  <strong className="block text-white text-base md:text-lg mb-1">전문가 1:1 커스텀 솔루션</strong>
                  <p className="break-keep text-xs md:text-sm text-white/60">축적된 데이터를 기반으로 건강, 심리, 라이프스타일 전문가가 직접 구성한 1:1 맞춤형 피드백을 받아볼 수 있습니다.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 md:gap-4">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mt-0.5 text-reward-gold shrink-0" />
                <div>
                  <strong className="block text-white text-base md:text-lg mb-1">파운더스 티켓 모든 혜택 포함</strong>
                  <p className="break-keep text-xs md:text-sm text-white/60">무제한 라이프 스냅과 7-Day 누적 패턴 분석, 테라피 사운드 등 파운더스 티켓의 혜택을 기본으로 누리세요.</p>
                </div>
              </li>
            </ul>
            
            <div className="mt-8 md:mt-12 text-center">
              <Link href="/checkout?plan=premium">
                <Button className="w-full md:w-auto bg-reward-gold text-obsidian hover:bg-yellow-400 px-6 md:px-10 py-6 md:py-6 rounded-[20px] md:rounded-full text-base md:text-lg font-bold shadow-[0_0_30px_rgba(255,215,0,0.3)] transition-all hover:scale-105">
                  월 29,800원으로 시작하기 <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* Comparison Cards */}
      <section className="max-w-6xl mx-auto mb-16 md:mb-20">
        <MembershipTierCards />
      </section>

    </ChapterWrapper>
  );
}
