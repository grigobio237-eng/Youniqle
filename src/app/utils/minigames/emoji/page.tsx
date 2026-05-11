'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, Share2, Lightbulb, HelpCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Quiz Data
const QUIZ_DATA = [
    // Classic Proverbs
    { emoji: "🐮🏚️🛠️", answer: "소잃고외양간고친다", displayAnswer: "소 잃고 외양간 고친다", hint: "ㅅㅇㄱ ㅇㅇㄱ ㄱㅊㄷ", meaning: "이미 일을 그르친 뒤에는 뉘우쳐도 소용없다는 말" },
    { emoji: "🍡🍩🍰", answer: "그림의떡", displayAnswer: "그림의 떡", hint: "ㄱㄹㅇ ㄸ", meaning: "아무리 마음에 들어도 이용할 수 없거나 차지할 수 없는 것" },
    { emoji: "🙈🙉🙊", answer: "눈가리고아웅", displayAnswer: "눈 가리고 아웅", hint: "ㄴ ㄱㄹㄱ ㅇㅇ", meaning: "얕은 수로 남을 속이려 한다는 말" },
    { emoji: "⛰️⛰️⛰️", answer: "티끌모아태산", displayAnswer: "티끌 모아 태산", hint: "ㅌㄲ ㅁㅇ ㅌㅅ", meaning: "아무리 작은 것이라도 모이고 모이면 나중에 큰 덩어리가 됨" },
    { emoji: "🐸⛲", answer: "우물안개구리", displayAnswer: "우물 안 개구리", hint: "ㅇㅁ ㅇ ㄱㄱㄹ", meaning: "넓은 세상을 알지 못하고 저만 잘난 줄 아는 사람" },
    { emoji: "🚶‍♂️🌉🔨", answer: "돌다리도두들겨보고건너라", displayAnswer: "돌다리도 두들겨 보고 건너라", hint: "ㄷㄷㄹㄷ ㄷㄷㄱ ㅂㄱ ㄱㄴㄹ", meaning: "잘 아는 일이라도 세심하게 주의를 기울여야 함" },
    { emoji: "🐯💨", answer: "호랑이담배피던시절", displayAnswer: "호랑이 담배 피던 시절", hint: "ㅎㄹㅇ ㄷㅂ ㅍㄷ ㅅㅈ", meaning: "아주 먼 옛날" },
    { emoji: "🦐💥🐳", answer: "고래싸움에새우등터진다", displayAnswer: "고래 싸움에 새우 등 터진다", hint: "ㄱㄹ ㅆㅇㅇ ㅅㅇ ㄷ ㅌㅈㄷ", meaning: "강한 자끼리 싸우는 통에 아무 관계도 없는 약한 자가 해를 입음" },

    // Office Life
    { emoji: "💼📉😭", answer: "월급로그아웃", displayAnswer: "월급 로그아웃", hint: "ㅇㄱ ㄹㄱㅇㅇ", meaning: "직장인 공감: 월급이 들어오자마자 순식간에 다 빠져나감을 비유" },
    { emoji: "🛌⏰🏃‍♂️", answer: "출근전쟁", displayAnswer: "출근 전쟁", hint: "ㅊㄱ ㅈㅈ", meaning: "직장인 공감: 매일 아침 출근길의 치열함" },
    { emoji: "🔥📅", answer: "불금", displayAnswer: "불금", hint: "ㅂㄱ", meaning: "직장인 공감: 불타는 금요일" },
    { emoji: "🗣️👂📭", answer: "한귀로듣고한귀로흘리기", displayAnswer: "한 귀로 듣고 한 귀로 흘리기", hint: "ㅎ ㄱㄹ ㄷㄱ ㅎ ㄱㄹ ㅎㄹㄱ", meaning: "잔소리나 듣기 싫은 말을 신경 쓰지 않고 넘김" }
];

