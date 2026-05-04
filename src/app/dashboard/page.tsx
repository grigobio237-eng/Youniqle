'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Question } from '@/types/diagnosis';
import { Sparkles, ArrowRight } from 'lucide-react';

const DashboardPreview = dynamic(() => import('@/components/home/DashboardPreview'), { ssr: false });
const ResultDisplay = dynamic(() => import('@/components/home/ResultDisplay'), { ssr: false });
const WebtoonChallengeDialog = dynamic(() => import('@/components/home/WebtoonChallengeDialog'), { ssr: false });
import LifeSnapFeed from '@/components/dashboard/LifeSnapFeed';
import WeeklyReportView from '@/components/dashboard/WeeklyReportView';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [showWebtoonDialog, setShowWebtoonDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const fetchedRef = React.useRef(false);

  const fetchDashboardData = async (isRefresh = false) => {
    if (!isRefresh && fetchedRef.current) return;
    fetchedRef.current = true;

    try {
      if (isRefresh) setLoading(false); // Don't show full loading screen on refresh
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
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const [activeTab, setActiveTab] = useState<'home' | 'snap' | 'report'>('home');

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
    const localScore = typeof window !== 'undefined' ? localStorage.getItem('recovery_last_score') : null;

    if (localScore) {
      return (
        <div className="min-h-screen bg-mist flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-bold text-obsidian">회복 데이터를 동기화하는 중입니다...</h2>
          <p className="text-sm text-slate">최근 수행하신 {localScore}점의 진단 결과를 불러오고 있습니다.</p>
          <Button variant="ghost" onClick={() => window.location.reload()}>다시 시도</Button>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-chapter-accent/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-lg w-full">
          <div className="w-24 h-24 bg-white rounded-[32px] shadow-2xl flex items-center justify-center mx-auto mb-8 transform -rotate-6 hover:rotate-0 transition-transform duration-500 border border-white/50 backdrop-blur-xl">
            <Sparkles className="w-12 h-12 text-reward-gold" />
          </div>
          
          <h1 className="text-4xl font-black text-obsidian tracking-tight mb-4 leading-tight">
            나만의 회복 여정을<br />시작할 시간입니다
          </h1>
          
          <p className="text-slate font-medium text-lg mb-10 leading-relaxed">
            오늘의 컨디션을 체크하고 맞춤 솔루션을 받아보세요.<br />
            첫 진단 완료 시 <span className="text-primary font-bold">100 PT</span>를 즉시 적립해 드립니다.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => {
                localStorage.removeItem('recovery_last_score');
                window.location.href = '/diagnosis?type=daily';
              }}
              className="w-full py-6 bg-obsidian text-white rounded-[28px] font-black text-xl tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center justify-center gap-3 group"
            >
              1일 회복 진단 시작하기
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="flex items-center justify-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate/60 uppercase tracking-widest">
                <div className="w-1 h-1 bg-primary rounded-full" />
                AI Analysis
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate/60 uppercase tracking-widest">
                <div className="w-1 h-1 bg-primary rounded-full" />
                Custom Protocol
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate/60 uppercase tracking-widest">
                <div className="w-1 h-1 bg-primary rounded-full" />
                Daily Rewards
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist flex flex-col pb-24">
      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-mist/80 backdrop-blur-md pt-4 pb-2 px-4 border-b border-line/50">
        <div className="flex bg-white/50 p-1 rounded-2xl border border-white">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 py-3 text-xs font-black tracking-widest uppercase transition-all rounded-xl ${activeTab === 'home' ? 'bg-obsidian text-white shadow-md' : 'text-slate/60 hover:bg-white/80'
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('snap')}
            className={`flex-1 py-3 text-xs font-black tracking-widest uppercase transition-all rounded-xl ${activeTab === 'snap' ? 'bg-obsidian text-white shadow-md' : 'text-slate/60 hover:bg-white/80'
              }`}
          >
            Life Snap
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 py-3 text-xs font-black tracking-widest uppercase transition-all rounded-xl ${activeTab === 'report' ? 'bg-obsidian text-white shadow-md' : 'text-slate/60 hover:bg-white/80'
              }`}
          >
            Report
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 w-full px-4 pt-6">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <DashboardPreview
              unifiedData={data}
              onOpenWebtoon={() => setShowWebtoonDialog(true)}
              onRefresh={() => fetchDashboardData(true)}
            />
            <WebtoonChallengeDialog
              open={showWebtoonDialog}
              onOpenChange={setShowWebtoonDialog}
              recoveryData={{
                score: data.score?.totalScore,
                recentActivity: data.recentActivity
              }}
            />
          </div>
        )}

        {activeTab === 'snap' && (
          <LifeSnapFeed />
        )}

        {activeTab === 'report' && (
          <WeeklyReportView />
        )}
      </div>
    </div>
  );
}
