'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HabitAlertBannerProps {
  insight: {
    title: string;
    description: string;
    habits: string[];
  } | null;
}

export default function HabitAlertBanner({ insight }: HabitAlertBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!insight) return;

    // Check if shown today
    const today = new Date().toISOString().split('T')[0];
    const lastShown = localStorage.getItem('youniqle_habit_alert_date');

    if (lastShown !== today) {
      // First time today
      const timer = setTimeout(() => setIsVisible(true), 1500); // Delay for better impact
      return () => clearTimeout(timer);
    }
  }, [insight]);

  const handleClose = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('youniqle_habit_alert_date', today);
    setIsVisible(false);
  };

  if (!insight || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-20 left-4 right-4 z-[100] max-w-xl mx-auto"
      >
        <div className="bg-obsidian text-mist p-6 rounded-[32px] shadow-2xl border border-reward-gold/20 relative overflow-hidden group">
          {/* Decorative bits */}
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-reward-gold/10 rounded-full blur-2xl group-hover:bg-reward-gold/20 transition-colors" />
          
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 bg-reward-gold/20 rounded-2xl flex items-center justify-center flex-shrink-0 animate-bounce-slow">
              <Bell className="w-6 h-6 text-reward-gold" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-reward-gold">Today's Habit Protocol</span>
                <button onClick={handleClose} aria-label="닫기" className="text-mist/40 hover:text-mist transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="text-xl font-black tracking-tight">{insight.title}</h3>
              <p className="text-sm text-mist/60 font-medium leading-relaxed">
                {insight.habits?.[0] || '오늘의 의식적인 습관 교정을 시작해보세요.'}
              </p>
              
              <div className="pt-2 flex items-center gap-3">
                <Button 
                  size="sm" 
                  onClick={handleClose}
                  className="bg-reward-gold text-obsidian font-black rounded-xl text-[10px] h-8 px-4"
                >
                  기억할게요 <ArrowRight className="ml-1 w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
