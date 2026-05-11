'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Smile, Frown, Meh, Heart, Zap, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOODS = [
    { id: 'happy', emoji: '😊', label: '행복해요', color: 'text-yellow-500' },
    { id: 'calm', emoji: '😌', label: '평온해요', color: 'text-green-500' },
    { id: 'tired', emoji: '😴', label: '피곤해요', color: 'text-blue-500' },
    { id: 'stressed', emoji: '😫', label: '힘들어요', color: 'text-red-500' },
    { id: 'inspired', emoji: '✨', label: '활기차요', color: 'text-purple-500' },
];

export default function RecoveryNoteSection() {
    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState('happy');
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = async () => {
        if (!content.trim()) return;

        setIsSaving(true);
        try {
            const res = await fetch('/api/user/recovery-note', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    mood: selectedMood
                })
            });

            if (res.ok) {
                setIsSaved(true);
                setContent('');
                setTimeout(() => setIsSaved(false), 3000);
            }
        } catch (err) {
            console.error('Failed to save recovery note:', err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="container mx-auto px-6 pb-20 max-w-5xl">
            <Card className="bg-surface/60 backdrop-blur-2xl text-foreground rounded-5xl p-8 md:p-14 border border-white/20 shadow-2xl shadow-primary/5 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start justify-between">
                    
                    <div className="space-y-4 md:max-w-xs">
                        <h3 className="text-3xl font-bold tracking-tight">오늘의 마음 기록</h3>
                        <p className="text-foreground/40 text-lg font-medium leading-relaxed">
                            수치화된 진단보다 더 중요한 것은 당신의 진솔한 생각입니다. 지금 기분은 어떠신가요?
                        </p>
                        
                        <div className="flex flex-wrap gap-3 pt-4">
                            {MOODS.map((mood) => (
                                <button
                                    key={mood.id}
                                    onClick={() => setSelectedMood(mood.id)}
                                    className={`flex flex-col items-center p-3 rounded-2xl transition-all border ${
                                        selectedMood === mood.id 
                                        ? 'bg-white border-primary/20 shadow-lg scale-110' 
                                        : 'bg-white/30 border-transparent grayscale hover:grayscale-0'
                                    }`}
                                >
                                    <span className="text-2xl mb-1">{mood.emoji}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedMood === mood.id ? mood.color : 'text-foreground/30'}`}>
                                        {mood.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 w-full space-y-6">
                        <div className="relative">
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="지금 이 순간 떠오르는 생각이나 기분을 자유롭게 적어주세요..."
                                className="min-h-[180px] bg-white/40 border-white/20 rounded-[32px] p-8 text-lg font-medium placeholder:text-foreground/20 focus:bg-white/60 transition-all resize-none shadow-inner"
                            />
                            
                            <AnimatePresence>
                                {isSaved && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[32px] flex flex-col items-center justify-center text-center p-8 z-20"
                                    >
                                        <CheckCircle2 className="w-16 h-16 text-primary mb-4" />
                                        <h4 className="text-2xl font-bold text-obsidian">마음이 기록되었습니다</h4>
                                        <p className="text-slate-500 mt-2">사용자님의 소중한 회복 타임라인에 저장되었습니다.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !content.trim()}
                                className="h-16 px-10 bg-primary text-white rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20 flex items-center gap-3"
                            >
                                {isSaving ? "기록 중..." : "마음 남기기"}
                                <Send className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[80px] -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary-container/10 blur-[80px] -ml-20 -mb-20 pointer-events-none" />
            </Card>
        </section>
    );
}
