'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tag, CheckCircle, XCircle, Clock, BarChart3, RefreshCw } from 'lucide-react';

interface CouponSummary {
  _id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  usageCount: number;
  status: 'active' | 'inactive' | 'expired';
}

interface AdminStatsResponse {
  coupons: CouponSummary[];
  pagination: { page: number; limit: number; total: number; pages: number };
  stats: { total: number; active: number; inactive: number; expired: number; totalUsage: number };
}

export default function CouponAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminStatsResponse | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      // 적은 수만 불러와도 stats는 함께 반환됨
      const res = await fetch('/api/admin/coupons?limit=100');
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || '쿠폰 통계를 불러올 수 없습니다.');
      }
      const json = (await res.json()) as AdminStatsResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const topUsed = useMemo(() => {
    if (!data) return [] as CouponSummary[];
    return [...data.coupons].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)).slice(0, 10);
  }, [data]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>분석 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <BarChart3 className="h-16 w-16 mx-auto mb-4" />
            <p className="text-lg">분석 데이터를 불러올 수 없습니다</p>
            <p className="text-sm text-foreground/70 mt-2">{error}</p>
          </div>
          <Button onClick={load} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-obsidian">쿠폰 사용 분석</h1>
        </div>
        <Button variant="outline" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-2" />새로고침
        </Button>
      </div>

      {/* 통계 카드 */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 쿠폰</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.total.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{data.stats.active.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">비활성</CardTitle>
              <XCircle className="h-4 w-4 text-foreground/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-obsidian">{data.stats.inactive.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">만료</CardTitle>
              <Clock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{data.stats.expired.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 사용 횟수</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{data.stats.totalUsage.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TOP 10 사용 쿠폰 */}
      <Card>
        <CardHeader>
          <CardTitle>사용 상위 쿠폰 TOP 10</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>쿠폰 코드</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>타입</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">사용 횟수</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topUsed.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="font-mono font-medium">{c.code}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.type}</TableCell>
                  <TableCell>{c.status}</TableCell>
                  <TableCell className="text-right">{(c.usageCount || 0).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}



