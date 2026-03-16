'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, CheckCircle2, Sparkles, Activity, Brain, Clock, PlusCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ---------------------------
// Diagnosis Questions Data
// ---------------------------
const PRECISION_QUESTIONS = [
    // 1. Physical (신체)
    {
        id: 'p1', category: 'physical', question: '아침에 일어났을 때 몸의 무게감이 어느 정도인가요?', options: [
            { label: '매우 가볍고 개운하다', score: 10 },
            { label: '보통이며 일상에 지장 없다', score: 7 },
            { label: '약간 무겁고 찌릿한 느낌이 있다', score: 4 },
            { label: '납덩어리를 매단 듯이 무겁다', score: 1 }
        ]
    },
    {
        id: 'p2', category: 'physical', question: '최근 목, 어깨, 혹은 허리에 만성적인 통증이 있나요?', options: [
            { label: '전혀 없다', score: 10 },
            { label: '가끔 뻐근한 정도다', score: 7 },
            { label: '자주 통증을 느끼며 신경 쓰인다', score: 4 },
            { label: '매일 통증이 심해 일상이 힘들다', score: 1 }
        ]
    },
    {
        id: 'p3', category: 'physical', question: '계단을 오르거나 빠르게 걸을 때 숨이 차는 정도는?', options: [
            { label: '전혀 숨차지 않고 에너지가 넘친다', score: 10 },
            { label: '약간 숨차지만 금방 회복된다', score: 7 },
            { label: '숨이 많이 차고 회복에 시간이 걸린다', score: 4 },
            { label: '조금만 움직여도 숨이 턱 끝까지 차오른다', score: 1 }
        ]
    },
    {
        id: 'p4', category: 'physical', question: '눈이 침침하거나 만성적인 안구 건조를 느끼나요?', options: [
            { label: '전혀 느끼지 않는다', score: 10 },
            { label: '장시간 모니터 볼 때만 가끔 그렇다', score: 7 },
            { label: '자주 충혈되고 건조함이 느껴진다', score: 4 },
            { label: '항상 눈이 뻑뻑하고 통증이 있다', score: 1 }
        ]
    },

    // 2. Mental (정신)
    {
        id: 'm1', category: 'mental', question: '사소한 일에도 감정이 예민해지거나 짜증이 나나요?', options: [
            { label: '천하태평, 평정심을 유지한다', score: 10 },
            { label: '가끔 스트레스 상황에서만 그렇다', score: 7 },
            { label: '자주 감정 기복을 조절하기 힘들다', score: 4 },
            { label: '매우 예민하고 통제 불능 상태다', score: 1 }
        ]
    },
    {
        id: 'm2', category: 'mental', question: '업무나 학습 시 집중력이 유지되는 시간은?', options: [
            { label: '2시간 이상 몰입 가능하다', score: 10 },
            { label: '1시간 정도는 거뜬하다', score: 7 },
            { label: '30분도 집중하기 힘들어 잡생각이 난다', score: 4 },
            { label: '단 5분도 몰입하기가 불가능하다', score: 1 }
        ]
    },
    {
        id: 'm3', category: 'mental', question: '무엇인가 새로운 것을 시작할 때의 의욕은?', options: [
            { label: '호기심이 넘치고 의욕이 앞선다', score: 10 },
            { label: '흥미가 생기면 열심히 하려 한다', score: 7 },
            { label: '해야 한다는 건 알지만 몸이 안 움직인다', score: 4 },
            { label: '만사가 귀찮고 아무것도 하기 싫다', score: 1 }
        ]
    },
    {
        id: 'm4', category: 'mental', question: '미래에 대한 불안감이나 막연한 걱정이 드나요?', options: [
            { label: '차근차근 준비하고 있어 걱정 없다', score: 10 },
            { label: '가끔 고민에 빠지지만 금방 털어낸다', score: 7 },
            { label: '잠들기 전 불쑥불쑥 불안감이 찾아온다', score: 4 },
            { label: '항상 불안과 걱정에 시달려 무기력하다', score: 1 }
        ]
    },

    // 3. Lifestyle (생활습관)
    {
        id: 'l1', category: 'lifestyle', question: '하루에 물(순수 생수)을 얼마나 마시나요?', options: [
            { label: '2L 이상 충분히 마신다', score: 10 },
            { label: '1L 이상은 꾸준히 마신다', score: 7 },
            { label: '생각날 때만 한두 잔 마신다', score: 4 },
            { label: '커피나 음료 외에는 거의 안 마신다', score: 1 }
        ]
    },
    {
        id: 'l2', category: 'lifestyle', question: '식사 시간의 규칙성은 어느 정도인가요?', options: [
            { label: '일정한 시간에 균형 잡힌 식사를 한다', score: 10 },
            { label: '대체로 시간을 지키려 노력한다', score: 7 },
            { label: '업무에 따라 불규칙하게 식사한다', score: 4 },
            { label: '항상 폭식하거나 끼니를 거르기 일쑤다', score: 1 }
        ]
    },
    {
        id: 'l3', category: 'lifestyle', question: '주중 운동(땀 흘릴 정도) 횟수는?', options: [
            { label: '4회 이상 꾸준히 운동한다', score: 10 },
            { label: '2-3회 정도 가볍게 운동한다', score: 7 },
            { label: '주 1회 겨우 시간을 낸다', score: 4 },
            { label: '한 달에 한 번도 운동하지 않는다', score: 1 }
        ]
    },
    {
        id: 'l4', category: 'lifestyle', question: '스마트폰이나 화면을 보는 시간은?', options: [
            { label: '필요할 때만 절제해서 사용한다', score: 10 },
            { label: '평균적인 사용량을 유지한다', score: 7 },
            { label: '눈이 아플 때까지 장시간 사용한다', score: 4 },
            { label: '자지도 않고 폰만 보는 중독 상태다', score: 1 }
        ]
    },

    // 4. Sleep (수면)
    {
        id: 's1', category: 'sleep', question: '잠들기까지 걸리는 시간은 보통 얼마인가요?', options: [
            { label: '눕자마자 10분 이내로 잠든다', score: 10 },
            { label: '20-30분 내외로 적당하다', score: 7 },
            { label: '1시간 이상 뒤척여야 겨우 잠든다', score: 4 },
            { label: '밤새 뜬눈으로 지새우는 날이 많다', score: 1 }
        ]
    },
    {
        id: 's2', category: 'sleep', question: '자다가 중간에 깨거나 화장실을 가나요?', options: [
            { label: '아침까지 한 번도 안 깨고 푹 잔다', score: 10 },
            { label: '가끔 한 번 정도 깨지만 다시 바로 잔다', score: 7 },
            { label: '자주 깨고 꿈을 너무 많이 꿔서 피곤하다', score: 4 },
            { label: '매시간 깨는 느낌이라 잔 것 같지 않다', score: 1 }
        ]
    },
    {
        id: 's3', category: 'sleep', question: '권장 수면 시간(7~8시간)을 지키고 있나요?', options: [
            { label: '매일 7시간 이상 규칙적으로 잔다', score: 10 },
            { label: '대체로 6시간 이상은 확보한다', score: 7 },
            { label: '항상 4-5시간 정도로 부족하게 잔다', score: 4 },
            { label: '밤낮이 바뀌었거나 수면 시간이 매우 짧다', score: 1 }
        ]
    },
    {
        id: 's4', category: 'sleep', question: '기상 직후 첫 감정/느낌은 어떤가요?', options: [
            { label: '오늘 하루가 기대되고 상쾌하다', score: 10 },
            { label: '그럭저럭 일어날 만하다', score: 7 },
            { label: '더 자고 싶고 온몸이 두들겨 맞은 듯하다', score: 4 },
            { label: '지옥이 따로 없고 다시 잠들고만 싶다', score: 1 }
        ]
    }
];

