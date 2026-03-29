'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { CheckCircle, RefreshCw, ArrowRight, Sparkles } from 'lucide-react';

export default function ResultDisplay({ score, answers, userNote, onEnter, onOpenWebtoon }: { score: number; answers: any[]; userNote: string; onEnter: () => void; onOpenWebtoon: () => void }) {
  const [showNextStepsDialog, setShowNextStepsDialog] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // 최근에 네비게이터(영업사원)의 QR을 스캔한 유저 = 시술/문진 집중 케어 대상 (기존 추천인 referredBy와 분리)
  const isEventUser = !!(session?.user as any)?.recentNavigator;

  // Logic: 0-7 (Low), 8-15 (Mid), 16+ (High)
  let level = 'LOW';
  let title = '아직은 버틸 만한 상태예요.';
  let metaphorTitle = '튼튼한 기초 위에 쌓는 탑';
  let metaphor = 'TOWER';
  let message = '지금의 관리가 더 멋진 미래를 만듭니다. 기초를 단단히 하세요.';
  let icon = <CheckCircle className="w-20 h-20 text-status-good" />;
  let nextStepMessage = '이 점수대의 사람들은 주로 이런 방법으로 회복했어요.';
  let scoreLevel = '활기 회복 단계';

  if (score >= 8 && score <= 15) {
    level = 'MID';
    title = '요즘, 몸과 마음이 꽤 지쳐 있어요.';
    metaphorTitle = '멈춰 선 시계와 녹슨 부품';
    metaphor = 'CLOCK';
    message = '작은 멈춤이 고장을 막습니다. 지금은 정비가 필요한 시간입니다.';
    icon = <RefreshCw className="w-20 h-20 text-status-amber" />;
    nextStepMessage = '비슷한 상태에서 회복한 사람들의 이야기를 들어보세요.';
    scoreLevel = '회복 진행 중';
  } else if (score >= 16) {
    level = 'HIGH';
    title = '지금은 ‘버티는 시간’이 아니라 ‘돌아봐야 할 시간’입니다.';
    metaphorTitle = '함께 걷는 두 발자국';
    metaphor = 'FOOTPRINTS';
    message = '혼자 버티지 마세요. 이제 함께 회복을 설계할 때입니다.';
    icon = <div className="text-6xl">👣</div>;
    nextStepMessage = '전문가의 도움과 맞춤 플랜이 필요한 시기입니다.';
    scoreLevel = '회복 초기 단계';
  }

  // Convert raw score (0-25) to 100 scale roughly
  const recoveryScore = 100 - (score * 4);

  useEffect(() => {
    const saveData = async () => {
      // 1. Local Storage
      localStorage.setItem('recovery_last_check', new Date().toISOString().split('T')[0]);
      localStorage.setItem('recovery_last_score', recoveryScore.toString());

      // 2. Dispatch event to open header
      window.dispatchEvent(new Event('recovery-gate-passed'));

      // 3. Save to DB (Background)
      try {
        await fetch('/api/recovery/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: new Date(),
            rawScore: score,
            totalScore: recoveryScore,
            metaphor: metaphor,
            answers: answers.map(a => ({
              questionId: a.questionId,
              category: a.category,
              score: a.score,
              answer: a.answer
            })),
            userNote: userNote
          })
        });
      } catch (e) {
        console.error('Failed to save recovery score to DB', e);
      }
    };
    saveData();
  }, [recoveryScore, score, metaphor, answers, userNote]);

  const handleNextSteps = () => {
    setShowNextStepsDialog(true);
  };

  const navigateTo = (path: string) => {
    setShowNextStepsDialog(false);
    // 대시보드 레이아웃을 임시로 띄우는 onEnter() 호출을 제거하여 화면 깜빡임/중복 라우팅 방지
    router.push(path);
  };

  return (
    <>
      <div className="max-w-md mx-auto min-h-[85vh] flex flex-col justify-center px-4 text-center space-y-12 animate-fade-in pb-20">
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate uppercase tracking-[0.2em]">Daily Recovery Score</h2>
          <div className="text-8xl font-black text-chapter-accent tracking-tighter">{recoveryScore}</div>
          <p className="text-lg font-bold text-obsidian/60">{scoreLevel}</p>
        </div>

        <div className="p-10 bg-white rounded-[40px] shadow-2xl shadow-chapter-accent/5 space-y-6 border border-line">
          <div className="flex justify-center mb-4">{icon}</div>
          <h3 className="text-2xl font-black text-obsidian tracking-tight">{metaphorTitle}</h3>
          <p className="text-slate font-medium leading-relaxed">{title}</p>
          <div className="pt-6 border-t border-line">
            <p className="text-sm font-bold text-chapter-accent italic opacity-70">"{message}"</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <Button size="lg" onClick={handleNextSteps} className="btn-primary w-full h-20 text-xl rounded-[24px] shadow-xl shadow-chapter-accent/20">
            다음 단계 설계하기 <ArrowRight className="ml-3 h-6 w-6" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={onOpenWebtoon}
            className="w-full h-16 text-lg rounded-[24px] border-line font-bold text-slate hover:text-obsidian hover:border-chapter-accent group"
          >
            <span className="mr-2 group-hover:rotate-12 transition-transform">🎨</span>
            웹툰으로 내 데이터 남기기
          </Button>
          <Button variant="ghost" onClick={onEnter} className="text-slate/60 hover:text-obsidian underline underline-offset-4 text-sm mt-2">
            진단 결과 리포트 보기
          </Button>
        </div>
      </div>

      {/* Next Steps Dialog (Enhanced Design) */}
      {showNextStepsDialog && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-obsidian/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full sm:max-w-md rounded-t-[40px] sm:rounded-[40px] p-10 space-y-8 shadow-2xl animate-in slide-in-from-bottom-12 duration-500 overflow-hidden relative">
            {/* 배경 장식 */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-chapter-accent/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-reward-gold/5 rounded-full blur-3xl" />

            <div className="space-y-3 relative">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-chapter-accent/10 text-chapter-accent text-[10px] font-black uppercase tracking-widest mb-2">
                Recommendation
              </div>
              <h3 className="text-3xl font-black text-obsidian tracking-tight leading-tight">
                {isEventUser ? '완벽한 시술 결과를 위한 제안' : `${levelInfo(recoveryScore).level}를 위한 제안`}
              </h3>
              <p className="text-sm text-slate font-medium leading-relaxed">
                {isEventUser ? '시술의 완성은 회복입니다. 지금 바로 맞춤 관리를 시작하세요.' : nextStepMessage}
              </p>
            </div>

            <div className="space-y-4 relative">
              {/* 일일 루틴 설계 받기 / 시술 전 심층 문진 */}
              <button 
                onClick={() => navigateTo(isEventUser ? '/event/consultation' : '/ai-navigator')} 
                className="w-full p-6 text-left rounded-[28px] border-2 border-line hover:border-chapter-accent hover:bg-chapter-accent/[0.02] transition-all group relative overflow-hidden active:scale-[0.98]"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-chapter-accent/10 text-chapter-accent group-hover:scale-110 transition-transform">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <span className="text-lg font-black text-obsidian">
                      {isEventUser ? '시술 전 심층 문진 시작하기' : '일일 루틴 설계 받기'}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-line group-hover:text-chapter-accent group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm text-slate font-medium pl-14">
                  {isEventUser ? '성공적인 시술 결과를 위한 1:1 맞춤 회복 플랜' : '실시간 데이터를 분석한 나만의 활력 행동 가이드'}
                </p>
              </button>
              
              {/* 회복 갤러리 / 시술 집중 모니터링 */}
              <button 
                onClick={() => navigateTo(isEventUser ? '/event/monitoring' : '/gallery/artworks')} 
                className="w-full p-6 text-left rounded-[28px] border-2 border-line hover:border-reward-gold hover:bg-reward-gold/[0.02] transition-all group relative overflow-hidden active:scale-[0.98]"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-reward-gold/10 text-reward-gold group-hover:scale-110 transition-transform">
                      <div className="text-xl">🎨</div>
                    </div>
                    <span className="text-lg font-black text-obsidian">
                      {isEventUser ? '시술 집중 모니터링 시작 (72h)' : '회복 갤러리'}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-line group-hover:text-reward-gold group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm text-slate font-medium pl-14">
                  {isEventUser ? '골든타임 72시간 동안 발생할 수 있는 변화를 실시간으로 밀착 관리합니다' : '나만의 회복 여정을 시각적인 예술 기록으로 감상하세요'}
                </p>
              </button>
            </div>

            <div className="pt-4 relative">
              <Button 
                variant="ghost" 
                onClick={() => setShowNextStepsDialog(false)} 
                className="w-full h-14 rounded-2xl text-slate font-bold hover:bg-mist transition-colors"
              >
                나중에 하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// helper
function levelInfo(score: number) {
  if (score >= 70) return { level: '에코 레벨', bg: 'bg-status-good/10 text-status-good', color: 'text-status-good', char: '🌿' };
  if (score >= 40) return { level: '회복 레벨', bg: 'bg-status-amber/10 text-status-amber', color: 'text-status-amber', char: '🧘' };
  return { level: '집중 레벨', bg: 'bg-chapter-accent/10 text-chapter-accent', color: 'text-chapter-accent', char: '🔋' };
}
