'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, RotateCcw, Check, Sparkles, Share2, ArrowLeft } from 'lucide-react';
import { QUIZ_DATA, QuizCategory, Question, ResultType } from './data';
import Link from 'next/link';

export default function MBTIPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({}); // Trait counts (e.g. { E: 3, I: 1 })
    const [result, setResult] = useState<ResultType | null>(null);

    const category = selectedCategory ? QUIZ_DATA[selectedCategory] : null;

    const handleStart = (catId: string) => {
        setSelectedCategory(catId);
        setCurrentStep(0);
        setAnswers({});
        setResult(null);
    };

    const handleAnswer = (value: string) => {
        setAnswers(prev => ({
            ...prev,
            [value]: (prev[value] || 0) + 1
        }));

        if (category && currentStep < category.questions.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            calculateResult();
        }
    };

    const calculateResult = () => {
        if (!category) return;

        let resultCode = '';
        if (category.id === 'personality') {
            const e = answers['E'] || 0;
            const i = answers['I'] || 0;
            resultCode += e >= i ? 'E' : 'I';

            const s = answers['S'] || 0;
            const n = answers['N'] || 0;
            resultCode += s >= n ? 'S' : 'N';

            const t = answers['T'] || 0;
            const f = answers['F'] || 0;
            resultCode += t >= f ? 'T' : 'F';

            const j = answers['J'] || 0;
            const p = answers['P'] || 0;
            resultCode += j >= p ? 'J' : 'P';
        } else if (category.id === 'skin') {
            const o = answers['O'] || 0;
            const d = answers['D'] || 0;
            resultCode += o >= d ? 'O' : 'D';

            const s = answers['S'] || 0;
            const r = answers['R'] || 0;
            resultCode += s >= r ? 'S' : 'R';

            const p = answers['P'] || 0;
            const n = answers['N'] || 0;
            resultCode += p >= n ? 'P' : 'N';

            const w = answers['W'] || 0;
            const t = answers['T'] || 0;
            resultCode += w >= t ? 'W' : 'T';
        }

        // Find exact match or default
        const resultData = category.results[resultCode] || category.results['DEFAULT'] || {
            code: resultCode,
            title: '알 수 없는 유형',
            description: '분석 중 오류가 발생했습니다.',
            traits: [],
            recommend: '상담 필요'
        };

        // For skin types that might not have exact match in DB yet, construct a fallback if needed
        if (!category.results[resultCode] && category.id === 'skin') {
            // Simple fallback logic could be added here
        }

        setResult(resultData);
    };

    const reset = () => {
        setSelectedCategory(null);
        setCurrentStep(0);
        setAnswers({});
        setResult(null);
    };

    // 1. Category Selection View
    if (!selectedCategory) {
        return (
            <div className="container max-w-4xl mx-auto py-8 px-4">
                <div className="mb-4">
                    <Link href="/utils">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 -ml-2">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            돌아가기
                        </Button>
                    </Link>
                </div>

                <div className="text-center mb-10">
                    <Badge variant="outline" className="mb-2 text-indigo-600 border-indigo-200 bg-indigo-50">
                        Self Discovery
                    </Badge>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">나를 알아보는 시간</h1>
                    <p className="text-gray-600">
                        성격부터 피부 타입까지, <br className="md:hidden" />
                        다양한 테마로 나를 분석하고 딱 맞는 솔루션을 찾아보세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.values(QUIZ_DATA).map((cat) => (
                        <Card
                            key={cat.id}
                            className="group relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border-none bg-white shadow-md ring-1 ring-gray-100"
                            onClick={() => handleStart(cat.id)}
                        >
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br ${cat.color}`} />
                            <div className="p-8 flex flex-col items-center text-center h-full">
                                <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center text-3xl bg-gradient-to-br ${cat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    {cat.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{cat.title}</h3>
                                <p className="text-gray-500 text-sm mb-6 flex-grow">{cat.description}</p>
                                <Button className={`w-full bg-gradient-to-r ${cat.color} border-none`}>
                                    테스트 시작하기 <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}

                    {/* Placeholder for future expansion */}
                    <Card className="border-dashed border-2 bg-gray-50 flex flex-col items-center justify-center p-8 text-center text-gray-400 min-h-[300px]">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <span className="text-2xl">🚧</span>
                        </div>
                        <h3 className="font-semibold text-gray-500 mb-1">두피 진단 (준비중)</h3>
                        <p className="text-xs">더 많은 테스트가 곧 추가됩니다.</p>
                    </Card>
                </div>
            </div>
        );
    }

    // 2. Result View
    if (result && category) {
        return (
            <div className="container max-w-2xl mx-auto py-8 px-4">
                <Card className="overflow-hidden border-none shadow-xl bg-white">
                    <div className={`h-32 bg-gradient-to-r ${category.color} relative`}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 left-4 text-white hover:bg-white/20"
                            onClick={reset}
                        >
                            <RotateCcw className="h-5 w-5" />
                        </Button>
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                            <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg flex items-center justify-center text-4xl">
                                {category.icon}
                            </div>
                        </div>
                    </div>

                    <div className="pt-14 pb-8 px-8 text-center">
                        <Badge className="mb-4 bg-gray-100 text-gray-600 hover:bg-gray-200">{category.title} 결과</Badge>
                        <h2 className={`text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r ${category.color}`}>
                            {result.code}
                        </h2>
                        <h3 className="text-xl font-bold text-gray-900 mb-6">{result.title}</h3>

                        <div className="prose prose-sm mx-auto text-gray-600 mb-8 bg-gray-50 p-6 rounded-xl">
                            <p className="leading-relaxed">{result.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center mb-8">
                            {result.traits.map((trait, i) => (
                                <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium">
                                    #{trait}
                                </span>
                            ))}
                        </div>

                        <div className="border-t pt-8">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                                <Sparkles className="h-4 w-4 text-yellow-500" />
                                맞춤 추천 아이템
                            </h4>
                            <div className="bg-gradient-to-r from-gray-50 to-white border p-4 rounded-xl flex items-center justify-between gap-4">
                                <div className="text-left">
                                    <p className="text-xs text-gray-500 mb-1">당신에게 꼭 필요한</p>
                                    <p className="font-bold text-gray-900">{result.recommend}</p>
                                </div>
                                <Button size="sm" asChild>
                                    <Link href="/membership/shop">구경하러 가기</Link>
                                </Button>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <Button className="flex-1" onClick={reset}>
                                다른 테스트 하기
                            </Button>
                            <Button variant="outline" className="flex-1">
                                <Share2 className="mr-2 h-4 w-4" /> 공유하기
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // 3. Quiz View
    if (category) {
        const question = category.questions[currentStep];
        const progress = ((currentStep) / category.questions.length) * 100;

        return (
            <div className="container max-w-xl mx-auto py-12 px-4 h-[calc(100vh-64px)] flex flex-col justify-center">
                <div className="mb-8">
                    <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
                        <span>{category.title}</span>
                        <span>{currentStep + 1} / {category.questions.length}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <Card className="p-8 border-none shadow-lg mb-8 min-h-[200px] flex items-center justify-center text-center">
                    <h2 className="text-xl font-bold text-gray-900 leading-relaxed">
                        Q{currentStep + 1}. <br />
                        {question.text}
                    </h2>
                </Card>

                <div className="space-y-3">
                    {question.options.map((option, i) => (
                        <Button
                            key={i}
                            variant="outline"
                            className="w-full py-8 text-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all duration-300"
                            onClick={() => handleAnswer(option.value)}
                        >
                            {option.text}
                        </Button>
                    ))}
                </div>

                <Button
                    variant="ghost"
                    className="mt-8 text-gray-400 hover:text-gray-600"
                    onClick={reset}
                >
                    그만두기
                </Button>
            </div>
        );
    }

    return null;
}
