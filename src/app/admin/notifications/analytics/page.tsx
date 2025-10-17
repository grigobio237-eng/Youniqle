'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Mail,
  Smartphone,
  MessageSquare,
  Bell,
  Users,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  Monitor,
  Smartphone as MobileIcon,
  Tablet,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface AnalyticsMetrics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalConverted: number;
  totalFailed: number;
  totalBounced: number;
  totalUnsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  averageDeliveryTime: number;
  averageOpenTime: number;
  averageClickTime: number;
  averageConversionTime: number;
  totalRevenue: number;
  averageRevenuePerNotification: number;
  averageRevenuePerConversion: number;
}

interface TimeSeriesData {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  failed: number;
  revenue: number;
}

interface DeviceAnalytics {
  deviceType: string;
  count: number;
  percentage: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

interface LocationAnalytics {
  country: string;
  region?: string;
  city?: string;
  count: number;
  percentage: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

const NotificationAnalyticsPage = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [deviceAnalytics, setDeviceAnalytics] = useState<DeviceAnalytics[]>([]);
  const [locationAnalytics, setLocationAnalytics] = useState<LocationAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [groupBy, setGroupBy] = useState<'hour' | 'day' | 'week' | 'month'>('day');

  // 데이터 조회
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(typeFilter && { type: typeFilter }),
        ...(categoryFilter && { category: categoryFilter })
      });

      // 기본 메트릭 조회
      const metricsResponse = await fetch(`/api/admin/notifications/analytics?${params}`);
      const metricsData = await metricsResponse.json();
      if (metricsResponse.ok) {
        setMetrics(metricsData);
      }

      // 시계열 데이터 조회
      const timeSeriesParams = new URLSearchParams({
        ...params,
        groupBy: groupBy
      });
      const timeSeriesResponse = await fetch(`/api/admin/notifications/analytics/timeseries?${timeSeriesParams}`);
      const timeSeriesData = await timeSeriesResponse.json();
      if (timeSeriesResponse.ok) {
        setTimeSeriesData(timeSeriesData);
      }

      // 디바이스 분석 조회
      const deviceResponse = await fetch(`/api/admin/notifications/analytics/devices?${params}`);
      const deviceData = await deviceResponse.json();
      if (deviceResponse.ok) {
        setDeviceAnalytics(deviceData);
      }

      // 위치 분석 조회
      const locationResponse = await fetch(`/api/admin/notifications/analytics/locations?${params}`);
      const locationData = await locationResponse.json();
      if (locationResponse.ok) {
        setLocationAnalytics(locationData);
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate, typeFilter, categoryFilter, groupBy]);

  // 디바이스별 색상
  const getDeviceColor = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop':
        return '#3B82F6';
      case 'mobile':
        return '#10B981';
      case 'tablet':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  // 디바이스 아이콘
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      case 'mobile':
        return <MobileIcon className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">알림 분석</h1>
          <p className="text-gray-600">알림 성과를 분석하고 최적화하세요</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
        </div>
      </div>

      {/* 필터 */}
      <Card>
        <CardHeader>
          <CardTitle>필터 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">시작일</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">종료일</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="타입" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">모든 타입</SelectItem>
                <SelectItem value="email">이메일</SelectItem>
                <SelectItem value="push">푸시</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="in_app">인앱</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">모든 카테고리</SelectItem>
                <SelectItem value="order">주문</SelectItem>
                <SelectItem value="payment">결제</SelectItem>
                <SelectItem value="delivery">배송</SelectItem>
                <SelectItem value="promotion">프로모션</SelectItem>
                <SelectItem value="system">시스템</SelectItem>
                <SelectItem value="marketing">마케팅</SelectItem>
                <SelectItem value="security">보안</SelectItem>
              </SelectContent>
            </Select>
            <Select value={groupBy} onValueChange={(value) => setGroupBy(value as 'hour' | 'day' | 'week' | 'month')}>
              <SelectTrigger>
                <SelectValue placeholder="그룹화" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hour">시간별</SelectItem>
                <SelectItem value="day">일별</SelectItem>
                <SelectItem value="week">주별</SelectItem>
                <SelectItem value="month">월별</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchAnalytics} className="mt-6">
              <Filter className="h-4 w-4 mr-2" />
              적용
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 주요 지표 */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 전송</p>
                  <p className="text-2xl font-bold">{metrics.totalSent.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">전달률</p>
                  <p className="text-2xl font-bold">{metrics.deliveryRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">열람률</p>
                  <p className="text-2xl font-bold">{metrics.openRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">전환률</p>
                  <p className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 차트 */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="devices">디바이스</TabsTrigger>
          <TabsTrigger value="locations">위치</TabsTrigger>
          <TabsTrigger value="performance">성과</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 시계열 차트 */}
          <Card>
            <CardHeader>
              <CardTitle>전송 추이</CardTitle>
              <CardDescription>시간별 알림 전송 현황</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="sent" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="delivered" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="opened" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="clicked" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 전환 퍼널 */}
          <Card>
            <CardHeader>
              <CardTitle>전환 퍼널</CardTitle>
              <CardDescription>알림 전환 단계별 현황</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: '전송', value: metrics?.totalSent || 0, color: '#3B82F6' },
                  { name: '전달', value: metrics?.totalDelivered || 0, color: '#10B981' },
                  { name: '열람', value: metrics?.totalOpened || 0, color: '#F59E0B' },
                  { name: '클릭', value: metrics?.totalClicked || 0, color: '#EF4444' },
                  { name: '전환', value: metrics?.totalConverted || 0, color: '#8B5CF6' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          {/* 디바이스별 분석 */}
          <Card>
            <CardHeader>
              <CardTitle>디바이스별 분석</CardTitle>
              <CardDescription>디바이스별 알림 성과</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">디바이스 분포</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={deviceAnalytics.map(device => ({
                          name: device.deviceType,
                          value: device.count,
                          percentage: device.percentage
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} (${percentage}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deviceAnalytics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getDeviceColor(entry.deviceType)} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">디바이스별 성과</h3>
                  <div className="space-y-4">
                    {deviceAnalytics.map((device) => (
                      <div key={device.deviceType} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          {getDeviceIcon(device.deviceType)}
                          <span className="ml-2 font-medium capitalize">{device.deviceType}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">{device.count}개</div>
                          <div className="text-sm text-gray-600">
                            열람률: {device.openRate.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          {/* 위치별 분석 */}
          <Card>
            <CardHeader>
              <CardTitle>위치별 분석</CardTitle>
              <CardDescription>지역별 알림 성과</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locationAnalytics.slice(0, 10).map((location) => (
                  <div key={`${location.country}-${location.region}-${location.city}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      <span className="font-medium">
                        {location.country}
                        {location.region && `, ${location.region}`}
                        {location.city && `, ${location.city}`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        {location.count}개 ({location.percentage}%)
                      </div>
                      <div className="text-sm text-gray-600">
                        열람률: {location.openRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">
                        전환률: {location.conversionRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* 성과 분석 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>전송 성과</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>전달률</span>
                    <span className="font-semibold">{metrics?.deliveryRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>열람률</span>
                    <span className="font-semibold">{metrics?.openRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>클릭률</span>
                    <span className="font-semibold">{metrics?.clickRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>전환률</span>
                    <span className="font-semibold">{metrics?.conversionRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>수익 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>총 수익</span>
                    <span className="font-semibold">₩{metrics?.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>알림당 수익</span>
                    <span className="font-semibold">₩{metrics?.averageRevenuePerNotification.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>전환당 수익</span>
                    <span className="font-semibold">₩{metrics?.averageRevenuePerConversion.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationAnalyticsPage;
