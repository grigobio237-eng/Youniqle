import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Music, Scan, Layout, Sparkles, Activity, Zap, CheckCircle2, Crown, Archive } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import DiagnosisForm from './DiagnosisForm';
import { useRecovery } from '@/contexts/RecoveryContext';
import { useSession } from 'next-auth/react';
import RealtimeActivityBanner from '@/components/social/RealtimeActivityBanner';
import DiagnosisBasedRecommendations from '@/components/personalization/DiagnosisBasedRecommendations';
import HabitAlertBanner from '@/components/home/HabitAlertBanner';
import MealNutrientChart from '@/components/dashboard/MealNutrientChart';
import ActionableInsightCard from '@/components/dashboard/ActionableInsightCard';
import { getUserProgress, getChecklistProgress, updateChecklist, getTierChecklist, saveUserProgress, type TierType } from '@/lib/progress';
import { AccessControl } from '@/lib/logic/access-control';
import { ClipboardList, Stethoscope, HeartPulse, MessageSquare, Lock, ArrowRight } from 'lucide-react';
import FlowTimeline from './FlowTimeline';
import { generateDynamicRoutines, getRhythmTypeInfo } from '@/lib/logic/routines';
import { AnalysisResult } from './HeroScanner';

interface DashboardPreviewProps {
  unifiedData: any;
  onOpenWebtoon: () => void;
  onRefresh?: () => void;
}

