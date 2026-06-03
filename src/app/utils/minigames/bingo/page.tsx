'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, Trophy, Users, CheckCircle2, MessageSquare, Share2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types & Content ---
interface BingoCell {
    id: number;
    text: string;
    checked: boolean;
}

const OFFICE_KEYWORDS = [
    "월요일 출근이 설렌 적 있다",
    "점심 메뉴 고르기가 제일 힘들다",
    "퇴근 10분 전 회의 소집 당해봤다",
    "회사 밖에서 직장 동료 마주침",
    "탕후루/마라탕을 팀비로 먹어봤다",
    "사무실 에어컨/히터 온도 전쟁 참여",
    "연말 정산 환급금으로 보너스 기분냄",
    "이어폰 끼고 일하는 게 더 집중됨",
    "모니터 앞에 거울/피규어 있다",
    "법카로 내 돈 내고 못 살 거 먹어봄",
    "회의 중 졸음을 참느라 허벅지 찌름",
    "메신저 오타 내서 아찔했던 적 있음",
    "커피 없이는 업무 시작 불가능",
    "주말에도 업무 카톡 온 적 있다",
    "슬리퍼/백팩이 내 문신이다",
    "사무실 간식 창고 위치 마스터",
    "퇴근 인사하고 1분 뒤에 생각난 업무",
    "면접 때 했던 패기 넘치는 답변 기억함",
    "재택근무의 소중함을 알고 있다",
    "내 책상 위에 영양제가 3개 이상",
    "회의 중에 '그거 아시죠?'라고 해봄",
    "엑셀/PPT 단축키 장인이다",
    "법인카드 긁을 때 손 떨려본 적 있음",
    "팀장님/부장님 개그에 영혼 없이 웃음",
    "탕비실에서 우연히 비밀 얘기 들음",
    "출근 길에 '오늘 뭐 먹지' 생각함",
    "내 연차 사유는 '개인 사정' 고정이다",
    "듀얼 모니터 아니면 일 못하겠다",
    "점심시간 10분 전부터 메뉴판 봄",
    "월급 들어오자마자 통장 스쳐 지나감"
];

