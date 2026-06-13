'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, X, Crown, Sparkles } from 'lucide-react';
import ChapterWrapper from '@/components/layout/ChapterWrapper';

export default function BasicPlanPage() {
  return (
    <ChapterWrapper chapter="membership" className="container mx-auto px-4 py-8 md:py-20 pb-16 md:pb-40 min-h-screen">
      {/* Header */}
      <div className="mb-12 md:mb-24 text-center space-y-4 md:space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] md:text-xs font-black tracking-[0.3em] uppercase border border-primary/20">
          RESET PASS
        </div>
        <h1 className="font-black text-obsidian tracking-tighter leading-[1.2] break-keep text-2xl md:text-5xl">
          회복의 첫 걸음,<br />
          <span className="text-primary">리셋 패스</span>
        </h1>
        <p className="text-xs md:text-base text-slate/70 leading-relaxed font-bold max-w-2xl mx-auto break-keep px-2">
          유니클의 혁신적인 AI 라이프 스캐너를 통해 매일 당신의 컨디션을 체크하고, 
          기본적인 회복 가이드를 경험해 보세요.
        </p>
      </div>

      {/* Plan Details */}
      <section className="max-w-4xl mx-auto mb-16 md:mb-20">
        <Card className="bg-white rounded-[24px] md:rounded-[48px] border-line shadow-xl overflow-hidden p-6 md:p-12">
          <h2 className="text-xl md:text-2xl font-black mb-6 md:mb-8 text-obsidian">리셋 패스 제공 혜택</h2>
          <ul className="space-y-6 text-sm md:text-base text-slate/80 font-medium">
            <li className="flex items-start gap-3 md:gap-4">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mt-0.5 text-primary shrink-0" />
              <div>
                <strong className="block text-obsidian text-base md:text-lg mb-1">일 5회 AI 카메라스캔</strong>
                <p className="break-keep text-xs md:text-sm">얼굴, 손끝 맥파, 주변 환경을 카메라로 스캔하여 매일 5회 무료로 생체 리듬을 체크합니다.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 md:gap-4">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mt-0.5 text-primary shrink-0" />
              <div>
                <strong className="block text-obsidian text-base md:text-lg mb-1">베이직 회복 리포트</strong>
                <p className="break-keep text-xs md:text-sm">현재 상태에 대한 기본적인 분석 결과와 최근 7일 동안의 상태 브리핑을 제공받습니다.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 md:gap-4">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mt-0.5 text-primary shrink-0" />
              <div>
                <strong className="block text-obsidian text-base md:text-lg mb-1">사운드 네이처 (일부 트랙)</strong>
                <p className="break-keep text-xs md:text-sm">안정감과 스트레스 해소를 돕는 고음질 자연 사운드 중 무료 에디션 일부 트랙을 감상할 수 있습니다.</p>
              </div>
            </li>
          </ul>
          
          <div className="mt-8 md:mt-12 text-center">
            <Link href="/?action=diagnose">
              <Button className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-6 md:px-10 py-6 md:py-6 rounded-[20px] md:rounded-full text-base md:text-lg font-bold shadow-lg shadow-primary/25 transition-all hover:scale-105">
                무료로 스캐너 시작하기 <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
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
              <div>
                <Button disabled variant="outline" className="w-full rounded-full font-bold opacity-50">현재 선택됨</Button>
              </div>
              <div className="px-2">
                <Link href="/founder-ticket">
                  <Button className="w-full rounded-full font-bold bg-obsidian text-white hover:bg-obsidian/90">업그레이드</Button>
                </Link>
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
