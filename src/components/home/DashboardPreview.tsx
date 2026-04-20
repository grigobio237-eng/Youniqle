import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Music, Scan, Layout, Sparkles, Activity } from 'lucide-react';
import RealtimeActivityBanner from '@/components/social/RealtimeActivityBanner';
import DiagnosisBasedRecommendations from '@/components/personalization/DiagnosisBasedRecommendations';
import HabitAlertBanner from '@/components/home/HabitAlertBanner';
import MealNutrientChart from '@/components/dashboard/MealNutrientChart';
import ActionableInsightCard from '@/components/dashboard/ActionableInsightCard';
import { getUserProgress, getChecklistProgress, updateChecklist } from '@/lib/progress';
import { ClipboardList, Stethoscope, HeartPulse, MessageSquare } from 'lucide-react';

interface DashboardPreviewProps {
  unifiedData: any;
  onOpenWebtoon: () => void;
}

export default function DashboardPreview({ unifiedData, onOpenWebtoon }: DashboardPreviewProps) {
  const [progress, setProgress] = React.useState<any>(null);
  const [checklistProgress, setChecklistProgress] = React.useState({ completed: 0, total: 4, percentage: 0 });
  const [isRecoveryActive, setIsRecoveryActive] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setProgress(getUserProgress());
      setChecklistProgress(getChecklistProgress());
      setIsRecoveryActive(localStorage.getItem('recovery_mode') === 'active');
    }
  }, []);

  const handleChecklistItem = (item: string, points: number) => {
    const updated = updateChecklist(item as any, points);
    setProgress(updated);
    setChecklistProgress(getChecklistProgress());
  };

  const { score, insights, recentActivity, user, surveyReport, activeMedicalGuide, activeRecoveryPlan } = unifiedData;
  const displayScore = score.totalScore;
  const levelInfo = getLevelInfo(displayScore);

  // Constants for membership etc. (could also come from unifiedData)
  const streak = progress?.currentStreak || 1;
  const totalPoints = progress?.totalPoints || 5;
  const membershipLevel = user.passInfo?.type !== 'NONE' ? user.passInfo.type : 'GATE';
  const pointsToNext = 100 - (totalPoints % 100);

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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
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

      {/* 🏥 Medical Consultation Guide Section - NEW */}
      {activeMedicalGuide && (
        <section className="container mx-auto max-w-5xl px-4 pt-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="bg-white border-2 border-chapter-accent/30 rounded-[40px] p-10 shadow-2xl shadow-chapter-accent/5 relative overflow-hidden group hover:border-chapter-accent transition-all">
                <div className="absolute top-0 right-0 w-48 h-48 bg-chapter-accent/5 rounded-full blur-3xl -mr-24 -mt-24" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-chapter-accent/10 rounded-3xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                            🏥
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <Badge className="bg-chapter-accent text-white border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">Pre-Procedure Guide</Badge>
                                <span className="text-[10px] text-slate font-black uppercase tracking-widest opacity-60">Status: Intelligence Ready</span>
                            </div>
                            <h3 className="text-3xl font-black text-obsidian tracking-tighter italic font-serif leading-tight">
                                병원 방문 필수 가이드가 도착했습니다
                            </h3>
                            <p className="text-slate font-medium text-base leading-relaxed max-w-xl">
                                AI가 설계한 {activeMedicalGuide.medicalCategory === 'PLASTIC' ? '성형/피부' : '전문의'} 상담 전용 리포트입니다. 의료진에게 질문해야 할 최적의 목록을 확인하세요.
                            </p>
                        </div>
                    </div>
                    <Button asChild className="h-16 px-10 bg-chapter-accent text-white rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all shrink-0">
                        <Link href={`/event/consultation/report/${activeMedicalGuide._id}`}>
                           가이드 보기
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
      )}

      {/* 🚀 Post-Care Recovery Plan Section - NEW */}
      {activeRecoveryPlan && (
        <section className="container mx-auto max-w-5xl px-4 pt-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="bg-obsidian border-2 border-primary/30 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group hover:border-primary transition-all">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -mr-24 -mt-24" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                            🩹
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <Badge className="bg-primary text-obsidian border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">Recovery Roadmap</Badge>
                                <span className="text-[10px] text-mist font-black uppercase tracking-widest opacity-60">Tracking: Active Phase</span>
                            </div>
                            <h3 className="text-3xl font-black text-mist tracking-tighter italic font-serif leading-tight">
                                1:1 개인화 회복 로드맵
                            </h3>
                            <p className="text-mist/70 font-medium text-base leading-relaxed max-w-xl">
                                {activeRecoveryPlan.procedureType} 후 집중 관리가 필요한 단계입니다. AI 리커버리 전문가가 제안하는 일자별 회복 가이드를 따라보세요.
                            </p>
                        </div>
                    </div>
                    <Button asChild className="h-16 px-10 bg-primary text-obsidian rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all shrink-0">
                        <Link href={`/event/post-care/report/${activeRecoveryPlan._id}`}>
                           로드맵 열기
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
      )}

      {/* Existing Survey Report */}
      {surveyReport && (
        <section className="container mx-auto max-w-5xl px-4 pt-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="bg-white border-2 border-primary/20 rounded-[40px] p-10 shadow-2xl shadow-primary/5 relative overflow-hidden group hover:border-primary transition-all">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 group-hover:bg-primary/10 transition-colors" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform">
                            {surveyReport.status === 'proposed' ? '🎁' : '📈'}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <Badge className="bg-primary text-white border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">Analysis Report</Badge>
                                <span className="text-[10px] text-slate font-black uppercase tracking-widest opacity-60">Update: {new Date(surveyReport.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-3xl font-black text-obsidian tracking-tighter italic font-serif leading-tight">
                                {surveyReport.status === 'new' && '나의 회복 솔루션 설계 중...'}
                                {surveyReport.status === 'analyzed' && '네비게이터 리포트 분석 완료'}
                                {surveyReport.status === 'proposed' && '맞춤 제안 상품이 도착했습니다!'}
                                {surveyReport.status === 'converted' && '회복 플랜 진행 중'}
                            </h3>
                            <p className="text-slate font-medium text-base leading-relaxed max-w-xl">
                                {surveyReport.status === 'new' && '네비게이터가 고객님의 설문 데이터를 바탕으로 정밀 솔루션을 설계하고 있습니다. 잠시만 기다려 주세요.'}
                                {surveyReport.status === 'analyzed' && '분석이 완료되었습니다. 조만간 가장 적합한 프로그램을 제안해 드릴 예정입니다.'}
                                {surveyReport.status === 'proposed' && '고객님께만 드리는 특별 구성 상품이 도착했습니다. 지금 바로 상세 내용을 확인해 보세요.'}
                                {surveyReport.status === 'converted' && '유니클 전문가와 함께 건강한 회복 여정을 이어가고 있습니다.'}
                            </p>
                        </div>
                    </div>
                    <Button asChild className="h-16 px-10 bg-obsidian text-white rounded-2xl font-black text-lg shadow-xl hover:bg-obsidian/90 hover:scale-105 transition-all shrink-0">
                        <Link href="/ai-navigator">
                           {surveyReport.status === 'proposed' ? '제안 확인하기' : '상세 보기'}
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
      )}

      {/* Top Status Card - Enhanced with Composite Score */}
      <section className="bg-white border-b border-line py-16 px-4 shadow-sm">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center gap-8">
                <div className={`w-36 h-36 rounded-[48px] ${levelInfo.bg} flex items-center justify-center text-6xl shadow-xl border border-line animate-in zoom-in-50 duration-500`}>
                  {levelInfo.char}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl font-black ${levelInfo.color}`}>{levelInfo.level}</span>
                    <Badge className="bg-obsidian text-mist border-none text-[10px] px-3 py-1 uppercase tracking-widest font-black">Unified Score v2</Badge>
                  </div>
                  <h2 className="text-6xl font-black text-obsidian tracking-tighter flex items-baseline gap-3">
                    {displayScore} 
                    <span className="text-xl font-bold opacity-20 tracking-normal">OVERALL SCORE</span>
                  </h2>
                  
                  {/* Score Breakdown visualization */}
                  <div className="pt-4 flex items-center gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate uppercase tracking-widest opacity-40">Diagnosis (70%)</p>
                      <p className="font-black text-obsidian">{score.diagnosisScore} <span className="text-[10px] opacity-30">PT</span></p>
                    </div>
                    <div className="w-px h-8 bg-line" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate uppercase tracking-widest opacity-40">Scans (30%)</p>
                      <p className="font-black text-obsidian">{score.scanScore} <span className="text-[10px] opacity-30">PT</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="premium-card p-8 bg-mist/30 rounded-[32px] border border-line">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-slate uppercase tracking-widest">Active Streak</span>
                    <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">🔥</span>
                  </div>
                  <p className="text-3xl font-black text-obsidian">{streak}일 연속</p>
                  <p className="text-xs text-slate font-medium mt-1">당신의 회복 속도가 일정해지고 있습니다.</p>
                </div>
                <div className="premium-card p-8 bg-mist/30 rounded-[32px] border border-line">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-slate uppercase tracking-widest">Membership Tier</span>
                    <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">🎖️</span>
                  </div>
                  <p className="text-3xl font-black text-obsidian uppercase tracking-tighter">{membershipLevel}</p>
                  <p className="text-xs text-slate font-medium mt-1">다음 회복 보상까지 {pointsToNext}pt</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-obsidian text-mist rounded-[48px] p-10 flex flex-col justify-between shadow-3xl relative overflow-hidden">
               <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-reward-gold/10 rounded-full blur-2xl" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 opacity-60 flex items-center gap-2">
                   <Sparkles className="w-3 h-3 text-reward-gold" /> Reward Pool
                </h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-4xl font-black tracking-tighter">{totalPoints} <span className="text-sm font-bold opacity-60 tracking-normal">RECOVERY PT</span></span>
                  </div>
                  <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden p-1 border border-white/10">
                    <motion.div
                      className="bg-reward-gold h-full rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(totalPoints % 100) || 100}%` }}
                      transition={{ duration: 2, ease: "circOut" }}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-3 mt-10">
                <Button asChild className="w-full h-15 bg-reward-gold text-obsidian font-black rounded-2xl hover:bg-reward-gold/90 transition-all">
                  <Link href="/membership">포인트 샵 바로가기</Link>
                </Button>
                <p className="text-[10px] text-center opacity-30 font-bold uppercase tracking-widest">Protocol Version ALPHA-237</p>
              </div>
            </div>
          </div>
        </div>
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
                className="bg-obsidian text-background font-black rounded-[24px] h-20 px-12 shadow-2xl hover:scale-105 transition-transform text-lg italic tracking-widest"
                onClick={() => window.location.href = '/?action=diagnose'}
              >
                진단 업데이트
              </Button>
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
        </div>
      </section>

      {/* Daily Checklist */}
      <section className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded-[48px] shadow-sm border border-line p-12">
          <div className="flex justify-between items-end mb-12">
            <div>
                <h2 className="text-3xl font-black text-obsidian tracking-tight mb-2">✅ 일일 회복 체크리스트</h2>
                <p className="text-sm text-slate font-medium">매일의 작은 기록이 당신의 등급을 결정합니다.</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-chapter-accent">{checklistProgress.completed}<span className="text-xl opacity-20">/{checklistProgress.total}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/?action=diagnose" className={`flex items-center justify-between p-8 rounded-[32px] border transition-all hover:shadow-lg ${progress?.todayChecklist?.diagnosis ? 'bg-status-good/5 border-status-good/20' : 'bg-mist/30 border-line hover:border-status-good'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm text-lg font-black ${progress?.todayChecklist?.diagnosis ? 'bg-status-good text-mist' : 'bg-white text-slate border border-line'}`}>
                  {progress?.todayChecklist?.diagnosis ? '✓' : '01'}
                </div>
                <div>
                  <h3 className="font-black text-obsidian">정밀 진단</h3>
                  <p className="text-xs text-slate font-medium">데이터 기반 상태 체크</p>
                </div>
              </div>
              <span className="text-sm font-black text-status-good">+5pt</span>
            </Link>

            <Link href="/ai-navigator" onClick={() => !progress?.todayChecklist?.aiAdvice && handleChecklistItem('aiAdvice', 3)} className={`flex items-center justify-between p-8 rounded-[32px] border transition-all hover:shadow-lg ${progress?.todayChecklist?.aiAdvice ? 'bg-chapter-accent/5 border-chapter-accent/20' : 'bg-mist/30 border-line hover:border-chapter-accent'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm text-lg font-black ${progress?.todayChecklist?.aiAdvice ? 'bg-chapter-accent text-mist' : 'bg-white text-slate border border-line'}`}>
                  {progress?.todayChecklist?.aiAdvice ? '✓' : '02'}
                </div>
                <div>
                  <h3 className="font-black text-obsidian">루틴 확인</h3>
                  <p className="text-xs text-slate font-medium">네비게이터 추천 루틴</p>
                </div>
              </div>
              <span className="text-sm font-black text-chapter-accent">+3pt</span>
            </Link>

            <Link href="/therapy/sound" onClick={() => !progress?.todayChecklist?.content && handleChecklistItem('content', 2)} className={`flex items-center justify-between p-8 rounded-[32px] border transition-all hover:shadow-lg ${progress?.todayChecklist?.content ? 'bg-blue-500/5 border-blue-500/20' : 'bg-mist/30 border-line hover:border-blue-500'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm text-lg font-black ${progress?.todayChecklist?.content ? 'bg-blue-500 text-mist' : 'bg-white text-slate border border-line text-blue-500'}`}>
                  {progress?.todayChecklist?.content ? '✓' : '03'}
                </div>
                <div>
                  <h3 className="font-black text-obsidian">사운드 명상</h3>
                  <p className="text-xs text-slate font-medium">바이오 주파수 테라피</p>
                </div>
              </div>
              <span className="text-sm font-black text-blue-500">+2pt</span>
            </Link>

            <Link href="/utils" onClick={() => !progress?.todayChecklist?.utility && handleChecklistItem('utility', 3)} className={`flex items-center justify-between p-8 rounded-[32px] border transition-all hover:shadow-lg ${progress?.todayChecklist?.utility ? 'bg-reward-gold/5 border-reward-gold/20' : 'bg-mist/30 border-line hover:border-reward-gold'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm text-lg font-black ${progress?.todayChecklist?.utility ? 'bg-reward-gold text-white' : 'bg-white text-slate border border-line'}`}>
                  {progress?.todayChecklist?.utility ? '✓' : '04'}
                </div>
                <div>
                  <h3 className="font-black text-obsidian">툴 활성화</h3>
                  <p className="text-xs text-slate font-medium">호흡 및 바이오 가이드</p>
                </div>
              </div>
              <span className="text-sm font-black text-reward-gold">+3pt</span>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Manager Insight Section */}
      <section className="container mx-auto px-4 pb-8 max-w-5xl">
        <Card className="bg-white border border-line rounded-[48px] overflow-hidden shadow-sm hover:shadow-xl transition-all">
          <CardContent className="p-12 flex flex-col md:flex-row items-center gap-12">
            <div className="w-28 h-28 bg-mist rounded-[36px] flex items-center justify-center text-6xl shadow-inner shrink-0 animate-in fade-in duration-700">
              🤖
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <h3 className="font-black text-3xl text-obsidian tracking-tight">유니클 매니저 리포트</h3>
                <Badge className="bg-chapter-accent text-mist border-none text-[10px] font-black tracking-widest uppercase px-3 py-1">Integrated Youniqle Analysis</Badge>
              </div>
              <p className="text-xl text-slate font-medium leading-relaxed italic opacity-80">
                "{displayScore >= 70 ? '당신의 회복 패턴은 안정적입니다. 근육의 미세 이완을 위해 사운드 테라피의 비중을 높여보세요.' : '회복 지수가 임계점에 근접했습니다. 자세 교정 프로토콜과 단백질 섭취를 강력히 권장합니다.'}"
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recommended Utilities Section */}
      <section className="container mx-auto px-4 pb-20 max-w-5xl">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-black italic text-obsidian tracking-tight">
            RECOMMENDED <span className="text-chapter-accent">ACTIVE TOOLS</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: '사운드 테라피 (Sound)', desc: '바이오 뇌파 동기화 및 심층 회복', icon: '🎧', href: '/?tool=sound', color: 'blue' },
            { label: '자세 분석 (Posture)', desc: '유니클 기반 실시간 신체 밸런스 측정', icon: '🧘', href: '/utils?tool=posture', color: 'emerald' },
            { label: '센서리 스캐너 (Scan)', desc: '공간 분위기 및 식단 영양 분석', icon: '🍱', href: '/utils/food-scanner', color: 'reward-gold' }
          ].map((tool) => (
             <Link key={tool.href} href={tool.href} className="group">
                <div className="bg-white border border-line rounded-[40px] p-10 hover:shadow-2xl transition-all flex flex-col items-center text-center h-full relative overflow-hidden">
                    <div className="w-24 h-24 bg-mist rounded-[32px] mb-8 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform shadow-inner">
                        {tool.icon}
                    </div>
                    <h3 className="text-2xl font-black text-obsidian mb-3">{tool.label}</h3>
                    <p className="text-sm text-slate font-medium mb-8 leading-relaxed opacity-60">{tool.desc}</p>
                    <div className="mt-auto text-xs font-black tracking-[0.2em] uppercase opacity-40 group-hover:opacity-100 group-hover:text-chapter-accent transition-all">Launch Protocol &gt;</div>
                </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Diagnosis Based Recommendations (Unified) */}
      <section className="container mx-auto px-4 pb-20 max-w-5xl">
        <DiagnosisBasedRecommendations
          limit={6}
          showProducts={true}
          showProtocols={true}
          showContent={true}
          showCategoryStatus={false}
        />
      </section>

      {/* Quick Links */}
      <section className="container mx-auto px-4 pb-24 max-w-5xl">
        <h2 className="text-2xl font-black text-obsidian mb-10 tracking-tight">System Navigation</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'AI 네비게이터', href: '/ai-navigator', icon: <MessageSquare className="w-6 h-6" /> },
            { label: '면담 가이드', href: activeMedicalGuide ? `/event/consultation/report/${activeMedicalGuide._id}` : '/ai-navigator', icon: <ClipboardList className="w-6 h-6" /> },
            { label: '회복 로드맵', href: activeRecoveryPlan ? `/event/post-care/report/${activeRecoveryPlan._id}` : '/ai-navigator', icon: <HeartPulse className="w-6 h-6" /> },
            { label: '스캔 타임라인', href: '/utils', icon: <Activity className="w-6 h-6" /> },
          ].map((link) => (
            <Link key={link.label} href={link.href} className="group">
              <div className="bg-white border border-line rounded-[24px] p-6 flex items-center gap-5 hover:border-chapter-accent hover:shadow-md transition-all">
                <div className="text-2xl group-hover:scale-125 transition-transform text-slate">
                    {link.icon}
                </div>
                <span className="font-bold text-obsidian group-hover:text-chapter-accent transition-colors">{link.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

// helper
function getLevelInfo(score: number) {
  if (score >= 70) return { level: 'ECO-ZENITH', bg: 'bg-[#E3F2ED] text-[#0E3A3A]', color: 'text-[#0E3A3A]', char: '🌿' };
  if (score >= 40) return { level: 'RECOVERY-MID', bg: 'bg-[#FFF8E6] text-[#D4AF37]', color: 'text-[#D4AF37]', char: '🧘' };
  return { level: 'DEEP-SURGE', bg: 'bg-[#FCECEE] text-[#E11D48]', color: 'text-[#E11D48]', char: '🔋' };
}
