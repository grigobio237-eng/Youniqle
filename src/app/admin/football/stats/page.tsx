'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Trophy, Activity, CreditCard, TrendingUp } from 'lucide-react';

export default function AdminFootballStatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/football/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">⚽ 축구 플랫폼 통계</h1>
          <p className="text-text-secondary text-sm mt-1">전체 축구 플랫폼 현황</p>
        </div>

        {/* 핵심 지표 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '전체 팀 수', value: stats?.totalTeams || 0, icon: Trophy, color: 'text-green-600', bg: 'bg-green-50' },
            { label: '활성 팀', value: stats?.activeTeams || 0, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: '전체 선수', value: stats?.totalPlayers || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: '활성 구독', value: stats?.activeSubscriptions || 0, icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="border-none shadow-md">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-text-primary">{item.value}</p>
                  <p className="text-xs text-text-secondary">{item.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 오늘의 웰니스 활동 */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" /> 오늘의 웰니스 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-3xl font-bold text-green-600">{stats?.todayChecks || 0}</p>
                <p className="text-xs text-text-secondary mt-1">오늘 체크 수</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-3xl font-bold text-blue-600">{stats?.todayAvgWellness || '-'}</p>
                <p className="text-xs text-text-secondary mt-1">평균 웰니스</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-3xl font-bold text-red-600">{stats?.todayAlerts || 0}</p>
                <p className="text-xs text-text-secondary mt-1">경고 선수</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 승인 대기 */}
        {(stats?.pendingTeams || 0) > 0 && (
          <Card className="border-2 border-yellow-300 shadow-md">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-text-primary">⏳ 승인 대기 팀</p>
                <p className="text-sm text-text-secondary">팀 등록 승인 요청이 있습니다</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-700 border-none text-lg font-bold px-4 py-2">
                {stats.pendingTeams}건
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
