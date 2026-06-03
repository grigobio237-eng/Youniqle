'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, RotateCcw, Check, Sparkles, Share2, ArrowLeft, Sparkle } from 'lucide-react';
import { QUIZ_DATA, QuizCategory, Question, ResultType } from './data';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function MBTIPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({}); // Trait counts (e.g. { E: 3, I: 1 })
    const [result, setResult] = useState<ResultType | null>(null);
    const [showBridge, setShowBridge] = useState(false);
    const [selectedScoreIndex, setSelectedScoreIndex] = useState<number | null>(null);

    const category = selectedCategory ? QUIZ_DATA[selectedCategory] : null;

    const handleStart = (catId: string) => {
        setSelectedCategory(catId);
        setCurrentStep(0);
        setAnswers({});
        setResult(null);
        setShowBridge(false);
        setSelectedScoreIndex(null);
    };

    // Calculate which chapter we are in
    // Chapter 1: Steps 0 to 3 (Questions 1 to 4)
    // Chapter 2: Steps 4 to 7 (Questions 5 to 8)
    const totalQuestions = category?.questions.length || 8;
    const currentChapter = currentStep < 4 ? 1 : 2;

    const handleSelectOptionIndex = (index: number) => {
        if (!category) return;
        setSelectedScoreIndex(index);
        
        const question = category.questions[currentStep];
        let traitValue = '';
        
        // 5-point VS scale logic
        // index 0: Strongly Left (Option 0)
        // index 1: Weakly Left (Option 0)
        // index 2: Neutral (Assign to Left or Right based on ID for balance, or alternate)
        // index 3: Weakly Right (Option 1)
        // index 4: Strongly Right (Option 1)
        if (index <= 1) {
            traitValue = question.options[0].value;
        } else if (index >= 3) {
            traitValue = question.options[1].value;
        } else {
            // Neutral: Default to first option to ensure scoring continuity
            traitValue = question.options[0].value;
        }

        // Delay step advancement slightly for visual feedback on circle selection
        setTimeout(() => {
            const nextAnswers = {
                ...answers,
                [traitValue]: (answers[traitValue] || 0) + 1
            };
            setAnswers(nextAnswers);
            setSelectedScoreIndex(null);

            // Trigger Empathetic Bridge screen between Chapter 1 and Chapter 2
            if (currentStep === 3) {
                setShowBridge(true);
            } else if (currentStep < totalQuestions - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                calculateResult(nextAnswers);
            }
        }, 350);
    };

    const handleBridgeNext = () => {
        setShowBridge(false);
        setCurrentStep(4);
    };

    const calculateResult = (finalAnswers: Record<string, number>) => {
        if (!category) return;

        let resultCode = '';
        if (category.id === 'personality') {
            const e = finalAnswers['E'] || 0;
            const i = finalAnswers['I'] || 0;
            resultCode += e >= i ? 'E' : 'I';

            const s = finalAnswers['S'] || 0;
            const n = finalAnswers['N'] || 0;
            resultCode += s >= n ? 'S' : 'N';

            const t = finalAnswers['T'] || 0;
            const f = finalAnswers['F'] || 0;
            resultCode += t >= f ? 'T' : 'F';

            const j = finalAnswers['J'] || 0;
            const p = finalAnswers['P'] || 0;
            resultCode += j >= p ? 'J' : 'P';
        } else if (category.id === 'skin') {
            const o = finalAnswers['O'] || 0;
            const d = finalAnswers['D'] || 0;
            resultCode += o >= d ? 'O' : 'D';

            const s = finalAnswers['S'] || 0;
            const r = finalAnswers['R'] || 0;
            resultCode += s >= r ? 'S' : 'R';

            const p = finalAnswers['P'] || 0;
            const n = finalAnswers['N'] || 0;
            resultCode += p >= n ? 'P' : 'N';

            const w = finalAnswers['W'] || 0;
            const t = finalAnswers['T'] || 0;
            resultCode += w >= t ? 'W' : 'T';
        }

        const resultData = category.results[resultCode] || category.results['DEFAULT'] || {
            code: resultCode,
            title: '복합 성향',
            description: '균형 잡힌 복합 지표를 보이고 있습니다. 고유 맞춤 솔루션을 받아보세요.',
            traits: ['다재다능', '조화'],
            recommend: '유니클 종합 프리미엄 패스'
        };

        setResult(resultData);
    };

    const reset = () => {
        setSelectedCategory(null);
        setCurrentStep(0);
        setAnswers({});
        setResult(null);
        setShowBridge(false);
        setSelectedScoreIndex(null);
    };

    // 1. Category Selection View
    if (!selectedCategory) {
        return (
            <div className="container max-w-4xl mx-auto py-10 px-6 min-h-screen flex flex-col justify-start md:justify-center">
                <div className="mb-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="text-slate hover:text-obsidian -ml-2 font-bold gap-1 transition-all">
                            <ArrowLeft className="h-4 w-4" />
                            대시보드로 돌아가기
                        </Button>
                    </Link>
                </div>

                <div className="text-center mb-12 space-y-3">
                    <Badge className="bg-[#5c3e9c]/15 text-[#5c3e9c] border-none font-black text-xs px-4 py-1.5 rounded-full tracking-[0.2em] uppercase">
                        Self Discovery
                    </Badge>
                    <h1 className="font-black text-obsidian tracking-tighter leading-tight text-4xl md:text-4xl">나를 깊이 알아보는 시간</h1>
                    <p className="text-slate font-semibold max-w-md mx-auto text-sm md:text-base leading-relaxed">
                        성격부터 내면의 피부 장벽 상태까지,<br />
                        당신만의 독창적인 리듬을 찾아 솔루션을 큐레이션합니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto w-full">
                    {Object.values(QUIZ_DATA).map((cat) => (
                        <Card
                            key={cat.id}
                            className="group relative overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 border border-line bg-white/70 backdrop-blur-md rounded-[32px] p-1.5"
                            onClick={() => handleStart(cat.id)}
                        >
                            <div className="p-8 flex flex-col items-center text-center h-full space-y-6">
                                <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center text-4xl bg-gradient-to-br ${cat.color} text-white shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                                    {cat.icon}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-obsidian tracking-tight">{cat.title}</h3>
                                    <p className="text-slate text-xs font-semibold leading-relaxed max-w-[240px]">{cat.description}</p>
                                </div>
                                <Button className={`w-full bg-gradient-to-r ${cat.color} border-none rounded-2xl h-12 font-black text-xs text-white shadow-md hover:opacity-90 transition-opacity`}>
                                    테스트 시작하기 <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}

                    {/* Placeholder for future expansion */}
                    <Card className="border-dashed border-2 border-line bg-white/30 flex flex-col items-center justify-center p-8 text-center text-slate/40 rounded-[32px] min-h-[300px] space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/50 flex items-center justify-center mb-2 shadow-inner">
                            <span className="text-2xl">🚧</span>
                        </div>
                        <div>
                            <h3 className="font-black text-slate text-sm">두피 진단 & 라이프 밸런스</h3>
                            <p className="text-[10px] font-bold">더 다양한 맞춤 체크가 준비 중입니다.</p>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // 2. Empathetic Bridge View
    if (showBridge && category) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="min-h-screen bg-[#F9F7F2] flex flex-col items-center justify-center p-6 text-center"
                >
                    <div className="max-w-md w-full space-y-8 p-10 bg-white border border-line rounded-[40px] shadow-2xl relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#D4B06F]/5 rounded-full pointer-events-none" />
                        
                        <div className="w-20 h-20 bg-[#D4B06F]/10 rounded-full flex items-center justify-center mx-auto shadow-inner text-[#D4B06F]">
                            <Sparkle className="w-10 h-10 fill-current animate-pulse" />
                        </div>
                        
                        <div className="space-y-3">
                            <Badge className="bg-[#D4B06F]/15 text-[#D4B06F] border-none px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.25em]">
                                HALF COMPLETED
                            </Badge>
                            <h2 className="text-3xl font-black text-obsidian tracking-tight leading-tight">
                                전반부 성향을<br />성공적으로 모았습니다!
                            </h2>
                            <p className="text-slate font-semibold text-xs md:text-sm leading-relaxed px-4">
                                아주 순조롭습니다. 앞의 데이터를 임시 저장하고, 이제 후반부의 생활 습관 및 반응형 지표 측정을 시작합니다.
                            </p>
                        </div>

                        <Button
                            onClick={handleBridgeNext}
                            className="w-full h-16 bg-obsidian hover:bg-[#D4B06F] text-white hover:text-obsidian text-lg font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 border-none"
                        >
                            후반부 계속하기
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    // 3. Result View
    if (result && category) {
        return (
            <div className="container max-w-2xl mx-auto py-10 px-6 min-h-screen flex flex-col justify-center">
                <Card className="overflow-hidden border-none shadow-2xl bg-white rounded-[40px]">
                    <div className={`h-36 bg-gradient-to-r ${category.color} relative`}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-6 left-6 text-white hover:bg-white/20 rounded-full w-10 h-10"
                            onClick={reset}
                        >
                            <RotateCcw className="h-5 w-5" />
                        </Button>
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                            <div className="w-24 h-24 bg-white rounded-3xl p-1.5 shadow-xl flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform text-4xl">
                                {category.icon}
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-10 px-8 text-center space-y-8">
                        <div className="space-y-2">
                            <Badge className="bg-slate/10 text-slate border-none font-bold text-xs px-3 py-1 rounded-full">{category.title} 결과</Badge>
                            <h2 className={`text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${category.color} tracking-tighter leading-none`}>
                                {result.code}
                            </h2>
                            <h3 className="text-2xl font-black text-obsidian tracking-tight">{result.title}</h3>
                        </div>

                        <div className="prose prose-sm mx-auto text-slate leading-relaxed bg-mist/35 p-6 rounded-[24px] border border-line/40 text-sm font-semibold italic">
                            "{result.description}"
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center">
                            {result.traits.map((trait, i) => (
                                <span key={i} className="px-4 py-1.5 bg-indigo-50 text-secondary rounded-xl text-xs font-black tracking-wide border border-indigo-100/50 shadow-sm">
                                    #{trait}
                                </span>
                            ))}
                        </div>

                        <div className="border-t border-line/50 pt-8 space-y-4">
                            <h4 className="font-black text-obsidian flex items-center justify-center gap-2 tracking-tight text-base">
                                <Sparkles className="h-5 w-5 text-yellow-500 fill-current animate-bounce" />
                                맞춤 회복 솔루션 아이템
                            </h4>
                            <div className="bg-gradient-to-r from-mist/20 to-white border border-line p-5 rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-center sm:text-left space-y-1">
                                    <p className="text-[10px] font-black text-slate/50 uppercase tracking-widest">Recommended Treatment</p>
                                    <p className="font-black text-obsidian text-lg">{result.recommend}</p>
                                </div>
                                <Button size="lg" asChild className="w-full sm:w-auto bg-obsidian text-white rounded-xl font-bold text-xs h-10 hover:scale-[1.02] transition-transform">
                                    <Link href="/products">구경하러 가기</Link>
                                </Button>
                            </div>
                        </div>

                        <div className="pt-2 flex gap-4">
                            <Button className="flex-1 h-14 bg-obsidian text-white font-black rounded-2xl shadow-lg border-none" onClick={reset}>
                                다른 테스트 하기
                            </Button>
                            <Button variant="outline" className="flex-1 h-14 border-2 border-line text-obsidian font-black rounded-2xl hover:bg-surface transition-colors">
                                <Share2 className="mr-2 h-4 w-4" /> 공유하기
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // 4. Quiz View
    if (category) {
        const question = category.questions[currentStep];
        const progress = ((currentStep) / category.questions.length) * 100;

        // Custom titles for chapters
        const chapterTitle = currentChapter === 1 
            ? (category.id === 'personality' ? '대인관계 및 에너지 흐름' : '유수분 및 민감도 진단')
            : (category.id === 'personality' ? '정보 처리 및 결정 패턴' : '색소 및 탄력성 지표');

        return (
            <div className="container max-w-xl mx-auto py-8 px-6 min-h-[90vh] flex flex-col justify-center space-y-8">
                {/* Header info */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-secondary uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full">
                                Chapter {currentChapter}: {chapterTitle}
                            </span>
                            <div className="text-[10px] text-slate font-bold">
                                {category.title} • {currentStep + 1} / {totalQuestions}
                            </div>
                        </div>
                        <span className="font-black text-obsidian text-lg font-mono">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2 rounded-full bg-line [&>div]:bg-secondary transition-all" />
                </div>

                {/* Question card */}
                <Card className="p-8 border border-line shadow-xl rounded-[32px] bg-white min-h-[160px] flex items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-indigo-500 to-purple-500" />
                    <h2 className="font-black text-obsidian leading-relaxed tracking-tight px-4 text-xl md:text-2xl">
                        {question.text}
                    </h2>
                </Card>

                {/* Premium VS Selection Matrix */}
                <div className="space-y-8 py-6 bg-mist/20 rounded-[32px] p-6 border border-line/40">
                    <div className="flex items-center justify-between gap-6 px-2">
                        <div className="flex-1 text-center max-w-[45%]">
                            <span className="text-[10px] font-black text-secondary block mb-1">A 선택지</span>
                            <p className="text-xs font-bold text-obsidian leading-snug">{question.options[0].text}</p>
                        </div>
                        <div className="flex-1 text-center max-w-[45%]">
                            <span className="text-[10px] font-black text-secondary block mb-1">B 선택지</span>
                            <p className="text-xs font-bold text-obsidian leading-snug">{question.options[1].text}</p>
                        </div>
                    </div>

                    {/* Horizontal 5-point selection circles */}
                    <div className="relative flex items-center justify-between max-w-sm mx-auto px-4">
                        {/* Underline bar */}
                        <div className="absolute left-8 right-8 h-[3px] bg-line z-0" />
                        
                        {[0, 1, 2, 3, 4].map((idx) => {
                            const isSelected = selectedScoreIndex === idx;
                            
                            // Calculate sizes for premium circles
                            const sizes = [
                                'w-10 h-10', // Strongly Left
                                'w-8 h-8',   // Mildly Left
                                'w-6 h-6',   // Neutral
                                'w-8 h-8',   // Mildly Right
                                'w-10 h-10'  // Strongly Right
                            ];

                            const activeColors = [
                                'bg-secondary shadow-indigo-600/30 text-white border-indigo-600',
                                'bg-indigo-400 shadow-indigo-400/20 text-white border-secondary/30',
                                'bg-surface0 shadow-slate-500/20 text-white border-slate-500',
                                'bg-purple-400 shadow-purple-400/20 text-white border-purple-400',
                                'bg-secondary shadow-purple-600/30 text-white border-purple-600'
                            ];

                            const hoverColors = [
                                'hover:border-indigo-600 hover:bg-indigo-50',
                                'hover:border-secondary/30 hover:bg-indigo-50',
                                'hover:border-slate-500 hover:bg-surface',
                                'hover:border-purple-400 hover:bg-purple-50',
                                'hover:border-purple-600 hover:bg-purple-50'
                            ];

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectOptionIndex(idx)}
                                    className={`
                                        z-10 rounded-full border-2 bg-white transition-all duration-300 transform hover:scale-115 flex items-center justify-center font-black text-xs shadow-md
                                        ${sizes[idx]}
                                        ${isSelected ? activeColors[idx] : `border-line ${hoverColors[idx]} text-slate/50`}
                                    `}
                                    aria-label={`선택 레벨 ${idx + 1}`}
                                >
                                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex justify-between text-[9px] font-black text-slate/50 uppercase tracking-widest px-4">
                        <span>A 성향 강함</span>
                        <span>중립</span>
                        <span>B 성향 강함</span>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                    <Button
                        variant="ghost"
                        className="text-slate font-bold text-xs hover:text-obsidian"
                        onClick={() => currentStep > 0 && setCurrentStep(prev => prev - 1)}
                        disabled={currentStep === 0}
                    >
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> 이전으로
                    </Button>

                    <Button
                        variant="ghost"
                        className="text-slate/40 hover:text-red-500 font-bold text-xs"
                        onClick={reset}
                    >
                        진단 그만두기
                    </Button>
                </div>
            </div>
        );
    }

    return null;
}
