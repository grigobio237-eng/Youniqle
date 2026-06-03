'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, Trophy, Briefcase, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types & Config ---
type Tile = {
    id: number;
    value: number;
    isNew: boolean;
    isMerged: boolean;
    position: [number, number];
};

const POSITIONS = {
    2: { title: '인턴', color: 'bg-slate-100 text-obsidian', emoji: '🐣' },
    4: { title: '사원', color: 'bg-primary-container text-primary', emoji: '🐥' },
    8: { title: '대리', color: 'bg-cyan-100 text-cyan-600', emoji: '👔' },
    16: { title: '과장', color: 'bg-secondary-container text-secondary', emoji: '💼' },
    32: { title: '차장', color: 'bg-primary-container/50 text-primary', emoji: '🖋️' },
    64: { title: '부장', color: 'bg-orange-100 text-orange-600', emoji: '📂' },
    128: { title: '상무', color: 'bg-rose-100 text-rose-600', emoji: '💎' },
    256: { title: '전무', color: 'bg-pink-100 text-pink-600', emoji: '💍' },
    512: { title: '부사장', color: 'bg-secondary-container text-secondary', emoji: '🏛️' },
    1024: { title: '사장', color: 'bg-secondary text-white', emoji: '👑' },
    2048: { title: '회장', color: 'bg-slate-900 text-reward-gold', emoji: '🌟' },
};

