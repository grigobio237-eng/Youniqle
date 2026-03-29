import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, BarChart, Zap, ShieldCheck, ChevronRight, MessageSquare } from 'lucide-react';
import ChapterWrapper from '@/components/layout/ChapterWrapper';

export default function PartnerPage() {
  return (
    <ChapterWrapper chapter="partner" className="bg-white min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden border-b border-line">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-mist/30 -skew-x-12 transform origin-top-right" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-obsidian text-mist rounded-full text-[10px] font-black uppercase tracking-widest">
              Partner Partnership
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-obsidian leading-[1.1] tracking-tighter">
              Youniqle은 <br />
              <span className="text-chapter-accent">더 맞는 고객</span>을 연결합니다.
            </h1>
            <p className="text-xl text-slate/70 leading-relaxed font-medium">
              불특정 다수가 아닌, 당신의 전문 솔루션이 가장 필요한 <br className="hidden md:block" />
              '준비된 고객'을 유니클의 정밀 진단 데이터로 연결해 드립니다.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild size="lg" className="h-16 px-10 rounded-[20px] bg-obsidian text-mist font-black shadow-xl hover:-translate-y-1 transition-transform">
                <Link href="/partner/apply">파트너 제휴 문의</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-[20px] border-line font-black hover:bg-mist">
                <Link href="/partner/login">파트너 로그인</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Values */}
      <section className="py-32 bg-mist/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-chapter-accent shadow-sm border border-line">
                <BarChart className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-obsidian">사전 진단 가치</h3>
              <p className="text-slate/60 leading-relaxed text-sm">
                고객이 센터에 방문하기 전, 60초 진단을 통해 이미 본인의 상태를 인지하고 있습니다. 상담 시간을 70% 이상 단축시키고 상담의 질을 높입니다.
              </p>
            </div>
            <div className="space-y-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-status-normal shadow-sm border border-line">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-obsidian">정밀 매칭 시스템</h3>
              <p className="text-slate/60 leading-relaxed text-sm">
                리듬/집중/프리미엄 3가지 회복 경로에 근거하여, 파트너사가 보유한 특화 프로그램에 가장 적합한 타겟 고객만을 매칭해 드립니다.
              </p>
            </div>
            <div className="space-y-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-reward-gold shadow-sm border border-line">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-obsidian">브랜드 신뢰도</h3>
              <p className="text-slate/60 leading-relaxed text-sm">
                유니클의 프리미엄 브랜드 아이덴티티와 데이터 리포트는 파트너사의 솔루션에 객관적인 근거와 높은 신뢰성을 더해줍니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Partner Features */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-10">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-black text-obsidian tracking-tight">파트너 전용 <br />데이터 대시보드 제공</h2>
                <p className="text-lg text-slate/60">연결된 고객의 진단 이력, 회복 변화 추이, 서비스 만족도를 한눈에 분석하고 관리할 수 있는 도구를 제공합니다.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  "실시간 고객 매칭 알림",
                  "데이터 기반 리포트 생성",
                  "1:1 소통 채널 운영",
                  "정산 및 예약 통합 관리"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 font-bold text-obsidian/80">
                    <div className="w-2 h-2 bg-chapter-accent rounded-full" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full relative rounded-[60px] border border-line overflow-hidden shadow-2xl">
               <div className="absolute inset-0 bg-gradient-to-br from-chapter-accent/5 to-transparent z-10 pointer-events-none rounded-[60px]" />
               <Image
                 src="/images/partner-dashboard-preview.png"
                 alt="파트너 전용 데이터 대시보드 미리보기"
                 width={800}
                 height={600}
                 className="w-full h-auto object-cover rounded-[60px]"
                 priority
               />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Contact CTA */}
      <section className="py-32 border-t border-line">
        <div className="container mx-auto px-6 text-center space-y-10">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-obsidian tracking-tighter">함께 성장할 파트너를 기다립니다.</h2>
            <p className="text-xl text-slate/60">당신의 전문성이 더 빛날 수 있도록, 유니클이 가장 좋은 무대와 관객을 설계하겠습니다.</p>
          </div>
          <div className="flex justify-center gap-6">
            <Button size="lg" className="h-20 px-12 rounded-[24px] bg-chapter-accent font-black text-xl hover:scale-105 transition-all gap-4">
              <MessageSquare className="w-6 h-6" />
              지금 제휴 문의하기
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
          <p className="text-slate/40 font-medium">현재 120+ 전문가 및 40+ 센터가 유니클과 함께하고 있습니다.</p>
        </div>
      </section>
    </ChapterWrapper>
  );
}
