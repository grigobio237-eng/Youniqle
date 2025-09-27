'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CharacterImage from '@/components/ui/CharacterImage';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  CreditCard,
  Truck
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
  createdAt: string;
  updatedAt: string;
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchCart();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [session, status]);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
      }
    } catch (error) {
      console.error('장바구니 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 99) return;

    setUpdating(productId);
    try {
      const response = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity: newQuantity,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
      } else {
        const errorData = await response.json();
        alert(`수량 업데이트 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('수량 업데이트 실패:', error);
      alert('수량 업데이트 중 오류가 발생했습니다.');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: string) => {
    if (!confirm('상품을 장바구니에서 제거하시겠습니까?')) return;

    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
      } else {
        const errorData = await response.json();
        alert(`상품 제거 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('상품 제거 실패:', error);
      alert('상품 제거 중 오류가 발생했습니다.');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4">
              <CharacterImage
                src="/character/youniqle-1.png"
                alt="Youniqle 캐릭터"
                fill
                className="object-contain"
                sizes="80px"
              />
            </div>
            <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
            <p className="text-gray-600 mb-6">
              장바구니를 이용하려면 로그인해주세요.
            </p>
            <Button asChild>
              <Link href="/auth/signin">로그인하기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative w-20 h-20">
                <CharacterImage
                  src="/character/youniqle-1.png"
                  alt="Youniqle 캐릭터"
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">장바구니</h1>
            <p className="text-xl text-gray-600">아직 담은 상품이 없습니다</p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-4">장바구니가 비어있습니다</h3>
              <p className="text-gray-600 mb-6">
                마음에 드는 상품을 장바구니에 담아보세요!
              </p>
              <Button asChild size="lg">
                <Link href="/products">쇼핑하러 가기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20">
              <CharacterImage
                src="/character/youniqle-1.png"
                alt="Youniqle 캐릭터"
                fill
                className="object-contain"
                sizes="80px"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">장바구니</h1>
          <p className="text-xl text-gray-600">
            총 {cart.totalItems}개의 상품
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 장바구니 상품 목록 */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <Card key={item._id} className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    {/* 상품 이미지 */}
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={item.productId.images[0] || '/placeholder-product.jpg'}
                        alt={item.productId.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* 상품 정보 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-2 truncate">
                        {item.productId.name}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {item.price.toLocaleString()}원
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          {item.quantity}개
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {(item.price * item.quantity).toLocaleString()}원
                        </span>
                      </div>
                    </div>

                    {/* 수량 조절 및 삭제 */}
                    <div className="flex flex-col items-end space-y-2">
                      {/* 수량 조절 */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                          disabled={updating === item.productId._id || item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 1;
                            updateQuantity(item.productId._id, newQuantity);
                          }}
                          className="w-16 text-center"
                          min="1"
                          max="99"
                          disabled={updating === item.productId._id}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                          disabled={updating === item.productId._id || item.quantity >= 99}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* 삭제 버튼 */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.productId._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 주문 요약 */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  주문 요약
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>상품 금액</span>
                  <span>{cart.totalAmount.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span>배송비</span>
                  <span>
                    {cart.totalAmount >= 50000 ? '무료' : '3,000원'}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>총 결제금액</span>
                  <span>
                    {(cart.totalAmount + (cart.totalAmount >= 50000 ? 0 : 3000)).toLocaleString()}원
                  </span>
                </div>
                <Button className="w-full" size="lg">
                  주문하기
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  배송 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>배송비</span>
                  <span>3,000원</span>
                </div>
                <div className="flex justify-between">
                  <span>무료배송</span>
                  <span>5만원 이상</span>
                </div>
                <div className="flex justify-between">
                  <span>배송기간</span>
                  <span>2-3일</span>
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                쇼핑 계속하기
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
