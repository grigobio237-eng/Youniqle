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

export default function Hero({ onStart, isDiagnosing = false }: { onStart: (data?: AnalysisResult, image?: string) => void, isDiagnosing?: boolean }) {
  const { journey, resetJourney } = useRecovery();
  const { data: session } = useSession();
  const { trackEvent } = useActivityTracker();

  const [personalMsg, setPersonalMsg] = useState({
    title: <>당신이 머무는 공간,<br />보고 듣고 느끼는 모든 것이<br /><span className="text-chapter-accent underline decoration-mist decoration-8 underline-offset-4">회복의 단서</span>가 됩니다.</>,
    desc: "일상의 작은 조각들을 모아 당신만의 회복 리듬을 기록하는 퍼스널 거울, 유니클",
    nudge: "오늘의 컨디션은 어떠신가요? 가벼운 기록으로 시작해보세요."
  });

  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('60초 리듬체크 시작');

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
      setLoadingText('60초 리듬체크 시작');
    }

    return () => clearInterval(interval);
  }, [isDiagnosing]);

  useEffect(() => {
    const fetchPersonalization = async () => {
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
        updateMessage(userName, 'physical');
        return;
      }

      // 2. Guest Logic (Fixed Option 1 Copy)
      setPersonalMsg({
        title: <>데이터로 읽어내는 당신만의 회복 리듬,<br /><span className="text-chapter-accent underline decoration-mist decoration-8 underline-offset-4">Lifecare OS 유니클</span>에 오신 것을 환영합니다.</>,
        desc: "유니클은 당신의 일상을 정밀하게 분석하여, 지금 이 순간 가장 필요한 회복 루틴을 실시간으로 설계하는 AI 라이프케어 시스템입니다.",
        nudge: "오늘 당신의 몸과 마음이 보내는 신호에 귀를 기울여 보세요."
      });
    };

    const updateMessage = (name: string, categoryId: string) => {
      const categoryMap: Record<string, { label: string, question: string }> = {
        mental: { label: '마음의 안정', question: '요즘 유독 마음이 복잡하진 않으셨나요?' },
        physical: { label: '신체적 활력', question: '부쩍 몸이 무겁게 느껴지는 날이 많으셨죠?' },
        sleep: { label: '숙면 에너지', question: '자고 일어나도 개운하지 않은 아침이었나요?' },
        lifestyle: { label: '생활 리듬', question: '일상의 균형이 조금씩 무너지고 있진 않나요?' }
      };

      const info = categoryMap[categoryId] || { label: categoryId, question: '오늘의 회복 리듬을 함께 살펴볼까요?' };

      setPersonalMsg({
        title: <>{name}님, {info.question}<br />오늘 유니클은 <span className="text-chapter-accent underline decoration-mist decoration-8 underline-offset-4">{info.label}</span>에 주목하고 있어요.</>,
        desc: `${name}님의 기록들을 비추어보니, 지금은 ${info.label}을(를) 위한 부드러운 케어가 가장 필요한 순간인 것 같아요.`,
        nudge: `무너진 ${info.label} 리듬을 다시 세우러 가볼까요?`
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
              <span className="text-[10px] md:text-xs font-black text-chapter-accent uppercase tracking-[0.3em] md:tracking-[0.8em] opacity-70">RECOVERY CGM</span>
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

            {/* Contextual Nudge Bubble - Hidden on mobile to prevent overlap */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStart()}
              className="hidden md:block absolute -bottom-6 -left-12 bg-white p-4 rounded-[30px] shadow-2xl border border-line cursor-pointer hover:border-chapter-accent/50 transition-all z-10 group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-chapter-accent animate-ping" />
                <span className="text-[10px] font-black text-obsidian uppercase tracking-widest">Youniqle LIVE</span>
              </div>
              <p className="text-[11px] font-bold text-slate leading-snug group-hover:text-chapter-accent transition-colors">
                {personalMsg.nudge}
              </p>
              <div className="mt-2 flex items-center text-[9px] font-black text-chapter-accent opacity-0 group-hover:opacity-100 transition-all">
                기록 시작하기 <ArrowRight className="ml-1 w-3 h-3" />
              </div>
            </motion.div>
          </div>

          {/* 3. Button & checkmarks (Bottom on Mobile, Bottom-Left on Desktop) */}
          <div className="space-y-6 md:space-y-12 animate-in fade-in slide-in-from-left-8 duration-700 order-3 lg:order-3 lg:col-start-1">
            <div className="pt-2 space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Button
                  onClick={() => onStart()}
                  size="lg"
                  className="btn-primary w-full md:w-auto h-14 md:h-16 px-8 rounded-2xl text-base md:text-lg font-black shadow-xl shadow-chapter-accent/20 group relative overflow-hidden transition-all duration-300 bg-chapter-accent hover:bg-chapter-accent/90 text-white"
                >
                  <div className="relative z-10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12" />
                    <span>60초 리듬체크</span>
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full md:w-auto h-14 md:h-16 px-8 rounded-2xl text-base md:text-lg font-bold border-line hover:bg-mist transition-all group"
                >
                  <Link href="/dashboard">
                    <div className="relative z-10 flex items-center justify-center">
                      <Layout className="w-5 h-5 mr-2" />
                      <span>오늘 회복 흐름 보기</span>
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </Button>
              </div>
              <div className="text-sm font-bold text-chapter-accent flex items-center gap-2">
                <div className="w-2 h-2 bg-chapter-accent rounded-full animate-pulse" />
                나만을 위한 지능형 회복 솔루션
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-[10px] md:text-xs text-slate/60 font-black uppercase tracking-wider md:tracking-widest">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-chapter-accent/40" /> 회복 리듬 기록</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-chapter-accent/40" /> 맞춤형 흐름 분석</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-chapter-accent/40" /> 일상 루틴 설계</span>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
