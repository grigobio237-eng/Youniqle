'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Activity, 
  ShieldCheck, 
  History, 
  ClipboardCheck, 
  Sparkles, 
  ArrowRight, 
  QrCode, 
  Archive,
  BarChart3,
  Users,
  Lock,
  Zap,
  MessageCircle,
  Package,
  Download,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { AccessControl } from '@/lib/logic/access-control';
import ClinicConsultationSection from '@/components/home/ClinicConsultationSection';
import Image from 'next/image';

export default function BlackPassDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      const userGroup = AccessControl.getUserGroup(session?.user);
      const isNavigator = (session?.user as any)?.isNavigator;
      const isAdmin = AccessControl.isAdmin(session?.user);

      if (!isAdmin && !isNavigator && userGroup !== 'BLACK') {
        router.push('/membership');
      }
    }
  }, [status, session, router]);

  if (!isMounted || status === 'loading') return null;

  const user = session?.user;
  const passInfo = (user as any)?.passInfo;

  return (
    <ChapterWrapper chapter="membership" className="min-h-screen bg-background pb-32">
      {/* Hero Header */}
      <section className="relative pt-16 md:pt-32 pb-12 md:pb-20 overflow-hidden border-b border-line">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-chapter-accent/5 rounded-full blur-[150px] -mr-96 -mt-96 pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto space-y-8 md:space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Badge className="bg-chapter-accent text-obsidian border-none font-black text-[10px] tracking-widest px-4 py-1.5 rounded-full">
                  BLACK PASS EXCLUSIVE
                </Badge>
                {passInfo?.endDate && (
                  <span className="text-slate/40 text-xs font-bold uppercase tracking-widest">
                    Valid until: {new Date(passInfo.endDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              <div className="space-y-3">
                <h1 className="text-3xl md:text-7xl font-black text-obsidian tracking-tighter leading-tight">
                  {user?.name}님을 위한 <br/>
                  <span className="text-primary italic">Perfect Recovery</span> 허브
                </h1>
                <p className="text-lg md:text-xl text-slate/60 font-bold max-w-2xl break-keep">
                  블랙 패스 멤버십의 모든 프리미엄 서비스와 데이터를 <br className="hidden md:block" />
                  이곳에서 실시간으로 관리하고 제어할 수 있습니다.
                </p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Card className="bg-obsidian text-mist p-5 md:p-6 rounded-[32px] border-none shadow-2xl cursor-pointer hover:scale-105 transition-transform group">
                    <CardContent className="p-0 space-y-3 md:space-y-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-chapter-accent/20 rounded-2xl flex items-center justify-center text-chapter-accent group-hover:bg-chapter-accent group-hover:text-obsidian transition-colors">
                        <QrCode className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-base md:text-lg">진료 전용 QR</h3>
                        <p className="text-[10px] md:text-xs opacity-50 font-medium">의료기관 데이터 연동</p>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="bg-white rounded-[40px] p-10 max-w-sm border-none shadow-2xl flex flex-col items-center text-center space-y-8">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-obsidian tracking-tight">진료 전용 QR</DialogTitle>
                  </DialogHeader>
                  <div className="p-6 bg-mist rounded-3xl shadow-inner border border-line/50">
                    {isMounted && (
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${window.location.origin}/clinic/patient/${user?.id}`)}`}
                        alt="Treatment QR"
                        className="w-48 h-48 mix-blend-multiply"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-obsidian font-black text-lg">{user?.name} 님</p>
                    <p className="text-slate/60 font-bold text-sm leading-relaxed">
                      의료기관 담당자에게 이 코드를 제시하세요.<br/>
                      안전하게 데이터를 연동합니다.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>

              {[
                { icon: <Archive className="w-6 h-6" />, title: '나의 데이터 자산', desc: '영구 보관함 바로가기', href: '/archive' },
                { icon: <BarChart3 className="w-6 h-6" />, title: '회복 흐름 리포트', desc: '주간 정밀 분석 확인', href: '/ai-navigator/report' },
              ].map((item, i) => (
                <Card 
                  key={i} 
                  className="bg-white p-5 md:p-6 rounded-[32px] border-line/80 shadow-xl shadow-obsidian/5 cursor-pointer hover:border-primary/50 transition-all group"
                  onClick={() => item.href.startsWith('http') ? window.open(item.href, '_blank') : router.push(item.href)}
                >
                  <CardContent className="p-0 space-y-3 md:space-y-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      {React.cloneElement(item.icon as React.ReactElement, { className: 'w-5 h-5 md:w-6 md:h-6' })}
                    </div>
                    <div>
                      <h3 className="font-black text-base md:text-lg text-obsidian">{item.title}</h3>
                      <p className="text-[10px] md:text-xs text-slate/50 font-medium">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Clinic Care Section (The Core Logic) */}
      <div className="-mt-6 md:-mt-10 relative z-20">
        <div className="max-w-5xl mx-auto">
          <ClinicConsultationSection />
        </div>
      </div>

      {/* Secondary Management Features */}
      <section className="container mx-auto px-6 py-12 md:py-20">
        <div className="max-w-5xl mx-auto space-y-20">
          {/* Data Asset Status */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                <Package className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">멤버십 전용 매니지먼트</h2>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Asset Box */}
              <Card className="bg-surface border-line/80 rounded-[32px] md:rounded-[40px] overflow-hidden group hover:border-primary/50 transition-all duration-500 shadow-xl shadow-obsidian/5">
                <CardContent className="p-6 md:p-10 space-y-5 md:space-y-6">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-obsidian/20 text-obsidian font-black text-[10px] uppercase tracking-widest px-3">Data Security</Badge>
                    <Lock className="w-5 h-5 text-slate/30" />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <h3 className="text-xl md:text-2xl font-black text-obsidian leading-tight">안전한 데이터 자산화</h3>
                    <p className="text-[13px] md:text-lg text-slate font-medium leading-relaxed opacity-70">
                      당신의 모든 회복 기록은 고도로 암호화되어 보관됩니다. <br className="hidden md:block" />
                      필요한 경우에만 의료기관과 안전하게 공유됩니다.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-2 md:pt-4">
                    <Button variant="outline" size="sm" className="bg-white/50 border-obsidian/10 text-obsidian font-bold text-xs h-10 px-4 rounded-xl hover:bg-white transition-all">
                      <Download className="w-3.5 h-3.5 mr-2" /> 기록 내려받기
                    </Button>
                    <Button variant="outline" size="sm" className="bg-white/50 border-obsidian/10 text-obsidian font-bold text-xs h-10 px-4 rounded-xl hover:bg-white transition-all">
                      <Share2 className="w-3.5 h-3.5 mr-2" /> 권한 설정
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </section>
    </ChapterWrapper>
  );
}
