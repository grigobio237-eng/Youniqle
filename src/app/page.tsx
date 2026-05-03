'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, X } from 'lucide-react';

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
  const router = useRouter();

  useEffect(() => {
    const action = searchParams?.get('action');
    const tool = searchParams?.get('tool');

    if (action === 'webtoon') {
      onOpenWebtoon();
      router.replace('/', { scroll: false });
    } else if (action === 'diagnose') {
      onDiagnose();
      router.replace('/', { scroll: false });
    } else if (tool === 'sound') {
      onOpenSound?.();
      router.replace('/', { scroll: false });
    }
  }, [searchParams, onOpenWebtoon, onDiagnose, onOpenSound, router]);

  return null;
}

// ---------------------------
// 4. Main Component
// ---------------------------
export default function HomePage() {
  const { data: session } = useSession();
  const { journey, medicalCategory, treatmentType } = useRecovery();
  const router = useRouter();
  const [viewState, setViewState] = React.useState<'INTRO' | 'QUESTION' | 'RESULT'>('INTRO');
  const [score, setScore] = React.useState(0);
  const [answers, setAnswers] = React.useState<any[]>([]);
  const [userNote, setUserNote] = React.useState('');
  const [analysisData, setAnalysisData] = React.useState<AnalysisResult | null>(null);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [currentQuestionsKey, setCurrentQuestionsKey] = React.useState<string | null>(null);
  const [showWebtoonDialog, setShowWebtoonDialog] = useState(false);
  const [showSoundModal, setShowSoundModal] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  useEffect(() => {
    // welcome=true 인 경우(신규 가입) → 랜딩 그대로 보여줌
    const params = new URLSearchParams(window.location.search);
    const isWelcome = params.get('welcome') === 'true';

    const storedScore = localStorage.getItem('recovery_last_score');

    if (storedScore && !isWelcome) {
      setScore(parseInt(storedScore));
    } else {
      setScore(75); // Default score for preview
    }
  }, []); // Only run once on mount


  const handleOpenWebtoon = React.useCallback(() => setShowWebtoonDialog(true), []);

  const handleStart = async () => {
    setIsDiagnosing(true);
    try {
      // 스캔 결과가 있다면 해당 내용을 키워드로 사용, 없으면 기본 키워드 사용
      const keywords = analysisData 
        ? `${analysisData.summary}, ${analysisData.analysisTable?.map(t => t.label).join(', ')}`
        : "일상 회복, 에너지 레벨, 신체 컨디션";

      const res = await fetch('/api/ai/diagnosis/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: analysisData ? "스캔 데이터 기반 정밀 회복 점검" : "60초 초간편 간편 진단",
          keywords: keywords,
          journey: journey,
          medicalCategory: medicalCategory,
          treatmentType: treatmentType
        })
      });
      
      const data = await res.json();
      if (Array.isArray(data)) {
        setQuestions(data);
        setViewState('QUESTION');
      } else {
        throw new Error("질문을 불러오지 못했습니다.");
      }
    } catch (error) {
      console.error("Diagnosis start error:", error);
      router.push('/dashboard'); // 오류 발생 시에만 대시보드로 이동
    } finally {
      setIsDiagnosing(false);
    }
  };

  const onDiagnosisComplete = async (totalScore: number, finalAnswers: any[], note: string) => {
    setScore(totalScore);
    setAnswers(finalAnswers);
    setUserNote(note);
    setViewState('RESULT');
    
    // 결과 저장 (옵션)
    localStorage.setItem('recovery_last_score', totalScore.toString());
  };

  const renderContent = () => {
    if (viewState === 'QUESTION') {
      return (
        <div className="min-h-screen bg-mist animate-fade-in">
          <DiagnosisForm 
            questions={questions} 
            onComplete={onDiagnosisComplete} 
          />
        </div>
      );
    }

    if (viewState === 'RESULT') {
      return (
        <div className="min-h-screen bg-mist animate-fade-in">
          <ResultDisplay 
            score={score} 
            answers={answers} 
            userNote={userNote}
            analysisData={analysisData}
            onEnter={() => setViewState('INTRO')}
            onOpenWebtoon={handleOpenWebtoon}
          />
        </div>
      );
    }

    return (
      <>
        <Hero onStart={handleStart} isDiagnosing={isDiagnosing} />
        <LandingContent onStart={handleStart} onStartTherapy={() => setShowSoundModal(true)} isDiagnosing={isDiagnosing} />
      </>
    );
  };

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
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none rounded-[40px] shadow-2xl bg-black max-h-[95vh] overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>딥 사운드 테라피</DialogTitle>
            <DialogDescription>회복 주파수와 사운드스케이트로 깊은 이완 경험을 제공합니다.</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <SoundTherapy />
            <button 
              onClick={() => setShowSoundModal(false)}
              className="absolute top-4 left-4 md:top-6 md:left-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full flex items-center gap-2 text-white font-black text-xs transition-all z-50 backdrop-blur-md"
              aria-label="돌아가기"
            >
              <ChevronLeft className="w-4 h-4" /> 돌아가기
            </button>
            <button 
              onClick={() => setShowSoundModal(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
      {renderContent()}
    </>
  );
}
