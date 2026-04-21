'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import CharacterImage from '@/components/ui/CharacterImage';
import UnifiedAddressSearch from '@/components/ui/UnifiedAddressSearch';
import {
  CreditCard,
  Truck,
  MapPin,
  ArrowLeft,
  ShoppingCart,
  CheckCircle,
  Tag,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Package,
  Star
} from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    slug: string;
  };
  quantity: number;
  price: number;
  addedAt: string;
}

interface Cart {
  _id: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

function CheckoutPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 배송지 정보
  const [shippingAddress, setShippingAddress] = useState({
    recipient: '',
    phone: '',
    zipCode: '',
    address1: '',
    address2: '',
    memo: '',
    shippingMethod: 'standard', // 배송 방법
    shippingRequest: '' // 배송 요청사항
  });

  // 결제 정보
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false
  });

  // 쿠폰 관련
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // 포인트 관련
  const [userPoints, setUserPoints] = useState(0);
  const [userGrade, setUserGrade] = useState<string>('cedar');
  const [usePoints, setUsePoints] = useState(0);
  const [pointsError, setPointsError] = useState('');
  const [expectedEarnPoints, setExpectedEarnPoints] = useState<number>(0);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const mobileRegex = /android|iphone|ipad|ipod|windows phone|blackberry/i;
      setIsMobileDevice(mobileRegex.test(navigator.userAgent));
    }
  }, []);

  // 사용자 정보 로드
  useEffect(() => {
    if (session?.user) {
      setShippingAddress(prev => ({
        ...prev,
        recipient: session.user?.name || '',
        phone: (session.user as any)?.phone || ''
      }));
    }
  }, [session]);

  // 사용자 포인트/등급 로드
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/auth/me', {
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            const u = data.user || data;
            setUserPoints(u.points || 0);
            setUserGrade(u.grade || 'cedar');
          }
        } catch (error) {
          console.error('사용자 포인트 로드 오류:', error);
        }
      }
    };

    fetchUserPoints();
  }, [session]);

  // 사용 가능한 쿠폰 목록 로드
  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      if (!session?.user || !cart) return;

      setLoadingCoupons(true);
      try {
        const response = await fetch('/api/me/coupons?status=available', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          const usableCoupons = (data.coupons || []).filter((uc: any) => {
            const coupon = uc.couponId || uc;
            const minAmount = coupon.minOrderAmount || 0;
            return cart.totalAmount >= minAmount;
          });
          setAvailableCoupons(usableCoupons);
        }
      } catch (error) {
        console.error('사용 가능한 쿠폰 로드 오류:', error);
      } finally {
        setLoadingCoupons(false);
      }
    };

    if (status === 'authenticated' && cart) {
      fetchAvailableCoupons();
    }
  }, [session, cart, status]);

  // 예상 적립 포인트 계산
  useEffect(() => {
    if (!cart) return;
    const earnRateMap: Record<string, number> = {
      cedar: 0.01,
      rooter: 0.015,
      bloomer: 0.02,
      glower: 0.025,
      ecosoul: 0.03,
    };
    const rate = earnRateMap[userGrade] ?? earnRateMap.cedar;
    const baseAmount = Math.max(0, cart.totalAmount - (couponDiscount || 0) - (usePoints || 0));
    const expected = Math.floor(baseAmount * rate);
    setExpectedEarnPoints(expected);
  }, [cart, couponDiscount, usePoints, userGrade]);

  // 장바구니 데이터 로드
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const productId = searchParams?.get('product');
        const quantity = searchParams?.get('quantity');

        if (productId && quantity) {
          // Navigator Pass와 같은 가상 상품 처리
          if (productId.startsWith('navigator-')) {
            const name = searchParams?.get('name') || 'Navigator Pass';
            const price = parseInt(searchParams?.get('price') || '0');

            const tempCart: Cart = {
              _id: 'temp-founder',
              items: [{
                _id: 'temp-navigator-item',
                productId: {
                  _id: productId, // 가상 ID 사용
                  name: name,
                  price: price,
                  images: ['/images/navigator-pass-badge.png'], // 기본 이미지 또는 적절한 경로
                  slug: productId
                },
                quantity: parseInt(quantity),
                price: price,
                addedAt: new Date().toISOString()
              }],
              totalItems: parseInt(quantity),
              totalAmount: price * parseInt(quantity)
            };
            setCart(tempCart);
            setLoading(false);
            return;
          }

          const productResponse = await fetch(`/api/products/${productId}`, {
            credentials: 'include',
          });

          if (productResponse.ok) {
            const product = await productResponse.json();

            const tempCart: Cart = {
              _id: 'temp',
              items: [{
                _id: 'temp-item',
                productId: {
                  _id: product.product._id,
                  name: product.product.name,
                  price: product.product.price,
                  images: product.product.images || [],
                  slug: product.product.slug || ''
                },
                quantity: parseInt(quantity),
                price: product.product.price,
                addedAt: new Date().toISOString()
              }],
              totalItems: parseInt(quantity),
              totalAmount: product.product.price * parseInt(quantity)
            };
            setCart(tempCart);
          }
        } else {
          const response = await fetch('/api/cart', {
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            const selectedIds = searchParams?.get('selectedItems');

            if (data.cart && data.cart.items) {
              if (selectedIds) {
                const selectedIdArray = selectedIds.split(',');
                const filteredItems = (data.cart.items || [])
                  .filter((item: CartItem) => item && selectedIdArray.includes(item._id));

                const filteredCart = {
                  ...data.cart,
                  items: filteredItems,
                  totalItems: filteredItems.reduce((sum: number, item: CartItem) => sum + (item?.quantity || 0), 0),
                  totalAmount: filteredItems.reduce((sum: number, item: CartItem) => sum + ((item?.price || 0) * (item?.quantity || 0)), 0)
                };

                setCart(filteredCart);
              } else {
                setCart(data.cart);
              }
            } else {
              setCart({ items: [], totalItems: 0, totalAmount: 0 } as any);
            }
          }
        }
      } catch (error) {
        console.error('데이터 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchCart();
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/checkout');
    }
  }, [status, router, searchParams]);

  const handleShippingChange = (field: string, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAgreementChange = (field: string, checked: boolean) => {
    setAgreements(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    if (!cart || cart.items.length === 0) return;

    try {
      setValidatingCoupon(true);
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          cartItems: cart?.items || [],
          totalAmount: cart?.totalAmount || 0
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAppliedCoupon(data.coupon);
        setCouponDiscount(data.discountAmount || 0);
        setCouponCode('');
      } else {
        alert(data.error || '쿠폰 적용에 실패했습니다.');
      }
    } catch (error) {
      console.error('쿠폰 검증 오류:', error);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleSelectCoupon = async (couponCode: string) => {
    if (couponCode === 'none') {
      handleRemoveCoupon();
      return;
    }

    setCouponCode(couponCode);
    setValidatingCoupon(true);
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          cartItems: (cart?.items || []).filter(item => item && item.productId),
          totalAmount: cart?.totalAmount || 0
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAppliedCoupon(data.coupon);
        setCouponDiscount(data.discountAmount || 0);
        setCouponCode('');
      } else {
        alert(data.error || '쿠폰 적용에 실패했습니다.');
        setCouponCode('');
      }
    } catch (error) {
      console.error('쿠폰 검증 오류:', error);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
  };

  const handleUsePoints = (value: number) => {
    setUsePoints(value);
    setPointsError('');

    if (value > userPoints) {
      setPointsError('보유 포인트보다 많이 사용할 수 없습니다.');
      return;
    }

    if (cart) {
      const subtotalAfterCoupon = cart.totalAmount - couponDiscount;
      const maxUsable = Math.floor(subtotalAfterCoupon * 0.5);
      const MIN_UNIT = 10;

      if (value > maxUsable) {
        setPointsError(`포인트는 주문 금액의 50%까지만 사용 가능합니다. (최대 ${maxUsable}P)`);
        return;
      }

      if (value > 0 && value % MIN_UNIT !== 0) {
        setPointsError(`포인트는 ${MIN_UNIT}P 단위로만 사용할 수 있습니다.`);
        return;
      }
    }
  };

  const handleOrder = async () => {
    if (!cart || !cart.items || cart.items.length === 0) return;

    if (!shippingAddress.recipient || !shippingAddress.phone || !shippingAddress.address1) {
      alert('모든 필수 정보를 입력해주세요.');
      return;
    }

    if (!agreements.terms || !agreements.privacy) {
      alert('필수 약관에 동의하셔야 결제가 가능합니다.');
      return;
    }

    setSubmitting(true);

    try {
      const currentDeliveryFee = (cart?.totalAmount || 0) >= 50000 ? 0 : shippingAddress.shippingMethod === 'express' ? 5000 : 3000;
      const subtotalAfterCoupon = (cart?.totalAmount || 0) - couponDiscount;
      const totalAmountToPay = subtotalAfterCoupon + currentDeliveryFee - usePoints;

      const orderData = {
        items: (cart?.items || [])
          .filter(item => item && item.productId)
          .map(item => ({
            productId: item.productId?._id,
            name: item.productId?.name || '정보 없음',
            price: item.price || 0,
            quantity: item.quantity || 0
          })),
        shippingAddress: {
          label: '기본 배송지',
          recipient: shippingAddress.recipient,
          phone: shippingAddress.phone,
          zip: shippingAddress.zipCode,
          addr1: shippingAddress.address1,
          addr2: shippingAddress.address2,
          memo: shippingAddress.memo,
          shippingMethod: shippingAddress.shippingMethod,
          shippingRequest: shippingAddress.shippingRequest
        },
        paymentMethod: paymentMethod,
        totalAmount: totalAmountToPay,
        usedPoints: usePoints,
        couponDiscount: couponDiscount
      };

      if (!session?.user?.email) {
        router.push('/auth/signin');
        return;
      }

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        alert(error.error || '주문 생성 중 오류가 발생했습니다.');
        setSubmitting(false);
        return;
      }

      const orderResult = await orderResponse.json();
      const order = orderResult.order;

      const paymentData = {
        orderId: order.orderNumber || order._id,
        amount: totalAmountToPay,
        productName: (cart?.items?.length || 0) === 1
          ? cart?.items?.[0]?.productId?.name || '정보 없음'
          : `${cart?.items?.[0]?.productId?.name || '정보 없음'} 외 ${(cart?.items?.length || 0) - 1}건`,
        buyerName: shippingAddress.recipient,
        buyerEmail: session?.user?.email || '',
        buyerTel: shippingAddress.phone,
        payMethod: paymentMethod,
        goodsClass: '1',
        transactionType: '0',
        reqReserved: JSON.stringify({
          orderId: order.orderNumber || order._id,
          userId: (session.user as any).id || '',
          email: session?.user?.email || '',
        }),
      };

      const paymentResponse = await fetch('/api/payment/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(paymentData),
      });

      const paymentResult = await paymentResponse.json();

      if (paymentResult.success) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = paymentResult.authUrl;
        form.acceptCharset = 'euc-kr';

        Object.entries(paymentResult.formData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        throw new Error(paymentResult.error || '결제 요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('주문 처리 오류:', error);
      alert('주문 처리 중 오류가 발생했습니다.');
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-mist flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chapter-accent mx-auto mb-4"></div>
          <p className="text-slate font-bold uppercase tracking-widest text-xs">Processing Security</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-mist flex items-center justify-center px-4">
        <div className="text-center bg-white p-12 rounded-[40px] shadow-xl max-w-md w-full">
          <div className="w-20 h-20 bg-mist rounded-[24px] flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner">🛒</div>
          <h2 className="text-2xl font-black text-obsidian tracking-tight mb-2">장바구니가 비어있습니다</h2>
          <p className="text-slate font-medium mb-8">상품을 장바구니에 담아주세요.</p>
          <Button asChild className="w-full h-14 rounded-2xl bg-obsidian text-mist font-black shadow-lg">
            <Link href="/products">회복 아이템 보러가기</Link>
          </Button>
        </div>
      </div>
    );
  }

  const deliveryFee = cart.totalAmount >= 50000 ? 0 : shippingAddress.shippingMethod === 'express' ? 5000 : 3000;
  const subtotalAfterCoupon = cart.totalAmount - couponDiscount;
  const totalAmount = Math.max(0, subtotalAfterCoupon + deliveryFee - usePoints);

  return (
    <div className="min-h-screen bg-mist py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <Button variant="ghost" asChild className="p-0 hover:bg-transparent text-slate hover:text-obsidian mb-4">
                <Link href="/cart" className="flex items-center gap-2 font-bold">
                  <ArrowLeft className="h-4 w-4" />
                  장바구니로 돌아가기
                </Link>
              </Button>
              <h1 className="text-4xl font-black text-obsidian tracking-tighter">CHECKOUT</h1>
              <p className="text-slate font-bold uppercase tracking-widest text-xs mt-1">Order Execution Protocol</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 opacity-30">
                <div className="w-3 h-3 rounded-full bg-slate" />
                <span className="text-[10px] font-black uppercase tracking-widest">Cart</span>
              </div>
              <div className="h-px w-8 bg-line" />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chapter-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-chapter-accent">Payment</span>
              </div>
              <div className="h-px w-8 bg-line" />
              <div className="flex items-center gap-2 opacity-30">
                <div className="w-3 h-3 rounded-full bg-slate" />
                <span className="text-[10px] font-black uppercase tracking-widest">Done</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            {/* 배송 정보 */}
            <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white hover:shadow-md transition-shadow">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="flex items-center text-xl font-black text-obsidian">
                  <MapPin className="h-5 w-5 mr-3 text-chapter-accent" />
                  배송 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="recipient" className="font-bold text-slate">받는 사람 *</Label>
                    <Input
                      id="recipient"
                      value={shippingAddress.recipient}
                      onChange={(e) => handleShippingChange('recipient', e.target.value)}
                      className="h-12 rounded-xl bg-mist/50 border-line focus:ring-chapter-accent"
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-bold text-slate">연락처 *</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => handleShippingChange('phone', e.target.value)}
                      className="h-12 rounded-xl bg-mist/50 border-line"
                      placeholder="010-1234-5678"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="font-bold text-slate">주소 *</Label>
                  <UnifiedAddressSearch
                    provider="google"
                    onAddressSelect={(address) => {
                      setShippingAddress(prev => ({
                        ...prev,
                        zipCode: address.zonecode,
                        address1: address.address
                      }));
                    }}
                  />
                  <div className="flex gap-2">
                    <Input
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleShippingChange('zipCode', e.target.value)}
                      placeholder="우편번호"
                      className="w-32 h-12 rounded-xl bg-mist/50 border-line"
                    />
                    <Input
                      value={shippingAddress.address1}
                      onChange={(e) => handleShippingChange('address1', e.target.value)}
                      placeholder="도로명주소"
                      className="flex-1 h-12 rounded-xl bg-mist/50 border-line"
                    />
                  </div>
                  <Input
                    value={shippingAddress.address2}
                    onChange={(e) => handleShippingChange('address2', e.target.value)}
                    placeholder="상세주소를 입력하세요"
                    className="h-12 rounded-xl bg-mist/50 border-line"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="shippingMethod" className="font-bold text-slate">배송 방법</Label>
                    <Select
                      value={shippingAddress.shippingMethod}
                      onValueChange={(value) => handleShippingChange('shippingMethod', value)}
                    >
                      <SelectTrigger className="h-12 rounded-xl bg-mist/50 border-line">
                        <SelectValue placeholder="배송 방법 선택" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-line">
                        <SelectItem value="standard" className="rounded-lg">일반 배송 (1-2일) - 3,000원</SelectItem>
                        <SelectItem value="nextday" className="rounded-lg">익일 배송 - 3,000원</SelectItem>
                        <SelectItem value="express" className="rounded-lg">당일 배송 - 5,000원</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingRequest" className="font-bold text-slate">배송 요청사항</Label>
                    <Select
                      value={shippingAddress.shippingRequest}
                      onValueChange={(value) => handleShippingChange('shippingRequest', value)}
                    >
                      <SelectTrigger className="h-12 rounded-xl bg-mist/50 border-line">
                        <SelectValue placeholder="요청사항 선택" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-line">
                        <SelectItem value="" className="rounded-lg">선택 안 함</SelectItem>
                        <SelectItem value="door" className="rounded-lg">문 앞에 놓아주세요</SelectItem>
                        <SelectItem value="security" className="rounded-lg">경비실에 맡겨주세요</SelectItem>
                        <SelectItem value="delivery-box" className="rounded-lg">택배함에 넣어주세요</SelectItem>
                        <SelectItem value="call" className="rounded-lg">배송 전 연락 부탁드립니다</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 결제 방법 */}
            <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="flex items-center text-xl font-black text-obsidian">
                  <CreditCard className="h-5 w-5 mr-3 text-chapter-accent" />
                  결제 방법
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`flex items-center space-x-3 p-5 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === 'card' ? 'border-chapter-accent bg-chapter-accent/5' : 'border-mist bg-mist/30 hover:bg-mist/50'}`}>
                    <RadioGroupItem value="card" id="card" className="border-slate data-[state=checked]:bg-chapter-accent data-[state=checked]:border-chapter-accent" />
                    <Label htmlFor="card" className="flex items-center font-black text-obsidian cursor-pointer">
                      신용/체크카드
                    </Label>
                  </div>
                </RadioGroup>
                {!isMobileDevice && (
                  <Alert className="mt-8 border-none bg-status-amber/5 rounded-2xl">
                    <AlertCircle className="h-4 w-4 text-status-amber" />
                    <AlertDescription className="text-xs font-medium text-status-amber leading-relaxed">
                      PC 환경에서는 앱 카드 결제 시 일부 제한이 있을 수 있습니다. 수기 카드 정보 입력 혹은 간편결제를 권장합니다.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* 쿠폰 & 포인트 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="flex items-center text-lg font-black text-obsidian">
                    <Tag className="h-5 w-5 mr-3 text-chapter-accent" />
                    쿠폰 할인
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-4">
                  {appliedCoupon ? (
                    <div className="p-5 rounded-2xl bg-status-good/5 border border-status-good/20 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black text-status-good uppercase tracking-widest">Active Coupon</span>
                        <Button variant="ghost" size="sm" onClick={handleRemoveCoupon} className="h-6 px-2 text-[10px] font-bold text-status-danger hover:bg-status-danger/10">제거</Button>
                      </div>
                      <p className="font-bold text-obsidian leading-tight">{appliedCoupon.name}</p>
                      <p className="text-xl font-black text-status-good">-{couponDiscount.toLocaleString()}원</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {availableCoupons.length > 0 && (
                        <Select value={appliedCoupon?.couponId?.code || ""} onValueChange={handleSelectCoupon}>
                          <SelectTrigger className="h-12 rounded-xl bg-mist/50 border-line">
                            <SelectValue placeholder="사용 가능한 쿠폰" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {availableCoupons.map((uc: any) => (
                              <SelectItem key={uc._id} value={uc.couponId.code || uc.code}>
                                {uc.couponId.name || uc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="쿠폰 코드 입력"
                          className="h-12 rounded-xl bg-mist/50 border-line"
                        />
                        <Button onClick={handleApplyCoupon} disabled={validatingCoupon} className="h-12 px-6 rounded-xl bg-obsidian text-mist font-black">적용</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="flex items-center text-lg font-black text-obsidian">
                    <Star className="h-5 w-5 mr-3 text-reward-gold" />
                    포인트 사용
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate">보유 포인트</span>
                    <span className="font-black text-obsidian">{userPoints.toLocaleString()}P</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={usePoints || ''}
                      onChange={(e) => handleUsePoints(Number(e.target.value))}
                      placeholder="얼마를 사용할까요?"
                      className="h-12 rounded-xl bg-mist/50 border-line"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const maxUsable = Math.min(Math.floor((cart.totalAmount - couponDiscount) * 0.5), userPoints);
                        handleUsePoints(Math.floor(maxUsable / 10) * 10);
                      }}
                      className="h-12 px-4 rounded-xl border-line font-black text-xs"
                    >
                      최대
                    </Button>
                  </div>
                  {pointsError && <p className="text-[10px] font-bold text-status-danger mt-1">{pointsError}</p>}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8 sticky top-24">
            {/* 주문 요약 */}
            <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-obsidian text-mist">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="flex items-center text-xl font-black">
                  <Package className="h-5 w-5 mr-3 text-reward-gold" />
                  최종 주문 확인
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                  {(cart?.items || [])
                    .filter(item => item && item._id)
                    .map((item) => (
                      <div key={item._id} className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-lg bg-white/10 flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                          {item.productId?.images?.[0] ? (
                            <Image
                              src={(item.productId?.images?.[0] as any)?.url || item.productId?.images?.[0]}
                              alt={item.productId?.name || '상품'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Package className="h-4 w-4 text-white opacity-20" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold line-clamp-1">{item.productId?.name || '정보 없음'}</p>
                          <p className="text-[10px] opacity-50 font-medium">{item.quantity}개 / {((item.price || 0) * (item.quantity || 0)).toLocaleString()}원</p>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="h-px bg-white/10" />

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-60">상품 합계</span>
                    <span className="font-bold">{cart.totalAmount.toLocaleString()}원</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="opacity-60">쿠폰 할인</span>
                      <span className="font-bold text-status-danger">-{couponDiscount.toLocaleString()}원</span>
                    </div>
                  )}
                  {usePoints > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="opacity-60">포인트 사용</span>
                      <span className="font-bold text-status-danger">-{usePoints.toLocaleString()}P</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="opacity-60">배송비</span>
                    <span className="font-bold">{deliveryFee > 0 ? `${deliveryFee.toLocaleString()}원` : '무료'}</span>
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-widest opacity-40">Final Amount</span>
                    <span className="text-3xl font-black text-reward-gold tracking-tighter">
                      {totalAmount.toLocaleString()}원
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 transition-colors">
                      <Checkbox
                        id="terms"
                        checked={agreements.terms}
                        onCheckedChange={(c) => handleAgreementChange('terms', c as boolean)}
                        className="mt-1 border-white/20 data-[state=checked]:bg-reward-gold data-[state=checked]:border-reward-gold"
                      />
                      <label htmlFor="terms" className="text-[10px] font-medium opacity-60 leading-relaxed cursor-pointer">
                        (필수) 주문 상품 정보 및 결제 조건에 동의합니다.
                      </label>
                    </div>
                    <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 transition-colors">
                      <Checkbox
                        id="privacy"
                        checked={agreements.privacy}
                        onCheckedChange={(c) => handleAgreementChange('privacy', c as boolean)}
                        className="mt-1 border-white/20 data-[state=checked]:bg-reward-gold data-[state=checked]:border-reward-gold"
                      />
                      <label htmlFor="privacy" className="text-[10px] font-medium opacity-60 leading-relaxed cursor-pointer">
                        (필수) 개인정보 제3자 제공 및 수집 이용에 동의합니다.
                      </label>
                    </div>
                  </div>

                  <Button
                    onClick={handleOrder}
                    disabled={submitting}
                    className="w-full h-18 rounded-2xl bg-reward-gold text-obsidian font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-reward-gold/10"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-obsidian"></div>
                    ) : (
                      <>
                        결제하기
                        <ChevronRight className="w-6 h-6" />
                      </>
                    )}
                  </Button>

                  {expectedEarnPoints > 0 && (
                    <p className="text-center text-[10px] font-bold text-reward-gold animate-pulse">
                      결제 시 {expectedEarnPoints.toLocaleString()}P가 적립될 예정입니다.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white rounded-[32px] overflow-hidden p-6 space-y-4">
              <div className="flex items-center gap-2 text-status-good">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-widest">Safe Protocol Active</span>
              </div>
              <p className="text-[10px] text-slate font-medium leading-relaxed">
                나이스페이의 SSL 보안 결제 기술이 적용되어 귀하의 금융 정보를 안전하게 보호합니다.
              </p>
            </Card>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-mist flex items-center justify-center">
        <div className="text-center font-black text-obsidian tracking-tighter opacity-10">LOADING PROTOCOL</div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
