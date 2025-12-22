'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ChevronRight, ChevronLeft, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

// ---------------------------
// 1. Data & Types
// ---------------------------
type Question = {
  id: number;
  category: string;
  text: string;
  options: { label: string; score: number }[];
};

const getLevelInfo = (score: number) => {
  if (score >= 90) return { level: 'Lv.4 만개 (Bloom)', char: '🌸', msg: '최상의 상태입니다. 이 눈부신 에너지를 마음껏 누리세요.', color: 'text-pink-500', bg: 'bg-pink-50' };
  if (score >= 70) return { level: 'Lv.3 꽃봉오리 (Bud)', char: '🌷', msg: '당신의 에너지가 피어나기 시작했습니다. 거의 다 왔어요!', color: 'text-rose-400', bg: 'bg-rose-50' };
  if (score >= 40) return { level: 'Lv.2 새싹 (Sprout)', char: '🌿', msg: '조금씩 생기가 돌고 있어요. 지금의 루틴을 유지하세요.', color: 'text-green-500', bg: 'bg-green-50' };
  return { level: 'Lv.1 씨앗 (Seed)', char: '🌱', msg: '지금은 조용히 힘을 모을 때입니다. 곧 싹이 틀 거예요.', color: 'text-green-600', bg: 'bg-emerald-50' };
};

// ---------------------------
// 2. Sub-Components
// ---------------------------

function OnboardingDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = React.useState(1);
  const steps = [
    {
      title: "환영합니다! 🎉",
      desc: "당신만을 위한 리커버리 OS, Youniqle입니다.\n우리는 데이터 기반의 회복을 연구하는 랩입니다.",
      icon: "👋"
    },
    {
      title: "맞춤형 시스템 🤖",
      desc: "매일 아침 60초 진단으로 회복 점수를 체크하고,\nAI 코치의 정밀 조언을 받아보세요.",
      icon: "📊"
    },
    {
      title: "성장 보상 🌸",
      desc: "회복의 여정을 포인트로 보상받고,\n당신만의 '회복 캐릭터'를 성장시키세요.",
      icon: "🌱"
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-6xl mb-4">{currentStep.icon}</div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">{currentStep.title}</DialogTitle>
              <DialogDescription className="text-lg whitespace-pre-line pt-2 text-center text-gray-600">
                {currentStep.desc}
              </DialogDescription>
            </DialogHeader>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-2 mt-4">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${step === i + 1 ? 'bg-primary' : 'bg-gray-200'}`} />
          ))}
        </div>

        <div className="pt-6">
          <Button
            className="w-full h-12 rounded-xl text-lg"
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else onOpenChange(false);
            }}
          >
            {step === 3 ? "회복 시작하기 🚀" : "다음 단계"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// A. Gate Intro View
function GateIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl space-y-8"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
            회복을 감각이 아닌<br />
            <span className="text-primary">'데이터'로 증명</span>합니다.
          </h1>
          <p className="text-lg text-gray-600 word-keep-all">
            "Before/After 사진 대신, 익명의 회복 데이터와 루틴으로 증명합니다."<br />
            오늘 당신의 몸이 보내는 신호를 1분 만에 해석해보세요.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm mx-auto">
          <Button size="lg" onClick={onStart} className="flex-1 text-lg h-14 rounded-full shadow-lg hover:scale-105 transition-transform">
            60초 내 몸 진단하기
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1 text-lg h-14 rounded-full border-2 hover:bg-gray-50">
            <Link href="/products">베스트 회복 키트 보기</Link>
          </Button>
        </div>

        <div className="pt-8 border-t border-gray-100 flex justify-center gap-8 text-sm text-gray-500">
          <div>
            <span className="block font-bold text-gray-900 text-xl">12,403</span>
            <span>누적 회복 데이터</span>
          </div>
          <div>
            <span className="block font-bold text-gray-900 text-xl">94%</span>
            <span>루틴 재참여율</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// B. Question Form View
function QuestionForm({ questions, onComplete }: { questions: Question[]; onComplete: (score: number, answers: any[], userNote: string) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any[]>(new Array(questions.length).fill(null));
  const [userNote, setUserNote] = useState('');

  const handleOptionSelect = (score: number, label: string) => {
    const currentQ = questions[step];
    const newAnswers = [...answers];
    newAnswers[step] = {
      questionId: currentQ.id,
      category: currentQ.category,
      score: score,
      answer: label
    };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Calculate total score and finish
      const totalScore = answers.reduce((acc, curr) => acc + (curr?.score || 0), 0);
      const finalAnswers = answers.filter(a => a !== null);
      onComplete(totalScore, finalAnswers, userNote);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const currentQ = questions[step];
  const currentAnswer = answers[step];
  const progress = ((step + 1) / questions.length) * 100;
  const isLastStep = step === questions.length - 1;

  return (
    <div className="max-w-md mx-auto min-h-[80vh] flex flex-col justify-center px-4 py-12">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            {step + 1}/{questions.length} 문항 완료
          </span>
          <span className="text-xs text-gray-400">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full">
          <motion.div
            className="bg-primary h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          <div className="space-y-2">
            <span className="text-primary font-bold text-sm">Q{currentQ.id}. {currentQ.category}</span>
            <h2 className="text-2xl font-bold text-gray-800 leading-snug">
              {currentQ.text}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = currentAnswer?.answer === opt.label;
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(opt.score, opt.label)}
                  className={`w-full p-4 text-left border rounded-xl transition-all active:scale-98 
                    ${isSelected
                      ? 'bg-primary/10 border-primary text-primary ring-1 ring-primary'
                      : 'hover:bg-primary/5 hover:border-primary text-gray-700'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={isSelected ? 'font-bold' : ''}>{opt.label}</span>
                    {isSelected ? (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* User Note Input (Last Step Only) */}
          {isLastStep && (
            <div className="pt-6 border-t animate-fade-in-up">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                더 하고 싶은 말이 있나요? (선택)
              </label>
              <textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="오늘 나의 상태나 궁금한 점을 자유롭게 적어주세요."
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px] resize-none text-sm"
              />
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={step === 0}
          className="flex-1 h-12 text-lg rounded-xl"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> 이전
        </Button>
        <Button
          onClick={handleNext}
          disabled={!currentAnswer}
          className="flex-1 h-12 text-lg rounded-xl"
        >
          {isLastStep ? '결과 보기' : '다음'} <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// C. Result & Metaphor View
function ResultView({ score, answers, userNote, onEnter }: { score: number; answers: any[]; userNote: string; onEnter: () => void }) {
  const [showNextStepsDialog, setShowNextStepsDialog] = useState(false);
  const router = useRouter();

  // Logic: 0-7 (Low), 8-15 (Mid), 16+ (High)
  let level = 'LOW';
  let title = '아직은 버틸 만한 상태예요.';
  let metaphorTitle = '튼튼한 기초 위에 쌓는 탑';
  let metaphor = 'TOWER';
  let message = '지금의 관리가 더 멋진 미래를 만듭니다. 기초를 단단히 하세요.';
  let icon = <CheckCircle className="w-20 h-20 text-green-500" />;
  let nextStepMessage = '이 점수대의 사람들은 주로 이런 방법으로 회복했어요.';
  let scoreLevel = '활기 회복 단계';

  if (score >= 8 && score <= 15) {
    level = 'MID';
    title = '요즘, 몸과 마음이 꽤 지쳐 있어요.';
    metaphorTitle = '멈춰 선 시계와 녹슨 부품';
    metaphor = 'CLOCK';
    message = '작은 멈춤이 고장을 막습니다. 지금은 정비가 필요한 시간입니다.';
    icon = <RefreshCw className="w-20 h-20 text-yellow-500" />;
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
  // Raw 0 (Best) -> 100.
  // Raw 25 (Worst) -> 0.
  const recoveryScore = 100 - (score * 4);

  useEffect(() => {
    /* 
       Note: We removed immediate local storage set here or kept it?
       Previously it was:
    */
    const saveData = async () => {
      // 1. Local Storage (Immediate feedback)
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
            answers: answers,
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
      <div className="max-w-md mx-auto min-h-[80vh] flex flex-col justify-center px-4 text-center space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-600">오늘의 회복 점수</h2>
          <div className="text-6xl font-black text-primary">{recoveryScore}점</div>
          <p className="text-sm text-gray-500">({scoreLevel})</p>
        </div>

        <div className="p-8 bg-gray-50 rounded-2xl space-y-4">
          <div className="flex justify-center">{icon}</div>
          <h3 className="text-xl font-bold">{metaphorTitle}</h3>
          <p className="text-gray-600 word-keep-all">{title}</p>
          <p className="text-sm text-gray-500 pt-4 border-t">{message}</p>
        </div>

        <Button size="lg" onClick={handleNextSteps} className="w-full text-lg h-14 rounded-full">
          다음 단계 선택하기 <ArrowRight className="ml-2" />
        </Button>
      </div>

      {/* Next Steps Dialog */}
      <Dialog open={showNextStepsDialog} onOpenChange={setShowNextStepsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">🎯 어떤 방법으로 시작할까요?</DialogTitle>
            <DialogDescription className="text-base pt-2">
              {nextStepMessage}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {/* Option 1: Cases */}
            <button
              onClick={() => navigateTo('/cases')}
              className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">📖</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 group-hover:text-primary mb-1">
                    비슷한 점수의 회복 케이스 보기
                  </h4>
                  <p className="text-sm text-gray-600">
                    {recoveryScore >= 70 ? '70점대' : recoveryScore >= 40 ? '40~70점대' : '40점 미만'} 사람들이 어떻게 회복했는지 실제 이야기를 확인하세요.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary" />
              </div>
            </button>

            {/* Option 2: AI Navigator */}
            <button
              onClick={() => navigateTo('/ai-navigator')}
              className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">🤖</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 group-hover:text-purple-600 mb-1">
                    AI 맞춤 조언 받기
                  </h4>
                  <p className="text-sm text-gray-600">
                    나만의 회복 코치가 오늘의 컨디션에 맞는 루틴과 조언을 제공합니다.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
              </div>
            </button>

            {/* Option 3: Products */}
            <button
              onClick={() => navigateTo('/products')}
              className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">🛒</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 group-hover:text-green-600 mb-1">
                    추천 제품 바로 보기
                  </h4>
                  <p className="text-sm text-gray-600">
                    내 점수에 맞는 회복 키트를 바로 확인하고 시작하세요.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
              </div>
            </button>
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => { setShowNextStepsDialog(false); onEnter(); }}
              className="w-full"
            >
              나중에 선택할게요 (대시보드로 이동)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// D. Main Dashboard (Recovery OS)
function RecoveryDashboard({ score }: { score: number }) {
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

      // Mark diagnosis as complete (since they just completed it)
      if (!userProgress.todayChecklist.diagnosis) {
        const { updateChecklist } = require('@/lib/progress');
        const updated = updateChecklist('diagnosis', 5);
        setProgress(updated);
        setChecklistProgress(getProgress());
      }
    }
  }, []);

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
  const totalPoints = progress?.totalPoints || 5; // Default 5 from diagnosis
  const membershipLevel = totalPoints >= 300 ? 'ECHO' : totalPoints >= 100 ? 'NAVIGATOR' : 'GATE';
  const nextLevel = totalPoints >= 300 ? 'OMAKASE' : totalPoints >= 100 ? 'ECHO' : 'NAVIGATOR';
  const pointsToNext = totalPoints >= 300 ? 500 - totalPoints : totalPoints >= 100 ? 300 - totalPoints : 100 - totalPoints;

  const levelInfo = getLevelInfo(displayScore);

  return (
    <div className="min-h-screen pb-20">
      {/* Top Status Card */}
      <section className="bg-gradient-to-br from-primary/10 via-purple-50 to-blue-50 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border border-white">
            {/* Level & Score Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
              {/* Character & Level */}
              <div className="flex flex-col items-center p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
                <div className={`text-7xl mb-4 p-4 rounded-full ${levelInfo.bg} shadow-inner`}>
                  {levelInfo.char}
                </div>
                <div className={`text-xl font-bold ${levelInfo.color} mb-1`}>{levelInfo.level}</div>
                <p className="text-sm text-gray-500 font-medium whitespace-pre-line text-center">{levelInfo.msg}</p>
              </div>

              {/* Score Display */}
              <div className="text-center p-6 rounded-2xl bg-white shadow-sm border border-gray-100 h-full flex flex-col justify-center">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">오늘의 회복 컨디션</h2>
                <div className="text-7xl font-black text-primary mb-3">{displayScore}점</div>

                {/* Streak Badge */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 px-4 py-2 rounded-full border border-orange-200 w-fit mx-auto">
                  <span className="text-xl">🔥</span>
                  <span className="font-bold text-orange-700 text-sm">{streak}일 연속 회복 중!</span>
                </div>
              </div>
            </div>

            {/* Membership Progress */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/20 p-2 rounded-lg">🎖️</div>
                  <div>
                    <span className="text-xs text-gray-500 block">현재 멤버십 등급</span>
                    <span className="font-bold text-primary">{membershipLevel}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">{nextLevel}까지</span>
                  <span className="font-bold text-gray-900">{pointsToNext}pt 남음</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className="bg-gradient-to-r from-primary via-purple-500 to-primary h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalPoints % 100) || 100}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-xs text-gray-400">총 {totalPoints} 포인트</p>
                <Link href="/membership" className="text-xs text-primary font-bold hover:underline">혜택 보러가기 &gt;</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Goal / Focus Card */}
      <section className="container mx-auto px-4 pt-4 pb-8 max-w-4xl">
        <div className="bg-black text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-primary tracking-widest uppercase">Target of the day</span>
              <h3 className="text-xl font-black">{levelInfo.char} {displayScore >= 70 ? '활기 유지하기' : '집중 회복하기'}</h3>
              <p className="text-sm text-gray-400">오늘의 미션 {checklistProgress.completed}개를 완료하고 씨앗을 키워보세요.</p>
            </div>
            <div className="hidden sm:block">
              <div className="w-12 h-12 border-2 border-primary/50 rounded-full flex items-center justify-center font-bold text-xs">
                {Math.round((checklistProgress.completed / checklistProgress.total) * 100)}%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Checklist */}
      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">✅ 오늘의 체크리스트</h2>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{checklistProgress.completed}/{checklistProgress.total}</div>
              <div className="text-xs text-gray-500">{checklistProgress.percentage}% 완료</div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Diagnosis */}
            <div className={`flex items-center justify-between p-4 rounded-xl border-2 ${progress?.todayChecklist?.diagnosis ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress?.todayChecklist?.diagnosis ? 'bg-green-500' : 'bg-gray-300'}`}>
                  {progress?.todayChecklist?.diagnosis && <span className="text-white text-sm">✓</span>}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">아침 진단 완료</h3>
                  <p className="text-sm text-gray-600">오늘의 회복 점수 체크</p>
                </div>
              </div>
              <span className="text-sm font-bold text-green-600">+5pt</span>
            </div>

            {/* AI Advice */}
            <Link
              href="/ai-navigator"
              onClick={() => !progress?.todayChecklist?.aiAdvice && handleChecklistItem('aiAdvice', 3)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all hover:shadow-md ${progress?.todayChecklist?.aiAdvice ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200 hover:border-purple-300'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress?.todayChecklist?.aiAdvice ? 'bg-purple-500' : 'bg-gray-300'}`}>
                  {progress?.todayChecklist?.aiAdvice && <span className="text-white text-sm">✓</span>}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">AI 조언 확인하기</h3>
                  <p className="text-sm text-gray-600">나만의 회복 코치 만나기</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-purple-600">+3pt</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>

            {/* Content */}
            <Link
              href="/cases"
              onClick={() => !progress?.todayChecklist?.content && handleChecklistItem('content', 2)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all hover:shadow-md ${progress?.todayChecklist?.content ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:border-blue-300'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress?.todayChecklist?.content ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  {progress?.todayChecklist?.content && <span className="text-white text-sm">✓</span>}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">회복 케이스 읽기</h3>
                  <p className="text-sm text-gray-600">비슷한 사람들의 이야기</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-blue-600">+2pt</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>

            {/* Utility */}
            <Link
              href="/utils"
              onClick={() => !progress?.todayChecklist?.utility && handleChecklistItem('utility', 3)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all hover:shadow-md ${progress?.todayChecklist?.utility ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 hover:border-green-300'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress?.todayChecklist?.utility ? 'bg-green-500' : 'bg-gray-300'}`}>
                  {progress?.todayChecklist?.utility && <span className="text-white text-sm">✓</span>}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">힐링 유틸 사용하기</h3>
                  <p className="text-sm text-gray-600">호흡, BMI, D-Day 등</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-green-600">+3pt</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          </div>

          {checklistProgress.completed === checklistProgress.total && (
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 text-center">
              <span className="text-3xl mb-2 block">🎉</span>
              <p className="font-bold text-gray-900">오늘의 미션 완료!</p>
              <p className="text-sm text-gray-600">내일도 함께 회복해요</p>
            </div>
          )}
        </div>
      </section>

      {/* AI Preview Section */}
      <section className="container mx-auto px-4 pb-8 max-w-4xl">
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="text-3xl">🤖</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">AI 코치의 오늘 조언</h3>
                <p className="text-gray-700 leading-relaxed">
                  "{displayScore >= 70 ? '좋은 컨디션이네요! 오늘은 가벼운 유산소 운동을 추가해보세요.' : displayScore >= 40 ? '피로도가 보이네요. 오늘은 충분한 수분 섭취와 스트레칭에 집중하세요.' : '지금은 휴식이 필요한 시기입니다. 무리하지 마시고 숙면에 집중하세요.'}"
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button asChild className="flex-1" variant="outline">
                <Link href="/ai-navigator">
                  자세한 분석 보기
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/ai-navigator">
                  주간 리포트
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recommended Utilities Section */}
      <section className="container mx-auto px-4 pb-12 max-w-4xl">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl font-black italic text-gray-900 tracking-tight">
            RECOMMENDED <span className="text-primary">TOOLS</span>
          </h2>
          <span className="text-xs font-bold text-gray-400">당신을 위한 리셋 도구</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/utils/breathing" className="group">
            <div className="bg-white border-2 border-gray-100 rounded-3xl p-5 hover:border-blue-400 hover:bg-blue-50/30 transition-all shadow-sm flex flex-col items-center text-center h-full">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl mb-4 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🌬️</div>
              <h3 className="font-bold text-gray-900 mb-1">3분 마인드풀 호흡</h3>
              <p className="text-xs text-gray-500 mb-4 leading-tight">뇌의 피로를 씻어내는 가장 빠른 방법</p>
              <div className="mt-auto text-xs font-black text-blue-500">START &gt;</div>
            </div>
          </Link>

          <Link href="/utils/stretch" className="group">
            <div className="bg-white border-2 border-gray-100 rounded-3xl p-5 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all shadow-sm flex flex-col items-center text-center h-full">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl mb-4 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🧘</div>
              <h3 className="font-bold text-gray-900 mb-1">오피스 리셋 스트레칭</h3>
              <p className="text-xs text-gray-500 mb-4 leading-tight">굳은 어깨와 목을 바로 풀어주세요</p>
              <div className="mt-auto text-xs font-black text-emerald-500">START &gt;</div>
            </div>
          </Link>

          <Link href="/utils/water" className="group">
            <div className="bg-white border-2 border-gray-100 rounded-3xl p-5 hover:border-cyan-400 hover:bg-cyan-50/30 transition-all shadow-sm flex flex-col items-center text-center h-full">
              <div className="w-16 h-16 bg-cyan-100 rounded-2xl mb-4 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">💧</div>
              <h3 className="font-bold text-gray-900 mb-1">수분 밸런스 체크</h3>
              <p className="text-xs text-gray-500 mb-4 leading-tight">오늘 마신 물의 양이 적절한가요?</p>
              <div className="mt-auto text-xs font-black text-cyan-600">CHECK &gt;</div>
            </div>
          </Link>
        </div>
      </section>

      {/* Best Products */}
      <section className="container mx-auto px-4 pb-8 max-w-4xl">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl font-bold">🔥 내게 맞는 회복 키트</h2>
          <Link href="/products" className="text-sm text-gray-500 hover:text-primary">전체보기 &gt;</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 1, title: '딥 슬립 리커버리 키트', desc: '불면증 개선 만족도 98%', price: '49,000원', tag: 'BEST' },
            { id: 2, title: '만성 피로 삭제 팩', desc: '아침이 달라지는 7일 루틴', price: '35,000원', tag: 'HOT' },
            { id: 3, title: '스트레스 번아웃 케어', desc: '직장인 필수 멘탈 관리', price: '55,000원', tag: 'NEW' }
          ].map((item) => (
            <Link href={`/products/${item.id}`} key={item.id} className="block group">
              <Card className="h-full border-transparent shadow-sm hover:shadow-md transition-all">
                <div className="aspect-[4/3] bg-gray-100 rounded-t-xl relative overflow-hidden">
                  <div className="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2 py-1 rounded">{item.tag}</div>
                  <div className="w-full h-full flex items-center justify-center text-gray-300">Product Image</div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.desc}</p>
                  <div className="font-bold text-lg">{item.price}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="container mx-auto px-4 pb-12 max-w-4xl">
        <h2 className="text-xl font-bold mb-6">빠른 이동</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link href="/cases" className="block">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <span className="text-3xl mb-2 block">📖</span>
                <h3 className="font-bold text-sm">회복 케이스</h3>
              </CardContent>
            </Card>
          </Link>
          <Link href="/lounge" className="block">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <span className="text-3xl mb-2 block">👩‍⚕️</span>
                <h3 className="font-bold text-sm">원장 라운지</h3>
              </CardContent>
            </Card>
          </Link>
          <Link href="/membership" className="block">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <span className="text-3xl mb-2 block">🎖️</span>
                <h3 className="font-bold text-sm">멤버십</h3>
              </CardContent>
            </Card>
          </Link>
          <Link href="/omakase" className="block">
            <Card className="hover:shadow-lg transition-shadow border-gray-900 bg-gray-900 text-white">
              <CardContent className="p-4 text-center">
                <span className="text-3xl mb-2 block">🧬</span>
                <h3 className="font-bold text-sm text-white">오마카세</h3>
              </CardContent>
            </Card>
          </Link>
          <Link href="/utils" className="block">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <span className="text-3xl mb-2 block">🎮</span>
                <h3 className="font-bold text-sm">유틸리티</h3>
              </CardContent>
            </Card>
          </Link>
          <Link href="/products" className="block">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <span className="text-3xl mb-2 block">🛒</span>
                <h3 className="font-bold text-sm">전체 상품</h3>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}

// ---------------------------
// 3. Welcome Modal Component
// ---------------------------
function WelcomeModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = React.useState(false);

  React.useEffect(() => {
    if (searchParams?.get('welcome') === 'true') {
      setShowWelcome(true);
      // URL clean up
      router.replace('/');
    }
  }, [searchParams, router]);

  return (
    <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <DialogTitle className="text-xl font-bold text-center">가입을 축하합니다!</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Youniqle의 회원이 되신 것을 환영합니다.<br />
            이제 당신만의 회복 여정을 시작해보세요.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <Button onClick={() => setShowWelcome(false)} className="w-full">
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------
// 5. Main Component
// ---------------------------
export default function HomePage() {
  const [viewState, setViewState] = React.useState<'CHECK' | 'INTRO' | 'QUESTION' | 'RESULT' | 'DASHBOARD'>('CHECK');
  const [score, setScore] = React.useState(0);
  const [answers, setAnswers] = React.useState<any[]>([]);
  const [userNote, setUserNote] = React.useState('');
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  React.useEffect(() => {
    // Initial Check
    const today = new Date().toISOString().split('T')[0];
    const lastCheck = localStorage.getItem('recovery_last_check');
    const storedScore = localStorage.getItem('recovery_last_score');
    const hasSeenOnboarding = localStorage.getItem('youniqle_onboarding_seen');

    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }

    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/questions/daily');
        if (res.ok) {
          const data = await res.json();
          setQuestions(data.questions);
        } else {
          console.error("Failed to load questions");
        }
      } catch (error) {
        console.error('Failed to fetch daily questions:', error);
      }
    };

    if (lastCheck === today && storedScore) {
      setScore(parseInt(storedScore)); // Stored is already 0-100
      setViewState('DASHBOARD');
      // Ensure header is shown
      window.dispatchEvent(new Event('recovery-gate-passed'));
    } else {
      fetchQuestions();
      setViewState('INTRO');
    }
  }, []);

  const handleStart = () => {
    if (questions.length > 0) {
      setViewState('QUESTION');
    } else {
      // Retry fetching? or just feedback
      fetch('/api/questions/daily')
        .then(res => res.json())
        .then(data => {
          if (data.questions) {
            setQuestions(data.questions);
            setViewState('QUESTION');
          } else {
            alert('질문을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
          }
        })
        .catch(() => alert('네트워크 오류가 발생했습니다.'));
    }
  };

  const handleComplete = (rawScore: number, finalAnswers: any[], note: string) => {
    setScore(rawScore); // This is 0-25 raw score
    setAnswers(finalAnswers);
    setUserNote(note);
    setViewState('RESULT');
  };

  const handleEnterDashboard = () => {
    // recalculate stored score to pass (since dashboard expects 0-100)
    const s = 100 - (score * 4);
    setScore(s);
    setViewState('DASHBOARD');
  };

  // Render appropriate view
  const renderContent = () => {
    if (viewState === 'CHECK') return <div className="min-h-screen bg-white" />; // Loading
    if (viewState === 'INTRO') return <GateIntro onStart={handleStart} />;
    if (viewState === 'QUESTION') return <QuestionForm questions={questions} onComplete={handleComplete} />;
    if (viewState === 'RESULT') return <ResultView score={score} answers={answers} userNote={userNote} onEnter={handleEnterDashboard} />;
    return <RecoveryDashboard score={score} />;
  }

  return (
    <>
      <React.Suspense fallback={null}>
        <WelcomeModal />
      </React.Suspense>
      <OnboardingDialog
        open={showOnboarding}
        onOpenChange={(open) => {
          setShowOnboarding(open);
          if (!open) localStorage.setItem('youniqle_onboarding_seen', 'true');
        }}
      />
      {renderContent()}
    </>
  );
}
