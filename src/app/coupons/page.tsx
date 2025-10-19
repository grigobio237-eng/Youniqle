'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CharacterImage from '@/components/ui/CharacterImage';
import {
  Tag,
  Calendar,
  Percent,
  DollarSign,
  Truck,
  Download,
  Search,
  Gift,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

interface Coupon {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validityType: 'fixed' | 'from_download';
  validFrom: string;
  validUntil: string;
  validityDurationDays?: number;
  remainingUsage?: number;
}

export default function CouponsPage() {
  const { data: session } = useSession();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedCoupons, setDownloadedCoupons] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/coupons?limit=20');
      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons || []);
      } else {
        console.error('쿠폰 목록 조회 실패');
      }
    } catch (error) {
      console.error('쿠폰 목록 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (code: string, couponId: string) => {
    if (!session?.user) {
      alert('로그인이 필요합니다.');
      window.location.href = '/auth/signin';
      return;
    }

    try {
      setDownloadingId(couponId);
      const response = await fetch('/api/coupons/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || '쿠폰이 다운로드되었습니다!');
        setDownloadedCoupons(prev => new Set(prev).add(couponId));
      } else {
        alert(data.error || '쿠폰 다운로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('쿠폰 다운로드 오류:', error);
      alert('쿠폰 다운로드 중 오류가 발생했습니다.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCodeDownload = async () => {
    if (!couponCode.trim()) {
      alert('쿠폰 코드를 입력해주세요.');
      return;
    }

    if (!session?.user) {
      alert('로그인이 필요합니다.');
      window.location.href = '/auth/signin';
      return;
    }

    try {
      const response = await fetch('/api/coupons/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: couponCode.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || '쿠폰이 다운로드되었습니다!');
        setCouponCode('');
      } else {
        alert(data.error || '쿠폰 다운로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('쿠폰 다운로드 오류:', error);
      alert('쿠폰 다운로드 중 오류가 발생했습니다.');
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
        return <Percent className="h-6 w-6" />;
      case 'fixed':
        return <DollarSign className="h-6 w-6" />;
      case 'free_shipping':
        return <Truck className="h-6 w-6" />;
      default:
        return <Tag className="h-6 w-6" />;
    }
  };

  const getCouponValue = (coupon: Coupon) => {
    const { type, value, maxDiscountAmount } = coupon;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20">
              <CharacterImage
                src="/character/youniqle-3.png"
                alt="Youniqle 캐릭터"
                fill
                className="object-contain"
                sizes="80px"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">쿠폰 다운로드 센터</h1>
          <p className="text-xl text-gray-600">
            다양한 쿠폰을 받고 특별한 혜택을 누려보세요!
          </p>
        </div>

        {/* 쿠폰 코드 입력 */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500 to-pink-500">
          <CardContent className="p-6">
            <div className="text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Gift className="h-6 w-6 mr-2" />
                쿠폰 코드가 있으신가요?
              </h3>
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="쿠폰 코드를 입력하세요"
                  className="flex-1 bg-white text-gray-900"
                  onKeyPress={(e) => e.key === 'Enter' && handleCodeDownload()}
                />
                <Button
                  onClick={handleCodeDownload}
                  variant="secondary"
                  size="lg"
                  className="px-8"
                >
                  <Download className="h-5 w-5 mr-2" />
                  등록하기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 내 쿠폰함 링크 */}
        {session?.user && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Tag className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">내 쿠폰함</h3>
                    <p className="text-sm text-gray-600">다운로드한 쿠폰을 확인하세요</p>
                  </div>
                </div>
                <Button asChild variant="outline">
                  <Link href="/me/coupons">
                    쿠폰함 보기
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 쿠폰 목록 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">다운로드 가능한 쿠폰</h2>

          {loading ? (
            <div className="text-center py-12">
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
          ) : coupons.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Tag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  현재 다운로드 가능한 쿠폰이 없습니다
                </h3>
                <p className="text-gray-600">
                  곧 새로운 쿠폰이 등록될 예정이니 기대해주세요!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coupons.map((coupon) => {
                const isDownloaded = downloadedCoupons.has(coupon._id);
                const isDownloading = downloadingId === coupon._id;

                return (
                  <Card key={coupon._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      {/* 쿠폰 헤더 */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
                            {getCouponIcon(coupon.type)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {coupon.name}
                            </h3>
                            {coupon.remainingUsage !== undefined && coupon.remainingUsage !== null && (
                              <p className="text-sm text-gray-600">
                                남은 수량: {coupon.remainingUsage}개
                              </p>
                            )}
                          </div>
                        </div>
                        {isDownloaded && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            다운로드 완료
                          </Badge>
                        )}
                      </div>

                      {/* 할인 금액 */}
                      <div className="mb-4">
                        <p className="text-3xl font-bold text-purple-600">
                          {getCouponValue(coupon)}
                        </p>
                      </div>

                      {/* 쿠폰 설명 */}
                      {coupon.description && (
                        <p className="text-sm text-gray-600 mb-4">
                          {coupon.description}
                        </p>
                      )}

                      {/* 쿠폰 조건 */}
                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        {coupon.minOrderAmount && (
                          <p>• 최소 주문 금액: {coupon.minOrderAmount.toLocaleString()}원</p>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {coupon.validityType === 'from_download' 
                              ? `다운로드 후 ${coupon.validityDurationDays}일` 
                              : `${formatDate(coupon.validFrom)} ~ ${formatDate(coupon.validUntil)}`
                            }
                          </span>
                        </div>
                      </div>

                      {/* 쿠폰 코드 */}
                      <div className="mb-4 p-3 bg-gray-100 rounded-lg text-center">
                        <p className="text-xs text-gray-600 mb-1">쿠폰 코드</p>
                        <code className="font-mono font-bold text-lg text-gray-900">
                          {coupon.code}
                        </code>
                      </div>

                      {/* 다운로드 버튼 */}
                      <Button
                        onClick={() => handleDownload(coupon.code, coupon._id)}
                        disabled={isDownloading || isDownloaded}
                        className="w-full"
                        size="lg"
                      >
                        {isDownloading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            다운로드 중...
                          </>
                        ) : isDownloaded ? (
                          <>
                            <CheckCircle className="h-5 w-5 mr-2" />
                            다운로드 완료
                          </>
                        ) : (
                          <>
                            <Download className="h-5 w-5 mr-2" />
                            쿠폰 받기
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* 안내 사항 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">💡 쿠폰 사용 안내</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• 쿠폰은 다운로드 후 체크아웃 페이지에서 적용할 수 있습니다.</p>
              <p>• 각 쿠폰의 최소 주문 금액 및 유효기간을 확인해주세요.</p>
              <p>• 일부 쿠폰은 특정 상품 또는 카테고리에만 적용됩니다.</p>
              <p>• 쿠폰은 중복 사용이 불가능하며, 주문당 1개만 적용됩니다.</p>
              <p>• 다운로드한 쿠폰은 &apos;내 쿠폰함&apos;에서 확인할 수 있습니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

