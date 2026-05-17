'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { CheckCircle, RefreshCw, ArrowRight, Sparkles, FileText, Clock, ShieldCheck, Brain, Gift, Layout } from 'lucide-react';
import { useRecovery } from '@/contexts/RecoveryContext';
import { AnalysisResult } from './HeroScanner';
import { motion, AnimatePresence } from 'framer-motion';
import { generateDynamicRoutines, getRhythmTypeInfo } from '@/lib/logic/routines';
import { getKSTDate } from '@/lib/date';

export default function ResultDisplay({ 
  score, 
  answers, 
  userNote, 
  analysisData,
  snapData,
  onEnter, 
  onOpenWebtoon 
}: { 
  score: number; 
  answers: any[]; 
  userNote: string; 
  analysisData: AnalysisResult | null;
  snapData?: { type: 'PHOTO' | 'TEXT'; content: string | File } | null;
  onEnter: () => void; 
  onOpenWebtoon: () => void 
}) {
  const { journey } = useRecovery();
  const [isDesigning, setIsDesigning] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Context-aware UI Labels
  const getRoadmapInfo = () => {
    switch (journey) {
      case 'CLINICAL_PRE':
        return {
          badge: "Clinical: Pre-visit",
          title: "성공적인 시술을 위한 Doctor's Note",
          cta: "의료진에게 공유하기",
          nextActionTitle: "의사 상담용 리포트 준비",
          nextActionDesc: "안전하고 효과적인 시술을 위해 상담 시 이 리포트를 함께 보여주세요."
        };
      case 'CLINICAL_POST':
        return {
          badge: "Clinical: Post-visit",
          title: "골든타임 72시간 집중 회복 전술",
          cta: "회복 타임라인 확인하기",
          nextActionTitle: "72시간 세밀 모니터링",
          nextActionDesc: "시술 후 가장 중요한 3일간의 변화를 실시간으로 밀착 관리합니다."
        };
      default:
        return {
          badge: "Recovery Timeline",
          title: "당신만을 위한 회복 타임라인",
          cta: "맞춤 플랜 확인하기",
          nextActionTitle: "일상 루틴 설계 받기",
          nextActionDesc: "실시간 데이터를 분석한 나만의 활력 행동 가이드"
        };
    }
  };

  const info = getRoadmapInfo();

  // 최근에 네비게이터(영업사원)의 QR을 스캔한 유저 = 시술/문진 집중 케어 대상 (기존 추천인 referredBy와 분리)
  const isEventUser = !!(session?.user as any)?.recentNavigator || journey?.startsWith('CLINICAL');

  // Convert raw score (0-25) to 100 scale roughly
  const recoveryScore = 100 - (score * 4);

  // Logic for Rhythm Types (Integrated with Dynamic Engine)
  const { type: rhythmType, description: typeDescription, color: cardColor } = getRhythmTypeInfo(recoveryScore);
  const dailyActions = generateDynamicRoutines(recoveryScore, analysisData);

  const scoreLevel = recoveryScore >= 70 ? '활기 회복 단계' : recoveryScore >= 40 ? '회복 진행 중' : '회복 초기 단계';

  // Remove artificial 3.5s delay and redirect immediately
  const handleStartDesign = () => {
    navigateTo('/ai-navigator');
  };

  useEffect(() => {
    const saveData = async () => {
      // 1. Local Storage (KST-aware)
      const today = getKSTDate();
      localStorage.setItem('recovery_last_check', today);
      localStorage.setItem('recovery_last_score', recoveryScore.toString());

      // 2. Dispatch event to open header
      window.dispatchEvent(new Event('recovery-gate-passed'));

      // 3. Save to DB (Background)
      try {
        await fetch('/api/recovery/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: today, // Use YYYY-MM-DD string for consistency
            rawScore: score,
            totalScore: recoveryScore,
            metaphor: rhythmType,
            answers: answers.map(a => ({
              questionId: a.questionId,
              category: a.category,
              score: a.score,
              answer: a.answer,
              detail: a.detail // 상세 약물/식품 정보 포함
            })),
            userNote: userNote,
            snapData: snapData ? {
              type: snapData.type,
              content: snapData.content
            } : undefined
          })
        });
      } catch (e) {
        console.error('Failed to save recovery score to DB', e);
      }
    };
    saveData();
  }, [recoveryScore, score, rhythmType, answers, userNote]);

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <>
      <div className={`max-w-md mx-auto min-h-[85vh] flex flex-col justify-center px-4 text-center space-y-12 animate-fade-in pb-20 ${isDesigning ? 'opacity-20 blur-sm pointer-events-none' : ''} transition-all duration-700`}>
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-chapter-accent/10 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-chapter-accent" />
            </div>
            <div>
              <p className="text-[10px] font-black text-chapter-accent uppercase tracking-widest leading-none mb-1">Rhythm Check Complete</p>
              <h2 className="text-2xl font-black text-obsidian italic tracking-tighter">리듬체크 완료</h2>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-chapter-accent/10 text-chapter-accent text-[10px] font-black uppercase tracking-widest mb-2">
              {info.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-obsidian tracking-tight break-keep">{info.title}</h2>
          </div>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-10 bg-white rounded-[40px] shadow-2xl shadow-chapter-accent/5 space-y-8 border-2 border-line relative overflow-hidden text-left"
        >
          <div className={`absolute top-0 left-0 w-full h-3 ${cardColor}`} />
          
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] font-black text-slate uppercase tracking-widest opacity-40 block mb-1">Today's Rhythm</span>
              <h3 className="text-3xl font-black text-obsidian tracking-tighter italic font-serif">
                {rhythmType}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate/40 uppercase tracking-widest block mb-1">Recovery Point</span>
              <div className="text-5xl font-black text-chapter-accent italic tracking-tighter leading-none">
                {recoveryScore}
              </div>
            </div>
          </div>

          <p className="text-lg text-slate font-medium leading-relaxed break-keep">
            {typeDescription}
          </p>

          <div className="space-y-4 pt-6 border-t border-line">
            <span className="text-[10px] font-black text-chapter-accent uppercase tracking-widest">Today's Small Action</span>
            <div className="grid grid-cols-1 gap-3">
              {dailyActions.map((action, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-mist/50 rounded-2xl border border-line/50">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">
                    {action.icon}
                  </div>
                  <span className="text-sm font-bold text-obsidian leading-tight">{action.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

          <div className="grid grid-cols-1 gap-4">
            <Button 
              onClick={handleStartDesign} 
              size="lg" 
              className="w-full h-16 md:h-20 rounded-[24px] bg-obsidian text-white text-lg md:text-xl font-black shadow-2xl shadow-obsidian/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {info.cta} <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={onEnter} 
                variant="outline" 
                className="h-14 rounded-2xl border-line text-slate font-bold hover:bg-slate/5"
              >
                기록 마칠게요
              </Button>
              <Button 
                variant="outline" 
                className="h-14 rounded-2xl border-chapter-accent/20 text-chapter-accent font-bold hover:bg-chapter-accent/5 flex items-center justify-center gap-2"
                onClick={() => {
                  // TODO: Implement actual image generation or just show a modal
                  alert('익명 공유 카드가 생성되었습니다. (준비 중)');
                }}
              >
                <Gift className="w-4 h-4" /> 리듬 공유
              </Button>
            </div>
          </div>
      </div>

    </>
  );
}
