'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Eye, Trash2, RefreshCw, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface WishlistItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    images: Array<{ url: string } | string>;
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
      }
    } catch (error) {
      console.error('위시리스트 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    setRemovingItems(prev => new Set(prev).add(productId));

    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        setWishlist(prev => prev.filter(item => item.productId._id !== productId));
      }
    } catch (error) {
      console.error('위시리스트 제거 오류:', error);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.ok) {
        alert('장바구니에 추가되었습니다.');
      }
    } catch (error) {
      console.error('장바구니 추가 오류:', error);
    }
  };

  const handleClearWishlist = async () => {
    if (!confirm('위시리스트를 모두 비우시겠습니까?')) return;

    try {
      const response = await fetch('/api/wishlist/clear', { method: 'DELETE' });
      if (response.ok) {
        setWishlist([]);
      }
    } catch (error) {
      console.error('위시리스트 비우기 오류:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-mist flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chapter-accent"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-mist flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[40px] bg-white text-center p-12">
          <div className="w-20 h-20 bg-mist rounded-[24px] flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner">🔒</div>
          <h2 className="text-2xl font-black text-obsidian tracking-tight mb-2">접근 권한 제한</h2>
          <p className="text-slate font-medium mb-8">취향 관측을 위해 인증 프로토콜이 필요합니다.</p>
          <Button asChild className="w-full h-14 rounded-2xl bg-obsidian text-mist font-black">
            <Link href="/auth/signin">인증 시작</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const activeItems = (wishlist || []).filter(item => item && item.productId && item.productId.status === 'active');
  const inactiveItems = (wishlist || []).filter(item => item && item.productId && item.productId.status === 'inactive');

  return (
    <div className="min-h-screen bg-mist py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="text-center md:text-left">
            <p className="text-chapter-accent font-black uppercase tracking-[0.2em] text-[10px] mb-2">Interest Inventory</p>
            <h1 className="text-5xl font-black text-obsidian tracking-tighter">관심 상품 리스트</h1>
            <p className="text-slate font-bold tracking-tight mt-1">{session.user?.name} 요원의 위시리스트입니다.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={fetchWishlist} className="h-12 px-6 rounded-xl hover:bg-white text-slate font-black flex gap-2">
              <RefreshCw className="h-4 w-4" />
              최신화
            </Button>
            {wishlist.length > 0 && (
              <Button variant="outline" onClick={handleClearWishlist} className="h-12 px-6 rounded-xl border-line text-status-danger font-black flex gap-2 hover:bg-status-danger/5 transition-all">
                <Trash2 className="h-4 w-4" />
                모두 삭제
              </Button>
            )}
          </div>
        </div>

        {wishlist.length === 0 ? (
          <Card className="border-dashed border-2 border-line bg-transparent rounded-[40px] p-24 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-sm">❤️</div>
            <h3 className="text-xl font-black text-obsidian tracking-tight mb-2">리스트가 비어있습니다</h3>
            <p className="text-slate font-medium mb-8">마음에 드는 장비를 발견하면 하트를 눌러 기록해두세요.</p>
            <Button asChild className="h-14 px-10 rounded-2xl bg-obsidian text-mist font-black shadow-lg">
              <Link href="/products" className="flex items-center gap-2">
                상품 탐색하기
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-16">
            {activeItems.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activeItems.map((item) => (
                  <div key={item._id} className="group">
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                      <div className="relative aspect-square overflow-hidden bg-mist">
                        <Image
                          src={(item.productId?.images?.[0] as any)?.url || item.productId?.images?.[0] || '/placeholder-product.jpg'}
                          alt={item.productId?.name || '상품'}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-sm text-status-danger hover:bg-status-danger hover:text-white"
                            onClick={() => handleRemoveFromWishlist(item.productId._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-chapter-accent/10 text-chapter-accent border-chapter-accent/20 font-black text-[9px] uppercase tracking-widest px-3">{item.productId.category}</Badge>
                        </div>
                      </div>
                      <CardContent className="p-8">
                        <h3 className="text-lg font-black text-obsidian tracking-tight line-clamp-1 mb-1">{item.productId?.name || '정보 없음'}</h3>
                        <p className="text-xl font-black text-obsidian tracking-tighter mb-6">{(item.productId?.price || 0).toLocaleString()}원</p>
                        <div className="flex gap-2">
                          <Button asChild variant="outline" className="flex-1 h-12 rounded-xl border-line font-black text-xs hover:bg-mist">
                            <Link href={`/products/${item.productId._id}`}>
                              상세 보기
                            </Link>
                          </Button>
                          <Button
                            className="flex-1 h-12 rounded-xl bg-obsidian text-mist font-black text-xs shadow-lg shadow-obsidian/10"
                            onClick={() => handleAddToCart(item.productId._id)}
                          >
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            담기
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}

            {inactiveItems.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-slate tracking-tight flex items-center gap-2 opacity-50">
                  공급 중단 상품
                  <span className="text-xs bg-line/30 px-2 py-0.5 rounded-full">{inactiveItems.length}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {inactiveItems.map((item) => (
                    <Card key={item._id} className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white/50 opacity-40 grayscale pointer-events-none">
                      <div className="relative aspect-square bg-mist flex items-center justify-center">
                        {(item.productId?.images?.[0]) ? (
                          <Image src={(item.productId.images[0] as any)?.url || item.productId.images[0]} alt="" fill className="object-cover" />
                        ) : <Heart className="h-16 w-16 text-slate" />}
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                          <Badge className="bg-status-danger text-mist font-black px-4 py-1.5 rounded-full">SOLD OUT</Badge>
                        </div>
                      </div>
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
