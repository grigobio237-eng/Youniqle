'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  Activity,
  ChevronRight,
  MousePointer2,
  Lock,
  Layers,
  Fingerprint,
  Crown,
  Brain,
  Zap,
  Target,
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.98]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
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
    <div className="bg-mist text-obsidian overflow-x-hidden selection:bg-chapter-accent selection:text-white">
      {/* 1. Cinematic Hero Section (Maintains deep impact but transitions to light) */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Focused Blur Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/about/hero.png" 
            alt="Hero Background" 
            fill 
            className="object-cover opacity-80"
            priority
          />
          {/* Transition from dark top to Mist bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-mist" />
          <div className="absolute inset-0 backdrop-blur-[1px]" />
        </div>

        <motion.div 
          style={{ opacity, scale }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-6xl mx-auto px-6 text-center space-y-10"
        >
          <motion.div variants={itemVariants} className="space-y-6">
            <span className="inline-flex items-center gap-3 px-4 py-2 bg-chapter-accent/20 border border-chapter-accent/40 rounded-full backdrop-blur-md shadow-lg">
              <Sparkles className="w-4 h-4 text-chapter-accent animate-pulse" />
              <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.5em]">The Science of Recovery</span>
            </span>
            <h1 className="text-4xl xs:text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter italic leading-[0.9] text-white drop-shadow-2xl">
              RECOVERY IS <br />
              <span className="text-chapter-accent italic">NOT A FEELING.</span>
            </h1>
          </motion.div>

          <motion.p variants={itemVariants} className="max-w-3xl mx-auto text-lg md:text-2xl font-black text-white leading-relaxed word-keep-all drop-shadow-lg">
            회복은 단순한 느낌이 아닙니다. 데이터와 알고리즘으로 설계된 <br className="hidden md:block" />
            <span className="bg-chapter-accent px-2 text-white italic">최상의 컨디션을 향한 정밀한 프로토콜</span>입니다.
          </motion.p>

          <motion.div variants={itemVariants} className="pt-8">
            <div className="animate-bounce p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full inline-block shadow-2xl">
              <ChevronRight className="w-6 h-6 rotate-90 text-white" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. Philosophy Section: The Logic (Light Theme) */}
      <section className="py-32 md:py-48 relative bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-12"
            >
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter italic leading-tight text-obsidian">
                  왜 당신은<br />
                  <span className="text-chapter-accent">회복되지 않는가?</span>
                </h2>
                <p className="text-xl md:text-2xl text-slate/70 leading-relaxed font-medium word-keep-all">
                  휴식은 가만히 있는 것이 아닙니다. 뇌와 신체가 잔여 스트레스를 완전히 소거하고 에너지를 재충전하는 데이터화된 과정입니다. 유니클은 보이지 않는 피로의 흔적을 추적하여 실감할 수 있는 반등을 만듭니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-10 rounded-[40px] bg-mist border border-line group hover:border-chapter-accent hover:shadow-xl transition-all duration-500">
                  <Brain className="w-10 h-10 text-chapter-accent mb-6 group-hover:scale-110 transition-transform" />
                  <h4 className="text-2xl font-black mb-3 text-obsidian tracking-tight">AI Analysis</h4>
                  <p className="text-sm text-slate/60 leading-relaxed font-bold">생체 리듬과 생활 패턴의 <br /> 정밀한 상관관계 분석</p>
                </div>
                <div className="p-10 rounded-[40px] bg-mist border border-line group hover:border-reward-gold hover:shadow-xl transition-all duration-500">
                  <Target className="w-10 h-10 text-reward-gold mb-6 group-hover:scale-110 transition-transform" />
                  <h4 className="text-2xl font-black mb-3 text-obsidian tracking-tight">Precision</h4>
                  <p className="text-sm text-slate/60 leading-relaxed font-bold">개인별 번아웃 임계점에 <br /> 맞춘 커스텀 프로토콜</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square hidden lg:flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-chapter-accent/5 rounded-full blur-[100px] animate-pulse" />
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                 <div className="w-full h-full border-4 border-line rounded-full flex items-center justify-center animate-spin-slow">
                    <div className="w-[85%] h-[85%] border-2 border-chapter-accent/10 border-dashed rounded-full flex items-center justify-center">
                       <div className="w-[65%] h-[65%] bg-gradient-to-tr from-chapter-accent to-reward-gold p-1 rounded-full overflow-hidden shadow-2xl">
                          <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                             <Sparkles className="w-24 h-24 text-chapter-accent animate-pulse" />
                          </div>
                       </div>
                    </div>
                 </div>
                 {/* Decorative Floating Circles */}
                 <div className="absolute top-10 right-10 w-24 h-24 bg-chapter-accent/10 rounded-full blur-2xl animate-float" />
                 <div className="absolute bottom-20 left-0 w-32 h-32 bg-reward-gold/10 rounded-full blur-2xl animate-float-delay" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. The Three Paths: Defined Cards (Light Theme) */}
      <section className="py-32 md:py-48 bg-mist">
        <div className="max-w-7xl mx-auto px-6 space-y-32 md:space-y-56">
          
          {/* Path 01: Rhythm */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-5 space-y-12"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-chapter-accent/10 border border-chapter-accent/20 rounded-full">
                  <Layers className="w-4 h-4 text-chapter-accent" />
                  <span className="text-[10px] font-black text-chapter-accent uppercase tracking-widest leading-none">Path 01</span>
                </div>
                <h3 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter italic text-obsidian uppercase">Rhythm</h3>
                <p className="text-2xl md:text-4xl font-black tracking-tight leading-tight text-obsidian italic">
                  리듬 회복: <br /> 무너진 일상의 기초공사
                </p>
                <p className="text-lg text-slate/70 leading-relaxed font-medium">
                  바쁜 일상 속에서 가장 먼저 깨지는 것은 '리듬'입니다. 리듬 회복 경로는 수면, 신체 활동, 영양 밸런스를 즉각적으로 정상화하여 내일을 살아갈 에너지를 복구합니다.
                </p>
              </div>
              <ul className="space-y-6">
                {['데이터 기반 수면 골든타임 재설계', '데일리 웰니스 리듬 자동 보정', '영양 밸런스 큐레이션'].map((t, i) => (
                  <li key={i} className="flex items-center gap-5 text-base font-black text-obsidian group">
                    <div className="w-8 h-8 rounded-full bg-chapter-accent/10 flex items-center justify-center group-hover:bg-chapter-accent transition-colors">
                      <ChevronRight className="w-4 h-4 text-chapter-accent group-hover:text-white" />
                    </div>
                    {t}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-7 relative aspect-[4/3] rounded-[60px] md:rounded-[100px] overflow-hidden border-8 border-white shadow-2xl group"
            >
              <Image src="/images/about/rhythm.png" alt="Rhythm Path" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/40 to-transparent" />
              <div className="absolute bottom-10 left-10 p-8 bg-white/80 backdrop-blur-xl border border-line rounded-[40px] max-w-xs shadow-xl">
                <p className="text-sm font-black text-obsidian italic leading-relaxed">"가장 자연스러운 속도로 삶의 주기를 되찾는 완벽한 경험"</p>
              </div>
            </motion.div>
          </div>

          {/* Path 02: Focused */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-7 relative aspect-[4/3] rounded-[60px] md:rounded-[100px] overflow-hidden border-8 border-white shadow-2xl group order-2 lg:order-1"
            >
              <Image src="/images/about/focused.png" alt="Focused Path" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-reward-gold/20 via-transparent to-transparent" />
              <div className="absolute bottom-10 right-10 p-8 bg-white/80 backdrop-blur-xl border border-line rounded-[40px] max-w-xs text-right shadow-xl">
                <p className="text-sm font-black text-obsidian italic leading-relaxed">"번아웃 임계점을 넘은 당신을 위한 데이터 기반 정밀 관리"</p>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-5 space-y-12 order-1 lg:order-2"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-reward-gold/10 border border-reward-gold/20 rounded-full">
                  <Zap className="w-4 h-4 text-reward-gold" />
                  <span className="text-[10px] font-black text-reward-gold uppercase tracking-widest leading-none">Path 02</span>
                </div>
                <h3 className="text-5xl md:text-8xl font-black tracking-tighter italic text-obsidian uppercase">Focused</h3>
                <p className="text-2xl md:text-4xl font-black tracking-tight leading-tight text-obsidian italic">
                  집중 회복: <br /> 신체 효율의 급격한 반등
                </p>
                <p className="text-lg text-slate/70 leading-relaxed font-medium">
                  회복 임계점을 넘었을 때 선택하는 경로입니다. 정밀 분석 도구와 전문 파트너의 개입을 통해 저하된 생체 효율을 빠르게 정상 궤도로 끌어올립니다.
                </p>
              </div>
              <ul className="space-y-6">
                {['전문가 1:1 집중 피드백 시스템', '정밀 회복 툴박스 리얼타임 매칭', '스트레스 임계치 집중 관리'].map((t, i) => (
                  <li key={i} className="flex items-center gap-5 text-base font-black text-obsidian group">
                    <div className="w-8 h-8 rounded-full bg-reward-gold/10 flex items-center justify-center group-hover:bg-reward-gold transition-colors">
                      <ChevronRight className="w-4 h-4 text-reward-gold group-hover:text-white" />
                    </div>
                    {t}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Path 03: Premium */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-5 space-y-12"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-chapter-accent/10 border border-chapter-accent/20 rounded-full">
                  <Crown className="w-4 h-4 text-chapter-accent" />
                  <span className="text-[10px] font-black text-chapter-accent uppercase tracking-widest leading-none">Path 03</span>
                </div>
                <h3 className="text-5xl md:text-8xl font-black tracking-tighter italic text-obsidian uppercase">Premium</h3>
                <p className="text-2xl md:text-4xl font-black tracking-tight leading-tight text-obsidian italic">
                  프리미엄 회복: <br /> 깊은 몰입과 본질적 변화
                </p>
                <p className="text-lg text-slate/70 leading-relaxed font-medium">
                  단순한 휴식을 넘어 고차원의 정신적·신체적 치유를 목적으로 합니다. 오프라인 힐링센터와 유니클 익스클루시브 공간을 통해 완전한 몰입과 회복을 제공합니다.
                </p>
              </div>
              <ul className="space-y-6">
                {['프리미엄 힐링센터 익스클루시브 이용', '메디스테이트 전문 팀 밀착 케어', '프라이빗 회복 세션 큐레이션'].map((t, i) => (
                  <li key={i} className="flex items-center gap-5 text-base font-black text-obsidian group">
                    <div className="w-8 h-8 rounded-full bg-chapter-accent/10 flex items-center justify-center group-hover:bg-chapter-accent transition-colors">
                      <ChevronRight className="w-4 h-4 text-chapter-accent group-hover:text-white" />
                    </div>
                    {t}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-7 relative aspect-[4/3] rounded-[60px] md:rounded-[100px] overflow-hidden border-8 border-white shadow-2xl group"
            >
              <Image src="/images/about/premium.png" alt="Premium Path" fill className="object-cover group-hover:scale-110 transition-transform duration-[2000ms]" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/40 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 p-8 bg-white/80 backdrop-blur-xl border border-line rounded-[40px] max-w-xs shadow-xl">
                <p className="text-sm font-black text-obsidian italic leading-relaxed">"현실에서 벗어나 마주하는 진정한 본질의 회복과 치유"</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Final CTA: Re-designed for Light Theme Impact */}
      <section className="py-40 md:py-64 relative overflow-hidden bg-white">
        {/* Background Decorative Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-chapter-accent/5 rounded-full blur-[240px]" />
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center space-y-16 md:space-y-24">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <h2 className="text-4xl xs:text-5xl sm:text-7xl md:text-[140px] font-black tracking-tight leading-[0.8] italic block text-obsidian">
                CHOOSE YOUR <br />
                <span className="text-chapter-accent">RECOVERY PATH.</span>
              </h2>
              <p className="text-2xl md:text-5xl text-slate/40 font-black tracking-tight italic">당신께 필요한 회복의 경로, 지금 확인하시겠습니까?</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="pt-10 flex flex-col items-center gap-10"
            >
              <Button 
                onClick={() => window.location.href = '/?action=diagnose'} 
                className="h-24 md:h-32 px-12 md:px-24 bg-obsidian text-white rounded-full font-black text-xl md:text-3xl uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all group flex items-center gap-8 md:gap-16 border-8 border-white"
              >
                Start Diagnosis
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-chapter-accent flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-6 h-6 md:w-10 md:h-10 text-white" />
                </div>
              </Button>
              <p className="text-[10px] md:text-sm font-black text-slate/30 uppercase tracking-[1em]">Integrated AI Diagnosis © Youniqle</p>
            </motion.div>
        </div>
      </section>

      {/* 5. Clean Light Footer */}
      <footer className="py-24 text-center border-t border-line relative bg-mist">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12 opacity-50">
           <p className="text-[10px] md:text-xs font-black text-obsidian uppercase tracking-widest leading-none">Designed for Better Life Transformation</p>
           <div className="flex items-center gap-16">
              <span className="text-[10px] md:text-xs font-black text-obsidian uppercase tracking-widest">Scientific</span>
              <span className="text-[10px] md:text-xs font-black text-obsidian uppercase tracking-widest">Human</span>
              <span className="text-[10px] md:text-xs font-black text-obsidian uppercase tracking-widest">Future</span>
           </div>
           <p className="text-[10px] md:text-xs font-black text-obsidian uppercase tracking-widest">© 2024 Youniqle.</p>
        </div>
      </footer>
    </div>
  );
}
