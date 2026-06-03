'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, Trophy, Keyboard, Timer } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Business Quotes (Korean)
const QUOTES = [
    { text: "실패는 성공을 향한 디딤돌이다.", author: "토마스 에디슨" },
    { text: "가장 큰 위험은 아무런 위험도 감수하지 않는 것이다.", author: "마크 저커버그" },
    { text: "혁신은 리더와 추종자를 구분하는 잣대다.", author: "스티브 잡스" },
    { text: "성공은 매일 반복되는 작은 노력들의 합이다.", author: "로버트 콜리어" },
    { text: "기회는 일어나는 것이 아니라 만들어내는 것이다.", author: "크리스 그로서" },
    { text: "우리가 두려워해야 할 유일한 것은 두려움 그 자체다.", author: "프랭클린 루즈벨트" },
    { text: "할 수 있다고 믿는다면 이미 절반은 이룬 것이다.", author: "테오도어 루즈벨트" },
    { text: "비즈니스의 목적은 고객을 창조하고 유지하는 것이다.", author: "피터 드러커" },
    { text: "성공의 비결은 평범한 일을 비범하게 잘하는 것이다.", author: "존 D. 록펠러" },
    { text: "탁월함은 일회성 행동이 아니라 습관이다.", author: "아리스토텔레스" }
];

interface GameState {
    status: 'idle' | 'playing' | 'finished';
    currentQuoteIndex: number;
    input: string;
    startTime: number | null;
    endTime: number | null;
    wpm: number;
    accuracy: number;
}

