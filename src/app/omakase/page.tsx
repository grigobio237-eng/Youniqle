'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Lock, ArrowRight, Check, Loader2, Sparkles, ShieldCheck, Zap, Activity, X } from 'lucide-react';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface OmakasePlan {
    planId: string;
    title: string;
    description: string;
    duration: string;
    priceEstimate: string;
    focusArea: string;
    routine: string[];
}

interface AIPlans {
    analysis: string;
    plans: {
        planA: OmakasePlan;
        planB: OmakasePlan;
        planC: OmakasePlan;
    };
}

export default function OmakasePage() {
    const [step, setStep] = React.useState('INTRO'); // INTRO, FORM, LOADING, RESULT, SUBMITTED
    const [formStep, setFormStep] = React.useState(1); // 1, 2, 3
    const [formData, setFormData] = React.useState({
        painPoint: 'fatigue',
        goal: '',
        budget: '50',
        habits: '',
        history: ''
    });
    const [aiPlans, setAiPlans] = React.useState<AIPlans | null>(null);
    const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);

    React.useEffect(() => {
        const savedDraft = localStorage.getItem('omakase_draft');
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                setFormData(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error('Failed to parse draft', e);
            }
        }
    }, []);

    React.useEffect(() => {
        if (Object.values(formData).some(v => v !== '')) {
            localStorage.setItem('omakase_draft', JSON.stringify(formData));
        }
    }, [formData]);

    const handleSubmitForm = async () => {
        setStep('LOADING');
        try {
            const response = await fetch('/api/ai/omakase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    painPoint: formData.painPoint,
                    goal: formData.goal,
                    budget: formData.budget,
                    symptoms: [formData.painPoint, formData.habits, formData.history]
                })
            });

            if (response.ok) {
                const data = await response.json();
                setAiPlans(data);
                setStep('RESULT');
                localStorage.removeItem('omakase_draft');
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

    const handleFinalSubmit = () => {
        setStep('SUBMITTED');
    };

    if (step === 'INTRO') {
        return (
            <ChapterWrapper chapter="omakase" className="container mx-auto px-4 py-20 min-h-screen flex flex-col items-center justify-center text-center space-y-8">
                <div className="w-24 h-24 bg-surface border border-chapter-accent/20 text-chapter-accent rounded-3xl flex items-center justify-center mb-4 shadow-2xl shadow-chapter-accent/10">
                    <Lock className="w-10 h-10" />
                </div>
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-7xl font-black text-text-primary tracking-tighter">Secret Recovery Lab</h1>
                    <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium">
                        이곳은 검증된 소수만을 위한 <b className="text-text-primary">비밀 회복 연구소</b>입니다.<br />
                        당신의 데이터와 의지를 심사하여 <br />
                        <b className="text-chapter-accent">매월 오직 50분께만</b> 프라이빗 플랜을 제안합니다.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-6 pt-8">
                    <div className="bg-red-500/10 text-red-500 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] animate-pulse border border-red-500/20">
                        Limited Access : 3 SLOTS LEFT
                    </div>

                    <div className="space-y-4 w-full max-w-sm">
                        <Button size="lg" className="h-16 w-full rounded-2xl text-lg bg-chapter-accent hover:bg-chapter-accent/90 text-background font-black shadow-2xl transition-all hover:scale-105" onClick={() => setStep('FORM')}>
                            입장 자격 심사 신청 <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <p className="text-[10px] text-text-secondary opacity-40 uppercase tracking-widest font-black">
                            * Strictly Private & Data-Driven Selection
                        </p>
                    </div>
                </div>
            </ChapterWrapper>
        );
    }

    if (step === 'LOADING') {
        return (
            <ChapterWrapper chapter="omakase" className="container mx-auto px-4 py-20 min-h-screen flex flex-col items-center justify-center text-center">
                <div className="relative mb-12">
                    <div className="absolute inset-0 bg-chapter-accent/20 blur-3xl rounded-full animate-pulse"></div>
                    <Loader2 className="w-20 h-20 animate-spin text-chapter-accent relative" />
                </div>
                <h2 className="text-3xl font-black text-text-primary mb-4 tracking-tight">회복 알고리즘 가동 중...</h2>
                <p className="text-text-secondary font-medium italic opacity-60">당신의 데이터를 기반으로 최적의 큐레이션을 설계하고 있습니다.</p>
            </ChapterWrapper>
        );
    }

    if (step === 'RESULT' && aiPlans) {
        return (
            <ChapterWrapper chapter="omakase" className="container mx-auto px-4 py-20 max-w-6xl min-h-screen">
                <div className="text-center mb-20 space-y-6">
                    <div className="inline-flex items-center px-4 py-1.5 bg-chapter-accent/5 text-chapter-accent rounded-full text-[10px] font-black tracking-widest uppercase border border-chapter-accent/20">
                        Curated Result
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-text-primary tracking-tighter">당신을 위한 프라이빗 솔루션</h1>
                    <p className="text-xl text-text-secondary max-w-3xl mx-auto font-medium leading-relaxed opacity-80">{aiPlans.analysis}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {Object.entries(aiPlans.plans).map(([key, plan]) => {
                        const isMain = key === 'planB';
                        return (
                            <Card
                                key={plan.planId}
                                className={`group cursor-pointer transition-all duration-500 rounded-[40px] overflow-hidden flex flex-col ${selectedPlan === plan.planId
                                    ? 'bg-surface border-chapter-accent shadow-2xl shadow-chapter-accent/10 ring-1 ring-chapter-accent'
                                    : 'bg-surface/50 border-line hover:border-line/40'
                                    }`}
                                onClick={() => setSelectedPlan(plan.planId)}
                            >
                                <CardHeader className={`p-8 pb-4 space-y-4 ${isMain ? 'bg-chapter-accent/5' : ''}`}>
                                    <div className="flex justify-between items-start">
                                        <Badge className={`bg-chapter-accent/10 text-chapter-accent border-none font-black text-[10px] tracking-widest rounded-md`}>
                                            PLAN {key.replace('plan', '')}
                                        </Badge>
                                        <div className="text-[10px] font-black text-text-secondary opacity-40 uppercase tracking-widest">{plan.duration}</div>
                                    </div>
                                    <h3 className="text-2xl font-black text-text-primary leading-tight">{plan.title}</h3>
                                    <p className="text-sm font-medium text-text-secondary opacity-70 leading-relaxed">{plan.description}</p>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8 flex-1 flex flex-col">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-background rounded-2xl p-4 border border-line">
                                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 opacity-50">Budget</p>
                                            <p className="text-sm font-bold text-text-primary">{plan.priceEstimate}</p>
                                        </div>
                                        <div className="bg-background rounded-2xl p-4 border border-line">
                                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 opacity-50">Focus</p>
                                            <p className="text-sm font-bold text-text-primary">{plan.focusArea}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        <p className="text-[10px] font-black text-chapter-accent uppercase tracking-widest ml-1">Daily Protocol</p>
                                        <ul className="space-y-3">
                                            {plan.routine.map((item, i) => (
                                                <li key={i} className="flex items-start gap-3 text-xs font-medium text-text-secondary">
                                                    <Check className="w-4 h-4 text-chapter-accent shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className={`mt-auto pt-6 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity ${selectedPlan === plan.planId ? 'opacity-100' : ''}`}>
                                        <div className="w-8 h-8 rounded-full bg-chapter-accent text-background flex items-center justify-center">
                                            <Check className="w-5 h-5" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="text-center space-y-6">
                    <Button
                        size="lg"
                        className="h-16 px-12 rounded-2xl bg-chapter-accent hover:bg-chapter-accent/90 text-background font-black shadow-2xl disabled:opacity-30 transition-all hover:scale-105"
                        disabled={!selectedPlan}
                        onClick={handleFinalSubmit}
                    >
                        {selectedPlan ? '이 설계로 컨시어지 신청하기' : '선호하는 플랜을 선택해주세요'}
                    </Button>
                    <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-black opacity-40">
                        * Final decision is made after 1:1 expert consultation
                    </p>
                </div>
            </ChapterWrapper>
        );
    }

    if (step === 'SUBMITTED') {
        return (
            <ChapterWrapper chapter="omakase" className="container mx-auto px-4 py-20 min-h-screen flex flex-col items-center justify-center text-center space-y-10 animate-fade-in">
                <div className="w-24 h-24 bg-chapter-accent/10 text-chapter-accent rounded-[32px] flex items-center justify-center shadow-2xl shadow-chapter-accent/5">
                    <ShieldCheck className="w-12 h-12" />
                </div>
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-5xl font-black text-text-primary tracking-tighter">의뢰서가 성공적으로 접수되었습니다.</h1>
                    <p className="text-xl text-text-secondary max-w-xl mx-auto font-medium leading-relaxed">
                        Youniqle 데이터 센터에서 내용을 정밀 검토 중입니다. <br />
                        24시간 이내에 <b className="text-text-primary">마스터 플랜과 멤버십 초대장</b>이 <br />
                        가입하신 연락처로 발송될 예정입니다.
                    </p>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <Button className="h-16 px-10 rounded-2xl bg-reward-gold text-obsidian font-black text-lg hover:scale-105 transition-all shadow-xl shadow-reward-gold/20" asChild>
                        <Link href="/pavilion">비밀 가상 공간 입장하기</Link>
                    </Button>
                    <Button variant="outline" className="h-16 px-10 rounded-2xl border-line font-black text-text-secondary hover:bg-white/5" asChild>
                        <Link href="/">홈으로 돌아가기</Link>
                    </Button>
                </div>
            </ChapterWrapper>
        );
    }

    // FORM STEP
    return (
        <ChapterWrapper chapter="omakase" className="container mx-auto px-4 py-20 max-w-2xl min-h-screen">
            {/* Progress Bar */}
            <div className="mb-16 space-y-6">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-chapter-accent uppercase tracking-[0.3em]">Protocol Stage {formStep}</span>
                        <h2 className="text-3xl font-black text-text-primary tracking-tight">회복 설계 의뢰서</h2>
                    </div>
                    <span className="text-sm font-black text-text-secondary opacity-40">{formStep} <span className="text-[10px] opacity-20">/</span> 3</span>
                </div>
                <div className="w-full bg-surface border border-line h-1.5 rounded-full overflow-hidden">
                    <div
                        className="bg-chapter-accent h-full transition-all duration-700 ease-out"
                        style={{ width: `${(formStep / 3) * 100}%` }}
                    />
                </div>
            </div>

            <Card className="bg-surface border-line rounded-[40px] overflow-hidden shadow-2xl">
                <CardContent className="p-10">
                    {formStep === 1 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-6">
                                <Label className="text-xl font-black text-text-primary block pl-1">1. 현재 가장 시급한 개선 영역은 무엇인가요?</Label>
                                <RadioGroup value={formData.painPoint} onValueChange={(v) => setFormData({ ...formData, painPoint: v })} className="space-y-3">
                                    {[
                                        { id: 'fatigue', label: 'CHRONIC FATIGUE', desc: '만성 피로 (자도 자도 힘들다)', icon: <Zap /> },
                                        { id: 'pain', label: 'BODY PAIN & SWELLING', desc: '통증 / 붓기 (몸이 무겁고 아프다)', icon: <Activity /> },
                                        { id: 'mental', label: 'MENTAL & SLEEP', desc: '멘탈 / 수면 (잠 못 들고 예민하다)', icon: <Lock /> },
                                    ].map((item) => (
                                        <div
                                            key={item.id}
                                            className={`flex items-center space-x-4 border p-6 rounded-2xl transition-all cursor-pointer group ${formData.painPoint === item.id ? 'border-chapter-accent bg-chapter-accent/5' : 'border-line hover:border-line/60'}`}
                                            onClick={() => setFormData({ ...formData, painPoint: item.id })}
                                        >
                                            <RadioGroupItem value={item.id} id={item.id} className="sr-only" />
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.painPoint === item.id ? 'bg-chapter-accent text-background' : 'bg-background text-text-secondary border border-line opacity-40'}`}>
                                                {React.cloneElement(item.icon as React.ReactElement, { className: 'w-5 h-5' })}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-chapter-accent uppercase tracking-widest mb-1">{item.label}</p>
                                                <p className="text-sm font-bold text-text-primary">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                            <Button className="w-full h-16 text-lg rounded-2xl bg-text-primary text-background font-black hover:bg-text-primary/90 transition-all hover:scale-[1.02]" onClick={() => setFormStep(2)}>
                                다음 단계 <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    )}

                    {formStep === 2 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-xl font-black text-text-primary block pl-1">2. 어떤 삶의 변화를 기대하고 계신가요?</Label>
                                    <Textarea
                                        placeholder="예: 3개월 안에 알람 없이 가볍게 일어나고 싶습니다. 휴가 때 입을 옷이 맞는 몸 상태를 원합니다."
                                        className="min-h-[140px] rounded-2xl bg-background border-line text-base p-6 focus:border-chapter-accent transition-all"
                                        value={formData.goal}
                                        onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-xl font-black text-text-primary block pl-1">3. 현재의 생활 패턴은 어떠신가요?</Label>
                                    <Textarea
                                        placeholder="예: 하루 커피 3잔, 주 4회 야근, 주말 몰아자기 위주 등"
                                        className="min-h-[120px] rounded-2xl bg-background border-line text-base p-6 focus:border-chapter-accent transition-all"
                                        value={formData.habits}
                                        onChange={(e) => setFormData({ ...formData, habits: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="ghost" className="h-16 flex-1 rounded-2xl font-black text-text-secondary border border-line" onClick={() => setFormStep(1)}>
                                    이전
                                </Button>
                                <Button className="h-16 flex-[2] rounded-2xl bg-text-primary text-background font-black hover:bg-text-primary/90 transition-all hover:scale-[1.02]" onClick={() => setFormStep(3)} disabled={!formData.goal}>
                                    다음 단계 <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {formStep === 3 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <Label className="text-xl font-black text-text-primary block pl-1">4. 회복을 위한 월 가용 예산을 설정해주세요.</Label>
                                    <RadioGroup value={formData.budget} onValueChange={(v) => setFormData({ ...formData, budget: v })} className="grid grid-cols-1 gap-3">
                                        {[
                                            { id: '30', label: 'BASIC SELECT', range: '30만원 이하' },
                                            { id: '50', label: 'ACTIVE RECOVERY', range: '30~70만원' },
                                            { id: '100+', label: 'INTENSIVE CARE', range: '70만원 이상' },
                                        ].map((item) => (
                                            <div
                                                key={item.id}
                                                className={`flex items-center space-x-4 border p-5 rounded-2xl transition-all cursor-pointer ${formData.budget === item.id ? 'border-chapter-accent bg-chapter-accent/5' : 'border-line hover:border-line/60'}`}
                                                onClick={() => setFormData({ ...formData, budget: item.id })}
                                            >
                                                <RadioGroupItem value={item.id} id={item.id} className="sr-only" />
                                                <div className={`w-2 h-2 rounded-full transition-all ${formData.budget === item.id ? 'bg-chapter-accent scale-150' : 'bg-line'}`}></div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black text-text-secondary opacity-40 uppercase tracking-widest">{item.label}</p>
                                                    <p className="text-sm font-bold text-text-primary">{item.range}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-xl font-black text-text-primary block pl-1">5. 특이 사항 (병력이나 유의 사항)</Label>
                                    <Input
                                        placeholder="예: 위염 증상이 자주 있습니다. 비타민 특정 성분 알러지 등"
                                        className="h-16 rounded-2xl bg-background border-line px-6 focus:border-chapter-accent transition-all"
                                        value={formData.history}
                                        onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="ghost" className="h-16 flex-1 rounded-2xl font-black text-text-secondary border border-line" onClick={() => setFormStep(2)}>
                                    이전
                                </Button>
                                <Button className="h-16 flex-[2] rounded-2xl bg-chapter-accent text-background font-black hover:bg-chapter-accent/90 transition-all hover:scale-[1.02] shadow-xl shadow-chapter-accent/20" onClick={handleSubmitForm}>
                                    AI 설계 시작 <Sparkles className="ml-2 w-5 h-5 shadow-inner" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </ChapterWrapper>
    );
}

