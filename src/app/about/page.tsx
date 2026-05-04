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
  ArrowRight,
  Compass,
  Shield
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  const router = useRouter();
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
              <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.5em]">The Lifecare OS</span>
            </span>
            <h1 className="text-4xl xs:text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter italic leading-[0.9] text-white drop-shadow-2xl">
              RECORD IS <br />
              <span className="text-chapter-accent italic">LIFECARE.</span>
            </h1>
          </motion.div>

          <motion.p variants={itemVariants} className="max-w-3xl mx-auto text-lg md:text-2xl font-black text-white leading-relaxed word-keep-all drop-shadow-lg">
            "기록이 일상이 될 때, 진정한 라이프케어가 시작됩니다." <br className="hidden md:block" />
            <span className="bg-chapter-accent px-2 text-white italic">고객의 하루를 데이터로 자산화하여 맞춤형 솔루션을 제안합니다.</span>
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
                  나를 먼저<br />
                  <span className="text-chapter-accent">이해하는 습관.</span>
                </h2>
                <p className="text-xl md:text-2xl text-slate/70 leading-relaxed font-medium word-keep-all">
                  유니클(Youniqle)은 고객의 하루를 데이터로 자산화하여<br />
                  맞춤형 솔루션을 제안하는 <span className="text-obsidian font-black">통합 회복관리 플랫폼</span>입니다. 유니클이 제안하는 새로운 회복의 기준을 만나보세요.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-10 rounded-[40px] bg-mist border border-line group hover:border-chapter-accent hover:shadow-xl transition-all duration-500">
                  <Fingerprint className="w-10 h-10 text-chapter-accent mb-6 group-hover:scale-110 transition-transform" />
                  <h4 className="text-2xl font-black mb-3 text-obsidian tracking-tight">Life Recording</h4>
                  <p className="text-sm text-slate/60 leading-relaxed font-bold">사진 한 장으로 시작되는 <br /> 정직한 나의 상태 기록</p>
                </div>
                <div className="p-10 rounded-[40px] bg-mist border border-line group hover:border-reward-gold hover:shadow-xl transition-all duration-500">
                  <Activity className="w-10 h-10 text-reward-gold mb-6 group-hover:scale-110 transition-transform" />
                  <h4 className="text-2xl font-black mb-3 text-obsidian tracking-tight">Condition Insight</h4>
                  <p className="text-sm text-slate/60 leading-relaxed font-bold">식사, 수면, 스트레스 등 <br /> 6가지 핵심 지표 관리</p>
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
              <div className="relative z-10 w-full h-full flex items-center justify-center p-12">
                 <div className="relative w-full h-full rounded-[60px] overflow-hidden border-8 border-white shadow-2xl rotate-3">
                   <Image src="/images/about/identity-record.png" alt="Recording Identity" fill className="object-cover" />
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. The Three Paths: Defined Cards (Light Theme) */}
      <section className="py-32 md:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-32 md:space-y-56">
          
          {/* Step 1. 기록 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-5 space-y-12"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-chapter-accent/10 border border-chapter-accent/20 rounded-full">
                  <Fingerprint className="w-4 h-4 text-chapter-accent" />
                  <span className="text-[10px] font-black text-chapter-accent uppercase tracking-widest leading-none">Step 01</span>
                </div>
                <h3 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter italic text-obsidian uppercase">Record</h3>
                <p className="text-2xl md:text-4xl font-black tracking-tight leading-tight text-obsidian italic">
                  기록: <br /> 일상을 남기는 가장 쉬운 방법
                </p>
                <p className="text-lg text-slate/70 leading-relaxed font-medium">
                  오늘 한 장의 사진과 간단한 문답으로 당신의 일상을 남깁니다. 아주 작은 기록들이 모여 당신만의 건강한 자산이 됩니다.
                </p>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-7 relative aspect-[4/3] rounded-[60px] md:rounded-[100px] overflow-hidden border-8 border-white shadow-2xl group"
            >
              <Image src="/images/about/identity-record.png" alt="Record Step" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/40 to-transparent" />
              <div className="absolute bottom-10 left-10 p-8 bg-white/80 backdrop-blur-xl border border-line rounded-[40px] max-w-xs shadow-xl">
                <p className="text-sm font-black text-obsidian italic leading-relaxed">"가장 직관적인 방법으로 기록되는 당신의 소중한 오늘"</p>
              </div>
            </motion.div>
          </div>

          {/* Step 2. 분석 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-7 relative aspect-[4/3] rounded-[60px] md:rounded-[100px] overflow-hidden border-8 border-white shadow-2xl group order-2 lg:order-1"
            >
              <Image src="/images/about/identity-report.png" alt="Analysis Step" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-reward-gold/20 via-transparent to-transparent" />
              <div className="absolute bottom-10 right-10 p-8 bg-white/80 backdrop-blur-xl border border-line rounded-[40px] max-w-xs text-right shadow-xl">
                <p className="text-sm font-black text-obsidian italic leading-relaxed">"흩어진 기록을 모아 발행하는 당신만의 회복 리포트"</p>
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
                  <Activity className="w-4 h-4 text-reward-gold" />
                  <span className="text-[10px] font-black text-reward-gold uppercase tracking-widest leading-none">Step 02</span>
                </div>
                <h3 className="text-5xl md:text-8xl font-black tracking-tighter italic text-obsidian uppercase">Analysis</h3>
                <p className="text-2xl md:text-4xl font-black tracking-tight leading-tight text-obsidian italic">
                  분석: <br /> 생활 흐름을 꿰뚫는 통찰
                </p>
                <p className="text-lg text-slate/70 leading-relaxed font-medium">
                  수면, 식사, 활동량, 피부 컨디션을 통합하여 지능형 '회복 리포트'를 발행합니다. 보이지 않던 피로의 원인을 데이터로 마주하세요.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Step 3. 처방 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-5 space-y-12"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-chapter-accent/10 border border-chapter-accent/20 rounded-full">
                  <Zap className="w-4 h-4 text-chapter-accent" />
                  <span className="text-[10px] font-black text-chapter-accent uppercase tracking-widest leading-none">Step 03</span>
                </div>
                <h3 className="text-5xl md:text-8xl font-black tracking-tighter italic text-obsidian uppercase">Routine</h3>
                <p className="text-2xl md:text-4xl font-black tracking-tight leading-tight text-obsidian italic">
                  약속: <br /> 당신을 위한 최적의 루틴
                </p>
                <p className="text-lg text-slate/70 leading-relaxed font-medium">
                  분석 결과를 바탕으로 7일간의 최적 루틴을 제안받습니다. 대중형 패스 시스템은 당신이 지치지 않고 실천을 이어갈 수 있도록 돕습니다.
                </p>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-7 relative aspect-[4/3] rounded-[60px] md:rounded-[100px] overflow-hidden border-8 border-white shadow-2xl group"
            >
              <Image src="/images/about/identity-routine.png" alt="Prescription Step" fill className="object-cover group-hover:scale-110 transition-transform duration-[2000ms]" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/40 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 p-8 bg-white/80 backdrop-blur-xl border border-line rounded-[40px] max-w-xs shadow-xl">
                <p className="text-sm font-black text-obsidian italic leading-relaxed">"오늘의 실천이 만드는 가장 확실한 내일의 회복"</p>
              </div>
            </motion.div>
          </div>

          {/* Step 4. 케어 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-7 relative aspect-[4/3] rounded-[60px] md:rounded-[100px] overflow-hidden border-8 border-white shadow-2xl group order-2 lg:order-1"
            >
              <Image src="/images/about/identity-plan.png" alt="Care Step" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-chapter-accent/20 via-transparent to-transparent" />
              <div className="absolute bottom-10 right-10 p-8 bg-white/80 backdrop-blur-xl border border-line rounded-[40px] max-w-xs text-right shadow-xl">
                <p className="text-sm font-black text-obsidian italic leading-relaxed">"더 깊은 회복이 필요한 당신을 위한 1:1 전담 케어"</p>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-5 space-y-12 order-1 lg:order-2"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-chapter-accent/10 border border-chapter-accent/20 rounded-full">
                  <ShieldCheck className="w-4 h-4 text-chapter-accent" />
                  <span className="text-[10px] font-black text-chapter-accent uppercase tracking-widest leading-none">Step 04</span>
                </div>
                <h3 className="text-5xl md:text-8xl font-black tracking-tighter italic text-obsidian uppercase">Care</h3>
                <p className="text-2xl md:text-4xl font-black tracking-tight leading-tight text-obsidian italic">
                  케어: <br /> 당신만을 위한 프라이빗 연결
                </p>
                <p className="text-lg text-slate/70 leading-relaxed font-medium">
                  더 깊은 관리가 필요한 순간, 당신만을 위한 프라이빗 상담이 연결됩니다. 유니클의 전문가들이 당신의 완전한 회복을 끝까지 책임집니다.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Utility Hub & Path Preview (Moved from Hero) */}
      <section className="py-24 md:py-32 bg-mist border-t border-line/50">
        <div className="container mx-auto px-6 space-y-32">
          {/* 1. Utility Hub */}
          <div className="space-y-16">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-chapter-accent/10 text-chapter-accent text-[10px] font-black uppercase tracking-widest mb-2">
                Recovery Tools
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-obsidian tracking-tight">다른 유용한 도구도 확인해 보세요</h2>
              <p className="text-slate/60 text-base md:text-lg leading-relaxed">환경부터 사운드까지, 당신의 모든 감각을 분석하는 유니클의 정밀 도구들입니다.</p>
            </div>

            <div className="flex justify-center mt-10">
              <Button 
                onClick={() => router.push('/utils')}
                className="group bg-white p-8 md:p-12 rounded-[40px] border border-line shadow-sm hover:shadow-2xl hover:border-chapter-accent transition-all duration-500 flex flex-col items-center justify-center space-y-6 w-full max-w-2xl h-auto"
              >
                <div className="w-24 h-24 bg-chapter-accent/10 rounded-full flex items-center justify-center mb-2">
                  <Compass className="w-12 h-12 text-chapter-accent" />
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-2xl md:text-3xl font-black text-obsidian tracking-tight group-hover:text-chapter-accent transition-colors">유니클 툴킷 바로가기</h3>
                  <p className="text-slate/60 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                    당신의 건강과 생산성을 높여줄 10가지 이상의 정밀 도구를 한 곳에서 만나보세요.
                  </p>
                </div>
                <div className="pt-6 flex items-center text-chapter-accent font-black text-sm uppercase tracking-widest gap-2 group-hover:translate-x-2 transition-transform">
                  전체 도구 보기 <ArrowRight className="w-5 h-5" />
                </div>
              </Button>
            </div>
          </div>

          {/* 2. Path Preview */}
          <div className="space-y-16">
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
              <h2 className="text-4xl xs:text-5xl sm:text-7xl md:text-[140px] font-black tracking-tight leading-[0.8] italic block text-obsidian uppercase">
                Life Starts <br />
                <span className="text-chapter-accent">With Record.</span>
              </h2>
              <p className="text-2xl md:text-5xl text-slate/40 font-black tracking-tight italic">나를 먼저 이해하는 습관. 유니클이 제안하는 새로운 회복의 기준입니다.</p>
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
                Start Rhythm Check
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-chapter-accent flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-6 h-6 md:w-10 md:h-10 text-white" />
                </div>
              </Button>
              <p className="text-[10px] md:text-sm font-black text-slate/30 uppercase tracking-[1em]">Integrated Youniqle Rhythm Check © Youniqle</p>
            </motion.div>
        </div>
      </section>

      {/* 5. Clean Light Footer */}
      <footer className="py-24 text-center border-t border-line relative bg-mist">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12 opacity-50">
           <p className="text-[10px] md:text-xs font-black text-obsidian uppercase tracking-widest leading-none">Designed for Better Life Transformation</p>
           <div className="flex items-center gap-16">
              <span className="text-[10px] md:text-xs font-black text-obsidian uppercase tracking-widest">Natural</span>
              <span className="text-[10px] md:text-xs font-black text-obsidian uppercase tracking-widest">Human</span>
              <span className="text-[10px] md:text-xs font-black text-obsidian uppercase tracking-widest">Balance</span>
           </div>
           <p className="text-[10px] md:text-xs font-black text-obsidian uppercase tracking-widest">© 2024 Youniqle.</p>
        </div>
      </footer>
    </div>
  );
}
