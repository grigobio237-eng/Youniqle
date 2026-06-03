'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2, XCircle, Clock, Users, Shield, Loader2,
  Copy, RefreshCw, Ban, Eye, Trophy
} from 'lucide-react';

interface Team {
  _id: string;
  teamName: string;
  teamCode: string;
  category: string;
  ageGroup?: string;
  region?: string;
  description?: string;
  inviteLink: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  isActive: boolean;
  memberCount: number;
  playerCount: number;
  createdBy: { _id: string; name: string; email: string; avatar?: string };
  approvedBy?: { name: string };
  approvedAt?: string;
  createdAt: string;
}

export default function AdminFootballTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingTeamId, setRejectingTeamId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/football/team?view=admin');
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams || []);
      }
    } catch (e) {
      console.error('Failed to fetch teams:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (teamId: string, action: 'approve' | 'reject' | 'suspend') => {
    setActionLoading(teamId);
    try {
      const res = await fetch('/api/football/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          action,
          rejectedReason: action === 'reject' ? rejectReason : undefined,
        }),
      });

      if (res.ok) {
        await fetchTeams();
        setRejectingTeamId(null);
        setRejectReason('');
      }
    } catch (e) {
      console.error('Action failed:', e);
    } finally {
      setActionLoading(null);
    }
  };

  const copyInviteLink = (link: string) => {
    navigator.clipboard.writeText(`${window.location.origin}${link}`);
    alert('초대 링크가 복사되었습니다!');
  };

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = { youth: '유소년', pro: '프로', amateur: '동호회' };
    return map[cat] || cat;
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      pending: { label: '승인 대기', className: 'bg-yellow-100 text-yellow-700' },
      approved: { label: '활성', className: 'bg-green-100 text-green-700' },
      rejected: { label: '거절됨', className: 'bg-red-100 text-red-700' },
      suspended: { label: '정지', className: 'bg-gray-100 text-obsidian' },
    };
    const s = map[status] || { label: status, className: 'bg-gray-100 text-obsidian' };
    return <Badge className={`${s.className} border-none font-bold`}>{s.label}</Badge>;
  };

  const filteredTeams = filter === 'all'
    ? teams
    : teams.filter((t) => t.status === filter);

  const pendingCount = teams.filter((t) => t.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              ⚽ 축구 팀 관리
              {pendingCount > 0 && (
                <Badge className="bg-red-500 text-white border-none">{pendingCount} 대기</Badge>
              )}
            </h1>
            <p className="text-text-secondary text-sm mt-1">팀 등록 요청 승인 및 관리</p>
          </div>
          <Button variant="outline" onClick={fetchTeams} className="gap-2">
            <RefreshCw className="w-4 h-4" /> 새로고침
          </Button>
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-2">
          {[
            { value: 'all', label: `전체 (${teams.length})` },
            { value: 'pending', label: `대기 (${teams.filter(t => t.status === 'pending').length})` },
            { value: 'approved', label: `활성 (${teams.filter(t => t.status === 'approved').length})` },
            { value: 'rejected', label: `거절 (${teams.filter(t => t.status === 'rejected').length})` },
          ].map((tab) => (
            <Button
              key={tab.value}
              variant={filter === tab.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* 팀 목록 */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredTeams.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-text-secondary">등록된 팀이 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTeams.map((team) => (
              <Card key={team._id} className={`${team.status === 'pending' ? 'border-yellow-300 border-2' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* 팀 이름 + 상태 */}
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-text-primary">{team.teamName}</h3>
                        {getStatusBadge(team.status)}
                        <Badge variant="outline" className="font-mono text-xs">{team.teamCode}</Badge>
                      </div>

                      {/* 팀 정보 */}
                      <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Shield className="w-4 h-4" /> {getCategoryLabel(team.category)}
                        </span>
                        {team.ageGroup && <span>연령: {team.ageGroup}</span>}
                        {team.region && <span>지역: {team.region}</span>}
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" /> 전체 {team.memberCount}명 / 선수 {team.playerCount}명
                        </span>
                      </div>

                      {/* 신청자 정보 */}
                      <div className="text-sm text-text-secondary">
                        신청자: <strong>{team.createdBy?.name}</strong> ({team.createdBy?.email}) •
                        신청일: {new Date(team.createdAt).toLocaleDateString('ko-KR')}
                        {team.approvedAt && (
                          <> • 승인일: {new Date(team.approvedAt).toLocaleDateString('ko-KR')}</>
                        )}
                      </div>

                      {team.description && (
                        <p className="text-sm text-text-secondary bg-surface p-3 rounded-lg">{team.description}</p>
                      )}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex flex-col gap-2 ml-4">
                      {team.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 gap-1"
                            onClick={() => handleAction(team._id, 'approve')}
                            disabled={actionLoading === team._id}
                          >
                            {actionLoading === team._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            onClick={() => setRejectingTeamId(team._id)}
                          >
                            <XCircle className="w-4 h-4" /> 거절
                          </Button>
                        </>
                      )}

                      {team.status === 'approved' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => copyInviteLink(team.inviteLink)}
                          >
                            <Copy className="w-4 h-4" /> 링크 복사
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-red-600 hover:bg-red-50"
                            onClick={() => handleAction(team._id, 'suspend')}
                          >
                            <Ban className="w-4 h-4" /> 정지
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 거절 사유 입력 */}
                  {rejectingTeamId === team._id && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg space-y-3">
                      <label className="text-sm font-bold text-red-700">거절 사유</label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="거절 사유를 입력해 주세요..."
                        className="w-full h-20 p-3 border rounded-lg text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAction(team._id, 'reject')}
                          disabled={actionLoading === team._id}
                        >
                          거절 확인
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setRejectingTeamId(null); setRejectReason(''); }}
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
