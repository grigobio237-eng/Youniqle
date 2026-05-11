'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Sparkles, Trophy, Loader2 } from 'lucide-react';
import { getKSTDate } from '@/lib/date';

interface Mission {
    id: string;
    title: string;
    desc: string;
    icon: string;
}

export default function DailySmallActions({ score = 50 }: { score?: number }) {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [completedIds, setCompletedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('오늘의 회복 미션');

    useEffect(() => {
        fetchDailyMissions();
    }, [score]);

    const fetchDailyMissions = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/ai/routine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timeSlot: 'DAILY',
                    userStatus: { score }
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.tasks) {
                    setMissions(data.tasks);
                    setTitle(data.title || '오늘의 회복 미션');
                    if (data.completedTasks) {
                        setCompletedIds(data.completedTasks);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch daily missions:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleMission = async (missionId: string) => {
        const isCompleted = !completedIds.includes(missionId);
        const next = isCompleted
            ? [...completedIds, missionId]
            : completedIds.filter(id => id !== missionId);
        
        setCompletedIds(next);

        try {
            await fetch('/api/ai/routine/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskId: missionId,
                    slot: 'DAILY',
                    isCompleted
                })
            });
        } catch (err) {
            console.error('Failed to persist mission completion:', err);
        }
    };

    const completedCount = completedIds.length;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs font-black text-slate/40 uppercase tracking-widest">AI가 오늘의 하루를 설계 중...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 py-4">
            <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-obsidian tracking-tight">{title}</h3>
                        <div className="px-2 py-0.5 rounded-full bg-reward-gold/10 text-reward-gold text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> +10P
                        </div>
                    </div>
                    <p className="text-xs font-medium text-slate/60">오늘 하루 꼭 실천해야 할 3가지 루틴</p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black text-primary italic">{completedCount}</span>
                    <span className="text-xs font-black text-slate/30 uppercase ml-1">/ {missions.length || 3}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {missions.map((mission, idx) => {
                    const isDone = completedIds.includes(mission.id);
                    return (
                        <motion.div
                            key={mission.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => toggleMission(mission.id)}
                            className={`
                                group relative flex items-center gap-4 p-5 rounded-[24px] border-2 transition-all cursor-pointer
                                ${isDone 
                                    ? 'bg-primary/5 border-primary/20 shadow-inner' 
                                    : 'bg-white border-line hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5'}
                            `}
                        >
                            <div className={`
                                w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform
                                ${isDone ? 'scale-90 opacity-50' : 'group-hover:scale-110'}
                                bg-mist/50
                            `}>
                                {mission.icon}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h4 className={`text-sm md:text-base font-bold transition-colors ${isDone ? 'text-slate/40 line-through' : 'text-obsidian'}`}>
                                    {mission.title}
                                </h4>
                                <p className="text-xs font-medium text-slate/40 line-clamp-1">{mission.desc}</p>
                            </div>

                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center transition-all
                                ${isDone ? 'bg-primary text-white scale-110' : 'bg-mist text-slate/20 group-hover:text-primary/40'}
                            `}>
                                {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                            </div>

                            {isDone && (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 bg-reward-gold text-white p-1 rounded-full shadow-lg"
                                >
                                    <Sparkles className="w-3 h-3" />
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {completedCount === missions.length && missions.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-obsidian text-white rounded-2xl text-center"
                >
                    <p className="text-sm font-black italic tracking-tight">
                        🎉 오늘의 회복 루틴을 모두 완료했습니다! 꾸준한 실천이 내일의 에너지를 만듭니다.
                    </p>
                </motion.div>
            )}
        </div>
    );
}
