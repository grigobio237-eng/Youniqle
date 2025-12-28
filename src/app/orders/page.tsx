'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Calendar,
  CreditCard,
  MapPin,
  Eye,
  RefreshCw,
  RotateCcw,
  Truck,
  ShoppingCart,
  X,
  ChevronRight,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import Image from 'next/image';

interface OrderItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    images: string[];
    price: number;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  shippingAddress: {
    zipCode: string;
    address1: string;
    address2: string;
    phone?: string;
  };
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  courierCompany?: string;
  shippedAt?: string;
  deliveredAt?: string;
  couponDiscount?: number;
  usedPoints?: number;
}

const statusLabels = {
  pending: { label: '심사 대기', color: 'bg-status-amber/10 text-status-amber border-status-amber/20' },
  confirmed: { label: '검토 완료', color: 'bg-status-good/10 text-status-good border-status-good/20' },
  shipped: { label: '배송 이송 중', color: 'bg-chapter-accent/10 text-chapter-accent border-chapter-accent/20' },
  delivered: { label: '인계 완료', color: 'bg-obsidian text-mist border-obsidian' },
  cancelled: { label: '집행 중단', color: 'bg-status-danger/10 text-status-danger border-status-danger/20' },
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    if (!session?.user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('주문 내역 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('정말로 이 주문의 집행을 중단하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, { method: 'PUT' });
      if (response.ok) {
        alert('주문 집행이 중단되었습니다.');
        fetchOrders();
      } else {
        const errorData = await response.json();
        alert(`중단 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('주문 취소 중 오류:', error);
    }
  };

  const handleReorder = async (order: Order) => {
    try {
      const addToCartPromises = order.items.map(item =>
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.productId._id,
            quantity: item.quantity,
          }),
        })
      );

      const results = await Promise.all(addToCartPromises);
      const failed = results.filter(r => !r.ok);

      if (failed.length === 0) {
        window.dispatchEvent(new Event('cartUpdated'));
        window.location.href = '/cart';
      } else {
        alert('일부 장비의 재배급이 불가합니다. (재고 부족 등)');
      }
    } catch (error) {
      console.error('재주문 오류:', error);
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
          <p className="text-slate font-medium mb-8">주문 내역 검토를 위해 인증 프로토콜이 필요합니다.</p>
          <Button asChild className="w-full h-14 rounded-2xl bg-obsidian text-mist font-black">
            <Link href="/auth/signin">인증 시작</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <p className="text-slate font-black uppercase tracking-[0.2em] text-[10px] mb-2 text-chapter-accent">Transaction Ledger</p>
            <h1 className="text-5xl font-black text-obsidian tracking-tighter">주문 인벤토리</h1>
            <p className="text-slate font-bold tracking-tight mt-1">{session.user?.name} 요원의 최근 보급 현황입니다.</p>
          </div>
          <Button variant="ghost" onClick={fetchOrders} className="h-12 px-6 rounded-xl hover:bg-white text-slate font-black flex gap-2">
            <RefreshCw className="h-4 w-4" />
            데이터 동기화
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card className="border-dashed border-2 border-line bg-transparent rounded-[40px] p-24 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-sm">📦</div>
            <h3 className="text-xl font-black text-obsidian tracking-tight mb-2">보급 이력이 없습니다</h3>
            <p className="text-slate font-medium mb-8">아직 유니클레의 장비를 배정받지 않으셨습니다.</p>
            <Button asChild className="h-14 px-10 rounded-2xl bg-obsidian text-mist font-black shadow-lg">
              <Link href="/products" className="flex items-center gap-2">
                보급 물자 둘러보기
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <Card key={order._id} className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white hover:shadow-md transition-all">
                <CardHeader className="p-8 pb-4 border-b border-mist">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate opacity-40">Classification No.</span>
                        <span className="font-mono text-sm font-bold text-obsidian">{order.orderNumber}</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate flex items-center gap-1 opacity-60">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={`px-4 py-1.5 rounded-full border ${statusLabels[order.status]?.color || 'bg-mist text-slate'} font-black text-[10px] uppercase tracking-widest`}>
                        {statusLabels[order.status]?.label || order.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-6">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex -space-x-4 overflow-hidden">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="w-16 h-16 rounded-2xl border-4 border-white bg-mist relative flex-shrink-0 shadow-sm">
                          <Image
                            src={item.productId.images?.[0] || '/placeholder-product.jpg'}
                            alt=""
                            fill
                            className="object-cover rounded-xl"
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-16 h-16 rounded-2xl border-4 border-white bg-obsidian text-mist font-black flex items-center justify-center text-xs relative z-10 shadow-sm">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="font-black text-obsidian text-lg line-clamp-1">
                        {order.items[0].productId.name} {order.items.length > 1 ? `외 ${order.items.length - 1}건` : ''}
                      </h4>
                      <div className="flex items-center justify-center md:justify-start gap-4 mt-1">
                        <span className="text-xl font-black text-obsidian tracking-tighter">{order.totalAmount.toLocaleString()}원</span>
                        <span className="h-4 w-px bg-line" />
                        <span className="text-xs font-bold text-slate">{order.items.reduce((acc, curr) => acc + curr.quantity, 0)} items</span>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                      <Button variant="outline" className="h-12 px-6 rounded-xl border-line font-black text-xs hover:bg-mist transition-all flex items-center gap-2" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-4 w-4" />
                        상세 관측
                      </Button>
                      {(order.status === 'pending') && (
                        <Button variant="ghost" className="h-12 px-6 rounded-xl text-status-danger font-black text-xs hover:bg-status-danger/5" onClick={() => handleCancelOrder(order._id)}>
                          <X className="h-4 w-4 mr-1" />
                          집행 취소
                        </Button>
                      )}
                      {(order.status === 'delivered' || order.status === 'cancelled') && (
                        <Button className="h-12 px-6 rounded-xl bg-obsidian text-mist font-black text-xs shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={() => handleReorder(order)}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          보급 재요청
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 상세 보기 모달 */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <Card className="w-full max-w-2xl border-none shadow-2xl rounded-[40px] overflow-hidden bg-white max-h-[90vh] flex flex-col">
              <div className="h-2 bg-chapter-accent w-full" />
              <CardHeader className="p-8 pb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-mist rounded-2xl text-chapter-accent">
                      <ClipboardList className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black text-obsidian tracking-tighter">보급 상세 명세서</CardTitle>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate opacity-40">Inventory Evaluation Report</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)} className="rounded-full hover:bg-mist">
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-4 overflow-y-auto space-y-10 custom-scrollbar">
                <div className="grid grid-cols-2 gap-8 text-center bg-mist/30 p-8 rounded-[32px] border border-line/30">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate opacity-40">Order No.</span>
                    <p className="font-mono text-sm font-bold text-obsidian">{selectedOrder.orderNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate opacity-40">Protocol Status</span>
                    <div className="flex justify-center">
                      <Badge className={`${statusLabels[selectedOrder.status]?.color} border font-black text-[9px] uppercase tracking-widest px-3`}>
                        {statusLabels[selectedOrder.status]?.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate opacity-60 flex items-center gap-2">
                    <Package className="h-3 w-3" />
                    Requested Equipment
                  </span>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-line">
                        <div className="w-12 h-12 bg-mist rounded-xl relative overflow-hidden flex-shrink-0">
                          <Image src={item.productId.images?.[0] || '/placeholder-product.jpg'} alt="" fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-obsidian truncate">{item.productId.name}</p>
                          <p className="text-[10px] font-bold text-slate opacity-60">{item.quantity} 개 × {item.price.toLocaleString()}원</p>
                        </div>
                        <span className="font-black text-obsidian text-sm">{(item.quantity * item.price).toLocaleString()}원</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate opacity-60 flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      Target Destination
                    </span>
                    <div className="p-6 rounded-2xl bg-mist/20 border border-line text-xs font-bold text-obsidian leading-relaxed space-y-1">
                      <p className="opacity-40 text-[9px] mb-1">ZIP: {selectedOrder.shippingAddress.zipCode}</p>
                      <p>{selectedOrder.shippingAddress.address1}</p>
                      <p>{selectedOrder.shippingAddress.address2}</p>
                      <p className="pt-2 flex items-center gap-2 text-slate"><span className="w-1 h-1 rounded-full bg-slate" /> {selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate opacity-60 flex items-center gap-2">
                      <CreditCard className="h-3 w-3" />
                      Ledger Overview
                    </span>
                    <div className="p-6 rounded-2xl bg-obsidian text-mist space-y-3">
                      <div className="flex justify-between items-center opacity-40 text-[9px]">
                        <span>METHOD</span>
                        <span className="font-black uppercase">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase opacity-60">Total Cost</span>
                        <span className="text-xl font-black tracking-tighter text-reward-gold">{selectedOrder.totalAmount.toLocaleString()}원</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="p-8 pt-0 mt-auto">
                <Button onClick={() => setSelectedOrder(null)} className="w-full h-14 rounded-2xl bg-obsidian text-mist font-black">명세서 닫기</Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
