'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, Activity, Sparkles, ArrowRight } from 'lucide-react';
import { useRecovery } from '@/contexts/RecoveryContext';
import { Question } from '@/types/diagnosis';

export default function DiagnosisForm({ questions, onComplete }: { questions: Question[]; onComplete: (score: number, answers: any[], userNote: string) => void }) {
  const { journey, treatmentType } = useRecovery();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any[]>(new Array(questions.length).fill(null));
  const [userNote, setUserNote] = useState('');

  // Context-aware Header
  const getHeaderInfo = () => {
    const typeLabel = treatmentType === 'SURGERY' ? '수술' : '시술';
    
    switch (journey) {
      case 'CLINICAL_PRE':
        return {
          title: "어제와 다른 오늘을 발견하는 시간",
          sub: "60초의 리듬체크로 당신의 오늘을 기록합니다"
        };
      case 'CLINICAL_POST':
        return {
          title: "조금씩 쌓이는 회복의 신호를 읽습니다",
          sub: "작은 기록들이 모여 당신만의 회복 지도가 됩니다"
        };
      default:
        return {
          title: "당신의 오늘을 조용히 비추어봅니다",
          sub: "정답은 없습니다. 지금 느껴지는 그대로를 남겨주세요"
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
    <div className="max-w-md mx-auto min-h-[85vh] flex flex-col justify-between px-6 py-10 md:py-16 bg-mist/20 rounded-[48px]">
      <div className="flex-1 flex flex-col justify-center">
        {/* Header Nudge */}
        <div className="mb-12 text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-black text-obsidian tracking-tighter italic font-serif leading-tight">{header.title}</h1>
          <p className="text-[10px] text-chapter-accent font-black uppercase tracking-[0.2em]">{header.sub}</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-12 px-2">
          <div className="flex justify-between items-end mb-4">
            <span className="text-[10px] font-black text-slate/40 uppercase tracking-widest">
              STEP {step + 1} OF {questions.length}
            </span>
            <span className="text-2xl font-black text-chapter-accent italic tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-[1px]">
            <motion.div
              className="bg-chapter-accent h-full rounded-full shadow-[0_0_15px_rgba(var(--chapter-accent-rgb),0.4)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "circOut" }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm border border-line">
                <Activity className="w-3 h-3 text-chapter-accent" />
                <span className="text-[10px] font-black text-slate uppercase tracking-widest">{currentQ.category}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-obsidian leading-tight tracking-tight break-keep italic">
                {currentQ.text}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {currentQ.options.map((opt, idx) => {
                const isSelected = currentAnswer?.answer === opt.label;
                return (
                  <motion.button
                    key={idx}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOptionSelect(opt.score, opt.label)}
                    className={`w-full p-6 text-left border-2 rounded-[28px] transition-all relative overflow-hidden group
                      ${isSelected
                        ? 'bg-obsidian border-obsidian text-white shadow-2xl'
                        : 'bg-white border-line hover:border-chapter-accent text-slate'
                      }`}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <span className={`text-base md:text-lg font-bold ${isSelected ? 'text-white' : 'text-obsidian'}`}>{opt.label}</span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                        ${isSelected ? 'bg-chapter-accent border-chapter-accent' : 'border-line'}
                      `}>
                        {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Medicine Detail Input */}
            {isMedicineQuestion && currentAnswer && !currentAnswer.answer.includes('없음') && !currentAnswer.answer.includes('해당 사항 없음') && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-4"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-reward-gold" />
                  <span className="text-xs font-black text-chapter-accent uppercase tracking-widest">Details Needed</span>
                </div>
                <textarea
                  value={currentAnswer.detail || ''}
                  onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[step] = { ...currentAnswer, detail: e.target.value };
                    setAnswers(newAnswers);
                  }}
                  placeholder="복용 중인 약 이름을 적어주세요."
                  className="w-full p-6 bg-white border-2 border-line rounded-[28px] focus:border-chapter-accent outline-none min-h-[120px] resize-none text-sm font-bold shadow-sm"
                />
              </motion.div>
            )}

            {isLastStep && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-8 border-t border-line/50 space-y-4"
              >
                <label className="block text-[10px] font-black text-slate/40 uppercase tracking-widest">
                  Personal Note (Optional)
                </label>
                <textarea
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="오늘의 특이사항이나 유니클에게 하고 싶은 말을 적어주세요."
                  className="w-full p-6 bg-white/50 border-2 border-line/30 rounded-[28px] focus:border-chapter-accent outline-none min-h-[120px] resize-none text-sm font-bold"
                />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-12">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={step === 0}
          className="w-20 h-16 rounded-[24px] border-line text-slate hover:bg-mist"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <Button
          onClick={handleNext}
          disabled={!currentAnswer}
          className={`flex-1 h-16 text-lg rounded-[24px] font-black transition-all shadow-2xl flex items-center justify-center gap-3
            ${isLastStep ? 'bg-chapter-accent text-white hover:bg-chapter-accent/90' : 'bg-obsidian text-white hover:bg-obsidian/90'}
          `}
        >
          {isLastStep ? '리듬카드 확인하기' : '다음 단계'}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
