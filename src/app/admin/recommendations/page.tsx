'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  Target,
  Users,
  MousePointer,
  ShoppingCart,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Eye
} from 'lucide-react';

interface RecommendationStats {
  overall: {
    totalRecommendations: number;
    totalClicks: number;
    totalPurchases: number;
    clickThroughRate: number;
    conversionRate: number;
    averageScore: number;
  };
  byAlgorithm: {
    [key: string]: {
      recommendations: number;
      clicks: number;
      purchases: number;
      clickThroughRate: number;
      conversionRate: number;
      averageScore: number;
    };
  };
  trends: Array<{
    date: string;
    clickThroughRate: number;
    conversionRate: number;
  }>;
  topPerformingItems: Array<{
    itemId: string;
    itemType: string;
    algorithm: string;
    score: number;
    clicks: number;
    purchases: number;
    clickThroughRate: number;
    conversionRate: number;
  }>;
  insights: Array<{
    type: string;
    message: string;
    confidence: number;
    recommendation: string;
  }>;
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  variants: number;
  participants: number;
}

export default function RecommendationDashboard() {
  const [stats, setStats] = useState<RecommendationStats | null>(null);
  const [abTests, setABTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchRecommendationData();
  }, []);

  const fetchRecommendationData = async () => {
    try {
      setLoading(true);

      const [statsRes, abTestsRes] = await Promise.all([
        fetch('/api/recommendations/advanced'),
        fetch('/api/recommendations/ab-test')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      if (abTestsRes.ok) {
        const abTestsData = await abTestsRes.json();
        setABTests(abTestsData.data);
      }

    } catch (error) {
      console.error('Error fetching recommendation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleABTest = async (testId: string, action: string) => {
    try {
      const response = await fetch('/api/recommendations/ab-test', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId, action })
      });

      if (response.ok) {
        setABTests(abTests.map(test =>
          test.id === testId ? { ...test, status: action === 'start' ? 'running' : 'paused' } : test
        ));
      }
    } catch (error) {
      console.error('Error toggling AB test:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-obsidian">추천 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-obsidian">추천 시스템 관리</h1>
          <p className="text-obsidian">추천 성과 분석 및 A/B 테스트 관리</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchRecommendationData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            설정
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="performance">성과 분석</TabsTrigger>
          <TabsTrigger value="ab-tests">A/B 테스트</TabsTrigger>
          <TabsTrigger value="insights">인사이트</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 전체 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 추천 수</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.overall.totalRecommendations.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  지난 7일간
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">클릭 수</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.overall.totalClicks.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  CTR: {((stats?.overall.clickThroughRate || 0) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">구매 수</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.overall.totalPurchases.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  전환율: {((stats?.overall.conversionRate || 0) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">평균 점수</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((stats?.overall.averageScore || 0) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  추천 품질 지표
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 알고리즘별 성과 */}
          <Card>
            <CardHeader>
              <CardTitle>알고리즘별 성과</CardTitle>
              <CardDescription>각 추천 알고리즘의 성과 비교</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.byAlgorithm && Object.entries(stats.byAlgorithm).map(([algorithm, data]) => (
                  <div key={algorithm} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium capitalize">{algorithm.replace('_', ' ')}</h4>
                        <Badge variant="outline">
                          {data.recommendations.toLocaleString()} 추천
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-foreground/70">CTR:</span>
                          <span className="ml-1 font-medium">
                            {(data.clickThroughRate * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-foreground/70">전환율:</span>
                          <span className="ml-1 font-medium">
                            {(data.conversionRate * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-foreground/70">평균 점수:</span>
                          <span className="ml-1 font-medium">
                            {(data.averageScore * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {(data.clickThroughRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-foreground/70">CTR</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* 성과 트렌드 */}
          <Card>
            <CardHeader>
              <CardTitle>성과 트렌드</CardTitle>
              <CardDescription>시간별 추천 성과 변화</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.trends?.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium">{trend.date}</div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-foreground/70">CTR:</span>
                        <span className="font-medium">{(trend.clickThroughRate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-foreground/70">전환율:</span>
                        <span className="font-medium">{(trend.conversionRate * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">+5.2%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 최고 성과 아이템 */}
          <Card>
            <CardHeader>
              <CardTitle>최고 성과 아이템</CardTitle>
              <CardDescription>가장 좋은 성과를 보인 추천 아이템들</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.topPerformingItems?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{item.itemId}</h4>
                        <Badge variant="outline">{item.algorithm}</Badge>
                        <Badge variant="secondary">{item.itemType}</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-foreground/70">클릭:</span>
                          <span className="ml-1 font-medium">{item.clicks}</span>
                        </div>
                        <div>
                          <span className="text-foreground/70">구매:</span>
                          <span className="ml-1 font-medium">{item.purchases}</span>
                        </div>
                        <div>
                          <span className="text-foreground/70">CTR:</span>
                          <span className="ml-1 font-medium">
                            {(item.clickThroughRate * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-foreground/70">전환율:</span>
                          <span className="ml-1 font-medium">
                            {(item.conversionRate * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {(item.score * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-foreground/70">추천 점수</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ab-tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>A/B 테스트</CardTitle>
              <CardDescription>추천 알고리즘 A/B 테스트 관리</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {abTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{test.name}</h4>
                        <Badge variant={
                          test.status === 'running' ? 'default' :
                            test.status === 'completed' ? 'secondary' : 'outline'
                        }>
                          {test.status === 'running' ? '실행 중' :
                            test.status === 'completed' ? '완료' : '일시정지'}
                        </Badge>
                      </div>
                      <p className="text-sm text-obsidian mt-1">{test.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-foreground/70">
                        <span>변형: {test.variants}개</span>
                        <span>참여자: {test.participants.toLocaleString()}명</span>
                        <span>생성일: {new Date(test.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleABTest(test.id, test.status === 'running' ? 'pause' : 'start')}
                      >
                        {test.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>추천 인사이트</CardTitle>
              <CardDescription>유니클이 분석한 추천 시스템 인사이트</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.insights?.map((insight, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{insight.message}</h4>
                        <p className="text-sm text-obsidian mt-1">{insight.recommendation}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          신뢰도: {(insight.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
