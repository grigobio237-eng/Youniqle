'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// ---------------------------
// 1. Data & Types
// ---------------------------
type Question = {
  id: number;
  category: string;
  text: string;
  options: { label: string; score: number }[];
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    category: '피로',
    text: '요즘 하루를 마치고 나면 어떤가요?',
    options: [
      { label: '거의 매일 녹초가 돼요 (늘 피곤)', score: 5 },
      { label: '종종 피곤하지만 쉴만 해요', score: 3 },
      { label: '거뜬하고 개운해요 (안 피곤)', score: 0 },
    ],
  },
  {
    id: 2,
    category: '수면',
    text: '최근 1주일 잠은 어떤가요?',
    options: [
      { label: '잠들기 힘들고 자주 깨요', score: 5 },
      { label: '그럭저럭 자는데 개운하진 않아요', score: 3 },
      { label: '머리만 대면 자고 아침에 개운해요', score: 0 },
    ],
  },
  {
    id: 3,
    category: '몸의 무거움/붓기',
    text: '내 몸(다리, 발, 어깨 등)은 어떤 느낌인가요?',
    options: [
      { label: '돌덩이처럼 무겁고 퉁퉁 부어요', score: 5 },
      { label: '오후 되면 좀 붓고 뻐근해요', score: 3 },
      { label: '가볍고 편안해요', score: 0 },
    ],
  },
  {
    id: 4,
    category: '마음과 감정',
    text: '요즘 마음 상태는 어떤가요?',
    options: [
      { label: '아무것도 하기 싫고 짜증만 나요', score: 5 },
      { label: '가끔 답답하지만 컨트롤 가능해요', score: 3 },
      { label: '평안하고 의욕이 있어요', score: 0 },
    ],
  },
  {
    id: 5,
    category: '집중력',
    text: '머리(생각)가 어떤 느낌인가요?',
    options: [
      { label: '늘 안개 낀 것처럼 멍해요', score: 5 },
      { label: '중요한 일에는 집중할 수 있어요', score: 3 },
      { label: '맑고 집중이 아주 잘 돼요', score: 0 },
    ],
  },
];

// ---------------------------
// 2. Sub-Components
// ---------------------------

// A. Gate Intro View
function GateIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md space-y-8"
      >
        <h1 className="text-3xl font-bold text-gray-800">
          안녕하세요.<br />
          잠시 멈춰서,<br />
          <span className="text-primary">나를 돌아볼 시간</span>입니다.
        </h1>
        <p className="text-gray-600">
          1분이면 충분합니다.<br />
          오늘 당신의 몸은 어떤 말을 하고 있나요?
        </p>
        <Button size="lg" onClick={onStart} className="w-full text-lg h-14 rounded-full">
          오늘의 회복 점수 체크하기
        </Button>
        <p className="text-xs text-gray-400">
          * 이 과정은 광고가 아니며, 당신의 회복을 설계하기 위한 첫 단계입니다.
        </p>
      </motion.div>
    </div>
  );
}

// B. Question Form View
function QuestionForm({ onComplete }: { onComplete: (score: number, answers: any[]) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any[]>(new Array(QUESTIONS.length).fill(null));

  const handleOptionSelect = (score: number, label: string) => {
    const currentQ = QUESTIONS[step];
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
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // Calculate total score and finish
      const totalScore = answers.reduce((acc, curr) => acc + (curr?.score || 0), 0);
      const finalAnswers = answers.filter(a => a !== null);
      onComplete(totalScore, finalAnswers);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const currentQ = QUESTIONS[step];
  const currentAnswer = answers[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <div className="max-w-md mx-auto min-h-[80vh] flex flex-col justify-center px-4 py-12">
      {/* Progress */}
      <div className="w-full bg-gray-100 h-2 rounded-full mb-12">
        <motion.div
          className="bg-primary h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
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
          {step === QUESTIONS.length - 1 ? '결과 보기' : '다음'} <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// C. Result & Metaphor View
function ResultView({ score, answers, onEnter }: { score: number; answers: any[]; onEnter: () => void }) {
  // Logic: 0-7 (Low), 8-15 (Mid), 16+ (High)
  let level = 'LOW';
  let title = '아직은 버틸 만한 상태예요.';
  let metaphorTitle = '튼튼한 기초 위에 쌓는 탑';
  let metaphor = 'TOWER';
  let message = '지금의 관리가 더 멋진 미래를 만듭니다. 기초를 단단히 하세요.';
  let icon = <CheckCircle className="w-20 h-20 text-green-500" />;

  if (score >= 8 && score <= 15) {
    level = 'MID';
    title = '요즘, 몸과 마음이 꽤 지쳐 있어요.';
    metaphorTitle = '멈춰 선 시계와 녹슨 부품';
    metaphor = 'CLOCK';
    message = '작은 멈춤이 고장을 막습니다. 지금은 정비가 필요한 시간입니다.';
    icon = <RefreshCw className="w-20 h-20 text-yellow-500" />;
  } else if (score >= 16) {
    level = 'HIGH';
    title = '지금은 ‘버티는 시간’이 아니라 ‘돌아봐야 할 시간’입니다.';
    metaphorTitle = '함께 걷는 두 발자국';
    metaphor = 'FOOTPRINTS';
    message = '혼자 버티지 마세요. 이제 함께 회복을 설계할 때입니다.';
    icon = <div className="text-6xl">👣</div>;
  }

  // Convert raw score (0-25) to 100 scale roughly
  // Raw 0 (Best) -> 100.
  // Raw 25 (Worst) -> 0.
  const recoveryScore = 100 - (score * 4);

  useEffect(() => {
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
            answers: answers
          })
        });
      } catch (e) {
        console.error('Failed to save recovery score to DB', e);
      }
    };
    saveData();
  }, [recoveryScore, score, metaphor, answers]);

  return (
    <div className="max-w-md mx-auto min-h-[80vh] flex flex-col justify-center px-4 text-center space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-600">오늘의 회복 점수</h2>
        <div className="text-6xl font-black text-primary">{recoveryScore}점</div>
      </div>

      <div className="p-8 bg-gray-50 rounded-2xl space-y-4">
        <div className="flex justify-center">{icon}</div>
        <h3 className="text-xl font-bold">{metaphorTitle}</h3>
        <p className="text-gray-600 word-keep-all">{title}</p>
        <p className="text-sm text-gray-500 pt-4 border-t">{message}</p>
      </div>

      <Button size="lg" onClick={onEnter} className="w-full text-lg h-14 rounded-full animate-bounce">
        나의 회복 OS 입장하기 <ArrowRight className="ml-2" />
      </Button>
    </div>
  );
}

