'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CharacterImage from '@/components/ui/CharacterImage';
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Settings,
  FileText,
  Calculator,
  Clock,
  Gift,
  AlertCircle,
  CheckCircle,
  Info,
  Calendar,
  Download
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PointStats {
  totalUsers: number;
  totalPoints: number;
  totalEarned: number;
  totalUsed: number;
  totalExpired: number;
  averagePointsPerUser: number;
}

interface PointAnalytics {
  overview: {
    totalUsers: number;
    usersWithPoints: number;
    totalPoints: number;
    averagePoints: number;
    maxPoints: number;
    minPoints: number;
  };
  stats: {
    totalEarned: number;
    totalUsed: number;
    totalExpired: number;
    usageRate: number;
  };
  dailyTrend: Array<{
    date: string;
    earned: number;
    used: number;
  }>;
  typeStats: Array<{
    type: string;
    total: number;
    count: number;
  }>;
  expiringPoints: {
    total: number;
    count: number;
  };
  weeklyPattern: Array<{
    dayOfWeek: number;
    total: number;
    count: number;
  }>;
}

const typeLabels: Record<string, string> = {
  earned: '구매 적립',
  used: '사용',
  expired: '만료',
  admin_grant: '관리자 지급',
  admin_deduct: '관리자 차감',
};

