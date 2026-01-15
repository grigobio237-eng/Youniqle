'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, MessageSquare, ArrowRight, Loader2, Sparkles, PenTool, Image as ImageIcon, RefreshCcw, Download, Copy, Check, Camera, UserCircle2, CheckCircle, Trash2, Globe, Lock, Share2, RefreshCw, Palette, Quote } from 'lucide-react';
import { compressImage } from '@/lib/utils/image-client';
import { downloadWebtoon } from '@/lib/utils/download';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  if (score >= 90) return { level: 'Lv.4 만개 (Bloom)', char: '🌸', msg: '최상의 상태입니다. 이 눈부신 에너지를 마음껏 누리세요.', color: 'text-status-good', bg: 'bg-status-good/10' };
  if (score >= 70) return { level: 'Lv.3 꽃봉오리 (Bud)', char: '🌷', msg: '당신의 에너지가 피어나기 시작했습니다. 거의 다 왔어요!', color: 'text-status-normal', bg: 'bg-status-normal/10' };
  if (score >= 40) return { level: 'Lv.2 새싹 (Sprout)', char: '🌿', msg: '조금씩 생기가 돌고 있어요. 지금의 루틴을 유지하세요.', color: 'text-status-amber', bg: 'bg-status-amber/10' };
  return { level: 'Lv.1 씨앗 (Seed)', char: '🌱', msg: '지금은 조용히 힘을 모을 때입니다. 곧 싹이 틀 거예요.', color: 'text-status-danger', bg: 'bg-status-danger/10' };
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
      <DialogContent className="sm:max-w-md text-center p-12 rounded-[40px] border-none shadow-2xl bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-7xl mb-4 grayscale-[0.2]">{currentStep.icon}</div>
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-center tracking-tight text-obsidian">{currentStep.title}</DialogTitle>
              <DialogDescription className="text-lg whitespace-pre-line pt-4 text-center text-slate font-medium leading-relaxed">
                {currentStep.desc}
              </DialogDescription>
            </DialogHeader>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-3 mt-8">
          {steps.map((_, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${step === i + 1 ? 'bg-primary w-8' : 'bg-gray-200'}`} />
          ))}
        </div>

        <div className="pt-10">
          <Button
            className="w-full btn-primary h-16 text-lg rounded-[20px] shadow-xl shadow-primary/20"
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else onOpenChange(false);
            }}
          >
            {step === 3 ? "진정한 회복 시작하기" : "다음 단계로"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// A. Gate Intro View
function GateIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 text-center bg-mist relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-chapter-accent/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-reward-gold/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl space-y-16 relative z-10"
      >
        <div className="space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-obsidian text-mist rounded-full text-xs font-black tracking-widest uppercase">
            <span>Youniqle Recovery Protocol v2.5</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-obsidian leading-[1.1] tracking-tighter break-keep">
            번아웃에서 벗어나<br />
            <span className="text-chapter-accent">진짜 '나'로 돌아가는 시간</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate word-keep-all leading-relaxed max-w-xl mx-auto font-medium">
            감각에 의존하던 휴식을 넘어, 당신의 몸이 보내는 신호를<br className="hidden md:block" />
            정밀하게 해석하는 가장 과학적이고 프라이빗한 솔루션.
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-lg mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button size="lg" onClick={onStart} className="btn-primary flex-1 h-20 text-xl rounded-[24px] shadow-2xl shadow-chapter-accent/20 hover:-translate-y-1 active:translate-y-0">
              60초 정밀 진단 시작
            </Button>
            <Button asChild className="bg-obsidian text-mist flex-1 h-20 text-xl rounded-[24px] shadow-2xl hover:bg-obsidian/90 hover:-translate-y-1 active:translate-y-0 border-none">
              <Link href="/products">회복 키트 큐레이션 바로가기</Link>
            </Button>
          </div>
        </div>

        <div className="pt-16 border-t border-line flex justify-center gap-16 md:gap-24">
          <div className="space-y-2">
            <span className="block font-black text-obsidian text-3xl md:text-4xl tracking-tight">12,403+</span>
            <span className="text-xs font-bold text-slate uppercase tracking-widest">Protocol Records</span>
          </div>
          <div className="space-y-2">
            <span className="block font-black text-obsidian text-3xl md:text-4xl tracking-tight">96.8%</span>
            <span className="text-xs font-bold text-slate uppercase tracking-widest">Recovery Success</span>
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

// Webtoon Challenge Dialog Component
function WebtoonChallengeDialog({ open, onOpenChange, recoveryData }: { open: boolean, onOpenChange: (open: boolean) => void, recoveryData: any }) {
  const [step, setStep] = useState<'STYLE' | 'SCRIPT' | 'CHARACTER' | 'IMAGE' | 'POSTED'>('STYLE');
  const [genre, setGenre] = useState('sitcom');
  const [visualStyle, setVisualStyle] = useState('premium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [editedPanels, setEditedPanels] = useState<any[]>([]);
  const [panelCount, setPanelCount] = useState('4'); // 기본 4컷

  // 캐릭터 관련 상태 (추가)
  const [characterPrompt, setCharacterPrompt] = useState('');
  const [characterSheetImage, setCharacterSheetImage] = useState('');
  const [userReferenceImage, setUserReferenceImage] = useState('');
  const [isGeneratingCharacter, setIsGeneratingCharacter] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  // 듀얼 캐릭터 시스템 (신규)
  const [refBasedCharacter, setRefBasedCharacter] = useState<string | null>(null);
  const [promptBasedCharacter, setPromptBasedCharacter] = useState<string | null>(null);
  const [selectedCharacterType, setSelectedCharacterType] = useState<'ref' | 'prompt' | null>(null);
  const [savedCharacters, setSavedCharacters] = useState<any[]>([]);
  const [characterTab, setCharacterTab] = useState<'new' | 'saved'>('new');
  const [isSavingCharacter, setIsSavingCharacter] = useState(false);

  // Phase 2: 자유 주제 입력 모드
  const [topicMode, setTopicMode] = useState<'recovery' | 'free'>('recovery');
  const [freeTopic, setFreeTopic] = useState('');
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);

  // Phase 2: 인스타그램 캡션
  const [instagramCaption, setInstagramCaption] = useState<{ description: string; hashtags: string } | null>(null);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);

  const genres = [
    { id: 'sitcom', label: '시트콤', icon: '😆', desc: '위트와 유머가 넘치는 일상' },
    { id: 'drama', label: '드라마', icon: '🌅', desc: '가슴 뭉클한 감동과 성장' },
    { id: 'romance', label: '로맨스', icon: '💖', desc: '설레는 사랑과 관계의 회복' },
    { id: 'slice-of-life', label: '일상/힐링', icon: '🌿', desc: '조용한 평온함과 소소한 행복' },
    { id: 'fantasy', label: '판타지', icon: '🦄', desc: '상상력 너머의 경이로운 세계' },
    { id: 'thriller', label: '스릴러', icon: '🕵️', desc: '긴장감 넘치는 하루의 재구성' },
    { id: 'action', label: '액션', icon: '🔥', desc: '시련에 맞서는 역동적인 에너지' }
  ];

  const styles = [
    { id: 'premium', label: '프리미엄 웹툰', icon: '✨', desc: '세련된 디지털 드로잉과 깔끔 채색' },
    { id: 'romance', label: '로맨스 판타지', icon: '💖', desc: '화려한 장식과 몽환적인 조명 효과' },
    { id: 'noir', label: '누아르/스릴러', icon: '🌑', desc: '강렬한 명암대비와 묵직한 분위기' },
    { id: 'anime', label: '일본 애니메이션', icon: '🎞️', desc: '셀식 채색 특유의 선명한 감성' },
    { id: 'retro-90s', label: '90년대 레트로', icon: '📺', desc: '아날로그 필름과 VHS 노이즈 감성' },
    { id: 'manga-bw', label: '흑백 만화', icon: '🖋️', desc: '스크린톤과 펜 선 중심의 출판 만화' },
    { id: 'watercolor', label: '수채화', icon: '🎨', desc: '부드럽고 투명한 물감 번짐 효과' },
    { id: 'oil', label: '유화/임파스토', icon: '🖼️', desc: '두꺼운 붓터치와 질감이 살아있는 유화' },
    { id: 'fairytale', label: '동화 일러스트', icon: '🦄', desc: '따뜻한 색감과 귀엽고 단순한 형태' },
    { id: 'american', label: '아메리칸 코믹스', icon: '🦸', desc: '굵은 외곽선과 강렬한 원색의 히어로물' },
    { id: '3d', label: '3D 애니메이션', icon: '🚀', desc: '입체감이 뚜렷한 디즈니/픽사 스타일' }
  ];

  // Phase 2: AI 주제 추천 함수
  const handleSuggestTopics = async () => {
    setIsLoadingTopics(true);
    setSuggestedTopics([]);
    try {
      const res = await fetch('/api/webtoon/suggest-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre })
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestedTopics(data.ideas || []);
      }
    } catch (error) {
      console.error('Topic suggestion failed:', error);
      alert('주제 추천 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const handleStartGeneration = async () => {
    if (topicMode === 'free' && !freeTopic.trim()) {
      alert('주제를 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/webtoon/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-script', // 대본만 먼저 생성
          genre,
          visualStyle,
          panelCount,
          date: new Date().toISOString().split('T')[0],
          topic: topicMode === 'free' ? freeTopic : undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedData(data);
        setEditedPanels(data.panels);
        setCharacterPrompt(data.characterPrompt || '');
        setStep('SCRIPT');
      } else {
        const errorData = await res.json();
        alert(errorData.error || '대본 생성 중 오류가 발생했습니다.');
      }
    } catch (error) {
      alert('대본 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegeneratePanel = async (panelNumber: number) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/webtoon/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'regenerate-panel',
          panelNumber,
          panels: generatedData.panels,
          characterPrompt: generatedData.characterPrompt,
          genre,
          visualStyle
        })
      });
      if (res.ok) {
        const { imageUrl } = await res.json();
        const updatedPanels = generatedData.panels.map((p: any) =>
          p.panelNumber === panelNumber ? { ...p, imageUrl } : p
        );
        setGeneratedData({ ...generatedData, panels: updatedPanels });
        setEditedPanels(updatedPanels);
      }
    } catch (error) {
      alert('이미지 재생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmScript = () => {
    setGeneratedData({ ...generatedData, panels: editedPanels });
    setStep('CHARACTER');
  };

  const handleAnalyzeImage = async () => {
    if (!userReferenceImage) return;
    setIsAnalyzingImage(true);
    try {
      const res = await fetch('/api/webtoon/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze-reference',
          image: userReferenceImage
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCharacterPrompt(data.description);
      }
    } catch (error) {
      alert('사진 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleGenerateCharacterSheet = async () => {
    setIsGeneratingCharacter(true);
    setRefBasedCharacter(null);
    setPromptBasedCharacter(null);
    setSelectedCharacterType(null);

    try {
      const res = await fetch('/api/webtoon/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-dual-characters',
          characterPrompt,
          visualStyle,
          referenceImage: userReferenceImage
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRefBasedCharacter(data.refBasedCharacter);
        setPromptBasedCharacter(data.promptBasedCharacter);
        // 프롬프트 분석 결과 피드백
        if (data.referenceDescription && !characterPrompt) {
          setCharacterPrompt(data.referenceDescription);
        }
      } else {
        const err = await res.json();
        alert(err.error || '캐릭터 생성 실패');
      }
    } catch (error) {
      alert('캐릭터 시트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingCharacter(false);
    }
  };

  const handleSelectCharacter = (type: 'ref' | 'prompt') => {
    setSelectedCharacterType(type);
    if (type === 'ref' && refBasedCharacter) {
      setCharacterSheetImage(refBasedCharacter);
    } else if (type === 'prompt' && promptBasedCharacter) {
      setCharacterSheetImage(promptBasedCharacter);
    }
  };

  const handleSaveCharacter = async () => {
    if (!characterSheetImage) return;
    setIsSavingCharacter(true);
    try {
      if (!characterSheetImage) return;

      // [최적화 3차] 캐릭터 시트 이미지도 압축하여 전송 (413 에러 방지)
      const compressedCharImage = await compressImage(characterSheetImage, 800, 0.7);

      const payload = {
        imageUrl: compressedCharImage,
        prompt: characterPrompt,
        genre,
        visualStyle
      };

      // 전송 크기 모니터링
      const payloadString = JSON.stringify(payload);
      const sizeInMB = (payloadString.length / (1024 * 1024)).toFixed(2);
      console.log(`[Character Save] Total Payload Size: ${sizeInMB}MB`);

      const res = await fetch('/api/character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadString
      });
      if (res.ok) {
        const data = await res.json();
        setSavedCharacters(prev => [data.character, ...prev]);
      }
    } catch (error) {
      console.error('Character save failed:', error);
    } finally {
      setIsSavingCharacter(false);
    }
  };

  const loadSavedCharacters = async () => {
    try {
      const res = await fetch('/api/character');
      if (res.ok) {
        const data = await res.json();
        setSavedCharacters(data.characters || []);
      }
    } catch (error) {
      console.error('Failed to load characters:', error);
    }
  };

  const handleFinalGenerateWebtoon = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/webtoon/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-webtoon',
          panels: editedPanels,
          characterPrompt,
          characterSheetImage,
          visualStyle,
          genre
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedData({ ...generatedData, panels: data.panels, characterSheetImage });
        setStep('IMAGE');
        // 인스타그램 캡션 자동 생성
        if (!instagramCaption) generateInstagramCaption();
      }
    } catch (error) {
      alert('웹툰 이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 웹툰 게시 (회복 스토리에 저장)
  const handlePostWebtoon = async (isPublic: boolean) => {
    if (!generatedData || !generatedData.panels) {
      alert('저장할 웹툰이 없습니다.');
      return;
    }

    setIsGenerating(true);
    try {
      // [최적화 3차] 서버 전송 제한(413 에러)을 완벽히 피하기 위해 압축 강도 상향 (800px, 0.6)
      const compressedPanels = await Promise.all(
        generatedData.panels.map(async (p: any) => {
          const { cleanImageUrl, ...rest } = p;
          const compressedUrl = await compressImage(p.imageUrl, 800, 0.6);
          return {
            ...rest,
            imageUrl: compressedUrl
          };
        })
      );

      const payload = {
        date: new Date().toISOString(),
        episodeNumber: generatedData.episodeNumber || 1,
        panels: compressedPanels,
        script: generatedData.summary || editedPanels[0]?.script || '',
        summary: generatedData.summary || '오늘의 회복 웹툰',
        imageUrl: compressedPanels[0]?.imageUrl || '',
        characterPrompt,
        visualStyle,
        genre,
        isPublic
      };

      // 전송 크기 모니터링
      const payloadString = JSON.stringify(payload);
      const sizeInMB = (payloadString.length / (1024 * 1024)).toFixed(2);
      console.log(`[Webtoon Post] Total Payload Size: ${sizeInMB}MB`);

      const res = await fetch('/api/webtoon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadString
      });

      if (res.ok) {
        setStep('POSTED');
        // 캐릭터 저장도 함께 진행
        if (characterSheetImage && !savedCharacters.find(c => c.imageUrl === characterSheetImage)) {
          handleSaveCharacter();
        }
      } else {
        // 서버 응답이 JSON이 아닐 경우(413 등)를 대비한 안전한 에러 처리
        let errorMsg = '게시에 실패했습니다.';
        try {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const err = await res.json();
            errorMsg = err.error || errorMsg;
          } else if (res.status === 413) {
            errorMsg = '전송용량이 너무 큽니다. 내용을 조금 줄이거나 다시 시도해주세요. (413)';
          }
        } catch (e) {
          console.error('Error parsing response:', e);
        }
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Webtoon post failed:', error);
      alert('게시 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Phase 2: 인스타그램 캡션 생성
  const generateInstagramCaption = async () => {
    setIsGeneratingCaption(true);
    try {
      const topic = topicMode === 'free' ? freeTopic : '오늘의 회복 이야기';
      const res = await fetch('/api/webtoon/sns-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          panels: editedPanels
        })
      });

      if (res.ok) {
        const data = await res.json();
        setInstagramCaption({
          description: data.description,
          hashtags: data.hashtags
        });
      }
    } catch (error) {
      console.error('Instagram caption generation failed:', error);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  // Phase 2: 다운로드 핸들러
  const handleDownload = async (format: 'individual' | 'grid' | 'horizontal' | 'vertical') => {
    try {
      await downloadWebtoon(
        {
          panels: generatedData.panels,
          title: topicMode === 'free' ? freeTopic.substring(0, 20) : 'webtoon'
        },
        format
      );
    } catch (error) {
      console.error('Download failed:', error);
      alert('다운로드 중 오류가 발생했습니다.');
    }
  };

  // Phase 2: 클립보드 복사
  const copyToClipboard = async (text: string, type: '설명' | '해시태그') => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${type}이(가) 복사되었습니다!`);
    } catch (error) {
      console.error('Copy failed:', error);
      alert('복사 중 오류가 발생했습니다.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 rounded-[32px] border-none shadow-3xl bg-white focus:outline-none max-h-[90vh] flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>웹툰 챌린지</DialogTitle>
          <DialogDescription>오늘의 회복 데이터를 웹툰으로 생성합니다.</DialogDescription>
        </DialogHeader>
        {/* Header - 고정 */}
        <div className="bg-obsidian p-8 text-mist relative rounded-t-[32px] flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-chapter-accent/20 rounded-full blur-3xl -mr-16 -mt-16" />
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 relative z-10">
            <Sparkles className="text-reward-gold" /> 일일 웹툰 챌린지
          </h2>
          <p className="text-mist/60 text-sm mt-1 relative z-10">오늘의 회복 데이터를 한 컷의 예술로 만듭니다.</p>
        </div>

        {/* 스크롤 가능한 콘텐츠 영역 */}
        <div className="p-8 overflow-y-auto flex-1">
          {step === 'STYLE' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-40">
              {/* 1. 장르 선택 (Select) */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-obsidian flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
                  어떤 분위기의 이야기를 만들까요? (장르)
                </h3>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="w-full h-14 rounded-2xl border-line bg-mist/20 text-obsidian font-bold">
                    <SelectValue placeholder="장르 선택" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-line max-h-60 overflow-y-auto shadow-2xl">
                    {genres.map(g => (
                      <SelectItem key={g.id} value={g.id} className="focus:bg-primary/5 rounded-xl py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{g.icon}</span>
                          <div>
                            <div className="font-bold text-obsidian">{g.label}</div>
                            <div className="text-[10px] text-slate font-medium">{g.desc}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2. 스타일 선택 (Select) */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-obsidian flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
                  원하시는 그림 스타일을 선택하세요.
                </h3>
                <Select value={visualStyle} onValueChange={setVisualStyle}>
                  <SelectTrigger className="w-full h-14 rounded-2xl border-line bg-mist/20 text-obsidian font-bold">
                    <SelectValue placeholder="스타일 선택" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-line max-h-60 overflow-y-auto shadow-2xl">
                    {styles.map(s => (
                      <SelectItem key={s.id} value={s.id} className="focus:bg-primary/5 rounded-xl py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{s.icon}</span>
                          <div>
                            <div className="font-bold text-obsidian">{s.label}</div>
                            <div className="text-[10px] text-slate font-medium">{s.desc}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2.5 컷 수 선택 (신규) */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-obsidian flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">3</span>
                  웹툰 분량을 선택하세요. (컷 수)
                </h3>
                <Select value={panelCount} onValueChange={setPanelCount}>
                  <SelectTrigger className="w-full h-14 rounded-2xl border-line bg-mist/20 text-obsidian font-bold">
                    <SelectValue placeholder="컷 수 선택" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-line max-h-60 overflow-y-auto shadow-2xl">
                    {[1, 2, 4, 6, 8, 10].map(count => (
                      <SelectItem key={count} value={count.toString()} className="focus:bg-primary/5 rounded-xl py-3 font-bold text-obsidian">
                        {count}컷 {count === 1 ? '(단편)' : count === 4 ? '(추천)' : count === 10 ? '(장편)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 3. 주제 선택 */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-obsidian flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">4</span>
                  웹툰 주제를 선택하세요.
                </h3>
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={topicMode === 'recovery' ? 'default' : 'outline'}
                    onClick={() => setTopicMode('recovery')}
                    className={`flex-1 h-12 rounded-xl font-bold transition-all ${topicMode === 'recovery' ? 'bg-primary' : ''}`}
                  >
                    회복 데이터 사용
                  </Button>
                  <Button
                    variant={topicMode === 'free' ? 'default' : 'outline'}
                    onClick={() => setTopicMode('free')}
                    className={`flex-1 h-12 rounded-xl font-bold transition-all ${topicMode === 'free' ? 'bg-primary' : ''}`}
                  >
                    자유 주제 입력
                  </Button>
                </div>

                {topicMode === 'free' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={freeTopic}
                        onChange={(e) => setFreeTopic(e.target.value)}
                        placeholder="예: 배달비가 너무 비싼 요즘... (Enter로 생성)"
                        className="flex-1 p-4 border border-line rounded-xl focus:ring-2 focus:ring-primary bg-mist/10 text-sm font-medium"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleStartGeneration();
                        }}
                      />
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={handleSuggestTopics}
                        disabled={isLoadingTopics}
                        className="h-12 w-12 rounded-xl bg-amber-100 hover:bg-amber-200"
                        title="AI 주제 추천받기"
                      >
                        {isLoadingTopics ? (
                          <Loader2 className="h-5 w-5 animate-spin text-amber-700" />
                        ) : (
                          <span className="text-xl">💡</span>
                        )}
                      </Button>
                    </div>

                    {/* AI 추천 주제 목록 */}
                    {suggestedTopics.length > 0 && (
                      <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                        <p className="font-bold text-sm mb-2 text-amber-900 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> 이런 주제는 어때요?
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestedTopics.map((idea, idx) => (
                            <button
                              key={idx}
                              onClick={() => setFreeTopic(idea)}
                              className="px-4 py-2 bg-white rounded-full border border-amber-200 hover:border-amber-400 hover:bg-amber-50 text-xs text-amber-900 font-bold transition-all shadow-sm"
                            >
                              {idea}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button
                onClick={handleStartGeneration}
                className="w-full h-16 text-lg font-black rounded-2xl bg-obsidian text-mist hover:bg-obsidian/90 shadow-xl transition-all"
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-5 w-5 text-reward-gold" />}
                AI 웹툰 대본 생성 시작
              </Button>
            </div>
          )}

          {step === 'SCRIPT' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-obsidian flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-primary" /> 장면별 대본 검토
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-black uppercase text-primary border-primary/30">
                    {genre.toUpperCase()} / {editedPanels.length} CUTS
                  </Badge>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                  {editedPanels.map((panel, idx) => (
                    <div key={idx} className="p-5 bg-mist/30 border border-line rounded-2xl group space-y-3">
                      <div className="inline-flex bg-obsidian text-mist text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
                        PANEL {panel.panelNumber}
                      </div>
                      <Textarea
                        value={panel.script}
                        onChange={(e) => {
                          const newPanels = [...editedPanels];
                          newPanels[idx].script = e.target.value;
                          setEditedPanels(newPanels);
                        }}
                        className="bg-transparent border-none focus-visible:ring-0 text-obsidian font-medium leading-relaxed min-h-[80px] p-0 text-sm resize-none"
                        placeholder="장면 설명을 입력하세요..."
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate italic text-center text-balance px-4">
                  "장면별 대본을 자유롭게 수정해 보세요."
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1 h-14 font-bold" onClick={() => setStep('STYLE')}>뒤로</Button>
                <Button className="flex-2 h-14 px-8 font-black rounded-xl bg-primary" onClick={handleConfirmScript}>
                  캐릭터 설정하기 <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 'CHARACTER' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 pb-10">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-obsidian flex items-center gap-2">
                  <UserCircle2 className="w-6 h-6 text-primary" /> 웹툰 캐릭터 완성하기
                </h3>
                <p className="text-xs font-bold text-slate">사진과 설명을 바탕으로 두 가지 캐릭터를 만들어 드려요. 마음에 드는 것을 선택하세요!</p>
              </div>

              {/* 입력 영역 */}
              <div className="p-5 bg-white border-2 border-line rounded-3xl shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 레퍼런스 사진 */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate uppercase tracking-wider">📷 레퍼런스 사진 (선택)</label>
                    <input type="file" accept="image/*" id="char-ref-upload" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setUserReferenceImage(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-line hover:border-primary transition-colors cursor-pointer aspect-video flex flex-col items-center justify-center bg-mist/10"
                      onClick={() => document.getElementById('char-ref-upload')?.click()}>
                      {userReferenceImage ? (
                        <img src={userReferenceImage} className="w-full h-full object-cover" alt="Reference" />
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-slate/40 mb-1 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-bold text-slate italic">사진 업로드</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 캐릭터 묘사 */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate uppercase tracking-wider">📝 캐릭터 묘사</label>
                    <Textarea
                      value={characterPrompt}
                      onChange={(e) => setCharacterPrompt(e.target.value)}
                      className="min-h-[100px] bg-mist/10 border-none rounded-2xl text-sm font-medium leading-relaxed resize-none"
                      placeholder="성별, 나이, 머리색, 옷차림 등..."
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateCharacterSheet}
                  disabled={isGeneratingCharacter || (!characterPrompt && !userReferenceImage)}
                  className="w-full h-12 rounded-2xl font-black bg-obsidian text-mist shadow-xl"
                >
                  {isGeneratingCharacter ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-5 w-5 text-reward-gold" />}
                  ✨ 캐릭터 2종 생성하기
                </Button>
              </div>

              {/* 듀얼 캐릭터 선택 영역 */}
              {(refBasedCharacter || promptBasedCharacter) && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <h4 className="text-sm font-black text-obsidian">🎭 캐릭터를 선택하세요</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {/* 사진 기반 캐릭터 */}
                    {refBasedCharacter && (
                      <div
                        className={`relative rounded-3xl overflow-hidden border-4 transition-all cursor-pointer hover:scale-[1.02] ${selectedCharacterType === 'ref' ? 'border-primary shadow-lg shadow-primary/30' : 'border-white shadow-md'
                          }`}
                        onClick={() => handleSelectCharacter('ref')}
                      >
                        <img src={refBasedCharacter} alt="사진 기반" className="w-full aspect-square object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                          <p className="text-white text-xs font-black">📷 사진 기반</p>
                        </div>
                        {selectedCharacterType === 'ref' && (
                          <div className="absolute top-3 right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* 프롬프트 기반 캐릭터 */}
                    {promptBasedCharacter && (
                      <div
                        className={`relative rounded-3xl overflow-hidden border-4 transition-all cursor-pointer hover:scale-[1.02] ${selectedCharacterType === 'prompt' ? 'border-primary shadow-lg shadow-primary/30' : 'border-white shadow-md'
                          }`}
                        onClick={() => handleSelectCharacter('prompt')}
                      >
                        <img src={promptBasedCharacter} alt="AI 프롬프트 기반" className="w-full aspect-square object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                          <p className="text-white text-xs font-black">📝 AI 프롬프트 기반</p>
                        </div>
                        {selectedCharacterType === 'prompt' && (
                          <div className="absolute top-3 right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedCharacterType && (
                    <p className="text-[10px] text-primary font-bold text-center">✨ 선택된 캐릭터가 웹툰 전반에 주인공으로 등장합니다!</p>
                  )}
                </div>
              )}

              {/* 결과가 없을 때 안내 */}
              {!refBasedCharacter && !promptBasedCharacter && !isGeneratingCharacter && (
                <div className="aspect-video bg-mist/20 rounded-3xl border-4 border-white shadow-inner flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-mist/50 flex items-center justify-center mb-3">
                    <ImageIcon className="w-6 h-6 opacity-20" />
                  </div>
                  <p className="text-xs font-black text-slate/40 text-center">사진이나 묘사를 입력하고<br />버튼을 눌러 캐릭터를 생성하세요</p>
                </div>
              )}

              {/* 로딩 상태 */}
              {isGeneratingCharacter && (
                <div className="aspect-video bg-mist/20 rounded-3xl border-4 border-white shadow-inner flex flex-col items-center justify-center animate-pulse">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                  <p className="text-xs font-black text-slate">AI가 두 가지 캐릭터를 그리는 중...</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button variant="ghost" className="flex-1 h-14 font-black text-slate" onClick={() => setStep('SCRIPT')}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> 대본 수정으로
                </Button>
                <Button
                  className="flex-[2] h-14 px-8 font-black rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 disabled:opacity-50"
                  onClick={() => {
                    handleSaveCharacter();
                    handleFinalGenerateWebtoon();
                  }}
                  disabled={isGenerating || !selectedCharacterType}
                >
                  {isGenerating || isSavingCharacter ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                  선택한 캐릭터로 웹툰 생성
                </Button>
              </div>
            </div>
          )}

          {step === 'IMAGE' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95">
              <div className="space-y-4">
                <h3 className="text-lg font-black text-obsidian flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" /> 완성된 멀티컷 웹툰
                </h3>

                <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                  {generatedData.panels.map((panel: any, idx: number) => (
                    <div key={idx} className="relative group rounded-[24px] overflow-hidden border border-line shadow-lg">
                      <img src={panel.imageUrl} alt={`Panel ${panel.panelNumber}`} className="w-full h-auto" />
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/90 backdrop-blur-sm hover:bg-white text-obsidian font-bold text-xs shadow-xl"
                          onClick={() => handleRegeneratePanel(panel.panelNumber)}
                          disabled={isGenerating}
                        >
                          <RefreshCcw className={`w-3 h-3 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                          다시 만들기
                        </Button>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 p-5">
                        <p className="text-white text-xs font-medium leading-relaxed">
                          {panel.script}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate/60 text-center uppercase tracking-widest font-black">Scroll to read more</p>
              </div>

              {/* Phase 2: 다운로드 옵션 */}
              <div className="p-4 bg-mist/30 rounded-2xl space-y-3">
                <h4 className="text-sm font-black text-obsidian flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  웹툰 다운로드
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload('grid')}
                    className="text-xs"
                  >
                    바둑판 (2x2)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload('horizontal')}
                    className="text-xs"
                  >
                    가로 연속
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload('vertical')}
                    className="text-xs"
                  >
                    세로 연속
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload('individual')}
                    className="text-xs"
                  >
                    개별 파일
                  </Button>
                </div>
              </div>

              {/* Phase 2: 인스타그램 캡션 */}
              {instagramCaption && (
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl space-y-3 border border-purple-200">
                  <h4 className="text-sm font-black text-purple-900 flex items-center gap-2">
                    📱 인스타그램 포스트 추천
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-purple-700">설명</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(instagramCaption.description, '설명')}
                          className="h-6 text-xs"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          복사
                        </Button>
                      </div>
                      <p className="text-sm text-purple-900 bg-white/60 p-3 rounded-lg">
                        {instagramCaption.description}
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-purple-700">해시태그</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(instagramCaption.hashtags, '해시태그')}
                          className="h-6 text-xs"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          복사
                        </Button>
                      </div>
                      <p className="text-xs text-purple-800 bg-white/60 p-3 rounded-lg font-mono">
                        {instagramCaption.hashtags}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-14 font-bold rounded-xl border-line"
                  onClick={() => handlePostWebtoon(false)}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="animate-spin mr-2" /> : null}
                  나만 보기로 저장
                </Button>
                <Button
                  className="h-14 font-black rounded-xl bg-chapter-accent text-background"
                  onClick={() => handlePostWebtoon(true)}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2 h-5 w-5" />}
                  전체 공개로 게시
                </Button>
              </div>
            </div>
          )}

          {step === 'POSTED' && (
            <div className="py-12 text-center space-y-6 animate-in zoom-in-95">
              <div className="w-24 h-24 bg-status-good/10 text-status-good rounded-full flex items-center justify-center mx-auto text-5xl shadow-inner border border-status-good/20">
                ✨
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-obsidian tracking-tight">오늘의 회복 기록 완료!</h3>
                <p className="text-slate font-medium italic">"당신의 여정이 한 권의 책으로 엮이고 있습니다."</p>
              </div>
              <div className="pt-6">
                <Button
                  className="h-14 px-10 font-black rounded-2xl bg-obsidian text-mist shadow-xl"
                  onClick={() => onOpenChange(false)}
                >
                  확인
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// C. Result & Metaphor View
function ResultView({ score, answers, userNote, onEnter, onOpenWebtoon }: { score: number; answers: any[]; userNote: string; onEnter: () => void; onOpenWebtoon: () => void }) {
  const [showNextStepsDialog, setShowNextStepsDialog] = useState(false);
  const router = useRouter();

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
      <div className="max-w-md mx-auto min-h-[85vh] flex flex-col justify-center px-4 text-center space-y-12 animate-fade-in pb-20">
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate uppercase tracking-[0.2em]">Daily Recovery Score</h2>
          <div className="text-8xl font-black text-chapter-accent tracking-tighter">{recoveryScore}</div>
          <p className="text-lg font-bold text-obsidian/60">{scoreLevel}</p>
        </div>

        <div className="p-10 bg-white rounded-[40px] shadow-2xl shadow-chapter-accent/5 space-y-6 border border-line">
          <div className="flex justify-center mb-4">{icon}</div>
          <h3 className="text-2xl font-black text-obsidian tracking-tight">{metaphorTitle}</h3>
          <p className="text-slate font-medium leading-relaxed">{title}</p>
          <div className="pt-6 border-t border-line">
            <p className="text-sm font-bold text-chapter-accent italic opacity-70">"{message}"</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <Button size="lg" onClick={handleNextSteps} className="btn-primary w-full h-20 text-xl rounded-[24px] shadow-xl shadow-chapter-accent/20">
            다음 단계 설계하기 <ArrowRight className="ml-3 h-6 w-6" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={onOpenWebtoon}
            className="w-full h-16 rounded-[20px] border-2 border-primary/20 hover:border-primary text-primary font-bold flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <span className="text-2xl">🎨</span> 1일 웹툰 챌린지 도전하기
          </Button>
        </div>
      </div>


      {/* Next Steps Dialog */}
      <Dialog open={showNextStepsDialog} onOpenChange={setShowNextStepsDialog}>
        <DialogContent className="sm:max-w-lg p-8 rounded-[40px] border-none shadow-3xl bg-mist">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-black text-obsidian tracking-tight">🎯 어떻게 회복을 시작할까요?</DialogTitle>
            <DialogDescription className="text-lg pt-4 text-slate font-medium leading-relaxed">
              {nextStepMessage}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Option 1: Cases */}
            <button
              onClick={() => navigateTo('/cases')}
              className="w-full p-6 text-left bg-white border border-line rounded-[24px] hover:border-chapter-accent hover:shadow-xl transition-all group flex items-center justify-between"
            >
              <div className="flex items-start gap-5">
                <div className="text-4xl">📖</div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-obsidian text-lg mb-1 group-hover:text-chapter-accent">
                    회복 성공 사례 분석
                  </h4>
                  <p className="text-sm text-slate font-medium">
                    비슷한 수치의 사람들이 결과를 바꾼 실제 이야기
                  </p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-line group-hover:text-chapter-accent transition-colors" />
            </button>

            {/* Option 2: AI Navigator */}
            <button
              onClick={() => navigateTo('/ai-navigator')}
              className="w-full p-6 text-left bg-white border border-line rounded-[24px] hover:border-[#0E3A3A] hover:shadow-xl transition-all group flex items-center justify-between"
            >
              <div className="flex items-start gap-5">
                <div className="text-4xl">🤖</div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-obsidian text-lg mb-1 group-hover:text-[#0E3A3A]">
                    AI 리커버리 리포트
                  </h4>
                  <p className="text-sm text-slate font-medium">
                    데이터 기반의 정밀 분석과 맞춤 행동 지침
                  </p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-line group-hover:text-[#0E3A3A] transition-colors" />
            </button>

            {/* Option 3: Products */}
            <button
              onClick={() => navigateTo('/products')}
              className="w-full p-6 text-left bg-white border border-line rounded-[24px] hover:border-reward-gold hover:shadow-xl transition-all group flex items-center justify-between"
            >
              <div className="flex items-start gap-5">
                <div className="text-4xl">🛒</div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-obsidian text-lg mb-1 group-hover:text-reward-gold">
                    회복 프로토콜 스토어
                  </h4>
                  <p className="text-sm text-slate font-medium">
                    검증된 장비와 보완책으로 즉각적인 회복 시작
                  </p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-line group-hover:text-reward-gold transition-colors" />
            </button>
          </div>

          <div className="pt-8 mt-4 border-t border-line">
            <Button
              variant="ghost"
              onClick={() => { setShowNextStepsDialog(false); onEnter(); }}
              className="w-full h-14 text-slate font-bold hover:text-obsidian rounded-xl"
            >
              나중에 선택 (대시보드 입장)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// E. Site Usage Guide (Manual)
function SiteGuide() {
  const guides = [
    {
      title: "AI 네비게이터",
      desc: "매일의 진단 데이터를 분석하여 당신만을 위한 맞춤 회복 루틴과 조언을 제공합니다.",
      icon: "🤖",
      color: "bg-chapter-accent/10 text-chapter-accent"
    },
    {
      title: "회복 케이스",
      desc: "다른 사용자들의 성공적인 회복 사례를 연구하고 나에게 맞는 솔루션을 찾아보세요.",
      icon: "📖",
      color: "bg-status-normal/10 text-status-normal"
    },
    {
      title: "비밀 가상 공간",
      desc: "5개의 층으로 구성된 3D 파빌리온에서 몰입형 전시와 프리미엄 서비스를 경험하세요.",
      icon: "🏛️",
      color: "bg-reward-gold/10 text-reward-gold"
    },
    {
      title: "실생활 유틸리티",
      desc: "호흡 가이드, BMI 계산기 등 일상에서 즉시 활용 가능한 도구들을 모아두었습니다.",
      icon: "🛠️",
      color: "bg-obsidian/10 text-obsidian"
    }
  ];

  return (
    <section className="bg-white border border-line rounded-[40px] p-10 mb-12 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl">💡</div>
        <h2 className="text-2xl font-black text-obsidian tracking-tight">Youniqle 사용 설명서</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {guides.map((guide, i) => (
          <div key={i} className="p-6 rounded-[24px] bg-mist/30 border border-line/50 hover:border-primary/30 transition-all group">
            <div className={`w-12 h-12 rounded-2xl ${guide.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
              {guide.icon}
            </div>
            <h3 className="font-extrabold text-obsidian mb-2">{guide.title}</h3>
            <p className="text-xs text-slate font-medium leading-relaxed opacity-70">{guide.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// D. Main Dashboard (Recovery OS)
function RecoveryDashboard({ score, onOpenWebtoon }: { score: number; onOpenWebtoon: () => void }) {
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

      // Mark diagnosis as complete
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
  const totalPoints = progress?.totalPoints || 5;
  const membershipLevel = totalPoints >= 300 ? 'ECHO' : totalPoints >= 100 ? 'NAVIGATOR' : 'GATE';
  const nextLevel = totalPoints >= 300 ? 'OMAKASE' : totalPoints >= 100 ? 'ECHO' : 'NAVIGATOR';
  const pointsToNext = totalPoints >= 300 ? 500 - totalPoints : totalPoints >= 100 ? 300 - totalPoints : 100 - totalPoints;

  const levelInfo = getLevelInfo(displayScore);

  return (
    <div className="min-h-screen pb-20 bg-mist">
      {/* Top Status Card */}
      <section className="bg-white border-b border-line py-12 px-4 shadow-sm">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Status Info */}
            <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center gap-6">
                <div className={`w-28 h-28 rounded-[32px] ${levelInfo.bg} flex items-center justify-center text-5xl shadow-inner border border-line`}>
                  {levelInfo.char}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-xl font-black ${levelInfo.color}`}>{levelInfo.level}</span>
                    <Badge className="bg-obsidian text-mist border-none text-[10px] px-2 py-0.5 uppercase tracking-tighter">Protocol Active</Badge>
                  </div>
                  <h2 className="text-4xl font-black text-obsidian tracking-tighter">{displayScore} <span className="text-xl font-bold opacity-30">SCORE</span></h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="premium-card p-6 bg-mist/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-slate uppercase tracking-widest">Streak</span>
                    <span className="text-2xl">🔥</span>
                  </div>
                  <p className="text-2xl font-black text-obsidian">{streak}일 연속 기록</p>
                  <p className="text-xs text-slate font-medium mt-1">회복의 관성은 멈추지 않습니다.</p>
                </div>
                <div className="premium-card p-6 bg-mist/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-slate uppercase tracking-widest">Membership</span>
                    <span className="text-2xl">🎖️</span>
                  </div>
                  <p className="text-2xl font-black text-obsidian uppercase tracking-tighter">{membershipLevel}</p>
                  <p className="text-xs text-slate font-medium mt-1">다음 등급까지 {pointsToNext}pt</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-4 relative z-10">
                <Button size="lg" className="bg-obsidian text-background font-black rounded-2xl h-16 px-10 shadow-xl hover:scale-105 transition-transform" asChild>
                  <Link href="/">내 회복 점수 진단하기</Link>
                </Button>
                <Button
                  onClick={onOpenWebtoon}
                  className="flex items-center gap-3 px-8 h-16 rounded-2xl bg-white border border-line text-obsidian font-black cursor-pointer hover:bg-mist/10 transition-all shadow-md group h-16"
                >
                  <span className="text-2xl group-hover:rotate-12 transition-transform">🎨</span>
                  1일 웹툰 챌린지 시작하기
                </Button>
              </div>
            </div>

            {/* Membership/Points Progress */}
            <div className="lg:col-span-4 bg-obsidian text-mist rounded-[40px] p-8 flex flex-col justify-between shadow-2xl">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 opacity-60">Reward Progress</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-3xl font-black">{totalPoints} <span className="text-sm font-bold opacity-50">PT</span></span>
                    <span className="text-xs font-bold opacity-50 uppercase">{nextLevel} Goal</span>
                  </div>
                  <div className="w-full bg-mist/10 h-2 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-reward-gold h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(totalPoints % 100) || 100}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
              <Button asChild variant="ghost" className="w-full mt-8 border border-mist/20 hover:bg-mist/10 text-mist font-bold rounded-2xl">
                <Link href="/membership">멤버십 혜택 상세보기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Site Guide Section */}
      <section className="container mx-auto px-4 pt-12 max-w-5xl">
        <SiteGuide />
      </section>

      {/* Daily Goal / Focus Card */}
      <section className="container mx-auto px-4 pb-8 max-w-5xl">
        <div className="bg-obsidian text-mist rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-chapter-accent/20 rounded-full blur-3xl group-hover:bg-chapter-accent/30 transition-colors duration-700" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3">
              <span className="text-xs font-black text-reward-gold tracking-[0.3em] uppercase">Target of the Today Protocol</span>
              <h3 className="text-3xl font-black tracking-tight">{levelInfo.char} {displayScore >= 70 ? '활기 유지와 데이터 최적화' : '집중 회복 케어 모드'}</h3>
              <p className="text-mist/60 font-medium">오늘의 미션 {checklistProgress.total}개를 완료하고 회복의 증명을 획득하세요.</p>
            </div>
            <div className="relative">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-mist/10" />
                <motion.circle
                  cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                  className="text-reward-gold"
                  strokeDasharray={251.2}
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 - (251.2 * checklistProgress.percentage) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-black text-xl">
                {checklistProgress.percentage}%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Checklist */}
      <section className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded-[40px] shadow-sm border border-line p-10">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl font-black text-obsidian tracking-tight">✅ 오늘의 체크리스트</h2>
            <div className="text-right">
              <div className="text-3xl font-black text-chapter-accent">{checklistProgress.completed}/{checklistProgress.total}</div>
              <div className="text-xs font-bold text-slate uppercase tracking-widest mt-1">Daily Protocol</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Diagnosis */}
            <div className={`flex items-center justify-between p-6 rounded-[24px] border ${progress?.todayChecklist?.diagnosis ? 'bg-status-good/5 border-status-good/20' : 'bg-mist/30 border-line'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${progress?.todayChecklist?.diagnosis ? 'bg-status-good text-mist' : 'bg-white text-slate border border-line'}`}>
                  {progress?.todayChecklist?.diagnosis ? '✓' : '1'}
                </div>
                <div>
                  <h3 className="font-extrabold text-obsidian">정밀 진단 완료</h3>
                  <p className="text-sm text-slate font-medium">데이터 기반 상태 체크</p>
                </div>
              </div>
              <span className="text-sm font-black text-status-good">+5pt</span>
            </div>

            {/* AI Advice */}
            <Link
              href="/ai-advice"
              onClick={() => !progress?.todayChecklist?.aiAdvice && handleChecklistItem('aiAdvice', 3)}
              className={`flex items-center justify-between p-6 rounded-[24px] border transition-all hover:shadow-lg ${progress?.todayChecklist?.aiAdvice ? 'bg-chapter-accent/5 border-chapter-accent/20' : 'bg-mist/30 border-line hover:border-chapter-accent'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${progress?.todayChecklist?.aiAdvice ? 'bg-chapter-accent text-mist' : 'bg-white text-slate border border-line'}`}>
                  {progress?.todayChecklist?.aiAdvice ? '✓' : '2'}
                </div>
                <div>
                  <h3 className="font-extrabold text-obsidian">AI 루틴 설계</h3>
                  <p className="text-sm text-slate font-medium">오늘의 개별 맞춤 가이드</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-chapter-accent">+3pt</span>
                <ChevronRight className="w-5 h-5 text-line" />
              </div>
            </Link>

            {/* Content */}
            <Link
              href="/cases"
              onClick={() => !progress?.todayChecklist?.content && handleChecklistItem('content', 2)}
              className={`flex items-center justify-between p-6 rounded-[24px] border transition-all hover:shadow-lg ${progress?.todayChecklist?.content ? 'bg-status-normal/5 border-status-normal/20' : 'bg-mist/30 border-line hover:border-status-normal'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${progress?.todayChecklist?.content ? 'bg-status-normal text-mist' : 'bg-white text-slate border border-line'}`}>
                  {progress?.todayChecklist?.content ? '✓' : '3'}
                </div>
                <div>
                  <h3 className="font-extrabold text-obsidian">경험 데이터 분석</h3>
                  <p className="text-sm text-slate font-medium">성공적인 회복 케이스 연구</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-status-normal">+2pt</span>
                <ChevronRight className="w-5 h-5 text-line" />
              </div>
            </Link>

            {/* Utility */}
            <Link
              href="/utils"
              onClick={() => !progress?.todayChecklist?.utility && handleChecklistItem('utility', 3)}
              className={`flex items-center justify-between p-6 rounded-[24px] border transition-all hover:shadow-lg ${progress?.todayChecklist?.utility ? 'bg-reward-gold/5 border-reward-gold/20' : 'bg-mist/30 border-line hover:border-reward-gold'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${progress?.todayChecklist?.utility ? 'bg-reward-gold text-white' : 'bg-white text-slate border border-line'}`}>
                  {progress?.todayChecklist?.utility ? '✓' : '4'}
                </div>
                <div>
                  <h3 className="font-extrabold text-obsidian">정밀 툴 활성화</h3>
                  <p className="text-sm text-slate font-medium">스마트 타이머 및 호흡 도구</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-reward-gold">+3pt</span>
                <ChevronRight className="w-5 h-5 text-line" />
              </div>
            </Link>
          </div>

          {checklistProgress.completed === checklistProgress.total && (
            <div className="mt-8 p-6 bg-obsidian text-mist rounded-[24px] shadow-xl text-center border border-reward-gold/30">
              <span className="text-4xl mb-3 block">🏅</span>
              <p className="text-xl font-black tracking-tight">Daily Protocol Completed</p>
              <p className="text-sm text-mist/60 mt-1">오늘의 모든 회복 절차를 마쳤습니다. 훌륭한 결과입니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* AI Preview Section */}
      <section className="container mx-auto px-4 pb-8 max-w-5xl">
        <Card className="bg-white border border-line rounded-[40px] overflow-hidden shadow-sm">
          <CardContent className="p-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-24 h-24 bg-mist rounded-[32px] flex items-center justify-center text-5xl shadow-inner shrink-0">
              🤖
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-3">
                <h3 className="font-black text-2xl text-obsidian tracking-tight">AI 코치의 데이터 분석</h3>
                <Badge className="bg-chapter-accent/10 text-chapter-accent border-none text-[10px] font-black tracking-tighter uppercase px-2">Real-time Analysis</Badge>
              </div>
              <p className="text-lg text-slate font-medium leading-relaxed italic">
                "{displayScore >= 70 ? '이상적인 데이터 패턴을 유지하고 있습니다. 지속성을 확보하기 위해 수면 효율에 집중하십시오.' : displayScore >= 40 ? '불균형한 피로도가 감지되었습니다. 정밀 호흡 세션과 적정 수분 섭취를 강력히 권장합니다.' : '임계점을 넘은 피로 수치입니다. 즉각적인 회복 작업을 시작하고 심층 분석 리포트를 확인하십시오.'}"
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
              <Button asChild className="h-14 font-black rounded-2xl px-8 bg-chapter-accent hover:bg-chapter-accent/90" size="lg">
                <Link href="/ai-navigator">분석 리포트</Link>
              </Button>
              <Button asChild variant="ghost" className="h-14 font-bold rounded-2xl text-slate hover:text-obsidian" size="lg">
                <Link href="/ai-advice">행동 조언 받기</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recommended Utilities Section */}
      <section className="container mx-auto px-4 pb-12 max-w-5xl">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-black italic text-obsidian tracking-tight">
            RECOMMENDED <span className="text-chapter-accent">TOOLS</span>
          </h2>
          <span className="text-xs font-black text-slate uppercase tracking-[0.2em]">Reset Protocol v1.2</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/utils/breathing" className="group">
            <div className="bg-white border border-line rounded-[32px] p-8 hover:border-chapter-accent hover:shadow-2xl transition-all flex flex-col items-center text-center h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-chapter-accent/5 rounded-full blur-2xl -mr-12 -mt-12" />
              <div className="w-20 h-20 bg-mist rounded-[24px] mb-6 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-inner">🌬️</div>
              <h3 className="text-xl font-black text-obsidian mb-2">3분 마인드풀 호흡</h3>
              <p className="text-sm text-slate font-medium mb-6 leading-relaxed">뇌의 피로를 씻어내는 가장 빠른 데이터 초기화 방법</p>
              <div className="mt-auto text-xs font-black text-chapter-accent tracking-widest uppercase group-hover:translate-x-1 transition-transform">Activate Protocol &gt;</div>
            </div>
          </Link>

          <Link href="/utils?tool=stretch" className="group">
            <div className="bg-white border border-line rounded-[32px] p-8 hover:border-status-normal hover:shadow-2xl transition-all flex flex-col items-center text-center h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-status-normal/5 rounded-full blur-2xl -mr-12 -mt-12" />
              <div className="w-20 h-20 bg-mist rounded-[24px] mb-6 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-inner">🧘</div>
              <h3 className="text-xl font-black text-obsidian mb-2">오피스 리셋 스트레칭</h3>
              <p className="text-sm text-slate font-medium mb-6 leading-relaxed">경직된 신체 데이터를 즉각적으로 유연하게 교정</p>
              <div className="mt-auto text-xs font-black text-status-normal tracking-widest uppercase group-hover:translate-x-1 transition-transform">Activate Protocol &gt;</div>
            </div>
          </Link>

          <Link href="/utils?tool=water" className="group">
            <div className="bg-white border border-line rounded-[32px] p-8 hover:border-[#0E3A3A] hover:shadow-2xl transition-all flex flex-col items-center text-center h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#0E3A3A]/5 rounded-full blur-2xl -mr-12 -mt-12" />
              <div className="w-20 h-20 bg-mist rounded-[24px] mb-6 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-inner">💧</div>
              <h3 className="text-xl font-black text-obsidian mb-2">수분 밸런스 체크</h3>
              <p className="text-sm text-slate font-medium mb-6 leading-relaxed">오늘 체내 수분 유지력을 실시간으로 체크</p>
              <div className="mt-auto text-xs font-black text-[#0E3A3A] tracking-widest uppercase group-hover:translate-x-1 transition-transform">Check Balance &gt;</div>
            </div>
          </Link>
        </div>
      </section>

      {/* Best Products */}
      <section className="container mx-auto px-4 pb-12 max-w-5xl">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-black text-obsidian tracking-tight">🔥 내게 맞는 회복 프로토콜</h2>
          <Link href="/products" className="text-sm font-bold text-slate hover:text-chapter-accent transition-colors">전체 큐레이션 보기 &gt;</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { id: 1, title: '딥 슬립 리커버리 키트', desc: '불면 데이터 개선 만족도 98%', price: '49,000원', tag: 'BEST', color: 'bg-chapter-accent' },
            { id: 2, title: '만성 피로 삭제 팩', desc: '활기 지수가 달라지는 7일 루틴', price: '35,000원', tag: 'HOT', color: 'bg-reward-gold' },
            { id: 3, title: '스트레스 번아웃 케어', desc: '전문가용 멘탈 데이터 관리', price: '55,000원', tag: 'NEW', color: 'bg-obsidian' }
          ].map((item) => (
            <Link href={`/products/${item.id}`} key={item.id} className="block group">
              <Card className="h-full border-line rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all bg-white">
                <div className="aspect-[4/3] bg-mist relative overflow-hidden">
                  <div className={`absolute top-4 left-4 ${item.color} text-mist text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest z-10 shadow-lg`}>{item.tag}</div>
                  <div className="w-full h-full flex items-center justify-center text-slate/20 font-black text-2xl italic tracking-tighter group-hover:scale-110 transition-transform duration-700">YU PROTOCOL</div>
                </div>
                <CardContent className="p-8">
                  <h3 className="text-xl font-black text-obsidian group-hover:text-chapter-accent transition-colors mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-slate font-medium mb-6 line-clamp-1">{item.desc}</p>
                  <div className="text-2xl font-black text-obsidian">{item.price}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="container mx-auto px-4 pb-20 max-w-5xl">
        <h2 className="text-2xl font-black text-obsidian mb-8 tracking-tight">빠른 이동</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '회복 케이스', href: '/cases', icon: '📖' },
            { label: 'AI 네비게이터', href: '/ai-navigator', icon: '🤖' },
            { label: '리커버리 샵', href: '/products', icon: '🛒' },
            { label: '멤버십 혜택', href: '/membership', icon: '🎖️' },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="group">
              <div className="bg-white border border-line rounded-2xl p-5 flex items-center gap-4 hover:border-chapter-accent hover:shadow-md transition-all">
                <span className="text-2xl group-hover:scale-125 transition-transform">{link.icon}</span>
                <span className="font-bold text-obsidian group-hover:text-chapter-accent transition-colors">{link.label}</span>
              </div>
            </Link>
          ))}
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
// 4. Helper Components
// ---------------------------
function SearchParamsHandler({
  onOpenWebtoon
}: {
  onOpenWebtoon: () => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get('action') === 'webtoon') {
      onOpenWebtoon();
    }
  }, [searchParams, onOpenWebtoon]);

  return null;
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
  const [showWebtoonDialog, setShowWebtoonDialog] = useState(false);

  useEffect(() => {
    // 1. Onboarding check
    const hasSeenOnboarding = localStorage.getItem('youniqle_onboarding_seen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }

    // 2. Initial state & questions fetch
    const today = new Date().toISOString().split('T')[0];
    const lastCheck = localStorage.getItem('recovery_last_check');
    const storedScore = localStorage.getItem('recovery_last_score');

    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/questions/daily');
        if (res.ok) {
          const data = await res.json();
          setQuestions(data.questions);
        }
      } catch (error) {
        console.error('Failed to fetch daily questions:', error);
      }
    };

    if (lastCheck === today && storedScore) {
      setScore(parseInt(storedScore));
      setViewState('DASHBOARD');
      window.dispatchEvent(new Event('recovery-gate-passed'));
    } else {
      fetchQuestions();
      setViewState('INTRO');
    }
  }, []); // Only run once on mount

  const handleOpenWebtoon = React.useCallback(() => setShowWebtoonDialog(true), []);

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
    if (viewState === 'RESULT') return <ResultView score={score} answers={answers} userNote={userNote} onEnter={handleEnterDashboard} onOpenWebtoon={() => setShowWebtoonDialog(true)} />;
    return <RecoveryDashboard score={score} onOpenWebtoon={() => setShowWebtoonDialog(true)} />;
  }

  return (
    <>
      <React.Suspense fallback={null}>
        <WelcomeModal />
        <SearchParamsHandler
          onOpenWebtoon={handleOpenWebtoon}
        />
      </React.Suspense>
      <OnboardingDialog
        open={showOnboarding}
        onOpenChange={(open) => {
          setShowOnboarding(open);
          if (!open) localStorage.setItem('youniqle_onboarding_seen', 'true');
        }}
      />
      <WebtoonChallengeDialog
        open={showWebtoonDialog}
        onOpenChange={setShowWebtoonDialog}
        recoveryData={{ score, answers, userNote }}
      />
      {renderContent()}
    </>
  );
}
