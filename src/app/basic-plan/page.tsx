'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, X, Crown, Sparkles } from 'lucide-react';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import MembershipTierCards from '@/components/home/MembershipTierCards';

export default function BasicPlanPage() {
  return (
    <ChapterWrapper chapter="membership" className="container mx-auto px-4 py-8 md:py-20 pb-16 md:pb-40 min-h-screen">
      {/* Header */}
      <div className="mb-12 md:mb-24 text-center space-y-4 md:space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] md:text-xs font-black tracking-[0.3em] uppercase border border-primary/20">
          Basic Plan
        </div>
        <h1 className="font-black text-obsidian tracking-tighter leading-[1.2] break-keep text-2xl md:text-5xl">
          회복의 첫 걸음,<br />
          <span className="text-primary">베이직 플랜</span>
        </h1>
        <p className="text-xs md:text-base text-slate/70 leading-relaxed font-bold max-w-2xl mx-auto break-keep px-2">
          유니클의 혁신적인 AI 라이프 스캐너를 통해 매일 당신의 컨디션을 체크하고, 
          기본적인 회복 가이드를 경험해 보세요.
        </p>
      </div>

      {/* Plan Details */}
      <section className="max-w-4xl mx-auto mb-16 md:mb-20">
        <Card className="bg-white rounded-[24px] md:rounded-[48px] border-line shadow-xl overflow-hidden p-6 md:p-12">
          <h2 className="text-xl md:text-2xl font-black mb-6 md:mb-8 text-obsidian">베이직 플랜 제공 혜택</h2>
          <ul className="space-y-6 text-sm md:text-base text-slate/80 font-medium">
            <li className="flex items-start gap-3 md:gap-4">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mt-0.5 text-primary shrink-0" />
              <div>
                <strong className="block text-obsidian text-base md:text-lg mb-1">일 5회 AI 라이프 스냅</strong>
                <p className="break-keep text-xs md:text-sm">얼굴, 음식, 환경 등을 스캔하여 매일 5번까지 무료로 컨디션을 분석할 수 있습니다.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 md:gap-4">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mt-0.5 text-primary shrink-0" />
              <div>
                <strong className="block text-obsidian text-base md:text-lg mb-1">베이직 회복 리포트</strong>
                <p className="break-keep text-xs md:text-sm">현재 상태에 대한 기본적인 분석 결과와 가벼운 회복 솔루션을 제공받습니다.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 md:gap-4">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mt-0.5 text-primary shrink-0" />
              <div>
                <strong className="block text-obsidian text-base md:text-lg mb-1">사운드 테라피 (일부)</strong>
                <p className="break-keep text-xs md:text-sm">기본적인 휴식을 돕는 자연음과 백색소음 트랙을 제한적으로 이용할 수 있습니다.</p>
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

      {/* Comparison Cards */}
      <section className="max-w-6xl mx-auto mb-16 md:mb-20">
        <MembershipTierCards />
      </section>

    </ChapterWrapper>
  );
}
