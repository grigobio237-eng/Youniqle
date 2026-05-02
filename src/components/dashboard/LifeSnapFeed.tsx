'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, ChevronDown, Activity, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'ALL', label: '전체', emoji: '🌟' },
  { id: 'MEAL', label: '음식', emoji: '🍱' },
  { id: 'HYDRATION', label: '수분', emoji: '💧' },
  { id: 'SKIN', label: '피부', emoji: '✨' },
  { id: 'SLEEP', label: '수면', emoji: '🛏️' },
  { id: 'ACTIVITY', label: '활동', emoji: '🏃' },
  { id: 'ROUTINE', label: '루틴', emoji: '💊' },
  { id: 'BODY', label: '바디', emoji: '🤕' },
  { id: 'MEDICAL_DOC', label: '병원 서류', emoji: '📄' },
  { id: 'OTHER', label: '기타', emoji: '📸' },
];

export default function LifeSnapFeed() {
  const [snaps, setSnaps] = useState<any[]>([]);
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentEndDate, setCurrentEndDate] = useState<Date>(new Date());
  const [hasMore, setHasMore] = useState(true);

  const fetchSnaps = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      // If loading more, the new endDate is 7 days before the current endDate
      let fetchEndDate = currentEndDate;
      if (isLoadMore) {
        const newEndDate = new Date(currentEndDate);
        newEndDate.setDate(newEndDate.getDate() - 7);
        fetchEndDate = newEndDate;
        setCurrentEndDate(newEndDate);
      }

      const res = await fetch(`/api/dashboard/snaps?category=${category}&endDate=${fetchEndDate.toISOString()}`);
      if (res.ok) {
        const result = await res.json();
        if (result.data) {
          if (isLoadMore) {
            setSnaps(prev => [...prev, ...result.data]);
            if (result.data.length === 0) {
                setHasMore(false); // No more data found in that 7 day period
            }
          } else {
            setSnaps(result.data);
            setCurrentEndDate(new Date()); // reset to now
            setHasMore(true);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch snaps', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Re-fetch when category changes
  useEffect(() => {
    setCurrentEndDate(new Date());
    fetchSnaps(false);
  }, [category]);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getMonth() + 1}월 ${d.getDate()}일 ${d.getHours()}시 ${d.getMinutes()}분`;
  };

  const getCategoryEmoji = (catId: string) => CATEGORIES.find(c => c.id === catId)?.emoji || '📸';
  const getCategoryLabel = (catId: string) => CATEGORIES.find(c => c.id === catId)?.label || '기타';

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Category Filter - Horizontal Scroll for Mobile */}
      <div className="w-full overflow-x-auto custom-scrollbar pb-2">
        <div className="flex gap-2 px-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-black tracking-wider flex items-center gap-2 transition-all ${
                category === cat.id
                  ? 'bg-obsidian text-white shadow-md'
                  : 'bg-white text-slate/60 border border-line hover:border-obsidian/20'
              }`}
            >
              <span className="text-sm">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Area */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-chapter-accent" />
        </div>
      ) : snaps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white rounded-[32px] border border-line">
          <div className="w-16 h-16 bg-mist rounded-full flex items-center justify-center text-3xl">📭</div>
          <p className="text-slate/60 font-bold text-sm">최근 7일간 기록된 스냅이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {snaps.map((snap) => (
              <motion.div
                key={snap._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] border border-line overflow-hidden shadow-sm"
              >
                {/* Image Section */}
                <div className="relative w-full aspect-square bg-mist">
                  {snap.imageUrl ? (
                    <img src={snap.imageUrl} alt="Snap" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">
                      {getCategoryEmoji(snap.category)}
                    </div>
                  )}
                  
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-white/90 backdrop-blur text-obsidian font-black uppercase tracking-widest text-[10px] border-none shadow-sm">
                      {getCategoryEmoji(snap.category)} {getCategoryLabel(snap.category)}
                    </Badge>
                  </div>
                  
                  {snap.score > 0 && (
                    <div className="absolute top-4 right-4 w-12 h-12 bg-chapter-accent text-white rounded-full flex items-center justify-center font-black shadow-lg">
                      {snap.score}
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white/90 text-xs font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(snap.createdAt)}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-4">
                  <div className="flex gap-3">
                    <div className="mt-1">
                      <Brain className="w-5 h-5 text-reward-gold" />
                    </div>
                    <p className="text-sm font-bold text-obsidian leading-relaxed italic">
                      "{snap.summary}"
                    </p>
                  </div>

                  {/* Metrics Table */}
                  {snap.metrics && Array.isArray(snap.metrics) && snap.metrics.length > 0 && (
                    <div className="pt-4 border-t border-line/50 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate/50 mb-3">
                        <Activity className="w-3 h-3 text-chapter-accent" /> Analysis Result
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {snap.metrics.map((metric: any, idx: number) => (
                          <div key={idx} className="p-3 bg-mist/50 rounded-2xl flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-slate/60 uppercase">{metric.label}</span>
                              <span className="text-[10px] font-bold text-chapter-accent bg-chapter-accent/10 px-2 py-0.5 rounded-full">{metric.value}</span>
                            </div>
                            {metric.benefit && (
                              <span className="text-[11px] font-bold text-obsidian">{metric.benefit}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Load More Button */}
          {hasMore && (
            <Button
              variant="outline"
              onClick={() => fetchSnaps(true)}
              disabled={loadingMore}
              className="w-full h-14 rounded-2xl border-2 border-line text-slate font-black tracking-widest hover:bg-mist transition-all flex justify-center items-center gap-2"
            >
              {loadingMore ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronDown className="w-5 h-5" />}
              이전 7일 기록 불러오기
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
