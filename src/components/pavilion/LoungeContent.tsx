'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Lock,
    ArrowRight,
    Check,
    Loader2,
    Sparkles,
    ShieldCheck,
    Zap,
    Activity,
    X,
    Crown,
    ScrollText,
    HeartPulse,
    UserCircle2,
    Dna,
    Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import LoungeLegacySection from './LoungeLegacySection';
import LoungeProductTab from './LoungeProductTab';

interface LoungeContentProps {
    owners: any[];
}

export default function LoungeContent({ owners }: LoungeContentProps) {
    const { data: session } = useSession();
    const [step, setStep] = useState('MAIN'); // MAIN, FORM, LOADING, RESULT, SUBMITTED
    const [formStep, setFormStep] = useState(1);
    const [activeTab, setActiveTab] = useState('lounge-home');
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    // Wire real data from owners[0]
    const master = owners?.[0];
    const masterSpecs = master?.specs || {};

    const [formData, setFormData] = useState<any>({
        painPoint: 'fatigue',
        goal: [],
        habits: [],
        otherGoal: '',
        otherHabits: '',
        budget: '50',
        history: ''
    });
    const [aiPlans, setAiPlans] = useState<any>(null);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [slots, setSlots] = useState({
        occupied: parseInt(masterSpecs.occupiedSlots || '47'),
        total: parseInt(masterSpecs.totalSlots || '50')
    });

    // Unified AI plan synchronization (Local + Server)
    useEffect(() => {
        // 1. Instant sync from local storage (No dependencies)
        const localPlans = localStorage.getItem('lounge_ai_plans');
        if (localPlans) {
            try {
                const parsed = JSON.parse(localPlans);
                setAiPlans(parsed);
                console.log('[Lounge] Found plans in localStorage');
            } catch (e) {
                console.error('[Lounge] Local plans parse error');
            }
        }

        // 2. Sync from server when session is ready
        const syncFromServer = async () => {
            if (session?.user?.email) {
                try {
                    console.log('[Lounge] Syncing with server for:', session.user.email);
                    const res = await fetch('/api/concierge/me');
                    if (res.ok) {
                        const serverData = await res.json();
                        console.log('[Lounge] Server Data received:', serverData ? 'YES' : 'NULL');
                        if (serverData) {
                            setAiPlans(serverData);
                            localStorage.setItem('lounge_ai_plans', JSON.stringify(serverData));
                        }
                    }
                } catch (error) {
                    console.error('[Lounge] Server sync error:', error);
                }
            }
        };

        if (session !== undefined && session !== null) {
            syncFromServer();
        }
    }, [session]);

    // Update active tab based on query param
    const searchParams = useSearchParams();
    useEffect(() => {
        const tab = searchParams?.get('tab');
        if (tab && (tab === 'lounge-home' || tab === 'stem-cell-products')) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Save newly generated plans to local storage
    useEffect(() => {
        if (aiPlans) {
            localStorage.setItem('lounge_ai_plans', JSON.stringify(aiPlans));
        }
    }, [aiPlans]);

    const isGoalSelected = (val: string) => formData.goal.includes(val);
    const toggleGoal = (val: string) => {
        if (isGoalSelected(val)) {
            setFormData({ ...formData, goal: formData.goal.filter((g: string) => g !== val) });
        } else {
            setFormData({ ...formData, goal: [...formData.goal, val] });
        }
    };

    const isHabitSelected = (val: string) => formData.habits.includes(val);
    const toggleHabit = (val: string) => {
        if (isHabitSelected(val)) {
            setFormData({ ...formData, habits: formData.habits.filter((h: string) => h !== val) });
        } else {
            setFormData({ ...formData, habits: [...formData.habits, val] });
        }
    };

    const handleSubmitForm = async () => {
        setStep('LOADING');
        try {
            // Join arrays for API compatibility
            const finalGoal = [...formData.goal, formData.otherGoal].filter(Boolean).join(', ');
            const finalHabits = [...formData.habits, formData.otherHabits].filter(Boolean).join(', ');

            const response = await fetch('/api/ai/omakase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    painPoint: formData.painPoint,
                    goal: finalGoal,
                    budget: formData.budget,
                    symptoms: [formData.painPoint, finalHabits, formData.history]
                })
            });

            if (response.ok) {
                const data = await response.json();
                setAiPlans(data);
                setStep('RESULT');
            } else {
                alert('AI 분석에 실패했습니다. 다시 시도해주세요.');
                setStep('FORM');
            }
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
            setStep('FORM');
        }
    };

    const handleSubmitSelection = async () => {
        if (!selectedPlan) return;

        try {
            console.log('[Lounge] Submitting selection:', selectedPlan);
            const res = await fetch('/api/concierge/select', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: selectedPlan })
            });

            if (res.ok) {
                console.log('[Lounge] Selection saved to server');
                // Update local storage too
                if (aiPlans) {
                    const updated = { ...aiPlans, selectedPlanId: selectedPlan };
                    setAiPlans(updated);
                    localStorage.setItem('lounge_ai_plans', JSON.stringify(updated));
                }
                setStep('SUBMITTED');
            } else {
                console.error('[Lounge] Failed to save selection');
                setStep('SUBMITTED');
            }
        } catch (error) {
            console.error('[Lounge] Submit selection error:', error);
            setStep('SUBMITTED');
        }
    };

    const handleTabChange = (value: string) => {
        console.log('[Lounge] Tab changed to:', value);
        setActiveTab(value);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (step === 'MAIN') {
        return (
            <div ref={scrollContainerRef} className="absolute inset-0 z-30 bg-luxury-silk overflow-y-auto animate-in fade-in duration-1000 pt-48 md:pt-0">
                <div className="container mx-auto px-4 py-12 md:py-20">
                    <section className="max-w-6xl mx-auto">
                        {/* 탭 네비게이션 */}
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                            <div className="flex justify-center mb-12 relative z-50">
                                <TabsList className="bg-white/50 backdrop-blur-md p-2 rounded-full border border-slate-100 shadow-lg pointer-events-auto">
                                    <TabsTrigger
                                        value="lounge-home"
                                        className="data-[state=active]:bg-luxury-navy data-[state=active]:text-white rounded-full px-8 py-3 font-black text-xs uppercase tracking-widest transition-all"
                                    >
                                        <Home className="w-4 h-4 mr-2" />
                                        라운지 홈
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="stem-cell-products"
                                        className="data-[state=active]:bg-luxury-gold data-[state=active]:text-luxury-navy rounded-full px-8 py-3 font-black text-xs uppercase tracking-widest transition-all"
                                    >
                                        <Dna className="w-4 h-4 mr-2" />
                                        줄기세포 솔루션
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* 라운지 홈 탭 */}
                            <TabsContent value="lounge-home" className="mt-0">
                                <div className="flex flex-col lg:flex-row gap-16 items-center">
                                    {/* Left: Visual Content */}
                                    <div className="flex-1 relative w-full aspect-[4/5] rounded-[60px] overflow-hidden luxury-shadow luxury-border">
                                        <Image
                                            src="/images/kim-mijeong-profile.jpg"
                                            alt="Representative Director"
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-luxury-navy via-transparent to-transparent opacity-60" />
                                        <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                                            <div className="space-y-1">
                                                <h3 className="text-white text-3xl font-black italic">{master?.name || 'Mijeong Kim'}</h3>
                                                <p className="text-luxury-gold text-xs font-black uppercase tracking-widest">{master?.role || 'Representative Director'}</p>
                                            </div>
                                            <Badge className="bg-luxury-gold text-luxury-navy border-none font-black px-6 py-2 rounded-full text-[10px] tracking-[0.2em]">
                                                PRINCIPAL
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Right: Content & Action */}
                                    <div className="flex-1 space-y-10">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-[2px] bg-luxury-gold" />
                                                <span className="text-xs font-black luxury-gold-text uppercase tracking-[0.4em]">원장 전용 프라이빗 라운지</span>
                                            </div>
                                            <h1 className="text-5xl md:text-7xl font-black text-luxury-navy tracking-tighter leading-[0.9] italic">
                                                {masterSpecs.introTitle || 'Secret Recovery Lab'}
                                            </h1>
                                        </div>

                                        <div className="space-y-6 text-slate-600 font-medium leading-relaxed md:text-lg">
                                            <p>
                                                {master?.bio || '유니클의 정점, 김미정 원장 1:1 컨시어지입니다.'}
                                            </p>
                                            <p className="text-sm opacity-70">
                                                {masterSpecs.welcomeMessage || '당신만의 완벽한 회복 여정을 위한 모든 아이템을 조율합니다.'}
                                            </p>
                                        </div>

                                        <div className="pt-6 space-y-8">
                                            <div className="flex items-center gap-6">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">이번 달 수용량</p>
                                                    <p className="text-xl font-black text-luxury-navy">{slots.occupied} / {slots.total} <span className="text-xs text-luxury-gold">슬롯 사용됨</span></p>
                                                </div>
                                                {slots.occupied < slots.total ? (
                                                    <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                        신규 신청 가능
                                                    </div>
                                                ) : (
                                                    <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 animate-pulse">
                                                        대기열 운영 중
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                onClick={() => aiPlans ? setStep('RESULT') : setStep('FORM')}
                                                className="w-full md:w-auto px-12 h-20 bg-luxury-navy text-white rounded-[32px] font-black text-lg uppercase tracking-widest shadow-2xl shadow-luxury-navy/20 transition-all hover:scale-105 active:scale-95 group"
                                            >
                                                {aiPlans ? '나의 맞춤 회복 플랜 확인하기' : '나만의 맞춤 회복 플랜 설계하기'} <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                            </Button>

                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                                * Personal Recovery Protocol & Custom Curation
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Integration of Legacy Content (Profile, Consultation, Philosophy, FAQ) */}
                                <LoungeLegacySection
                                    master={master}
                                    session={session}
                                    subscriptionActive={!!(session?.user && (session.user as any).subscription?.status === 'active')}
                                    aiPlans={aiPlans}
                                    onShowResults={aiPlans ? () => {
                                        setStep('RESULT');
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    } : undefined}
                                />
                            </TabsContent>

                            {/* 줄기세포 솔루션 탭 */}
                            <TabsContent value="stem-cell-products" className="mt-0">
                                <LoungeProductTab category="줄기세포" />
                            </TabsContent>
                        </Tabs>
                    </section>
                </div>
            </div>
        );
    }

    if (step === 'FORM') {
        return (
            <div className="absolute inset-0 z-30 bg-luxury-silk overflow-y-auto pt-48 md:pt-32 pb-20">
                <div className="container mx-auto px-4 max-w-2xl">
                    <div className="mb-12 text-center space-y-4">
                        <Crown className="w-10 h-10 text-luxury-gold mx-auto" />
                        <h2 className="text-3xl font-black text-luxury-navy tracking-tight italic">회복 플랜 의뢰서 작성: <span className="luxury-gold-text">{formStep}단계</span></h2>
                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden max-w-[200px] mx-auto">
                            <div
                                className="bg-luxury-gold h-full transition-all duration-700"
                                style={{ width: `${(formStep / 4) * 100}%` }}
                            />
                        </div>
                    </div>

                    <Card className="border-none luxury-shadow rounded-[40px] overflow-hidden p-10 bg-white">
                        {formStep === 1 && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                                <section className="space-y-6">
                                    <Label className="text-xl font-black text-luxury-navy block">1. 현재 가장 시급한 개선 영역은 무엇인가요?</Label>
                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { id: 'fatigue', label: '만성 피로', desc: '만성 피로 및 기력 저하', icon: <Zap /> },
                                            { id: 'pain', label: '신체 회복', desc: '신체 통증 및 컨디션 불균형', icon: <HeartPulse /> },
                                            { id: 'mental', label: '수면 및 정신 건강', desc: '수면 장애 및 스트레스 관리', icon: <Lock /> },
                                        ].map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => setFormData({ ...formData, painPoint: item.id })}
                                                className={`flex items-center gap-6 p-6 rounded-3xl border-2 transition-all cursor-pointer ${formData.painPoint === item.id ? 'border-luxury-gold bg-luxury-gold/5' : 'border-slate-50 hover:border-slate-100'}`}
                                            >
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${formData.painPoint === item.id ? 'bg-luxury-navy text-white' : 'bg-slate-50 text-slate-400'}`}>
                                                    {item.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black text-luxury-gold uppercase tracking-widest">{item.label}</p>
                                                    <p className="text-sm font-bold text-luxury-navy">{item.desc}</p>
                                                </div>
                                                {formData.painPoint === item.id && <Check className="text-luxury-gold" />}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                                <Button className="w-full h-16 bg-luxury-navy text-white rounded-2xl font-black hover:scale-[1.02] transition-transform" onClick={() => setFormStep(2)}>
                                    다음 단계로 <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        )}

                        {formStep === 2 && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                                <section className="space-y-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="rounded-full border-luxury-gold text-luxury-gold text-[10px] font-black px-3">STEP 02</Badge>
                                            <Label className="text-xl font-black text-luxury-navy">당신이 꿈꾸는 최상의 컨디션은 어떤 모습인가요?</Label>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium ml-1">* 해당되는 항목을 모두 선택해 주세요 (복수 선택 가능)</p>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                '아침에 눈이 번쩍 뜨이는 활기찬 상태',
                                                '업무 집중력이 하루 종일 유지되는 상태',
                                                '운동 후에도 근육통 없이 가뿐한 몸',
                                                '피부 결이 매끄럽고 안색이 밝은 상태',
                                                '스트레스 상황에서도 흔들림 없는 평온함',
                                                '숙면에 깊이 빠져 개운하게 일어나는 아침',
                                                '중요한 미팅 전 자신감 넘치는 컨디션',
                                                '오후 4시에도 지치지 않는 에너자이저',
                                                '명확한 사고와 빠른 판단력이 필요한 순간',
                                                '주변 사람들에게 "건강해 보인다"는 말을 듣는 일상'
                                            ].map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => toggleGoal(option)}
                                                    className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all border-2 ${isGoalSelected(option) ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-navy' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    if (!formData.goal.includes('OTHER')) {
                                                        setFormData({ ...formData, goal: [...formData.goal, 'OTHER'] });
                                                    } else {
                                                        setFormData({ ...formData, goal: formData.goal.filter((g: string) => g !== 'OTHER') });
                                                    }
                                                }}
                                                className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all border-2 ${isGoalSelected('OTHER') ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-navy' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                                            >
                                                기타 (직접 입력)
                                            </button>
                                        </div>
                                        {isGoalSelected('OTHER') && (
                                            <Input
                                                placeholder="원장에게 전달하고 싶은 당신의 목표를 구체적으로 입력하세요."
                                                className="h-14 rounded-2xl border-slate-100 focus:border-luxury-gold bg-white animate-in slide-in-from-top-2"
                                                autoFocus
                                                value={formData.otherGoal}
                                                onChange={(e) => setFormData({ ...formData, otherGoal: e.target.value })}
                                            />
                                        )}
                                    </div>
                                </section>
                                <div className="flex gap-4">
                                    <Button variant="ghost" className="h-16 flex-1 rounded-2xl font-black text-slate-400" onClick={() => setFormStep(1)}>이전으로</Button>
                                    <Button
                                        className="h-16 flex-[2] bg-luxury-navy text-white rounded-2xl font-black hover:scale-[1.02] transition-transform"
                                        onClick={() => setFormStep(3)}
                                        disabled={formData.goal.length === 0 && !formData.otherGoal}
                                    >
                                        다음 단계로 <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {formStep === 3 && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                                <section className="space-y-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="rounded-full border-luxury-gold text-luxury-gold text-[10px] font-black px-3">STEP 03</Badge>
                                            <Label className="text-xl font-black text-luxury-navy">현재의 생활 패턴과 습관을 솔직하게 공유해 주세요.</Label>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium ml-1">* 해당되는 항목을 모두 선택해 주세요 (복수 선택 가능)</p>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                '불규칙한 수면과 잦은 야근',
                                                '앉아 있는 시간이 길고 운동 부족',
                                                '카페인이나 당분 섭취가 많은 편',
                                                '잦은 음주나 자극적인 식습관',
                                                '취침 전 스마트폰 사용이 잦음',
                                                '아침 식사를 거르거나 불규칙한 식사',
                                                '하루 물 섭취량이 1리터 미만',
                                                '심한 거북목이나 잘못된 자세 유지',
                                                '감정 기복이 크고 예민한 성격',
                                                '영양제나 약물 복용이 전무함',
                                                '과도한 업무 압박과 정신적 피로',
                                                '흡연 또는 간접 흡연 노출'
                                            ].map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => toggleHabit(option)}
                                                    className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all border-2 ${isHabitSelected(option) ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-navy' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    if (!formData.habits.includes('OTHER')) {
                                                        setFormData({ ...formData, habits: [...formData.habits, 'OTHER'] });
                                                    } else {
                                                        setFormData({ ...formData, habits: formData.habits.filter((h: string) => h !== 'OTHER') });
                                                    }
                                                }}
                                                className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all border-2 ${isHabitSelected('OTHER') ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-navy' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                                            >
                                                기타 (직접 입력)
                                            </button>
                                        </div>
                                        {isHabitSelected('OTHER') && (
                                            <Input
                                                placeholder="현재 본인의 생활 습관이나 패턴을 자유롭게 입력해 주세요."
                                                className="h-14 rounded-2xl border-slate-100 focus:border-luxury-gold bg-white animate-in slide-in-from-top-2"
                                                autoFocus
                                                value={formData.otherHabits}
                                                onChange={(e) => setFormData({ ...formData, otherHabits: e.target.value })}
                                            />
                                        )}
                                    </div>
                                </section>
                                <div className="flex gap-4">
                                    <Button variant="ghost" className="h-16 flex-1 rounded-2xl font-black text-slate-400" onClick={() => setFormStep(2)}>이전으로</Button>
                                    <Button
                                        className="h-16 flex-[2] bg-luxury-navy text-white rounded-2xl font-black hover:scale-[1.02] transition-transform"
                                        onClick={() => setFormStep(4)}
                                        disabled={formData.habits.length === 0 && !formData.otherHabits}
                                    >
                                        다음 단계로 <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {formStep === 4 && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                                <section className="space-y-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="rounded-full border-luxury-gold text-luxury-gold text-[10px] font-black px-3">STEP 04</Badge>
                                            <Label className="text-xl font-black text-luxury-navy">마지막으로, 당신의 세부 사항을 확인해 주세요.</Label>
                                        </div>

                                        <div className="space-y-4 pt-4">
                                            <Label className="text-sm font-bold text-slate-400">월 가용 정비 예산 (Selection Tier)</Label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { id: '30', label: '필수', price: '30~50' },
                                                    { id: '100', label: '프레스티지', price: '100+' },
                                                    { id: 'consult', label: '무제한', price: 'Custom' },
                                                ].map((tier) => (
                                                    <div
                                                        key={tier.id}
                                                        onClick={() => setFormData({ ...formData, budget: tier.id })}
                                                        className={`p-4 rounded-2xl border-2 text-center cursor-pointer transition-all ${formData.budget === tier.id ? 'border-luxury-gold bg-luxury-gold/5' : 'border-slate-50'}`}
                                                    >
                                                        <p className="text-[10px] font-black text-luxury-gold uppercase tracking-widest">{tier.label}</p>
                                                        <p className="text-sm font-black text-luxury-navy">{tier.price}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-sm font-bold text-slate-400">특이 사항 (병력 및 유의 사항)</Label>
                                        <Input
                                            placeholder="알러지, 기저질환 등 있다면 입력해 주세요."
                                            className="h-14 rounded-2xl border-slate-100 bg-slate-50"
                                            value={formData.history}
                                            onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                                        />
                                    </div>
                                </section>
                                <div className="flex gap-4">
                                    <Button variant="ghost" className="h-16 flex-1 rounded-2xl font-black text-slate-400" onClick={() => setFormStep(3)}>이전으로</Button>
                                    <Button className="h-16 flex-[2] bg-luxury-gold text-luxury-navy rounded-2xl font-black hover:scale-[1.02] transition-transform shadow-xl shadow-luxury-gold/20" onClick={handleSubmitForm}>
                                        AI 설계 시작 <Sparkles className="ml-2 w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        );
    }

    if (step === 'LOADING') {
        return (
            <div className="absolute inset-0 z-30 bg-luxury-silk flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-1000">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-luxury-gold/20 blur-[100px] rounded-full animate-pulse" />
                    <Loader2 className="w-16 h-16 animate-spin text-luxury-gold relative" />
                </div>
                <h2 className="text-3xl font-black text-luxury-navy italic tracking-tight mb-2">당신의 회복을 위한 <span className="luxury-gold-text">여정을 설계 중입니다</span></h2>
                <p className="text-slate-400 font-medium tracking-widest uppercase text-[10px]">생체 데이터 분석 및 프로토콜 최적화 중</p>
            </div>
        );
    }

    if (step === 'RESULT' && aiPlans) {
        return (
            <div className="absolute inset-0 z-30 bg-luxury-silk overflow-y-auto pt-48 md:pt-32 pb-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-16 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Badge className="bg-luxury-gold/10 text-luxury-gold border-none font-black px-4 py-1.5 uppercase tracking-widest text-[10px]">엄선된 관리 결과</Badge>
                        <h1 className="text-4xl md:text-6xl font-black text-luxury-navy tracking-tighter italic">
                            Private <span className="luxury-gold-text tracking-normal">Solutions</span> for You
                        </h1>
                        <p className="text-lg text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">{aiPlans.analysis}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {Object.entries(aiPlans.plans).map(([key, plan]: [string, any]) => (
                            <Card
                                key={plan.planId}
                                onClick={() => setSelectedPlan(plan.planId)}
                                className={`group cursor-pointer transition-all duration-500 rounded-[40px] overflow-hidden flex flex-col border-2 ${selectedPlan === plan.planId ? 'border-luxury-gold bg-white shadow-2xl scale-[1.02]' : 'border-slate-50 bg-white/50 hover:border-slate-200'}`}
                            >
                                <div className={`p-8 space-y-4 ${key === 'planB' ? 'bg-luxury-gold/5' : ''}`}>
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-black luxury-gold-text uppercase tracking-widest">프로토콜 {key.slice(-1)}</span>
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{plan.duration}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-luxury-navy leading-tight">{plan.title}</h3>
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed min-h-[48px]">{plan.description}</p>
                                </div>
                                <CardContent className="p-8 space-y-8 flex-1 flex flex-col">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 rounded-2xl p-4">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">예산</p>
                                            <p className="text-sm font-black text-luxury-navy tracking-tight">{plan.priceEstimate}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-2xl p-4">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">집중 영역</p>
                                            <p className="text-sm font-black text-luxury-navy tracking-tight">{plan.focusArea}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <p className="text-[10px] font-black text-luxury-gold uppercase tracking-widest flex items-center gap-2">
                                            <ScrollText className="w-3 h-3" /> 일간 프로토콜
                                        </p>
                                        <ul className="space-y-3">
                                            {plan.routine.map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <div className="w-4 h-4 rounded-full bg-mist flex items-center justify-center shrink-0 mt-0.5">
                                                        <Check className="w-2 h-2 text-luxury-gold" />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600 leading-tight">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className={`pt-6 flex justify-center transition-all ${selectedPlan === plan.planId ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                                        <div className="w-10 h-10 rounded-full bg-luxury-navy text-white flex items-center justify-center shadow-lg">
                                            <Check className="w-6 h-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center space-y-8 animate-in fade-in duration-1000 delay-300">
                        <Button
                            onClick={handleSubmitSelection}
                            disabled={!selectedPlan}
                            className="h-20 lg:h-24 px-16 bg-luxury-navy text-white rounded-[32px] font-black text-xl uppercase tracking-widest shadow-2xl transition-all hover:scale-105 disabled:opacity-20"
                        >
                            {selectedPlan ? '이 설계로 컨시어지 신청하기' : '선호하는 플랜을 선택해주세요'}
                        </Button>
                        <p className="text-xs font-bold text-slate-400">
                            * 최종적인 케어 프로그램은 1:1 대면 상담 후 확정됩니다.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'SUBMITTED') {
        return (
            <div className="absolute inset-0 z-30 bg-luxury-silk flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-1000">
                <div className="w-24 h-24 bg-white/50 backdrop-blur-xl border border-luxury-gold/20 rounded-[40px] flex items-center justify-center shadow-2xl mb-10">
                    <ShieldCheck className="w-12 h-12 text-luxury-gold" />
                </div>
                <div className="space-y-6 max-w-2xl">
                    <h1 className="text-4xl md:text-6xl font-black text-luxury-navy tracking-tighter leading-none italic">
                        Protocol <span className="luxury-gold-text tracking-normal">Accepted.</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed">
                        의뢰서가 전용 공간에 성공적으로 접수되었습니다. <br />
                        데이터 분석이 완료되면 24시간 이내에 <br />
                        <b className="text-luxury-navy">마스터의 초대장</b>이 당신께 도달할 것입니다.
                    </p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mt-12">
                    <Button className="h-16 px-10 rounded-2xl bg-luxury-gold text-luxury-navy font-black hover:scale-105 transition-all shadow-xl shadow-luxury-gold/20" asChild>
                        <Link href="/pavilion">로비로 돌아가기</Link>
                    </Button>
                    <Button variant="outline" className="h-16 px-10 rounded-2xl border-slate-200 font-black text-slate-400 hover:bg-white/5" asChild>
                        <Link href="/">홈으로 가기</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return null;
}