const dayLabels: Record<number, string> = {
  1: '일요일',
  2: '월요일',
  3: '화요일',
  4: '수요일',
  5: '목요일',
  6: '금요일',
  7: '토요일',
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminPointManagementPage() {
  const [stats, setStats] = useState<PointStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState<PointAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30');

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (analyticsPeriod) {
      fetchAnalytics();
    }
  }, [analyticsPeriod]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/points/stats');
      const data = await response.json();

      if (data.success) {
        setStats({
          totalUsers: data.data.totalUsers,
          totalPoints: data.data.totalPoints,
          totalEarned: data.data.totalEarned,
          totalUsed: data.data.totalUsed,
          totalExpired: data.data.totalExpired,
          averagePointsPerUser: data.data.averagePointsPerUser,
        });
      } else {
        toast.error('통계 데이터를 불러오는데 실패했습니다.');
        // 기본값 설정
        setStats({
          totalUsers: 0,
          totalPoints: 0,
          totalEarned: 0,
          totalUsed: 0,
          totalExpired: 0,
          averagePointsPerUser: 0,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('통계 조회 오류:', error);
      toast.error('통계를 불러오는 중 오류가 발생했습니다.');
      // 기본값 설정
      setStats({
        totalUsers: 0,
        totalPoints: 0,
        totalEarned: 0,
        totalUsed: 0,
        totalExpired: 0,
        averagePointsPerUser: 0,
      });
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await fetch(`/api/admin/points/analytics?period=${analyticsPeriod}`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
      } else {
        toast.error('분석 데이터를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('분석 데이터 조회 오류:', error);
      toast.error('분석 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <CharacterImage
            src="/character/youniqle-1.png"
            alt="로딩 중"
            width={64}
            height={64}
            className="w-16 h-16 mx-auto mb-4 animate-bounce"
            sizes="64px"
          />
          <p className="text-obsidian">포인트 통계를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">포인트 관리</h1>
          <p className="text-obsidian">포인트 시스템 관리 및 규칙 확인</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="rules">시스템 규칙</TabsTrigger>
            <TabsTrigger value="management">포인트 관리</TabsTrigger>
            <TabsTrigger value="analytics">분석</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-primary mr-3" />
                    <div>
                      <p className="text-sm text-obsidian">총 회원 수</p>
                      <p className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}명</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-sm text-obsidian">총 보유 포인트</p>
                      <p className="text-2xl font-bold">{stats?.totalPoints.toLocaleString()}P</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-obsidian">총 적립 포인트</p>
                      <p className="text-2xl font-bold">{stats?.totalEarned.toLocaleString()}P</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingDown className="h-8 w-8 text-red-600 mr-3" />
                    <div>
                      <p className="text-sm text-obsidian">총 사용 포인트</p>
                      <p className="text-2xl font-bold">{stats?.totalUsed.toLocaleString()}P</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 시스템 상태 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  시스템 상태
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="font-semibold text-green-800">포인트 적립</p>
                      <p className="text-sm text-green-600">정상 작동</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="font-semibold text-green-800">포인트 사용</p>
                      <p className="text-sm text-green-600">정상 작동</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="font-semibold text-green-800">만료 처리</p>
                      <p className="text-sm text-green-600">정상 작동</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 시스템 규칙 탭 */}
          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  포인트 시스템 규칙
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 적립 규칙 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    포인트 적립 규칙
                  </h3>
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        포인트는 구매 완료 시 자동으로 적립되며, 멤버십 등급에 따라 차등 적용됩니다.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">등급별 적립률</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-primary">CEDAR (시작)</span>
                            <Badge variant="outline">1%</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-primary">ROOTER (뿌리)</span>
                            <Badge variant="outline">1.5%</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-600">BLOOMER (꽃)</span>
                            <Badge variant="outline">2%</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-pink-600">GLOWER (빛)</span>
                            <Badge variant="outline">2.5%</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-secondary">ECOSOUL (영혼)</span>
                            <Badge variant="outline">3%</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">적립 조건</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            결제 완료 시 자동 적립
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            실제 결제 금액 기준
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            포인트 사용 금액 제외
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            소수점 이하 버림 처리
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 사용 규칙 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                    포인트 사용 규칙
                  </h3>
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        포인트 사용 시 주문 금액의 최대 50%까지만 사용 가능하며, 최소 주문 금액 제한이 있습니다.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">사용 제한</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                            주문 금액의 최대 50%
                          </li>
                          <li className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                            보유 포인트 범위 내
                          </li>
                          <li className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                            최소 주문 금액 1,000원
                          </li>
                          <li className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                            정수 단위로만 사용
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">사용 예시</h4>
                        <div className="space-y-2 text-sm">
                          <div className="p-2 bg-surface rounded">
                            <p><strong>주문 금액:</strong> 50,000원</p>
                            <p><strong>최대 사용:</strong> 25,000P</p>
                            <p><strong>실제 결제:</strong> 25,000원</p>
                          </div>
                          <div className="p-2 bg-surface rounded">
                            <p><strong>보유 포인트:</strong> 10,000P</p>
                            <p><strong>실제 사용:</strong> 10,000P</p>
                            <p><strong>실제 결제:</strong> 40,000원</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 만료 규칙 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-obsidian" />
                    포인트 만료 규칙
                  </h3>
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        포인트는 적립 후 1년이 지나면 자동으로 만료되며, 만료 예정 포인트는 미리 알림됩니다.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">만료 정책</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center">
                            <Clock className="h-4 w-4 text-obsidian mr-2" />
                            적립 후 365일 만료
                          </li>
                          <li className="flex items-center">
                            <Clock className="h-4 w-4 text-obsidian mr-2" />
                            자동 만료 처리
                          </li>
                          <li className="flex items-center">
                            <Clock className="h-4 w-4 text-obsidian mr-2" />
                            만료 예정 30일 전 알림
                          </li>
                          <li className="flex items-center">
                            <Clock className="h-4 w-4 text-obsidian mr-2" />
                            만료 내역 기록 보관
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">만료 처리</h4>
                        <div className="space-y-2 text-sm">
                          <div className="p-2 bg-surface rounded">
                            <p><strong>처리 주기:</strong> 매일 자정</p>
                            <p><strong>처리 방식:</strong> 자동 배치</p>
                            <p><strong>알림 방식:</strong> 이메일 + 푸시</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 관리자 규칙 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-primary" />
                    관리자 포인트 관리
                  </h3>
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        관리자는 특별한 경우에 한해 사용자에게 포인트를 지급하거나 차감할 수 있습니다.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">관리자 지급</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center">
                            <Gift className="h-4 w-4 text-primary mr-2" />
                            이벤트 보상
                          </li>
                          <li className="flex items-center">
                            <Gift className="h-4 w-4 text-primary mr-2" />
                            고객 만족도 보상
                          </li>
                          <li className="flex items-center">
                            <Gift className="h-4 w-4 text-primary mr-2" />
                            시스템 오류 보상
                          </li>
                          <li className="flex items-center">
                            <Gift className="h-4 w-4 text-primary mr-2" />
                            기타 특별 혜택
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">관리자 차감</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                            부정 사용 적발
                          </li>
                          <li className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                            시스템 오류 복구
                          </li>
                          <li className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                            정책 위반 시
                          </li>
                          <li className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                            기타 특별 사유
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 포인트 관리 탭 */}
          <TabsContent value="management" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  포인트 관리 도구
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <PointAdjustForm />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 분석 탭 */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Calculator className="h-5 w-5 mr-2" />
                    포인트 분석
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={analyticsPeriod} onValueChange={setAnalyticsPeriod}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">최근 7일</SelectItem>
                        <SelectItem value="30">최근 30일</SelectItem>
                        <SelectItem value="90">최근 90일</SelectItem>
                        <SelectItem value="365">최근 1년</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-obsidian">분석 데이터를 불러오는 중...</p>
                  </div>
                ) : analytics ? (
                  <div className="space-y-6">
                    {/* 개요 통계 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2 text-sm text-obsidian">포인트 보유자</h4>
                        <p className="text-2xl font-bold">{analytics.overview.usersWithPoints.toLocaleString()}명</p>
                        <p className="text-xs text-foreground/70 mt-1">
                          전체 회원 대비 {((analytics.overview.usersWithPoints / analytics.overview.totalUsers) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2 text-sm text-obsidian">평균 보유 포인트</h4>
                        <p className="text-2xl font-bold">{Math.round(analytics.overview.averagePoints).toLocaleString()}P</p>
                        <p className="text-xs text-foreground/70 mt-1">
                          최대 {analytics.overview.maxPoints.toLocaleString()}P
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2 text-sm text-obsidian">포인트 사용률</h4>
                        <p className="text-2xl font-bold">{analytics.stats.usageRate.toFixed(1)}%</p>
                        <p className="text-xs text-foreground/70 mt-1">
                          적립 대비 사용 비율
                        </p>
                      </div>
                    </div>

                    {/* 일별 추이 그래프 */}
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-4">포인트 적립/사용 추이</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.dailyTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(value) => {
                              const date = new Date(value);
                              return `${date.getMonth() + 1}/${date.getDate()}`;
                            }}
                          />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: number) => `${value.toLocaleString()}P`}
                            labelFormatter={(label) => {
                              const date = new Date(label);
                              return date.toLocaleDateString('ko-KR');
                            }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="earned" 
                            stroke="#10b981" 
                            name="적립"
                            strokeWidth={2}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="used" 
                            stroke="#ef4444" 
                            name="사용"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* 타입별 통계 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-4">타입별 포인트 통계</h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={analytics.typeStats}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry: any) => `${typeLabels[entry.type] || entry.type}: ${entry.total.toLocaleString()}P`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="total"
                            >
                              {analytics.typeStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `${value.toLocaleString()}P`} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                          {analytics.typeStats.map((stat, index) => (
                            <div key={stat.type} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span>{typeLabels[stat.type] || stat.type}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-obsidian">{stat.count.toLocaleString()}건</span>
                                <span className="font-semibold">{stat.total.toLocaleString()}P</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-4">요일별 사용 패턴</h4>
                        {analytics.weeklyPattern.length > 0 ? (
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={analytics.weeklyPattern
                              .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                              .map(item => ({
                                ...item,
                                day: dayLabels[item.dayOfWeek] || `요일 ${item.dayOfWeek}`,
                              }))}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="day" />
                              <YAxis />
                              <Tooltip 
                                formatter={(value: number) => `${value.toLocaleString()}P`}
                              />
                              <Legend />
                              <Bar dataKey="total" fill="#8884d8" name="사용 포인트" />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center py-12 text-foreground/70">
                            <p>데이터가 없습니다.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 만료 예정 포인트 */}
                    {analytics.expiringPoints.total > 0 && (
                      <div className="p-4 border rounded-lg bg-yellow-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold mb-2 text-yellow-900">만료 예정 포인트</h4>
                            <p className="text-2xl font-bold text-yellow-700">
                              {analytics.expiringPoints.total.toLocaleString()}P
                            </p>
                            <p className="text-sm text-yellow-600 mt-1">
                              향후 30일 내 만료 예정 (총 {analytics.expiringPoints.count}건)
                            </p>
                          </div>
                          <AlertCircle className="h-12 w-12 text-yellow-600" />
                        </div>
                      </div>
                    )}

                    {/* 상세 통계 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-3">포인트 현황</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>총 보유 포인트</span>
                            <span className="font-semibold">{analytics.overview.totalPoints.toLocaleString()}P</span>
                          </div>
                          <div className="flex justify-between">
                            <span>총 적립 포인트</span>
                            <span className="font-semibold text-green-600">+{analytics.stats.totalEarned.toLocaleString()}P</span>
                          </div>
                          <div className="flex justify-between">
                            <span>총 사용 포인트</span>
                            <span className="font-semibold text-red-600">-{analytics.stats.totalUsed.toLocaleString()}P</span>
                          </div>
                          <div className="flex justify-between">
                            <span>총 만료 포인트</span>
                            <span className="font-semibold text-obsidian">-{analytics.stats.totalExpired.toLocaleString()}P</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-3">회원별 통계</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>평균 보유 포인트</span>
                            <span className="font-semibold">{Math.round(analytics.overview.averagePoints).toLocaleString()}P</span>
                          </div>
                          <div className="flex justify-between">
                            <span>최대 보유 포인트</span>
                            <span className="font-semibold">{analytics.overview.maxPoints.toLocaleString()}P</span>
                          </div>
                          <div className="flex justify-between">
                            <span>최소 보유 포인트</span>
                            <span className="font-semibold">{analytics.overview.minPoints.toLocaleString()}P</span>
                          </div>
                          <div className="flex justify-between">
                            <span>포인트 보유자</span>
                            <span className="font-semibold">{analytics.overview.usersWithPoints.toLocaleString()}명</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      분석 데이터를 불러오지 못했습니다. 다시 시도해주세요.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PointAdjustForm() {
  const { addToast } = useToast();
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState<'grant' | 'deduct' | null>(null);

  const submit = async (action: 'grant' | 'deduct') => {
    if (!userId || !amount || Number(amount) <= 0) {
      addToast({ title: '유효하지 않은 입력', description: '사용자와 금액을 확인하세요.', variant: 'error' });
      return;
    }
    try {
      setLoading(action);
      const res = await fetch('/api/admin/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, action, amount: Number(amount), description: reason })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        addToast({ title: '실패', description: data.error || '처리에 실패했습니다.', variant: 'error' });
        return;
      }
      addToast({ title: '완료', description: `새 잔액: ${data.newBalance?.toLocaleString?.() ?? data.newBalance}P`, variant: 'success' });
      setReason('');
      setAmount('');
    } catch (e) {
      addToast({ title: '오류', description: '요청 중 문제가 발생했습니다.', variant: 'error' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">포인트 지급</h3>
        <Label htmlFor="userId">사용자 ID</Label>
        <Input id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="사용자 ObjectId" />
        <Label htmlFor="grantAmount">지급 포인트</Label>
        <Input id="grantAmount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value) || '')} placeholder="지급할 포인트" />
        <Label htmlFor="grantReason">사유</Label>
        <Input id="grantReason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="지급 사유" />
        <Button className="w-full" disabled={loading !== null} onClick={() => submit('grant')}>
          {loading === 'grant' ? '처리 중...' : '포인트 지급'}
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">포인트 차감</h3>
        <Label htmlFor="deductUserId">사용자 ID</Label>
        <Input id="deductUserId" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="사용자 ObjectId" />
        <Label htmlFor="deductAmount">차감 포인트</Label>
        <Input id="deductAmount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value) || '')} placeholder="차감할 포인트" />
        <Label htmlFor="deductReason">사유</Label>
        <Input id="deductReason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="차감 사유" />
        <Button variant="destructive" className="w-full" disabled={loading !== null} onClick={() => submit('deduct')}>
          {loading === 'deduct' ? '처리 중...' : '포인트 차갑'}
        </Button>
      </div>
    </div>
  );
}
