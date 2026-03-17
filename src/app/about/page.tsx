'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  Heart,
  ChevronRight,
  MousePointer2,
  Lock,
  Layers,
  Fingerprint,
  Crown
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <div className="bg-[#0B0D10] text-[#F9F7F2] overflow-x-hidden">
      {/* 1. Hero Section: The Paths */}
      <section className="relative min-h-[70vh] flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D10] via-transparent to-[#0B0D10]" />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8"
        >
          <motion.div variants={itemVariants} className="space-y-4">
            <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.8em] block">Why Recovery Paths?</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic leading-tight">
              회복은 느낌이 아니라, <br />
              <span className="text-[#D4AF37]">정교한 설계</span>입니다.
            </h1>
          </motion.div>

          <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-lg md:text-xl font-medium text-[#F9F7F2]/60 leading-relaxed word-keep-all">
            사람마다 피로의 깊이와 삶의 궤적이 다릅니다. <br />
            유니클은 진단 결과에 따라 당신의 현재 상태에 가장 필요한 <br className="hidden md:block" />
            3가지 최적화된 회복 경로를 제안합니다.
          </motion.p>
        </motion.div>
      </section>

      {/* 2. The Three Paths */}
      <section className="py-32 space-y-40">
        {/* Path 1: Rhythm */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full">
              <Layers className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest">Path 01. Rhythm</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic">리듬 회복: <br /> 무너진 일상의 기초공사</h2>
            <p className="text-[#F9F7F2]/50 leading-relaxed text-lg">
              바쁜 일상 속에서 가장 먼저 깨지는 것은 '리듬'입니다. <br />
              리듬 회복 경로는 수면, 신체 활동, 영양 밸런스를 즉각적으로 정상화하여 <br />
              내일을 살아갈 최소한의 에너지를 복구하는 데 집중합니다.
            </p>
            <ul className="space-y-4 text-sm font-bold text-[#F9F7F2]/80">
              <li className="flex items-center gap-3"><ChevronRight className="w-4 h-4 text-[#D4AF37]" /> 데이터 기반 수면 골든타임 제안</li>
              <li className="flex items-center gap-3"><ChevronRight className="w-4 h-4 text-[#D4AF37]" /> 데일리 웰니스 루틴 자동 설계</li>
            </ul>
          </motion.div>
          <div className="relative aspect-video bg-[#F9F7F2]/5 rounded-[40px] border border-[#F9F7F2]/10 overflow-hidden flex items-center justify-center">
            <span className="text-6xl opacity-20">🌿</span>
          </div>
        </div>

        {/* Path 2: Focused */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative aspect-video bg-[#D4AF37]/5 rounded-[40px] border border-[#D4AF37]/10 overflow-hidden order-2 lg:order-1 flex items-center justify-center">
            <span className="text-6xl opacity-20">🔋</span>
          </div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8 order-1 lg:order-2">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-chapter-accent/10 border border-chapter-accent/20 rounded-full text-chapter-accent">
              <Cpu className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">Path 02. Focused</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic">집중 회복: <br /> 번아웃 임계점을 넘은 당신에게</h2>
            <p className="text-[#F9F7F2]/50 leading-relaxed text-lg">
              스스로의 힘으로 회복하기 힘든 임계점을 넘었을 때 선택하는 경로입니다. <br />
              정밀 분석 도구와 전문 파트너의 개입을 통해 <br />
              급격히 저하된 생체 효율을 빠르게 반등시킵니다.
            </p>
            <ul className="space-y-4 text-sm font-bold text-[#F9F7F2]/80">
              <li className="flex items-center gap-3"><ChevronRight className="w-4 h-4 text-chapter-accent" /> 전문가 1:1 맞춤 피드백</li>
              <li className="flex items-center gap-3"><ChevronRight className="w-4 h-4 text-chapter-accent" /> 정밀 회복 툴박스 매칭</li>
            </ul>
          </motion.div>
        </div>

        {/* Path 3: Premium */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full">
              <Crown className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest">Path 03. Premium</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic">프리미엄 회복: <br /> 깊은 몰입과 본질적 변화</h2>
            <p className="text-[#F9F7F2]/50 leading-relaxed text-lg">
               단순한 피로 해소를 넘어 고차원의 정신적·신체적 치유를 목적으로 합니다. <br />
               오프라인 힐링센터와 유니클 익스클루시브 공간을 통해 <br />
               완전한 세상과의 단절과 깊은 회복의 경험을 제공합니다.
            </p>
            <ul className="space-y-4 text-sm font-bold text-[#F9F7F2]/80">
              <li className="flex items-center gap-3"><ChevronRight className="w-4 h-4 text-[#D4AF37]" /> 힐링센터 프라이빗 세션 예약</li>
              <li className="flex items-center gap-3"><ChevronRight className="w-4 h-4 text-[#D4AF37]" /> VIP 커뮤니티 및 프리미엄 케어</li>
            </ul>
          </motion.div>
          <div className="relative aspect-video bg-[#F9F7F2]/5 rounded-[40px] border border-[#F9F7F2]/10 overflow-hidden flex items-center justify-center">
            <span className="text-6xl opacity-20">💎</span>
          </div>
        </div>
      </section>

      {/* 4. Final CTA */}
      <section className="py-60 relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight italic">
              당신에게 맞는 <br />
              <span className="text-[#D4AF37]">회복의 경로</span>는 어디인가요?
            </h2>
            <div className="pt-10">
              <Button onClick={() => window.location.href = '/?action=diagnose'} className="h-24 px-16 bg-[#F9F7F2] text-[#0B0D10] rounded-full font-black text-xl uppercase tracking-widest shadow-[0_40px_80px_rgba(249,247,242,0.1)] hover:scale-105 transition-all group gap-6">
                현재 상태 진단하기
                <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
              </Button>
            </div>
        </div>
      </section>

      {/* Footer Decoration */}
      <footer className="py-20 text-center border-t border-[#F9F7F2]/5">
        <p className="text-[10px] font-black text-[#F9F7F2]/20 uppercase tracking-[1em]">Youniqle ? All Rights Reserved</p>
      </footer>
    </div>
  );
}
