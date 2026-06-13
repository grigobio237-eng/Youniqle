'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, X, Crown } from 'lucide-react';
import ChapterWrapper from '@/components/layout/ChapterWrapper';

export default function FounderTicketPage() {
  return (
    <ChapterWrapper chapter="membership" className="container mx-auto px-4 py-8 md:py-20 pb-16 md:pb-40 min-h-screen">
      {/* Header */}
      <div className="mb-12 md:mb-24 text-center space-y-4 md:space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center px-4 py-1.5 bg-chapter-accent/10 text-chapter-accent rounded-full text-[10px] md:text-xs font-black tracking-[0.3em] uppercase border border-chapter-accent/20">
          REBORN PASS
        </div>
        <h1 className="font-black text-obsidian tracking-tighter leading-[1.2] break-keep text-2xl md:text-5xl">
          나만의 완벽한 회복 리듬,<br />
          <span className="text-chapter-accent">리본 패스</span>
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
              <h2 className="text-xl md:text-2xl font-black text-obsidian">리본 패스 제공 혜택</h2>
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
              <Link href="/membership/reborn/checkout">
                <Button className="w-full md:w-auto bg-obsidian text-white hover:bg-obsidian/90 px-6 md:px-10 py-6 md:py-6 rounded-[20px] md:rounded-full text-base md:text-lg font-bold shadow-lg transition-all hover:scale-105">
                  월 9,900원으로 시작하기 <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* Comparison Table */}
      <section className="max-w-5xl mx-auto mb-16 md:mb-20">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-xl md:text-3xl font-black text-obsidian mb-3 md:mb-4">플랜 비교하기</h2>
          <p className="text-slate/60 text-xs md:text-base font-medium break-keep">나의 회복 목표에 맞는 최적의 플랜을 선택하세요.</p>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div className="min-w-[600px] md:min-w-[700px] bg-white rounded-[24px] md:rounded-[32px] border border-line shadow-sm overflow-hidden">
            <div className="grid grid-cols-4 bg-slate-50 border-b border-line p-4 md:p-6 text-center">
              <div className="text-left font-bold text-slate/50">기능 및 혜택</div>
              <div className="font-black text-obsidian text-lg">RESET<br/><span className="text-sm font-bold text-primary">무료</span></div>
              <div className="font-black text-obsidian text-lg">REBORN<br/><span className="text-sm font-bold text-chapter-accent">9,900원/월</span></div>
              <div className="font-black text-obsidian text-lg">RESTART<br/><span className="text-sm font-bold text-reward-gold">29,800원/월</span></div>
            </div>
            
            <div className="divide-y divide-line">
              <div className="grid grid-cols-4 p-4 md:p-6 text-center items-center hover:bg-slate-50/50 transition-colors">
                <div className="text-left font-bold text-slate/80">AI 라이프 스냅</div>
                <div className="font-medium text-slate/70">일 5회 제한</div>
                <div className="font-bold text-chapter-accent">무제한</div>
                <div className="font-bold text-reward-gold">무제한</div>
              </div>
              
              <div className="grid grid-cols-4 p-4 md:p-6 text-center items-center hover:bg-slate-50/50 transition-colors">
                <div className="text-left font-bold text-slate/80">리포트 분석 깊이</div>
                <div className="font-medium text-slate/70">현재 상태 브리프</div>
                <div className="font-bold text-chapter-accent">7일 누적 패턴 분석</div>
                <div className="font-bold text-reward-gold">심층 기질 분석 (30 facets)</div>
              </div>

              <div className="grid grid-cols-4 p-4 md:p-6 text-center items-center hover:bg-slate-50/50 transition-colors">
                <div className="text-left font-bold text-slate/80">사운드 테라피</div>
                <div className="font-medium text-slate/70">베이직 트랙</div>
                <div className="font-bold text-chapter-accent">전체 라이브러리</div>
                <div className="font-bold text-reward-gold">AI 보이스 맞춤 명상</div>
              </div>

              <div className="grid grid-cols-4 p-4 md:p-6 text-center items-center hover:bg-slate-50/50 transition-colors">
                <div className="text-left font-bold text-slate/80">전문가 1:1 솔루션</div>
                <div className="flex justify-center"><X className="w-5 h-5 text-slate/30" /></div>
                <div className="flex justify-center"><X className="w-5 h-5 text-slate/30" /></div>
                <div className="flex justify-center"><CheckCircle2 className="w-5 h-5 text-reward-gold" /></div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 bg-slate-50 p-4 md:p-6 text-center items-center">
              <div></div>
              <div className="px-2">
                <Link href="/basic-plan">
                  <Button variant="outline" className="w-full rounded-full font-bold">자세히 보기</Button>
                </Link>
              </div>
              <div>
                <Button disabled variant="outline" className="w-full rounded-full font-bold opacity-50 border-chapter-accent/50 text-chapter-accent">현재 선택됨</Button>
              </div>
              <div className="px-2">
                <Link href="/premium-plan">
                  <Button className="w-full rounded-full font-bold bg-reward-gold text-obsidian hover:bg-yellow-400">업그레이드</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </ChapterWrapper>
  );
}
