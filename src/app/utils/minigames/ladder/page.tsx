'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, User, Trophy, RefreshCw, Shuffle, Play } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Types
type GameStage = 'setup' | 'playing' | 'result';

interface Player {
    id: number;
    name: string;
}

interface Reward {
    id: number;
    text: string;
}

interface LadderLine {
    level: number; // 0 to 100 (percentage of height)
    colIndex: number; // Connects colIndex and colIndex + 1
}

export default function LadderGamePage() {
    const [stage, setStage] = useState<GameStage>('setup');
    const [playerCount, setPlayerCount] = useState(4);
    const [players, setPlayers] = useState<Player[]>([]);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [ladderLines, setLadderLines] = useState<LadderLine[]>([]);
    const [activePath, setActivePath] = useState<number | null>(null); // Currently selected player index for viewing path
    const [results, setResults] = useState<Record<number, number>>({}); // Map player index to reward index
    const [showAllResult, setShowAllResult] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false); // Track animation state for suspense

    // Initialize inputs when player count changes
    useEffect(() => {
        const newPlayers = Array.from({ length: playerCount }, (_, i) => ({
            id: i,
            name: `참가자 ${i + 1}`
        }));
        const newRewards = Array.from({ length: playerCount }, (_, i) => ({
            id: i,
            text: i === playerCount - 1 ? '커피쏘기' : '통과'
        }));
        setPlayers(newPlayers);
        setRewards(newRewards);
    }, [playerCount]);

    // Handle animation timing - Only for turning OFF
    useEffect(() => {
        if (isAnimating) {
            const timer = setTimeout(() => {
                setIsAnimating(false);
            }, 3000); // 3s matches animation duration
            return () => clearTimeout(timer);
        }
    }, [isAnimating]);

    const onPlayerClick = (idx: number) => {
        if (stage === 'playing' && !isAnimating && !showAllResult) {
            setIsAnimating(true); // Set true immediately to prevent result flash
            setActivePath(idx);
        }
    };

    const handlePlayerNameChange = (id: number, val: string) => {
        setPlayers(players.map(p => p.id === id ? { ...p, name: val } : p));
    };

    const handleRewardTextChange = (id: number, val: string) => {
        setRewards(rewards.map(r => r.id === id ? { ...r, text: val } : r));
    };

    // Generate Random Ladder
    const generateLadder = () => {
        const lines: LadderLine[] = [];
        const numCols = playerCount;
        const numLevels = 20; // Increased density for more tension

        for (let level = 1; level < numLevels; level++) {
            for (let col = 0; col < numCols - 1; col++) {
                // Determine if we should place a line here (50% chance)
                const hasLeftNeighbor = col > 0 && lines.some(l => l.level === level && l.colIndex === col - 1);

                if (!hasLeftNeighbor && Math.random() < 0.5) {
                    lines.push({ level, colIndex: col });
                }
            }
        }
        setLadderLines(lines);
        calculateResults(lines);
        setStage('playing');
        setActivePath(null);
        setShowAllResult(false);
    };

    const calculateResults = (lines: LadderLine[]) => {
        const res: Record<number, number> = {};
        for (let startIdx = 0; startIdx < playerCount; startIdx++) {
            let currentCol = startIdx;
            // Sort lines by level to simulate going down
            const sortedLines = [...lines].sort((a, b) => a.level - b.level);

            for (const line of sortedLines) {
                if (line.colIndex === currentCol) {
                    currentCol++; // Move right
                } else if (line.colIndex === currentCol - 1) {
                    currentCol--; // Move left
                }
            }
            res[startIdx] = currentCol;
        }
        setResults(res);
    };

    const resetGame = () => {
        setStage('setup');
        setActivePath(null);
        setShowAllResult(false);
    };

    // --- Render Logic ---

    // Canvas-like simple rendering with SVG
    const renderLadder = () => {
        const maxX = 1000;
        const maxY = 500;

        return (
            <div className="relative w-full h-[400px] mt-10 mb-10 select-none">
                <svg width="100%" height="100%" viewBox={`0 0 ${maxX} ${maxY}`} preserveAspectRatio="none" className="absolute top-0 left-0">
                    {/* Vertical Lines */}
                    {players.map((_, i) => (
                        <line
                            key={`v-${i}`}
                            x1={(i * maxX) / (playerCount - 1)}
                            y1="0"
                            x2={(i * maxX) / (playerCount - 1)}
                            y2={maxY}
                            stroke="#cbd5e1"
                            strokeWidth="3"
                            vectorEffect="non-scaling-stroke"
                        />
                    ))}

                    {/* Horizontal Lines */}
                    {ladderLines.map((line, i) => {
                        const startX = (line.colIndex * maxX) / (playerCount - 1);
                        const endX = ((line.colIndex + 1) * maxX) / (playerCount - 1);
                        const y = (line.level * maxY) / 20; // 20 levels
                        return (
                            <line
                                key={`h-${i}`}
                                x1={startX} y1={y}
                                x2={endX} y2={y}
                                stroke="#cbd5e1"
                                strokeWidth="3"
                                vectorEffect="non-scaling-stroke"
                            />
                        );
                    })}

                    {/* Active Path Highlight */}
                    {(activePath !== null || showAllResult) && (
                        showAllResult
                            ? players.map((_, idx) => renderPath(idx, getColor(idx)))
                            : renderPath(activePath!, '#f97316') // Orange-500
                    )}
                </svg>

                {/* Player Labels (Top) */}
                <div className="absolute -top-10 left-0 w-full flex justify-between items-end">
                    {players.map((p, i) => (
                        <div
                            key={`p-${i}`}
                            className={`flex flex-col items-center cursor-pointer hover:scale-110 transition-transform w-2 ladder-player-${i}`}
                            onClick={() => onPlayerClick(i)}
                        >
                            <span className={`text-xs font-bold mb-1 whitespace-nowrap ${(activePath === i || showAllResult) ? 'text-indigo-600' : 'text-gray-600'}`}>
                                {p.name}
                            </span>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm border-2 
                                ${(activePath === i) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}>
                                <User className="w-3 h-3" />
                            </div>
                            <style jsx>{`
                                .ladder-player-${i} {
                                    position: absolute;
                                    left: ${(i * 100) / (playerCount - 1)}%;
                                    transform: translateX(-50%);
                                }
                            `}</style>
                        </div>
                    ))}
                </div>

                {/* Reward Labels (Bottom) */}
                <div className="absolute -bottom-10 left-0 w-full flex justify-between items-start">
                    {rewards.map((r, i) => (
                        <div
                            key={`r-${i}`}
                            className={`flex flex-col-reverse items-center w-2 ladder-reward-${i}`}
                        >
                            <span className={`text-xs font-bold mt-1 whitespace-nowrap transition-all duration-500
                                ${(activePath !== null && results[activePath] === i && !isAnimating) || (showAllResult && Object.values(results).includes(i))
                                    ? 'text-red-600 scale-110'
                                    : 'text-gray-600'}`}>
                                {r.text}
                            </span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm border-2 transition-all duration-500
                                ${(activePath !== null && results[activePath] === i && !isAnimating) || (showAllResult && Object.values(results).includes(i))
                                    ? 'bg-red-500 border-red-500 text-white scale-125 shadow-lg animate-bounce'
                                    : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                                <Trophy className="w-4 h-4" />
                            </div>
                            <style jsx>{`
                                .ladder-reward-${i} {
                                    position: absolute;
                                    left: ${(i * 100) / (playerCount - 1)}%;
                                    transform: translateX(-50%);
                                }
                            `}</style>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderPath = (playerIdx: number, color: string) => {
        // Construct SVG path command (d attribute)
        const maxX = 1000;
        const maxY = 500;
        let currentCol = playerIdx;
        const totalLevels = 20;

        // Start point
        let d = `M ${(currentCol * maxX) / (playerCount - 1)} 0`;

        // Sort lines by level
        const sortedLines = [...ladderLines].sort((a, b) => a.level - b.level);

        sortedLines.forEach(line => {
            // Line vertical position
            const lineY = (line.level * maxY) / totalLevels;

            // Only draw vertical segment if there is a bridge at this level connected to current col
            if (line.colIndex === currentCol || line.colIndex === currentCol - 1) {
                // Vertical move to bridge level
                d += ` L ${(currentCol * maxX) / (playerCount - 1)} ${lineY}`;

                if (line.colIndex === currentCol) {
                    // Move Right
                    currentCol++;
                    d += ` L ${(currentCol * maxX) / (playerCount - 1)} ${lineY}`;
                } else if (line.colIndex === currentCol - 1) {
                    // Move Left
                    currentCol--;
                    d += ` L ${(currentCol * maxX) / (playerCount - 1)} ${lineY}`;
                }
            }
        });

        // Final vertical segment to bottom
        d += ` L ${(currentCol * maxX) / (playerCount - 1)} ${maxY}`;

        return (
            <motion.path
                key={`path-${playerIdx}`}
                d={d}
                fill="none"
                stroke={activePath === playerIdx ? '#ea580c' : color} // Orange-600
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, ease: "linear" }}
                vectorEffect="non-scaling-stroke"
            />
        );
    };

    const getColor = (idx: number) => {
        const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'];
        return colors[idx % colors.length];
    };

    return (
        <div className="min-h-screen bg-orange-50/50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-4">
                    <Link href="/utils/minigames">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 -ml-2">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            미니게임 돌아가기
                        </Button>
                    </Link>
                </div>

                <Card className="p-6 md:p-8 shadow-xl bg-white border-none">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
                            <Shuffle className="text-orange-500" />
                            커피 내기 사다리
                        </h1>
                        <p className="text-gray-500 mt-2">누가 커피를 사게 될까요? 운명을 시험해보세요!</p>
                    </div>

                    {stage === 'setup' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            {/* 1. Count Settings */}
                            <div className="flex justify-center items-center gap-4 bg-gray-50 p-4 rounded-xl">
                                <span className="font-semibold text-gray-700">참가 인원</span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline" size="icon"
                                        onClick={() => setPlayerCount(Math.max(2, playerCount - 1))}
                                        disabled={playerCount <= 2}
                                    >-</Button>
                                    <span className="w-8 text-center font-bold text-xl">{playerCount}</span>
                                    <Button
                                        variant="outline" size="icon"
                                        onClick={() => setPlayerCount(Math.min(10, playerCount + 1))}
                                        disabled={playerCount >= 10}
                                    >+</Button>
                                </div>
                            </div>

                            {/* 2. Names & Rewards */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-center text-gray-700 flex items-center justify-center gap-2">
                                        <User className="w-4 h-4" /> 참가자 이름
                                    </h3>
                                    {players.map((p) => (
                                        <Input
                                            key={p.id}
                                            value={p.name}
                                            onChange={(e) => handlePlayerNameChange(p.id, e.target.value)}
                                            className="text-center"
                                            placeholder={`참가자 ${p.id + 1}`}
                                        />
                                    ))}
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-center text-gray-700 flex items-center justify-center gap-2">
                                        <Trophy className="w-4 h-4" /> 내기 항목
                                    </h3>
                                    {rewards.map((r) => (
                                        <Input
                                            key={r.id}
                                            value={r.text}
                                            onChange={(e) => handleRewardTextChange(r.id, e.target.value)}
                                            className={`text-center ${r.text.includes('커피') || r.text.includes('쏘기') ? 'text-red-500 font-bold bg-red-50 border-red-200' : ''}`}
                                            placeholder={r.text}
                                        />
                                    ))}
                                </div>
                            </div>

                            <Button onClick={generateLadder} className="w-full h-12 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg mt-4">
                                사다리 타기 시작!
                            </Button>
                        </div>
                    )}

                    {stage === 'playing' && (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            {/* Ladder Canvas */}
                            <div className="mb-4">
                                {renderLadder()}
                            </div>

                            <div className="mt-16 flex flex-col items-center gap-4">
                                {activePath === null && !showAllResult ? (
                                    <p className="text-lg font-bold text-indigo-600 animate-pulse">
                                        {isAnimating ? '운명의 사다리를 타는 중...' : '참가자의 이름을 클릭하여 결과를 확인하세요!'}
                                    </p>
                                ) : (
                                    <div className="h-8"></div> // Spacer
                                )}

                                <div className="flex gap-4 w-full max-w-md">
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-2"
                                        onClick={resetGame}
                                    >
                                        <RefreshCw className="mr-2 h-4 w-4" /> 다시 설정
                                    </Button>
                                    <Button
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                                        onClick={() => setShowAllResult(true)}
                                    >
                                        전체 결과 보기
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
