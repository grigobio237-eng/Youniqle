'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Zap, 
  Shield, 
  Sparkles, 
  CreditCard,
  MessageCircle,
  Archive,
  BarChart3,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import { PASS_SPECS } from '@/lib/constants/passes';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PassDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const pass = PASS_SPECS[id];

  if (!pass) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black mb-4">존재하지 않는 패스입니다.</h1>
        <Link href="/membership" className="text-primary font-bold underline">멤버십 목록으로 돌아가기</Link>
      </div>
    );
  }

  const isBlack = id === 'black';

  return (
    <ChapterWrapper chapter="membership" className="min-h-screen bg-mist pb-40">
      {/* Navigation & Header */}
      <div className="container mx-auto px-4 pt-8 md:pt-12">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate/60 hover:text-obsidian transition-colors font-bold text-sm mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          뒤로 가기
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-6 mb-20">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
              {pass.name}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black text-obsidian tracking-tighter leading-tight break-keep">
              {pass.title}
            </h1>
            <p className="text-xl md:text-2xl text-slate/70 font-bold italic">
              {pass.subtitle}
            </p>
          </div>

          {/* Intro Card */}
          <div className="bg-white rounded-[48px] p-8 md:p-16 shadow-2xl border border-line/50 mb-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative z-10 space-y-12">
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-obsidian tracking-tight">서비스 소개</h2>
                <p className="text-lg text-slate/70 font-medium leading-relaxed break-keep">
                  {pass.intro}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate/40 uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" /> 이런 분들께 추천합니다
                  </h3>
                  <ul className="space-y-4">
                    {pass.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-mist flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm font-bold text-obsidian/80 leading-snug">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-mist/30 p-8 rounded-[32px] border border-line flex flex-col justify-center items-center text-center">
                  <p className="text-xs font-black text-slate/40 uppercase tracking-[0.2em] mb-2">Membership Price</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-obsidian">{pass.price === '별도 문의' ? pass.price : `${pass.price}원`}</span>
                    {pass.period !== '개별' && <span className="text-slate/60 font-bold">/{pass.period}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Deep Dive */}
          <div className="space-y-24 mb-32">
            <div className="text-center">
              <h2 className="text-3xl font-black text-obsidian mb-4">핵심 서비스 상세 안내</h2>
              <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 gap-8">
              {pass.keyBenefits.map((benefit: any, i: number) => (
                <div key={i} className="group bg-white p-8 md:p-12 rounded-[40px] border border-line/50 flex flex-col md:flex-row items-center gap-10 hover:border-primary/30 transition-all shadow-lg hover:shadow-2xl">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-mist rounded-[32px] flex items-center justify-center text-4xl shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner">
                    {benefit.id === 1 ? <Archive className="w-10 h-10 text-primary" /> : 
                     benefit.id === 2 ? <BarChart3 className="w-10 h-10 text-primary" /> : 
                     <Zap className="w-10 h-10 text-primary" />}
                  </div>
                  <div className="space-y-3 flex-1 text-center md:text-left">
                    <h4 className="text-2xl font-black text-obsidian tracking-tight">{benefit.title}</h4>
                    <p className="text-slate/60 font-bold leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Banner */}
          <div className="bg-obsidian rounded-[48px] p-10 md:p-16 text-center space-y-8 mb-20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(191,244,66,0.1),transparent_50%)]" />
            <Shield className="w-16 h-16 mx-auto text-primary animate-pulse" />
            <div className="space-y-4 relative z-10">
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">안전하고 프라이빗한 데이터 주권</h3>
              <p className="text-white/50 font-bold leading-relaxed max-w-2xl mx-auto">
                사용자의 명시적 동의 없이는 어떠한 데이터도 외부로 공유되지 않습니다.<br />
                모든 분석과 저장은 당신의 회복만을 목적으로 진행됩니다.
              </p>
            </div>
          </div>

          {/* Fixed Bottom CTA */}
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-line z-50">
            <div className="container mx-auto max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="hidden md:block">
                <p className="text-[10px] font-black text-slate/40 uppercase tracking-widest">Selected Level</p>
                <p className="text-lg font-black text-obsidian">{pass.name} <span className="text-sm text-slate/60 font-bold ml-2">{pass.price === '별도 문의' ? pass.price : `${pass.price}원`}</span></p>
              </div>
              <button 
                onClick={() => isBlack ? window.open('https://pf.kakao.com/_...', '_blank') : router.push(`/membership/${id}/checkout`)}
                className="w-full md:w-auto px-12 py-5 bg-obsidian text-white rounded-2xl font-black text-lg hover:bg-primary hover:text-obsidian transition-all shadow-xl flex items-center justify-center gap-3 group"
              >
                {isBlack ? (
                  <>상담 신청하기 <MessageCircle className="w-5 h-5" /></>
                ) : (
                  <>이 플랜으로 시작하기 <CreditCard className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ChapterWrapper>
  );
}