const getResultInfo = (score: number) => {
    if (score >= 140) return {
        title: '완벽한 회복 마스터, ECHO 등급',
        desc: '당신은 이미 회복의 달인입니다. 현재의 루틴을 유지하며 더 높은 성과를 위한 밸런스에 집중하세요.',
        recommend: ['고강도 퍼포먼스 관리', '정서적 몰입(Flow) 확장', '미세 영양소 밸런스']
    };
    if (score >= 100) return {
        title: '안정적인 성장형, NAVIGATOR 등급',
        desc: '대체로 양호하지만, 특정 영역에서의 불균형이 감지됩니다. 세부적인 조정이 필요합니다.',
        recommend: ['맞춤형 스트레칭 도입', '수면 환경 최적화', '집중력 강화 명상']
    };
    if (score >= 60) return {
        title: '주의가 필요한 정비 상태, GATE 등급',
        desc: '누적된 피로가 신호를 보내고 있습니다. 시스템의 전면적인 정비가 필요한 중차대한 시점입니다.',
        recommend: ['디지털 디톡스', '집중적 휴식 기간 확보', '전문가와의 상담 권장']
    };
    return {
        title: '긴급 시스템 복구 필요, RESET 단계',
        desc: '번아웃의 경계에 서 있습니다. 즉각적인 모든 활동 중단과 심층적인 회복 프로토콜이 필수입니다.',
        recommend: ['강제적인 휴식 루틴', '의학적 상담 및 진단', '기초 체력 재건 플랜']
    };
};

