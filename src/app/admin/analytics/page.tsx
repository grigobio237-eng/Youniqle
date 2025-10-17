'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  DollarSign,
  ShoppingCart,
  Target,
  Globe,
  Smartphone,
  Mail,
  Tag,
  Megaphone,
  RefreshCw,
  Download,
  Filter,
  Calendar
} from 'lucide-react';

interface RealtimeMetrics {
  activeUsers: number;
  pageViews: number;
  events: number;
  conversions: number;
  revenue: number;
  hourlyMetrics: Array<{
    hour: string;
    users: number;
    pageViews: number;
    events: number;
    conversions: number;
    revenue: number;
  }>;
  channelPerformance: Array<{
    channel: string;
    users: number;
    pageViews: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  }>;
  devicePerformance: Array<{
    device: string;
    users: number;
    pageViews: number;
    conversions: number;
    revenue: number;
  }>;
  locationPerformance: Array<{
    country: string;
    users: number;
    pageViews: number;
    conversions: number;
    revenue: number;
  }>;
  topPages: Array<{
    page: string;
    title: string;
    views: number;
    uniqueViews: number;
    avgTimeOnPage: number;
    bounceRate: number;
  }>;
  topSearchTerms: Array<{
    term: string;
    searches: number;
    results: number;
    avgResults: number;
  }>;
  campaignPerformance: Array<{
    campaign: string;
    source: string;
    medium: string;
    users: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
    costPerConversion: number;
  }>;
  abTestPerformance: Array<{
    testName: string;
    variant: string;
    users: number;
    conversions: number;
    conversionRate: number;
    lift: number;
  }>;
  segmentPerformance: Array<{
    segmentName: string;
    users: number;
    conversions: number;
    revenue: number;
    avgOrderValue: number;
    conversionRate: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('1h');

  useEffect(() => {
    fetchMetrics();
    
    // 자동 새로고침 설정
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchMetrics, 30000); // 30초마다 새로고침
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, selectedPeriod]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/analytics/realtime?period=${selectedPeriod}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: 실시간 분석 데이터를 불러올 수 없습니다.`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API 응답 오류가 발생했습니다.');
      }
      
      if (!data.data) {
        throw new Error('분석 데이터가 없습니다.');
      }
      
      setMetrics(data.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      
      // 개발 중에는 기본 데이터 설정
      if (process.env.NODE_ENV === 'development') {
        setMetrics({
          activeUsers: 0,
          pageViews: 0,
          events: 0,
          conversions: 0,
          revenue: 0,
          hourlyMetrics: [],
          channelPerformance: [],
          devicePerformance: [],
          locationPerformance: [],
          topPages: [],
          topSearchTerms: [],
          campaignPerformance: [],
          abTestPerformance: [],
          segmentPerformance: []
        });
        setError(null);
      }
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

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  if (loading && !metrics) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>실시간 분석 데이터를 불러오는 중...</p>
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
            <p className="text-lg">실시간 분석 데이터를 불러올 수 없습니다</p>
            <p className="text-sm text-gray-500 mt-2">{error}</p>
          </div>
          <Button onClick={fetchMetrics} variant="outline">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">실시간 분석 대시보드</h1>
          <p className="text-gray-600 mt-1">마케팅 성과 실시간 모니터링</p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="1h">최근 1시간</option>
            <option value="24h">최근 24시간</option>
            <option value="7d">최근 7일</option>
            <option value="30d">최근 30일</option>
          </select>
          <Button
            variant="outline"
            onClick={fetchMetrics}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            자동 새로고침
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
        </div>
      </div>

      {/* 실시간 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.activeUsers)}</div>
            <p className="text-xs text-muted-foreground">
              현재 온라인
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">페이지 뷰</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.pageViews)}</div>
            <p className="text-xs text-muted-foreground">
              최근 {selectedPeriod}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이벤트</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.events)}</div>
            <p className="text-xs text-muted-foreground">
              총 이벤트 수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전환</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.conversions)}</div>
            <p className="text-xs text-muted-foreground">
              전환율: {formatPercentage((metrics.conversions / metrics.pageViews) * 100)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.revenue)}</div>
            <p className="text-xs text-muted-foreground">
              최근 {selectedPeriod}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 시간별 트렌드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>시간별 사용자 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.hourlyMetrics.slice(-6).map((metric, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium">{metric.hour}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatNumber(metric.users)}명</div>
                    <div className="text-xs text-gray-500">
                      {formatNumber(metric.pageViews)} 뷰
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>채널별 성과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.channelPerformance.slice(0, 5).map((channel, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">{channel.channel}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatNumber(channel.users)}명</div>
                    <div className="text-xs text-gray-500">
                      {formatPercentage(channel.conversionRate)} 전환율
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 디바이스 및 지역 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>디바이스별 성과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.devicePerformance.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {device.device === 'desktop' ? (
                      <Globe className="h-4 w-4 text-blue-500" />
                    ) : device.device === 'mobile' ? (
                      <Smartphone className="h-4 w-4 text-green-500" />
                    ) : (
                      <Smartphone className="h-4 w-4 text-purple-500" />
                    )}
                    <span className="text-sm font-medium capitalize">{device.device}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatNumber(device.users)}명</div>
                    <div className="text-xs text-gray-500">
                      {formatNumber(device.conversions)} 전환
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>지역별 성과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.locationPerformance.slice(0, 5).map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium">{location.country || 'Unknown'}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatNumber(location.users)}명</div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(location.revenue)} 매출
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 인기 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>인기 페이지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topPages.slice(0, 5).map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{page.title || page.page}</div>
                    <div className="text-xs text-gray-500 truncate">{page.page}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium">{formatNumber(page.views)}</div>
                    <div className="text-xs text-gray-500">
                      {formatPercentage(page.bounceRate)} 이탈률
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>인기 검색어</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topSearchTerms.slice(0, 5).map((term, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{term.term}</div>
                    <div className="text-xs text-gray-500">
                      평균 {term.avgResults.toFixed(0)}개 결과
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium">{formatNumber(term.searches)}</div>
                    <div className="text-xs text-gray-500">검색</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 마케팅 성과 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>캠페인 성과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.campaignPerformance.slice(0, 5).map((campaign, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{campaign.campaign}</div>
                    <div className="text-xs text-gray-500">
                      {campaign.source} / {campaign.medium}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium">{formatNumber(campaign.users)}명</div>
                    <div className="text-xs text-gray-500">
                      {formatPercentage(campaign.conversionRate)} 전환율
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>A/B 테스트 성과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.abTestPerformance.slice(0, 5).map((test, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{test.testName}</div>
                    <div className="text-xs text-gray-500">{test.variant}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium">{formatNumber(test.users)}명</div>
                    <div className="text-xs text-gray-500">
                      {formatPercentage(test.conversionRate)} 전환율
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 세그먼트 성과 */}
      <Card>
        <CardHeader>
          <CardTitle>세그먼트별 성과</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.segmentPerformance.slice(0, 10).map((segment, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{segment.segmentName}</div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(segment.avgOrderValue)} 평균 주문 금액
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm font-medium">{formatNumber(segment.users)}명</div>
                  <div className="text-xs text-gray-500">
                    {formatPercentage(segment.conversionRate)} 전환율
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}