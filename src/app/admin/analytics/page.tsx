'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Eye, 
  Heart, 
  ShoppingCart, 
  Package, 
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Store,
  Star,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalPartners: number;
    totalOrders: number;
    totalRevenue: number;
    userGrowth: number;
    partnerGrowth: number;
    orderGrowth: number;
    revenueGrowth: number;
  };
  userActivity: {
    activeUsers: number;
    newUsers: number;
    inactiveUsers: number;
    averageSessionTime: number;
    bounceRate: number;
    conversionRate: number;
  };
  partnerActivity: {
    activePartners: number;
    newPartners: number;
    pendingPartners: number;
    totalProducts: number;
    averageRating: number;
    totalSales: number;
  };
  contentStats: {
    totalContent: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    averageEngagement: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'user' | 'partner' | 'order' | 'content';
    action: string;
    user: string;
    timestamp: string;
    details?: string;
  }>;
  topPerformers: {
    topUsers: Array<{
      name: string;
      email: string;
      orders: number;
      spent: number;
      joinDate: string;
    }>;
    topPartners: Array<{
      name: string;
      businessName: string;
      products: number;
      sales: number;
      rating: number;
      joinDate: string;
    }>;
  };
  trends: {
    dailyStats: Array<{
      date: string;
      users: number;
      orders: number;
      revenue: number;
    }>;
  };
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        toast.error('분석 데이터를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('분석 데이터 조회 오류:', error);
      toast.error('분석 데이터 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (growth < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return `₩${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">분석 데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">분석 데이터를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">분석 대시보드</h1>
            <p className="text-gray-600 mt-1">사용자 및 파트너 활동 모니터링 및 분석</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="기간 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">최근 7일</SelectItem>
                <SelectItem value="30d">최근 30일</SelectItem>
                <SelectItem value="90d">최근 90일</SelectItem>
                <SelectItem value="1y">최근 1년</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              리포트 다운로드
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 사용자</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.overview.totalUsers)}</p>
                  <div className="flex items-center mt-1">
                    {getGrowthIcon(analytics.overview.userGrowth)}
                    <span className={`text-sm ml-1 ${getGrowthColor(analytics.overview.userGrowth)}`}>
                      {Math.abs(analytics.overview.userGrowth)}%
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 파트너</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.overview.totalPartners)}</p>
                  <div className="flex items-center mt-1">
                    {getGrowthIcon(analytics.overview.partnerGrowth)}
                    <span className={`text-sm ml-1 ${getGrowthColor(analytics.overview.partnerGrowth)}`}>
                      {Math.abs(analytics.overview.partnerGrowth)}%
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Store className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 주문</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.overview.totalOrders)}</p>
                  <div className="flex items-center mt-1">
                    {getGrowthIcon(analytics.overview.orderGrowth)}
                    <span className={`text-sm ml-1 ${getGrowthColor(analytics.overview.orderGrowth)}`}>
                      {Math.abs(analytics.overview.orderGrowth)}%
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 매출</p>
                  <p className="text-2xl font-bold">{formatCurrency(analytics.overview.totalRevenue)}</p>
                  <div className="flex items-center mt-1">
                    {getGrowthIcon(analytics.overview.revenueGrowth)}
                    <span className={`text-sm ml-1 ${getGrowthColor(analytics.overview.revenueGrowth)}`}>
                      {Math.abs(analytics.overview.revenueGrowth)}%
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: 'overview', label: '전체 개요', icon: BarChart3 },
            { id: 'users', label: '사용자 분석', icon: Users },
            { id: 'partners', label: '파트너 분석', icon: Store },
            { id: 'content', label: '콘텐츠 분석', icon: MessageCircle },
            { id: 'activity', label: '최근 활동', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  사용자 활동
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{analytics.userActivity.activeUsers}</p>
                    <p className="text-sm text-gray-600">활성 사용자</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{analytics.userActivity.newUsers}</p>
                    <p className="text-sm text-gray-600">신규 사용자</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-600">{analytics.userActivity.inactiveUsers}</p>
                    <p className="text-sm text-gray-600">비활성 사용자</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{analytics.userActivity.conversionRate}%</p>
                    <p className="text-sm text-gray-600">전환율</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>평균 세션 시간</span>
                    <span className="font-medium">{analytics.userActivity.averageSessionTime}분</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>이탈률</span>
                    <span className="font-medium">{analytics.userActivity.bounceRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partner Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="h-5 w-5 mr-2" />
                  파트너 활동
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{analytics.partnerActivity.activePartners}</p>
                    <p className="text-sm text-gray-600">활성 파트너</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{analytics.partnerActivity.newPartners}</p>
                    <p className="text-sm text-gray-600">신규 파트너</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{analytics.partnerActivity.pendingPartners}</p>
                    <p className="text-sm text-gray-600">승인 대기</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{analytics.partnerActivity.averageRating.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">평균 평점</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>총 상품 수</span>
                    <span className="font-medium">{formatNumber(analytics.partnerActivity.totalProducts)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>총 판매액</span>
                    <span className="font-medium">{formatCurrency(analytics.partnerActivity.totalSales)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Top Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  상위 사용자
                </CardTitle>
                <CardDescription>주문량과 구매금액 기준 상위 사용자</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topPerformers.topUsers.map((user, index) => (
                    <div key={user.email} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm font-medium">{user.orders}회</p>
                          <p className="text-xs text-gray-600">주문</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{formatCurrency(user.spent)}</p>
                          <p className="text-xs text-gray-600">구매금액</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">{new Date(user.joinDate).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-600">가입일</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="space-y-6">
            {/* Top Partners */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="h-5 w-5 mr-2" />
                  상위 파트너
                </CardTitle>
                <CardDescription>상품 수와 판매액 기준 상위 파트너</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topPerformers.topPartners.map((partner, index) => (
                    <div key={partner.businessName} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{partner.name}</p>
                          <p className="text-sm text-gray-600">{partner.businessName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm font-medium">{partner.products}개</p>
                          <p className="text-xs text-gray-600">상품</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{formatCurrency(partner.sales)}</p>
                          <p className="text-xs text-gray-600">판매액</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            <span className="text-sm font-medium">{partner.rating.toFixed(1)}</span>
                          </div>
                          <p className="text-xs text-gray-600">평점</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">{new Date(partner.joinDate).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-600">가입일</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">총 콘텐츠</p>
                      <p className="text-2xl font-bold">{formatNumber(analytics.contentStats.totalContent)}</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageCircle className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">총 조회수</p>
                      <p className="text-2xl font-bold">{formatNumber(analytics.contentStats.totalViews)}</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Eye className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">총 좋아요</p>
                      <p className="text-2xl font-bold">{formatNumber(analytics.contentStats.totalLikes)}</p>
                    </div>
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Heart className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">평균 참여도</p>
                      <p className="text-2xl font-bold">{analytics.contentStats.averageEngagement}%</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Activity className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                최근 활동
              </CardTitle>
              <CardDescription>실시간 사용자 및 파트너 활동 로그</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'user' ? 'bg-blue-100' :
                      activity.type === 'partner' ? 'bg-green-100' :
                      activity.type === 'order' ? 'bg-purple-100' :
                      'bg-yellow-100'
                    }`}>
                      {activity.type === 'user' && <Users className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'partner' && <Store className="h-4 w-4 text-green-600" />}
                      {activity.type === 'order' && <ShoppingCart className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'content' && <MessageCircle className="h-4 w-4 text-yellow-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.user}</p>
                      {activity.details && (
                        <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
