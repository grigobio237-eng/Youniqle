'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CharacterImage from '@/components/ui/CharacterImage';
import {
  Tag,
  Calendar,
  Percent,
  DollarSign,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

interface Coupon {
  _id: string;
  userId: string;
  couponId: {
    _id: string;
    code: string;
    name: string;
    description?: string;
    type: 'percentage' | 'fixed' | 'free_shipping';
    value: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    validFrom: string;
    validUntil: string;
  };
  code: string;
  status: 'available' | 'used' | 'expired';
  downloadedAt: string;
  validUntil: string;
  usedAt?: string;
}

interface CouponStats {
  available: number;
  used: number;
  expired: number;
}

export default function MyCouponsPage() {
  const { data: session, status } = useSession();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<CouponStats>({ available: 0, used: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'used' | 'expired'>('all');

  useEffect(() => {
    if (session?.user) {
      fetchCoupons();
    }
  }, [session, activeTab]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== 'all') {
        params.append('status', activeTab);
      }

      const response = await fetch(`/api/me/coupons?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons || []);
        setStats(data.stats || { available: 0, used: 0, expired: 0 });
      } else {
        console.error('쿠폰 목록 조회 실패');
      }
    } catch (error) {
      console.error('쿠폰 목록 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCouponIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-5 w-5" />;
      case 'fixed':
        return <DollarSign className="h-5 w-5" />;
      case 'free_shipping':
        return <Truck className="h-5 w-5" />;
      default:
        return <Tag className="h-5 w-5" />;
    }
  };

  const getCouponValue = (coupon: Coupon) => {
    const { type, value, maxDiscountAmount } = coupon.couponId;
    switch (type) {
      case 'percentage':
        return `${value}% 할인${maxDiscountAmount ? ` (최대 ${maxDiscountAmount.toLocaleString()}원)` : ''}`;
      case 'fixed':
        return `${value.toLocaleString()}원 할인`;
      case 'free_shipping':
        return '무료 배송';
      default:
        return '';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">사용 가능</Badge>;
      case 'used':
        return <Badge className="bg-gray-100 text-gray-800">사용 완료</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">만료됨</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'used':
        return <Clock className="h-5 w-5 text-gray-600" />;
      case 'expired':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CharacterImage
            src="/character/youniqle-1.png"
            alt="로딩 중"
            width={64}
            height={64}
            className="w-16 h-16 mx-auto mb-4 animate-bounce"
            sizes="64px"
          />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
            <p className="text-gray-600 mb-6">
              쿠폰함을 확인하려면 로그인해주세요.
            </p>
            <Button asChild>
              <Link href="/auth/signin">로그인하기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" asChild>
              <Link href="/me">
                <ArrowLeft className="h-4 w-4 mr-2" />
                마이페이지로 돌아가기
              </Link>
            </Button>
            <Button variant="outline" onClick={fetchCoupons}>
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </Button>
          </div>
          
          <div className="flex items-center mb-2">
            <Tag className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">내 쿠폰함</h1>
          </div>
          <p className="text-xl text-gray-600">보유한 쿠폰을 확인하고 사용하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">사용 가능</p>
                  <p className="text-3xl font-bold text-green-600">{stats.available}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">사용 완료</p>
                  <p className="text-3xl font-bold text-gray-600">{stats.used}</p>
                </div>
                <Clock className="h-12 w-12 text-gray-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">만료됨</p>
                  <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
                </div>
                <XCircle className="h-12 w-12 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 쿠폰 다운로드 센터 링크 */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <h3 className="text-xl font-bold mb-2">쿠폰 다운로드 센터</h3>
                <p className="text-blue-100">다양한 쿠폰을 다운로드하고 혜택을 누려보세요!</p>
              </div>
              <Button asChild variant="secondary" size="lg">
                <Link href="/coupons">
                  쿠폰 받기
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 쿠폰 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>쿠폰 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="all">전체 ({stats.available + stats.used + stats.expired})</TabsTrigger>
                <TabsTrigger value="available">사용 가능 ({stats.available})</TabsTrigger>
                <TabsTrigger value="used">사용 완료 ({stats.used})</TabsTrigger>
                <TabsTrigger value="expired">만료됨 ({stats.expired})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {coupons.length === 0 ? (
                  <div className="text-center py-12">
                    <Tag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      {activeTab === 'all' ? '보유한 쿠폰이 없습니다' :
                       activeTab === 'available' ? '사용 가능한 쿠폰이 없습니다' :
                       activeTab === 'used' ? '사용한 쿠폰이 없습니다' :
                       '만료된 쿠폰이 없습니다'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      쿠폰 다운로드 센터에서 다양한 쿠폰을 받아보세요!
                    </p>
                    <Button asChild>
                      <Link href="/coupons">쿠폰 다운로드</Link>
                    </Button>
                  </div>
                ) : (
                  coupons.map((coupon) => (
                    <Card key={coupon._id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            {/* 쿠폰 아이콘 */}
                            <div className={`p-4 rounded-lg ${
                              coupon.status === 'available' ? 'bg-green-100 text-green-600' :
                              coupon.status === 'used' ? 'bg-gray-100 text-gray-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {getCouponIcon(coupon.couponId.type)}
                            </div>

                            {/* 쿠폰 정보 */}
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h3 className="text-lg font-bold text-gray-900 mr-3">
                                  {coupon.couponId.name}
                                </h3>
                                {getStatusBadge(coupon.status)}
                              </div>
                              
                              <p className="text-2xl font-bold text-blue-600 mb-2">
                                {getCouponValue(coupon)}
                              </p>

                              {coupon.couponId.description && (
                                <p className="text-sm text-gray-600 mb-3">
                                  {coupon.couponId.description}
                                </p>
                              )}

                              {/* 쿠폰 코드 */}
                              <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-lg mb-3">
                                <Tag className="h-4 w-4 mr-2 text-gray-600" />
                                <code className="font-mono font-bold text-gray-900">
                                  {coupon.code}
                                </code>
                              </div>

                              {/* 쿠폰 조건 */}
                              <div className="space-y-1 text-sm text-gray-600">
                                {coupon.couponId.minOrderAmount && (
                                  <p>• 최소 주문 금액: {coupon.couponId.minOrderAmount.toLocaleString()}원</p>
                                )}
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span>유효기간: {formatDate(coupon.downloadedAt)} ~ {formatDate(coupon.validUntil)}</span>
                                  </div>
                                </div>
                                {coupon.usedAt && (
                                  <p className="text-gray-500">
                                    사용일: {formatDate(coupon.usedAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 상태 아이콘 */}
                          <div className="ml-4">
                            {getStatusIcon(coupon.status)}
                          </div>
                        </div>

                        {/* 사용하기 버튼 */}
                        {coupon.status === 'available' && (
                          <div className="mt-4 pt-4 border-t">
                            <Button asChild className="w-full" size="lg">
                              <Link href="/products">
                                쿠폰 사용하러 가기
                              </Link>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

