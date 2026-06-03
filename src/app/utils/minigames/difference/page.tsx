'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, Trophy, Timer, MousePointer2, Lightbulb, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// --- Constants & Types ---
const GAME_TIME = 60;
const TOTAL_DIFFERENCES = 5;

interface Difference {
    id: number;
    x: number; // percentage (0-100)
    y: number; // percentage (0-100)
    found: boolean;
    label: string;
}

const DIFFERENCES_DATA: Difference[] = [
    { id: 1, x: 15, y: 35, found: false, label: "천장 조명의 개수" },
    { id: 2, x: 45, y: 72, found: false, label: "책상 위 텀블러" },
    { id: 3, x: 78, y: 25, found: false, label: "벽시계의 바늘" },
    { id: 4, x: 62, y: 55, found: false, label: "화분 잎의 방향" },
    { id: 5, x: 30, y: 48, found: false, label: "의자 등받이 로고" },
];

export default function SpotTheDifferencePage() {
    const [differences, setDifferences] = useState<Difference[]>(DIFFERENCES_DATA);
    const [timeLeft, setTimeLeft] = useState(GAME_TIME);
    const [isActive, setIsActive] = useState(false);
    const [foundCount, setFoundCount] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isWinner, setIsWinner] = useState(false);
    const [penalty, setPenalty] = useState(false);
    const [hint, setHint] = useState<number | null>(null);
    const [score, setScore] = useState(0);

    const imageRef = useRef<HTMLDivElement>(null);

    // --- Game Logic ---

    const initGame = useCallback(() => {
        setDifferences(DIFFERENCES_DATA.map(d => ({ ...d, found: false })));
        setTimeLeft(GAME_TIME);
        setIsActive(true);
        setFoundCount(0);
        setIsGameOver(false);
        setIsWinner(false);
        setPenalty(false);
        setHint(null);
        setScore(0);
    }, []);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft <= 0 && isActive) {
            endGame(false);
        }
    }, [isActive, timeLeft]);

    const endGame = (won: boolean) => {
        setIsActive(false);
        setIsGameOver(true);
        setIsWinner(won);
        if (won) {
            setScore(prev => prev + timeLeft * 10); // Bonus score for remaining time
        }
    };

    const handleImageClick = (e: React.MouseEvent) => {
        if (!isActive || isGameOver || penalty) return;

        const rect = imageRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Check if clicked near any difference
        const foundIndex = differences.findIndex(d =>
            !d.found &&
            Math.abs(d.x - x) < 5 && // 5% radius for click tolerance
            Math.abs(d.y - y) < 8
        );

        if (foundIndex !== -1) {
            const newDiffs = [...differences];
            newDiffs[foundIndex].found = true;
            setDifferences(newDiffs);
            setFoundCount(prev => prev + 1);
            setScore(prev => prev + 200);

            if (foundCount + 1 === TOTAL_DIFFERENCES) {
                endGame(true);
            }
        } else {
            // Penalty: Flash red and reduce time
            setPenalty(true);
            setTimeLeft(prev => Math.max(0, prev - 5));
            setTimeout(() => setPenalty(false), 500);
        }
    };

    const useHint = () => {
        if (!isActive || isGameOver || hint !== null || foundCount === TOTAL_DIFFERENCES) return;

        const unfound = differences.find(d => !d.found);
        if (unfound) {
            setHint(unfound.id);
            setScore(prev => Math.max(0, prev - 100)); // Hint costs points
            setTimeout(() => setHint(null), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-rose-50/30 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <Link href="/utils/minigames">
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 -ml-2 mb-2">
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                미니게임 돌아가기
                            </Button>
                        </Link>
                        <h1 className="font-black text-slate-900 tracking-tighter text-4xl">틀린그림 찾기</h1>
                        <p className="text-slate-500 font-medium">두 사무실 사이의 미묘한 차이를 발견하고 집중력을 높이세요!</p>
                    </div>

                    <div className="flex gap-4">
                        <Card className="px-6 py-3 bg-white border-none shadow-lg rounded-2xl flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time Left</span>
                                <div className={`text-2xl font-black tabular-nums transition-colors ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-slate-900'}`}>
                                    {timeLeft}s
                                </div>
                            </div>
                            <div className="w-px h-8 bg-slate-100" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Found</span>
                                <div className="text-2xl font-black text-rose-500">
                                    {foundCount} <span className="text-sm text-slate-300">/ {TOTAL_DIFFERENCES}</span>
                                </div>
                            </div>
                        </Card>
                        <Button
                            onClick={useHint}
                            disabled={!isActive || hint !== null}
                            className="h-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-100 transition-all flex flex-col gap-0.5"
                        >
                            <Lightbulb className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase">Hint</span>
                        </Button>
                    </div>
                </div>

                {!isActive && !isGameOver ? (
                    <Card className="aspect-[16/9] w-full bg-white border-none shadow-2xl rounded-[40px] flex flex-col items-center justify-center p-12 text-center overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-400/10 to-transparent pointer-events-none"></div>
                        <div className="w-24 h-24 bg-rose-100 text-rose-500 rounded-3xl flex items-center justify-center mb-6">
                            <MousePointer2 className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">집중력을 발휘할 준비가 되셨나요?</h2>
                        <ul className="text-slate-500 mb-8 space-y-2 font-medium">
                            <li>• 60초 안에 5군데의 다른 점을 찾으세요.</li>
                            <li>• 힌트를 사용하면 점수가 차감됩니다.</li>
                            <li>• 오답 클릭 시 시간이 5초 단축되니 주의하세요!</li>
                        </ul>
                        <Button
                            onClick={initGame}
                            className="h-16 px-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black shadow-xl shadow-slate-200 text-xl"
                        >
                            게임 시작하기 🚀
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Original Image */}
                        <div className="space-y-2">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 uppercase font-black tracking-widest">Original Reference</Badge>
                            <Card className="overflow-hidden border-none shadow-xl rounded-[32px] relative group">
                                <img
                                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
                                    alt="Office Original"
                                    className="w-full h-full object-cover grayscale-[0.2]"
                                />
                                {differences.map(d => d.found && (
                                    <div key={`orig-${d.id}`}>
                                        <motion.div
                                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                                            className={`absolute w-12 h-12 border-4 border-rose-500 rounded-full flex items-center justify-center bg-rose-500/10 shadow-lg z-20 diff-marker-${d.id}`}
                                        >
                                            <CheckCircle2 className="w-6 h-6 text-rose-500" />
                                        </motion.div>
                                        <style jsx>{`
                                            .diff-marker-${d.id} {
                                                left: ${d.x}%;
                                                top: ${d.y}%;
                                                transform: translate(-50%, -50%);
                                            }
                                        `}</style>
                                    </div>
                                ))}
                            </Card>
                        </div>

                        {/* Modified Image (Click Target) */}
                        <div className="space-y-2">
                            <Badge variant="secondary" className="bg-rose-100 text-rose-500 uppercase font-black tracking-widest">Spot the Difference!</Badge>
                            <Card
                                ref={imageRef}
                                onClick={handleImageClick}
                                className={`overflow-hidden border-none shadow-xl rounded-[32px] relative cursor-crosshair transition-all duration-300 ${penalty ? 'ring-8 ring-rose-500/50 scale-[0.99] grayscale-0' : 'ring-0'}`}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
                                    alt="Office Modified"
                                    className="w-full h-full object-cover filter brightness-[1.02]"
                                />

                                {/* Difference Elements (SVG transformations) */}
                                <DifferenceElements differences={differences} hint={hint} />

                                {/* Found Markers */}
                                {differences.map(d => d.found && (
                                    <div key={`mod-found-${d.id}`}>
                                        <motion.div
                                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                                            className={`absolute w-12 h-12 border-4 border-rose-500 rounded-full flex items-center justify-center bg-rose-500/10 shadow-lg z-20 mod-diff-marker-${d.id}`}
                                        >
                                            <CheckCircle2 className="w-6 h-6 text-rose-500" />
                                        </motion.div>
                                        <style jsx>{`
                                            .mod-diff-marker-${d.id} {
                                                left: ${d.x}%;
                                                top: ${d.y}%;
                                                transform: translate(-50%, -50%);
                                            }
                                        `}</style>
                                    </div>
                                ))}

                                {/* Penalty Overlay */}
                                <AnimatePresence>
                                    {penalty && (
                                        <motion.div
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="absolute inset-0 bg-rose-500/20 backdrop-blur-[2px] flex items-center justify-center z-30 pointer-events-none"
                                        >
                                            <AlertCircle className="w-20 h-20 text-white drop-shadow-2xl" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Game Over Screen */}
                <AnimatePresence>
                    {isGameOver && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                                className="bg-white max-w-lg w-full rounded-[48px] p-12 text-center space-y-8 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-48 h-48 bg-rose-100/50 blur-[80px] -z-10"></div>

                                <div className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-xl mb-2 ${isWinner ? 'bg-amber-100 text-amber-500' : 'bg-slate-100 text-slate-400'}`}>
                                    {isWinner ? '🏆' : '⏰'}
                                </div>

                                <div>
                                    <h2 className="font-black text-slate-900 mb-2 tracking-tighter text-4xl">
                                        {isWinner ? '완벽한 관찰력입니다!' : '시간이 부족했어요...'}
                                    </h2>
                                    <p className="text-slate-500 font-medium">
                                        {isWinner
                                            ? `${timeLeft}초를 남기고 모든 차이점을 찾아냈습니다. 당신의 눈은 고성능 센서급이군요!`
                                            : `마지막 한 끗 차이가 아쉬웠네요. 다시 한번 도전해서 집중력을 증명해 보세요.`}
                                    </p>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-3xl space-y-2">
                                    <div className="flex justify-between text-sm font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Final Score</span>
                                        <span className="text-slate-900">{score} pts</span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-200 rounded-full" />
                                    <div className="flex justify-between text-sm font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Observation Grade</span>
                                        <span className={`text-xl font-black ${isWinner ? 'text-amber-500' : 'text-slate-500'}`}>
                                            {isWinner ? (timeLeft > 30 ? 'SSS' : 'A') : 'F'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        onClick={initGame}
                                        className="flex-1 h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-lg shadow-xl"
                                    >
                                        다시 도전하기
                                    </Button>
                                    <Link href="/utils/minigames" className="flex-1">
                                        <Button
                                            variant="outline"
                                            className="w-full h-16 rounded-2xl border-slate-200 text-slate-900 font-bold hover:bg-slate-50"
                                        >
                                            그만하기
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Legend / Tip */}
                {isActive && (
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        {differences.map(d => (
                            <Badge
                                key={d.id}
                                className={`px-4 py-2 rounded-full border-none transition-all duration-500 ${d.found ? 'bg-rose-500 text-white opacity-100' : 'bg-slate-200 text-slate-400 opacity-40'}`}
                            >
                                {d.found ? <CheckCircle2 className="w-3 h-3 mr-2" /> : <div className="w-3 h-3 rounded-full bg-slate-400 mr-2" />}
                                <span className="text-xs font-bold uppercase tracking-tight">{d.label}</span>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Sub-components for Difference Effects ---

function DifferenceElements({ differences, hint }: { differences: Difference[], hint: number | null }) {
    return (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {/* Diff 1: Ceiling light count (Removed one on modified) */}
            {!differences[0].found && (
                <>
                    <div className={`absolute w-[10%] h-[15%] bg-black/60 blur-[2px] transition-all duration-500 diff-elem-1 ${hint === 1 ? 'animate-ping opacity-100 bg-rose-500/50' : 'opacity-0'}`} />
                    <style jsx>{`
                        .diff-elem-1 {
                            left: 15%;
                            top: 35%;
                            transform: translate(-50%, -50%) skew(-10deg);
                        }
                    `}</style>
                </>
            )}

            {/* Diff 2: Desk Tumbler (Changed color/size subtly) */}
            {!differences[1].found && (
                <>
                    <div className={`absolute w-8 h-12 bg-indigo-400/30 rounded-t-lg blur-[1px] diff-elem-2 ${hint === 2 ? 'ring-4 ring-rose-500 animate-pulse bg-rose-500/30' : ''}`} />
                    <style jsx>{`
                        .diff-elem-2 {
                            left: 45%;
                            top: 72%;
                            transform: translate(-50%, -50%);
                        }
                    `}</style>
                </>
            )}

            {/* Diff 3: Wall clock needles (Rotated) */}
            {!differences[2].found && (
                <>
                    <div className={`absolute w-10 h-10 border-2 border-slate-400/20 rounded-full diff-elem-3 ${hint === 3 ? 'bg-rose-500/20 scale-150 animate-bounce' : ''}`}>
                        <div className="absolute left-1/2 top-1/2 w-0.5 h-3 bg-slate-900/20 -translate-x-1/2 -translate-y-full" />
                    </div>
                    <style jsx>{`
                        .diff-elem-3 {
                            left: 78%;
                            top: 25%;
                            transform: translate(-50%, -50%) rotate(45deg);
                        }
                    `}</style>
                </>
            )}

            {/* Diff 4: Plant leaf direction (Inverted) */}
            {!differences[3].found && (
                <>
                    <div className={`absolute w-16 h-16 bg-emerald-900/10 rounded-full transition-transform diff-elem-4 ${hint === 4 ? 'scale-150 opacity-100 bg-rose-500/20 animate-pulse' : 'opacity-0'}`} />
                    <style jsx>{`
                        .diff-elem-4 {
                            left: 62%;
                            top: 55%;
                            transform: translate(-50%, -50%) scaleX(-1);
                        }
                    `}</style>
                </>
            )}

            {/* Diff 5: Chair Logo (Faded away) */}
            {!differences[4].found && (
                <>
                    <div className={`absolute w-6 h-4 bg-white/40 blur-[4px] diff-elem-5 ${hint === 5 ? 'opacity-100 bg-rose-500/50 scale-200 animate-ping' : 'opacity-0'}`} />
                    <style jsx>{`
                        .diff-elem-5 {
                            left: 30%;
                            top: 48%;
                            transform: translate(-50%, -50%);
                        }
                    `}</style>
                </>
            )}
        </div>
    );
}
