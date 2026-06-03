'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Tag, 
  Megaphone, 
  Bell, 
  TrendingUp, 
  Users, 
  DollarSign,
  Eye,
  MousePointer,
  ShoppingCart,
  BarChart3,
  Calendar,
  Settings
} from 'lucide-react';
import Link from 'next/link';

interface MarketingStats {
  overview: {
    newsletter: {
      total: number;
      active: number;
      unsubscribed: number;
      recentSubscriptions: number;
      recentUnsubscriptions: number;
    };
    coupon: {
      total: number;
      active: number;
      totalUsage: number;
      recentUsage: number;
      recentDiscount: number;
    };
    promotion: {
      total: number;
      active: number;
      totalUsage: number;
    };
    notification: {
      total: number;
      unread: number;
      recentSent: number;
    };
    orders: {
      total: number;
      revenue: number;
      avgOrderValue: number;
    };
  };
  dailyStats: Array<{
    _id: {
      year: number;
      month: number;
      day: number;
    };
    orders: number;
    revenue: number;
  }>;
  channelPerformance: Array<{
    _id: string;
    orders: number;
    revenue: number;
    discount: number;
  }>;
  period: number;
}

export default function MarketingDashboard() {
  const [stats, setStats] = useState<MarketingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    fetchMarketingStats();
  }, [selectedPeriod]);

  const fetchMarketingStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/marketing/stats?period=${selectedPeriod}`);
      
      if (!response.ok) {
        throw new Error('마케팅 통계를 불러올 수 없습니다.');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch marketing stats:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(num);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>마케팅 통계를 불러오는 중...</p>
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
            <p className="text-lg">마케팅 통계를 불러올 수 없습니다</p>
            <p className="text-sm text-foreground/70 mt-2">{error}</p>
          </div>
          <Button onClick={fetchMarketingStats} variant="outline">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-obsidian">마케팅 대시보드</h1>
          <p className="text-obsidian mt-1">뉴스레터, 쿠폰, 프로모션, 알림 통합 관리</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="7">최근 7일</option>
            <option value="30">최근 30일</option>
            <option value="90">최근 90일</option>
          </select>
          <Button onClick={fetchMarketingStats} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        </div>
      </div>

      {/* 개요 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/newsletter">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">뉴스레터 구독자</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.overview.newsletter.active)}</div>
              <p className="text-xs text-muted-foreground">
                총 {formatNumber(stats.overview.newsletter.total)}명 중 활성 구독자
              </p>
              <div className="flex items-center mt-2">
                <Badge variant="secondary" className="text-xs">
                  +{stats.overview.newsletter.recentSubscriptions} 신규
                </Badge>
                <Badge variant="outline" className="text-xs ml-2">
                  -{stats.overview.newsletter.recentUnsubscriptions} 해지
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/coupons">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 쿠폰</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.overview.coupon.active)}</div>
              <p className="text-xs text-muted-foreground">
                총 {formatNumber(stats.overview.coupon.totalUsage)}회 사용
              </p>
              <div className="flex items-center mt-2">
                <Badge variant="secondary" className="text-xs">
                  {formatCurrency(stats.overview.coupon.recentDiscount)} 할인
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/promotions">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 프로모션</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.overview.promotion.active)}</div>
              <p className="text-xs text-muted-foreground">
                총 {formatNumber(stats.overview.promotion.totalUsage)}회 사용
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/notifications">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">알림</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.overview.notification.total)}</div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(stats.overview.notification.unread)}개 미읽음
              </p>
              <div className="flex items-center mt-2">
                <Badge variant="secondary" className="text-xs">
                  {formatNumber(stats.overview.notification.recentSent)}개 전송
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 매출 통계 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link href="/admin/orders">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 주문</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.overview.orders.total)}</div>
              <p className="text-xs text-muted-foreground">
                최근 {selectedPeriod}일간
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/orders">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 매출</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.overview.orders.revenue)}</div>
              <p className="text-xs text-muted-foreground">
                최근 {selectedPeriod}일간
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/orders">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 주문 금액</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.overview.orders.avgOrderValue)}</div>
              <p className="text-xs text-muted-foreground">
                최근 {selectedPeriod}일간
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 탭 메뉴 */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="newsletter">뉴스레터</TabsTrigger>
          <TabsTrigger value="coupon">쿠폰</TabsTrigger>
          <TabsTrigger value="promotion">프로모션</TabsTrigger>
          <TabsTrigger value="notification">알림</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 채널별 성과 */}
            <Card>
              <CardHeader>
                <CardTitle>채널별 성과</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.channelPerformance.map((channel, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="text-sm font-medium">
                          {channel._id || '일반 주문'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatNumber(channel.orders)}주문</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(channel.revenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 일별 매출 추이 */}
            <Card>
              <CardHeader>
                <CardTitle>일별 매출 추이</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.dailyStats.slice(-7).map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">
                        {day._id.month}/{day._id.day}
                      </span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatNumber(day.orders)}주문</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(day.revenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="newsletter" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">뉴스레터 관리</h3>
            <div className="flex space-x-2">
              <Button asChild>
                <Link href="/admin/newsletter">
                  <Mail className="h-4 w-4 mr-2" />
                  뉴스레터 관리
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/newsletter/send">
                  <Mail className="h-4 w-4 mr-2" />
                  뉴스레터 발송
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(stats.overview.newsletter.active)}
                </div>
                <p className="text-sm text-muted-foreground">활성 구독자</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">
                  {formatNumber(stats.overview.newsletter.recentSubscriptions)}
                </div>
                <p className="text-sm text-muted-foreground">최근 구독</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(stats.overview.newsletter.recentUnsubscriptions)}
                </div>
                <p className="text-sm text-muted-foreground">최근 해지</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="coupon" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">쿠폰 관리</h3>
            <div className="flex space-x-2">
              <Button asChild>
                <Link href="/admin/coupons">
                  <Tag className="h-4 w-4 mr-2" />
                  쿠폰 관리
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/coupons/create">
                  <Tag className="h-4 w-4 mr-2" />
                  쿠폰 생성
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(stats.overview.coupon.active)}
                </div>
                <p className="text-sm text-muted-foreground">활성 쿠폰</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">
                  {formatNumber(stats.overview.coupon.totalUsage)}
                </div>
                <p className="text-sm text-muted-foreground">총 사용 횟수</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-secondary">
                  {formatCurrency(stats.overview.coupon.recentDiscount)}
                </div>
                <p className="text-sm text-muted-foreground">최근 할인 금액</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="promotion" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">프로모션 관리</h3>
            <div className="flex space-x-2">
              <Button asChild>
                <Link href="/admin/promotions">
                  <Megaphone className="h-4 w-4 mr-2" />
                  프로모션 관리
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/promotions/create">
                  <Megaphone className="h-4 w-4 mr-2" />
                  프로모션 생성
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(stats.overview.promotion.active)}
                </div>
                <p className="text-sm text-muted-foreground">활성 프로모션</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">
                  {formatNumber(stats.overview.promotion.totalUsage)}
                </div>
                <p className="text-sm text-muted-foreground">총 사용 횟수</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notification" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">알림 관리</h3>
            <div className="flex space-x-2">
              <Button asChild>
                <Link href="/admin/notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  알림 관리
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/notifications/send">
                  <Bell className="h-4 w-4 mr-2" />
                  알림 발송
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">
                  {formatNumber(stats.overview.notification.total)}
                </div>
                <p className="text-sm text-muted-foreground">총 알림</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {formatNumber(stats.overview.notification.unread)}
                </div>
                <p className="text-sm text-muted-foreground">미읽음 알림</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(stats.overview.notification.recentSent)}
                </div>
                <p className="text-sm text-muted-foreground">최근 전송</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}









