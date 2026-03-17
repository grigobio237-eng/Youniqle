'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, BarChart3, Map, Lightbulb, Zap, Shield, Crown, Users } from 'lucide-react';

export default function LandingContent({ onStart }: { onStart: () => void }) {
  return (
    <div className="bg-mist space-y-24 pb-32">
      {/* 1. Sub Info Boxes */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[32px] border border-line shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-chapter-accent/10 rounded-2xl flex items-center justify-center text-chapter-accent mb-6">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-obsidian mb-3">회복 점수</h3>
            <p className="text-slate/70 text-sm leading-relaxed">
              데이터로 증명하는 오늘의 활력.<br />
              현재 당신의 에너지를 수치로 확인하세요.
            </p>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-line shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-status-normal/10 rounded-2xl flex items-center justify-center text-status-normal mb-6">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-obsidian mb-3">회복 경로</h3>
            <p className="text-slate/70 text-sm leading-relaxed">
              방황하지 않는 3가지 솔루션.<br />
              상태에 맞는 최적의 길을 안내합니다.
            </p>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-line shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-reward-gold/10 rounded-2xl flex items-center justify-center text-reward-gold mb-6">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-obsidian mb-3">행동 제안</h3>
            <p className="text-slate/70 text-sm leading-relaxed">
              헤매지 않는 루틴 설계.<br />
              지금 즉시 실행 가능한 행동을 제안합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Path Preview */}
      <section className="container mx-auto px-6 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-serif-display text-obsidian">3가지 회복 경로</h2>
          <p className="text-slate/60">당신의 상태에 따라 정밀하게 설계된 로드맵</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Path 1 */}
          <div className="group relative bg-white border border-line rounded-[40px] p-10 overflow-hidden hover:border-chapter-accent transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-chapter-accent/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-chapter-accent/10 transition-colors" />
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 bg-mist rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                <Zap className="w-7 h-7 text-chapter-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-obsidian mb-2">리듬 회복</h3>
                <p className="text-slate/70 text-sm leading-relaxed">
                  일상의 작은 균형이 무너졌을 때.<br />
                  생활 패턴과 생체 리듬을 정상화합니다.
                </p>
              </div>
              <ul className="space-y-3 text-xs font-medium text-slate/50">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-chapter-accent rounded-full" /> 수면 패턴 최적화</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-chapter-accent rounded-full" /> 스트레스 이완 가이드</li>
              </ul>
            </div>
          </div>

          {/* Path 2 */}
          <div className="group relative bg-obsidian border border-obsidian rounded-[40px] p-10 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-reward-gold/20 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/10 text-reward-gold">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-mist mb-2">집중 회복</h3>
                <p className="text-mist/60 text-sm leading-relaxed">
                  확실한 변화와 관리가 필요할 때.<br />
                  전문화된 도구와 코칭으로 집중 케어합니다.
                </p>
              </div>
              <ul className="space-y-3 text-xs font-medium text-mist/30">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-reward-gold rounded-full" /> 맞춤형 영양 및 도구</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-reward-gold rounded-full" /> 전문가 1:1 연결</li>
              </ul>
            </div>
          </div>

          {/* Path 3 */}
          <div className="group relative bg-white border border-line rounded-[40px] p-10 overflow-hidden hover:border-status-normal transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-status-normal/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-status-normal/10 transition-colors" />
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 bg-mist rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                <Crown className="w-7 h-7 text-status-normal" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-obsidian mb-2">프리미엄 회복</h3>
                <p className="text-slate/70 text-sm leading-relaxed">
                  몰입과 깊은 치유의 경험.<br />
                  가상 공간과 오프라인 센터를 연계합니다.
                </p>
              </div>
              <ul className="space-y-3 text-xs font-medium text-slate/50">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-status-normal rounded-full" /> 힐링센터 익스클루시브</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-status-normal rounded-full" /> 개인화된 멤버십 혜택</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Partner Section */}
      <section className="container mx-auto px-6">
        <div className="bg-white border border-line rounded-[40px] p-12 flex flex-col md:flex-row items-center gap-12 text-center md:text-left shadow-sm">
          <div className="w-24 h-24 bg-mist rounded-full flex items-center justify-center text-4xl shrink-0">
            <Users className="w-10 h-10 text-slate" />
          </div>
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-obsidian tracking-tight">당신의 회복을 위해 존재하는 파트너들</h2>
            <p className="text-slate/60 text-lg leading-relaxed">
              유니클은 불필요한 연결을 줄입니다. 진단 결과에 따라<br className="hidden md:block" />
              당신에게 가장 필요한 전문가와 센터만을 정밀하게 매칭합니다.
            </p>
          </div>
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-line font-bold hover:bg-mist">
            파트너십 가치 보기
          </Button>
        </div>
      </section>

      {/* 4. Bottom CTA */}
      <section className="container mx-auto px-6 text-center">
        <div className="bg-chapter-accent p-16 rounded-[48px] shadow-2xl shadow-chapter-accent/20 space-y-8">
          <h2 className="text-3xl md:text-5xl font-serif-display text-white">진단은 시작일 뿐입니다.</h2>
          <Button onClick={onStart} size="lg" className="bg-white text-obsidian hover:bg-mist h-16 md:h-20 px-12 rounded-[24px] text-lg md:text-xl font-black shadow-xl">
            <Sparkles className="w-6 h-6 mr-3" />
            60초 회복 진단 시작하기
          </Button>
          <p className="text-white/60 text-sm font-medium">유니클의 데이터 기반 회복 프로토콜에 합류하세요</p>
        </div>
      </section>
    </div>
  );
}
