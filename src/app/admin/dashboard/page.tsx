'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Eye,
  MessageCircle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Layers,
  HeartPulse,
  BrainCircuit
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  todayVisitors: number;
  totalReviews: number;
  userGrowth: number;
  revenueGrowth: number;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    joinedAt: string;
    role: string;
  }>;
  recentOrders: Array<{
    id: string;
    userId: string;
    userName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    sales: number;
    revenue: number;
  }>;
  activityMetrics?: {
    totalDiagnoses: number;
    totalAiAdvices: number;
    totalScoreLogs: number;
    totalAttempts: number;
  };
  recentActivities?: Array<{
    type: 'DIAGNOSIS' | 'AI_ADVICE';
    user: { name: string; email: string };
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: '일간 신규 회원',
      value: stats?.totalUsers || 0,
      icon: Users,
      change: (stats as any)?.dailyUserGrowth || 0,
      href: '/admin/users',
      color: 'text-blue-600',
      isDaily: true
    },
    {
      title: '총 상품 수',
      value: stats?.totalProducts || 0,
      icon: Package,
      change: 0,
      href: '/admin/products',
      color: 'text-green-600'
    },
    {
      title: '일간 주문 수',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      change: (stats as any)?.dailyOrderGrowth || 0,
      href: '/admin/orders',
      color: 'text-orange-600',
      isDaily: true
    },
    {
      title: '일간 매출액',
      value: `₩${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      change: (stats as any)?.dailyRevenueGrowth || 0,
      href: '/admin/analytics',
      color: 'text-purple-600',
      isDaily: true
    }
  ];

  return (
    <div className="w-full space-y-8">
      {/* Header with Premium Dark Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0F172A] p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">관리자 대시보드</h1>
            <p className="text-slate-400 max-w-lg">
              Youniqle 관리 엔진이 가동 중입니다. 오늘의 성과와 서비스 활동을 한눈에 모니터링하세요.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-medium text-white">
                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
              </span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span className="text-sm font-medium text-indigo-100">시스템 정상</span>
            </div>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px]" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;

          return (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-none shadow-md overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-black text-slate-900">
                      {stat.value}
                    </p>
                    {stat.change !== 0 && (
                      <div className={`flex items-center text-xs font-bold mt-2 px-2 py-1 rounded-full w-fit ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        <span>
                          {`${Math.abs(stat.change)}%`}
                        </span>
                        <span className="ml-1 opacity-70 font-normal">
                          {(stat as any).isDaily ? '전일 대비' : '전월 대비'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 duration-300 ${stat.color} bg-slate-50`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                {/* Subtle progress bar at the bottom */}
                <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full overflow-hidden">
                  <div
                    className={`h-full opacity-30 ${stat.color.replace('text-', 'bg-')}`}
                    style={{ width: isPositive ? '100%' : '30%' }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div >

      {/* Recovery Hub Monitoring */}
      < div className="grid grid-cols-1 md:grid-cols-3 gap-6" >
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest opacity-80 flex items-center gap-2">
              <HeartPulse className="w-4 h-4" /> 정밀 회복 진단
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{stats?.activityMetrics?.totalDiagnoses || 0}</div>
            <p className="text-xs opacity-60 mt-1">총 누적 진단 완료 건수</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest opacity-80 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4" /> AI 행동 조언
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{stats?.activityMetrics?.totalAiAdvices || 0}</div>
            <p className="text-xs opacity-60 mt-1">총 상담 로그 생성 건수</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-400 to-orange-500 text-white border-none shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest opacity-80 flex items-center gap-2">
              <Layers className="w-4 h-4" /> 파빌리온 아이템
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">28</div>
            <p className="text-xs opacity-60 mt-1">1F-5F 전체 등록 아이템</p>
          </CardContent>
        </Card>
      </div >

      {/* Recent Activity */}
      < div className="grid grid-cols-1 lg:grid-cols-2 gap-6" >
        {/* Recent Users */}
        < Card >
          <CardHeader>
            <CardTitle>최근 가입 회원</CardTitle>
            <CardDescription>
              최근 7일간 가입한 회원들
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentUsers?.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-text-secondary">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      {user.role}
                    </Badge>
                    <p className="text-xs text-text-secondary mt-1">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/admin/users">
                  모든 회원 보기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card >

        {/* Recent Orders */}
        < Card >
          <CardHeader>
            <CardTitle>최근 주문</CardTitle>
            <CardDescription>
              최근 처리된 주문들
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentOrders?.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{order.userName}</p>
                      <p className="text-xs text-text-secondary">
                        주문 #{order.id.slice(-6)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={order.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {order.status}
                    </Badge>
                    <p className="text-xs font-medium text-text-primary">
                      ₩{order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/admin/orders">
                  모든 주문 보기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card >
      </div >

      {/* Quick Actions */}
      < Card >
        <CardHeader>
          <CardTitle>빠른 작업</CardTitle>
          <CardDescription>
            자주 사용하는 관리 기능들
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Button variant="outline" asChild className="h-24 flex-col gap-1 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all">
              <Link href="/admin/products/new">
                <Package className="h-6 w-6 text-indigo-500" />
                <span className="font-bold">새 상품 등록</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-24 flex-col gap-1 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all">
              <Link href="/admin/pavilion">
                <Layers className="h-6 w-6 text-emerald-500" />
                <span className="font-bold">파빌리온 관리</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-24 flex-col gap-1 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all">
              <Link href="/admin/orders">
                <ShoppingCart className="h-6 w-6 text-purple-500" />
                <span className="font-bold">주문 관리</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-24 flex-col gap-1 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all">
              <Link href="/admin/users">
                <Users className="h-6 w-6 text-blue-500" />
                <span className="font-bold">회원 관리</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-24 flex-col gap-1 border-slate-200 hover:border-orange-500 hover:bg-orange-50 transition-all">
              <Link href="/admin/recovery">
                <TrendingUp className="h-6 w-6 text-orange-500" />
                <span className="font-bold">현황 분석</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card >
    </div >
  );
}















