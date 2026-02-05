'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  CreditCard,
  Truck,
  ChevronRight,
  Package,
  PackageCheck,
  ShieldCheck,
  AlertCircle
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
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

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
        if (data.cart && data.cart.items) {
          setCart(data.cart);
          const allItemIds = new Set<string>(
            (data.cart.items || [])
              .filter((item: any) => item && item._id)
              .map((item: CartItem) => item._id)
          );
          setSelectedItems(allItemIds);
        } else {
          setCart({ items: [], totalItems: 0, totalAmount: 0 } as any);
          setSelectedItems(new Set());
        }
      }
    } catch (error) {
      console.error('Cart fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
      return newSet;
    });
  };

  const toggleAllSelection = () => {
    if (!cart) return;
    if (selectedItems.size === (cart?.items?.length || 0)) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(
        (cart?.items || [])
          .filter(item => item && item._id)
          .map(item => item._id)
      );
      setSelectedItems(allIds);
    }
  };

  const getSelectedTotal = () => {
    if (!cart) return 0;
    return (cart?.items || [])
      .filter(item => item && selectedItems.has(item._id))
      .reduce((sum, item) => sum + ((item?.price || 0) * (item?.quantity || 0)), 0);
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 99) return;
    setUpdating(productId);
    try {
      const response = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error('Quantity update failed:', error);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: string) => {
    if (!confirm('이 아이템을 보관함에서 해제하시겠습니까?')) return;
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error('Product removal failed:', error);
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
          <h2 className="text-2xl font-black text-obsidian tracking-tight mb-2">로그인이 필요합니다</h2>
          <p className="text-slate font-medium mb-8">보관함 접근을 위해 인증 프로토콜이 필요합니다.</p>
          <Button asChild className="w-full h-14 rounded-2xl bg-obsidian text-mist font-black">
            <Link href="/auth/signin">인증 시작</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-mist py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-16">
            <p className="text-chapter-accent font-black uppercase tracking-[0.2em] text-[10px] mb-2 p-1 px-3 bg-chapter-accent/5 inline-block rounded-full border border-chapter-accent/10">Vault Control System</p>
            <h1 className="text-5xl font-black text-obsidian tracking-tighter">보관함이 비어있습니다</h1>
          </div>
          <Card className="border-none shadow-xl rounded-[48px] bg-white p-20">
            <div className="w-24 h-24 mx-auto mb-10 bg-mist rounded-[32px] flex items-center justify-center text-slate/20">
              <Package className="w-12 h-12" />
            </div>
            <p className="text-slate font-bold text-lg mb-12">당신의 회복을 위한 최적의 아이템들을 분석하고 할당하십시오.</p>
            <Button asChild size="lg" className="h-16 px-12 rounded-2xl bg-chapter-accent text-mist font-black text-lg hover:scale-105 transition-all shadow-xl shadow-chapter-accent/20">
              <Link href="/products" className="flex items-center gap-2">회복 아이템 스포팅 <ChevronRight className="w-5 h-5" /></Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center mb-16">
          <p className="text-chapter-accent font-black uppercase tracking-[0.2em] text-[10px] mb-2 p-1 px-3 bg-chapter-accent/5 text-chapter-accent rounded-full border border-chapter-accent/10">Vault | My Selection</p>
          <h1 className="text-5xl font-black text-obsidian tracking-tighter">보관 및 할당 센터</h1>
          <Badge className="mt-4 bg-obsidian text-mist border-none px-6 py-2 rounded-full font-black text-xs">
            현재 식별된 회복 프로토콜: {cart.totalItems}개
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm border border-mist p-6 rounded-[28px] shadow-sm">
              <div className="flex items-center space-x-4">
                <Checkbox
                  id="select-all"
                  checked={selectedItems.size === cart.items.length && cart.items.length > 0}
                  onCheckedChange={toggleAllSelection}
                  className="w-6 h-6 rounded-lg border-line data-[state=checked]:bg-chapter-accent data-[state=checked]:border-chapter-accent"
                />
                <label htmlFor="select-all" className="text-sm font-black text-obsidian cursor-pointer select-none">
                  전체 데이터 선택 <span className="text-slate/40 ml-1">({selectedItems.size}/{cart?.items?.length || 0})</span>
                </label>
              </div>
              <Button variant="ghost" size="sm" className="text-xs font-black text-slate hover:text-status-danger hover:bg-status-danger/5 h-10 px-4 rounded-xl transition-all">
                선택 항목 해제
              </Button>
            </div>

            <div className="space-y-4">
              {(cart?.items || [])
                .filter(item => item && item._id)
                .map((item) => (
                  <Card key={item._id} className={`border-none shadow-sm rounded-[36px] overflow-hidden transition-all duration-500 hover:shadow-xl group ${selectedItems.has(item._id) ? 'bg-white' : 'bg-white/50 opacity-60'}`}>
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row items-center gap-8">
                        <Checkbox
                          checked={selectedItems.has(item._id)}
                          onCheckedChange={() => toggleItemSelection(item._id)}
                          className="w-6 h-6 rounded-lg border-line data-[state=checked]:bg-chapter-accent"
                        />

                        <div className="w-32 h-32 flex-shrink-0 relative rounded-[24px] overflow-hidden bg-mist shadow-inner flex items-center justify-center">
                          {item.productId?.images?.[0] ? (
                            <Image
                              src={(item.productId?.images?.[0] as any)?.url || item.productId?.images?.[0]}
                              alt={item.productId?.name || '상품'}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <Package className="h-10 w-10 text-slate opacity-20" />
                          )}
                          <div className="absolute inset-0 bg-obsidian/5 group-hover:bg-transparent transition-colors" />
                        </div>

                        <div className="flex-1 w-full text-center md:text-left">
                          <Link href={`/products/${item.productId?.slug || ''}`} className="inline-block group/link">
                            <h3 className="font-black text-2xl text-obsidian mb-2 tracking-tight group-hover/link:text-chapter-accent transition-colors">
                              {item.productId?.name || '정보 없음'}
                            </h3>
                          </Link>
                          <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
                            <span className="text-xl font-black text-chapter-accent">
                              {item.price.toLocaleString()}원
                            </span>
                            <span className="text-[10px] font-black text-slate uppercase tracking-widest opacity-30 mt-1">Per Unit</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center bg-mist/50 p-1.5 rounded-2xl border border-line">
                              <button
                                className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl disabled:opacity-20 transition-all active:scale-90"
                                onClick={() => item?.productId?._id && updateQuantity(item.productId._id, item.quantity - 1)}
                                disabled={!item?.productId?._id || updating === item.productId._id || item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-12 text-center font-black text-lg">{item?.quantity || 0}</span>
                              <button
                                className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl disabled:opacity-20 transition-all active:scale-90"
                                onClick={() => item?.productId?._id && updateQuantity(item.productId._id, item.quantity + 1)}
                                disabled={!item?.productId?._id || updating === item.productId._id || item.quantity >= 99}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => item?.productId?._id && removeItem(item.productId._id)}
                              className="w-12 h-12 rounded-2xl text-slate hover:text-status-danger hover:bg-status-danger/5"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            <Button asChild variant="ghost" className="h-14 px-8 text-slate font-black rounded-2xl hover:text-obsidian hover:bg-white transition-all">
              <Link href="/products" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                추가 데이터 스캐닝 (쇼핑 계속하기)
              </Link>
            </Button>
          </div>

          <div className="lg:col-span-4 space-y-8 sticky top-24">
            <Card className="border-none shadow-2xl rounded-[48px] overflow-hidden bg-obsidian text-mist p-10 relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-reward-gold/10 blur-[80px] rounded-full -translate-y-24 translate-x-24" />
              <div className="relative z-10 space-y-10">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-reward-gold">Order Summary</p>
                  <h3 className="text-2xl font-black tracking-tight">할당 정보 요약</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold opacity-60">
                    <span>선택된 프로토콜</span>
                    <span>{selectedItems.size}개</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold opacity-60">
                    <span>아이템 가치</span>
                    <span>{getSelectedTotal().toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold opacity-60">
                    <span>물류 배송비</span>
                    <span>{getSelectedTotal() >= 50000 ? '데이터 면제 (Free)' : '3,000원'}</span>
                  </div>
                </div>

                <div className="h-px bg-mist/10" />

                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Estimated Total Value</p>
                  <p className="text-4xl font-black text-reward-gold tracking-tighter">
                    {(getSelectedTotal() + (getSelectedTotal() >= 50000 || getSelectedTotal() === 0 ? 0 : 3000)).toLocaleString()} <span className="text-lg">원</span>
                  </p>
                </div>

                <Button
                  className="w-full h-20 rounded-[32px] bg-reward-gold text-obsidian font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-reward-gold/20 flex items-center justify-center gap-2 disabled:opacity-20"
                  onClick={() => {
                    if (selectedItems.size === 0) {
                      alert('할당할 아이템을 선택해주십시오.');
                      return;
                    }
                    const selectedIds = Array.from(selectedItems).join(',');
                    router.push(`/checkout?selectedItems=${selectedIds}`);
                  }}
                  disabled={selectedItems.size === 0}
                >
                  최종 할당 실행 <ChevronRight className="w-6 h-6" />
                </Button>

                {getSelectedTotal() < 50000 && getSelectedTotal() > 0 && (
                  <div className="flex gap-3 bg-white/5 p-4 rounded-2xl items-center border border-white/10">
                    <AlertCircle className="w-4 h-4 text-reward-gold shrink-0" />
                    <p className="text-[10px] font-medium leading-relaxed opacity-60">
                      50,000원 이상 누적 시 <span className="text-reward-gold font-black">물류비 면제</span> 프로토콜이 가동됩니다.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="border-none bg-white p-8 rounded-[36px] shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-mist rounded-xl text-obsidian">
                  <Truck className="h-5 w-5" />
                </div>
                <h4 className="font-black text-sm tracking-tight text-obsidian uppercase">Logistics info</h4>
              </div>
              <div className="space-y-4 text-xs font-bold text-slate">
                <div className="flex justify-between pb-3 border-b border-line/30">
                  <span className="opacity-40 uppercase tracking-widest">Base Fee</span>
                  <span className="text-obsidian">3,000 KRW</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-line/30">
                  <span className="opacity-40 uppercase tracking-widest">Exemption</span>
                  <span className="text-obsidian">Over 50,000 KRW</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-40 uppercase tracking-widest">Est. Lead Time</span>
                  <span className="text-obsidian">2-3 Business Days</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
