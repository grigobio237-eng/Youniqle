'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Music, Scan, Layout, Sparkles } from 'lucide-react';
import RealtimeActivityBanner from '@/components/social/RealtimeActivityBanner';
import DiagnosisBasedRecommendations from '@/components/personalization/DiagnosisBasedRecommendations';

export default function DashboardPreview({ score, onOpenWebtoon }: { score: number; onOpenWebtoon: () => void }) {
  const [progress, setProgress] = React.useState<any>(null);
  const [checklistProgress, setChecklistProgress] = React.useState({ completed: 0, total: 4, percentage: 0 });

  React.useEffect(() => {
    // Load progress from local storage
    if (typeof window !== 'undefined') {
      const { getUserProgress, getChecklistProgress: getProgress } = require('@/lib/progress');
      const userProgress = getUserProgress();
      const checkProgress = getProgress();
      setProgress(userProgress);
      setChecklistProgress(checkProgress);

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('from') === 'navigator_qr') {
        localStorage.setItem('recovery_mode', 'active');
        localStorage.setItem('recovery_procedure_date', new Date().toISOString());
      }

      const isRecovery = localStorage.getItem('recovery_mode') === 'active';
      setIsRecoveryActive(isRecovery);

      if (!userProgress.todayChecklist.diagnosis) {
        const { updateChecklist } = require('@/lib/progress');
        const updated = updateChecklist('diagnosis', 5);
        setProgress(updated);
        setChecklistProgress(getProgress());
      }
    }
  }, []);

  const [isRecoveryActive, setIsRecoveryActive] = React.useState(false);

  const handleChecklistItem = (item: string, points: number) => {
    if (typeof window !== 'undefined') {
      const { updateChecklist, getChecklistProgress: getProgress } = require('@/lib/progress');
      const updated = updateChecklist(item, points);
      setProgress(updated);
      setChecklistProgress(getProgress());
    }
  };

  const displayScore = score;
  const streak = progress?.currentStreak || 1;
  const totalPoints = progress?.totalPoints || 5;
  const membershipLevel = totalPoints >= 300 ? 'ECHO' : totalPoints >= 100 ? 'NAVIGATOR' : 'GATE';
  const nextLevel = totalPoints >= 300 ? 'OMAKASE' : totalPoints >= 100 ? 'ECHO' : 'NAVIGATOR';
  const pointsToNext = totalPoints >= 300 ? 500 - totalPoints : totalPoints >= 100 ? 300 - totalPoints : 100 - totalPoints;

  const levelInfo = getLevelInfo(displayScore);

  return (
    <div className="min-h-screen pb-20 bg-mist text-obsidian">
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

      {/* Top Status Card */}
      <section className="bg-white border-b border-line py-12 px-4 shadow-sm">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center gap-6">
                <div className={`w-28 h-28 rounded-[32px] ${levelInfo.bg} flex items-center justify-center text-5xl shadow-inner border border-line`}>
                  {levelInfo.char}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-xl font-black ${levelInfo.color}`}>{levelInfo.level}</span>
                    <Badge className="bg-obsidian text-mist border-none text-[10px] px-2 py-0.5 uppercase tracking-tighter">Protocol Active</Badge>
                  </div>
                  <h2 className="text-4xl font-black text-obsidian tracking-tighter">{displayScore} <span className="text-xl font-bold opacity-30">SCORE</span></h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="premium-card p-6 bg-mist/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-slate uppercase tracking-widest">Streak</span>
                    <span className="text-2xl">🔥</span>
                  </div>
                  <p className="text-2xl font-black text-obsidian">{streak}일 연속 기록</p>
                  <p className="text-xs text-slate font-medium mt-1">회복의 관성은 멈추지 않습니다.</p>
                </div>
                <div className="premium-card p-6 bg-mist/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-slate uppercase tracking-widest">Membership</span>
                    <span className="text-2xl">🎖️</span>
                  </div>
                  <p className="text-2xl font-black text-obsidian uppercase tracking-tighter">{membershipLevel}</p>
                  <p className="text-xs text-slate font-medium mt-1">다음 등급까지 {pointsToNext}pt</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 relative z-10">
                <Button 
                  size="lg" 
                  className="bg-obsidian text-background font-black rounded-2xl h-16 px-10 shadow-xl hover:scale-105 transition-transform"
                  onClick={() => window.location.href = '/?action=diagnose'}
                >
                  내 회복 점수 진단하기
                </Button>
                <Button
                  onClick={onOpenWebtoon}
                  className="flex items-center gap-3 px-8 h-16 rounded-2xl bg-white border border-line text-obsidian font-black cursor-pointer hover:bg-mist/10 transition-all shadow-md group h-16"
                >
                  <span className="text-2xl group-hover:rotate-12 transition-transform">🎨</span>
                  1일 웹툰 챌린지 시작하기
                </Button>
              </div>
            </div>

            <div className="lg:col-span-4 bg-obsidian text-mist rounded-[40px] p-8 flex flex-col justify-between shadow-2xl">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 opacity-60">Reward Progress</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-3xl font-black">{totalPoints} <span className="text-sm font-bold opacity-50">PT</span></span>
                    <span className="text-xs font-bold opacity-50 uppercase">{nextLevel} Goal</span>
                  </div>
                  <div className="w-full bg-mist/10 h-2 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-reward-gold h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(totalPoints % 100) || 100}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
              <Button asChild variant="ghost" className="w-full mt-8 border border-mist/20 hover:bg-mist/10 text-mist font-bold rounded-2xl">
                <Link href="/membership">멤버십 혜택 상세보기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Realtime Activity Banner */}
      <section className="container mx-auto px-4 pt-12 max-w-5xl">
        <RealtimeActivityBanner className="mb-8" />
      </section>

      {/* Site Guide Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <SiteGuide />
      </section>

      {/* Daily Goal / Focus Card */}
      <section className="container mx-auto px-4 pb-8 max-w-5xl">
        <div className="bg-obsidian text-mist rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-chapter-accent/20 rounded-full blur-3xl group-hover:bg-chapter-accent/30 transition-colors duration-700" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-mist">
              <span className="text-xs font-black text-reward-gold tracking-[0.3em] uppercase">Target of the Today Protocol</span>
              <h3 className="text-3xl font-black tracking-tight">{levelInfo.char} {displayScore >= 70 ? '활기 유지와 데이터 최적화' : '집중 회복 케어 모드'}</h3>
              <p className="text-mist/60 font-medium">오늘의 미션 {checklistProgress.total}개를 완료하고 회복의 증명을 획득하세요.</p>
            </div>
            <div className="relative">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-mist/10" />
                <motion.circle
                  cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                  className="text-reward-gold"
                  strokeDasharray={251.2}
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 - (251.2 * checklistProgress.percentage) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-mist">
                {checklistProgress.percentage}%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Checklist */}
      <section className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded-[40px] shadow-sm border border-line p-10">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl font-black text-obsidian tracking-tight">✅ 오늘의 체크리스트</h2>
            <div className="text-right">
              <div className="text-3xl font-black text-chapter-accent">{checklistProgress.completed}/{checklistProgress.total}</div>
              <div className="text-xs font-bold text-slate uppercase tracking-widest mt-1">Daily Protocol</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Diagnosis */}
            <div className={`flex items-center justify-between p-6 rounded-[24px] border ${progress?.todayChecklist?.diagnosis ? 'bg-status-good/5 border-status-good/20' : 'bg-mist/30 border-line'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${progress?.todayChecklist?.diagnosis ? 'bg-status-good text-mist' : 'bg-white text-slate border border-line'}`}>
                  {progress?.todayChecklist?.diagnosis ? '✓' : '1'}
                </div>
                <div>
                  <h3 className="font-extrabold text-obsidian">정밀 진단 완료</h3>
                  <p className="text-sm text-slate font-medium">데이터 기반 상태 체크</p>
                </div>
              </div>
              <span className="text-sm font-black text-status-good">+5pt</span>
            </div>

            {/* 2. AI Advice (Navigator) */}
            <Link
              href="/ai-navigator"
              onClick={() => !progress?.todayChecklist?.aiAdvice && handleChecklistItem('aiAdvice', 3)}
              className={`flex items-center justify-between p-6 rounded-[24px] border transition-all hover:shadow-lg ${progress?.todayChecklist?.aiAdvice ? 'bg-chapter-accent/5 border-chapter-accent/20' : 'bg-mist/30 border-line hover:border-chapter-accent'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${progress?.todayChecklist?.aiAdvice ? 'bg-chapter-accent text-mist' : 'bg-white text-slate border border-line'}`}>
                  {progress?.todayChecklist?.aiAdvice ? '✓' : '2'}
                </div>
                <div>
                  <h3 className="font-extrabold text-obsidian">유니클 맞춤 루틴 확인</h3>
                  <p className="text-sm text-slate font-medium">네비게이터의 실시간 분석</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-chapter-accent">+3pt</span>
                <ChevronRight className="w-5 h-5 text-line" />
              </div>
            </Link>

            {/* 3. Sound Therapy (New replacement for cases) */}
            <Link
              href="/therapy/sound"
              onClick={() => !progress?.todayChecklist?.content && handleChecklistItem('content', 2)}
              className={`flex items-center justify-between p-6 rounded-[24px] border transition-all hover:shadow-lg ${progress?.todayChecklist?.content ? 'bg-blue-500/5 border-blue-500/20' : 'bg-mist/30 border-line hover:border-blue-500'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${progress?.todayChecklist?.content ? 'bg-blue-500 text-mist' : 'bg-white text-slate border border-line text-blue-500'}`}>
                  {progress?.todayChecklist?.content ? '✓' : '3'}
                </div>
                <div>
                  <h3 className="font-extrabold text-obsidian">딥 사운드 명상</h3>
                  <p className="text-sm text-slate font-medium">3중 레이어 주파수 테라피</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-blue-500">+2pt</span>
                <ChevronRight className="w-5 h-5 text-line" />
              </div>
            </Link>

            {/* 4. Utility */}
            <Link
              href="/utils"
              onClick={() => !progress?.todayChecklist?.utility && handleChecklistItem('utility', 3)}
              className={`flex items-center justify-between p-6 rounded-[24px] border transition-all hover:shadow-lg ${progress?.todayChecklist?.utility ? 'bg-reward-gold/5 border-reward-gold/20' : 'bg-mist/30 border-line hover:border-reward-gold'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${progress?.todayChecklist?.utility ? 'bg-reward-gold text-white' : 'bg-white text-slate border border-line'}`}>
                  {progress?.todayChecklist?.utility ? '✓' : '4'}
                </div>
                <div>
                  <h3 className="font-extrabold text-obsidian">정밀 툴 활성화</h3>
                  <p className="text-sm text-slate font-medium">호흡 가이드 및 바이오 툴</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-reward-gold">+3pt</span>
                <ChevronRight className="w-5 h-5 text-line" />
              </div>
            </Link>
          </div>

          {checklistProgress.completed === checklistProgress.total && (
            <div className="mt-8 p-6 bg-obsidian text-mist rounded-[24px] shadow-xl text-center border border-reward-gold/30">
              <span className="text-4xl mb-3 block">🏅</span>
              <p className="text-xl font-black tracking-tight">Daily Protocol Completed</p>
              <p className="text-sm text-mist/60 mt-1">오늘의 모든 회복 절차를 마쳤습니다. 훌륭한 결과입니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* AI Preview Section */}
      <section className="container mx-auto px-4 pb-8 max-w-5xl">
        <Card className="bg-white border border-line rounded-[40px] overflow-hidden shadow-sm">
          <CardContent className="p-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-24 h-24 bg-mist rounded-[32px] flex items-center justify-center text-5xl shadow-inner shrink-0">
              🤖
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-3">
                <h3 className="font-black text-2xl text-obsidian tracking-tight">유니클 매니저의 데이터 분석</h3>
                <Badge className="bg-chapter-accent/10 text-chapter-accent border-none text-[10px] font-black tracking-tighter uppercase px-2">Real-time Analysis</Badge>
              </div>
              <p className="text-lg text-slate font-medium leading-relaxed italic">
                "{displayScore >= 70 ? '이상적인 데이터 패턴을 유지하고 있습니다. 지속성을 확보하기 위해 수면 효율에 집중하십시오.' : displayScore >= 40 ? '불균형한 피로도가 감지되었습니다. 정밀 호흡 세션과 적정 수분 섭취를 강력히 권장합니다.' : '임계점을 넘은 피로 수치입니다. 즉각적인 회복 작업을 시작하고 심층 분석 리포트를 확인하십시오.'}"
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
              <Button asChild className="h-14 font-black rounded-2xl px-8 bg-chapter-accent hover:bg-chapter-accent/90" size="lg">
                <Link href="/ai-navigator">분석 리포트</Link>
              </Button>
              <Button asChild variant="ghost" className="h-14 font-bold rounded-2xl text-slate hover:text-obsidian" size="lg">
                <Link href="/ai-advice">행동 조언 받기</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recommended Utilities Section */}
      <section className="container mx-auto px-4 pb-12 max-w-5xl">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-black italic text-obsidian tracking-tight">
            RECOMMENDED <span className="text-chapter-accent">TOOLS</span>
          </h2>
          <span className="text-xs font-black text-slate uppercase tracking-[0.2em]">Reset Protocol v1.3</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/therapy/sound" className="group">
            <div className="bg-white border border-line rounded-[32px] p-8 hover:border-blue-500 hover:shadow-2xl transition-all flex flex-col items-center text-center h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-12 -mt-12" />
              <div className="w-20 h-20 bg-mist rounded-[24px] mb-6 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-inner">🎧</div>
              <h3 className="text-xl font-black text-obsidian mb-2">실시간 사운드 테라피</h3>
              <p className="text-sm text-slate font-medium mb-6 leading-relaxed">알고리즘으로 합성된 자연의 소리로 뇌파를 동기화</p>
              <div className="mt-auto text-xs font-black text-blue-500 tracking-widest uppercase group-hover:translate-x-1 transition-transform">Start Healing &gt;</div>
            </div>
          </Link>

          <Link href="/analysis/video" className="group">
            <div className="bg-white border border-line rounded-[32px] p-8 hover:border-emerald-500 hover:shadow-2xl transition-all flex flex-col items-center text-center h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-12 -mt-12" />
              <div className="w-20 h-20 bg-mist rounded-[24px] mb-6 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-inner">👁️</div>
              <h3 className="text-xl font-black text-obsidian mb-2">유니클 비디오 자세 분석</h3>
              <p className="text-sm text-slate font-medium mb-6 leading-relaxed">카메라를 통해 실시간 신체 밸런스 및 피로도 측정</p>
              <div className="mt-auto text-xs font-black text-emerald-500 tracking-widest uppercase group-hover:translate-x-1 transition-transform">Run Analysis &gt;</div>
            </div>
          </Link>

          <Link href="/utils/breathing" className="group">
            <div className="bg-white border border-line rounded-[32px] p-8 hover:border-reward-gold hover:shadow-2xl transition-all flex flex-col items-center text-center h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-reward-gold/5 rounded-full blur-2xl -mr-12 -mt-12" />
              <div className="w-20 h-20 bg-mist rounded-[24px] mb-6 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-inner">🌬️</div>
              <h3 className="text-xl font-black text-obsidian mb-2">마인드풀 호흡 가이드</h3>
              <p className="text-sm text-slate font-medium mb-6 leading-relaxed">바이오 데이터와 연동된 정밀 호흡 리듬 컨트롤</p>
              <div className="mt-auto text-xs font-black text-reward-gold tracking-widest uppercase group-hover:translate-x-1 transition-transform">Start Guide &gt;</div>
            </div>
          </Link>
        </div>
      </section>

      {/* 진단 기반 추천 */}
      <section className="container mx-auto px-4 pb-12 max-w-5xl">
        <DiagnosisBasedRecommendations
          limit={6}
          showProducts={true}
          showProtocols={true}
          showContent={true}
          showCategoryStatus={false}
        />
      </section>

      {/* Quick Links Updated */}
      <section className="container mx-auto px-4 pb-20 max-w-5xl">
        <h2 className="text-2xl font-black text-obsidian mb-8 tracking-tight">빠른 이동</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '사운드 테라피', href: '/therapy/sound', icon: '🎧' },
            { label: '유니클 네비게이터', href: '/ai-navigator', icon: '🤖' },
            { label: '비디오 분석', href: '/analysis/video', icon: '👁️' },
            { label: '멤버십 혜택', href: '/membership', icon: '🎖️' },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="group">
              <div className="bg-white border border-line rounded-2xl p-5 flex items-center gap-4 hover:border-chapter-accent hover:shadow-md transition-all">
                <span className="text-2xl group-hover:scale-125 transition-transform">{link.icon}</span>
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
  if (score >= 70) return { level: '에코 레벨', bg: 'bg-status-good/10 text-status-good', color: 'text-status-good', char: '🌿' };
  if (score >= 40) return { level: '회복 레벨', bg: 'bg-status-amber/10 text-status-amber', color: 'text-status-amber', char: '🧘' };
  return { level: '집중 레벨', bg: 'bg-chapter-accent/10 text-chapter-accent', color: 'text-chapter-accent', char: '🔋' };
}

function SiteGuide() {
  const guides = [
    {
      title: "유니클 네비게이터",
      desc: "매일의 진단 데이터를 분석하여 당신만을 위한 맞춤 회복 루틴과 조언을 제공합니다.",
      icon: <Sparkles className="w-6 h-6" />,
      color: "bg-chapter-accent/10 text-chapter-accent"
    },
    {
      title: "사운드 테라피",
      desc: "알고리즘으로 생성된 3중 레이어 힐링 사운드로 뇌파 안정과 깊은 휴식을 유도합니다.",
      icon: <Music className="w-6 h-6" />,
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      title: "유니클 비디오 자세 분석",
      desc: "카메라를 통해 실시간 자세 불균형과 신체 피로도를 정밀하게 측정하고 기록합니다.",
      icon: <Scan className="w-6 h-6" />,
      color: "bg-emerald-500/10 text-emerald-500"
    },
    {
      title: "실생활 유틸리티",
      desc: "호흡 가이드, 수분 밸런스 등 일상에서 즉시 활용 가능한 바이오 툴을 제공합니다.",
      icon: <Layout className="w-6 h-6" />,
      color: "bg-obsidian/10 text-obsidian"
    }
  ];

  return (
    <section className="bg-white border border-line rounded-[40px] p-10 mb-12 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl">💡</div>
        <h2 className="text-2xl font-black text-obsidian tracking-tight">Youniqle 사용 설명서</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {guides.map((guide, i) => (
          <div key={i} className="p-6 rounded-[24px] bg-mist/30 border border-line/50 hover:border-primary/30 transition-all group">
            <div className={`w-12 h-12 rounded-2xl ${guide.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              {guide.icon}
            </div>
            <h3 className="font-extrabold text-obsidian mb-2">{guide.title}</h3>
            <p className="text-xs text-slate font-medium leading-relaxed opacity-70">{guide.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
