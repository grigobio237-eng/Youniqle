'use client';

import { useState } from 'react';
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
    const [step, setStep] = useState('INTRO'); // INTRO, FORM, LOADING, RESULT, SUBMITTED
    const [formData, setFormData] = useState({
        painPoint: 'fatigue',
        goal: '',
        budget: 'mid'
    });
    const [aiPlans, setAiPlans] = useState<AIPlans | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

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
                    symptoms: [formData.painPoint]
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

    const handleFinalSubmit = () => {
        // In production: save to DB
        setStep('SUBMITTED');
    };

    if (step === 'INTRO') {
        return (
            <div className="container mx-auto px-4 py-20 min-h-[80vh] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mb-8">
                    <Lock className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-bold mb-4 font-serif">Secret Recovery Omakase</h1>
                <p className="text-xl text-gray-600 mb-12 max-w-2xl leading-relaxed">
                    이곳은 아무나 들어올 수 없는 비밀 연구소입니다.<br />
                    당신의 예산, 목표, 그리고 가장 깊은 고민에 맞춰 <br />
                    <b>단 하나뿐인 회복 플랜(Plan A/B/C)</b>을 설계해 드립니다.
                </p>
                <div className="space-y-4">
                    <Button size="lg" className="h-14 px-8 rounded-full text-lg bg-black hover:bg-gray-800" onClick={() => setStep('FORM')}>
                        입장 신청서 작성하기 <ArrowRight className="ml-2" />
                    </Button>
                    <p className="text-sm text-gray-400">
                        * 작성 내용은 원장님만 열람 가능한 1급 보안 문서로 취급됩니다.
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
            <div className="mb-8">
                <span className="text-sm font-bold text-gray-400">STEP 1 / 1</span>
                <h2 className="text-2xl font-bold mt-2">회복 설계 의뢰서</h2>
                <p className="text-gray-500">솔직하게 작성할수록 더 정확한 플랜이 나옵니다.</p>
            </div>

            <Card>
                <CardContent className="p-8 space-y-8">
                    {/* Q1. Pain Point */}
                    <div className="space-y-4">
                        <Label className="text-lg font-bold">1. 현재 가장 힘든 점은 무엇인가요?</Label>
                        <RadioGroup value={formData.painPoint} onValueChange={(v) => setFormData({ ...formData, painPoint: v })}>
                            <div className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-gray-50">
                                <RadioGroupItem value="fatigue" id="r1" />
                                <Label htmlFor="r1" className="cursor-pointer flex-1">만성 피로 (자도 자도 힘들다)</Label>
                            </div>
                            <div className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-gray-50">
                                <RadioGroupItem value="pain" id="r2" />
                                <Label htmlFor="r2" className="cursor-pointer flex-1">통증 / 붓기 (몸이 무겁고 아프다)</Label>
                            </div>
                            <div className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-gray-50">
                                <RadioGroupItem value="mental" id="r3" />
                                <Label htmlFor="r3" className="cursor-pointer flex-1">멘탈 / 수면 (잠 못 들고 예민하다)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Q2. Goal */}
                    <div className="space-y-4">
                        <Label className="text-lg font-bold">2. 어떤 변화를 기대하시나요? (현실적 목표)</Label>
                        <Textarea
                            placeholder="예: 3개월 안에 아침에 알람 없이 일어나고 싶어요. 다리 붓기가 빠져서 치마를 입고 싶어요."
                            className="min-h-[100px]"
                            value={formData.goal}
                            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                        />
                    </div>

                    {/* Q3. Budget */}
                    <div className="space-y-4">
                        <Label className="text-lg font-bold">3. 생각하시는 월 가용 예산 범위는?</Label>
                        <p className="text-sm text-gray-500 mb-2">예산에 맞춰 Reset/Reborn/Restart 플랜을 조합해 드립니다.</p>
                        <RadioGroup value={formData.budget} onValueChange={(v) => setFormData({ ...formData, budget: v })}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="30" id="b1" />
                                <Label htmlFor="b1">30만원 이하 (기본 영양/루틴 관리)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="50" id="b2" />
                                <Label htmlFor="b2">30~70만원 (적극적 회복 + 보조제)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="100+" id="b3" />
                                <Label htmlFor="b3">70만원 이상 (시술/1:1코칭 포함)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="pt-6 border-t">
                        <Button className="w-full h-12 text-lg" onClick={handleSubmitForm}>
                            AI 플랜 생성하기 <Sparkles className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
