'use client';

import { useState, useEffect } from 'react';
import PartnerLayout from '@/components/partner/PartnerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  ShoppingCart,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    previousRevenue: number;
    totalOrders: number;
    previousOrders: number;
    averageOrderValue: number;
    previousAverageOrderValue: number;
    totalCommission: number;
    previousCommission: number;
  };
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    category: string;
  }>;
  categoryBreakdown: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
}

function PartnerAnalyticsContent() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/partner/analytics?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const exportToCSV = () => {
    if (!analytics) return;

    const csvData = [
      ['날짜', '매출', '주문 수'],
      ...analytics.dailyRevenue.map(item => [
        item.date,
        item.revenue.toString(),
        item.orders.toString()
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `매출분석_${period}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-text-secondary">
          매출 데이터를 불러올 수 없습니다.
        </CardContent>
      </Card>
    );
  }

  const revenueChange = calculateChange(
    analytics.summary.totalRevenue,
    analytics.summary.previousRevenue
  );
  const ordersChange = calculateChange(
    analytics.summary.totalOrders,
    analytics.summary.previousOrders
  );
  const avgOrderChange = calculateChange(
    analytics.summary.averageOrderValue,
    analytics.summary.previousAverageOrderValue
  );
  const commissionChange = calculateChange(
    analytics.summary.totalCommission,
    analytics.summary.previousCommission
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">매출 분석</h1>
          <p className="text-text-secondary mt-1">
            상세한 매출 통계 및 분석 데이터
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">최근 7일</SelectItem>
              <SelectItem value="month">최근 30일</SelectItem>
              <SelectItem value="year">최근 1년</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            CSV 다운로드
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 총 매출 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              총 매출
            </CardTitle>
            <DollarSign className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
              ₩{analytics.summary.totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center mt-2 text-sm">
              {revenueChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(revenueChange).toFixed(1)}%
              </span>
              <span className="text-text-secondary ml-2">
                이전 대비
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 총 주문 수 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              총 주문 수
            </CardTitle>
            <ShoppingCart className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
              {analytics.summary.totalOrders.toLocaleString()}건
            </div>
            <div className="flex items-center mt-2 text-sm">
              {ordersChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(ordersChange).toFixed(1)}%
              </span>
              <span className="text-text-secondary ml-2">
                이전 대비
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 평균 주문 금액 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              평균 주문 금액
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
              ₩{analytics.summary.averageOrderValue.toLocaleString()}
            </div>
            <div className="flex items-center mt-2 text-sm">
              {avgOrderChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={avgOrderChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(avgOrderChange).toFixed(1)}%
              </span>
              <span className="text-text-secondary ml-2">
                이전 대비
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 총 수수료 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              총 수수료
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
              ₩{analytics.summary.totalCommission.toLocaleString()}
            </div>
            <div className="flex items-center mt-2 text-sm">
              {commissionChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={commissionChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(commissionChange).toFixed(1)}%
              </span>
              <span className="text-text-secondary ml-2">
                이전 대비
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 일별 매출 추이 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="h-5 w-5 mr-2" />
              일별 매출 추이
            </CardTitle>
            <CardDescription>
              기간 내 일별 매출 변화
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.dailyRevenue.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text-primary">
                      {new Date(item.date).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {item.orders}건의 주문
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-text-primary">
                      ₩{item.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 카테고리별 매출 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              카테고리별 매출
            </CardTitle>
            <CardDescription>
              카테고리별 매출 비중
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.categoryBreakdown.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">
                      {item.category}
                    </span>
                    <span className="text-sm font-bold text-text-primary">
                      ₩{item.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-secondary w-12 text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            인기 상품
          </CardTitle>
          <CardDescription>
            매출 상위 상품
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topProducts.map((product, index) => (
              <div 
                key={product.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-text-primary">
                      {product.name}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {product.category} · {product.sales}개 판매
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-text-primary">
                    ₩{product.revenue.toLocaleString()}
                  </div>
                  <Badge variant="secondary" className="mt-1">
                    {((product.revenue / analytics.summary.totalRevenue) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PartnerAnalyticsPage() {
  return (
    <PartnerLayout>
      <PartnerAnalyticsContent />
    </PartnerLayout>
  );
}

