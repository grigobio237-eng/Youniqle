'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, X, Crown } from 'lucide-react';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import MembershipTierCards from '@/components/home/MembershipTierCards';

export default function FounderTicketPage() {
  return (
    <ChapterWrapper chapter="membership" className="container mx-auto px-4 py-8 md:py-20 pb-16 md:pb-40 min-h-screen">
      {/* Header */}
      <div className="mb-12 md:mb-24 text-center space-y-4 md:space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center px-4 py-1.5 bg-chapter-accent/10 text-chapter-accent rounded-full text-[10px] md:text-xs font-black tracking-[0.3em] uppercase border border-chapter-accent/20">
          Founder Ticket
        </div>
        <h1 className="font-black text-obsidian tracking-tighter leading-[1.2] break-keep text-2xl md:text-5xl">
          나만의 완벽한 회복 리듬,<br />
          <span className="text-chapter-accent">파운더스 티켓</span>
        </h1>
        <p className="text-xs md:text-base text-slate/70 leading-relaxed font-bold max-w-2xl mx-auto break-keep px-2">
          무제한 스캐너와 주간 심층 데이터 분석을 통해 당신만의 완벽한 회복 흐름을 완성하세요.
        </p>
      </div>

      {/* Plan Details */}
      <section className="max-w-4xl mx-auto mb-16 md:mb-20">
        <Card className="bg-white rounded-[24px] md:rounded-[48px] border-chapter-accent/30 shadow-xl shadow-chapter-accent/10 overflow-hidden p-6 md:p-12 relative">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none p-8">
            <Crown className="w-48 h-48 text-chapter-accent" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-line pb-6">
              <h2 className="text-xl md:text-2xl font-black text-obsidian">파운더스 티켓 제공 혜택</h2>
              <div className="text-right">
                <span className="text-2xl md:text-3xl font-black text-obsidian">9,900원</span>
                <span className="text-xs md:text-sm font-bold text-slate/50 ml-1">/ 월</span>
              </div>
            </div>
            
            <ul className="space-y-6 text-sm md:text-base text-slate/80 font-medium">
              <li className="flex items-start gap-3 md:gap-4">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mt-0.5 text-chapter-accent shrink-0" />
                <div>
                  <strong className="block text-obsidian text-base md:text-lg mb-1">무제한 AI 라이프 스냅</strong>
                  <p className="break-keep text-xs md:text-sm">횟수 제한 없이 하루의 모든 순간을 기록하고 컨디션을 분석할 수 있습니다.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 md:gap-4">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mt-0.5 text-chapter-accent shrink-0" />
                <div>
                  <strong className="block text-obsidian text-base md:text-lg mb-1">7-Day 누적 패턴 분석</strong>
                  <p className="break-keep text-xs md:text-sm">단편적인 기록을 넘어 지난 7일간의 수면, 스트레스, 회복의 맥락을 연결하는 주간 심층 리포트를 제공합니다.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 md:gap-4">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mt-0.5 text-chapter-accent shrink-0" />
                <div>
                  <strong className="block text-obsidian text-base md:text-lg mb-1">사운드 테라피 전체 라이브러리</strong>
                  <p className="break-keep text-xs md:text-sm">숙면, 집중력 향상, 심신 이완에 최적화된 모든 프리미엄 사운드 트랙을 제한 없이 즐길 수 있습니다.</p>
                </div>
              </li>
            </ul>
            
            <div className="mt-8 md:mt-12 text-center">
              <Link href="/checkout?plan=founder">
                <Button className="w-full md:w-auto bg-obsidian text-white hover:bg-obsidian/90 px-6 md:px-10 py-6 md:py-6 rounded-[20px] md:rounded-full text-base md:text-lg font-bold shadow-lg transition-all hover:scale-105">
                  월 9,900원으로 시작하기 <ArrowRight className="ml-2 w-5 h-5" />
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