// D. Main Dashboard (Recovery OS)
function RecoveryDashboard({ score }: { score: number }) {
  // Use stored score if not passed directly (revisit)
  const displayScore = score;

  return (
    <div className="min-h-screen pb-20">
      {/* Top Banner / Summary */}
      <section className="bg-primary/5 py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-2">오늘의 회복 컨디션</h1>
        <div className="text-5xl font-black text-primary mb-4">{displayScore}점</div>
        <p className="text-gray-600 mb-8">
          "오늘 딱 하나만 해보세요: <b>3분 리셋 스트레칭</b>"
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/ai-navigator">AI 코치에게 조언 듣기</Link>
          </Button>
          <Button asChild>
            <Link href="/cases">다른 사람의 회복 보기</Link>
          </Button>
        </div>
      </section>

      {/* 6 Categories Preview/Links */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-xl font-bold mb-6">회복 OS 메뉴</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/start" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <span className="text-2xl mb-2 block">🌱</span>
                <h3 className="font-bold mb-2">회복 시작하기</h3>
                <p className="text-sm text-gray-500">회복의 철학과 기초</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/cases" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <span className="text-2xl mb-2 block">🔍</span>
                <h3 className="font-bold mb-2">리얼 회복 케이스</h3>
                <p className="text-sm text-gray-500">신뢰와 동기부여</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/lounge" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <span className="text-2xl mb-2 block">👩‍⚕️</span>
                <h3 className="font-bold mb-2">원장 라운지</h3>
                <p className="text-sm text-gray-500">전문가 칼럼 & FAQ</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/ai-navigator" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <span className="text-2xl mb-2 block">🤖</span>
                <h3 className="font-bold mb-2">AI 회복 네비게이터</h3>
                <p className="text-sm text-gray-500">매일의 맞춤 코칭</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/membership" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <span className="text-2xl mb-2 block">🎁</span>
                <h3 className="font-bold mb-2">멤버십 & 상점</h3>
                <p className="text-sm text-gray-500">리워드 확인 및 쇼핑</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/omakase" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow border-gray-900 bg-gray-900 text-white">
              <CardContent className="p-6">
                <span className="text-2xl mb-2 block">🧬</span>
                <h3 className="font-bold mb-2 text-white">비밀 회복 오마카세</h3>
                <p className="text-sm text-gray-400">1:1 맞춤 설계 (비공개)</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}

// ---------------------------
// 3. Main Component
// ---------------------------
export default function HomePage() {
  const [viewState, setViewState] = useState<'CHECK' | 'INTRO' | 'QUESTION' | 'RESULT' | 'DASHBOARD'>('CHECK');
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);

  useEffect(() => {
    // Initial Check
    const today = new Date().toISOString().split('T')[0];
    const lastCheck = localStorage.getItem('recovery_last_check');
    const storedScore = localStorage.getItem('recovery_last_score');

    if (lastCheck === today && storedScore) {
      setScore(parseInt(storedScore)); // Stored is already 0-100
      setViewState('DASHBOARD');
      // Ensure header is shown
      window.dispatchEvent(new Event('recovery-gate-passed'));
    } else {
      setViewState('INTRO');
    }
  }, []);

  const handleStart = () => setViewState('QUESTION');

  const handleComplete = (rawScore: number, finalAnswers: any[]) => {
    setScore(rawScore); // This is 0-25 raw score
    setAnswers(finalAnswers);
    setViewState('RESULT');
  };

  const handleEnterDashboard = () => {
    // recalculate stored score to pass (since dashboard expects 0-100)
    // Actually ResultView saves the 100-scale score to localStorage and state needs it too?
    // Let's grab it from localStorage to be safe or calc
    const s = 100 - (score * 4);
    setScore(s);
    setViewState('DASHBOARD');
  };

  // Render appropriate view
  if (viewState === 'CHECK') return <div className="min-h-screen bg-white" />; // Loading
  if (viewState === 'INTRO') return <GateIntro onStart={handleStart} />;
  if (viewState === 'QUESTION') return <QuestionForm onComplete={handleComplete} />;
  if (viewState === 'RESULT') return <ResultView score={score} answers={answers} onEnter={handleEnterDashboard} />;

  return <RecoveryDashboard score={score} />;
}
