'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function PrivateReportRequestPage() {
  const { data: session } = useSession();
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgreed) return;
    
    // Simulate submission
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <ChapterWrapper chapter="private-report" className="container mx-auto px-4 py-20 min-h-screen flex items-center justify-center">
        <Card className="max-w-2xl w-full bg-white rounded-[60px] p-12 text-center space-y-8 border-line shadow-2xl">
          <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-obsidian tracking-tighter">정리 신청이 완료되었습니다</h1>
            <p className="text-slate/60 font-bold leading-relaxed break-keep">
              네비게이터가 당신의 지난 7일 기록을 조용히 검토합니다.<br />
              리포트는 2~3일 내에 '보관함'으로 발송됩니다.
            </p>
          </div>
          <Button asChild className="h-16 rounded-[24px] bg-obsidian text-white font-black px-12">
            <Link href="/archive">보관함으로 이동</Link>
          </Button>
        </Card>
      </ChapterWrapper>
    );
  }

  return (
    <ChapterWrapper chapter="private-report" className="container mx-auto px-4 py-20 pb-40 min-h-screen">
      {/* Header */}
      <div className="mb-24 text-center space-y-8 max-w-3xl mx-auto">
        <div className="inline-flex items-center px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black tracking-widest uppercase border border-primary/20 shadow-sm">
          <ShieldCheck className="w-4 h-4 mr-2" />
          Private & Secure
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-obsidian tracking-tighter">조용한 정리 신청</h1>
        <p className="text-lg text-slate/60 leading-relaxed font-bold break-keep">
          숫자와 그래프만으로는 알 수 없는 당신만의 회복 기준.<br />
          네비게이터가 비공개로 분석하여 맞춤 리포트를 설계해 드립니다.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Left: Info */}
        <div className="space-y-12">
          <section className="space-y-6">
            <h2 className="text-xl font-black text-obsidian tracking-tight">리포트 포함 내용</h2>
            <div className="space-y-4">
              {[
                { title: '상태 요약', desc: '데이터에 나타난 현재의 핵심 흔들림 진단' },
                { title: '루틴 설계', desc: '당신의 생활 패턴에 최적화된 3가지 마이크로 루틴' },
                { title: '선택 기준 정리', desc: '불필요한 정보를 걷어내고 지금 필요한 선택지만 제안' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-6 bg-white rounded-3xl border border-line/50">
                  <div className="w-10 h-10 bg-mist rounded-2xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-obsidian">{item.title}</h4>
                    <p className="text-xs text-slate/60 font-bold leading-tight">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="p-8 bg-mist/30 rounded-[40px] border border-line/30 space-y-4">
            <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
              <Lock className="w-3 h-3" />
              Privacy Protocol
            </div>
            <p className="text-xs text-slate/60 font-bold leading-relaxed break-keep">
              본 리포트는 유니클 라이프 패스 Restart 등급 이상의 회원에게 제공되는 프리미엄 서비스입니다. 
              기록된 데이터는 리포트 작성이 완료된 후 즉시 비공개 모드로 전환됩니다.
            </p>
          </section>
        </div>

        {/* Right: Form */}
        <Card className="bg-white rounded-[48px] p-10 border-line shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16" />
          
          <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-black text-obsidian">어떤 부분을 집중적으로 정리해드릴까요?</label>
                <textarea 
                  className="w-full min-h-[120px] bg-mist/50 border-line rounded-2xl p-4 text-sm font-medium focus:ring-primary focus:border-primary transition-all"
                  placeholder="예: 요즘 수면 리듬이 깨져서 감정 기복이 심합니다. 저녁 이후의 시간을 어떻게 보낼지 정리하고 싶어요."
                  required
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-line/50">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    id="consent" 
                    checked={isAgreed} 
                    onCheckedChange={(checked) => setIsAgreed(checked === true)}
                    className="mt-1 border-primary data-[state=checked]:bg-primary"
                  />
                  <div className="space-y-1">
                    <label htmlFor="consent" className="text-xs font-black text-obsidian cursor-pointer">
                      전문기관 전달 및 리포트 작성 동의 (필수)
                    </label>
                    <p className="text-[10px] text-slate/40 font-bold leading-relaxed break-keep">
                      맞춤형 리포트 설계를 위해 나의 7일 기록 요약본이 유니클 네비게이터 및 전문 파트너에게 전달되는 것에 동의합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={!isAgreed}
              className="w-full h-18 bg-obsidian text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-2 group disabled:opacity-30 transition-all"
            >
              조용한 정리 신청하기 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate/30 font-black uppercase tracking-widest">
              <AlertCircle className="w-3 h-3" />
              This is not a medical diagnosis
            </div>
          </form>
        </Card>
      </div>
    </ChapterWrapper>
  );
}
