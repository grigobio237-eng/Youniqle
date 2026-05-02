'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle, ArrowRight, Activity, ShieldCheck, Layout } from 'lucide-react';
import HeroScanner, { AnalysisResult } from './HeroScanner';
import { useRecovery } from '@/contexts/RecoveryContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import Link from 'next/link';

export default function Hero({ onStart, isDiagnosing = false }: { onStart: (data?: AnalysisResult) => void, isDiagnosing?: boolean }) {
  const { journey, resetJourney } = useRecovery();
  const { data: session } = useSession();
  const { trackEvent } = useActivityTracker();

  const [personalMsg, setPersonalMsg] = useState({
    title: <>당신이 머무는 공간,<br />보는 것과 듣는 것,<br />그리고 먹는 모든 것이<br /><span className="text-chapter-accent underline decoration-mist decoration-8 underline-offset-4">회복의 조각</span>입니다.</>,
    desc: "식단, 사운드, 시각 데이터를 통합한 유니클만의 맞춤형 회복 큐레이션",
    nudge: "지금 먹는 음식, 회복에 도움이 될까요? 사진으로 바로 확인!"
  });

  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('60초 간편 진단 시작');

  // Advanced Progress animation logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isDiagnosing) {
      setProgress(0);
      const startTime = Date.now();

      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;

        let newProgress = 0;
        if (elapsed < 10000) {
          // Phase 1: 0 to 80% in 10 seconds
          newProgress = (elapsed / 10000) * 80;
        } else if (elapsed < 30000) {
          // Phase 2: 80 to 98% in next 20 seconds (Very slow)
          newProgress = 80 + ((elapsed - 10000) / 20000) * 18;
        } else {
          // Phase 3: Hold at 98%
          newProgress = 98;
        }

        setProgress(newProgress);

        // Dynamic text based on progress
        if (newProgress < 30) setLoadingText('유니클이 상태를 분석 중입니다...');
        else if (newProgress < 60) setLoadingText('회복 데이터를 수집하고 있습니다...');
        else if (newProgress < 95) setLoadingText('맞춤형 질문을 설계 중입니다...');
        else setLoadingText('거의 다 되었습니다. 마지막 정리 중입니다...');

      }, 100);
    } else {
      if (progress > 0) {
        setProgress(100);
        setTimeout(() => setProgress(0), 500);
      }
      setLoadingText('60초 정밀 진단 시작');
    }

    return () => clearInterval(interval);
  }, [isDiagnosing]);

  useEffect(() => {
    const fetchPersonalization = async () => {
      const defaultCategory = 'physical'; // Default: 신체적 활력

      // 1. Check Session first
      if (session?.user) {
        const userName = session.user.name || '회원';
        try {
          const res = await fetch('/api/user/status');
          if (res.ok) {
            const data = await res.json();
            const { score } = data;

            if (score && score.categories) {
              const categories = Object.entries(score.categories) as [string, number][];
              const weakest = categories.reduce((prev, curr) => prev[1] < curr[1] ? prev : curr);

              // If there's a specific weakness, show it
              if (weakest[1] < 90) {
                updateMessage(userName, weakest[0]);
                return;
              }
            }
          }
        } catch (e) {
          console.error("Personalization failed", e);
        }

        // Logged in but no specific low score or fetch failed - use general greeting
        updateMessage(userName, defaultCategory);
        return;
      }

      // 2. Guest Logic
      const localScore = localStorage.getItem('recovery_last_score');
      if (localScore) {
        // If they have a previous score (even as guest), acknowledge it
        updateMessage('방문자', defaultCategory);
      } else {
        // Pure unknown guest - update to "방문자님" but maybe keep original default title for clean start?
        // User wants "방문자님" to be shown for non-logged in users.
        updateMessage('방문자', defaultCategory);
      }
    };

    const updateMessage = (name: string, categoryId: string) => {
      const categoryMap: Record<string, string> = {
        mental: '마음의 안정',
        physical: '신체적 활력',
        sleep: '숙면 에너지',
        lifestyle: '생활 리듬'
      };

      const weakName = categoryMap[categoryId] || categoryId;

      setPersonalMsg({
        title: <>{name}님, 오늘 가장 필요한 건<br /><span className="text-chapter-accent underline decoration-mist decoration-8 underline-offset-4">{weakName}</span>의 회복입니다.</>,
        desc: `${name}님의 최근 분석 데이터에 따르면, 현재 ${weakName} 케어가 우선적으로 권장됩니다.`,
        nudge: `${weakName} 점수가 낮아요. 맞춤 솔루션을 확인해보세요!`
      });
    };

    fetchPersonalization();
    trackEvent('view', { itemType: 'category', itemData: { name: 'HomeHero' } });
  }, [session, trackEvent, session?.user?.name]);


  return (
    <div id="scanner" className="hero-cinematic noise-texture bg-mist relative overflow-hidden pt-12 pb-12 md:pt-32 md:pb-32">
      {/* Decorative Blur Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className="absolute -top-[15%] -left-[10%] w-[50%] h-[50%] bg-chapter-accent/10 rounded-full blur-[150px]" />
        <div className="absolute -bottom-[15%] -right-[10%] w-[50%] h-[50%] bg-reward-gold/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* 1. Texts (Top on Mobile, Top-Left on Desktop) */}
          <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-700 order-1 lg:order-1">
            <div className="flex items-center gap-3">
              <span className="text-[10px] md:text-xs font-black text-chapter-accent uppercase tracking-[0.3em] md:tracking-[0.8em] opacity-70">Scientific Recovery</span>
              {journey && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 bg-chapter-accent/10 text-chapter-accent px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                  <Activity className="w-3 h-3" /> {journey} MODE
                  <button onClick={resetJourney} className="ml-2 hover:underline opacity-60">CHANGE</button>
                </motion.div>
              )}
            </div>
            <h1 className="text-[1.4rem] md:text-6xl font-serif-display text-obsidian leading-[1.1] tracking-tight">
              {personalMsg.title}
            </h1>
            <p className="text-base md:text-xl text-slate/70 font-medium leading-relaxed">
              {personalMsg.desc}
            </p>
          </div>

          {/* 2. Scanner (Middle on Mobile, Right side on Desktop) */}
          <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 order-2 lg:order-2 lg:row-span-2 lg:col-start-2 flex justify-center lg:block">
            <div className="absolute -inset-4 bg-gradient-to-tr from-chapter-accent/5 to-reward-gold/5 rounded-[60px] blur-3xl opacity-50" />
            <div className="relative w-full">
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-chapter-accent/5 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-reward-gold/5 rounded-full blur-3xl animate-pulse delay-1000" />
              <HeroScanner onStart={onStart} isDiagnosing={isDiagnosing} />
            </div>

            {/* Contextual Nudge Bubble */}
            <div className="absolute -bottom-6 -left-6 md:-left-12 bg-white p-4 rounded-[30px] shadow-2xl border border-line animate-bounce max-w-[180px] hidden md:block z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-chapter-accent animate-ping" />
                <span className="text-[10px] font-black text-obsidian uppercase tracking-widest">Youniqle LIVE</span>
              </div>
              <p className="text-[11px] font-bold text-slate leading-snug">
                {personalMsg.nudge}
              </p>
            </div>
          </div>

          {/* 3. Button & checkmarks (Bottom on Mobile, Bottom-Left on Desktop) */}
          <div className="space-y-6 md:space-y-12 animate-in fade-in slide-in-from-left-8 duration-700 order-3 lg:order-3 lg:col-start-1">
            <div className="pt-2 space-y-6">
              <div className="flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="btn-primary w-full md:w-auto h-14 md:h-16 px-8 rounded-2xl text-base md:text-lg font-black shadow-xl shadow-chapter-accent/20 group relative overflow-hidden transition-all duration-300"
                >
                  <Link href="/dashboard">
                    <div className="relative z-10 flex items-center justify-center">
                      <Layout className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12" />
                      <span>나의 회복 대시보드</span>
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </Button>
              </div>
              <div className="text-sm font-bold text-chapter-accent flex items-center gap-2">
                <div className="w-2 h-2 bg-chapter-accent rounded-full animate-pulse" />
                맞춤형 지능형 회복 솔루션 확인
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-[10px] md:text-xs text-slate/60 font-black uppercase tracking-wider md:tracking-widest">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-chapter-accent/40" /> 회복 점수 리포트</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-chapter-accent/40" /> 시술/수술 케어</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-chapter-accent/40" /> 일상 리듬 설계</span>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