export default function OfficeBingoPage() {
    const [grid, setGrid] = useState<BingoCell[]>([]);
    const [bingoCount, setBingoCount] = useState(0);
    const [isWinner, setIsWinner] = useState(false);
    const [teamName, setTeamName] = useState('우리 팀');

    // --- Game Logic ---

    const initGame = useCallback(() => {
        const shuffled = [...OFFICE_KEYWORDS]
            .sort(() => Math.random() - 0.5)
            .slice(0, 25)
            .map((text, index) => ({
                id: index,
                text,
                checked: false
            }));
        setGrid(shuffled);
        setBingoCount(0);
        setIsWinner(false);
    }, []);

    useEffect(() => {
        initGame();
    }, [initGame]);

    const toggleCell = (id: number) => {
        if (isWinner) return;

        const newGrid = [...grid];
        newGrid[id].checked = !newGrid[id].checked;
        setGrid(newGrid);
        checkBingo(newGrid);
    };

    const checkBingo = (currentGrid: BingoCell[]) => {
        let lines = 0;

        // Rows
        for (let r = 0; r < 5; r++) {
            if (currentGrid.slice(r * 5, r * 5 + 5).every(c => c.checked)) lines++;
        }

        // Columns
        for (let c = 0; c < 5; c++) {
            if ([0, 1, 2, 3, 4].every(r => currentGrid[r * 5 + c].checked)) lines++;
        }

        // Diagonals
        if ([0, 6, 12, 18, 24].every(i => currentGrid[i].checked)) lines++;
        if ([4, 8, 12, 16, 20].every(i => currentGrid[i].checked)) lines++;

        setBingoCount(lines);
        if (lines >= 3) setIsWinner(true);
    };

    return (
        <div className="min-h-screen bg-emerald-50/50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-4">
                    <Link href="/utils/minigames">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 -ml-2">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            미니게임 돌아가기
                        </Button>
                    </Link>
                </div>

                <div className="text-center mb-10 space-y-4">
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 px-4 py-1 rounded-full font-bold">
                        Office Sympathy Bingo
                    </Badge>
                    <h1 className="font-black text-slate-900 tracking-tighter text-4xl">팀별 대항 공감 빙고</h1>
                    <p className="text-slate-500 font-medium">우리 팀은 얼마나 많은 오피스 빌런... 아니, 에피소드를 가지고 있을까요?</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Side: Score & Status */}
                    <div className="space-y-6">
                        <Card className="p-6 bg-white border-none shadow-xl rounded-[32px] overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 blur-[50px] pointer-events-none"></div>

                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-3 text-emerald-600 mb-2">
                                    <Trophy className="w-5 h-5" />
                                    <span className="text-xs font-black uppercase tracking-widest">Bingo Status</span>
                                </div>

                                <div className="font-black text-slate-900 tabular-nums text-xl">
                                    {bingoCount} <span className="text-slate-400 text-xl">Lines</span>
                                </div>

                                <div className="space-y-1">
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((bingoCount / 3) * 100, 100)}%` }}
                                            className="h-full bg-emerald-500"
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 text-right uppercase tracking-tighter">
                                        Goal: 3 Lines to Win
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-slate-900 text-white border-none shadow-xl rounded-[32px]">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-5 h-5 text-emerald-400" />
                                    <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Team Info</span>
                                </div>
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    className="bg-transparent border-b border-white/20 w-full font-black focus:outline-none focus:border-emerald-400 transition-colors text-xl"
                                    placeholder="팀 이름을 입력하세요"
                                />
                                <p className="text-xs text-white/40 leading-relaxed italic">
                                    "팀원들과 함께 화면을 보며 클릭하세요. 소통하며 회복하는 것이 이 게임의 진짜 목적입니다."
                                </p>
                            </div>
                        </Card>

                        <Button
                            variant="outline"
                            onClick={initGame}
                            className="w-full h-14 rounded-2xl border-slate-200 font-bold hover:bg-slate-50 transition-all"
                        >
                            <RefreshCw className="mr-2 w-4 h-4" /> 새로운 빙고판 생성
                        </Button>
                    </div>

                    {/* Right Side: Bingo Grid */}
                    <div className="lg:col-span-2">
                        <Card className="p-4 bg-emerald-100/50 border-none shadow-2xl rounded-[40px] relative overflow-hidden">
                            <div className="grid grid-cols-5 gap-2 md:gap-3 aspect-square w-full relative z-10">
                                {grid.map((cell) => (
                                    <BingoCellComponent
                                        key={cell.id}
                                        cell={cell}
                                        isWinner={isWinner}
                                        onClick={() => toggleCell(cell.id)}
                                    />
                                ))}
                            </div>

                            <AnimatePresence>
                                {isWinner && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute inset-0 z-20 bg-emerald-900/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 m-4 rounded-[36px]"
                                    >
                                        <Sparkles className="w-20 h-20 text-yellow-400 mb-6 animate-pulse" />
                                        <h2 className="font-black text-white mb-2 tracking-tighter text-4xl">BINGO! 🎉</h2>
                                        <p className="text-emerald-100 font-medium mb-10 max-w-xs">
                                            {teamName}의 단합력이 증명되었습니다. 모든 팀원들에게 커피 한 잔의 휴식을 선물하세요!
                                        </p>
                                        <div className="flex gap-4 w-full">
                                            <Button
                                                className="flex-1 h-14 rounded-2xl bg-white text-emerald-900 font-black shadow-xl"
                                                onClick={() => { }}
                                            >
                                                <Share2 className="mr-2 w-4 h-4" /> 결과 공유
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 h-14 rounded-2xl border-white/20 text-white hover:bg-white/10 font-bold"
                                                onClick={initGame}
                                            >
                                                다시 하기
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </div>
                </div>

                {/* Footer Guide */}
                <div className="mt-16 bg-white/50 p-8 rounded-[32px] border border-emerald-100 text-center">
                    <h3 className="text-emerald-900 font-bold mb-4 flex items-center justify-center gap-2">
                        <MessageSquare className="w-4 h-4" /> 어떻게 진행하나요?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="space-y-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto font-black text-xs">1</div>
                            <p className="text-slate-600 font-medium">동료들과 모여 빙고판의 각 항목을 하나씩 읽어보세요.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto font-black text-xs">2</div>
                            <p className="text-slate-600 font-medium">팀원 중 한 명이라도 해당되는 내용이 있다면 셀을 클릭!</p>
                        </div>
                        <div className="space-y-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto font-black text-xs">3</div>
                            <p className="text-slate-600 font-medium">3줄 이상의 빙고가 완성되면 승리입니다. 회식 메뉴를 정해보세요!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BingoCellComponent({ cell, onClick, isWinner }: { cell: BingoCell, onClick: () => void, isWinner: boolean }) {
    return (
        <motion.div
            whileHover={!cell.checked && !isWinner ? { scale: 1.02, y: -2 } : {}}
            whileTap={!cell.checked && !isWinner ? { scale: 0.95 } : {}}
            onClick={onClick}
            className={`
                relative aspect-square rounded-xl md:rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all duration-300 cursor-pointer overflow-hidden border-2
                ${cell.checked
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200 z-10'
                    : 'bg-white border-transparent text-slate-600 hover:border-emerald-200'
                }
            `}
        >
            <span className={`text-[8px] md:text-[11px] leading-tight font-black tracking-tighter transition-all duration-500 ${cell.checked ? 'scale-110' : ''}`}>
                {cell.text}
            </span>

            <AnimatePresence>
                {cell.checked && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute bottom-1 right-1"
                    >
                        <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-emerald-200" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Inactive overlay effect when checked */}
            {cell.checked && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"
                />
            )}
        </motion.div>
    );
}
