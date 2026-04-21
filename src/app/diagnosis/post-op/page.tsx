'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Camera, ShieldCheck, Sparkles, Loader2, ArrowLeft, 
  CheckCircle2, AlertCircle, Calendar, MessageSquare, Image as ImageIcon,
  ChevronRight, Activity, X, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRecovery } from '@/contexts/RecoveryContext';

interface DynamicQuestion {
  id: string;
  category: string;
  question: string;
  options: { label: string; score: number; }[];
}

export default function PostOpSurveyPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { journey } = useRecovery();
  
  const [step, setStep] = useState<'loading' | 'intro' | 'questions' | 'photo' | 'analyzing' | 'result'>('loading');
  const [questions, setQuestions] = useState<DynamicQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Redirect to the new premium flow for better experience
  useEffect(() => {
    if (!session) {
      router.push('/login?callbackUrl=/event/post-care');
      return;
    }
    
    // Redirect to the newly implemented premium post-care flow
    router.replace('/event/post-care');
  }, [session, router]);


  const handleAnswer = (score: number) => {
    const q = questions[currentQuestionIdx];
    setAnswers(prev => ({ ...prev, [q.category]: score }));
    
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setStep('photo');
    }
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setCapturedImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const submitAnalysis = async () => {
    setStep('analyzing');
    try {
      // 1. AI 분석 수행 (Vision + Question context)
      const res = await fetch('/api/ai/post-op/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: capturedImage,
          answers,
          surgeryType: '성형외과 시술',
          userName: session?.user?.name
        })
      });
      const aiData = await res.json();
      setAnalysisResult(aiData);

      // 2. DB 저장
      await fetch('/api/scan/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'POST_OP',
          imageData: capturedImage,
          score: aiData.recoveryScore,
          summary: aiData.summary,
          metrics: {
            answers,
            aiAnalysis: aiData.detailedAnalysis,
            dDay: 3
          }
        })
      });

      setStep('result');
      toast.success("오늘의 사후 케어 기록이 완료되었습니다.");
    } catch (error) {
      toast.error("분석 중 오류가 발생했습니다.");
      setStep('photo');
    }
  };

  // --- UI Components ---
  
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-chapter-accent animate-spin mb-6" />
        <p className="text-sm font-black tracking-widest uppercase animate-pulse">Initializing Personal Care...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist p-6 md:p-12 font-sans overflow-x-hidden">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar (Visible during questions) */}
        {step === 'questions' && (
          <div className="mb-8 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate/50">
              <span>Care Progress</span>
              <span>{currentQuestionIdx + 1} / {questions.length}</span>
            </div>
            <Progress value={((currentQuestionIdx + 1) / questions.length) * 100} className="h-1 bg-line/20" />
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8 text-center py-10">
              <div className="w-24 h-24 bg-chapter-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-chapter-accent fill-chapter-accent" />
              </div>
              <div className="space-y-4">
                <h1 className="text-3xl md:text-5xl font-black text-obsidian tracking-tight">
                  {session?.user?.name}님을 위한<br />정밀 사후 케어
                </h1>
                <p className="text-slate/60 font-bold text-lg px-4 break-keep">
                  오늘은 수술 후 3일차입니다. 세심한 문진과 기록을 통해<br />최적의 회복 상태를 지향합니다.
                </p>
              </div>
              <Button 
                onClick={() => setStep('questions')} 
                size="lg" 
                className="w-full h-20 bg-obsidian text-white rounded-3xl text-xl font-black shadow-2xl hover:scale-[1.02] transition-all"
              >
                문진 시작하기 <ChevronRight className="ml-2 w-6 h-6" />
              </Button>
            </motion.div>
          )}

          {step === 'questions' && questions[currentQuestionIdx] && (
            <motion.div key="questions" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-chapter-accent/10 text-chapter-accent border-none font-black uppercase px-4 py-1.5 rounded-full text-[10px] tracking-widest">
                  {questions[currentQuestionIdx].category} check
                </Badge>
                <h2 className="text-2xl md:text-3xl font-black text-obsidian leading-tight break-keep italic">
                  {'"'}{questions[currentQuestionIdx].question}{'"'}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {questions[currentQuestionIdx].options.map((opt, idx) => (
                  <Button 
                    key={idx} 
                    onClick={() => handleAnswer(opt.score)}
                    variant="outline" 
                    className="h-16 rounded-2xl border-2 border-line/30 hover:border-chapter-accent hover:bg-chapter-accent/5 text-obsidian font-bold text-lg justify-between px-8"
                  >
                    {opt.label} <ArrowLeft className="w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100" />
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'photo' && (
            <motion.div key="photo" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
               <div className="text-center space-y-4">
                <h2 className="text-3xl font-black text-obsidian">환부 사진 기록 (선택)</h2>
                <p className="text-slate/60 font-bold px-6 break-keep">
                  사진을 남기시면 유니클이 부기 정도와 회복 경과를 실시간으로 분석해 드립니다. 기록된 사진은 개인 보호를 위해 암호화 저장됩니다.
                </p>
              </div>

              <div className="aspect-square w-full max-w-sm mx-auto rounded-[40px] border-4 border-dashed border-line/30 bg-white/50 flex flex-col items-center justify-center relative overflow-hidden group">
                {capturedImage ? (
                  <>
                    <img src={capturedImage} alt="Capture preview" className="w-full h-full object-cover" />
                    <Button 
                      onClick={() => setCapturedImage(null)} 
                      className="absolute top-4 right-4 bg-black/50 backdrop-blur-md rounded-full w-10 h-10 p-0"
                    >
                      <X className="w-5 h-5 text-white" />
                    </Button>
                  </>
                ) : (
                  <div className="text-center p-8 space-y-4">
                    <div className="w-20 h-20 bg-mist rounded-full flex items-center justify-center mx-auto mb-2">
                       <Camera className="w-10 h-10 text-slate/30" />
                    </div>
                    <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="rounded-full border-slate/20 text-slate/70 font-black text-xs uppercase tracking-widest">
                      사진 촬영 또는 첨부
                    </Button>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageCapture} 
                  aria-label="환부 사진 업로드"
                  title="환부 사진 업로드"
                />
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  onClick={submitAnalysis} 
                  size="lg" 
                  disabled={isSubmitting}
                  className="w-full h-20 bg-chapter-accent text-white rounded-3xl text-xl font-black shadow-2xl"
                >
                  분석 완료 및 저장 <Sparkles className="ml-2 w-6 h-6" />
                </Button>
                <Button 
                  onClick={() => {
                    setCapturedImage(null);
                    submitAnalysis();
                  }} 
                  variant="ghost" 
                  className="text-slate/50 font-bold"
                >
                  사진 없이 기록하기
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 space-y-8">
              <div className="relative w-40 h-40 mx-auto">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-t-4 border-chapter-accent rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="w-16 h-16 text-chapter-accent animate-pulse" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-obsidian uppercase italic">Youniqle Analyzing Recovery...</h3>
                <p className="text-slate/60 font-bold animate-pulse">유니클이 회복 징후와 문진 내용을 매칭하고 있습니다.</p>
              </div>
            </motion.div>
          )}

          {step === 'result' && analysisResult && (
            <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <Card className="rounded-[40px] border-none bg-white shadow-2xl overflow-hidden">
                <div className="bg-obsidian p-10 text-center space-y-6">
                  <div className="inline-flex items-center gap-2 bg-chapter-accent/20 px-4 py-1.5 rounded-full mb-2">
                    <ShieldCheck className="w-4 h-4 text-chapter-accent" />
                    <span className="text-[10px] font-black uppercase text-chapter-accent tracking-widest">Premium Care Log</span>
                  </div>
                  <h3 className="text-4xl font-black text-white italic">Recovery Score: {analysisResult.recoveryScore}</h3>
                  <p className="text-white/60 font-medium px-8 break-keep italic">
                    &quot;{analysisResult.summary}&quot;
                  </p>
                </div>
                <CardContent className="p-10 space-y-8">
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate/50">
                       <MessageSquare className="w-4 h-4" /> 유니클 케어 가이드
                    </h4>
                    <div className="bg-mist/30 p-6 rounded-[32px] border border-line/40 text-obsidian font-bold leading-relaxed">
                      {analysisResult.detailedAnalysis}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-5 rounded-3xl bg-mist border border-line flex flex-col items-center justify-center text-center">
                        <Activity className="w-6 h-6 text-chapter-accent mb-2" />
                        <span className="text-[9px] font-black text-slate/50 uppercase tracking-widest">부기 상태</span>
                        <span className="text-sm font-black text-obsidian">{analysisResult.metrics.swellingLevel}</span>
                     </div>
                     <div className="p-5 rounded-3xl bg-mist border border-line flex flex-col items-center justify-center text-center">
                        <Calendar className="w-6 h-6 text-reward-gold mb-2" />
                        <span className="text-[9px] font-black text-slate/50 uppercase tracking-widest">회복 속도</span>
                        <span className="text-sm font-black text-obsidian">{analysisResult.metrics.pace}</span>
                     </div>
                  </div>

                  <Button onClick={() => router.push('/ai-navigator')} className="w-full h-18 bg-chapter-accent text-white rounded-2xl font-black shadow-xl">
                    대시보드에서 변화 확인하기
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// End of Page

