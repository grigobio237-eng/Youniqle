'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, Activity, Sparkles } from 'lucide-react';
import { useRecovery } from '@/contexts/RecoveryContext';
import { Question } from '@/types/diagnosis';

export default function DiagnosisForm({ questions, onComplete }: { questions: Question[]; onComplete: (score: number, answers: any[], userNote: string) => void }) {
  const { journey } = useRecovery();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any[]>(new Array(questions.length).fill(null));
  const [userNote, setUserNote] = useState('');

  // Context-aware Header
  const getHeaderInfo = () => {
    switch (journey) {
      case 'CLINICAL_PRE':
        return {
          title: "성공적인 시술을 위한 컨디션 체크",
          sub: "안전하고 확실한 결과를 위한 준비 단계를 점검합니다"
        };
      case 'CLINICAL_POST':
        return {
          title: "회복의 골든타임, 72시간 집중 케어",
          sub: "이상 증상을 예방하고 회복 속도를 극대화하는 시간입니다"
        };
      default:
        return {
          title: "당신에게 딱 맞는 회복 플랜을 완성합니다",
          sub: "데이터 기반으로 설계하는 나만의 일상 리듬"
        };
    }
  };

  const header = getHeaderInfo();

  const handleOptionSelect = (score: number, label: string) => {
    const currentQ = questions[step];
    const newAnswers = [...answers];
    newAnswers[step] = {
      questionId: currentQ.id,
      category: currentQ.category,
      score: score,
      answer: label,
      detail: answers[step]?.detail || ''
    };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
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

  if (!questions || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-slate font-medium">질문을 불러오는 중입니다...</div>
      </div>
    );
  }

  const currentQ = questions[step];
  const currentAnswer = answers[step];
  const progress = ((step + 1) / questions.length) * 100;
  const isLastStep = step === questions.length - 1;

  // Medicine Check
  const isMedicineQuestion = currentQ.category === '약물' || currentQ.text.includes('복용') || currentQ.text.includes('약');

  return (
    <div className="max-w-md mx-auto min-h-[80vh] flex flex-col justify-center px-4 py-8 md:py-12">
      {/* Header Nudge */}
      <div className="mb-12 text-center space-y-2 animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-black text-obsidian tracking-tight break-keep">{header.title}</h1>
        <p className="text-sm text-slate/50 font-bold uppercase tracking-widest">{header.sub}</p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-3">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-chapter-accent uppercase tracking-widest block">Progress</span>
            <span className="text-sm font-bold text-slate">
              {step + 1}번째 질문 <span className="text-slate/30">/ {questions.length}</span>
            </span>
          </div>
          <span className="text-2xl font-black text-chapter-accent italic">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-mist h-3 rounded-full overflow-hidden border border-line/30">
          <motion.div
            className="bg-chapter-accent h-full rounded-full shadow-[0_0_10px_rgba(var(--chapter-accent-rgb),0.3)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
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
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-chapter-accent/10 border border-chapter-accent/20">
              <Activity className="w-3 h-3 text-chapter-accent" />
              <span className="text-[10px] font-black text-chapter-accent uppercase tracking-widest">{currentQ.category}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-obsidian leading-[1.2] tracking-tight break-keep">
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

          {/* Conditional Medicine Detail Input */}
          {isMedicineQuestion && currentAnswer && currentAnswer.score > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3 pt-2"
            >
              <label className="text-sm font-bold text-chapter-accent flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> 어떤 약물을 복용 중이신가요?
              </label>
              <textarea
                value={currentAnswer.detail || ''}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[step] = { ...currentAnswer, detail: e.target.value };
                  setAnswers(newAnswers);
                }}
                placeholder="예: 아스피린, 혈압약, 영양제 등"
                className="w-full p-4 bg-mist/30 border border-line/50 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px] resize-none text-sm font-medium"
              />
              <p className="text-[10px] text-slate/50 leading-relaxed italic">
                * 입력해주신 정보는 유니클이 당신의 상태를 더 정확히 분석하는 데 사용됩니다.
              </p>
            </motion.div>
          )}

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
