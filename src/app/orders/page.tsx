'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CharacterImage from '@/components/ui/CharacterImage';
import { Package, Calendar, CreditCard, MapPin, Eye, RefreshCw } from 'lucide-react';

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
}

const statusLabels = {
  pending: { label: '주문 대기', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: '주문 확인', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: '배송 중', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: '배송 완료', color: 'bg-green-100 text-green-800' },
  cancelled: { label: '주문 취소', color: 'bg-red-100 text-red-800' },
};

const paymentStatusLabels = {
  pending: { label: '결제 대기', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: '결제 완료', color: 'bg-green-100 text-green-800' },
  failed: { label: '결제 실패', color: 'bg-red-100 text-red-800' },
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
      } else {
        console.error('주문 내역 조회 실패');
      }
    } catch (error) {
      console.error('주문 내역 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('정말로 이 주문을 취소하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
      });

      if (response.ok) {
        alert('주문이 취소되었습니다.');
        fetchOrders(); // 목록 새로고침
      } else {
        const errorData = await response.json();
        alert(`주문 취소 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('주문 취소 중 오류:', error);
      alert('주문 취소 중 오류가 발생했습니다.');
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
              주문 내역을 확인하려면 로그인해주세요.
            </p>
            <Button asChild>
              <a href="/auth/signin">로그인하기</a>
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
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20">
              <CharacterImage
                src="/character/youniqle-2.png"
                alt="Youniqle 캐릭터"
                fill
                className="object-contain"
                sizes="80px"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">주문 내역</h1>
          <p className="text-xl text-gray-600">
            {session.user?.name}님의 주문 내역입니다
          </p>
        </div>

        {/* 새로고침 버튼 */}
        <div className="flex justify-end mb-6">
          <Button
            variant="outline"
            onClick={fetchOrders}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        </div>

        {/* 주문 목록 */}
        {orders.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="flex justify-center mb-6">
                <Package className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                주문 내역이 없습니다
              </h3>
              <p className="text-gray-600 mb-6">
                아직 주문한 상품이 없습니다.<br />
                다양한 상품을 둘러보고 첫 주문을 시작해보세요!
              </p>
              <Button asChild>
                <Link href="/products">상품 둘러보기</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order._id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <Package className="h-5 w-5 mr-2" />
                        주문번호: {order.orderNumber}
                      </CardTitle>
                      <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-1" />
                          {order.totalAmount.toLocaleString()}원
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={statusLabels[order.status].color}>
                        {statusLabels[order.status].label}
                      </Badge>
                      <Badge className={paymentStatusLabels[order.paymentStatus].color}>
                        {paymentStatusLabels[order.paymentStatus].label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* 주문 상품 목록 */}
                  <div className="space-y-4 mb-6">
                    <h4 className="font-semibold text-gray-700">주문 상품</h4>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          {item.productId.images && item.productId.images.length > 0 ? (
                            <img
                              src={item.productId.images[0]}
                              alt={item.productId.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <Link href={`/products/${item.productId._id}`} className="font-medium text-gray-900 hover:text-blue-600">
                            {item.productId.name}
                          </Link>
                          <p className="text-sm text-gray-600">
                            {item.quantity}개 × {item.price.toLocaleString()}원
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {(item.quantity * item.price).toLocaleString()}원
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 배송 정보 */}
                  <div className="space-y-2 mb-6">
                    <h4 className="font-semibold text-gray-700 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      배송 정보
                    </h4>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        {order.shippingAddress.zipCode}
                      </p>
                      <p className="text-sm text-gray-700">
                        {order.shippingAddress.address1}
                      </p>
                      {order.shippingAddress.address2 && (
                        <p className="text-sm text-gray-700">
                          {order.shippingAddress.address2}
                        </p>
                      )}
                      {order.shippingAddress.phone && (
                        <p className="text-sm text-gray-700">
                          연락처: {order.shippingAddress.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      상세 보기
                    </Button>
                    {order.status === 'pending' && (
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        주문 취소
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 상세 보기 모달 */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>주문 상세 정보</CardTitle>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedOrder(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">주문 정보</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">주문번호</p>
                      <p className="font-medium">{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">주문일시</p>
                      <p className="font-medium">
                        {new Date(selectedOrder.createdAt).toLocaleString('ko-KR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">주문 상태</p>
                      <Badge className={statusLabels[selectedOrder.status].color}>
                        {statusLabels[selectedOrder.status].label}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-600">결제 상태</p>
                      <Badge className={paymentStatusLabels[selectedOrder.paymentStatus].color}>
                        {paymentStatusLabels[selectedOrder.paymentStatus].label}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">결제 정보</h4>
                  <div className="text-sm space-y-1">
                    <p className="text-gray-600">결제 방법</p>
                    <p className="font-medium">{selectedOrder.paymentMethod}</p>
                    <p className="text-gray-600">총 결제 금액</p>
                    <p className="font-medium text-lg">{selectedOrder.totalAmount.toLocaleString()}원</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
