'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { CheckCircle, RefreshCw, ArrowRight, Sparkles, FileText, Clock, ShieldCheck, Brain, Gift } from 'lucide-react';
import { useRecovery } from '@/contexts/RecoveryContext';
import { AnalysisResult } from './HeroScanner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResultDisplay({ 
  score, 
  answers, 
  userNote, 
  analysisData,
  onEnter, 
  onOpenWebtoon 
}: { 
  score: number; 
  answers: any[]; 
  userNote: string; 
  analysisData: AnalysisResult | null;
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
          badge: "Personalized Roadmap",
          title: "당신만을 위한 회복 로드맵",
          cta: "맞춤 플랜 확인하기",
          nextActionTitle: "일상 루틴 설계 받기",
          nextActionDesc: "실시간 데이터를 분석한 나만의 활력 행동 가이드"
        };
    }
  };

  const info = getRoadmapInfo();

  // 최근에 네비게이터(영업사원)의 QR을 스캔한 유저 = 시술/문진 집중 케어 대상 (기존 추천인 referredBy와 분리)
  const isEventUser = !!(session?.user as any)?.recentNavigator || journey?.startsWith('CLINICAL');

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

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <>
      <div className={`max-w-md mx-auto min-h-[85vh] flex flex-col justify-center px-4 text-center space-y-12 animate-fade-in pb-20 ${isDesigning ? 'opacity-20 blur-sm pointer-events-none' : ''} transition-all duration-700`}>
        <div className="space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-chapter-accent/10 text-chapter-accent text-[10px] font-black uppercase tracking-widest mb-2">
            {info.badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-obsidian tracking-tight break-keep">{info.title}</h2>
          <div className="relative inline-block mt-8">
            <div className="text-9xl font-black text-chapter-accent tracking-tighter tabular-nums">{recoveryScore}</div>
            <div className="absolute -top-4 -right-8 w-16 h-16 bg-reward-gold/10 rounded-full blur-xl animate-pulse" />
          </div>
          <p className="text-xl font-bold text-obsidian/60">{scoreLevel}</p>
        </div>

        <div className="p-10 bg-white rounded-[40px] shadow-2xl shadow-chapter-accent/5 space-y-6 border border-line relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-chapter-accent" />
          <div className="flex justify-center mb-4">{icon}</div>
          <h3 className="text-2xl font-black text-obsidian tracking-tight">{metaphorTitle}</h3>
          <p className="text-slate font-medium leading-relaxed">{title}</p>
          <div className="pt-6 border-t border-line">
            <p className="text-sm font-bold text-chapter-accent italic opacity-70">"{message}"</p>
          </div>
        </div>

        {!session && (
          <div className="p-6 bg-white rounded-[40px] border-2 border-reward-gold/30 shadow-lg space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-reward-gold/10 blur-2xl rounded-full" />
            <div className="flex items-center justify-center gap-2 text-reward-gold font-black text-xs uppercase tracking-widest">
              <Gift className="w-4 h-4" /> Welcome Reward
            </div>
            <h4 className="text-xl font-black text-obsidian tracking-tight">
              잠깐! 회원가입하고 혜택 받기 🎁
            </h4>
            <p className="text-sm font-bold text-slate/70 break-keep leading-relaxed">
              오늘 획득한 <span className="text-reward-gold font-black">10P</span>와 나만을 위한 정밀 분석 데이터가 로그인 즉시 안전하게 영구 보존됩니다.
            </p>
            <Button 
              onClick={() => signIn()} 
              className="w-full h-14 rounded-2xl bg-reward-gold text-obsidian hover:bg-reward-gold/90 font-black text-base shadow-lg shadow-reward-gold/20 transition-all flex items-center justify-center gap-2"
            >
              1초 만에 가입하고 포인트 받기
            </Button>
          </div>
        )}

        <div className="space-y-6 w-full pt-8">
          <div className="text-left space-y-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-chapter-accent/10 text-chapter-accent text-[10px] font-black uppercase tracking-widest">
              Action Items
            </div>
            <h3 className="text-3xl font-black text-obsidian tracking-tight">
              {info.nextActionTitle}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
              {/* Primary Action */}
              <button 
                onClick={() => {
                  if (journey === 'WELLNESS') {
                    setIsDesigning(true);
                    setTimeout(() => router.push('/dashboard'), 2500);
                  } else {
                    navigateTo(journey === 'CLINICAL_PRE' ? '/event/consultation' : '/dashboard');
                  }
                }} 
                className="w-full p-6 text-left rounded-[28px] border-2 border-chapter-accent bg-chapter-accent/[0.02] hover:bg-chapter-accent/[0.05] transition-all group relative overflow-hidden active:scale-[0.98] shadow-lg shadow-chapter-accent/5"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-chapter-accent text-white group-hover:scale-110 transition-transform shadow-lg shadow-chapter-accent/20">
                      {journey === 'CLINICAL_PRE' ? <FileText className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                    </div>
                    <span className="text-xl font-black text-obsidian">
                      {journey === 'CLINICAL_PRE' ? '의사 상담용 리포트 출력' : '맞춤 회복 루틴 시작하기'}
                    </span>
                  </div>
                  <ArrowRight className="w-6 h-6 text-chapter-accent group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm text-slate font-medium pl-14">
                  {journey === 'CLINICAL_PRE' ? '상담 시 활용 가능한 정밀 데이터를 문두로 정리합니다' : '실시간 데이터를 분석한 나만의 활력 행동 가이드'}
                </p>
              </button>
              
              {/* Secondary Action */}
              <button 
                onClick={() => navigateTo(journey === 'CLINICAL_POST' ? '/event/monitoring' : '/gallery/artworks')} 
                className="w-full p-6 text-left rounded-[28px] border-2 border-line hover:border-reward-gold hover:bg-reward-gold/[0.02] transition-all group relative overflow-hidden active:scale-[0.98]"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-reward-gold/10 text-reward-gold group-hover:scale-110 transition-transform">
                      {journey === 'CLINICAL_POST' ? <Clock className="w-6 h-6" /> : <div className="text-xl">🎨</div>}
                    </div>
                    <span className="text-lg font-black text-obsidian">
                      {journey === 'CLINICAL_POST' ? '72h 집중 모니터링 시작' : '회복 갤러리 감상'}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-line group-hover:text-reward-gold group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm text-slate font-medium pl-14">
                  {journey === 'CLINICAL_POST' ? '골든타임 동안 발생할 수 있는 신체 변화를 밀착 추적합니다' : '나만의 회복 여정을 시각적인 예술 기록으로 확인하세요'}
                </p>
              </button>

              <Button
                variant="outline"
                onClick={onOpenWebtoon}
                className="w-full h-16 text-lg rounded-[24px] border-line font-bold text-slate hover:text-obsidian hover:border-chapter-accent group mt-4"
              >
                <span className="mr-2 group-hover:rotate-12 transition-transform">🎨</span>
                회복 기록을 웹툰으로 남기기
              </Button>
          </div>

          <Button variant="ghost" onClick={onEnter} className="text-slate/60 hover:text-obsidian underline underline-offset-4 text-sm">
            전체 분석 데이터 보기
          </Button>
        </div>
      </div>



      {/* AI Routine Designer Overlay */}
      <AnimatePresence>
        {isDesigning && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-mist/60 backdrop-blur-xl p-8"
          >
            <div className="w-full max-w-sm space-y-12 text-center">
              {/* Animation Header */}
              <div className="relative w-32 h-32 mx-auto">
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-dashed border-chapter-accent/30 rounded-full"
                />
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-4 bg-chapter-accent rounded-full flex items-center justify-center text-white shadow-2xl shadow-chapter-accent/40"
                >
                  <Sparkles className="w-10 h-10" />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-2 -right-2 bg-reward-gold text-white p-2 rounded-xl shadow-lg"
                >
                  <Brain className="w-4 h-4" />
                </motion.div>
              </div>

              {/* Status Message */}
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-obsidian tracking-tight">당신만을 위한<br />회복 루틴 설계 중</h3>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-2">
                    <span className="w-1.5 h-1.5 bg-chapter-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-chapter-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-chapter-accent rounded-full animate-bounce" />
                  </div>
                  <p className="text-sm font-bold text-slate/60 uppercase tracking-widest">Integrating Data Sources</p>
                </div>
              </div>

              {/* Combined Data Indicators */}
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: "이미지 분석", value: (analysisData?.summary?.split(' ')[0] || "대상") + " 외 키워드", delay: 0 },
                  { label: "문진 데이터", value: `${recoveryScore}점 회복 프로토콜`, delay: 0.2 },
                  { label: "환경 조건", value: analysisData?.type === 'SPACE' ? "주변 환경 동기화" : "라이프스타일 매칭", delay: 0.4 }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: item.delay }}
                    className="flex justify-between items-center bg-white/50 backdrop-blur-sm border border-line/50 p-4 rounded-2xl"
                  >
                    <span className="text-[10px] font-black text-slate/50 uppercase tracking-wider">{item.label}</span>
                    <span className="text-xs font-bold text-obsidian">{item.value}</span>
                  </motion.div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="pt-4">
                <div className="h-1.5 w-full bg-mist rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.2, ease: "easeInOut" }}
                    className="h-full bg-chapter-accent"
                  />
                </div>
                <p className="mt-3 text-[10px] font-black text-chapter-accent uppercase tracking-[0.2em] animate-pulse">
                  Synthesizing your personalized roadmap...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// helper
function levelInfo(score: number) {
  if (score >= 70) return { level: '에코 레벨', bg: 'bg-status-good/10 text-status-good', color: 'text-status-good', char: '🌿' };
  if (score >= 40) return { level: '회복 레벨', bg: 'bg-status-amber/10 text-status-amber', color: 'text-status-amber', char: '🧘' };
  return { level: '집중 레벨', bg: 'bg-chapter-accent/10 text-chapter-accent', color: 'text-chapter-accent', char: '🔋' };
}
