'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Tag,
  Calendar,
  Percent,
  Banknote,
  Truck,
  Download,
  Gift,
  ArrowRight,
  CheckCircle,
  Ticket,
  ChevronRight,
  Info
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
      }
    } catch (error) {
      console.error('쿠폰 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (code: string, couponId: string) => {
    if (!session?.user) {
      alert('인증 프로토콜이 필요합니다. 로그인 페이지로 이동합니다.');
      window.location.href = '/auth/signin';
      return;
    }

    try {
      setDownloadingId(couponId);
      const response = await fetch('/api/coupons/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (response.ok) {
        alert('쿠폰 데이터가 인벤토리에 할당되었습니다.');
        setDownloadedCoupons(prev => new Set(prev).add(couponId));
      } else {
        alert(data.error || '다운로드 실패');
      }
    } catch (error) {
      console.error('다운로드 오류:', error);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCodeDownload = async () => {
    if (!couponCode.trim()) return;
    if (!session?.user) {
      window.location.href = '/auth/signin';
      return;
    }

    try {
      const response = await fetch('/api/coupons/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() })
      });

      const data = await response.json();
      if (response.ok) {
        alert('식별된 코드가 활성화되었습니다.');
        setCouponCode('');
      } else {
        alert(data.error || '활성화 실패');
      }
    } catch (error) {
      console.error('코드 등록 오류:', error);
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
      case 'percentage': return <Percent className="h-6 w-6" />;
      case 'fixed': return <Banknote className="h-6 w-6" />;
      case 'free_shipping': return <Truck className="h-6 w-6" />;
      default: return <Tag className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-mist py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center mb-16">
          <p className="text-chapter-accent font-black uppercase tracking-[0.2em] text-[10px] mb-2">Benefit Procurement</p>
          <h1 className="text-5xl font-black text-obsidian tracking-tighter mb-4">쿠폰 인벤토리 센터</h1>
          <p className="max-w-md text-slate font-medium leading-relaxed">
            유니클레의 회복 프로토콜을 지원하는 다양한 혜택을 확인하십시오.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            {/* 쿠폰 코드 입력 */}
            <Card className="border-none shadow-2xl rounded-[40px] bg-obsidian text-mist overflow-hidden">
              <CardContent className="p-10">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="p-4 bg-white/10 rounded-3xl text-reward-gold shrink-0">
                    <Ticket className="h-8 w-8" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-black tracking-tight mb-1">시크릿 코드 활성화</h3>
                    <p className="text-xs font-medium opacity-50 mb-6 md:mb-0">보유하신 특수 할인 코드를 입력하십시오.</p>
                  </div>
                  <div className="flex w-full md:w-auto gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="CODE-XXXX"
                      className="h-14 bg-white/5 border-white/10 text-mist placeholder:text-white/20 rounded-2xl md:w-48"
                    />
                    <Button onClick={handleCodeDownload} className="h-14 px-8 rounded-2xl bg-reward-gold text-obsidian font-black">
                      활성화
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 쿠폰 목록 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-obsidian tracking-tighter flex items-center gap-2">
                보급 가능한 쿠폰
                <span className="text-xs font-bold text-slate bg-line/30 px-3 py-1 rounded-full">{coupons.length}</span>
              </h2>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-64 rounded-[32px] bg-white animate-pulse" />
                  ))}
                </div>
              ) : coupons.length === 0 ? (
                <Card className="border-dashed border-2 border-line bg-transparent rounded-[40px] p-20 text-center">
                  <Tag className="h-12 w-12 mx-auto text-slate opacity-20 mb-4" />
                  <p className="text-slate font-bold">현재 보급 가능한 쿠폰이 없습니다.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {coupons.map((coupon) => {
                    const isDownloaded = downloadedCoupons.has(coupon._id);
                    const isDownloading = downloadingId === coupon._id;
                    return (
                      <Card key={coupon._id} className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden group hover:shadow-xl transition-all">
                        <div className="p-8 space-y-6">
                          <div className="flex justify-between items-start">
                            <div className="p-4 bg-mist rounded-2xl text-chapter-accent group-hover:bg-chapter-accent group-hover:text-mist transition-colors">
                              {getCouponIcon(coupon.type)}
                            </div>
                            {isDownloaded && (
                              <Badge className="bg-status-good/10 text-status-good border-status-good/20 px-3 font-black text-[9px] uppercase tracking-widest">Downloaded</Badge>
                            )}
                          </div>

                          <div>
                            <h3 className="text-xl font-black text-obsidian tracking-tight line-clamp-1">{coupon.name}</h3>
                            <p className="text-3xl font-black text-chapter-accent tracking-tighter mt-1">
                              {coupon.type === 'percentage' ? `${coupon.value}%` : coupon.type === 'fixed' ? `${coupon.value.toLocaleString()}원` : 'FREE'}
                              <span className="text-xs font-bold text-slate ml-2 opacity-60">OFF</span>
                            </p>
                          </div>

                          <div className="space-y-2 text-[11px] font-bold text-slate">
                            {coupon.minOrderAmount && (
                              <p className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate" /> {coupon.minOrderAmount.toLocaleString()}원 이상 구매 시</p>
                            )}
                            <p className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {coupon.validityType === 'from_download' ? `배급 후 ${coupon.validityDurationDays}일 이내` : `${formatDate(coupon.validUntil)} 까지`}
                            </p>
                          </div>

                          <Button
                            onClick={() => handleDownload(coupon.code, coupon._id)}
                            disabled={isDownloading || isDownloaded}
                            className={`w-full h-14 rounded-2xl font-black text-sm transition-all ${isDownloaded ? 'bg-mist text-slate' : 'bg-obsidian text-mist shadow-lg shadow-obsidian/10'}`}
                          >
                            {isDownloading ? '데이터 전송 중...' : isDownloaded ? '인벤토리 저장됨' : '쿠폰 수령하기'}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            {session?.user && (
              <Card className="border-none shadow-lg rounded-[32px] bg-white overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-lg font-black text-obsidian">내 활성 혜택</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-2">
                  <p className="text-xs font-medium text-slate leading-relaxed mb-6">수령하신 쿠폰은 마이페이지 인벤토리에서 즉시 확인 가능합니다.</p>
                  <Button asChild variant="outline" className="w-full h-12 rounded-xl border-line font-black text-xs hover:bg-mist">
                    <Link href="/me/coupons" className="flex items-center gap-2">
                      내 쿠폰 인벤토리
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="border-none bg-mist/50 rounded-[32px] p-8 space-y-6">
              <div className="flex items-center gap-2 text-chapter-accent">
                <Info className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-widest">Usage Protocol</span>
              </div>
              <ul className="space-y-4">
                {[
                  '쿠폰은 체크아웃 단계에서 1회 적용 가능합니다.',
                  '최소 주문 금액 프로토콜을 준수해야 활성화됩니다.',
                  '유효기간이 경과된 데이터는 자동 소멸됩니다.',
                  '중복 할인은 특정 프로토콜에 의해서만 허용됩니다.'
                ].map((text, i) => (
                  <li key={i} className="text-[11px] font-medium text-slate leading-relaxed flex items-start gap-2">
                    <span className="text-chapter-accent mt-1">•</span>
                    {text}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
