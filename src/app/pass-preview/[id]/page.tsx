'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Sparkles, 
  Target, 
  Calculator,
  ShieldCheck,
  ChevronRight,
  UserPlus,
  ArrowRight,
  Zap,
  Clock,
  Calendar,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PASS_SPECS } from '@/lib/constants/passes';

function CustomerPassPreviewContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const id = params.id as string;
  const spec = PASS_SPECS[id];
  const ref = searchParams.get('ref');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/auth/signup?callbackUrl=${callbackUrl}&ref=${ref || ''}`);
    } else if (status === 'authenticated' && spec) {
      // Track view interest
      fetch('/api/navigator/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passId: id,
          navigatorId: ref
        })
      }).catch(err => console.error('Tracking failed:', err));
    }
  }, [status, id, ref, router, spec]);

  const handleApply = async () => {
    if (status !== 'authenticated') return;
    
    setIsSubmitting(true);
    try {
      // 1. Update interest status to 'consulting'
      await fetch('/api/navigator/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passId: id,
          navigatorId: ref,
          status: 'consulting'
        })
      });

      // 2. Redirect to consultation form
      router.push('/event/consultation');
    } catch (err) {
      console.error('Application failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || !spec) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mist">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-20 pt-16 bg-gradient-to-b ${spec.theme}`}>
      <div className="container mx-auto px-4 max-w-4xl space-y-12">
        {/* Welcome Banner */}
        <section className="text-center space-y-6 pt-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Badge variant="outline" className={`px-5 py-1.5 rounded-full border-primary/20 ${spec.accent} font-black tracking-widest uppercase`}>
              Exclusive Invitation
            </Badge>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-obsidian leading-tight break-keep">
            {spec.title}
          </h1>
          
          <p className="text-xl font-bold italic text-slate/80">
            {spec.subtitle}
          </p>

          <p className="text-lg font-medium text-slate/70 max-w-2xl mx-auto break-keep">
            {spec.intro}
          </p>
        </section>

        {/* Requirements / Recommend */}
        <div className="bg-white/50 backdrop-blur-md border border-line rounded-[40px] p-8 md:p-12 space-y-8">
          <h3 className="text-2xl font-black text-center flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-chapter-accent" /> 이런 분들께 추천합니다
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {spec.recommendations.map((text: string, i: number) => (
              <div key={i} className="space-y-3">
                <div className="w-8 h-8 rounded-full bg-chapter-accent text-white flex items-center justify-center text-xs font-black">
                  0{i + 1}
                </div>
                <p className="font-bold text-slate/80 leading-relaxed break-keep">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-black text-obsidian">{spec.name} 핵심 혜택</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {spec.keyBenefits.map((benefit: any) => (
              <Card key={benefit.id} className="rounded-[32px] border-line shadow-xl overflow-hidden bg-white group hover:shadow-2xl transition-all">
                <CardContent className="p-8 flex flex-col md:flex-row md:items-center gap-8">
                  <div className="w-16 h-16 bg-chapter-accent/10 rounded-2xl flex items-center justify-center text-chapter-accent flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Check className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-obsidian">{benefit.title}</h3>
                    <p className="text-slate/90 font-bold break-keep leading-relaxed">
                      {benefit.desc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats / Position Card */}
        <Card className="rounded-[40px] bg-obsidian text-mist overflow-hidden border-none shadow-2xl">
          <CardContent className="p-10 md:p-16 text-center space-y-8 relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-chapter-accent rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 space-y-6">
              <Badge variant="outline" className="border-mist/20 text-mist/60 px-4 py-1 rounded-full uppercase text-[10px] font-black tracking-widest">
                Membership Spec
              </Badge>
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-[10px] font-black tracking-widest text-mist/40 uppercase">Membership Price</span>
                  <div className="flex items-baseline justify-center gap-3">
                    <span className={`text-5xl md:text-7xl font-black ${spec.id === 'black' ? 'text-chapter-accent' : 'text-white'} drop-shadow-sm`}>
                      ₩{spec.price}
                    </span>
                    <span className="text-2xl font-bold opacity-40">/ {spec.period}</span>
                  </div>
                </div>
                <p className="text-xl font-bold text-mist/90">{spec.position}</p>
              </div>
              
              <div className="pt-8">
                <Button 
                  size="lg" 
                  onClick={handleApply}
                  disabled={isSubmitting}
                  className={`w-full md:w-auto px-12 h-16 rounded-2xl ${spec.buttonColor || 'bg-chapter-accent'} text-white font-black text-xl shadow-xl transition-transform hover:scale-105 disabled:opacity-50`}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  ) : (
                    <>멤버십 신청 및 상담 예약하기 <ArrowRight className="ml-2 w-6 h-6" /></>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {spec.careServices?.map((service: any, i: number) => (
            <div key={i} className="flex gap-4 p-8 rounded-[32px] bg-white border border-line group hover:border-chapter-accent/30 transition-colors">
              <div className="w-12 h-12 bg-mist rounded-2xl flex items-center justify-center text-slate group-hover:text-chapter-accent transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-lg">{service.title}</h4>
                <p className="text-sm text-slate/90 font-bold break-keep">{service.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="text-center pt-12 border-t border-line space-y-4">
          <p className="text-sm font-black text-obsidian italic">"Youniqle의 약속"</p>
          <p className="text-xs font-bold text-slate/40 uppercase tracking-widest max-w-lg mx-auto leading-relaxed">
            {spec.name}는 단순한 혜택을 넘어, 당신의 건강한 회복을 돕는 든든한 파트너가 되어 드립니다. {spec.period} 동안 이어지는 프리미엄 케어를 지금 경험해 보세요.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CustomerPassPreview() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-mist">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <CustomerPassPreviewContent />
    </Suspense>
  );
}
