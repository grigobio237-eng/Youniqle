'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';

export default function ResultDisplay({ score, answers, userNote, onEnter, onOpenWebtoon }: { score: number; answers: any[]; userNote: string; onEnter: () => void; onOpenWebtoon: () => void }) {
  const [showNextStepsDialog, setShowNextStepsDialog] = useState(false);
  const router = useRouter();

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
    onEnter(); // Trigger dashboard unlock
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
            메인 대시보드로 가기
          </Button>
        </div>
      </div>

      {/* Next Steps Dialog (Similar to previous Onboarding/Welcome patterns) */}
      {showNextStepsDialog && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] p-8 space-y-6 shadow-2xl animate-in slide-in-from-bottom-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-obsidian">{levelInfo(recoveryScore).level}를 위한 제안</h3>
              <p className="text-sm text-slate font-medium">{nextStepMessage}</p>
            </div>

            <div className="space-y-3">
              <button onClick={() => navigateTo('/cases')} className="w-full p-5 text-left rounded-2xl border border-line hover:border-status-normal hover:bg-status-normal/5 transition-all group">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-obsidian">유사한 회복 케이스 보기</span>
                  <ArrowRight className="w-5 h-5 text-slate group-hover:text-status-normal group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate">나와 비슷한 점수대의 사람들은 어떻게 이겨냈을까요?</p>
              </button>
              
              <button onClick={() => navigateTo('/ai-navigator')} className="w-full p-5 text-left rounded-2xl border border-line hover:border-chapter-accent hover:bg-chapter-accent/5 transition-all group">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-obsidian">AI 루틴 설계 받기</span>
                  <ArrowRight className="w-5 h-5 text-slate group-hover:text-chapter-accent group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate">오늘의 데이터를 기반으로 한 최적의 행동 가이드</p>
              </button>

              <button onClick={() => navigateTo('/products')} className="w-full p-5 text-left rounded-2xl border border-line hover:border-reward-gold hover:bg-reward-gold/5 transition-all group">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-obsidian">회복 큐레이션 샵</span>
                  <ArrowRight className="w-5 h-5 text-slate group-hover:text-reward-gold group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate">내 상태에 딱 맞는 제품과 서비스를 추천받으세요.</p>
              </button>
            </div>

            <Button variant="ghost" onClick={() => setShowNextStepsDialog(false)} className="w-full text-slate">
              닫기
            </Button>
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
