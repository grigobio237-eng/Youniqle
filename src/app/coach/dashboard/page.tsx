'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import CoachDecisionCard from '@/components/coach/CoachDecisionCard';
import AiNudgeBanner, { AiNudge } from '@/components/dashboard/AiNudgeBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Send, UserPlus } from 'lucide-react';

// 임시 목업 데이터
const mockPlayers = [
  { id: 'p1', name: '김민수', status: 'RED' as const, fatigueLevel: 9, reason: '우측 무릎 통증 심화' },
  { id: 'p2', name: '이태양', status: 'RED' as const, fatigueLevel: 8, reason: '수면 4시간 미만 (이틀 연속)' },
  { id: 'p3', name: '박지훈', status: 'YELLOW' as const, fatigueLevel: 6, reason: '훈련 부하(ACWR) 1.5 초과' },
  { id: 'p4', name: '최동현', status: 'GREEN' as const, fatigueLevel: 3, reason: '' },
  { id: 'p5', name: '정우성', status: 'GREEN' as const, fatigueLevel: 4, reason: '' },
  { id: 'p6', name: '강동원', status: 'GREEN' as const, fatigueLevel: 2, reason: '' },
];

export default function CoachDashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState(mockPlayers);
  const [nudges, setNudges] = useState<AiNudge[]>([]);

  // 시뮬레이션을 위해 잠시 로딩 및 넛지 데이터 페칭
  useEffect(() => {
    const fetchNudges = async () => {
      try {
        const res = await fetch('/api/football/nudges?role=coach');
        const json = await res.json();
        if (json.success) {
          setNudges(json.data);
        }
      } catch (e) {
        console.error('Failed to fetch nudges');
      }
    };

    fetchNudges();
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleUpdateStatus = async (playerId: string, playerName: string) => {
    // 코치-부모 자동 커뮤니케이션 훅 트리거 테스트
    try {
      const response = await fetch('/api/football/coach/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerId,
          trainingLoad: 8,
          coachComment: '오늘 고강도 훈련을 소화했습니다. 내일은 가벼운 회복 훈련이 예정되어 있습니다.'
        })
      });

      if (response.ok) {
        toast.success(`${playerName} 선수의 상태가 업데이트 되었습니다.`, {
          description: "해당 선수의 보호자에게 자동으로 알림이 전송되었습니다."
        });
      } else {
        toast.error('업데이트에 실패했습니다.');
      }
    } catch (error) {
      toast.error('오류가 발생했습니다.');
    }
  };

  const dismissNudge = (id: string) => {
    setNudges(prev => prev.filter(n => n.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-obsidian/20 border-t-obsidian rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-32">
      {/* Header */}
      <section className="pt-32 pb-10 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="space-y-2">
            <h1 className="font-serif text-obsidian tracking-tight text-4xl">Coach Dashboard</h1>
            <p className="text-slate/60 font-medium">유니클 FC 팀원들의 실시간 회복 및 훈련 준비 상태입니다.</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 space-y-8 container mx-auto max-w-5xl">
        {/* 상단 통합 AI 알림 영역 */}
        <div className="space-y-3">
          {nudges.map(nudge => (
            <AiNudgeBanner key={nudge.id} nudge={nudge} onDismiss={dismissNudge} />
          ))}
        </div>

        {/* 10초 작전판 */}
        <CoachDecisionCard 
          teamName="유니클 FC U-18"
          players={players} 
        />

        {/* 상세 관리 및 상태 업데이트 시뮬레이션 */}
        <div className="space-y-4 pt-8">
          <h3 className="font-serif text-obsidian tracking-tight flex items-center gap-2 text-xl">
            선수별 빠른 상태 업데이트
          </h3>
          <p className="text-xs text-slate/50">코치님이 아래의 '상태 업데이트' 버튼을 누르면 부모님께 자동으로 넛지 알림이 전송됩니다.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.filter(p => p.status !== 'GREEN').map(player => (
              <Card key={player.id} className="bg-white border border-line/10 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-obsidian text-lg">{player.name}</div>
                    <div className={`w-2 h-2 rounded-full ${player.status === 'RED' ? 'bg-rose-500' : 'bg-amber-500'} animate-pulse`} />
                  </div>
                  <div className="bg-mist/30 p-3 rounded-xl border border-line/5 text-xs font-bold text-slate/60">
                    "{player.reason}"
                  </div>
                  <Button 
                    onClick={() => handleUpdateStatus(player.id, player.name)}
                    className="w-full bg-obsidian text-white rounded-xl h-10 font-bold text-xs gap-2"
                  >
                    상태 업데이트 및 알림 전송 <Send className="w-3 h-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
