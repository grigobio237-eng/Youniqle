'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CharacterImage from '@/components/ui/CharacterImage';
import { Heart, ShoppingCart, Eye, Trash2, RefreshCw } from 'lucide-react';

interface WishlistItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    category: string;
    stock: number;
    status: 'active' | 'inactive';
  };
  addedAt: string;
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session?.user) {
      fetchWishlist();
    }
  }, [session]);

  const fetchWishlist = async () => {
    if (!session?.user) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        setWishlist(data.wishlist || []);
      } else {
        console.error('위시리스트 조회 실패');
      }
    } catch (error) {
      console.error('위시리스트 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    setRemovingItems(prev => new Set(prev).add(productId));
    
    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        setWishlist(prev => prev.filter(item => item.productId._id !== productId));
      } else {
        const errorData = await response.json();
        alert(`위시리스트에서 제거 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('위시리스트에서 제거 중 오류:', error);
      alert('위시리스트에서 제거 중 오류가 발생했습니다.');
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productId,
          quantity: 1 
        }),
      });

      if (response.ok) {
        alert('장바구니에 추가되었습니다!');
      } else {
        const errorData = await response.json();
        alert(`장바구니 추가 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('장바구니 추가 중 오류:', error);
      alert('장바구니 추가 중 오류가 발생했습니다.');
    }
  };

  const handleAddAllToCart = async () => {
    if (wishlist.length === 0) return;
    
    const activeItems = wishlist.filter(item => item.productId.status === 'active');
    if (activeItems.length === 0) {
      alert('장바구니에 추가할 수 있는 상품이 없습니다.');
      return;
    }

    try {
      let successCount = 0;
      let failCount = 0;

      for (const item of activeItems) {
        try {
          const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              productId: item.productId._id,
              quantity: 1 
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      if (successCount > 0) {
        alert(`${successCount}개 상품이 장바구니에 추가되었습니다.${failCount > 0 ? ` (${failCount}개 실패)` : ''}`);
      } else {
        alert('장바구니 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('전체 장바구니 추가 중 오류:', error);
      alert('장바구니 추가 중 오류가 발생했습니다.');
    }
  };

  const handleClearWishlist = async () => {
    if (!confirm('위시리스트를 모두 비우시겠습니까?')) return;

    try {
      const response = await fetch('/api/wishlist/clear', {
        method: 'DELETE',
      });

      if (response.ok) {
        setWishlist([]);
        alert('위시리스트가 비워졌습니다.');
      } else {
        const errorData = await response.json();
        alert(`위시리스트 비우기 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('위시리스트 비우기 중 오류:', error);
      alert('위시리스트 비우기 중 오류가 발생했습니다.');
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
            <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
            <p className="text-gray-600 mb-6">
              위시리스트를 확인하려면 로그인해주세요.
            </p>
            <Button asChild>
              <a href="/auth/signin">로그인하기</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeItems = wishlist.filter(item => item.productId.status === 'active');
  const inactiveItems = wishlist.filter(item => item.productId.status === 'inactive');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-12">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">위시리스트</h1>
          <p className="text-xl text-gray-600">
            {session.user?.name}님이 좋아하는 상품들입니다
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              총 {wishlist.length}개 상품
            </span>
            {activeItems.length > 0 && (
              <span className="text-sm text-green-600">
                구매 가능 {activeItems.length}개
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={fetchWishlist}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </Button>
            {activeItems.length > 0 && (
              <Button
                onClick={handleAddAllToCart}
                className="flex items-center"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                전체 장바구니 담기
              </Button>
            )}
            {wishlist.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleClearWishlist}
                className="flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                전체 삭제
              </Button>
            )}
          </div>
        </div>

        {/* 위시리스트 목록 */}
        {wishlist.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="flex justify-center mb-6">
                <Heart className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                위시리스트가 비어있습니다
              </h3>
              <p className="text-gray-600 mb-6">
                마음에 드는 상품에 하트를 눌러 위시리스트에 추가해보세요!
              </p>
              <Button asChild>
                <Link href="/products">상품 둘러보기</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 구매 가능한 상품 */}
            {activeItems.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  구매 가능한 상품 ({activeItems.length}개)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeItems.map((item) => (
                    <Card key={item._id} className="shadow-lg hover:shadow-xl transition-shadow">
                      <div className="relative">
                        <div className="aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
                          {item.productId.images && item.productId.images.length > 0 ? (
                            <img
                              src={item.productId.images[0]}
                              alt={item.productId.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Heart className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleRemoveFromWishlist(item.productId._id)}
                          disabled={removingItems.has(item.productId._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <div className="mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {item.productId.category}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {item.productId.name}
                        </h3>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-blue-600">
                            {item.productId.price.toLocaleString()}원
                          </span>
                          <span className="text-sm text-gray-500">
                            재고: {item.productId.stock}개
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            asChild
                          >
                            <a href={`/products/${item.productId._id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              상세보기
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleAddToCart(item.productId._id)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            장바구니
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 품절된 상품 */}
            {inactiveItems.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  품절된 상품 ({inactiveItems.length}개)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inactiveItems.map((item) => (
                    <Card key={item._id} className="shadow-lg opacity-60">
                      <div className="relative">
                        <div className="aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
                          {item.productId.images && item.productId.images.length > 0 ? (
                            <img
                              src={item.productId.images[0]}
                              alt={item.productId.name}
                              className="w-full h-full object-cover grayscale"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Heart className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-red-100 text-red-800">
                            품절
                          </Badge>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleRemoveFromWishlist(item.productId._id)}
                          disabled={removingItems.has(item.productId._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <div className="mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {item.productId.category}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {item.productId.name}
                        </h3>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-gray-500 line-through">
                            {item.productId.price.toLocaleString()}원
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            disabled
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            상세보기
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            disabled
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            품절
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