export default function DiagnosisPage() {
    const [step, setStep] = useState(-1); // -1: Intro, 0~N: Questions, N+1: Result
    const [answers, setAnswers] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [result, setResult] = useState<any>(null);
    const router = useRouter();

    const handleStart = () => setStep(0);

    const handleAnswer = (option: any) => {
        const currentQ = PRECISION_QUESTIONS[step];
        const newAnswers = [...answers, {
            questionId: currentQ.id,
            category: currentQ.category,
            question: currentQ.question,
            answer: option.label,
            score: option.score
        }];
        setAnswers(newAnswers);

        if (step < PRECISION_QUESTIONS.length - 1) {
            setStep(step + 1);
        } else {
            processResult(newAnswers);
        }
    };

    const processResult = async (finalAnswers: any[]) => {
        setIsSaving(true);
        const totalScore = finalAnswers.reduce((acc, curr) => acc + curr.score, 0);
        const categoryTotals = finalAnswers.reduce((acc: any, curr: any) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.score;
            return acc;
        }, {});

        const resultInfo = getResultInfo(totalScore);
        const resultObj = {
            totalScore,
            categoryScores: {
                physical: categoryTotals.physical || 0,
                mental: categoryTotals.mental || 0,
                lifestyle: categoryTotals.lifestyle || 0,
                sleep: categoryTotals.sleep || 0
            },
            answers: finalAnswers,
            resultTitle: resultInfo.title,
            resultDescription: resultInfo.desc,
            recommendations: resultInfo.recommend
        };

        setResult(resultObj);

        try {
            const res = await fetch('/api/diagnosis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resultObj)
            });
            if (res.ok) {
                setStep(PRECISION_QUESTIONS.length);
            } else {
                throw new Error('Save failed');
            }
        } catch (err) {
            console.error(err);
            alert('결과 저장 중 오류가 발생했습니다.');
            setStep(PRECISION_QUESTIONS.length); // Still show result even if save fails locally
        } finally {
            setIsSaving(false);
        }
    };

    const progress = ((step + 1) / PRECISION_QUESTIONS.length) * 100;

    return (
        <div className="min-h-screen bg-mist flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <AnimatePresence mode="wait">
                    {/* Intro View */}
                    {step === -1 && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="text-center space-y-10"
                        >
                            <div className="space-y-4">
                                <Badge className="bg-chapter-accent/10 text-chapter-accent border-none px-4 py-1.5 text-xs font-black tracking-[0.2em] uppercase">
                                    Precision Recovery OS v3.0
                                </Badge>
                                <h1 className="text-5xl md:text-7xl font-black text-obsidian tracking-tighter leading-none">
                                    내 몸이 보내는 신호,<br />데이터로 정밀 진단하세요.
                                </h1>
                                <p className="text-xl text-slate font-medium max-w-lg mx-auto leading-relaxed">
                                    단순한 일일 체크를 넘어, 총 16가지 정밀 문항을 통해<br className="hidden md:block" />
                                    당신의 신체, 정신, 생활 패턴을 다각도로 분석합니다.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-xl mx-auto">
                                {[
                                    { icon: <Activity className="w-6 h-6" />, label: 'Physical' },
                                    { icon: <Brain className="w-6 h-6" />, label: 'Mental' },
                                    { icon: <Clock className="w-6 h-6" />, label: 'Lifestyle' },
                                    { icon: <PlusCircle className="w-6 h-6" />, label: 'Sleep' }
                                ].map((item, i) => (
                                    <div key={i} className="p-4 bg-white/50 rounded-2xl border border-line flex flex-col items-center gap-2">
                                        <div className="text-chapter-accent">{item.icon}</div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate">{item.label}</span>
                                    </div>
                                ))}
                            </div>

                            <Button size="lg" onClick={handleStart} className="btn-primary h-20 px-16 text-2xl rounded-3xl shadow-2xl shadow-chapter-accent/20 animate-pulse">
                                정밀 분석 시작 <ChevronRight className="ml-2 w-8 h-8" />
                            </Button>
                        </motion.div>
                    )}

                    {/* Question View */}
                    {step >= 0 && step < PRECISION_QUESTIONS.length && (
                        <motion.div
                            key={`step-${step}`}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-12"
                        >
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <span className="text-sm font-black text-chapter-accent uppercase tracking-widest">
                                            {PRECISION_QUESTIONS[step].category} Analysis
                                        </span>
                                        <h2 className="text-3xl font-black text-obsidian tracking-tight">#{step + 1}. {PRECISION_QUESTIONS[step].question}</h2>
                                    </div>
                                    <span className="font-black text-slate text-xl">{step + 1}/{PRECISION_QUESTIONS.length}</span>
                                </div>
                                <Progress value={progress} className="h-3 rounded-full bg-white border border-line" />
                            </div>

                            <div className="grid gap-4">
                                {PRECISION_QUESTIONS[step].options.map((option, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(option)}
                                        className="p-6 text-left bg-white border-2 border-transparent rounded-[24px] hover:border-chapter-accent hover:shadow-xl transition-all group flex items-center justify-between"
                                    >
                                        <span className="text-xl font-bold text-obsidian group-hover:text-chapter-accent">{option.label}</span>
                                        <ChevronRight className="w-6 h-6 text-line group-hover:text-chapter-accent transition-transform group-hover:translate-x-1" />
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-center">
                                <Button variant="ghost" className="text-slate font-bold" onClick={() => step > 0 && setStep(step - 1)}>
                                    <ChevronLeft className="mr-1 w-4 h-4" /> 이전 질문으로
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Result View */}
                    {step === PRECISION_QUESTIONS.length && result && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-10 py-10"
                        >
                            <div className="text-center space-y-4">
                                <div className="w-24 h-24 bg-chapter-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    {isSaving ? <Loader2 className="w-12 h-12 text-chapter-accent animate-spin" /> : <CheckCircle2 className="w-12 h-12 text-chapter-accent" />}
                                </div>
                                <h3 className="text-4xl md:text-5xl font-black text-obsidian leading-tight tracking-tighter">
                                    {result.resultTitle}
                                </h3>
                                <p className="text-xl text-slate font-medium leading-relaxed max-w-xl mx-auto">
                                    {result.resultDescription}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Physical', score: result.categoryScores.physical, max: 40, icon: '💪' },
                                    { label: 'Mental', score: result.categoryScores.mental, max: 40, icon: '🧠' },
                                    { label: 'Lifestyle', score: result.categoryScores.lifestyle, max: 40, icon: '☕' },
                                    { label: 'Sleep', score: result.categoryScores.sleep, max: 40, icon: '🌙' }
                                ].map((item, i) => (
                                    <Card key={i} className="bg-white border-none shadow-lg rounded-[24px] p-6 text-center space-y-3">
                                        <div className="text-3xl">{item.icon}</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate">{item.label}</div>
                                        <div className="text-3xl font-black text-obsidian">{item.score}<span className="text-sm opacity-20">/{item.max}</span></div>
                                        <div className="w-full bg-mist h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-chapter-accent h-full category-bar" />
                                            <style jsx>{`
                                                .category-bar {
                                                    width: ${(item.score / item.max) * 100}%;
                                                }
                                            `}</style>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            <div className="bg-obsidian text-mist p-10 rounded-[40px] shadow-2xl space-y-6">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="text-reward-gold" />
                                    <h4 className="text-xl font-extrabold uppercase tracking-widest">Recommended Actions</h4>
                                </div>
                                <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {result.recommendations.map((rec: string, i: number) => (
                                        <li key={i} className="p-4 bg-mist/5 border border-mist/10 rounded-2xl flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-reward-gold" />
                                            <span className="text-sm font-bold">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button size="lg" asChild className="btn-primary flex-1 h-20 text-xl rounded-2xl shadow-xl shadow-chapter-accent/20">
                                    <Link href="/products">추천 키트 확인하기 <ArrowRight className="ml-2 w-6 h-6" /></Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild className="flex-1 h-20 text-xl rounded-2xl border-line">
                                    <Link href="/">대시보드로 이동</Link>
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
