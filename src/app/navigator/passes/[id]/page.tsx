'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Share2, 
  Check, 
  Target, 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Clock, 
  ShieldCheck,
  Percent,
  Calculator,
  Calendar,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';

import { PASS_SPECS } from '@/lib/constants/passes';

export default function NavigatorPassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { addToast } = useToast();
  const id = params?.id as string;
  const spec = id ? PASS_SPECS[id] : null;

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // @ts-ignore
    if (status === 'authenticated' && !session?.user?.isNavigator) {
      router.push('/');
    }
  }, [status, session, router]);

  if (!isMounted || !spec) return null;

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/pass-preview/${id}?ref=${session?.user?.id || ''}`;
    navigator.clipboard.writeText(shareUrl);
    addToast({
      title: "공유 링크가 복사되었습니다",
      description: "고객에게 전달하여 회원가입 및 상세 스펙을 확인하게 하세요.",
      variant: "success"
    });
  };

  return (
    <div className={`min-h-screen pb-20 pt-32 ${id === 'black' ? 'bg-background' : 'bg-mist/30'}`}>
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.push('/navigator?tab=catalog')} className="rounded-full">
            <ChevronLeft className="mr-2 h-4 w-4" /> 목록으로
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare} className="rounded-full gap-2 font-bold border-line shadow-sm">
              <Share2 className="h-4 w-4" /> 고객에게 공유하기
            </Button>
          </div>
        </div>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-[40px] border border-line p-8 md:p-12 mb-12 shadow-2xl relative overflow-hidden ${spec.theme}`}
        >
          {id === 'black' && (
            <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-1/4 -translate-y-1/4">
              <Lock className="w-64 h-64" />
            </div>
          )}

          <div className="relative z-10 space-y-8">
            <div className="space-y-4 text-center md:text-left">
              <Badge 
                variant="outline" 
                className={`rounded-full px-4 py-1 text-[10px] font-black tracking-widest uppercase ${id === 'black' ? 'border-chapter-accent/40 !text-white bg-chapter-accent/10' : 'border-current/20 text-current opacity-70'}`}
              >
                {spec.name}
              </Badge>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight break-keep">
                {spec.title}
              </h1>
              <p className="text-xl font-bold italic opacity-80">
                {spec.subtitle}
              </p>
              <p className="text-lg font-medium opacity-70 max-w-2xl leading-relaxed break-keep">
                {spec.intro}
              </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-8 border-t border-current/10">
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-6xl font-black">₩{spec.price}</span>
                  <span className="text-xl font-bold opacity-60">/ {spec.period}</span>
                </div>
                <p className="text-sm font-bold opacity-50">{spec.position}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recommendations */}
        <div className="mb-12 space-y-6">
          <h3 className="text-2xl font-black flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-chapter-accent" /> 이런 분들께 추천합니다
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {spec.recommendations.map((text: string, i: number) => (
              <div key={i} className="bg-white p-6 rounded-[24px] border border-line shadow-sm flex items-start gap-3">
                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-chapter-accent/10 flex items-center justify-center text-chapter-accent uppercase text-[10px] font-black">
                  {i + 1}
                </div>
                <p className="text-sm font-bold text-slate/80 leading-snug break-keep">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Benefits Grid */}
        <div className="space-y-6 mb-12">
          <h3 className="text-2xl font-black flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" /> {spec.name} 3대 핵심 혜택
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {spec.keyBenefits.map((benefit: any) => (
              <Card key={benefit.id} className="bg-white border-line rounded-[32px] overflow-hidden group hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-8 flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
                    <Check className="w-7 h-7" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-black text-obsidian">{benefit.title}</h3>
                    <p className="text-slate/90 text-sm font-bold leading-relaxed break-keep">{benefit.desc}</p>
                    
                    {benefit.navigatorNote && (
                      <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                        <div className="mt-0.5 p-1 bg-amber-200 text-amber-900 rounded-lg">
                          <Percent className="w-3 h-3" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Navigator Operational Tip</p>
                          <p className="text-sm font-black text-amber-900/80 leading-snug">{benefit.navigatorNote}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Care Services */}
        {spec.careServices && (
          <div className="mb-12 space-y-6">
            <h3 className="text-2xl font-black flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-green-500" /> 지속적인 케어 서비스
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {spec.careServices.map((service: any, i: number) => (
                <div key={i} className="bg-primary/5 p-8 rounded-[32px] border border-primary/10 space-y-3">
                  <h4 className="text-lg font-black text-obsidian">{service.title}</h4>
                  <p className="text-sm text-slate/90 font-bold leading-relaxed break-keep">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roadmap Visualization */}
        <section className="bg-obsidian text-mist rounded-[48px] p-8 md:p-12 mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48" />
          
          <div className="relative z-10 space-y-12">
            <div className="text-center md:text-left">
              <Badge className="bg-white/10 text-white border-none text-[10px] font-black uppercase tracking-widest mb-4">
                Recovery Roadmap
              </Badge>
              <h2 className="text-3xl font-black">당신이 걷게 될 회복의 여정</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connector line for desktop */}
              {spec.roadmap && spec.roadmap.length > 0 && (
                <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-px bg-white/10" />
              )}
              
              {spec.roadmap?.map((step: any, idx: number) => (
                <div key={step.step} className="relative space-y-4 text-center md:text-left">
                  <div className="w-14 h-14 bg-white text-obsidian rounded-full flex items-center justify-center text-xl font-black mx-auto md:mx-0 shadow-lg relative z-10">
                    {step.step}
                  </div>
                  <h4 className="text-xl font-bold">{step.title}</h4>
                  <p className="text-sm text-mist/90 font-medium leading-relaxed break-keep">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Summary Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-[40px] p-10 text-center space-y-8">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-primary">
                <ShieldCheck className="w-10 h-10" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-obsidian">회복의 본질에 집중하세요</h2>
            <p className="text-slate/60 font-medium">
              모든 패스는 유효기간 동안 등급별 보장 혜택이 상시 유지됩니다.
              지금 바로 고객님의 맞춤형 로드맵 설계를 시작해 보세요.
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={() => router.push(`/membership/${id}/checkout`)}
            className={`${spec.buttonColor} text-white font-black px-10 h-16 rounded-2xl shadow-xl transform transition-transform hover:scale-105`}
          >
            결제하기
          </Button>
        </div>
      </div>
    </div>
  );
}
