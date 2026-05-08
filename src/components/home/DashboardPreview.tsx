'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Sparkles, Zap, ArrowRight, Calendar, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import DiagnosisForm from './DiagnosisForm';
import { useSession } from 'next-auth/react';
import FlowTimeline from './FlowTimeline';
import TodayRhythmCard from './TodayRhythmCard';
import HabitAlertBanner from './HabitAlertBanner';

interface DashboardPreviewProps {
  unifiedData: any;
  onOpenWebtoon: () => void;
  onRefresh?: () => void;
}

export default function DashboardPreview({ unifiedData, onOpenWebtoon, onRefresh }: DashboardPreviewProps) {
  const { data: session } = useSession();
  const [showDiagnosisModal, setShowDiagnosisModal] = React.useState(false);
  const [diagnosisQuestions, setDiagnosisQuestions] = React.useState<any[]>([]);
  const [isDiagnosing, setIsDiagnosing] = React.useState(false);
  const [flowData, setFlowData] = React.useState<any[]>([]);
  const [currentJourneyDay, setCurrentJourneyDay] = React.useState(0);

  const { score, user } = unifiedData;
  const displayScore = score?.totalScore || 0;

  // Fetch Real Flow Data
  React.useEffect(() => {
    const fetchFlowData = async () => {
      try {
        const res = await fetch('/api/recovery/score');
        if (res.ok) {
          const { scores } = await res.json();
          if (scores && Array.isArray(scores)) {
            // Filter scores if necessary, but API already skips claimed ones
            const mappedData = scores.map((s: any, idx: number) => ({
              day: idx + 1,
              date: s.date,
              type: s.snapData?.type || 'TEXT',
              rhythmScore: s.totalScore
            }));
            setFlowData(mappedData);
            setCurrentJourneyDay(mappedData.length);
          }
        } else {
          // Fallback to localStorage if API fails
          const savedScore = localStorage.getItem('recovery_last_score');
          if (savedScore) {
            setFlowData([{ day: 1, date: new Date().toISOString(), type: 'TEXT', rhythmScore: parseInt(savedScore) }]);
            setCurrentJourneyDay(1);
          }
        }
      } catch (err) {
        console.error('Failed to fetch flow data:', err);
      }
    };
    fetchFlowData();
  }, [unifiedData]); // Re-fetch when dashboard data refreshes (e.g. after claim)

  // 🔮 Dynamic Insight Generation for the Black Modal (HabitAlertBanner)
  const getDynamicInsight = () => {
    if (!score || !score.categories) return null;
    
    const categories = Object.entries(score.categories) as [string, number][];
    const weakest = categories.reduce((prev, curr) => prev[1] < curr[1] ? prev : curr);
    
    const insightMap: Record<string, { title: string, description: string, habits: string[] }> = {
      mental: {
        title: "자연 치유와 탄력 회복을 위한 시너지",
        description: "마음의 평온이 신체 회복의 시작입니다.",
        habits: ["오늘 하루 10분간 의식적인 심호흡 실시하기"]
      },
      physical: {
        title: "신체적 활력과 에너지 순환",
        description: "작은 움직임이 정체된 에너지를 깨웁니다.",
        habits: ["산책 후 30분 이내에 단백질 간식 챙기기 (예: 삶은 계란)"]
      },
      sleep: {
        title: "깊은 숙면과 세포 재생 가이드",
        description: "밤 사이 일어나는 기적같은 회복을 준비하세요.",
        habits: ["잠들기 1시간 전 스마트폰 멀리하고 명상하기"]
      },
      lifestyle: {
        title: "균형 잡힌 일상과 리듬의 완성",
        description: "나쁜 습관을 덜어내는 것만으로도 충분합니다.",
        habits: ["식사 후 가벼운 5분 스트레칭 습관화"]
      }
    };

    return insightMap[weakest[0]] || insightMap.physical;
  };

  const dynamicInsight = getDynamicInsight();

  const handleStartDiagnosis = async () => {
    setIsDiagnosing(true);
    try {
      const res = await fetch('/api/diagnosis/dynamic-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: session?.user?.name || '사용자'
        })
      });

      const data = await res.json();
      if (data.questions) {
        setDiagnosisQuestions(data.questions);
        setShowDiagnosisModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch dynamic questions:', error);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleDiagnosisComplete = async (rawScore: number, finalAnswers: any[], note: string) => {
    const totalPossible = diagnosisQuestions.length * 10;
    const unifiedScore = Math.round((rawScore / totalPossible) * 100);

    if (session?.user?.email) {
      try {
        await fetch('/api/diagnosis/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'daily',
            result: {
              totalScore: unifiedScore,
              convertedScores: { physical: unifiedScore, mental: unifiedScore, lifestyle: unifiedScore, sleep: unifiedScore }
            },
            answers: finalAnswers.map(a => ({
              questionId: a.questionId,
              category: a.category,
              score: a.score,
              answer: a.answer,
              detail: a.detail
            }))
          })
        });
      } catch (error) {
        console.error('Failed to save daily diagnosis:', error);
      }
    }

    localStorage.setItem('recovery_last_score', unifiedScore.toString());
    setShowDiagnosisModal(false);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="w-full bg-mist text-obsidian relative pb-24 md:pb-10">
      
      {/* 🔮 Premium Black Modal (Habit Protocol) - Auto-popup logic is inside the component */}
      <HabitAlertBanner insight={dynamicInsight} />

      {/* 🟡 0. Completion Nudge (Only visible when 7 days are complete) */}
      {currentJourneyDay >= 7 && (
        <section className="container mx-auto px-4 pt-10 max-w-5xl animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="bg-obsidian text-white rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-2xl">
            {/* Golden Decorative Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-reward-gold/20 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-chapter-accent/20 rounded-full blur-[80px] -ml-16 -mb-16" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-reward-gold/20 rounded-full flex items-center justify-center border border-reward-gold/30">
                <Sparkles className="w-8 h-8 text-reward-gold" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl md:text-4xl font-black italic font-serif tracking-tighter leading-tight">
                  7일간의 여정을 완주했습니다
                </h2>
                <p className="text-mist/70 font-medium max-w-md mx-auto leading-relaxed">
                  7일간의 기록을 통해 총 <span className="text-reward-gold font-black">12개의 회복 시그널</span>을 발견했습니다.<br />
                  {session?.user?.name || '사용자'}님의 회복력은 이전보다 <span className="text-reward-gold font-black">24% 향상</span>된 것으로 분석됩니다.
                </p>
              </div>
              <Button 
                className={`w-full max-w-sm h-16 rounded-2xl font-black text-lg shadow-xl transition-all hover:scale-105 ${
                  !unifiedData.certificateStatus?.nextCycleToClaim 
                  ? "bg-white/10 text-white border border-white/20 hover:bg-white/20" 
                  : "bg-reward-gold hover:bg-reward-gold/90 text-obsidian shadow-reward-gold/20"
                }`}
                onClick={async () => {
                  const nextCycle = unifiedData.certificateStatus?.nextCycleToClaim;
                  if (nextCycle) {
                    // Claim the next available certificate
                    try {
                      const res = await fetch('/api/user/certificate/claim', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ cycleNumber: nextCycle })
                      });
                      if (res.ok) {
                        // After claiming, refresh dashboard to see if more are available
                        if (onRefresh) onRefresh();
                        window.location.href='/certificate';
                      }
                    } catch (err) {
                      console.error('Failed to claim certificate:', err);
                      window.location.href='/certificate'; // Fallback
                    }
                  } else {
                    // View History
                    window.location.href='/archive/certificates';
                  }
                }}
              >
                {unifiedData.certificateStatus?.nextCycleToClaim 
                  ? `${unifiedData.certificateStatus.nextCycleToClaim}회차 완주 증명서 받기` 
                  : "7일 완주 증명서 확인하기"}
              </Button>
              <button className="text-[10px] font-black text-mist/30 uppercase tracking-widest hover:text-mist transition-colors">
                다음에 할게요
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 🟢 1. D1-D7 Recovery Flow (Simplified Straight Timeline) */}
      <section className="container mx-auto px-4 pt-10 pb-20 max-w-5xl relative z-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-chapter-accent" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate/50">Recovery Journey</span>
          </div>
          <Badge variant="outline" className="border-chapter-accent/20 text-chapter-accent text-[10px] font-black uppercase tracking-widest px-3 py-1">
            {(unifiedData.certificateStatus?.issuedCertificates?.length || 0) + 1}회차: {currentJourneyDay}/7 Days
          </Badge>
        </div>
        <FlowTimeline data={flowData} currentDay={currentJourneyDay} />
      </section>

      {/* 🟣 2. Today's Rhythm Analysis (Empathy & Action) */}
      <section className="container mx-auto px-4 pb-20 max-w-5xl relative z-10">
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="w-4 h-4 text-reward-gold" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate/50">Today's Insight</span>
        </div>
        <TodayRhythmCard 
          score={displayScore} 
          userName={session?.user?.name || '사용자'} 
        />
      </section>

      {/* 🔵 3. Secondary Info Grid (Intuitive Buttons) */}
      <section className="container mx-auto px-4 pb-12 max-w-5xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Membership Management */}
          <div className="bg-white/50 backdrop-blur-md rounded-[32px] p-8 border border-line/50 flex items-center justify-between group cursor-pointer hover:border-chapter-accent transition-all shadow-sm" onClick={() => window.location.href='/membership'}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-chapter-accent mb-2">Membership</p>
              <h3 className="text-xl font-black text-obsidian tracking-tight mb-1">멤버십 혜택 및 관리</h3>
              <p className="text-xs font-bold text-slate/40 uppercase tracking-tighter italic">현재 등급: {(user?.grade || 'GATE')} v2.5</p>
            </div>
            <div className="w-12 h-12 bg-mist rounded-2xl flex items-center justify-center text-slate group-hover:text-chapter-accent transition-colors">
              <ChevronRight className="w-6 h-6" />
            </div>
          </div>
          
          {/* Record Archive */}
          <div className="bg-white/50 backdrop-blur-md rounded-[32px] p-8 border border-line/50 flex items-center justify-between group cursor-pointer hover:border-chapter-accent transition-all shadow-sm" onClick={() => window.location.href='/archive'}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-chapter-accent mb-2">History Archive</p>
              <h3 className="text-xl font-black text-obsidian tracking-tight mb-1">나의 기록 보관함</h3>
              <p className="text-xs font-bold text-slate/40 uppercase tracking-tighter italic">총 {(unifiedData.assetStats?.totalInsights || 0)}개의 회복 기록</p>
            </div>
            <div className="w-12 h-12 bg-mist rounded-2xl flex items-center justify-center text-slate group-hover:text-chapter-accent transition-colors">
              <ChevronRight className="w-6 h-6" />
            </div>
          </div>
        </div>
      </section>

      {/* 🟠 4. Sticky Floating Action Button (Mobile Optimization) */}
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 md:hidden">
        <Button 
          onClick={handleStartDiagnosis}
          disabled={isDiagnosing}
          className="w-full h-16 bg-obsidian text-white rounded-[24px] font-black text-lg shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all border border-white/10"
        >
          {isDiagnosing ? "분석 준비 중..." : "오늘의 리듬 남기기"}
          <Zap className="w-5 h-5 text-reward-gold" />
        </Button>
      </div>

      {/* Desktop Version of Action Card (Optional, keeping it clean) */}
      <section className="hidden md:block container mx-auto px-4 pb-12 max-w-5xl">
        <div className="bg-obsidian text-white rounded-[40px] p-10 flex items-center justify-between shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black italic font-serif">변화를 만드는 60초의 기록</h3>
            <p className="text-mist/60 text-sm mt-2">작은 리듬이 모여 당신의 삶을 바꿉니다.</p>
          </div>
          <Button 
            onClick={handleStartDiagnosis}
            disabled={isDiagnosing}
            className="h-16 px-8 bg-white text-obsidian rounded-2xl font-black hover:scale-105 transition-transform relative z-10"
          >
            리듬체크 시작하기
          </Button>
          <div className="absolute top-0 right-0 w-32 h-32 bg-chapter-accent/20 blur-3xl -mr-16 -mt-16" />
        </div>
      </section>

      <Dialog open={showDiagnosisModal} onOpenChange={setShowDiagnosisModal}>
        <DialogContent className="max-w-xl p-0 overflow-y-auto max-h-[90vh] border-none rounded-[40px] shadow-2xl bg-white">
          <DialogHeader className="sr-only">
            <DialogTitle>1일 리듬체크</DialogTitle>
            <DialogDescription>데이터 기반으로 설계하는 나만의 일상 리듬</DialogDescription>
          </DialogHeader>
          <DiagnosisForm questions={diagnosisQuestions} onComplete={handleDiagnosisComplete} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