export default function DashboardPreview({ unifiedData, onOpenWebtoon, onRefresh }: DashboardPreviewProps) {
  const [progress, setProgress] = React.useState<any>(null);
  const [checklistProgress, setChecklistProgress] = React.useState({ completed: 0, total: 4, percentage: 0 });
  const [isRecoveryActive, setIsRecoveryActive] = React.useState(false);
  const { data: session } = useSession();
  const { journey, medicalCategory, treatmentType } = useRecovery();
  const [showDiagnosisModal, setShowDiagnosisModal] = React.useState(false);
  const [diagnosisQuestions, setDiagnosisQuestions] = React.useState<any[]>([]);
  const [isDiagnosing, setIsDiagnosing] = React.useState(false);
  const [currentTheme, setCurrentTheme] = React.useState<string>('');
  const [flowData, setFlowData] = React.useState<any[]>([]);
  const [currentJourneyDay, setCurrentJourneyDay] = React.useState(0);
  const [showD3Reward, setShowD3Reward] = React.useState(false);

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
        setCurrentTheme(data.theme);
        setShowDiagnosisModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch dynamic questions:', error);
      alert('리듬체크 문항을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
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
              convertedScores: {
                physical: unifiedScore,
                mental: unifiedScore,
                lifestyle: unifiedScore,
                sleep: unifiedScore
              }
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
    
    if (onRefresh) {
      onRefresh(); // Trigger real-time sync instead of reload
    } else {
      window.location.reload();
    }
  };

  const { score, insights, recentActivity, user, surveyReport, activeMedicalGuide, activeRecoveryPlan, checklistStatus, assetStats } = unifiedData;
  const userTier = (user?.grade || 'NONE') as TierType;
  const displayScore = score?.totalScore || 0;
  const levelInfo = getLevelInfo(displayScore);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setProgress(getUserProgress());
      setChecklistProgress(getChecklistProgress(userTier));
      setIsRecoveryActive(localStorage.getItem('recovery_mode') === 'active');
    }
  }, [userTier]);

  const fetchedRef = React.useRef(false);

  // Fetch Real Flow Data
  React.useEffect(() => {
    async function fetchFlowData() {
      if (fetchedRef.current) return;
      fetchedRef.current = true;
      
      try {
        const res = await fetch('/api/recovery/score');
        if (res.ok) {
          const { scores } = await res.json();
          if (scores && scores.length > 0) {
            // Filter out incomplete records (score > 0) and take the MOST RECENT 7
            const validScores = scores.filter((s: any) => s.totalScore > 0);
            const recentScores = validScores.slice(-7);

            const mappedData = recentScores.map((s: any, idx: number) => ({
              day: idx + 1,
              date: s.date,
              type: s.snapData?.type || 'TEXT',
              rhythmScore: s.totalScore
            }));
            setFlowData(mappedData);
            setCurrentJourneyDay(mappedData.length);
          } else {
            setFlowData([]);
            setCurrentJourneyDay(0);
          }
        }
      } catch (err) {
        console.error('Failed to fetch flow data:', err);
      }
    }
    fetchFlowData();
  }, []);

  // D3 미니 보상 체크
  React.useEffect(() => {
    if (currentJourneyDay === 3 && !localStorage.getItem('d3_reward_shown')) {
      setShowD3Reward(true);
      localStorage.setItem('d3_reward_shown', 'true');
    }
  }, [currentJourneyDay]);

  // Sync server checklist status with local progress
  React.useEffect(() => {
    if (unifiedData?.checklistStatus && typeof window !== 'undefined') {
      const serverStatus = unifiedData.checklistStatus;
      const currentProgress = getUserProgress();
      
      // Update local checklist based on server data
      let changed = false;
      Object.entries(serverStatus).forEach(([key, isDone]) => {
        if (isDone && !currentProgress.todayChecklist[key as keyof typeof currentProgress.todayChecklist]) {
          currentProgress.todayChecklist[key as keyof typeof currentProgress.todayChecklist] = true;
          changed = true;
        }
      });

      if (changed) {
        saveUserProgress(currentProgress);
        setProgress(currentProgress);
        setChecklistProgress(getChecklistProgress(userTier));
      }
    }
  }, [unifiedData, userTier]);

  const handleChecklistItemClick = (itemId: string, isChecked: boolean) => {
    if (isChecked) {
        // Already completed - maybe show a toast or just stay
        return;
    }

    // Smart Navigation based on item ID
    switch (itemId) {
        case 'diagnosis':
            window.location.href = '/diagnosis?type=daily';
            break;
        case 'aiAdvice':
            // Scroll to AI Insights section
            const insightSection = document.getElementById('ai-insights');
            if (insightSection) {
                insightSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 400, behavior: 'smooth' });
            }
            break;
        case 'content':
            onOpenWebtoon();
            break;
        case 'routine':
            // Scroll to routines section
            const routineSection = document.getElementById('today-routines');
            if (routineSection) {
                routineSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 1200, behavior: 'smooth' });
            }
            break;
        case 'utility':
            window.location.href = '/utils';
            break;
        case 'mealScan':
            window.location.href = '/utils/food-scanner';
            break;
        case 'soundTherapy':
            window.location.href = '/?tool=sound';
            break;
        case 'postureScan':
            window.location.href = '/utils?tool=posture';
            break;
        default:
            // For any other items, we can just navigate to utils or general dashboard
            window.location.href = '/utils';
            break;
    }
  };


  // Dynamic routine generation considering scan results
  const latestScanEntry = unifiedData.recentActivity?.find((a: any) => 
    ['MEAL', 'SPACE', 'STATE', 'POSTURE', 'POST_OP', 'HYDRATION', 'SKIN', 'SLEEP', 'ACTIVITY', 'ROUTINE', 'BODY'].includes(a.type) && a.metrics?.futureDirection
  );
  
  const latestScan = latestScanEntry ? {
    futureDirection: latestScanEntry.metrics.futureDirection,
    type: latestScanEntry.type,
    matchScore: latestScanEntry.score,
    summary: latestScanEntry.summary
  } : null;

  const dynamicRoutines = generateDynamicRoutines(displayScore, latestScan as any);
  const todayRoutines = dynamicRoutines.map(r => r.text);

  // Constants for membership etc.
  const streak = user?.gamification?.currentStreak || 0;
  const totalPoints = user?.points || 0;
  const membershipLevel = user?.passInfo?.type && user?.passInfo?.type !== 'NONE' ? user.passInfo.type : 'GATE';
  const pointsToNext = 100 - (totalPoints % 100);
  const tierChecklist = getTierChecklist(userTier);

  // 티어별 환영 메시지 및 색상
  const tierConfig: Record<string, { color: string; bg: string; message: string; charImg: string }> = {
    NONE: { color: 'text-slate-500', bg: 'bg-slate-100', message: '회복의 여정을 시작해 보세요', charImg: '/images/characters/char_todo.png' },
    RESET: { color: 'text-blue-600', bg: 'bg-blue-50', message: '회복의 시작을 응원합니다', charImg: '/images/characters/char_water.png' },
    REBORN: { color: 'text-emerald-600', bg: 'bg-emerald-50', message: '꾸준한 회복이 성과로 나타나고 있어요', charImg: '/images/characters/char_weather.png' },
    RESTART: { color: 'text-amber-600', bg: 'bg-amber-50', message: '전문가 수준의 회복 여정을 진행 중입니다', charImg: '/images/characters/char_stretch.png' },
    BLACK: { color: 'text-obsidian', bg: 'bg-obsidian/5', message: '전담 매니저가 당신의 회복을 모니터링 중입니다', charImg: '/images/characters/char_scanner.png' },
  };
  const currentTierConfig = tierConfig[userTier] || tierConfig['NONE'];

  return (
    <div className="min-h-screen pb-20 bg-mist text-obsidian relative">
      {/* 🟢 Intelligent Habit Alert Banner */}
      <HabitAlertBanner insight={insights.posture || insights.meal} />

      {/* Recovery Guard Banner */}
      {isRecoveryActive && (
        <section className="bg-obsidian py-4 border-b border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 animate-pulse" />
          <div className="container mx-auto max-w-5xl px-4 relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-background animate-bounce-slow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <div className="text-mist">
                <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">Real-time Recovery Guard Active</p>
                <p className="font-bold text-sm">시술 후 집중 회복 모니터링 중입니다. (1일차)</p>
              </div>
            </div>
            <Button asChild size="sm" className="bg-primary text-background font-black rounded-xl hover:scale-105 transition-transform">
              <Link href="/event/monitoring">상태 체크하기</Link>
            </Button>
          </div>
        </section>
      )}

      {/* 🏥 Medical Consultation Guide Section - HIDDEN FOR MVP PHASE */}
      {/* {activeMedicalGuide && ( ... )} */}

      {/* 🚀 Post-Care Recovery Plan Section - HIDDEN FOR MVP PHASE */}
      {/* {activeRecoveryPlan && ( ... )} */}

      {/* 🚀 Lifecare OS Upgrade Banner - NEW (Added for high visibility) */}
      <section className="container mx-auto max-w-5xl px-4 pt-8">
        <Link href="/membership" className="group block">
          <div className="bg-obsidian rounded-[32px] md:rounded-[48px] p-6 md:p-10 relative overflow-hidden shadow-2xl border border-white/5 group-hover:border-primary/30 transition-all">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-primary/30 transition-colors" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 blur-[80px] rounded-full -ml-16 -mb-16" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full flex items-center justify-center shadow-inner backdrop-blur-xl group-hover:scale-110 transition-transform overflow-hidden border-2 border-white/20">
                  <img src={currentTierConfig.charImg} alt="Tier Icon" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <Badge className="bg-primary text-obsidian border-none font-black text-[10px] tracking-widest uppercase px-3 py-1">Lifecare OS</Badge>
                    <span className={`text-lg md:text-xl font-black uppercase tracking-tighter ${currentTierConfig.color}`}>{membershipLevel} v2.5</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">나의 회복 기록, 영구 보관하기</h3>
                  <p className="text-white/40 text-xs md:text-sm font-bold">기록이 사라지지 않게 저장하고 전문가의 심층 분석을 받아보세요.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white text-obsidian px-6 py-3 md:px-8 md:py-4 rounded-2xl font-black text-sm md:text-base group-hover:bg-primary group-hover:text-white transition-all shadow-xl group-hover:scale-105 group-hover:border group-hover:border-white/20">
                멤버십 혜택 확인하기 <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Existing Survey Report */}
      {surveyReport && (
        <section className="container mx-auto max-w-5xl px-4 pt-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-white border-2 border-primary/20 rounded-[24px] md:rounded-[40px] p-5 md:p-10 shadow-2xl shadow-primary/5 relative overflow-hidden group hover:border-primary transition-all">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 group-hover:bg-primary/10 transition-colors" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-10">
              <div className="flex items-center gap-4 md:gap-8">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-primary/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-3xl md:text-4xl shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  {surveyReport.status === 'proposed' ? '🎁' : '📈'}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary text-white border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">Analysis Report</Badge>
                    <span className="text-[10px] text-slate font-black uppercase tracking-widest opacity-60">Update: {new Date(surveyReport.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl md:text-3xl font-black text-obsidian tracking-tighter italic font-serif leading-tight">
                    {surveyReport.status === 'new' && '나의 Youniqle 맞춤 솔루션 확인'}
                    {surveyReport.status === 'analyzed' && '네비게이터 리포트 분석 완료'}
                    {surveyReport.status === 'proposed' && '맞춤 제안 상품이 도착했습니다!'}
                    {surveyReport.status === 'converted' && '회복 플랜 진행 중'}
                  </h3>
                  <p className="text-slate font-medium text-sm md:text-base leading-relaxed max-w-xl">
                    {surveyReport.status === 'new' && '설문과 스캔 데이터를 바탕으로 도출된 AI 맞춤 솔루션 리포트가 준비되어 있습니다.'}
                    {surveyReport.status === 'analyzed' && '분석이 완료되었습니다. 조만간 가장 적합한 프로그램을 제안해 드릴 예정입니다.'}
                    {surveyReport.status === 'proposed' && '고객님께만 드리는 특별 구성 상품이 도착했습니다. 지금 바로 상세 내용을 확인해 보세요.'}
                    {surveyReport.status === 'converted' && '유니클 전문가와 함께 건강한 회복 여정을 이어가고 있습니다.'}
                  </p>
                </div>
              </div>
              <Button asChild className="h-12 px-6 text-sm md:h-16 md:px-10 md:text-lg bg-obsidian text-white rounded-2xl font-black shadow-xl hover:bg-obsidian/90 hover:scale-105 transition-all shrink-0">
                <Link href="/ai-navigator">
                  {surveyReport.status === 'proposed' ? '제안 확인하기' : '상세 보기'}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}


      <section className="bg-white border-b border-line py-8 px-4 md:py-16">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-10 items-stretch">
            <div className="space-y-8">
              <div className="flex items-center gap-4 md:gap-8">
                <div className={`w-24 h-24 md:w-40 md:h-40 rounded-full ${levelInfo.bg} flex items-center justify-center shadow-2xl border-4 border-white animate-in zoom-in-50 duration-500 overflow-hidden relative group`}>
                  <img 
                    src={levelInfo.charImg} 
                    alt={levelInfo.level} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`text-lg md:text-2xl font-black ${levelInfo.color}`}>{levelInfo.level}</span>
                    <Badge className="bg-obsidian text-mist border-none text-[10px] px-3 py-1 uppercase tracking-widest font-black">Rhythm Flow v2</Badge>
                    <Link href="/archive">
                      <Badge variant="outline" className="border-primary/30 text-primary text-[10px] px-3 py-1 uppercase tracking-widest font-black hover:bg-primary/10 transition-colors cursor-pointer">
                        <Archive className="w-3 h-3 mr-1.5" />
                        보관함 자산: {(assetStats?.precisionDiagnosis || 0) + (assetStats?.dailyRhythmLog || 0) + (assetStats?.scannerAnalysis || 0) + (assetStats?.toolkitUsage || 0) + (assetStats?.consultations || 0) + (assetStats?.reports || 0)}건
                      </Badge>
                    </Link>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-obsidian tracking-tighter flex items-baseline gap-3">
                    {displayScore}
                    <span className="text-sm md:text-xl font-bold opacity-20 tracking-normal uppercase">Recovery Score</span>
                  </h2>

                  {/* Asset-driven Status visualization */}
                  <div className="pt-2 md:pt-4 flex items-center gap-6 md:gap-10">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate uppercase tracking-widest opacity-40">리듬체크 자산</p>
                      <p className="text-sm md:text-xl font-black text-obsidian">{assetStats?.totalInsights || 0} <span className="text-[10px] opacity-30">PT</span></p>
                    </div>
                    <div className="w-px h-8 bg-line" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate uppercase tracking-widest opacity-40">나의 회복 등급</p>
                      <p className="text-sm md:text-xl font-black text-primary">TRUSTED</p>
                    </div>
                    <div className="hidden md:block w-px h-8 bg-line" />
                    <div className="hidden md:block space-y-1">
                      <p className="text-[10px] font-black text-slate uppercase tracking-widest opacity-40">최근 업데이트</p>
                      <p className="text-sm md:text-base font-black text-obsidian/60">방금 전</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="premium-card p-5 md:p-8 bg-mist/30 rounded-[20px] md:rounded-[32px] border border-line">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-slate uppercase tracking-widest">Active Streak</span>
                    <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">🔥</span>
                  </div>
                  <p className="text-xl md:text-3xl font-black text-obsidian">{streak}일 연속</p>
                  <p className="text-xs text-slate font-medium mt-1">당신의 회복 속도가 일정해지고 있습니다.</p>
                </div>
                <Link href="/membership" className="premium-card p-5 md:p-8 bg-mist/30 rounded-[20px] md:rounded-[32px] border border-line hover:border-primary/50 transition-all group/tier">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-slate uppercase tracking-widest">Membership Tier</span>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover/tier:scale-110 transition-transform overflow-hidden border border-line">
                      <img src={currentTierConfig.charImg} alt="Tier Icon" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className={`text-xl md:text-3xl font-black uppercase tracking-tighter ${currentTierConfig.color}`}>{membershipLevel}</p>
                      <p className="text-xs text-slate font-medium mt-1">{currentTierConfig.message}</p>
                    </div>
                    <div className="text-[10px] font-black text-primary uppercase tracking-widest group-hover/tier:translate-x-1 transition-transform flex items-center gap-1">
                      UPGRADE <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </div>

              {/* 🎯 오늘의 실천 루틴 (Action Protocol) - NEW */}
              <div id="today-routines" className="bg-white border-2 border-primary/20 rounded-[32px] p-8 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16" />
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-obsidian tracking-tight flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      오늘의 회복 루틴 <span className="text-[10px] text-slate/40 font-bold uppercase tracking-widest ml-2">Protocol</span>
                    </h3>
                    <Badge className="bg-primary text-white border-none text-[10px] font-black px-3">AI 최적화</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(insights.posture?.habits || todayRoutines).slice(0, 3).map((routine: string, i: number) => {
                      const isDone = unifiedData.completedRoutines?.includes(routine);
                      return (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/user/complete-routine', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ routineId: routine })
                              });
                              if (res.ok) {
                                window.location.reload(); // Quick sync
                              }
                            } catch (err) {
                              console.error('Failed to complete routine:', err);
                            }
                          }}
                          className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                            isDone 
                              ? 'bg-primary/10 border-primary shadow-inner' 
                              : 'bg-mist/30 border-line hover:border-primary/30'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                            isDone ? 'bg-primary text-white' : 'bg-white text-slate'
                          }`}>
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <span className={`text-xs md:text-sm font-black text-left ${isDone ? 'text-primary' : 'text-obsidian'}`}>
                            {routine}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate/40 font-bold text-center">미션을 모두 완료하면 일일 리듬체크리스트가 자동으로 채워집니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 7-Day Recovery Flow Section (D6-7) */}
      <section className="container mx-auto px-4 py-16 max-w-5xl">
        <FlowTimeline data={flowData} currentDay={currentJourneyDay} />
      </section>

      {/* 🔵 Actionable Insights Section - NEW */}
      {(insights.posture || insights.meal) && (
        <section className="container mx-auto px-4 pt-16 max-w-5xl space-y-8">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-black text-obsidian tracking-tight">🎯 지능형 회복 가이드</h2>
            <Badge variant="outline" className="border-chapter-accent text-chapter-accent font-black">유니클 개인화</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {insights.posture && (
              <ActionableInsightCard type="posture" insight={insights.posture} />
            )}
            {insights.meal && (
              <div className="space-y-8">
                <ActionableInsightCard type="meal" insight={insights.meal} />
                <MealNutrientChart
                  nutrients={insights.meal.nutrients}
                  advice={insights.meal.suggestion}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Realtime Activity Banner */}
      <section className="container mx-auto px-4 pt-16 max-w-5xl">
        <RealtimeActivityBanner className="mb-12" />
      </section>

      {/* Action Buttons Section */}
      <section className="container mx-auto px-4 pb-12 max-w-5xl">
        <div className="flex flex-wrap gap-6 justify-center">
          <Button
            size="lg"
            className="bg-obsidian text-background font-black rounded-[24px] h-20 px-12 shadow-2xl hover:scale-105 transition-transform text-lg italic tracking-widest flex flex-col items-center justify-center gap-0"
            onClick={() => window.location.href = '/diagnosis?type=daily'}
          >
            <span className="text-[10px] text-reward-gold not-italic tracking-[0.2em] mb-1">RECOVER YOUR RHYTHM</span>
            오늘의 리듬체크 시작
          </Button>
          
          {(userTier === 'RESTART' || userTier === 'BLACK') && (
            <Button
              onClick={onOpenWebtoon}
              className="flex items-center gap-4 px-10 h-20 rounded-[24px] bg-white border border-line text-obsidian font-black cursor-pointer hover:bg-mist/10 transition-all shadow-xl group"
            >
              <span className="text-3xl group-hover:rotate-12 transition-transform">🎨</span>
              <div className="text-left">
                <p className="text-[10px] opacity-40 uppercase font-black">Daily Content</p>
                <p className="text-lg">웹툰 챌린지 시작하기</p>
              </div>
            </Button>
          )}
        </div>
      </section>

      {/* Daily Checklist */}
      <section className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded-[48px] shadow-sm border border-line p-5 md:p-12">
          <div className="flex justify-between items-end mb-6 md:mb-12">
            <div>
              <h2 className="text-xl md:text-3xl font-black text-obsidian tracking-tight mb-2">✅ 일일 리듬체크리스트</h2>
              <p className="text-sm text-slate font-medium">매일의 작은 기록이 당신의 등급을 결정합니다.</p>
            </div>
            <div className="text-right">
              <div className="text-3xl md:text-5xl font-black text-chapter-accent">{checklistProgress.completed}<span className="text-lg md:text-xl opacity-20">/{checklistProgress.total}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tierChecklist.map((item, idx) => {
                const isChecked = progress?.todayChecklist?.[item.id as keyof typeof progress.todayChecklist];
                const accentColors = ['text-status-good', 'text-chapter-accent', 'text-blue-500', 'text-reward-gold', 'text-emerald-500', 'text-purple-500', 'text-pink-500', 'text-cyan-500'];
                const bgColors = ['bg-status-good', 'bg-chapter-accent', 'bg-blue-500', 'bg-reward-gold', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500'];
                const borderColors = ['border-status-good/20', 'border-chapter-accent/20', 'border-blue-500/20', 'border-reward-gold/20', 'border-emerald-500/20', 'border-purple-500/20', 'border-pink-500/20', 'border-cyan-500/20'];
                const hoverBorderColors = ['hover:border-status-good', 'hover:border-chapter-accent', 'hover:border-blue-500', 'hover:border-reward-gold', 'hover:border-emerald-500', 'hover:border-purple-500', 'hover:border-pink-500', 'hover:border-cyan-500'];
                const colorIdx = idx % accentColors.length;

                return (
                    <div
                        key={item.id}
                        className={`flex items-center justify-between p-4 md:p-8 rounded-[20px] md:rounded-[32px] border transition-all hover:shadow-lg cursor-pointer ${
                            isChecked 
                                ? `${bgColors[colorIdx]}/5 ${borderColors[colorIdx]}` 
                                : `bg-mist/30 border-line ${hoverBorderColors[colorIdx]}`
                        }`}
                        onClick={() => handleChecklistItemClick(item.id, !!isChecked)}
                    >
                        <div className="flex items-center gap-3 md:gap-5">
                            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-sm overflow-hidden transition-all ${
                                isChecked ? `${bgColors[colorIdx]} border-2 border-white` : 'bg-white border border-line'
                            }`}>
                                {isChecked ? (
                                    <span className="text-white text-lg font-black">✓</span>
                                ) : (
                                    <img src={item.charImg} alt={item.label} className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-black text-obsidian">{item.label}</h3>
                                <p className="text-xs text-slate font-medium">
                                    {isChecked ? '미션 완료! 포인트 적립됨' : '미션 수행하러 가기'}
                                </p>
                            </div>
                        </div>
                        <span className={`text-sm font-black ${accentColors[colorIdx]}`}>+{item.points}pt</span>
                    </div>
                );
            })}
          </div>
        </div>
      </section>

      {/* AI Manager Insight Section */}
      <section id="ai-insights" className="container mx-auto px-4 pb-8 max-w-5xl">
        <Card className="bg-white border border-line rounded-[48px] overflow-hidden shadow-sm hover:shadow-xl transition-all">
          <CardContent className="p-5 md:p-12 flex flex-col md:flex-row items-center gap-4 md:gap-12">
            <div className="w-20 h-20 md:w-32 md:h-32 bg-mist rounded-[24px] md:rounded-[40px] flex items-center justify-center shadow-inner shrink-0 animate-in fade-in duration-700 overflow-hidden border border-line/50">
              <img 
                src="/images/characters/char_dday.png" 
                alt="Youniqle Manager" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <h3 className="font-black text-xl md:text-3xl text-obsidian tracking-tight">유니클 매니저 리포트</h3>
                <Badge className="bg-chapter-accent text-mist border-none text-[10px] font-black tracking-widest uppercase px-3 py-1">
                  {userTier === 'BLACK' ? 'Black Exclusive' : userTier === 'RESTART' ? 'Premium Intelligence' : 'Basic Analysis'}
                </Badge>
              </div>
              <p className="text-sm md:text-xl text-slate font-medium leading-relaxed italic opacity-80">
                {userTier === 'BLACK' || userTier === 'RESTART'
                  ? `"${displayScore >= 70 
                      ? '회복 패턴이 매우 안정적입니다. 근육 미세 이완을 위해 사운드 테라피 비중을 20% 높이고, 수면 전 호흡 프로토콜을 추가해 보세요. 현재 추세라면 2주 내 최적 컨디션 도달이 예상됩니다.' 
                      : '회복 지수가 임계점에 근접했습니다. 자세 교정 프로토콜(주 3회)과 단백질 섭취(체중 1kg당 1.2g)를 강력히 권장합니다. 수면 패턴 분석 결과, 취침 시간을 30분 앞당기면 회복 효율이 15% 향상됩니다.'}"` 
                  : `"${displayScore >= 70 
                      ? '당신의 회복 패턴은 안정적입니다. 사운드 테라피의 비중을 높여보세요.' 
                      : '회복 지수가 임계점에 근접했습니다. 자세 교정과 단백질 섭취를 권장합니다.'}"` 
                }
              </p>
              {(userTier === 'RESET' || userTier === 'REBORN' || userTier === 'NONE') && (
                <p className="mt-4 text-xs text-slate/40 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3 opacity-50" />
                  기본 분석 리포트 제공 중 (리스타트 등급 이상에서 정밀 수치 데이터가 활성화됩니다)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recommended Utilities Section */}
      <section className="container mx-auto px-4 pb-20 max-w-5xl">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-xl md:text-3xl font-black italic text-obsidian tracking-tight">
            RECOMMENDED <span className="text-chapter-accent">ACTIVE TOOLS</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {[
            { label: '사운드 테라피 (Sound)', desc: '바이오 뇌파 동기화 및 심층 회복', icon: '🎧', href: '/?tool=sound', color: 'blue' },
            { label: '자세 분석 (Posture)', desc: '유니클 기반 실시간 신체 밸런스 측정', icon: '🧘', href: '/utils?tool=posture', color: 'emerald' },
            { label: '센서리 스캐너 (Scan)', desc: '공간 분위기 및 식단 영양 분석', icon: '🍱', href: '/utils/food-scanner', color: 'reward-gold' }
          ].map((tool) => (
            <Link key={tool.href} href={tool.href} className="group">
              <div className="bg-white border border-line rounded-[24px] md:rounded-[40px] p-5 md:p-10 hover:shadow-2xl transition-all flex flex-col items-center text-center h-full relative overflow-hidden">
                <div className="w-14 h-14 md:w-24 md:h-24 bg-mist rounded-[20px] md:rounded-[32px] mb-4 md:mb-8 flex items-center justify-center text-3xl md:text-5xl group-hover:scale-110 transition-transform shadow-inner">
                  {tool.icon}
                </div>
                <h3 className="text-lg md:text-2xl font-black text-obsidian mb-2 md:mb-3">{tool.label}</h3>
                <p className="text-sm text-slate font-medium mb-8 leading-relaxed opacity-60">{tool.desc}</p>
                <div className="mt-auto text-xs font-black tracking-[0.2em] uppercase opacity-40 group-hover:opacity-100 group-hover:text-chapter-accent transition-all">Launch Protocol &gt;</div>
              </div>
            </Link>
          ))}
        </div>
      </section>


      <section className="container mx-auto px-4 pb-24 max-w-5xl">
        <h2 className="text-xl md:text-2xl font-black text-obsidian mb-10 tracking-tight">System Navigation</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: '리듬체크', href: '/ai-navigator', icon: <MessageSquare className="w-5 h-5 md:w-6 md:h-6" /> },
            { label: '면담 가이드', href: activeMedicalGuide ? `/event/consultation/report/${activeMedicalGuide._id}` : '/event/consultation', icon: <ClipboardList className="w-5 h-5 md:w-6 md:h-6" /> },
            { label: '회복 로드맵', href: activeRecoveryPlan ? `/event/post-care/report/${activeRecoveryPlan._id}` : '/event/post-care', icon: <HeartPulse className="w-5 h-5 md:w-6 md:h-6" /> },
            { label: '스캔 타임라인', href: '/timeline', icon: <Activity className="w-5 h-5 md:w-6 md:h-6" /> },
          ].map((link) => (
            <Link key={link.label} href={link.href} className="group">
              <div className="bg-white border border-line rounded-[16px] md:rounded-[24px] p-4 md:p-6 flex flex-col md:flex-row items-center gap-3 md:gap-5 hover:border-chapter-accent hover:shadow-md transition-all text-center md:text-left">
                <div className="text-xl md:text-2xl group-hover:scale-125 transition-transform text-slate">
                  {link.icon}
                </div>
                <span className="font-bold text-obsidian group-hover:text-chapter-accent transition-colors">{link.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* 🎁 Moved Reward Pool Section */}
        {/* 🎁 Reward Pool Section - HIDDEN FOR MVP PHASE */}
        {/* <div className="mt-12 ..."> ... </div> */}
      </section>

      <Dialog open={showDiagnosisModal} onOpenChange={setShowDiagnosisModal}>
        <DialogContent className="max-w-xl p-6 overflow-y-auto max-h-[90vh] border-none rounded-[40px] shadow-2xl bg-white">
          <DialogHeader className="sr-only">
            <DialogTitle>1일 리듬체크</DialogTitle>
            <DialogDescription>데이터 기반으로 설계하는 나만의 일상 리듬</DialogDescription>
          </DialogHeader>
          <DiagnosisForm questions={diagnosisQuestions} onComplete={handleDiagnosisComplete} />
        </DialogContent>
      </Dialog>

      {/* 🎁 D3 미니 보상 팝업 - NEW */}
      <Dialog open={showD3Reward} onOpenChange={setShowD3Reward}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-[40px] shadow-2xl bg-surface">
          <div className="bg-obsidian p-10 text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-4xl shadow-2xl backdrop-blur-xl animate-bounce-slow">
                ✨
              </div>
              <div className="space-y-2">
                <Badge className="bg-primary text-obsidian border-none text-[10px] font-black px-3 py-1 uppercase tracking-widest">Day 03 Complete</Badge>
                <h2 className="text-3xl font-black text-white tracking-tighter">패턴이 보이기 시작했습니다</h2>
              </div>
              <p className="text-white/60 text-sm font-medium leading-relaxed break-keep">
                벌써 3일째입니다. 당신의 저녁 이후 피로와 감정 흔들림이 함께 나타나는 흐름이 보이기 시작했습니다. 7일 완주까지 조금만 더 힘내세요!
              </p>
              <Button 
                onClick={() => setShowD3Reward(false)}
                className="w-full h-16 bg-primary text-obsidian rounded-[20px] font-black text-lg hover:scale-105 transition-transform shadow-xl shadow-primary/20"
              >
                내 흐름 계속 보기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* 💎 D3 Reward Modal */}
      <Dialog open={showD3Reward} onOpenChange={setShowD3Reward}>
        <DialogContent className="max-w-md bg-mist border-none rounded-[40px] overflow-hidden p-0">
          <div className="relative p-10 text-center space-y-6">
            <div className="absolute inset-0 bg-gradient-to-b from-reward-gold/20 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl mb-6 animate-bounce-slow">
                <span className="text-5xl">💎</span>
              </div>
              <h2 className="text-3xl font-black text-obsidian tracking-tighter italic">D3: 패턴의 발견</h2>
              <p className="text-slate font-medium leading-relaxed break-keep mt-4">
                축하합니다! 3일간의 꾸준한 기록으로 당신만의 회복 리듬이 보이기 시작했습니다. 
                <br /><span className="text-chapter-accent font-black">패턴 분석 리포트</span>가 잠금 해제되었습니다.
              </p>
              <Button 
                onClick={() => setShowD3Reward(false)}
                className="w-full h-16 rounded-2xl bg-obsidian text-white font-black mt-8 shadow-xl"
              >
                리포트 확인하기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🏁 D7 Weekly Summary Card (Visible only on Day 7) */}
      {currentJourneyDay === 7 && (
        <Dialog defaultOpen={true}>
          <DialogContent className="max-w-md bg-obsidian border-none rounded-[40px] overflow-hidden p-0 text-white">
            <div className="p-10 text-center space-y-8">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                <Crown className="w-10 h-10 text-reward-gold" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-black text-reward-gold uppercase tracking-[0.3em]">Weekly Completion</span>
                <h2 className="text-4xl font-black italic tracking-tighter font-serif">당신의 일주일은<br />아름다웠습니다</h2>
              </div>
              <p className="text-mist/60 text-sm leading-relaxed break-keep">
                7일간의 기록을 통해 총 <span className="text-white font-bold">12개의 회복 시그널</span>을 발견했습니다. 
                당신의 회복력은 이전보다 <span className="text-reward-gold font-bold">24% 향상</span>된 것으로 분석됩니다.
              </p>
              <div className="pt-4 grid grid-cols-1 gap-3">
                <Button className="w-full h-14 rounded-xl bg-reward-gold text-obsidian font-black">
                  7일 완주 증명서 받기
                </Button>
                <Button variant="ghost" className="text-white/40 hover:text-white">
                  다음에 할게요
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// helper
function getLevelInfo(score: number) {
  if (score >= 70) return { level: 'ECO-ZENITH', bg: 'bg-[#E3F2ED]', color: 'text-[#0E3A3A]', charImg: '/images/characters/char_breathing.png' };
  if (score >= 40) return { level: 'RECOVERY-MID', bg: 'bg-[#FFF8E6]', color: 'text-[#D4AF37]', charImg: '/images/characters/char_stretch.png' };
  return { level: 'DEEP-SURGE', bg: 'bg-[#FCECEE]', color: 'text-[#E11D48]', charImg: '/images/characters/char_compress.png' };
}
