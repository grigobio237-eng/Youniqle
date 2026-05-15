'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Activity, Zap, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function RecoveryActivityFeed() {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const res = await fetch('/api/community/activity');
                if (res.ok) {
                    const data = await res.json();
                    setActivities(data.activities || []);
                }
            } catch (err) {
                console.error('Failed to fetch activity feed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
        const interval = setInterval(fetchActivities, 30000); // 30초마다 업데이트
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="p-10 text-center text-slate-400 font-bold">활동 피드 로딩 중...</div>;

    return (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence initial={false}>
                {activities.map((act, idx) => (
                    <motion.div
                        key={act.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4 rounded-[24px] bg-slate-50/50 border border-slate-100 flex items-start gap-4 hover:bg-white hover:shadow-md transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                            <span className="text-sm font-bold text-slate-400">{act.name[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-black text-obsidian">{act.name}</span>
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true, locale: ko })}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-slate tracking-tight mb-2 group-hover:text-obsidian transition-colors">
                                "{act.metaphor}"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase">
                                    <Activity className="w-2.5 h-2.5" />
                                    {act.totalScore} pts
                                </div>
                                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                                    <Heart className="w-2.5 h-2.5 text-rose-400" />
                                    응원하기
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
