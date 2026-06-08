'use client';

import { useState, useEffect } from 'react';
import PartnerLayout from '@/components/partner/PartnerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Truck,
  Clock,
  AlertCircle,
  CheckCircle,
  Star,
  Users,
  FileText,
  BarChart3,
  Store,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  Warehouse,
  Sparkles,
  QrCode
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  partnerType?: 'medical' | 'commerce' | 'trainer';
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalCommission: number;
  pendingCommission: number;
  // 파격/트레이너 특화 데이터
  totalBookings?: number;
  pendingBookings?: number;
  upcomingBookings?: Array<{
    id: string;
    userName: string;
    programTitle: string;
    date: string;
    time: string;
    status: string;
  }>;
  // 병/의원 특화 데이터
  totalPatients?: number;
  recoveryTrend?: Array<{ name: string; value: number }>;
  // 전일 대비 데이터
  yesterdayOrders?: number;
  yesterdayRevenue?: number;
  recentOrders: Array<{
    id: string;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: Array<{
      name: string;
      quantity: number;
    }>;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  notifications: Array<{
    id: string;
    type: 'order' | 'payment' | 'product' | 'system';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>;
}

function PartnerDashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [partnerInfo, setPartnerInfo] = useState<any>(null);
  const [partnerError, setPartnerError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // 기존 파트너 토큰 삭제 (필요한 경우에만 수행하도록 검토 필요, 일단 유지)
    document.cookie = 'partner-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      setLoading(false);
      if (!partnerInfo) setPartnerError('인증 확인 시간이 초과되었습니다. 페이지를 새로고침해 주세요.');
    }, 10000); // 10초 타임아웃

    fetchDashboardStats();
    fetchPartnerInfo();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const fetchPartnerInfo = async () => {
    try {
      console.log('파트너 정보 가져오기 시작...');
      const response = await fetch('/api/partner/auth/verify');
      console.log('파트너 정보 응답 상태:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('파트너 정보 데이터:', data.partner);
        setPartnerInfo(data.partner);
        setPartnerError(null);
      } else if (response.status === 401) {
        console.log('파트너 토큰 없음, 소셜 로그인 사용자 확인 중...');

        // 소셜 로그인 사용자인지 확인
        const sessionResponse = await fetch('/api/auth/session');
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          if (sessionData.user) {
            console.log('소셜 로그인 사용자 발견:', sessionData.user);

            // 파트너 권한 확인
            const checkResponse = await fetch('/api/partner/auth/check-partner-status');
            const checkData = await checkResponse.json();

            if (checkResponse.ok && checkData.isPartner) {
              console.log('파트너 권한 확인됨, 토큰 발급 시작');

              // 파트너 토큰 발급
              const tokenResponse = await fetch('/api/partner/auth/social-login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ provider: sessionData.user.provider || 'google' }),
              });

              if (tokenResponse.ok) {
                console.log('파트너 토큰 발급 성공, 파트너 정보 재조회');
                // 토큰 발급 후 다시 파트너 정보 조회
                setTimeout(() => {
                  fetchPartnerInfo();
                }, 1000);
                return;
              } else {
                console.log('파트너 토큰 발급 실패:', tokenResponse.status);
              }
            } else {
              console.log('파트너 권한 없음:', checkData);
            }
          } else {
            console.log('소셜 로그인 사용자 없음');
          }
        } else {
          console.log('세션 확인 실패:', sessionResponse.status);
        }

        const errorData = await response.json();
        console.log('파트너 정보 가져오기 실패:', errorData);
        setPartnerError(errorData.error || '파트너 정보를 가져올 수 없습니다.');
      } else {
        const errorData = await response.json();
        console.log('파트너 정보 가져오기 실패:', errorData);
        setPartnerError(errorData.error || '파트너 정보를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('Failed to fetch partner info:', error);
      setPartnerError('파트너 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/partner/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchDashboardStats(), fetchPartnerInfo()]);
    setIsRefreshing(false);
  };

  // 변화율 계산 헬퍼 함수
  const calculateChange = (current: number, previous: number) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  // 시간 포맷 헬퍼
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    return date.toLocaleDateString('ko-KR');
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

  const ordersChange = calculateChange(stats?.totalOrders || 0, stats?.yesterdayOrders || 0);
  const revenueChange = calculateChange(stats?.totalRevenue || 0, stats?.yesterdayRevenue || 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center space-x-1"><Clock className="h-3 w-3" />대기</Badge>;
      case 'confirmed':
        return <Badge variant="default" className="flex items-center space-x-1"><CheckCircle className="h-3 w-3" />확인</Badge>;
      case 'shipped':
        return <Badge variant="default" className="flex items-center space-x-1"><Truck className="h-3 w-3" />배송중</Badge>;
      case 'delivered':
        return <Badge variant="default" className="flex items-center space-x-1"><CheckCircle className="h-3 w-3" />완료</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="flex items-center space-x-1"><AlertCircle className="h-3 w-3" />취소</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'product': return <Package className="h-4 w-4" />;
      case 'system': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-green-500';
      case 'payment': return 'bg-primary';
      case 'product': return 'bg-orange-500';
      case 'system': return 'bg-red-500';
      default: return 'bg-surface0';
    }
  };

  return (
    <div className="space-y-8">
      {/* Error Alert */}
      {partnerError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">파트너 정보 로드 실패</h3>
              <p className="text-sm text-red-700 mt-1">{partnerError}</p>
              <button
                onClick={() => {
                  setPartnerError(null);
                  fetchPartnerInfo();
                }}
                className="text-sm text-red-600 hover:text-red-800 underline mt-2"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-text-primary">파트너 대시보드</h1>
            {partnerInfo?.partnerType && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 uppercase text-[10px] font-black tracking-wider">
                {partnerInfo.partnerType}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span>{partnerInfo ? `${partnerInfo.name}님의 상점 현황` : '상점 현황 불러오는 중...'}</span>
            {lastUpdated && (
              <span className="flex items-center gap-1 text-xs opacity-70">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(lastUpdated)} 업데이트
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button asChild className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Link href="/partner/products?action=new">
              <Package className="h-4 w-4 mr-2" />
              새 상품 등록
            </Link>
          </Button>
          <Button variant="outline" asChild className="rounded-full">
            <Link href="/partner/content">
              <FileText className="h-4 w-4 mr-2" />
              콘텐츠 작성
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Actions - Enhanced (최상단으로 이동) */}
      <Card className="border-0 shadow-lg overflow-hidden bg-white rounded-[20px] md:rounded-[32px]">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 md:p-8">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            빠른 작업
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            자주 사용하는 파트너 기능들입니다. 상점 운영을 위해 필요한 도구를 선택하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
            <Link href="/partner/products?action=new" className="group flex flex-col items-center p-4 rounded-2xl bg-mist hover:bg-blue-50 hover:shadow-md transition-all text-center">
              <div className="p-3 rounded-2xl bg-primary-container text-primary mb-3 group-hover:scale-110 transition-transform">
                <Package className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">상품 등록</span>
            </Link>
            <Link href="/partner/orders" className="group flex flex-col items-center p-4 rounded-2xl bg-mist hover:bg-green-50 hover:shadow-md transition-all text-center">
              <div className="p-3 rounded-2xl bg-green-100 text-green-600 mb-3 group-hover:scale-110 transition-transform">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">주문 관리</span>
            </Link>
            <Link href="/partner/inventory" className="group flex flex-col items-center p-4 rounded-2xl bg-mist hover:bg-orange-50 hover:shadow-md transition-all text-center">
              <div className="p-3 rounded-2xl bg-orange-100 text-orange-600 mb-3 group-hover:scale-110 transition-transform">
                <Warehouse className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">재고 관리</span>
            </Link>
            <Link href="/partner/analytics" className="group flex flex-col items-center p-4 rounded-2xl bg-mist hover:bg-purple-50 hover:shadow-md transition-all text-center">
              <div className="p-3 rounded-2xl bg-secondary-container text-secondary mb-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">매출 분석</span>
            </Link>
            <Link href="/partner/content" className="group flex flex-col items-center p-4 rounded-2xl bg-mist hover:bg-pink-50 hover:shadow-md transition-all text-center">
              <div className="p-3 rounded-2xl bg-pink-100 text-pink-600 mb-3 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">콘텐츠 작성</span>
            </Link>
            <Link href="/partner/scan" className="group flex flex-col items-center p-4 rounded-2xl bg-amber-50 hover:bg-primary-container/50 hover:shadow-md transition-all text-center border border-amber-100">
              <div className="p-3 rounded-2xl bg-primary-container/50 text-primary mb-3 group-hover:scale-110 transition-transform">
                <QrCode className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-amber-900 font-bold">고객 QR 스캔</span>
            </Link>
            <Link href="/partner/settings" className="group flex flex-col items-center p-4 rounded-2xl bg-mist hover:bg-slate-100 hover:shadow-md transition-all text-center">
              <div className="p-3 rounded-2xl bg-slate-200 text-obsidian mb-3 group-hover:scale-110 transition-transform">
                <Store className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">설정</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Stats Cards Based on Partner Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats?.partnerType === 'medical' ? (
          <>
            <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-primary-container text-primary">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-text-secondary mb-1">매칭 고객 수</p>
                <p className="text-3xl font-bold text-text-primary">{stats?.totalPatients || 0}</p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  지난달 대비 +12%
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-secondary-container text-secondary">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-text-secondary mb-1">정밀 리듬체크 매칭</p>
                <p className="text-3xl font-bold text-text-primary">{stats?.totalOrders || 0}</p>
                <p className="text-xs text-primary mt-2">상세 데이터 분석 완료</p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-orange-100 text-orange-600">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-text-secondary mb-1">상담 대기</p>
                <p className="text-3xl font-bold text-text-primary">{stats?.pendingOrders || 0}</p>
                <p className="text-xs text-orange-600 mt-2">빠른 피드백 필요</p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-green-100 text-green-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-text-secondary mb-1">회복 달성률</p>
                <p className="text-3xl font-bold text-text-primary">85%</p>
                <p className="text-xs text-green-600 mt-2">전체 평균 대비 우수</p>
              </CardContent>
            </Card>
          </>
        ) : stats?.partnerType === 'trainer' ? (
          <>
            <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-secondary-container text-secondary">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-text-secondary mb-1">전체 예약 수</p>
                <p className="text-3xl font-bold text-text-primary">{stats?.totalBookings || 0}</p>
                <p className="text-xs text-secondary mt-2 flex items-center gap-1">
                  이번 달 신규: {stats?.totalOrders || 0}
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-primary-container/50 text-primary">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-text-secondary mb-1">승인 대기 예약</p>
                <p className="text-3xl font-bold text-text-primary">{stats?.pendingBookings || 0}</p>
                <p className="text-xs text-primary mt-2">확인이 필요합니다</p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-rose-100 text-rose-600">
                    <Star className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-text-secondary mb-1">평균 평점</p>
                <p className="text-3xl font-bold text-text-primary">4.9</p>
                <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
                  리뷰 42개 기준
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-secondary-container text-secondary">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-text-secondary mb-1">이번 달 수익</p>
                <p className="text-3xl font-bold text-text-primary">₩{(stats?.monthlyRevenue || 0).toLocaleString()}</p>
                <p className="text-xs text-secondary mt-2">정산 예정</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-primary-container text-primary group-hover:scale-110 transition-transform">
                    <Package className="h-6 w-6" />
                  </div>
                  <Link href="/partner/products" className="text-xs text-text-secondary hover:text-primary flex items-center gap-1">
                    자세히 <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
                <p className="text-sm font-medium text-text-secondary mb-1">총 상품 수</p>
                <p className="text-3xl font-bold text-text-primary">{stats?.totalProducts || 0}</p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  활성 상품: {stats?.activeProducts || 0}개
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  <Link href="/partner/orders" className="text-xs text-text-secondary hover:text-primary flex items-center gap-1">
                    자세히 <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
                <p className="text-sm font-medium text-text-secondary mb-1">총 주문 수</p>
                <p className="text-3xl font-bold text-text-primary">{stats?.totalOrders || 0}</p>
                <div className="flex items-center gap-2 mt-2">
                  {ordersChange !== null && (
                    <span className={`text-xs flex items-center gap-1 ${ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {ordersChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(ordersChange).toFixed(1)}%
                    </span>
                  )}
                  <span className="text-xs text-orange-600 flex items-center gap-1">
                    대기: {stats?.pendingOrders || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-secondary-container text-secondary group-hover:scale-110 transition-transform">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <Link href="/partner/analytics" className="text-xs text-text-secondary hover:text-primary flex items-center gap-1">
                    자세히 <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
                <p className="text-sm font-medium text-text-secondary mb-1">총 매출</p>
                <p className="text-3xl font-bold text-text-primary">₩{(stats?.totalRevenue || 0).toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-2">
                  {revenueChange !== null && (
                    <span className={`text-xs flex items-center gap-1 ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {revenueChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(revenueChange).toFixed(1)}%
                    </span>
                  )}
                  <span className="text-xs text-primary">월: ₩{(stats?.monthlyRevenue || 0).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-orange-100 text-orange-600 group-hover:scale-110 transition-transform">
                    <Warehouse className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-text-secondary mb-1">재고 품목</p>
                <p className="text-3xl font-bold text-text-primary">{stats?.activeProducts || 0}</p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  관리 중
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Activity Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(stats?.partnerType === 'medical' || stats?.partnerType === 'trainer') ? (
          /* Upcoming Bookings / Matching List */
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {stats?.partnerType === 'medical' ? '최근 분석된 고객' : '다가오는 예약'}
                </span>
              </CardTitle>
              <CardDescription>
                {stats?.partnerType === 'medical' ? '리듬체크 결과 기반 매칭된 고객' : '최근 확정된 코칭 일정'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.upcomingBookings?.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-mist rounded-2xl hover:bg-mist/80 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-sm">{booking.userName}</span>
                        <Badge variant="outline" className="text-[10px]">{booking.programTitle}</Badge>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">
                        {booking.date} {booking.time}
                      </p>
                    </div>
                    <div className="text-right">
                       <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
                          {booking.status === 'confirmed' ? '확정' : '대기'}
                       </Badge>
                    </div>
                  </div>
                ))}
                {(!stats?.upcomingBookings || stats.upcomingBookings.length === 0) && (
                  <div className="text-center py-8 text-text-secondary">
                    <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p>내역이 없습니다</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Recent Orders (Commerce Default) */
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  최근 주문
                </span>
                <Button variant="ghost" size="sm" asChild className="rounded-full">
                  <Link href="/partner/orders">
                    <Eye className="h-4 w-4 mr-1" />
                    모두 보기
                  </Link>
                </Button>
              </CardTitle>
              <CardDescription>
                최근 들어온 주문들
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.recentOrders?.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-mist rounded-2xl hover:bg-mist/80 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-sm">{order.customerName}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-1">
                        {order.items.map(item => `${item.name} ${item.quantity}개`).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-text-primary text-sm">
                        ₩{order.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                  <div className="text-center py-8 text-text-secondary">
                    <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p>최근 주문이 없습니다</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                알림
              </span>
              <Badge variant="secondary" className="rounded-full">
                {stats?.notifications?.filter(n => !n.isRead).length || 0}개
              </Badge>
            </CardTitle>
            <CardDescription>
              새로운 알림이 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.notifications?.slice(0, 5).map((notification) => (
                <div key={notification.id} className={`p-4 rounded-2xl transition-colors ${!notification.isRead ? 'bg-blue-50 border border-blue-100' : 'bg-mist'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl text-white ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-text-primary">
                        {notification.title}
                      </p>
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-foreground/70 mt-2">
                        {new Date(notification.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {(!stats?.notifications || stats.notifications.length === 0) && (
                <div className="text-center py-8 text-text-secondary">
                  <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>새로운 알림이 없습니다</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            인기 상품
          </CardTitle>
          <CardDescription>
            판매량 기준 상위 상품들
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats?.topProducts?.slice(0, 6).map((product, index) => (
              <div key={product.id} className="flex items-center gap-4 p-4 bg-mist rounded-2xl hover:bg-mist/80 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                  index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500' :
                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                      'bg-slate-200 text-obsidian'
                  }`}>
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-text-primary truncate">{product.name}</h3>
                  <p className="text-xs text-text-secondary">
                    {product.sales}개 판매
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-text-primary">
                    ₩{product.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-text-secondary">매출</p>
                </div>
              </div>
            ))}
            {(!stats?.topProducts || stats.topProducts.length === 0) && (
              <div className="col-span-full text-center py-8 text-text-secondary">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>아직 판매된 상품이 없습니다</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

export default function PartnerDashboard() {
  return (
    <PartnerLayout>
      <PartnerDashboardContent />
    </PartnerLayout>
  );
}