export default function TypingPage() {
    const [gameState, setGameState] = useState<GameState>({
        status: 'idle',
        currentQuoteIndex: 0,
        input: '',
        startTime: null,
        endTime: null,
        wpm: 0,
        accuracy: 100
    });

    const inputRef = useRef<HTMLInputElement>(null);

    // Initial load
    useEffect(() => {
        setRandomQuote();
    }, []);

    const setRandomQuote = () => {
        const randomIndex = Math.floor(Math.random() * QUOTES.length);
        setGameState(prev => ({
            ...prev,
            status: 'idle',
            currentQuoteIndex: randomIndex,
            input: '',
            startTime: null,
            endTime: null,
            wpm: 0,
            accuracy: 100
        }));
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleInputArray = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const currentQuote = QUOTES[gameState.currentQuoteIndex].text;

        // Start timer on first char
        if (gameState.status === 'idle' && val.length > 0) {
            setGameState(prev => ({
                ...prev,
                status: 'playing',
                startTime: Date.now(),
                input: val
            }));
            return;
        }

        if (gameState.status === 'finished') return;

        // Calculate Stats
        let correctChars = 0;
        for (let i = 0; i < val.length; i++) {
            if (val[i] === currentQuote[i]) correctChars++;
        }

        const accuracy = Math.round((correctChars / val.length) * 100) || 100;

        // WPM (CPM / 5) roughly. Korean characters are typed differently, but let's assume CPM for simplicity
        // CPM (Characters Per Minute)
        const timeElapsed = (Date.now() - (gameState.startTime || Date.now())) / 60000; // minutes
        const cpm = timeElapsed > 0 ? Math.round(val.length / timeElapsed) : 0;

        // Check if finished
        if (val === currentQuote) {
            setGameState({
                ...gameState,
                status: 'finished',
                input: val,
                endTime: Date.now(),
                wpm: cpm, // Display CPM instead of WPM for Korean context
                accuracy
            });
        } else {
            setGameState({
                ...gameState,
                input: val,
                wpm: cpm,
                accuracy
            });
        }
    };

    const getRank = (cpm: number) => {
        if (cpm >= 500) return { title: 'CEO', color: 'text-purple-600', bg: 'bg-purple-100' };
        if (cpm >= 400) return { title: '이사', color: 'text-red-600', bg: 'bg-red-100' };
        if (cpm >= 300) return { title: '부장', color: 'text-orange-600', bg: 'bg-orange-100' };
        if (cpm >= 200) return { title: '대리', color: 'text-blue-600', bg: 'bg-blue-100' };
        return { title: '인턴', color: 'text-gray-600', bg: 'bg-gray-100' };
    };

    // Render logic for highlighted text
    const renderQuote = () => {
        const quote = QUOTES[gameState.currentQuoteIndex].text;
        return (
            <div className="text-2xl font-medium tracking-wide mb-8 leading-loose relative break-keep text-gray-400 select-none">
                {/* Background Text */}
                <div className="absolute inset-0 pointer-events-none">
                    {quote}
                </div>
                {/* Overlay Inputted Text */}
                <div className="absolute inset-0 pointer-events-none">
                    {gameState.input.split('').map((char, i) => {
                        const isCorrect = char === quote[i];
                        return (
                            <span key={i} className={isCorrect ? 'text-gray-900' : 'text-red-500 bg-red-100'}>
                                {quote[i]}
                            </span>
                        );
                    })}
                    {/* Cursor */}
                    {gameState.status !== 'finished' && (
                        <span
                            className="border-l-2 border-indigo-500 animate-pulse ml-[1px] inline-block h-[1.2em] align-text-bottom"
                        />
                    )}
                </div>
                {/* Spacer to keep height */}
                <div className="opacity-0">
                    {quote}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-blue-50/50 py-12 flex flex-col items-center">
            <div className="container mx-auto px-4 max-w-3xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/utils" className="text-gray-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Keyboard className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-black text-gray-800">TYPING BATTLE</h1>
                    </div>
                    <div className="w-6" />
                </div>

                <Card className="p-8 lg:p-12 shadow-xl bg-white relative overflow-hidden">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center mb-12 text-gray-500 font-mono text-sm uppercase tracking-widest border-b pb-4">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-2">
                                <Timer className="w-4 h-4" />
                                {gameState.status === 'playing' ? 'Typing...' : 'Ready'}
                            </span>
                        </div>
                        <div className="flex gap-6">
                            <span>Accuracy: <span className="text-gray-900 font-bold">{gameState.accuracy}%</span></span>
                            <span>Speed: <span className="text-gray-900 font-bold">{gameState.wpm}</span> CPM</span>
                        </div>
                    </div>

                    {/* Quote Display */}
                    <div className="min-h-[120px] flex flex-col justify-center text-center">
                        {renderQuote()}
                        <p className="text-right text-gray-500 italic mt-4 text-sm">- {QUOTES[gameState.currentQuoteIndex].author} -</p>
                    </div>

                    {/* Hidden Input field to capture typing */}
                    <input
                        ref={inputRef}
                        type="text"
                        className="absolute opacity-0 top-0 left-0 h-full w-full cursor-default"
                        value={gameState.input}
                        onChange={handleInputArray}
                        disabled={gameState.status === 'finished'}
                        autoFocus
                        aria-label="타이핑 입력"
                    />

                    {/* Result Overlay */}
                    <AnimatePresence>
                        {gameState.status === 'finished' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center"
                            >
                                <div className="mb-2 text-gray-400 font-bold tracking-widest uppercase">Result Report</div>
                                <h2 className="font-black text-gray-900 mb-6 text-xl">
                                    {gameState.wpm} <span className="text-2xl font-normal text-gray-500">CPM</span>
                                </h2>

                                {(() => {
                                    const rank = getRank(gameState.wpm);
                                    return (
                                        <Badge className={`mb-8 px-6 py-2 text-lg ${rank.bg} ${rank.color} hover:${rank.bg}`}>
                                            당신의 직급: {rank.title}
                                        </Badge>
                                    );
                                })()}

                                <div className="flex gap-4">
                                    <Button onClick={setRandomQuote} size="lg" className="bg-blue-600 hover:bg-blue-700">
                                        <RefreshCw className="mr-2 w-5 h-5" />
                                        다음 명언 도전
                                    </Button>
                                    <Link href="/utils">
                                        <Button variant="outline" size="lg">
                                            그만하기
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>

                <p className="mt-8 text-center text-gray-400 text-sm">
                    Press any key to start typing. Focus is automatically handled.
                </p>
            </div>
        </div>
    );
}