export default function EmojiQuizPage() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [input, setInput] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [showMeaning, setShowMeaning] = useState(false);
    const [gameState, setGameState] = useState<'playing' | 'correct' | 'wrong'>('playing');
    const [score, setScore] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);

    // Randomize initial question roughly or just start linear? 
    // Let's shuffle indices on mount to make it random each time users visit
    const [quizOrder, setQuizOrder] = useState<number[]>([]);

    useEffect(() => {
        const indices = Array.from({ length: QUIZ_DATA.length }, (_, i) => i);
        // Fisher-Yates shuffle
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        setQuizOrder(indices);
    }, []);

    const currentQuiz = quizOrder.length > 0 ? QUIZ_DATA[quizOrder[currentQuestionIndex]] : null;

    const handleAnswerSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!currentQuiz || gameState !== 'playing') return;

        const normalizedInput = input.replace(/\s+/g, ''); // Remove spaces
        if (normalizedInput === currentQuiz.answer) {
            setGameState('correct');
            setScore(prev => prev + 1);
        } else {
            setGameState('wrong');
            // Shake effect logic can be here, but simple state is enough for MVP
            setTimeout(() => setGameState('playing'), 1000);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < quizOrder.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            resetState();
        } else {
            // Loop back or finish? Let's loop for endless fun or reset
            alert(`모든 퀴즈를 완료했습니다! 총 점수: ${score}`);
            setCurrentQuestionIndex(0);
            setScore(0);
            resetState();
        }
    };

    const resetState = () => {
        setInput('');
        setShowHint(false);
        setShowMeaning(false);
        setGameState('playing');
        inputRef.current?.focus();
    };

    const copyChallenge = () => {
        if (!currentQuiz) return;
        const text = `이모지 퀴즈 도전! 🧩\n\n${currentQuiz.emoji}\n\n정답이 뭘까요? 맞춰보세요!`;
        navigator.clipboard.writeText(text).then(() => {
            alert('클립보드에 복사되었습니다! 친구들에게 공유해보세요.');
        });
    };

    if (!currentQuiz) return <div className="min-h-screen bg-pink-50 flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-pink-50/50 py-12 flex flex-col items-center">
            <div className="container mx-auto px-4 max-w-xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/utils" className="text-gray-500 hover:text-pink-600 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="text-center">
                        <h1 className="text-2xl font-black text-gray-800 flex items-center justify-center gap-2">
                            <span>🧠</span> 이모지 속담 퀴즈
                        </h1>
                        <p className="text-xs text-gray-400 mt-1">Daily Brain Training</p>
                    </div>
                    <div className="w-6" />
                </div>

                {/* Main Card */}
                <Card className="p-8 shadow-xl bg-white relative overflow-hidden min-h-[500px] flex flex-col justify-between">

                    {/* Top Stats */}
                    <div className="flex justify-between items-center mb-6">
                        <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                            Q.{currentQuestionIndex + 1}
                        </Badge>
                        <span className="text-sm font-bold text-gray-400">Score: {score}</span>
                    </div>

                    {/* Emoji Display */}
                    <div className="flex-1 flex flex-col items-center justify-center py-8">
                        <motion.div
                            key={currentQuiz.answer} // Trigger animation on new question
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="text-6xl md:text-7xl mb-8 tracking-[0.2em] text-center leading-relaxed"
                        >
                            {currentQuiz.emoji}
                        </motion.div>

                        {/* Hint Area */}
                        <div className="min-h-[60px] flex flex-col items-center gap-2">
                            <AnimatePresence>
                                {showHint && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-2xl font-bold text-pink-500 tracking-widest"
                                    >
                                        {currentQuiz.hint}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {!showHint && gameState === 'playing' && (
                                <button
                                    onClick={() => setShowHint(true)}
                                    className="text-sm text-gray-400 hover:text-pink-500 flex items-center gap-1 transition-colors"
                                >
                                    <HelpCircle className="w-3 h-3" /> 힌트 보기
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleAnswerSubmit} className="mt-8 relative">
                        {gameState === 'correct' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
                            >
                                <div className="text-green-600 font-bold text-xl mb-2">정답입니다! 🎉</div>
                                <div className="text-2xl font-black text-gray-800 mb-2">{currentQuiz.displayAnswer}</div>
                                <p className="text-gray-600 text-sm mb-6">{currentQuiz.meaning}</p>

                                <div className="flex gap-2">
                                    <Button type="button" onClick={nextQuestion} className="flex-1 bg-pink-500 hover:bg-pink-600">
                                        다음 문제 <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                                    </Button>
                                    <Button type="button" variant="outline" onClick={copyChallenge} size="icon" title="문제 공유하기">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="relative">
                                <Input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="정답을 입력하세요 (띄어쓰기 무관)"
                                    className={`pr-12 text-center text-lg h-14 ${gameState === 'wrong' ? 'border-red-500 animate-shake' : 'border-gray-300 focus:border-pink-500 focus:ring-pink-200'}`}
                                    autoFocus
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="absolute right-2 top-2 h-10 w-10 bg-gray-900 hover:bg-gray-800"
                                    disabled={!input.trim()}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        )}

                        {gameState === 'wrong' && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute -bottom-8 left-0 right-0 text-center text-red-500 text-sm font-medium"
                            >
                                땡! 다시 한 번 생각해보세요. 🤔
                            </motion.p>
                        )}
                    </form>

                </Card>

            </div>
        </div>
    );
}
