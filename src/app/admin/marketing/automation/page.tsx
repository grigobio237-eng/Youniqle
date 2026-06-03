'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  Users, 
  Mail, 
  MessageSquare, 
  Target,
  BarChart3,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  stats: {
    totalTriggers: number;
    totalActions: number;
    successRate: number;
    lastTriggered?: Date;
  };
  createdAt: Date;
}

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'paused' | 'completed';
  analytics: {
    totalSent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    revenue: number;
  };
}

interface ABTest {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'completed';
  variants: number;
  participants: number;
  conversionRate: number;
  significance: number;
}

export default function MarketingAutomationDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [abTests, setABTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);

  // 샘플 데이터
  const overviewStats = {
    totalRules: 24,
    activeRules: 18,
    totalCampaigns: 12,
    activeCampaigns: 8,
    totalABTests: 6,
    runningTests: 3,
    totalRevenue: 2450000,
    conversionRate: 12.5,
    openRate: 28.3,
    clickRate: 4.2
  };

  const performanceData = [
    { name: '1월', rules: 12, campaigns: 8, revenue: 1200000 },
    { name: '2월', rules: 15, campaigns: 10, revenue: 1350000 },
    { name: '3월', rules: 18, campaigns: 12, revenue: 1500000 },
    { name: '4월', rules: 21, campaigns: 14, revenue: 1800000 },
    { name: '5월', rules: 24, campaigns: 16, revenue: 2100000 },
    { name: '6월', rules: 24, campaigns: 18, revenue: 2450000 }
  ];

  const channelData = [
    { name: '이메일', value: 45, color: '#8884d8' },
    { name: '푸시', value: 25, color: '#82ca9d' },
    { name: 'SMS', value: 15, color: '#ffc658' },
    { name: '인앱', value: 15, color: '#ff7300' }
  ];

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    executions: Math.floor(Math.random() * 100),
    successRate: Math.random() * 100
  }));

  useEffect(() => {
    // 실제 구현에서는 API에서 데이터 로드
    setLoading(false);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-foreground/70" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-primary-container text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-obsidian';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">마케팅 자동화</h1>
          <p className="text-obsidian">고급 마케팅 자동화 시스템 관리</p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Zap className="h-4 w-4 mr-2" />
            새 규칙 생성
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            설정
          </Button>
        </div>
      </div>

      {/* 개요 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 규칙</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.activeRules}</div>
            <p className="text-xs text-muted-foreground">
              총 {overviewStats.totalRules}개 규칙 중
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 캠페인</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              총 {overviewStats.totalCampaigns}개 캠페인 중
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">실행 중인 A/B 테스트</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.runningTests}</div>
            <p className="text-xs text-muted-foreground">
              총 {overviewStats.totalABTests}개 테스트 중
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 수익</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{overviewStats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% 지난 달 대비
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 메인 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="rules">자동화 규칙</TabsTrigger>
          <TabsTrigger value="campaigns">캠페인</TabsTrigger>
          <TabsTrigger value="ab-tests">A/B 테스트</TabsTrigger>
          <TabsTrigger value="analytics">분석</TabsTrigger>
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 성과 차트 */}
            <Card>
              <CardHeader>
                <CardTitle>월별 성과</CardTitle>
                <CardDescription>자동화 규칙, 캠페인, 수익 추이</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stackId="1" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 채널별 분포 */}
            <Card>
              <CardHeader>
                <CardTitle>채널별 분포</CardTitle>
                <CardDescription>마케팅 채널별 사용률</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* 시간대별 실행 현황 */}
          <Card>
            <CardHeader>
              <CardTitle>시간대별 실행 현황</CardTitle>
              <CardDescription>24시간 자동화 실행 패턴</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="executions" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="successRate" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 자동화 규칙 탭 */}
        <TabsContent value="rules" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">자동화 규칙</h2>
            <Button>
              <Zap className="h-4 w-4 mr-2" />
              새 규칙 생성
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">규칙 {i + 1}</CardTitle>
                    <Badge className={getStatusColor('active')}>
                      활성
                    </Badge>
                  </div>
                  <CardDescription>
                    장바구니 이탈 고객 재참여 규칙
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>총 실행</span>
                      <span className="font-medium">1,234</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>성공률</span>
                      <span className="font-medium">87.5%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>마지막 실행</span>
                      <span className="font-medium">2시간 전</span>
                    </div>
                    <Progress value={87.5} className="mt-2" />
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Pause className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 캠페인 탭 */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">마케팅 캠페인</h2>
            <Button>
              <Mail className="h-4 w-4 mr-2" />
              새 캠페인 생성
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {Array.from({ length: 4 }, (_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">캠페인 {i + 1}</CardTitle>
                      <CardDescription>
                        리타겟팅 캠페인 - 이탈 고객 대상
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor('active')}>
                      활성
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">12,345</div>
                      <div className="text-sm text-obsidian">발송</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">28.3%</div>
                      <div className="text-sm text-obsidian">오픈율</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">4.2%</div>
                      <div className="text-sm text-obsidian">클릭율</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">₩1,234,567</div>
                      <div className="text-sm text-obsidian">수익</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* A/B 테스트 탭 */}
        <TabsContent value="ab-tests" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">A/B 테스트</h2>
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              새 테스트 생성
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }, (_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">테스트 {i + 1}</CardTitle>
                    <Badge className={getStatusColor('active')}>
                      실행 중
                    </Badge>
                  </div>
                  <CardDescription>
                    이메일 제목 A/B 테스트
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>참여자</span>
                      <span className="font-medium">2,456명</span>
                    </div>
                    <div className="flex justify-between">
                      <span>변형</span>
                      <span className="font-medium">2개</span>
                    </div>
                    <div className="flex justify-between">
                      <span>전환율</span>
                      <span className="font-medium">12.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>유의성</span>
                      <span className="font-medium">95%</span>
                    </div>
                    <Progress value={75} className="mt-2" />
                    <div className="text-sm text-obsidian">
                      예상 완료: 3일 후
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 분석 탭 */}
        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-bold">고급 분석</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>RFM 분석</CardTitle>
                <CardDescription>고객 세그먼트별 분석</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Champions</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loyal Customers</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Potential Loyalists</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>At Risk</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lost Customers</span>
                    <span className="font-medium">25%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>이탈 예측</CardTitle>
                <CardDescription>고객 이탈 위험도 분석</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>위험도 낮음</span>
                    <span className="font-medium">60%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>위험도 중간</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>위험도 높음</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>위험도 매우 높음</span>
                    <span className="font-medium">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
