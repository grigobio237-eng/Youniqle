'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Activity, Heart, Trophy, Users, Calendar,
  Megaphone, ChevronRight, CheckCircle2, AlertCircle, Crown, MessageSquare,
  Clock, RefreshCw, Shield, UserPlus, Link as LinkIcon
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
  const [pendingTeam, setPendingTeam] = useState<any>(null);
  const [wellness, setWellness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 초대 코드 및 신규 창단 상태
  const [inviteCode, setInviteCode] = useState('');
  const [joiningTeam, setJoiningTeam] = useState(false);
  const [creationMode, setCreationMode] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newCategory, setNewCategory] = useState('youth');
  const [newAgeGroup, setNewAgeGroup] = useState('');
  const [newRegion, setNewRegion] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creationLoading, setCreationLoading] = useState(false);
  const [error, setError] = useState('');

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
        } else {
          setTeamInfo(null);
        }
        if (teamData.pendingTeam) {
          setPendingTeam(teamData.pendingTeam);
        } else {
          setPendingTeam(null);
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

  const handleJoinByCode = async () => {
    if (!inviteCode) return;
    setJoiningTeam(true);
    setError('');
    try {
      const cleanCode = inviteCode.trim().toUpperCase();
      window.location.href = `/football/join/${cleanCode}`;
    } catch (e) {
      setError('올바른 초대 코드를 입력해 주세요');
      setJoiningTeam(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName) {
      setError('팀 이름을 입력해 주세요');
      return;
    }
    setCreationLoading(true);
    setError('');
    try {
      const res = await fetch('/api/football/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: newTeamName,
          category: newCategory,
          ageGroup: newAgeGroup,
          region: newRegion,
          description: newDescription
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('축구팀 창단 신청이 접수되었습니다! 관리자 승인 후 개설이 완료됩니다.');
        await fetchData();
      } else {
        setError(data.error || '팀 신청에 실패했습니다');
      }
    } catch (e) {
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setCreationLoading(false);
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

  // 1. 창단 승인 대기 중인 상태 렌더링
  if (!teamInfo && pendingTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-background to-background p-4 pb-24">
        <div className="max-w-lg mx-auto space-y-6 pt-4 md:pt-24">
          <Card className="rounded-[32px] border-2 border-yellow-300 shadow-2xl overflow-hidden bg-white">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Clock className="w-10 h-10 text-yellow-500" />
              </div>
              <div className="space-y-2">
                <Badge className="bg-yellow-100 text-yellow-700 border-none font-bold text-sm">
                  창단 승인 대기 중
                </Badge>
                <h1 className="text-2xl font-black text-obsidian">{pendingTeam.teamName}</h1>
                <p className="text-sm text-slate">
                  축구팀 창단 요청이 정상적으로 접수되었습니다.<br />
                  관리자 승인이 완료되면 즉시 클럽하우스 서비스가 활성화됩니다!
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl text-left text-xs space-y-2 text-slate font-medium">
                <p>• <strong>카테고리:</strong> {pendingTeam.category === 'youth' ? '유소년' : pendingTeam.category === 'pro' ? '프로' : '동호회'}</p>
                {pendingTeam.region && <p>• <strong>지역:</strong> {pendingTeam.region}</p>}
                {pendingTeam.ageGroup && <p>• <strong>연령대:</strong> {pendingTeam.ageGroup}</p>}
                <p>• <strong>신청일:</strong> {new Date(pendingTeam.createdAt).toLocaleDateString('ko-KR')}</p>
              </div>

              <div className="pt-2">
                <Button variant="outline" onClick={fetchData} className="w-full h-12 rounded-2xl font-bold gap-2">
                  <RefreshCw className="w-4 h-4" /> 승인 상태 확인하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 2. 가입/창단된 팀이 전혀 없을 때 렌더링 (초기 유저 뷰)
  if (!teamInfo && !pendingTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-background to-background p-4 pb-24">
        <div className="max-w-lg mx-auto space-y-6 pt-4 md:pt-24">
          {/* 타이틀 헤더 */}
          <div className="text-center space-y-2 py-4">
            <div className="w-16 h-16 bg-green-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-green-200">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-obsidian tracking-tight mt-3">⚽ 클럽하우스 시작하기</h1>
            <p className="text-sm text-slate leading-relaxed">
              팀의 소속 선수, 보호자 또는 감독으로서<br />
              체계적이고 과학적인 웰니스 분석을 받아보세요.
            </p>
          </div>

          {/* 선택 카드 1: 선수/학부모로 합류 */}
          <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-black text-obsidian">선수 / 보호자로 팀 합류</h3>
                  <p className="text-xs text-slate">코치에게 받은 팀 초대 코드가 있다면 입력하세요.</p>
                </div>
              </div>

              {error && inviteCode && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="초대 코드 입력 (예: FCXXXX)"
                  className="flex-1 h-12 px-4 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 font-bold uppercase"
                />
                <Button
                  onClick={handleJoinByCode}
                  disabled={!inviteCode || joiningTeam}
                  className="h-12 px-5 rounded-2xl bg-green-600 hover:bg-green-700 font-black text-sm"
                >
                  {joiningTeam ? <Loader2 className="w-4 h-4 animate-spin" /> : '합류하기'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 선택 카드 2: 감독/코치로 팀 개설 */}
          <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setCreationMode(!creationMode)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-obsidian">👨‍🏫 감독 / 코치로 팀 창단</h3>
                    <p className="text-xs text-slate">새로운 팀을 개설하고 승인을 신청합니다.</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-slate transition-transform duration-300 ${creationMode ? 'rotate-90' : ''}`} />
              </div>

              {creationMode && (
                <div className="pt-4 border-t border-line space-y-4">
                  {error && !inviteCode && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold">
                      ⚠️ {error}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate">팀 이름 (필수)</label>
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="예: 강남 FC 유소년클럽"
                      className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate">카테고리</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-sm bg-white font-bold"
                    >
                      <option value="youth">유소년 클럽</option>
                      <option value="pro">엘리트 / 프로</option>
                      <option value="amateur">아마추어 / 동호회</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate">연령대</label>
                      <input
                        type="text"
                        value={newAgeGroup}
                        onChange={(e) => setNewAgeGroup(e.target.value)}
                        placeholder="예: U-12"
                        className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate">연고 지역</label>
                      <input
                        type="text"
                        value={newRegion}
                        onChange={(e) => setNewRegion(e.target.value)}
                        placeholder="예: 서울 강남구"
                        className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate">팀 소개 (선택)</label>
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="팀에 대한 간단한 소개를 적어주세요."
                      className="w-full h-20 p-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>

                  <Button
                    onClick={handleCreateTeam}
                    disabled={creationLoading}
                    className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-sm text-white"
                  >
                    {creationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '팀 개설 신청하기'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
