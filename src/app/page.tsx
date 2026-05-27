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
const SoundTherapy = dynamic(() => import('@/components/utils/SoundTherapy'), { ssr: false });
const SnapInput = dynamic(() => import('@/components/home/SnapInput'), { ssr: false });

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
      <DialogContent className="sm:max-w-md text-center rounded-5xl border-none p-10 bg-surface shadow-2xl shadow-primary/5">
        <DialogHeader>
          <div className="mx-auto bg-secondary-container/30 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">✨</span>
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-foreground">반가워요!</DialogTitle>
          <DialogDescription className="text-center pt-3 text-foreground/60 leading-relaxed text-base">
            유니클의 가족이 되신 것을 진심으로 환영합니다.<br />
            당신의 평온한 회복 여정을 우리가 함께할게요.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-8">
          <Button onClick={() => setShowWelcome(false)} className="w-full">
            여정 시작하기
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
  const [viewState, setViewState] = React.useState<'INTRO' | 'SNAP' | 'QUESTION' | 'RESULT'>('INTRO');
  const [snapData, setSnapData] = React.useState<{ type: 'PHOTO' | 'TEXT'; content: string | File } | null>(null);
  const [score, setScore] = React.useState(0);
  const [answers, setAnswers] = React.useState<any[]>([]);
  const [userNote, setUserNote] = React.useState('');
  const [analysisData, setAnalysisData] = React.useState<AnalysisResult | null>(null);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [currentQuestionsKey, setCurrentQuestionsKey] = React.useState<string | null>(null);
  const [showWebtoonDialog, setShowWebtoonDialog] = useState(false);
  const [showSoundModal, setShowSoundModal] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [scannerImage, setScannerImage] = useState<string | undefined>(undefined);

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

  const handleStart = async (data?: AnalysisResult, image?: string) => {
    // If we already have the Gemini analysis result data, proceed with dynamic question generation
    if (data) {
      setIsDiagnosing(true);
      try {
        const keywords = data.summary || "회복 기록 분석";
        const medHistory = localStorage.getItem('recovery_med_history') || "";
        
        const res = await fetch('/api/ai/diagnosis/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            theme: "스냅 기반 맞춤형 리듬체크",
            keywords: keywords,
            journey: journey,
            medicalCategory: medicalCategory,
            treatmentType: treatmentType,
            medicationHistory: medHistory
          })
        });
        
        const resData = await res.json();
        if (Array.isArray(resData)) {
          setQuestions(resData);
          setViewState('QUESTION');
        } else {
          throw new Error("질문을 불러오지 못했습니다.");
        }
      } catch (err) {
        console.error("Generate questions failed:", err);
        router.push('/dashboard');
      } finally {
        setIsDiagnosing(false);
      }
      return;
    }
    
    // Normal snap entry from home screen
    setViewState('SNAP');
  };

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      // Bind event listeners FIRST before setting src to avoid mobile race conditions
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/webp', 0.8));
        } catch (err) {
          console.error("Canvas compression error, fallback to original:", err);
          resolve(base64);
        }
      };
      img.onerror = (err) => {
        console.error("Image load error during compression, fallback to original:", err);
        resolve(base64); // Fallback to original
      };
      img.src = base64;
    });
  };

  const handleSnapComplete = async (data: { type: 'PHOTO' | 'TEXT'; content: string | File }) => {
    setSnapData(data);
    setIsDiagnosing(true);
    try {
      let contentStr = typeof data.content === 'string' ? data.content : "";
      
      // Compress image on mobile/client side to avoid 413 payload limit
      if (data.type === 'PHOTO' && contentStr) {
        try {
          contentStr = await compressImage(contentStr);
        } catch (compressErr) {
          console.error("Image compression failed, using original:", compressErr);
        }
      }
      
      // 1. Run Gemini AI image/text analysis first
      const response = await fetch('/api/ai/life-snap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: contentStr, 
          journey: journey, 
          snapType: data.type === 'PHOTO' ? 'OTHER' : 'ROUTINE'
        })
      });
      
      if (!response.ok) throw new Error('Gemini analysis failed');
      const analysisRes = await response.json();
      
      // Auto save scan record
      try {
        await fetch('/api/scan/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: analysisRes.type || 'OTHER',
            imageData: data.type === 'PHOTO' ? contentStr : undefined,
            score: analysisRes.matchScore,
            summary: analysisRes.summary,
            metrics: { ...analysisRes.analysisTable, futureDirection: analysisRes.futureDirection }
          })
        });
      } catch (saveErr) {
        console.error("Auto save scan failed:", saveErr);
      }

      // Save analysis results to state
      setAnalysisData(analysisRes);
      if (data.type === 'PHOTO') {
        setScannerImage(contentStr);
      }
      
      // Return to intro screen; HeroScanner will pick up initialAnalysisData and show result view!
      setViewState('INTRO');
      
    } catch (error) {
      console.error("Snap analysis error:", error);
      router.push('/dashboard');
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

    // 약물 정보가 있다면 별도로 저장하여 다음 질문에 반영
    const medAnswer = finalAnswers.find(a => a.category === '약물' && a.detail);
    if (medAnswer?.detail) {
      localStorage.setItem('recovery_med_history', medAnswer.detail);
    }
  };

  const renderContent = () => {
    if (viewState === 'SNAP') {
      return (
        <SnapInput 
          onComplete={handleSnapComplete}
          onCancel={() => {
            setViewState('INTRO');
            setScannerImage(undefined);
          }}
          initialImage={scannerImage}
          isDiagnosing={isDiagnosing}
        />
      );
    }

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
            snapData={snapData}
            onEnter={() => router.push('/dashboard')}
            onOpenWebtoon={handleOpenWebtoon}
          />
        </div>
      );
    }

    return (
      <>
        <Hero 
          onStart={handleStart} 
          isDiagnosing={isDiagnosing} 
          initialAnalysisData={analysisData}
          initialImage={scannerImage}
        />
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
