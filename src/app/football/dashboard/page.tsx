'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Users, Activity, AlertTriangle, CheckCircle2,
  ChevronRight, RefreshCw, ArrowLeft, Eye
} from 'lucide-react';
import Link from 'next/link';

interface SquadMember {
  memberId: string;
  userId: string;
  name: string;
  avatar?: string;
  position?: string;
  playerNumber?: number;
  todayCheck: {
    wellnessScore: number;
    sleep: number;
    soreness: number;
    fatigue: number;
    stress: number;
    mood: number;
    rpe?: number;
    sessionLoad?: number;
  } | null;
  checkedIn: boolean;
}

export default function CoachDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [squad, setSquad] = useState<SquadMember[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [teamInfo, setTeamInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<SquadMember | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      // 먼저 팀 정보 가져오기
      const teamRes = await fetch('/api/football/team');
      let teamId = '';
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        if (teamData.teams?.length > 0) {
          setTeamInfo(teamData.teams[0]);
          teamId = teamData.teams[0].team?._id;
        }
      }

      if (!teamId) {
        setLoading(false);
        return;
      }

      // 팀 웰니스 데이터
      const wellnessRes = await fetch(`/api/football/wellness?view=team&teamId=${teamId}`);
      if (wellnessRes.ok) {
        const data = await wellnessRes.json();
        setSquad(data.squad || []);
        setSummary(data.summary || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getTrafficLight = (score: number) => {
    if (score >= 4) return { color: 'bg-green-500', ring: 'ring-green-300', text: 'text-green-700', bg: 'bg-green-50', label: '양호' };
    if (score >= 3) return { color: 'bg-yellow-400', ring: 'ring-yellow-300', text: 'text-yellow-700', bg: 'bg-yellow-50', label: '주의' };
    return { color: 'bg-red-500', ring: 'ring-red-300', text: 'text-red-700', bg: 'bg-red-50', label: '경고' };
  };

  const getPositionLabel = (pos?: string) => {
    if (!pos) return '';
    const map: Record<string, string> = { MF: '미드필더', FW: '공격수', DF: '수비수', GK: '골키퍼' };
    return map[pos] || pos;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  // 그룹 분류: 경고 > 주의 > 양호 > 미체크
  const redPlayers = squad.filter(p => p.checkedIn && p.todayCheck && p.todayCheck.wellnessScore < 3);
  const yellowPlayers = squad.filter(p => p.checkedIn && p.todayCheck && p.todayCheck.wellnessScore >= 3 && p.todayCheck.wellnessScore < 4);
  const greenPlayers = squad.filter(p => p.checkedIn && p.todayCheck && p.todayCheck.wellnessScore >= 4);
  const unchecked = squad.filter(p => !p.checkedIn);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6 pt-4 md:pt-24">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/football/mypage" className="text-slate hover:text-obsidian">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Badge className="bg-green-100 text-green-700 border-none font-bold text-xs">COACH DASHBOARD</Badge>
            </div>
            <h1 className="text-2xl font-black text-obsidian">
              {teamInfo?.team?.teamName || '팀'} 스쿼드
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDashboard} className="gap-1 rounded-xl">
            <RefreshCw className="w-4 h-4" /> 새로고침
          </Button>
        </div>

        {/* 요약 카드 */}
        <Card className="rounded-2xl border-none shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-green-500 via-yellow-400 to-red-500" />
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-3xl font-black text-obsidian">{summary?.total || 0}</p>
                <p className="text-xs text-slate font-bold mt-1">전체 선수</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-3xl font-black text-green-600">{summary?.checkedIn || 0}</p>
                <p className="text-xs text-green-700 font-bold mt-1">체크 완료</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-3">
                <p className="text-3xl font-black text-yellow-600">{unchecked.length}</p>
                <p className="text-xs text-yellow-700 font-bold mt-1">미체크</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-3xl font-black text-blue-600">{summary?.avgWellness || '-'}</p>
                <p className="text-xs text-blue-700 font-bold mt-1">평균 점수</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 경고 선수 */}
        {redPlayers.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-red-600 uppercase flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> 🔴 경고 ({redPlayers.length})
            </h3>
            {redPlayers.map((player) => (
              <PlayerCard key={player.memberId} player={player} onSelect={setSelectedPlayer} />
            ))}
          </div>
        )}

        {/* 주의 선수 */}
        {yellowPlayers.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-yellow-600 uppercase flex items-center gap-1">
              🟡 주의 ({yellowPlayers.length})
            </h3>
            {yellowPlayers.map((player) => (
              <PlayerCard key={player.memberId} player={player} onSelect={setSelectedPlayer} />
            ))}
          </div>
        )}

        {/* 양호 선수 */}
        {greenPlayers.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-green-600 uppercase flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> 🟢 양호 ({greenPlayers.length})
            </h3>
            {greenPlayers.map((player) => (
              <PlayerCard key={player.memberId} player={player} onSelect={setSelectedPlayer} />
            ))}
          </div>
        )}

        {/* 미체크 선수 */}
        {unchecked.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-gray-400 uppercase flex items-center gap-1">
              ⬜ 미체크 ({unchecked.length})
            </h3>
            {unchecked.map((player) => (
              <Card key={player.memberId} className="rounded-2xl border-none shadow-md opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 font-bold text-sm">
                      {player.playerNumber || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-obsidian">{player.name}</p>
                      <p className="text-xs text-slate">{getPositionLabel(player.position)}</p>
                    </div>
                    <Badge className="bg-gray-100 text-gray-500 border-none text-xs">미제출</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {squad.length === 0 && (
          <Card className="rounded-2xl border-none shadow-xl">
            <CardContent className="p-10 text-center space-y-4">
              <Users className="w-12 h-12 mx-auto text-gray-300" />
              <h3 className="text-lg font-bold text-obsidian">아직 선수가 없습니다</h3>
              <p className="text-sm text-slate">팀 초대 링크를 선수들에게 공유해 주세요</p>
            </CardContent>
          </Card>
        )}

        {/* 선수 상세 모달 */}
        {selectedPlayer && selectedPlayer.todayCheck && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelectedPlayer(null)}>
            <Card className="w-full max-w-md rounded-t-[32px] sm:rounded-[32px] border-none shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center font-black text-green-700">
                      {selectedPlayer.playerNumber || '?'}
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-obsidian">{selectedPlayer.name}</h3>
                      <p className="text-xs text-slate">{getPositionLabel(selectedPlayer.position)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPlayer(null)}>✕</Button>
                </div>

                {/* 웰니스 점수 */}
                <div className="text-center">
                  <div className={`text-5xl font-black ${
                    selectedPlayer.todayCheck.wellnessScore >= 4 ? 'text-green-600' :
                    selectedPlayer.todayCheck.wellnessScore >= 3 ? 'text-yellow-600' : 'text-red-600'
                  }`}>{selectedPlayer.todayCheck.wellnessScore}</div>
                  <p className="text-sm text-slate font-bold">오늘의 웰니스 점수</p>
                </div>

                {/* 상세 항목 */}
                <div className="overflow-x-auto pb-2 custom-scrollbar">
                  <div className="grid grid-cols-5 gap-2 text-center min-w-[300px]">
                  {[
                    { label: '수면', value: selectedPlayer.todayCheck.sleep, emoji: '🌙' },
                    { label: '통증', value: selectedPlayer.todayCheck.soreness, emoji: '💪' },
                    { label: '피로', value: selectedPlayer.todayCheck.fatigue, emoji: '⚡' },
                    { label: '스트레스', value: selectedPlayer.todayCheck.stress, emoji: '🧠' },
                    { label: '기분', value: selectedPlayer.todayCheck.mood, emoji: '😊' },
                  ].map((item) => (
                    <div key={item.label} className={`py-2 rounded-xl text-xs font-bold ${
                      item.value >= 4 ? 'bg-green-100 text-green-700' :
                      item.value >= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <span className="text-base">{item.emoji}</span>
                      <p className="text-lg font-black">{item.value}</p>
                      <p className="text-[10px]">{item.label}</p>
                    </div>
                  ))}
                  </div>
                </div>

                {selectedPlayer.todayCheck.sessionLoad && (
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-blue-600 font-bold">세션 부하</p>
                    <p className="text-xl font-black text-blue-700">{selectedPlayer.todayCheck.sessionLoad} AU</p>
                    <p className="text-xs text-blue-500">RPE {selectedPlayer.todayCheck.rpe}</p>
                  </div>
                )}

                <Button asChild className="w-full h-11 rounded-2xl font-bold bg-green-600 hover:bg-green-700">
                  <Link href={`/football/players?id=${selectedPlayer.userId}`}>
                    <Eye className="w-4 h-4 mr-2" /> 상세 기록 열람
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// 선수 카드 서브컴포넌트
function PlayerCard({ player, onSelect }: { player: SquadMember; onSelect: (p: SquadMember) => void }) {
  if (!player.todayCheck) return null;
  const score = player.todayCheck.wellnessScore;
  const color = score >= 4 ? 'bg-green-500' : score >= 3 ? 'bg-yellow-400' : 'bg-red-500';
  const bgColor = score >= 4 ? 'hover:bg-green-50' : score >= 3 ? 'hover:bg-yellow-50' : 'hover:bg-red-50';

  const getPositionLabel = (pos?: string) => {
    if (!pos) return '';
    const map: Record<string, string> = { MF: 'MF', FW: 'FW', DF: 'DF', GK: 'GK' };
    return map[pos] || pos;
  };

  return (
    <Card className={`rounded-2xl border-none shadow-lg cursor-pointer transition-all ${bgColor}`} onClick={() => onSelect(player)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* 신호등 */}
          <div className={`w-3 h-3 rounded-full ${color} ring-2 ring-offset-2 ${
            score >= 4 ? 'ring-green-300' : score >= 3 ? 'ring-yellow-300' : 'ring-red-300'
          }`} />
          {/* 번호 */}
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-black text-sm text-obsidian">
            {player.playerNumber || '?'}
          </div>
          {/* 이름 & 포지션 */}
          <div className="flex-1">
            <p className="font-bold text-obsidian">{player.name}</p>
            <p className="text-xs text-slate">{getPositionLabel(player.position)}</p>
          </div>
          {/* 웰니스 점수 */}
          <div className="text-right">
            <p className={`text-xl font-black ${
              score >= 4 ? 'text-green-600' : score >= 3 ? 'text-yellow-600' : 'text-red-600'
            }`}>{score}</p>
            <p className="text-[10px] text-slate">웰니스</p>
          </div>
          {/* 세션 부하 */}
          {player.todayCheck.sessionLoad && (
            <div className="text-right">
              <p className="text-sm font-bold text-blue-600">{player.todayCheck.sessionLoad}</p>
              <p className="text-[10px] text-slate">부하</p>
            </div>
          )}
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>
      </CardContent>
    </Card>
  );
}
