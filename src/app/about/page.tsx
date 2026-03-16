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
  Fingerprint
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
      {/* 1. Hero Section: The Manifest */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Abstract Background Art */}
        <div className="absolute inset-0 z-0 opacity-40">
          <Image 
            src="/images/brand/youniqle_sculpture_abstract.png" // Note: Assume this is moved to public/images/brand
            alt="Youniqle Abstract Art"
            fill
            className="object-cover opacity-50 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D10] via-transparent to-[#0B0D10]" />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-12"
        >
          <motion.div variants={itemVariants} className="space-y-4">
            <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.8em] block">The Manifest</span>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter italic leading-none">
              RE <span className="text-[#D4AF37] tracking-normal">COVERY</span> <br /> FIRST.
            </h1>
          </motion.div>

          <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-xl md:text-2xl font-medium text-[#F9F7F2]/60 leading-relaxed italic">
            "회복 설계는 기적이 아닙니다. <br className="hidden md:block" /> 회복된 몸 위에 놓일 때 비로소 완성되는 도구일 뿐입니다."
          </motion.p>

          <motion.div variants={itemVariants} className="pt-10 flex flex-col items-center gap-6">
            <div className="flex bg-[#F9F7F2]/5 border border-[#F9F7F2]/10 rounded-full px-8 py-3 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Architecting Human Recovery</p>
            </div>
            <div className="animate-bounce mt-10">
              <MousePointer2 className="w-6 h-6 rotate-180 opacity-20" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. Core Philosophy: Architecture of Human Recovery */}
      <section className="py-60 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter italic leading-tight">
                우리는 몸의 <br /> 
                <span className="text-[#D4AF37]">기초를 다시 세우는</span> <br /> 
                건축가입니다.
              </h2>
              <p className="text-lg text-[#F9F7F2]/50 font-medium leading-relaxed">
                기초가 무너진 건축물에 화려한 인테리어를 덧바르는 것은 위험합니다. <br />
                유니클은 집중 케어 이전에, 당신의 몸이 스스로 회복할 수 있는 <br className="hidden md:block" />
                '리커버리 아키텍처'를 설계하는 것으로부터 시작합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                { icon: Layers, title: "Foundation First", desc: "생체 리듬의 복구" },
                { icon: ShieldCheck, title: "Safety Protocol", desc: "검증된 회복 설계" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-12 h-12 bg-[#F9F7F2]/5 border border-[#F9F7F2]/10 rounded-2xl flex items-center justify-center shrink-0 transition-colors group-hover:border-[#D4AF37]/40">
                    <item.icon className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black uppercase tracking-widest text-[#F9F7F2]">{item.title}</h4>
                    <p className="text-xs text-[#F9F7F2]/40 font-bold">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="relative aspect-square rounded-[80px] overflow-hidden shadow-[0_40px_100px_rgba(212,175,55,0.1)]"
          >
            <Image 
              src="/images/brand/youniqle_sculpture_abstract.png" 
              alt="Brand Image"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0B0D10]/40 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* 3. Methodology: Data x Human Touch */}
      <section className="bg-white text-[#0B0D10] py-60">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-32">
          <div className="max-w-3xl mx-auto space-y-6">
            <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.5em] block">The System</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight italic">
              데이터가 분석하고, <br /> 마스터가 완성합니다.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                icon: Cpu, 
                title: "AI Precision", 
                desc: "유니클만의 실시간 생체 데이터 정밀 분석 시스템을 통해 몸의 불균형을 즉각 파악합니다." 
              },
              { 
                icon: Fingerprint, 
                title: "Human Curation", 
                desc: "김미정 원장을 포함한 최고 권위 마스터들이 데이터 너머의 개별적 삶의 궤적을 큐레이션합니다." 
              },
              { 
                icon: Heart, 
                title: "Infinite Care", 
                desc: "단발성 처방이 아닌, 당신이 최상의 컨디션으로 홀로서기 할 때까지의 매일의 루틴을 설계합니다." 
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
                className="space-y-8 p-12 bg-[#F9F7F2] rounded-[60px] border border-[#0B0D10]/5 hover:shadow-2xl transition-all"
              >
                <div className="w-16 h-16 bg-[#0B0D10] rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-[#0B0D10]/10">
                  <feature.icon className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black tracking-tight italic">{feature.title}</h3>
                  <p className="text-sm font-medium text-[#0B0D10]/50 leading-relaxed word-keep-all">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Vision: Beyond Burnout */}
      <section className="py-60 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-[#D4AF37]/5 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center space-y-20 relative z-10">
          <div className="space-y-8">
            <Lock className="w-12 h-12 text-[#D4AF37] mx-auto opacity-30" />
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight italic">
              Youniqle은 <br />
              누구에게나 열려있지 않습니다.
            </h2>
            <p className="text-lg md:text-2xl font-medium text-[#F9F7F2]/40 leading-relaxed">
              자신의 몸을 돌보는 일이 가장 가치 있는 투자임을 아는 소수에게만 <br className="hidden md:block" />
              유니클의 프리미엄 멤버십과 회복 라운지가 제공됩니다.
            </p>
          </div>

          <div className="pt-20">
            <Button className="h-24 px-16 bg-[#F9F7F2] text-[#0B0D10] rounded-full font-black text-xl uppercase tracking-widest shadow-[0_40px_80px_rgba(249,247,242,0.1)] hover:scale-105 transition-all group gap-6">
              <span className="text-[#D4AF37] text-xs font-black">Invitation Only</span>
              여정 시작하기
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
