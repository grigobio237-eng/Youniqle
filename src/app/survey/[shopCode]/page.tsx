'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, ChevronRight, ChevronLeft, CheckCircle, 
    Sparkles, Heart, Zap, Shield, HelpCircle, Plus 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const QUESTIONS = [
  {
    id: 'stressPoint',
    category: '상태 분석',
    text: '요즘 가장 스트레스 받는 변화는 무엇인가요?',
    noteLabel: '추가로 적고 싶은 내용이 있다면 적어주세요.',
    options: [
      '피부가 갑자기 칙칙해졌다',
      '얼굴 붓기가 잘 안 빠진다',
      '탄력이 떨어지고 라인이 무너진다',
      '자고 일어나도 피곤하다',
      '몸이 무겁고 회복이 느리다',
      '예전보다 빨리 늙어 보이는 느낌이 있다',
      '통증, 결림, 불편감이 자주 있다',
      '전체적으로 컨디션이 무너진 느낌이다'
    ]
  },
  {
    id: 'priority',
    category: '목표 설정',
    text: '지금 가장 먼저 바꾸고 싶은 것은 무엇인가요?',
    noteLabel: '추가로 적고 싶은 내용이 있다면 적어주세요.',
    options: [
      '피부톤, 광채',
      '얼굴라인, 붓기',
      '탄력, 동안 느낌',
      '피로, 컨디션',
      '체형, 바디라인',
      '항노화 관리',
      '통증, 회복속도',
      '전체 이미지 개선'
    ]
  },
  {
    id: 'interestArea',
    category: '관심 분야',
    text: '아래 중 가장 관심 가는 방향은 무엇인가요?',
    noteLabel: '관심 있는 관리나 시술이 있다면 적어주세요.',
    options: [
      '피부 관리, 레이저, 스킨부스터',
      '얼굴라인, 쁘띠, 윤곽 관리',
      '항노화 프로그램',
      '줄기세포 등 프리미엄 안티에이징',
      '수액, 피로회복, 컨디션 관리',
      '재활, 통증, 체형 회복',
      '아직 모르겠고 추천이 필요하다'
    ]
  },
  {
    id: 'disappointment',
    category: '경험 분석',
    text: '관리나 시술을 받아도 늘 아쉬운 이유는 무엇인가요?',
    noteLabel: '추가 의견이 있다면 적어주세요.',
    options: [
      '잠깐 좋아지고 다시 무너진다',
      '내 생활패턴에 맞지 않는다',
      '회복관리가 부족하다',
      '가격 대비 만족감이 애매하다',
      '프라이버시가 불편하다',
      '상담은 많은데 내 상태에 맞춘 느낌이 없다',
      '믿고 꾸준히 맡길 곳이 없다'
    ]
  },
  {
    id: 'startMethod',
    category: '시작 방식',
    text: '가장 끌리는 시작 방식은 무엇인가요?',
    options: [
      '가볍게 상태 체크부터',
      '1회 체험',
      '3회 집중 관리',
      '맞춤 프로그램 추천',
      '시술 전후 회복관리 포함형',
      '프리미엄, VIP 프로그램',
      '아직 모르겠고 상담 후 결정'
    ]
  },
  {
    id: 'benefitPreference',
    category: '혜택 선호',
    text: '가장 선호하는 혜택은 무엇인가요?',
    noteLabel: '추가 의견이 있다면 적어주세요.',
    options: [
      '눈에 보이는 전후 변화 관리',
      '회원 전용 혜택가',
      '전담 담당자 배정',
      '프라이빗 예약, 응대',
      '시술 전후 회복관리 포함',
      '우선 예약',
      '누적 이용 혜택, 패스 혜택'
    ]
  },
  {
    id: 'budget',
    category: '예산 범위',
    text: '실제로 결제할 가능성이 가장 높은 가격대는 어느 정도인가요?',
    noteLabel: '생각하는 적정 금액대가 있다면 적어주세요.',
    options: [
      '10만원 미만',
      '10만~30만원',
      '30만~70만원',
      '70만~150만원',
      '150만~300만원',
      '300만원 이상',
      '가격보다 구성과 혜택이 더 중요하다'
    ]
  },
  {
    id: 'highEndCondition',
    category: '프리미엄 조건',
    text: '고가 프로그램을 고려하게 만드는 가장 큰 조건은 무엇인가요?',
    noteLabel: '추가 의견이 있다면 적어주세요.',
    options: [
      '확실한 변화가 보여야 한다',
      '믿을 수 있는 담당자가 있어야 한다',
      '프라이버시가 보장되어야 한다',
      '내 일정에 맞춰 편하게 받을 수 있어야 한다',
      '회복관리까지 같이 해줘야 한다',
      '회원 혜택이나 패스 메리트가 분명해야 한다',
      '후기, 추천이 충분해야 한다'
    ]
  },
  {
    id: 'desiredCombination',
    category: '선호 조합',
    text: '아래 중 가장 받아보고 싶은 조합은 무엇인가요?',
    noteLabel: '원하는 조합이 있다면 적어주세요.',
    options: [
      '피부 + 회복관리',
      '얼굴라인 + 회복관리',
      '항노화 + 컨디션 관리',
      '줄기세포 등 프리미엄 프로그램 + 사후관리',
      '재활, 통증 관리 + 회복 프로그램',
      '전체 이미지 업그레이드 맞춤형',
      '아직 모르겠고 추천이 필요하다'
    ]
  }
];

