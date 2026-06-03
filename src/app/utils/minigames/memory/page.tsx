'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, Timer, Trophy, Brain, Target, Star } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types & Config ---
type GameStage = 'setup' | 'playing' | 'result';
type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

interface MemoryCard {
    id: number;
    icon: string;
    label: string;
    isFlipped: boolean;
    isMatched: boolean;
}

const DIFFICULTY_CONFIG = {
    EASY: { pairs: 6, rows: 3, cols: 4 },
    NORMAL: { pairs: 8, rows: 4, cols: 4 },
    HARD: { pairs: 10, rows: 4, cols: 5 }
};

const RECOVERY_ICONS = [
    { icon: '🧘‍♀️', label: 'Yoga' },
    { icon: '💧', label: 'Water' },
    { icon: '🌙', label: 'Sleep' },
    { icon: '🥗', label: 'Healthy' },
    { icon: '🌿', label: 'Herb' },
    { icon: '✨', label: 'Spark' },
    { icon: '🛁', label: 'Spa' },
    { icon: '🍎', label: 'Apple' },
    { icon: '🍵', label: 'Tea' },
    { icon: '🥑', label: 'Avocado' },
];

export default function MemoryGamePage() {
    const [stage, setStage] = useState<GameStage>('setup');
    const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
    const [cards, setCards] = useState<MemoryCard[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [bestScore, setBestScore] = useState<number | null>(null);

    // --- Game Logic ---

    const shuffleCards = useCallback((diff: Difficulty) => {
        const config = DIFFICULTY_CONFIG[diff];
        const selectedIcons = RECOVERY_ICONS.slice(0, config.pairs);
        const gameCards: MemoryCard[] = [];

        // Duplicate icons to create pairs
        [...selectedIcons, ...selectedIcons].forEach((item, index) => {
            gameCards.push({
                id: index,
                icon: item.icon,
                label: item.label,
                isFlipped: false,
                isMatched: false
            });
        });

        // Fisher-Yates Shuffle
        for (let i = gameCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
        }

        setCards(gameCards);
        setMoves(0);
        setTimeLeft(0);
        setFlippedIndices([]);
        setStage('playing');
        setTimerActive(true);
    }, []);

    const handleCardClick = (index: number) => {
        if (!timerActive || cards[index].isFlipped || cards[index].isMatched || flippedIndices.length === 2) return;

        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(prev => prev + 1);
            checkMatch(newFlipped);
        }
    };

    const checkMatch = (indices: number[]) => {
        const [first, second] = indices;
        if (cards[first].icon === cards[second].icon) {
            // Match success
            setTimeout(() => {
                setCards(prev => prev.map((card, i) =>
                    (i === first || i === second) ? { ...card, isMatched: true } : card
                ));
                setFlippedIndices([]);
            }, 500);
        } else {
            // Match fail
            setTimeout(() => {
                setCards(prev => prev.map((card, i) =>
                    (i === first || i === second) ? { ...card, isFlipped: false } : card
                ));
                setFlippedIndices([]);
            }, 1000);
        }
    };

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timerActive) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive]);

    // Check Win Condition
    useEffect(() => {
        if (cards.length > 0 && cards.every(card => card.isMatched)) {
            setTimerActive(false);
            setStage('result');
            // Save best score if applicable
            if (!bestScore || moves < bestScore) {
                setBestScore(moves);
            }
        }
    }, [cards, moves, bestScore]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="min-h-screen bg-violet-50/50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-4">
                    <Link href="/utils/minigames">
                        <Button variant="ghost" size="sm" className="text-foreground/70 hover:text-obsidian -ml-2">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            미니게임 돌아가기
                        </Button>
                    </Link>
                </div>

                <Card className="p-8 shadow-2xl bg-white border-none rounded-[40px] overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-400/5 blur-[100px] pointer-events-none"></div>

                    {/* Stage 1: Setup */}
                    {stage === 'setup' && (
                        <div className="text-center space-y-12 py-10">
                            <div className="space-y-4">
                                <div className="w-24 h-24 bg-violet-100 rounded-3xl flex items-center justify-center mx-auto text-violet-600 mb-6">
                                    <Brain className="w-12 h-12" />
                                </div>
                                <h1 className="font-black text-obsidian tracking-tighter text-4xl">기억력 카드 뒤집기</h1>
                                <p className="text-foreground/70 font-medium">유니클의 회복 아이콘을 매칭하여 당신의 집중력을 테스트하세요.</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                                {(['EASY', 'NORMAL', 'HARD'] as Difficulty[]).map((d) => (
                                    <Button
                                        key={d}
                                        variant={difficulty === d ? 'default' : 'outline'}
                                        onClick={() => setDifficulty(d)}
                                        className={`h-16 rounded-2xl font-black tracking-widest ${difficulty === d ? 'bg-violet-600 shadow-lg shadow-violet-200' : 'border-line'}`}
                                    >
                                        {d}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                onClick={() => shuffleCards(difficulty)}
                                className="w-full h-16 font-black rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 shadow-xl shadow-violet-200 transform hover:scale-[1.02] transition-all text-xl"
                            >
                                게임 시작하기
                            </Button>
                        </div>
                    )}

                    {/* Stage 2: Playing */}
                    {stage === 'playing' && (
                        <div className="space-y-8">
                            <div className="flex justify-between items-center bg-surface p-6 rounded-3xl">
                                <div className="flex gap-8">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-foreground/70 uppercase tracking-widest">Moves</span>
                                        <span className="text-2xl font-black text-violet-600">{moves}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-foreground/70 uppercase tracking-widest">Time</span>
                                        <div className="flex items-center gap-2 text-2xl font-black text-obsidian">
                                            <Timer className="w-5 h-5 text-foreground/70" />
                                            {formatTime(timeLeft)}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => setStage('setup')}
                                    className="text-foreground/70 hover:text-obsidian bg-white shadow-sm rounded-xl"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Restart
                                </Button>
                            </div>

                            <div className="grid gap-4 mx-auto memory-grid">
                                <style jsx>{`
                                    .memory-grid {
                                        grid-template-columns: repeat(${DIFFICULTY_CONFIG[difficulty].cols}, minmax(0, 1fr));
                                        max-width: 600px;
                                    }
                                `}</style>
                                {cards.map((card, index) => (
                                    <CardItem
                                        key={card.id}
                                        card={card}
                                        onClick={() => handleCardClick(index)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stage 3: Result */}
                    {stage === 'result' && (
                        <div className="text-center space-y-10 py-10 animate-in fade-in zoom-in-95">
                            <div className="space-y-4">
                                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto text-yellow-500 mb-6 shadow-xl animate-bounce">
                                    <Trophy className="w-12 h-12" />
                                </div>
                                <h2 className="font-black text-obsidian tracking-tighter text-4xl">완벽한 매칭입니다! 🏆</h2>
                                <p className="text-foreground/70 font-medium">당신의 회복 집중력이 최고조에 달했습니다.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                                <div className="bg-surface p-6 rounded-3xl border border-line">
                                    <span className="text-[10px] font-black text-foreground/70 uppercase tracking-widest block mb-2">Final Moves</span>
                                    <span className="text-3xl font-black text-violet-600">{moves}</span>
                                </div>
                                <div className="bg-surface p-6 rounded-3xl border border-line">
                                    <span className="text-[10px] font-black text-foreground/70 uppercase tracking-widest block mb-2">Total Time</span>
                                    <span className="text-3xl font-black text-obsidian">{formatTime(timeLeft)}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Button
                                    onClick={() => shuffleCards(difficulty)}
                                    className="w-full h-16 text-lg font-black rounded-2xl bg-violet-600 shadow-xl shadow-violet-200"
                                >
                                    한 번 더 하기
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setStage('setup')}
                                    className="w-full h-14 rounded-2xl border-line font-bold"
                                >
                                    난이도 선택으로 돌아가기
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

function CardItem({ card, onClick }: { card: MemoryCard, onClick: () => void }) {
    return (
        <div
            className="aspect-square relative cursor-pointer perspective-1000"
            onClick={onClick}
        >
            <motion.div
                className="w-full h-full relative preserve-3d"
                initial={false}
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
            >
                {/* Back of Card (Shown by default) */}
                <div className="absolute inset-0 w-full h-full bg-violet-50 border-2 border-violet-100 rounded-2xl flex items-center justify-center backface-hidden shadow-sm hover:border-violet-300 transition-colors z-10">
                    <div className="w-10 h-10 bg-violet-200/50 rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 text-violet-400 fill-violet-400" />
                    </div>
                </div>

                {/* Front of Card (Icon) */}
                <div
                    className={`absolute inset-0 w-full h-full rounded-2xl flex items-center justify-center backface-hidden rotate-y-180 border-2 shadow-inner ${card.isMatched ? 'bg-green-50 border-green-200' : 'bg-white border-violet-200'}`}
                >
                    <span className="text-4xl">{card.icon}</span>
                </div>
            </motion.div>
        </div>
    );
}