export default function Office2048Page() {
    const [tiles, setTiles] = useState<Tile[]>([]);
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [win, setWin] = useState(false);
    const [nextId, setNextId] = useState(1);

    // --- Core Logic ---

    const getEmptyPositions = useCallback((currentTiles: Tile[]) => {
        const occupied = new Set(currentTiles.map(t => `${t.position[0]}-${t.position[1]}`));
        const empty = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (!occupied.has(`${r}-${c}`)) empty.push([r, c]);
            }
        }
        return empty;
    }, []);

    const spawnTile = useCallback((currentTiles: Tile[], id: number) => {
        const empty = getEmptyPositions(currentTiles);
        if (empty.length === 0) return { newTiles: currentTiles, newId: id };

        const [r, c] = empty[Math.floor(Math.random() * empty.length)];
        const newVal = Math.random() < 0.9 ? 2 : 4;
        const newTile: Tile = { id, value: newVal, isNew: true, isMerged: false, position: [r, c] as [number, number] };

        return {
            newTiles: [...currentTiles, newTile],
            newId: id + 1
        };
    }, [getEmptyPositions]);

    const initGame = useCallback(() => {
        let { newTiles, newId } = spawnTile([], 1);
        const result = spawnTile(newTiles, newId);
        setTiles(result.newTiles.map(t => ({ ...t, isNew: false })));
        setNextId(result.newId);
        setScore(0);
        setGameOver(false);
        setWin(false);
    }, [spawnTile]);

    useEffect(() => {
        initGame();
        const savedBest = localStorage.getItem('youniqle_2048_best');
        if (savedBest) setBestScore(parseInt(savedBest));
    }, [initGame]);

    const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
        if (gameOver || win) return;

        let hasChanged = false;
        let currentScore = score;
        let newId = nextId;

        const grid: (Tile | null)[][] = Array.from({ length: 4 }, () => Array(4).fill(null));
        tiles.forEach(t => { grid[t.position[0]][t.position[1]] = { ...t, isMerged: false, isNew: false }; });

        const moveLogic = (items: (Tile | null)[]) => {
            const filtered = items.filter(t => t !== null) as Tile[];
            const result: (Tile | null)[] = [];

            for (let i = 0; i < filtered.length; i++) {
                if (i < filtered.length - 1 && filtered[i].value === filtered[i + 1].value) {
                    const mergedVal = filtered[i].value * 2;
                    result.push({ ...filtered[i], value: mergedVal, isMerged: true });
                    currentScore += mergedVal;
                    if (mergedVal === 2048) setWin(true);
                    i++;
                    hasChanged = true;
                } else {
                    result.push(filtered[i]);
                }
            }
            while (result.length < 4) result.push(null);
            return result;
        };

        const newGrid: (Tile | null)[][] = Array.from({ length: 4 }, () => Array(4).fill(null));

        if (direction === 'LEFT' || direction === 'RIGHT') {
            for (let r = 0; r < 4; r++) {
                let row = grid[r];
                if (direction === 'RIGHT') row = [...row].reverse();
                const processed = moveLogic(row);
                if (direction === 'RIGHT') processed.reverse();

                processed.forEach((t, c) => {
                    if (t) {
                        if (t.position[0] !== r || t.position[1] !== c) hasChanged = true;
                        newGrid[r][c] = { ...t, position: [r, c] };
                    }
                });
            }
        } else {
            for (let c = 0; c < 4; c++) {
                let col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
                if (direction === 'DOWN') col.reverse();
                const processed = moveLogic(col);
                if (direction === 'DOWN') processed.reverse();

                processed.forEach((t, r) => {
                    if (t) {
                        if (t.position[0] !== r || t.position[1] !== c) hasChanged = true;
                        newGrid[r][c] = { ...t, position: [r, c] };
                    }
                });
            }
        }

        if (hasChanged) {
            const newTilesList = newGrid.flat().filter(t => t !== null) as Tile[];
            const spawnResults = spawnTile(newTilesList, newId);
            setTiles(spawnResults.newTiles);
            setNextId(spawnResults.newId);
            setScore(currentScore);
            if (currentScore > bestScore) {
                setBestScore(currentScore);
                localStorage.setItem('youniqle_2048_best', currentScore.toString());
            }

            // Check Game Over
            const nextEmpty = getEmptyPositions(spawnResults.newTiles);
            if (nextEmpty.length === 0) {
                // Check if any merges possible
                let possible = false;
                const finalGrid = Array.from({ length: 4 }, () => Array(4).fill(0));
                spawnResults.newTiles.forEach(t => { finalGrid[t.position[0]][t.position[1]] = t.value; });

                for (let r = 0; r < 4; r++) {
                    for (let c = 0; c < 4; c++) {
                        if (r < 3 && finalGrid[r][c] === finalGrid[r + 1][c]) possible = true;
                        if (c < 3 && finalGrid[r][c] === finalGrid[r][c + 1]) possible = true;
                    }
                }
                if (!possible) setGameOver(true);
            }
        }
    }, [tiles, score, bestScore, gameOver, win, nextId, spawnTile, getEmptyPositions]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['ArrowUp', 'w', 'W'].includes(e.key)) move('UP');
            if (['ArrowDown', 's', 'S'].includes(e.key)) move('DOWN');
            if (['ArrowLeft', 'a', 'A'].includes(e.key)) move('LEFT');
            if (['ArrowRight', 'd', 'D'].includes(e.key)) move('RIGHT');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [move]);

    return (
        <div className="min-h-screen bg-sky-50/50 py-12 select-none">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="mb-4">
                    <Link href="/utils/minigames">
                        <Button variant="ghost" size="sm" className="text-foreground/70 hover:text-obsidian -ml-2">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            미니게임 돌아가기
                        </Button>
                    </Link>
                </div>

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="font-black text-obsidian tracking-tighter mb-2 text-4xl">2048 OFFICE</h1>
                        <p className="text-foreground/70 font-medium">인턴에서 회장까지, 승진의 기쁨을 누리세요!</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl flex flex-col items-center min-w-[80px]">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Score</span>
                            <span className="font-black text-xl">{score}</span>
                        </div>
                        <div className="bg-reward-gold text-white px-4 py-2 rounded-2xl flex flex-col items-center min-w-[80px]">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Best</span>
                            <span className="font-black text-xl">{bestScore}</span>
                        </div>
                    </div>
                </div>

                <Card className="p-4 bg-slate-200/50 rounded-[32px] border-none shadow-inner relative overflow-hidden">
                    {/* Game Grid Overlay */}
                    <div className="grid grid-cols-4 grid-rows-4 gap-3 aspect-square w-full relative z-10">
                        {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className="bg-slate-300/30 rounded-2xl w-full h-full"></div>
                        ))}

                        <AnimatePresence>
                            {tiles.map((tile) => (
                                <TileComponent key={tile.id} tile={tile} />
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* End Game Overlays */}
                    <AnimatePresence>
                        {(gameOver || win) && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 z-20 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 m-4 rounded-[28px]"
                            >
                                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 text-4xl">
                                    {win ? '🎉' : '🏢'}
                                </div>
                                <h2 className="text-3xl font-black text-white mb-2">
                                    {win ? '회장님, 축하드립니다!' : '인사 정체 발생'}
                                </h2>
                                <p className="text-white/60 font-medium mb-10">
                                    {win ? '회사의 모든 권력을 손에 넣으셨습니다.' : '더 이상 승진할 빈 자리가 없습니다.'}
                                </p>
                                <Button
                                    onClick={initGame}
                                    className="w-full h-16 text-lg font-black rounded-2xl bg-reward-gold text-white shadow-xl"
                                >
                                    처음부터 다시 시작
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>

                {/* Controls Info & Legend */}
                <div className="mt-12 space-y-8">
                    <div className="flex justify-center gap-4">
                        <div className="flex flex-col items-center gap-1 opacity-40">
                            <div className="grid grid-cols-3 grid-rows-2 gap-1">
                                <div className="col-start-2 border border-slate-900 rounded p-1"><ChevronUp className="w-4 h-4" /></div>
                                <div className="row-start-2 border border-slate-900 rounded p-1"><ChevronLeft className="w-4 h-4" /></div>
                                <div className="row-start-2 border border-slate-900 rounded p-1"><ChevronDown className="w-4 h-4" /></div>
                                <div className="row-start-2 border border-slate-900 rounded p-1"><ChevronRight className="w-4 h-4" /></div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-tighter">Keyboard to move</span>
                        </div>
                        <Button
                            variant="outline"
                            onClick={initGame}
                            className="rounded-2xl h-12 border-line text-foreground/70 font-bold px-6"
                        >
                            <RefreshCw className="mr-2 w-4 h-4" /> New Career
                        </Button>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] shadow-xl border border-line">
                        <h3 className="text-xs font-black text-foreground/70 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Promotion Legend
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {Object.entries(POSITIONS).map(([val, info]) => (
                                <div key={val} className={`p-2 rounded-xl border flex flex-col items-center text-center ${info.color.split(' ')[0]} border-transparent`}>
                                    <span className="mb-1 text-xl">{info.emoji}</span>
                                    <span className="text-[10px] font-black leading-none">{info.title}</span>
                                    <span className="text-[8px] font-black opacity-30 mt-1">{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TileComponent({ tile }: { tile: Tile }) {
    const config = POSITIONS[tile.value as keyof typeof POSITIONS] || { title: 'Unknown', color: 'bg-slate-400 text-white', emoji: '❓' };

    // Calculate percentage based positioning for 4x4 grid
    const top = `${tile.position[0] * 25}%`;
    const left = `${tile.position[1] * 25}%`;

    return (
        <motion.div
            layout
            initial={tile.isNew ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1, top, left }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute p-3 w-1/4 h-1/4 z-10"
        >
            <motion.div
                animate={tile.isMerged ? { scale: [1, 1.15, 1] } : {}}
                className={`w-full h-full rounded-2xl flex flex-col items-center justify-center p-2 shadow-lg ${config.color.split(' ')[0]} ${config.color.split(' ')[1]} transition-colors duration-500`}
            >
                <span className="text-2xl mb-0.5">{config.emoji}</span>
                <span className="text-[10px] font-black tracking-tighter leading-none text-center">{config.title}</span>
            </motion.div>
        </motion.div>
    );
}
