'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import Hero from '@/components/home/Hero';
import { useRecovery } from '@/contexts/RecoveryContext';
import { Question } from '@/types/diagnosis';
import { AnalysisResult } from '@/components/home/HeroScanner';
const DiagnosisForm = dynamic(() => import('@/components/home/DiagnosisForm'), { ssr: false });
const ResultDisplay = dynamic(() => import('@/components/home/ResultDisplay'), { ssr: false });
const DashboardPreview = dynamic(() => import('@/components/home/DashboardPreview'), { ssr: false });
const WebtoonChallengeDialog = dynamic(() => import('@/components/home/WebtoonChallengeDialog'), { ssr: false });
const LandingContent = dynamic(() => import('@/components/home/LandingContent'), { ssr: false });
const SoundTherapy = dynamic(() => import('@/components/utils/SoundTherapy'), { ssr: false });

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
  onDiagnose,
  onOpenSound
}: {
  onOpenWebtoon: () => void;
  onDiagnose: () => void;
  onOpenSound?: () => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get('action') === 'webtoon') {
      onOpenWebtoon();
    }
    if (searchParams?.get('action') === 'diagnose') {
      onDiagnose();
    }
    if (searchParams?.get('tool') === 'sound') {
      onOpenSound?.();
    }
  }, [searchParams, onOpenWebtoon, onDiagnose, onOpenSound]);

  return null;
}

// ---------------------------
// 4. Main Component
// ---------------------------
export default function HomePage() {
  const { data: session } = useSession();
  const { journey, medicalCategory } = useRecovery();
  const router = useRouter();
  const [viewState, setViewState] = React.useState<'CHECK' | 'INTRO' | 'QUESTION' | 'RESULT'>('CHECK');
  const [score, setScore] = React.useState(0);
  const [answers, setAnswers] = React.useState<any[]>([]);
  const [userNote, setUserNote] = React.useState('');
  const [analysisData, setAnalysisData] = React.useState<AnalysisResult | null>(null);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [currentQuestionsKey, setCurrentQuestionsKey] = React.useState<string | null>(null);
  const [showWebtoonDialog, setShowWebtoonDialog] = useState(false);
  const [showSoundModal, setShowSoundModal] = useState(false);

  useEffect(() => {
    // welcome=true 인 경우(신규 가입) → 랜딩 그대로 보여줌
    const params = new URLSearchParams(window.location.search);
    const isWelcome = params.get('welcome') === 'true';

    const storedScore = localStorage.getItem('recovery_last_score');

    if (storedScore && !isWelcome) {
      setScore(parseInt(storedScore));
      setViewState('INTRO'); 
    } else {
      setScore(75); // Default score for preview
      setViewState('INTRO');
    }
  }, []); // Only run once on mount


  const handleOpenWebtoon = React.useCallback(() => setShowWebtoonDialog(true), []);

  const handleStart = async (data?: AnalysisResult) => {
    if (data) setAnalysisData(data);
    const cacheKey = `${journey}-${medicalCategory}`;
    // If we already have questions for the CURRENT journey and medical category, just show them
    if (questions.length > 0 && currentQuestionsKey === cacheKey) {
      setViewState('QUESTION');
      return;
    }

    // Otherwise, fetch context-specific questions
    try {
      const url = `/api/questions/daily?journey=${journey || 'WELLNESS'}${medicalCategory ? `&medicalCategory=${medicalCategory}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
        setCurrentQuestionsKey(cacheKey);
        setViewState('QUESTION');
      } else {
        alert('맞춤 문항을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  const handleComplete = async (rawScore: number, finalAnswers: any[], note: string) => {
    setScore(rawScore); // This is 0-25 raw score
    setAnswers(finalAnswers);
    setUserNote(note);
    setViewState('RESULT');

    // 로그인한 경우 DB에 자동 저장
    if (session?.user?.email) {
      try {
        const unifiedScore = 100 - (rawScore * 4);
        await fetch('/api/diagnosis/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'daily',
            result: {
              totalScore: unifiedScore,
              convertedScores: {
                physical: unifiedScore, // 60초 진단은 대표 점수를 모든 카테고리에 일단 할당
                mental: unifiedScore,
                lifestyle: unifiedScore,
                sleep: unifiedScore
              }
            },
            answers: finalAnswers.reduce((acc, curr) => {
              acc[curr.questionId] = curr.score;
              return acc;
            }, {})
          })
        });
        console.log('Daily diagnosis saved to DB');
      } catch (error) {
        console.error('Failed to save daily diagnosis:', error);
      }
    }
    
    // 로컬 스토리지에도 항상 저장 (Dashboard 연동용)
    localStorage.setItem('recovery_last_score', (100 - (rawScore * 4)).toString());
  };

  const handleEnterDashboard = () => {
    router.push('/ai-navigator');
  };

  // Render appropriate view
  const renderContent = () => {
    if (viewState === 'CHECK') return <div className="min-h-screen bg-mist" />; // Loading
    if (viewState === 'QUESTION') return <DiagnosisForm questions={questions} onComplete={handleComplete} />;
    if (viewState === 'RESULT') return <ResultDisplay score={score} answers={answers} userNote={userNote} analysisData={analysisData} onEnter={handleEnterDashboard} onOpenWebtoon={() => setShowWebtoonDialog(true)} />;
    
    // Default: Always show Hero + LandingContent (INTRO)
    return (
      <>
        <Hero onStart={handleStart} />
        <LandingContent onStart={handleStart} onStartTherapy={() => setShowSoundModal(true)} />
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
          onOpenSound={() => setShowSoundModal(true)}
        />
      </React.Suspense>
      <WebtoonChallengeDialog
        open={showWebtoonDialog}
        onOpenChange={setShowWebtoonDialog}
        recoveryData={{ score, answers, userNote }}
      />
      <Dialog open={showSoundModal} onOpenChange={setShowSoundModal}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-none overflow-hidden sm:rounded-[40px]">
          <SoundTherapy />
        </DialogContent>
      </Dialog>
      {renderContent()}
    </>
  );
}
