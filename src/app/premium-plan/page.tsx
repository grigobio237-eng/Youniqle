'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, X, Sparkles } from 'lucide-react';
import ChapterWrapper from '@/components/layout/ChapterWrapper';

export default function PremiumPlanPage() {
  return (
    <ChapterWrapper chapter="membership" className="container mx-auto px-4 py-8 md:py-20 pb-16 md:pb-40 min-h-screen">
      {/* Header */}
      <div className="mb-12 md:mb-24 text-center space-y-4 md:space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center px-4 py-1.5 bg-reward-gold/10 text-reward-gold rounded-full text-[10px] md:text-xs font-black tracking-[0.3em] uppercase border border-reward-gold/20">
          RESTART PASS
        </div>
        <h1 className="font-black text-obsidian tracking-tighter leading-[1.2] break-keep text-2xl md:text-5xl">
          가장 깊이 있는 나를 만나는 시간,<br />
          <span className="text-reward-gold">리스타트 패스</span>
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
              <h2 className="text-xl md:text-2xl font-black text-white">리스타트 패스 제공 혜택</h2>
              <div className="text-right">
                <span className="text-2xl md:text-3xl font-black text-reward-gold">29,800원</span>
                <span className="text-xs md:text-sm font-bold text-white/50 ml-1">/ 월</span>
              </div>
            </div>
            
            <ul className="space-y-6 text-sm md:text-base text-white/80 font-medium">
              <li className="flex items-start gap-3 md:gap-4">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mt-0.5 text-reward-gold shrink-0" />
                <div>
                  <strong className="block text-white text-base md:text-lg mb-1">심층 기질 분석 (16개 세부 국면)</strong>
                  <p className="break-keep text-xs md:text-sm text-white/60">단순한 상태 체크를 뛰어넘어, 개인의 고유한 기질과 성격적 16가지 다면적 심도 지표를 추출해 철저하게 규명합니다.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 md:gap-4">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mt-0.5 text-reward-gold shrink-0" />
                <div>
                  <strong className="block text-white text-base md:text-lg mb-1">AI 보이스 스트레칭 (맞춤 영상)</strong>
                  <p className="break-keep text-xs md:text-sm text-white/60">목소리의 톤, 성량, 템포를 지능적으로 판별하고 피로 해소에 최적화된 맞춤형 운동 요법 영상을 실시간 매칭 추천합니다.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 md:gap-4">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mt-0.5 text-reward-gold shrink-0" />
                <div>
                  <strong className="block text-white text-base md:text-lg mb-1">전문가 1:1 커스텀 솔루션</strong>
                  <p className="break-keep text-xs md:text-sm text-white/60">측정된 데이터 이력을 기반으로 멘탈 웰니스 및 피지컬 테라피 전문가진이 1:1 맞춤 피드백을 전달해 드립니다.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 md:gap-4">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mt-0.5 text-reward-gold shrink-0" />
                <div>
                  <strong className="block text-white text-base md:text-lg mb-1">리본 패스 모든 혜택 포함</strong>
                  <p className="break-keep text-xs md:text-sm text-white/60">무제한 AI 카메라스캔, 7-Day 누적 패턴 분석, 사운드 네이처 전체 라이브러리 등 리본 패스의 모든 특권을 누립니다.</p>
                </div>
              </li>
            </ul>
            
            <div className="mt-8 md:mt-12 text-center">
              <Link href="/membership/restart/checkout">
                <Button className="w-full md:w-auto bg-reward-gold text-obsidian hover:bg-yellow-400 px-6 md:px-10 py-6 md:py-6 rounded-[20px] md:rounded-full text-base md:text-lg font-bold shadow-[0_0_30px_rgba(255,215,0,0.3)] transition-all hover:scale-105">
                  월 29,800원으로 시작하기 <ArrowRight className="ml-2 w-5 h-5" />
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
                <div className="text-left font-bold text-slate/80">AI 카메라스캔</div>
                <div className="font-medium text-slate/70">일 5회 제한</div>
                <div className="font-bold text-chapter-accent">무제한</div>
                <div className="font-bold text-reward-gold">무제한</div>
              </div>
              
              <div className="grid grid-cols-4 p-4 md:p-6 text-center items-center hover:bg-slate-50/50 transition-colors">
                <div className="text-left font-bold text-slate/80">분석 및 리포트</div>
                <div className="font-medium text-slate/70">베이직 회복 리포트 (최근 7일)</div>
                <div className="font-bold text-chapter-accent">7-Day 누적 패턴 분석 (무제한)</div>
                <div className="font-bold text-reward-gold">심층 기질 분석 (16개 세부 국면)</div>
              </div>

              <div className="grid grid-cols-4 p-4 md:p-6 text-center items-center hover:bg-slate-50/50 transition-colors">
                <div className="text-left font-bold text-slate/80">사운드 & 영상 힐링</div>
                <div className="font-medium text-slate/70">사운드 네이처 일부 트랙</div>
                <div className="font-bold text-chapter-accent">사운드 네이처 전체 라이브러리</div>
                <div className="font-bold text-reward-gold">AI 보이스 스트레칭 (맞춤 영상)</div>
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
              <div className="px-2">
                <Link href="/founder-ticket">
                  <Button variant="outline" className="w-full rounded-full font-bold">자세히 보기</Button>
                </Link>
              </div>
              <div>
                <Button disabled variant="outline" className="w-full rounded-full font-bold opacity-50 border-reward-gold/50 text-reward-gold">현재 선택됨</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </ChapterWrapper>
  );
}
