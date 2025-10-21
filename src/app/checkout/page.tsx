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
import CharacterImage from '@/components/ui/CharacterImage';
import GoogleAddressSearch from '@/components/ui/GoogleAddressSearch';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  ArrowLeft,
  ShoppingCart,
  CheckCircle,
  Tag
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
  const { t } = useLanguage();
  
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
    memo: ''
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

  // 포인트 관련
  const [userPoints, setUserPoints] = useState(0);
  const [userGrade, setUserGrade] = useState<string>('cedar');
  const [usePoints, setUsePoints] = useState(0);
  const [pointsError, setPointsError] = useState('');
  const [expectedEarnPoints, setExpectedEarnPoints] = useState<number>(0);

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

  // 예상 적립 포인트 계산 (등급별 적립률, 배송비/포인트/쿠폰 제외 금액 기준)
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
        // URL 파라미터에서 바로 구매하기 상품 정보 확인
        const productId = searchParams?.get('product');
        const quantity = searchParams?.get('quantity');
        
        if (productId && quantity) {
          // 바로 구매하기: 상품 정보를 가져와서 임시 장바구니 생성
          console.log('바로 구매하기 - 상품 ID:', productId, '수량:', quantity);
          const productResponse = await fetch(`/api/products/${productId}`, {
            credentials: 'include', // NextAuth 세션 쿠키 포함
          });
          console.log('상품 API 응답 상태:', productResponse.status);
          
          if (productResponse.ok) {
            const product = await productResponse.json();
            console.log('상품 데이터:', product);
            
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
            console.log('생성된 임시 장바구니:', tempCart);
            setCart(tempCart);
          } else {
            const errorText = await productResponse.text();
            console.error('상품 정보 로드 실패:', productResponse.status, errorText);
          }
        } else {
          // 일반 장바구니에서 온 경우
          const response = await fetch('/api/cart', {
            credentials: 'include', // NextAuth 세션 쿠키 포함
          });
          if (response.ok) {
            const data = await response.json();
            
            // 선택된 상품 ID들 확인
            const selectedIds = searchParams?.get('selectedItems');
            
            if (selectedIds) {
              // 선택된 상품만 필터링
              const selectedIdArray = selectedIds.split(',');
              const filteredItems = data.cart.items.filter((item: CartItem) => 
                selectedIdArray.includes(item._id)
              );
              
              const filteredCart = {
                ...data.cart,
                items: filteredItems,
                totalItems: filteredItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),
                totalAmount: filteredItems.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0)
              };
              
              setCart(filteredCart);
            } else {
              // 선택 정보가 없으면 전체 장바구니
              setCart(data.cart);
            }
          } else {
            console.error('장바구니 로드 실패');
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

  // 배송지 정보 변경 핸들러
  const handleShippingChange = (field: string, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 약관 동의 핸들러
  const handleAgreementChange = (field: string, checked: boolean) => {
    setAgreements(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  // 쿠폰 적용
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      alert('쿠폰 코드를 입력해주세요.');
      return;
    }

    if (!cart || cart.items.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }

    try {
      setValidatingCoupon(true);
      const response = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          cartItems: cart.items,
          totalAmount: cart.totalAmount
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAppliedCoupon(data.coupon);
        setCouponDiscount(data.discountAmount || 0);
        alert('쿠폰이 적용되었습니다!');
      } else {
        alert(data.error || '쿠폰 적용에 실패했습니다.');
      }
    } catch (error) {
      console.error('쿠폰 검증 오류:', error);
      alert('쿠폰 검증 중 오류가 발생했습니다.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  // 쿠폰 제거
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
  };

  // 포인트 사용 핸들러
  const handleUsePoints = (value: number) => {
    setUsePoints(value);
    setPointsError('');
    
    if (value > userPoints) {
      setPointsError('보유 포인트보다 많이 사용할 수 없습니다.');
      return;
    }
    
    if (cart) {
      const deliveryFee = cart.totalAmount >= 50000 ? 0 : 3000;
      const subtotalAfterCoupon = cart.totalAmount - couponDiscount;
      const maxUsable = Math.floor(subtotalAfterCoupon * 0.5); // 최대 50% 사용 가능
      const MIN_UNIT = 10; // 최소 사용 단위
      
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

  // 포인트 사용 제거
  const handleRemovePoints = () => {
    setUsePoints(0);
    setPointsError('');
  };

  // 주문 처리 및 나이스페이 결제
  const handleOrder = async () => {
    if (!cart || cart.items.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }

    // 필수 정보 검증
    if (!shippingAddress.recipient || !shippingAddress.phone || !shippingAddress.address1) {
      alert(t('checkout.fillAllFields'));
      return;
    }

    if (!agreements.terms || !agreements.privacy) {
      alert(t('checkout.agreeRequired'));
      return;
    }

    setSubmitting(true);

    try {
      // 1단계: 주문 생성
      const deliveryFee = cart.totalAmount >= 50000 ? 0 : 3000;
      const subtotalAfterCoupon = cart.totalAmount - couponDiscount;
      const totalAmount = subtotalAfterCoupon + deliveryFee - usePoints; // 포인트 사용 반영
      
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.productId._id,
          name: item.productId.name,
          price: item.price,
          quantity: item.quantity
        })),
        shippingAddress: {
          label: '기본 배송지',
          recipient: shippingAddress.recipient,
          phone: shippingAddress.phone,
          zip: shippingAddress.zipCode,
          addr1: shippingAddress.address1,
          addr2: shippingAddress.address2
        },
        paymentMethod: paymentMethod,
        totalAmount: totalAmount,
        usedPoints: usePoints, // 사용한 포인트 추가
        couponDiscount: couponDiscount // 쿠폰 할인 추가
      };

      // NextAuth 세션 확인 (JWT 토큰 대신 세션 사용)
      if (!session?.user?.email) {
        alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        router.push('/auth/signin');
        return;
      }

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // NextAuth 세션 쿠키 포함
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

      console.log('주문 생성 결과:', order);

      // 2단계: 나이스페이 결제 요청
      const paymentData = {
        orderId: order.orderNumber || order._id,
        amount: totalAmount,
        productName: cart.items.length === 1 
          ? cart.items[0].productId.name 
          : `${cart.items[0].productId.name} 외 ${cart.items.length - 1}건`,
        buyerName: shippingAddress.recipient,
        buyerEmail: session?.user?.email || '',
        buyerTel: shippingAddress.phone,
      };

      console.log('나이스페이 결제 요청 데이터:', paymentData);

      const paymentResponse = await fetch('/api/payment/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // NextAuth 세션 쿠키 포함
        body: JSON.stringify(paymentData),
      });

      const paymentResult = await paymentResponse.json();

      if (paymentResult.success) {
        // 3단계: 나이스페이 결제 페이지로 리다이렉트
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = paymentResult.authUrl;
        form.acceptCharset = 'utf-8'; // UTF-8 인코딩 명시
        
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CharacterImage
            src="/character/youniqle-1.png"
            alt="장바구니가 비어있음"
            width={64}
            height={64}
            className="w-16 h-16 mx-auto mb-4"
            sizes="64px"
          />
          <h2 className="text-xl font-semibold mb-2">장바구니가 비어있습니다</h2>
          <p className="text-gray-600 mb-4">상품을 장바구니에 담아주세요.</p>
          <Button asChild>
            <Link href="/products">쇼핑하러 가기</Link>
          </Button>
        </div>
      </div>
    );
  }

  const deliveryFee = cart.totalAmount >= 50000 ? 0 : 3000;
  const subtotalAfterCoupon = cart.totalAmount - couponDiscount;
  const totalAmount = subtotalAfterCoupon + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button variant="ghost" asChild className="mr-4">
              <Link href="/cart">
                <ArrowLeft className="h-4 w-4 mr-2" />
                장바구니로 돌아가기
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">주문/결제</h1>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ShoppingCart className="h-4 w-4 mr-2" />
            <span>장바구니</span>
            <span className="mx-2">→</span>
            <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
            <span className="text-blue-600 font-medium">주문/결제</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 주문 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 배송지 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  배송지 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipient">받는 사람 *</Label>
                    <Input
                      id="recipient"
                      value={shippingAddress.recipient}
                      onChange={(e) => handleShippingChange('recipient', e.target.value)}
                      placeholder="이름을 입력하세요"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">연락처 *</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => handleShippingChange('phone', e.target.value)}
                      placeholder="010-1234-5678"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label>주소 *</Label>
                  
                  {/* Google 주소 검색 */}
                  <div className="mb-3">
                    <GoogleAddressSearch
                      onAddressSelect={(address) => {
                        setShippingAddress(prev => ({
                          ...prev,
                          zipCode: address.zonecode,
                          address1: address.address
                        }));
                      }}
                    />
                  </div>
                  
                  {/* 주소 입력 필드들 */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={shippingAddress.zipCode}
                        onChange={(e) => handleShippingChange('zipCode', e.target.value)}
                        placeholder="우편번호 (직접 입력 가능)"
                        className="w-32"
                      />
                      <Input
                        value={shippingAddress.address1}
                        onChange={(e) => handleShippingChange('address1', e.target.value)}
                        placeholder="도로명주소"
                        className="flex-1"
                      />
                    </div>
                    <Input
                      value={shippingAddress.address2}
                      onChange={(e) => handleShippingChange('address2', e.target.value)}
                      placeholder="상세주소를 입력하세요"
                    />
                    <div className="text-xs text-gray-500">
                      💡 주소 검색이 안 되면 우편번호와 주소를 직접 입력해주세요.
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="memo">배송 메모 (선택사항)</Label>
                  <Input
                    id="memo"
                    value={shippingAddress.memo}
                    onChange={(e) => handleShippingChange('memo', e.target.value)}
                    placeholder="배송 시 요청사항을 입력하세요"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 결제 방법 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  결제 방법
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card">카드결제</Label>
                  </div>
                </RadioGroup>
                <p className="text-sm text-gray-600 mt-2">
                  안전한 나이스페이 결제 시스템을 사용합니다.
                </p>
              </CardContent>
            </Card>

            {/* 쿠폰 적용 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  쿠폰 적용
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {appliedCoupon ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-semibold text-green-800">
                          쿠폰이 적용되었습니다
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="text-red-600 hover:text-red-700"
                      >
                        제거
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{appliedCoupon.name}</p>
                    <p className="text-lg font-bold text-green-600">
                      -{couponDiscount.toLocaleString()}원 할인
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex space-x-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="쿠폰 코드를 입력하세요"
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponCode.trim()}
                        className="whitespace-nowrap"
                      >
                        {validatingCoupon ? '확인 중...' : '적용'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">쿠폰이 있으신가요?</span>
                      <Button variant="link" asChild className="p-0 h-auto">
                        <Link href="/me/coupons">
                          내 쿠폰함 보기
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* 포인트 사용 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="text-yellow-600 mr-2">⭐</span>
                  포인트 사용
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {usePoints > 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="font-semibold text-yellow-800">
                          포인트가 적용되었습니다
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePoints}
                        className="text-red-600 hover:text-red-700"
                      >
                        제거
                      </Button>
                    </div>
                    <p className="text-lg font-bold text-yellow-600">
                      -{usePoints.toLocaleString()}P 사용
                    </p>
                    <p className="text-sm text-gray-600">
                      남은 포인트: {(userPoints - usePoints).toLocaleString()}P
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="points">사용할 포인트</Label>
                        <p className="text-sm text-gray-600 mb-2">
                          보유 포인트: <span className="font-semibold text-yellow-600">{userPoints.toLocaleString()}P</span>
                        </p>
                        <Input
                          id="points"
                          type="number"
                          value={usePoints || ''}
                          onChange={(e) => handleUsePoints(Number(e.target.value))}
                          placeholder="사용할 포인트를 입력하세요"
                          max={userPoints}
                          min="0"
                        />
                        {pointsError && (
                          <p className="text-sm text-red-600 mt-1">{pointsError}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>• 포인트는 주문 금액의 최대 50%까지만 사용 가능합니다</p>
                        <p>• 포인트 사용 시 적립은 사용한 금액을 제외한 금액에 대해 지급됩니다</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* 약관 동의 */}
            <Card>
              <CardHeader>
                <CardTitle>약관 동의</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreements.terms}
                    onCheckedChange={(checked) => handleAgreementChange('terms', checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      서비스 이용약관
                    </Link>
                    에 동의합니다. (필수)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="privacy"
                    checked={agreements.privacy}
                    onCheckedChange={(checked) => handleAgreementChange('privacy', checked as boolean)}
                  />
                  <Label htmlFor="privacy" className="text-sm">
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      개인정보 처리방침
                    </Link>
                    에 동의합니다. (필수)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marketing"
                    checked={agreements.marketing}
                    onCheckedChange={(checked) => handleAgreementChange('marketing', checked as boolean)}
                  />
                  <Label htmlFor="marketing" className="text-sm">
                    마케팅 정보 수신에 동의합니다. (선택)
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 주문 요약 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  주문 상품
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.productId.images && item.productId.images.length > 0 ? (
                        <div className="w-10 h-10 relative">
                          <Image
                            src={(item.productId.images[0] as any)?.url || item.productId.images[0]}
                            alt={item.productId.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.productId.name}</p>
                      <p className="text-xs text-gray-500">수량: {item.quantity}개</p>
                    </div>
                    <p className="text-sm font-medium">
                      {(item.price * item.quantity).toLocaleString()}원
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  주문 요약
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>상품 금액</span>
                  <span>{cart.totalAmount.toLocaleString()}원</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>쿠폰 할인</span>
                    <span>-{couponDiscount.toLocaleString()}원</span>
                  </div>
                )}
                {usePoints > 0 && (
                  <div className="flex justify-between text-yellow-600">
                    <span>포인트 사용</span>
                    <span>-{usePoints.toLocaleString()}P</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>배송비</span>
                  <span>
                    {deliveryFee === 0 ? '무료' : `${deliveryFee.toLocaleString()}원`}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>총 결제금액</span>
                  <span className={couponDiscount > 0 || usePoints > 0 ? 'text-green-600' : ''}>
                    {totalAmount.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between text-sm text-yellow-700">
                  <span>예상 적립</span>
                  <span>{expectedEarnPoints.toLocaleString()}P (등급: {userGrade})</span>
                </div>
                {(couponDiscount > 0 || usePoints > 0) && (
                  <p className="text-sm text-green-600 text-center">
                    {couponDiscount > 0 && usePoints > 0 
                      ? `쿠폰과 포인트로 총 ${(couponDiscount + usePoints).toLocaleString()}원 절약했어요! 🎉`
                      : couponDiscount > 0 
                        ? `쿠폰으로 ${couponDiscount.toLocaleString()}원 절약했어요! 🎉`
                        : `포인트로 ${usePoints.toLocaleString()}원 절약했어요! ⭐`
                    }
                  </p>
                )}
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleOrder}
                  disabled={submitting}
                >
                  {submitting ? '주문 처리 중...' : `${totalAmount.toLocaleString()}원 결제하기`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
