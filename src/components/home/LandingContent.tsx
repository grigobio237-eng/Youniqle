'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, BarChart3, Map, Lightbulb, Zap, Shield, Crown, Users, Camera, Activity, Video, Music, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingContent({ onStart }: { onStart: () => void }) {
  const utilities = [
    {
      title: "AI Sensory Scanner",
      desc: "공간의 분위기와 식단의 영양을 한 번에 스캔하여 현재의 회복 상태를 분석합니다.",
      icon: <Camera className="w-6 h-6" />,
      color: "bg-chapter-accent",
      action: "스캐너 실행",
      link: "#scanner"
    },
    {
      title: "60s Diagnosis",
      desc: "과학적인 질문 알고리즘을 통해 당신의 신체적, 정신적 회복 필요도를 정밀 측정합니다.",
      icon: <Activity className="w-6 h-6" />,
      color: "bg-reward-gold",
      action: "진단 시작",
      onClick: onStart
    },
    {
      title: "Video Analysis",
      desc: "움직임과 자세를 AI로 분석하여 회복을 방해하는 습관을 찾아내고 교정 가이드를 드립니다.",
      icon: <Video className="w-6 h-6" />,
      color: "bg-status-normal",
      action: "분석 시작",
      link: "/ai-navigator"
    },
    {
      title: "Sound Therapy",
      desc: "현재 스트레스 지수에 최적화된 회복 주파수와 사운드스케이프를 큐레이션합니다.",
      icon: <Music className="w-6 h-6" />,
      color: "bg-obsidian",
      action: "청취하기",
      link: "/gallery/artworks"
    }
  ];

  return (
    <div className="bg-mist space-y-32 pb-32 pt-20">
      {/* 1. Utility Hub (Action-Provoking Step 6) */}
      <section className="container mx-auto px-6 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-chapter-accent/10 text-chapter-accent text-[10px] font-black uppercase tracking-widest mb-2">
            Recovery Tools
          </div>
          <h2 className="text-xl md:text-5xl font-black text-obsidian tracking-tight">다른 유용한 도구도 확인해 보세요</h2>
          <p className="text-slate/60 text-base md:text-lg leading-relaxed">환경부터 사운드까지, 당신의 모든 감각을 분석하는 유니클의 AI 도구들입니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {utilities.map((util, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -8 }}
              className="group bg-white p-8 rounded-[40px] border border-line shadow-sm hover:shadow-2xl hover:border-chapter-accent transition-all duration-500 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className={`w-14 h-14 ${util.color} rounded-2xl flex items-center justify-center text-white shadow-xl shadow-chapter-accent/5`}>
                  {util.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-obsidian tracking-tight group-hover:text-chapter-accent transition-colors">{util.title}</h3>
                  <p className="text-slate/60 text-sm leading-relaxed">{util.desc}</p>
                </div>
              </div>
              <div className="mt-10 pt-6 border-t border-line/50">
                <Button 
                  variant="ghost" 
                  onClick={util.onClick}
                  className="p-0 h-auto text-chapter-accent font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-transparent group-hover:translate-x-1 transition-transform"
                >
                  {util.action} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 2. Path Preview (Visual Roadmap) */}
      <section className="container mx-auto px-6 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-xl md:text-4xl font-black text-obsidian tracking-tight uppercase italic">Recovery Paths</h2>
          <p className="text-slate/60 font-medium">당신의 결과에 따라 활성화되는 3가지 정밀 로드맵</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Path 1 */}
          <div className="group relative bg-white border border-line rounded-[48px] p-12 overflow-hidden hover:border-chapter-accent transition-all duration-500 shadow-sm hover:shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-chapter-accent/5 rounded-full blur-3xl -mr-24 -mt-24 group-hover:bg-chapter-accent/10 transition-colors" />
            <div className="relative z-10 space-y-8">
              <div className="w-16 h-16 bg-mist rounded-3xl flex items-center justify-center text-3xl shadow-inner border border-line/50">
                <Zap className="w-8 h-8 text-chapter-accent" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-obsidian mb-3 tracking-tight">리듬 회복</h3>
                <p className="text-slate/60 text-sm leading-relaxed">
                  일상의 작은 균형이 무너졌을 때.<br />
                  생활 패턴과 생체 리듬을 정상화합니다.
                </p>
              </div>
              <ul className="space-y-4 text-xs font-bold text-slate/60">
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-chapter-accent rounded-full" /> 수면 패턴 최적화</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-chapter-accent rounded-full" /> 스트레스 이완 가이드</li>
              </ul>
            </div>
          </div>

          {/* Path 2 */}
          <div className="group relative bg-obsidian border border-obsidian rounded-[48px] p-12 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-reward-gold/20 rounded-full blur-3xl -mr-24 -mt-24" />
            <div className="relative z-10 space-y-8">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-3xl shadow-inner border border-white/10 text-reward-gold">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-mist mb-3 tracking-tight">집중 회복</h3>
                <p className="text-mist/70 text-sm leading-relaxed">
                  확실한 변화와 관리가 필요할 때.<br />
                  전문화된 도구와 코칭으로 집중 케어합니다.
                </p>
              </div>
              <ul className="space-y-4 text-xs font-bold text-mist/60">
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-reward-gold rounded-full" /> 맞춤형 영양 및 도구</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-reward-gold rounded-full" /> 전문가 1:1 연결</li>
              </ul>
            </div>
          </div>

          {/* Path 3 */}
          <div className="group relative bg-white border border-line rounded-[48px] p-12 overflow-hidden hover:border-status-normal transition-all duration-500 shadow-sm hover:shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-status-normal/5 rounded-full blur-3xl -mr-24 -mt-24 group-hover:bg-status-normal/10 transition-colors" />
            <div className="relative z-10 space-y-8">
              <div className="w-16 h-16 bg-mist rounded-3xl flex items-center justify-center text-3xl shadow-inner border border-line/50">
                <Crown className="w-8 h-8 text-status-normal" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-obsidian mb-3 tracking-tight">프리미엄 회복</h3>
                <p className="text-slate/60 text-sm leading-relaxed">
                  몰입과 깊은 치유의 경험.<br />
                  오프라인 힐링센터와 연계된 프라이빗 케어.
                </p>
              </div>
              <ul className="space-y-4 text-xs font-bold text-slate/60">
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-status-normal rounded-full" /> 힐링센터 익스클루시브</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-status-normal rounded-full" /> 개인화된 멤버십 혜택</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bottom CTA (Step 7 alignment) */}
      <section className="container mx-auto px-6 text-center">
        <div className="bg-obsidian p-20 rounded-[64px] shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-chapter-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative z-10 space-y-10">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-6xl font-black text-white leading-tight tracking-tight">당신의 세계를 스캔하세요.<br />진정한 회복은 지금부터입니다.</h2>
              <p className="text-white/70 text-base md:text-xl font-medium">유니클의 데이터 기반 회복 프로토콜에 합류하세요</p>
            </div>
            <Button onClick={onStart} size="lg" className="bg-chapter-accent text-white hover:bg-chapter-accent/90 h-16 md:h-24 px-12 md:px-16 rounded-[24px] md:rounded-[32px] text-lg md:text-2xl font-black shadow-2xl shadow-chapter-accent/40 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <Sparkles className="w-8 h-8 mr-4 group-hover:rotate-12 transition-transform" />
              60초 정밀 진단 시작하기
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
