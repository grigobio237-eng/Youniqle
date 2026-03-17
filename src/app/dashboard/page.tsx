'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Question } from '@/types/diagnosis';

const DashboardPreview = dynamic(() => import('@/components/home/DashboardPreview'), { ssr: false });
const ResultDisplay = dynamic(() => import('@/components/home/ResultDisplay'), { ssr: false });
const WebtoonChallengeDialog = dynamic(() => import('@/components/home/WebtoonChallengeDialog'), { ssr: false });

export default function DashboardPage() {
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [userNote, setUserNote] = useState('');
  const [showWebtoonDialog, setShowWebtoonDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedScore = localStorage.getItem('recovery_last_score');
    const storedAnswers = localStorage.getItem('recovery_last_answers');
    const storedNote = localStorage.getItem('recovery_last_note');

    if (storedScore) {
      setScore(parseInt(storedScore));
    }
    if (storedAnswers) {
      try {
        setAnswers(JSON.parse(storedAnswers));
      } catch (e) {
        console.error('Failed to parse answers:', e);
      }
    }
    if (storedNote) {
      setUserNote(storedNote);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-mist flex items-center justify-center">데이터를 불러오는 중...</div>;
  }

  // If no score, we could redirect to home/diagnose, 
  // but for now let's just show a prompt or a default preview
  if (!score) {
    return (
      <div className="min-h-screen bg-mist flex flex-col items-center justify-center p-6 text-center space-y-6">
        <h1 className="text-3xl font-bold text-obsidian">진단 데이터가 없습니다.</h1>
        <p className="text-slate/70">먼저 60초 회복 진단을 통해 당신의 상태를 확인해보세요.</p>
        <button 
          onClick={() => window.location.href = '/?action=diagnose'}
          className="px-8 py-4 bg-chapter-accent text-white rounded-full font-bold hover:scale-105 transition-transform"
        >
          진단 시작하기
        </button>
      </div>
    );
  }

  return (
    <>
      <DashboardPreview 
        score={score} 
        onOpenWebtoon={() => setShowWebtoonDialog(true)} 
      />
      <WebtoonChallengeDialog
        open={showWebtoonDialog}
        onOpenChange={setShowWebtoonDialog}
        recoveryData={{ score, answers, userNote }}
      />
    </>
  );
}
