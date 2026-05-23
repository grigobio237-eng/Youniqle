'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Question } from '@/types/diagnosis';
import { Sparkles, ArrowRight } from 'lucide-react';

const DashboardPreview = dynamic(() => import('@/components/home/DashboardPreview'), { ssr: false });
const ResultDisplay = dynamic(() => import('@/components/home/ResultDisplay'), { ssr: false });
const WebtoonChallengeDialog = dynamic(() => import('@/components/home/WebtoonChallengeDialog'), { ssr: false });
import LifeSnapFeed from '@/components/dashboard/LifeSnapFeed';
import WeeklyReportView from '@/components/dashboard/WeeklyReportView';
import RecoveryToolkitView from '@/components/dashboard/RecoveryToolkitView';
import RecoveryInsightView from '@/components/dashboard/RecoveryInsightView';
import RecoveryStatusHero from '@/components/dashboard/RecoveryStatusHero';
import AiNudgeBanner, { AiNudge } from '@/components/dashboard/AiNudgeBanner';
import { useSession } from 'next-auth/react';
import RecoveryModal from '@/components/dashboard/RecoveryModal';


export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [scoreHistory, setScoreHistory] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [showWebtoonDialog, setShowWebtoonDialog] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [nudges, setNudges] = useState<AiNudge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchedRef = React.useRef(false);

  const fetchDashboardData = async (isRefresh = false) => {
    if (!isRefresh && fetchedRef.current) return;
    fetchedRef.current = true;

    try {
      if (isRefresh) setLoading(false);
      
      const [statusRes, timelineRes, diagRes, nudgesRes] = await Promise.all([
        fetch('/api/user/status'),
        fetch('/api/user/timeline'),
        fetch('/api/recommendations/diagnosis?limit=1&protocols=false'),
        fetch('/api/football/nudges')
      ]);

      if (statusRes.ok) {
        const result = await statusRes.json();
        setData(result);
      }

      if (nudgesRes.ok) {
        const nudgesData = await nudgesRes.json();
        if (nudgesData.success) {
          setNudges(nudgesData.data);
        }
      }

      if (timelineRes.ok) {
        const timelineData = await timelineRes.json();
        const timeline = timelineData.timeline || [];
        
        // 1. 브라우저 타임존 및 문자열 노이즈로부터 안전하게 날짜 키(M/D)를 추출하는 헬퍼 함수
        const getSafeDateKey = (dateInput: any) => {
          if (!dateInput) return null;
          try {
            const cleanInput = typeof dateInput === 'string'
              ? dateInput.replace(/\s*\(.*?\)\s*/g, '').trim()
              : dateInput;
            const d = new Date(cleanInput);
            if (isNaN(d.getTime())) return null;
            return `${d.getMonth() + 1}/${d.getDate()}`;
          } catch {
            return null;
          }
        };

        const today = new Date();
        const todayKey = getSafeDateKey(today);

        // 2. 7일 선 그래프를 위한 로컬 절대 일자 7개 생성
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(today.getDate() - (6 - i));
          return {
            displayDate: d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
            dateKey: getSafeDateKey(d)
          };
        });

        // 3. 타임라인 데이터를 날짜별 고정 키(M/D)로 맵핑 (가장 최신의 정직한 데이터 보존)
        const timelineMap = timeline.reduce((acc: any, item: any) => {
          const key = getSafeDateKey(item.createdAt);
          if (key && !acc[key] && item.score !== undefined && item.score !== null) {
            acc[key] = item.score;
          }
          return acc;
        }, {});

        // 4. 생성한 X축 기준에 맞춰 100% 매칭되는 실제 점수 세팅
        const dynamicHistory = last7Days.map(d => ({
          date: d.dateKey === todayKey ? '오늘' : d.displayDate,
          score: d.dateKey ? (timelineMap[d.dateKey] || null) : null
        }));
        
        setScoreHistory(dynamicHistory);
      }

      if (diagRes.ok) {
        const diagData = await diagRes.json();
        if (diagData.metadata?.categoryScores) {
          const scores = diagData.metadata.categoryScores;
          setRadarData([
            { category: 'PHYSICAL', score: scores.physical, fullMark: 100 },
            { category: 'MENTAL', score: scores.mental, fullMark: 100 },
            { category: 'SLEEP', score: scores.sleep, fullMark: 100 },
            { category: 'LIFESTYLE', score: scores.lifestyle, fullMark: 100 }
          ]);
        }
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const [activeTab, setActiveTab] = useState<'home' | 'toolkit' | 'insight' | 'snap'>('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-32 px-6 space-y-16">
        {/* Skeleton Timeline Area */}
        <div className="container mx-auto max-w-5xl space-y-8">
          <div className="flex justify-between items-center">
            <div className="w-40 h-5 bg-primary/5 rounded-full animate-pulse" />
            <div className="w-24 h-8 bg-primary/5 rounded-full animate-pulse" />
          </div>
          <div className="w-full h-28 bg-surface/50 rounded-5xl border border-primary/5 animate-pulse flex items-center justify-around px-10">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="w-10 h-10 bg-primary/5 rounded-full" />
            ))}
          </div>
        </div>
        
        {/* Skeleton Card Area */}
        <div className="container mx-auto max-w-5xl space-y-10">
          <div className="w-48 h-5 bg-primary/5 rounded-full animate-pulse" />
          <div className="w-full h-80 bg-surface/50 rounded-5xl border border-primary/5 animate-pulse" />
        </div>

        {/* Floating Sync Indicator */}
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-surface/80 backdrop-blur-2xl text-foreground/70 px-8 py-4 rounded-full shadow-2xl border border-white/20 z-50">
          <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="text-xs font-bold tracking-widest">나의 기록들을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  // If no data (no diagnosis), show prompt
  if (!data || (!data.score?.diagnosisScore && !data.score?.scanScore)) {
    const localScore = typeof window !== 'undefined' ? localStorage.getItem('recovery_last_score') : null;

    if (localScore) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <h2 className="text-2xl font-bold text-foreground">회복 데이터를 정리하고 있어요</h2>
          <p className="text-lg text-foreground/50 leading-relaxed">최근 기록하신 {localScore}점의 진단 결과를 토대로<br />오늘의 회복 리듬을 분석하고 있습니다.</p>
          <Button variant="ghost" onClick={() => window.location.reload()} className="rounded-full">잠시만 기다려주세요</Button>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary-container/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 max-w-xl w-full">
          <div className="w-28 h-28 bg-surface rounded-5xl shadow-2xl shadow-primary/5 flex items-center justify-center mx-auto mb-10 transform -rotate-3 hover:rotate-0 transition-transform duration-700 border border-white/50 backdrop-blur-xl">
            <Sparkles className="w-14 h-14 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-6 leading-tight">
            나만을 위한<br />회복의 시간을 가져볼까요?
          </h1>
          
          <p className="text-foreground/50 font-medium text-lg md:text-xl mb-12 leading-relaxed">
            오늘 당신의 몸과 마음이 보내는 신호에 귀를 기울여보세요.<br />
            가벼운 체크만으로도 당신에게 필요한 위로를 전해드릴게요.
          </p>
          
          <div className="space-y-6">
            <button
              onClick={() => {
                localStorage.removeItem('recovery_last_score');
                window.location.href = '/diagnosis?type=daily';
              }}
              className="w-full py-8 bg-primary text-white rounded-full font-bold text-2xl tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 group"
            >
              오늘의 회복 리듬 측정 시작하기
              <ArrowRight className="w-8 h-8 group-hover:translate-x-1.5 transition-transform" />
            </button>
            
            <div className="flex items-center justify-center gap-8 pt-6">
              <div className="flex items-center gap-2.5 text-xs font-bold text-foreground/30 uppercase tracking-[0.2em]">
                <div className="w-1.5 h-1.5 bg-primary/30 rounded-full" />
                Youniqle Analysis
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-foreground/30 uppercase tracking-[0.2em]">
                <div className="w-1.5 h-1.5 bg-primary/30 rounded-full" />
                Custom Protocol
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-foreground/30 uppercase tracking-[0.2em]">
                <div className="w-1.5 h-1.5 bg-primary/30 rounded-full" />
                Daily Rewards
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background flex flex-col pb-24 overflow-visible min-h-screen">
      {/* 🟢 Comprehensive Recovery Summary Hero */}
      <RecoveryStatusHero 
        todayScore={data?.score?.totalScore || 0}
        scoreHistory={scoreHistory}
        radarData={radarData}
        assetStats={data?.assetStats}
        userName={session?.user?.name || '사용자'}
        onOpenSleepModal={() => setShowSleepModal(true)}
      />


      {/* AI Nudge Banners Area */}
      {nudges.length > 0 && (
        <div className="px-4 pt-4 max-w-xl mx-auto w-full space-y-3 z-20 relative">
          {nudges.map(nudge => (
            <AiNudgeBanner 
              key={nudge.id} 
              nudge={nudge} 
              onDismiss={(id) => setNudges(prev => prev.filter(n => n.id !== id))} 
            />
          ))}
        </div>
      )}

      {/* Tab Navigation - Softer & Floating */}
      <div className="sticky top-[110px] md:top-[120px] z-30 bg-background/80 backdrop-blur-md pt-4 pb-2 px-4">
        <div className="max-w-xl mx-auto flex bg-surface/50 p-1.5 rounded-full border border-white/20 shadow-lg shadow-primary/5">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 py-3.5 text-[11px] font-bold tracking-widest uppercase transition-all rounded-full ${activeTab === 'home' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-foreground/40 hover:bg-white/50'
              }`}
          >
            오늘의 회복
          </button>
          <button
            onClick={() => setActiveTab('insight')}
            className={`flex-1 py-3.5 text-[11px] font-bold tracking-widest uppercase transition-all rounded-full ${activeTab === 'insight' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-foreground/40 hover:bg-white/50'
              }`}
          >
            흐름 분석
          </button>
          <button
            onClick={() => setActiveTab('snap')}
            className={`flex-1 py-3.5 text-[11px] font-bold tracking-widest uppercase transition-all rounded-full ${activeTab === 'snap' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-foreground/40 hover:bg-white/50'
              }`}
          >
            기록 로그
          </button>
          <button
            onClick={() => setActiveTab('toolkit')}
            className={`flex-1 py-3.5 text-[11px] font-bold tracking-widest uppercase transition-all rounded-full ${activeTab === 'toolkit' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-foreground/40 hover:bg-white/50'
              }`}
          >
            회복 툴킷
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 w-full px-4 pt-6 relative z-10 overflow-visible">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <DashboardPreview
              unifiedData={data}
              onOpenWebtoon={() => setShowWebtoonDialog(true)}
              onRefresh={() => fetchDashboardData(true)}
            />
            <WebtoonChallengeDialog
              open={showWebtoonDialog}
              onOpenChange={setShowWebtoonDialog}
              recoveryData={{
                score: data.score?.totalScore,
                recentActivity: data.recentActivity
              }}
            />
          </div>
        )}

        {activeTab === 'insight' && (
          <RecoveryInsightView unifiedData={data} />
        )}

        {activeTab === 'snap' && (
          <LifeSnapFeed />
        )}

        {activeTab === 'toolkit' && (
          <RecoveryToolkitView userTier={data.user?.grade} userRole={data.user?.role} />
        )}
      </div>

      {/* 🌙 수면 기록 퀵 모달 */}
      <RecoveryModal 
        open={showSleepModal} 
        onOpenChange={(open) => {
          setShowSleepModal(open);
          if (!open) {
            fetchDashboardData(true); // 모달이 닫힐 때 대시보드 데이터 최신 갱신
          }
        }} 
      />
    </div>

  );
}
