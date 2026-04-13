'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Question } from '@/types/diagnosis';

const DashboardPreview = dynamic(() => import('@/components/home/DashboardPreview'), { ssr: false });
const ResultDisplay = dynamic(() => import('@/components/home/ResultDisplay'), { ssr: false });
const WebtoonChallengeDialog = dynamic(() => import('@/components/home/WebtoonChallengeDialog'), { ssr: false });

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [showWebtoonDialog, setShowWebtoonDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/user/status');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-mist flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-chapter-accent/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-chapter-accent border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-obsidian font-bold tracking-widest uppercase text-xs">Syncing Recovery Data...</p>
      </div>
    );
  }

  // If no data (no diagnosis), show prompt
  if (!data || (!data.score?.diagnosisScore && !data.score?.scanScore)) {
    return (
      <div className="min-h-screen bg-mist flex flex-col items-center justify-center p-6 text-center space-y-6">
        <h1 className="text-3xl font-bold text-obsidian tracking-tight">회복 데이터가 아직 기록되지 않았습니다.</h1>
        <p className="text-slate/70 max-w-sm mx-auto">유니클의 정밀 진단 혹은 스캐너를 통해<br />첫 번째 회복 데이터를 생성해보세요.</p>
        <button 
          onClick={() => window.location.href = '/?action=diagnose'}
          className="px-10 py-5 bg-obsidian text-white rounded-[24px] font-black italic tracking-widest hover:scale-105 transition-transform shadow-2xl"
        >
          진단 시작하기
        </button>
      </div>
    );
  }

  return (
    <>
      <DashboardPreview 
        unifiedData={data} 
        onOpenWebtoon={() => setShowWebtoonDialog(true)} 
      />
      <WebtoonChallengeDialog
        open={showWebtoonDialog}
        onOpenChange={setShowWebtoonDialog}
        recoveryData={{ 
          score: data.score.totalScore, 
          recentActivity: data.recentActivity 
        }}
      />
    </>
  );
}
