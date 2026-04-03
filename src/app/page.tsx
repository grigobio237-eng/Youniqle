'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import { useRecovery } from '@/contexts/RecoveryContext';
import { Question } from '@/types/diagnosis';
const DiagnosisForm = dynamic(() => import('@/components/home/DiagnosisForm'), { ssr: false });
const ResultDisplay = dynamic(() => import('@/components/home/ResultDisplay'), { ssr: false });
const DashboardPreview = dynamic(() => import('@/components/home/DashboardPreview'), { ssr: false });
const WebtoonChallengeDialog = dynamic(() => import('@/components/home/WebtoonChallengeDialog'), { ssr: false });
const LandingContent = dynamic(() => import('@/components/home/LandingContent'), { ssr: false });

// ---------------------------
// 2. Welcome Modal Component
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
// 3. Helper Components
// ---------------------------
function SearchParamsHandler({
  onOpenWebtoon,
  onDiagnose
}: {
  onOpenWebtoon: () => void;
  onDiagnose: () => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get('action') === 'webtoon') {
      onOpenWebtoon();
    }
    if (searchParams?.get('action') === 'diagnose') {
      onDiagnose();
    }
  }, [searchParams, onOpenWebtoon, onDiagnose]);

  return null;
}

// ---------------------------
// 4. Main Component
// ---------------------------
export default function HomePage() {
  const { journey } = useRecovery();
  const router = useRouter();
  const [viewState, setViewState] = React.useState<'CHECK' | 'INTRO' | 'QUESTION' | 'RESULT' | 'DASHBOARD'>('CHECK');
  const [score, setScore] = React.useState(0);
  const [answers, setAnswers] = React.useState<any[]>([]);
  const [userNote, setUserNote] = React.useState('');
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [currentQuestionsJourney, setCurrentQuestionsJourney] = React.useState<string | null>(null);
  const [showWebtoonDialog, setShowWebtoonDialog] = useState(false);

  useEffect(() => {
    // welcome=true 인 경우(신규 가입) → 랜딩 그대로 보여줌
    const params = new URLSearchParams(window.location.search);
    const isWelcome = params.get('welcome') === 'true';

    const storedScore = localStorage.getItem('recovery_last_score');

    if (storedScore && !isWelcome) {
      setScore(parseInt(storedScore));
      setViewState('INTRO'); // 기존 DASHBOARD 및 강제 리다이렉트 제거: 재접속 시 무조건 랜딩/히어로 섹션 노출
    } else {
      setScore(75); // Default score for preview
      setViewState('INTRO');
    }
  }, []); // Only run once on mount


  const handleOpenWebtoon = React.useCallback(() => setShowWebtoonDialog(true), []);

  const handleStart = async () => {
    // If we already have questions for the CURRENT journey, just show them
    if (questions.length > 0 && currentQuestionsJourney === journey) {
      setViewState('QUESTION');
      return;
    }

    // Otherwise, fetch context-specific questions
    try {
      const res = await fetch(`/api/questions/daily?journey=${journey || 'WELLNESS'}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
        setCurrentQuestionsJourney(journey || 'WELLNESS');
        setViewState('QUESTION');
      } else {
        alert('맞춤 문항을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      alert('네트워크 오류가 발생했습니다.');
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
    // 대시보드 상태를 활성화하지 않고(화면 깜빡임 방지), 백그라운드에서 바로 진단 페이지로 라우팅
    router.push('/ai-navigator');
  };

  // Render appropriate view
  const renderContent = () => {
    if (viewState === 'CHECK') return <div className="min-h-screen bg-mist" />; // Loading
    if (viewState === 'QUESTION') return <DiagnosisForm questions={questions} onComplete={handleComplete} />;
    if (viewState === 'RESULT') return <ResultDisplay score={score} answers={answers} userNote={userNote} onEnter={handleEnterDashboard} onOpenWebtoon={() => setShowWebtoonDialog(true)} />;
    if (viewState === 'DASHBOARD') return <DashboardPreview score={score} onOpenWebtoon={handleOpenWebtoon} />;
    
    // Default: Always show Hero + LandingContent (INTRO)
    return (
      <>
        <Hero onStart={handleStart} />
        <LandingContent onStart={handleStart} />
      </>
    );
  }

  return (
    <>
      <React.Suspense fallback={<div className="min-h-[100px] flex items-center justify-center">...</div>}>
        <WelcomeModal />
        <SearchParamsHandler
          onOpenWebtoon={handleOpenWebtoon}
          onDiagnose={handleStart}
        />
      </React.Suspense>
      <WebtoonChallengeDialog
        open={showWebtoonDialog}
        onOpenChange={setShowWebtoonDialog}
        recoveryData={{ score, answers, userNote }}
      />
      {renderContent()}
    </>
  );
}
