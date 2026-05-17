'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Activity, Heart, Trophy, Users, Calendar,
  Megaphone, ChevronRight, CheckCircle2, AlertCircle, Crown, MessageSquare
} from 'lucide-react';
import Link from 'next/link';

interface TeamInfo {
  membership: {
    role: string;
    position?: string;
    playerNumber?: number;
  };
  team: {
    _id: string;
    teamName: string;
    teamCode: string;
    category: string;
    ageGroup?: string;
  };
}

export default function FootballMyPage() {
  const { data: session } = useSession();
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [wellness, setWellness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamRes, wellnessRes] = await Promise.all([
        fetch('/api/football/team'),
        fetch('/api/football/wellness?view=my&days=7'),
      ]);

      if (teamRes.ok) {
        const teamData = await teamRes.json();
        if (teamData.teams?.length > 0) {
          setTeamInfo(teamData.teams[0]);
        }
      }

      if (wellnessRes.ok) {
        const wellnessData = await wellnessRes.json();
        setWellness(wellnessData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = (session?.user as any)?.role === 'admin' || (session?.user as any)?.role === 'superadmin';
  const footballRole = isAdmin ? 'coach' : (session?.user as any)?.footballRole;

  const getRoleLabel = (role: string) => {
    const map: Record<string, string> = {
      head_coach: '감독',
      coach: '코치',
      trainer: '트레이너',
      medical: '의무 스태프',
      player: '선수',
      guardian: '보호자',
    };
    return map[role] || role;
  };

  const getPositionLabel = (pos: string) => {
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

  // 코치/감독용 메뉴
  const coachMenus = [
    { label: '코치 대시보드', desc: '스쿼드 컨디션 오버뷰', href: '/football/dashboard', icon: Activity, color: 'bg-emerald-500' },
    { label: '공지사항 관리', desc: '팀 공지사항 작성 및 관리', href: '/football/announcements', icon: Megaphone, color: 'bg-blue-500' },
    { label: '팀 스케줄', desc: '훈련/경기 일정 관리', href: '/football/schedule', icon: Calendar, color: 'bg-purple-500' },
    { label: '팀 커뮤니티', desc: '팀원 전용 소통 게시판', href: '/football/community', icon: MessageSquare, color: 'bg-indigo-500' },
    { label: '선수 명단', desc: '팀 선수 현황 관리', href: '/football/players', icon: Users, color: 'bg-orange-500' },
    { label: '구독 관리', desc: '플랜 및 결제 관리', href: '/football/subscription', icon: Crown, color: 'bg-yellow-500' },
  ];

  // 선수용 메뉴
  const playerMenus = [
    { label: '오늘의 컨디션 체크', desc: '데일리 웰니스 기록', href: '/football/wellness', icon: Heart, color: 'bg-green-500', highlight: !wellness?.todayCheck },
    { label: '나의 컨디션 분석', desc: 'ACWR & 웰니스 트렌드', href: '/football/my-condition', icon: Activity, color: 'bg-emerald-500' },
    { label: '팀 공지사항', desc: '코치의 공지 확인', href: '/football/announcements', icon: Megaphone, color: 'bg-blue-500' },
    { label: '팀 스케줄', desc: '훈련/경기 일정 확인', href: '/football/schedule', icon: Calendar, color: 'bg-purple-500' },
    { label: '팀 커뮤니티', desc: '조언 및 논의 스레드', href: '/football/community', icon: MessageSquare, color: 'bg-indigo-500' },
  ];

  // 보호자용 메뉴
  const guardianMenus = [
    { label: '자녀 컨디션 열람', desc: '자녀의 웰니스 데이터 확인', href: '/football/child', icon: Heart, color: 'bg-pink-500' },
    { label: '팀 공지사항', desc: '코치의 공지 확인', href: '/football/announcements', icon: Megaphone, color: 'bg-blue-500' },
    { label: '팀 스케줄', desc: '훈련/경기 일정 확인', href: '/football/schedule', icon: Calendar, color: 'bg-purple-500' },
    { label: '팀 커뮤니티', desc: '팀원 소통 및 의견 제안', href: '/football/community', icon: MessageSquare, color: 'bg-indigo-500' },
  ];

  const menus = footballRole === 'coach'
    ? coachMenus
    : footballRole === 'guardian'
    ? guardianMenus
    : playerMenus;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background p-4 pb-24">
      <div className="max-w-lg mx-auto space-y-6 pt-4 md:pt-24">
        {/* 프로필 카드 */}
        <Card className="rounded-[32px] border-none shadow-2xl overflow-hidden">
          <div className="h-24 bg-gradient-to-br from-green-600 to-emerald-700 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
          </div>
          <CardContent className="p-6 -mt-8 relative z-10">
            <div className="flex items-end gap-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-3xl border-2 border-green-200">
                {footballRole === 'coach' ? '👨‍🏫' : footballRole === 'guardian' ? '👨‍👩‍👦' : '⚽'}
              </div>
              <div className="flex-1 pb-1">
                <h2 className="text-xl font-black text-obsidian">{session?.user?.name || '선수'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {teamInfo && (
                    <>
                      <Badge className="bg-green-100 text-green-700 border-none font-bold text-xs">
                        {teamInfo.team.teamName}
                      </Badge>
                      <Badge variant="outline" className="font-bold text-xs">
                        {getRoleLabel(teamInfo.membership.role)}
                      </Badge>
                      {teamInfo.membership.position && (
                        <Badge variant="outline" className="font-bold text-xs">
                          {getPositionLabel(teamInfo.membership.position)}
                          {teamInfo.membership.playerNumber && ` #${teamInfo.membership.playerNumber}`}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 오늘의 체크 알림 (선수만) */}
        {footballRole !== 'guardian' && !wellness?.todayCheck && (
          <Card className="rounded-2xl border-2 border-green-300 bg-green-50 shadow-lg">
            <CardContent className="p-4">
              <Link href="/football/wellness" className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-green-800">오늘의 컨디션을 기록해 주세요!</p>
                  <p className="text-xs text-green-600">매일 체크하면 더 정확한 분석이 가능합니다</p>
                </div>
                <ChevronRight className="w-5 h-5 text-green-500" />
              </Link>
            </CardContent>
          </Card>
        )}

        {/* 오늘 체크 완료 시 요약 */}
        {wellness?.todayCheck && footballRole !== 'guardian' && (
          <Card className="rounded-2xl border-none shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> 오늘의 컨디션
                </span>
                <span className={`text-2xl font-black ${
                  wellness.todayCheck.wellnessScore >= 4 ? 'text-green-600' :
                  wellness.todayCheck.wellnessScore >= 3 ? 'text-yellow-600' : 'text-red-600'
                }`}>{wellness.todayCheck.wellnessScore}/5</span>
              </div>
              <div className="grid grid-cols-5 gap-1 text-center">
                {[
                  { v: wellness.todayCheck.sleep, e: '🌙' },
                  { v: wellness.todayCheck.soreness, e: '💪' },
                  { v: wellness.todayCheck.fatigue, e: '⚡' },
                  { v: wellness.todayCheck.stress, e: '🧠' },
                  { v: wellness.todayCheck.mood, e: '😊' },
                ].map((item, i) => (
                  <div key={i} className={`py-2 rounded-lg text-sm font-black ${
                    item.v >= 4 ? 'bg-green-100 text-green-700' :
                    item.v >= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {item.e} {item.v}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 기능 메뉴 */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-slate uppercase tracking-wider px-1">Clubhouse Menu</h3>
          {menus.map((menu) => {
            const Icon = menu.icon;
            return (
              <Link key={menu.label} href={menu.href}>
                <Card className={`rounded-2xl border-none shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                  (menu as any).highlight ? 'ring-2 ring-green-400 ring-offset-2' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${menu.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-obsidian">{menu.label}</p>
                        <p className="text-xs text-slate">{menu.desc}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* 기존 유니클 기능 바로가기 */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-slate uppercase tracking-wider px-1">Youniqle Recovery</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/">
              <Card className="rounded-2xl border-none shadow-lg hover:shadow-xl transition-all cursor-pointer">
                <CardContent className="p-4 text-center space-y-2">
                  <span className="text-2xl">📸</span>
                  <p className="text-sm font-bold text-obsidian">리커버리 스캐너</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/diagnosis?type=daily">
              <Card className="rounded-2xl border-none shadow-lg hover:shadow-xl transition-all cursor-pointer">
                <CardContent className="p-4 text-center space-y-2">
                  <span className="text-2xl">🎯</span>
                  <p className="text-sm font-bold text-obsidian">60초 리듬체크</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