export default function PartnerSurveyPage() {
  const params = useParams();
  const shopCode = params?.shopCode as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const msgVersion = searchParams?.get('v') || 'default';
  
  const [shopName, setShopName] = useState('유니클 제휴점');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [entryCondition, setEntryCondition] = useState('');
  const [questionNotes, setQuestionNotes] = useState<Record<string, string>>({});


  useEffect(() => {
    // Fetch shop name for better experience
    const fetchShopInfo = async () => {
      try {
        const res = await fetch(`/api/survey/shop-info?code=${shopCode}`);
        const data = await res.json();
        if (data.success) {
          setShopName(data.shopName);
        }
      } catch (err) {
        console.error("Failed to fetch shop info");
      }
    };
    if (shopCode) fetchShopInfo();
  }, [shopCode]);

  const handleSelect = (option: string) => {
    const q = QUESTIONS[currentStep];
    setAnswers(prev => ({ ...prev, [q.id]: option }));
    
    // 자동 이동 제거 - 모든 문항에서 [다음] 버튼을 통해 이동하도록 통일
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopCode,
          answers,
          entryCondition,
          questionNotes,
          version: msgVersion
        })

      });
      const data = await res.json();
      if (data.success) {
        setIsCompleted(true);
        toast.success('분석 요청이 완료되었습니다.');
      }
    } catch (err) {
      toast.error('오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center space-y-10"
        >
            <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-4">
                <h1 className="text-3xl font-black text-obsidian tracking-tighter">분석 요청 완료!</h1>
                <p className="text-slate font-medium text-lg leading-relaxed">
                    응답해주신 내용을 바탕으로 고객님께 가장 필요한 맞춤 관리 방향을 정밀 분석 중입니다.
                    <br />
                    <span className="text-obsidian font-bold">전담 네비게이터의 1:1 케어 가이드</span>를 받으시려면 아래 리포트를 보관해 주세요.
                </p>
            </div>
            <div className="p-8 bg-mist rounded-[40px] border border-line space-y-6">
                <div className="space-y-3">
                    <p className="text-obsidian font-black text-xl">🎁 나의 분석 리포트 평생 소장하기</p>
                    <p className="text-sm text-slate font-bold leading-relaxed">
                        지금 가입하시면 방금 입력하신 데이터가 즉시 저장되며, <br className="hidden md:block" /> 
                        네비게이터의 <span className="text-primary italic">실시간 프리미엄 상담</span>을 가장 먼저 받으실 수 있습니다.
                    </p>
                </div>
                <Button 
                    onClick={() => router.push('/auth/signup')}
                    className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                >
                    3초 만에 가입하고 리포트 보관하기
                </Button>
            </div>
        </motion.div>
      </div>
    );
  }

  const currentQ = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / (QUESTIONS.length + 1)) * 100;

  return (
    <div className="min-h-screen bg-background pt-20 pb-10 flex flex-col items-center">
      <div className="container max-w-xl px-6">
        {/* Header Navigation */}
        <div className="mb-12 flex items-center justify-between">
            <button 
                onClick={() => currentStep > 0 && setCurrentStep(prev => prev - 1)}
                aria-label="이전 단계"
                className={`p-2 rounded-xl border transition-all ${currentStep === 0 ? 'opacity-0' : 'hover:bg-mist'}`}
            >
                <ChevronLeft className="w-5 h-5 text-slate" />
            </button>
            <div className="text-center">
                <p className="text-[10px] font-black text-slate/40 uppercase tracking-[0.2em] mb-1">Checkup Flow</p>
                <p className="text-xs font-bold text-obsidian">{shopName}</p>
            </div>
            <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Progress Bar */}
        <div className="mb-16">
            <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-black text-primary">{Math.round(progress)}% <span className="text-slate font-bold ml-1">Analyzing...</span></span>
                <span className="text-[10px] font-bold text-slate/60">{currentStep + 1} / {QUESTIONS.length + 1}</span>
            </div>
            <div className="h-2 bg-mist rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-primary" 
                />
            </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
            <motion.div
                key={currentStep === QUESTIONS.length ? 'step-final' : currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
            >
                {currentStep < QUESTIONS.length ? (
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mist text-slate font-black uppercase tracking-widest text-[9px]">
                                {currentQ.category}
                            </span>
                            <h2 className="text-3xl md:text-4xl font-black text-obsidian leading-tight tracking-tighter break-keep">
                                {currentQ.text}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {currentQ.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(opt)}
                                    className={`group text-left p-6 rounded-[28px] border-2 transition-all active:scale-[0.98] ${
                                        answers[currentQ.id] === opt 
                                        ? 'bg-obsidian border-obsidian text-white shadow-xl' 
                                        : 'bg-white border-line hover:border-slate/30 text-obsidian'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold">{opt}</span>
                                        <ChevronRight className={`w-5 h-5 transition-transform ${answers[currentQ.id] === opt ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* 추가 입력 영역 및 [다음] 버튼 (모든 단계 통일) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6 pt-4 border-t border-mist"
                        >
                            {currentQ.noteLabel && (
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-obsidian flex items-center gap-2">
                                        <Plus className="w-4 h-4 text-primary" /> {currentQ.noteLabel}
                                    </label>
                                    <textarea 
                                        value={questionNotes[currentQ.id] || ''}
                                        onChange={(e) => setQuestionNotes(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                                        placeholder="자세히 적어주실수록 더 정확한 분석이 가능합니다."
                                        className="w-full min-h-[150px] p-6 bg-mist rounded-[24px] border border-line outline-none focus:ring-2 focus:ring-primary/20 text-lg font-medium resize-none shadow-sm"
                                    />
                                </div>
                            )}
                            <div className="flex gap-3">
                                {currentStep > 0 && (
                                    <Button 
                                        onClick={() => setCurrentStep(prev => prev - 1)}
                                        variant="outline"
                                        className="h-16 px-8 rounded-2xl font-bold text-slate border-line hover:bg-mist transition-all"
                                    >
                                        이전
                                    </Button>
                                )}
                                <Button 
                                    onClick={() => setCurrentStep(prev => prev + 1)}
                                    disabled={!answers[currentQ.id]}
                                    className="flex-1 h-16 bg-obsidian text-white rounded-2xl font-black text-lg shadow-xl"
                                >
                                    다음 질문으로 이동
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                                <Sparkles className="w-3 h-3" /> Final Step
                            </span>
                            <h2 className="text-3xl md:text-4xl font-black text-obsidian leading-tight tracking-tighter break-keep">
                                이런 조건이면 바로 시작해볼 수 있다 싶은 요소를 적어주세요.
                            </h2>
                        </div>

                        <textarea 
                            value={entryCondition}
                            onChange={(e) => setEntryCondition(e.target.value)}
                            placeholder="예: 이번 달 한정 혜택이 있다면, 시술 전후 관리가 확실하다면 등"
                            className="w-full min-h-[200px] p-6 bg-mist rounded-[32px] border border-line outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg font-medium"
                        />

                        <div className="flex gap-3">
                            <Button 
                                onClick={() => setCurrentStep(prev => prev - 1)}
                                variant="outline"
                                className="h-20 px-10 rounded-[28px] font-bold text-slate border-line hover:bg-mist transition-all"
                            >
                                이전
                            </Button>
                            <Button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 h-20 bg-primary text-white rounded-[28px] font-black text-xl shadow-2xl shadow-primary/20"
                            >
                                {isSubmitting ? '전송 중...' : '맞춤 솔루션 분석 요청하기'}
                            </Button>
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
