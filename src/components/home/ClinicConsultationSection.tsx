'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * ClinicConsultationSection
 * 클리닉 시술 전 정밀 회복 설계를 독려하는 프리미엄 전용 섹션입니다.
 */
export default function ClinicConsultationSection() {
  return (
    <section className="container mx-auto px-6 py-20">
      <div className="relative group overflow-hidden rounded-[64px] border border-white/10 shadow-2xl">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 bg-obsidian" />
        <div className="absolute inset-0 bg-gradient-to-br from-chapter-accent/20 via-transparent to-reward-gold/10 opacity-30 group-hover:opacity-50 transition-opacity duration-1000" />
        
        {/* Interactive Light Spot (Desktop) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-chapter-accent/20 rounded-full blur-[120px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />

        <div className="relative z-10 p-12 md:p-24 flex flex-col items-center text-center space-y-10">
          {/* Header Badge */}
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <Heart className="w-4 h-4 text-chapter-accent fill-chapter-accent" />
            <span className="text-[10px] font-black uppercase text-mist tracking-widest">Clinic Professional Care</span>
          </div>

          {/* Main Title & Description */}
          <div className="space-y-6 max-w-3xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-7xl font-black text-white leading-[1.1] tracking-tight italic"
            >
              The Final Design for <br />
              <span className="text-chapter-accent">Perfect Recovery</span>
            </motion.h2>
            <p className="text-mist/70 text-lg md:text-2xl font-medium break-keep">
              시술은 결과만 보는 것이 아니라 과정을 설계하는 것입니다.<br />
              유니클 클리닉 전용 문진으로 당신만의 완벽한 회복 여정을 시작하세요.
            </p>
          </div>

          {/* Features Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl pt-8">
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/5 space-y-4 hover:border-chapter-accent transition-colors">
              <ShieldCheck className="w-8 h-8 text-chapter-accent" />
              <h4 className="text-lg font-black text-white">정밀한 문진</h4>
              <p className="text-mist/50 text-xs leading-relaxed">개인의 체성분과 생활 습관을 고려한 <br/>과학적인 설계</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/5 space-y-4 hover:border-chapter-accent transition-colors">
              <Activity className="w-8 h-8 text-chapter-accent" />
              <h4 className="text-lg font-black text-white">데이터 기반 가이드</h4>
              <p className="text-mist/50 text-xs leading-relaxed">수만 개의 데이터를 매칭하여 <br/>도출되는 최적의 회복 가이드</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/5 space-y-4 hover:border-chapter-accent transition-colors">
              <Sparkles className="w-8 h-8 text-chapter-accent" />
              <h4 className="text-lg font-black text-white">결과의 완성</h4>
              <p className="text-mist/50 text-xs leading-relaxed">시술의 효과를 극대화하는 <br/>프리미엄 사후 관리 전용 서비스</p>
            </div>
          </div>

          {/* Luxury CTA Button */}
          <div className="pt-8 w-full md:w-auto">
            <Link href="/event/consultation">
              <Button 
                size="lg" 
                className="group relative h-20 md:h-24 px-12 md:px-20 bg-mist text-obsidian rounded-[32px] md:rounded-[40px] shadow-2xl hover:bg-white hover:scale-[1.02] transition-all overflow-hidden"
              >
                {/* Shine Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-obsidian/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                <span className="relative z-10 flex items-center gap-4 text-xl md:text-3xl font-black italic">
                  클리닉 회복 설계 시작 <ArrowRight className="w-6 h-6 md:w-10 md:h-10 transition-transform group-hover:translate-x-2" />
                </span>
              </Button>
            </Link>
            <p className="mt-6 text-[11px] font-black uppercase tracking-[0.2em] text-mist/30">
              Personalized Clinic-Only Experience
            </p>
          </div>
        </div>

        {/* Decorative Particles (Static in JSX, CSS for anim) */}
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-chapter-accent/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-20 left-10 w-16 h-16 bg-reward-gold/10 rounded-full blur-xl animate-[bounce_4s_infinite]" />
      </div>
    </section>
  );
}
