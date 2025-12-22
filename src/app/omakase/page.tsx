'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Lock, ArrowRight, Check, Loader2, Sparkles } from 'lucide-react';

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

    // Load draft from localStorage on mount
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

    // Save to localStorage whenever formData changes
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
                localStorage.removeItem('omakase_draft'); // Clear on success
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
            <div className="container mx-auto px-4 py-20 min-h-[80vh] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mb-8">
                    <Lock className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-bold mb-4 font-serif">Secret Recovery Omakase</h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
                    이곳은 소수의 선택된 분들을 위한 비밀 연구소입니다.<br />
                    당신의 회복 데이터와 의지를 검토하여 <br />
                    <b>매월 오직 50분께만</b> 프라이빗 플랜을 제안합니다.
                </p>
                <div className="bg-red-50 text-red-800 px-6 py-3 rounded-lg text-sm font-bold mb-8 inline-block border border-red-100 animate-pulse">
                    ⚠️ 현재 12월 신청 마감 임박 (잔여 TO: 3명)
                </div>
                <div className="space-y-4">
                    <Button size="lg" className="h-14 px-8 rounded-full text-lg bg-black hover:bg-gray-800 shadow-xl" onClick={() => setStep('FORM')}>
                        입장 자격 심사 신청하기 <ArrowRight className="ml-2" />
                    </Button>
                    <p className="text-sm text-gray-400">
                        * 심사는 100% 데이터 기반으로 진행되며, 기준 미달 시 반려될 수 있습니다.
                    </p>
                </div>
            </div>
        );
    }

    if (step === 'LOADING') {
        return (
            <div className="container mx-auto px-4 py-20 min-h-[80vh] flex flex-col items-center justify-center text-center">
                <Loader2 className="w-16 h-16 animate-spin text-primary mb-8" />
                <h2 className="text-2xl font-bold mb-2">AI가 맞춤형 플랜을 설계 중입니다...</h2>
                <p className="text-gray-500">약 3~5초 정도 소요됩니다.</p>
            </div>
        );
    }

    if (step === 'RESULT' && aiPlans) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="text-center mb-10">
                    <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold mb-2">AI 맞춤형 회복 플랜</h1>
                    <p className="text-gray-600">{aiPlans.analysis}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {Object.entries(aiPlans.plans).map(([key, plan]) => (
                        <Card
                            key={plan.planId}
                            className={`cursor-pointer transition-all hover:shadow-lg ${selectedPlan === plan.planId ? 'ring-2 ring-primary border-primary' : ''}`}
                            onClick={() => setSelectedPlan(plan.planId)}
                        >
                            <CardHeader className={key === 'planB' ? 'bg-primary/5' : ''}>
                                <CardTitle className="text-lg">{plan.title}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm">
                                    <p><b>기간:</b> {plan.duration}</p>
                                    <p><b>예상 비용:</b> {plan.priceEstimate}</p>
                                    <p><b>핵심 영역:</b> {plan.focusArea}</p>
                                </div>
                                <div className="pt-4 border-t">
                                    <p className="text-xs font-bold mb-2 text-gray-500">추천 루틴</p>
                                    <ul className="text-xs space-y-1">
                                        {plan.routine.map((item, i) => (
                                            <li key={i} className="flex items-start">
                                                <Check className="w-3 h-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="text-center space-y-4">
                    <Button
                        size="lg"
                        className="h-14 px-10"
                        disabled={!selectedPlan}
                        onClick={handleFinalSubmit}
                    >
                        {selectedPlan ? '이 플랜으로 상담 신청하기' : '플랜을 선택해주세요'}
                    </Button>
                    <p className="text-sm text-gray-400">
                        선택하신 플랜을 바탕으로 원장님과 1:1 상담이 진행됩니다.
                    </p>
                </div>
            </div>
        );
    }

    if (step === 'SUBMITTED') {
        return (
            <div className="container mx-auto px-4 py-20 min-h-[80vh] flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-8">
                    <Check className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold mb-4">신청서가 접수되었습니다.</h1>
                <p className="text-lg text-gray-600 mb-8 max-w-lg">
                    김미정 원장님이 내용을 검토 중입니다. <br />
                    24시간 이내에 <b>상세 플랜과 초대장</b>이 <br />
                    가입하신 이메일로 발송될 예정입니다.
                </p>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                    홈으로 돌아가기
                </Button>
            </div>
        );
    }

    // FORM STEP
    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            {/* Progress Bar */}
            <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded mb-2 inline-block">STAGE {formStep}</span>
                        <h2 className="text-2xl font-bold">회복 설계 의뢰서</h2>
                    </div>
                    <span className="text-sm text-gray-400 font-bold">{formStep} / 3</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-primary h-full transition-all duration-500 ease-out"
                        style={{ width: `${(formStep / 3) * 100}%` }}
                    />
                </div>
            </div>

            <Card className="overflow-hidden border-2 border-gray-100">
                <CardContent className="p-8">
                    {formStep === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-4">
                                <Label className="text-lg font-bold">1. 현재 가장 힘든 점은 무엇인가요?</Label>
                                <RadioGroup value={formData.painPoint} onValueChange={(v) => setFormData({ ...formData, painPoint: v })}>
                                    <div className="flex items-center space-x-2 border p-5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, painPoint: 'fatigue' })}>
                                        <RadioGroupItem value="fatigue" id="r1" />
                                        <Label htmlFor="r1" className="cursor-pointer flex-1 font-medium italic">만성 피로 (자도 자도 힘들다)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border p-5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, painPoint: 'pain' })}>
                                        <RadioGroupItem value="pain" id="r2" />
                                        <Label htmlFor="r2" className="cursor-pointer flex-1 font-medium">통증 / 붓기 (몸이 무겁고 아프다)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border p-5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, painPoint: 'mental' })}>
                                        <RadioGroupItem value="mental" id="r3" />
                                        <Label htmlFor="r3" className="cursor-pointer flex-1 font-medium">멘탈 / 수면 (잠 못 들고 예민하다)</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <Button className="w-full h-14 text-lg rounded-xl" onClick={() => setFormStep(2)}>
                                다음 단계로 <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    )}

                    {formStep === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-lg font-bold">2. 어떤 변화를 기대하시나요?</Label>
                                    <Textarea
                                        placeholder="예: 3개월 안에 아침에 알람 없이 일어나고 싶어요. 다리 붓기가 빠져서 치마를 입고 싶어요."
                                        className="min-h-[120px] rounded-xl text-base p-4"
                                        value={formData.goal}
                                        onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-lg font-bold">3. 평소 생활 습관은 어떠신가요?</Label>
                                    <Textarea
                                        placeholder="예: 하루 커피 3잔 이상, 야식 주 3회, 주 1회 운동 등"
                                        className="min-h-[100px] rounded-xl"
                                        value={formData.habits}
                                        onChange={(e) => setFormData({ ...formData, habits: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className="h-14 flex-1 rounded-xl" onClick={() => setFormStep(1)}>
                                    이전
                                </Button>
                                <Button className="h-14 flex-[2] rounded-xl" onClick={() => setFormStep(3)} disabled={!formData.goal}>
                                    다음 단계로 <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {formStep === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-lg font-bold">4. 월 가용 예산 범위를 알려주세요.</Label>
                                    <RadioGroup value={formData.budget} onValueChange={(v) => setFormData({ ...formData, budget: v })}>
                                        <div className="flex items-center space-x-2 border p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, budget: '30' })}>
                                            <RadioGroupItem value="30" id="b1" />
                                            <Label htmlFor="b1" className="cursor-pointer flex-1">30만원 이하 (기본 관리)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 border p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, budget: '50' })}>
                                            <RadioGroupItem value="50" id="b2" />
                                            <Label htmlFor="b2" className="cursor-pointer flex-1">30~70만원 (적극적 회복)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 border p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, budget: '100+' })}>
                                            <RadioGroupItem value="100+" id="b3" />
                                            <Label htmlFor="b3" className="cursor-pointer flex-1">70만원 이상 (집중 케어)</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-lg font-bold">5. 과거 치료나 관리 이력이 있나요? (필수 아님)</Label>
                                    <Input
                                        placeholder="예: 정형외과 도수치료 10회, 한약 복용 등"
                                        className="h-12 rounded-xl"
                                        value={formData.history}
                                        onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className="h-14 flex-1 rounded-xl" onClick={() => setFormStep(2)}>
                                    이전
                                </Button>
                                <Button className="h-14 flex-[2] rounded-xl bg-primary hover:bg-primary/90" onClick={handleSubmitForm}>
                                    AI 설계 시작하기 <Sparkles className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

