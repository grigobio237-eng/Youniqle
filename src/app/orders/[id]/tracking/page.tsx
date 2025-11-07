'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CharacterImage from '@/components/ui/CharacterImage';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Truck, 
  MapPin, 
  Package,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface TrackingEvent {
  time: string;
  location: string;
  status: string;
  description: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  trackingNumber?: string;
  courierCompany?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt?: string;
  shippingAddress: {
    zipCode: string;
    address1: string;
    address2?: string;
    recipient: string;
    phone?: string;
  };
  partnerOrders?: Array<{
    trackingNumber?: string;
    courierCompany?: string;
    shippedAt?: string;
    deliveredAt?: string;
  }>;
}

// 배송 상태에 따른 추적 이벤트 생성
const generateTrackingEvents = (order: Order): TrackingEvent[] => {
  const events: TrackingEvent[] = [];
  const now = new Date();

  // 주문 접수
  events.push({
    time: new Date(order.createdAt).toLocaleString('ko-KR'),
    location: 'Youniqle',
    status: 'ordered',
    description: '주문이 접수되었습니다.',
  });

  // 주문 확인
  if (order.status !== 'pending') {
    events.push({
      time: new Date(order.createdAt).toLocaleString('ko-KR'),
      location: 'Youniqle',
      status: 'confirmed',
      description: '주문이 확인되었습니다.',
    });
  }

  // 배송 시작
  if (order.status === 'shipped' || order.status === 'delivered') {
    const shippedTime = order.shippedAt || order.updatedAt || order.createdAt;
    if (shippedTime) {
      events.push({
        time: new Date(shippedTime).toLocaleString('ko-KR'),
        location: '배송 출발지',
        status: 'shipped',
        description: '상품이 배송지로 출발했습니다.',
      });

      if (order.trackingNumber) {
        events.push({
          time: new Date(shippedTime).toLocaleString('ko-KR'),
          location: '배송 출발지',
          status: 'in_transit',
          description: `${order.courierCompany || '택배사'}로 상품이 전달되었습니다. (송장번호: ${order.trackingNumber})`,
        });
      }
    }
  }

  // 배송 완료
  if (order.status === 'delivered' && order.deliveredAt) {
    events.push({
      time: new Date(order.deliveredAt).toLocaleString('ko-KR'),
      location: order.shippingAddress.address1,
      status: 'delivered',
      description: '배송이 완료되었습니다.',
    });
  }

  return events.reverse(); // 최신순
};

export default function TrackingPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user && orderId) {
      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, orderId]);

  const fetchOrder = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order || data);
      } else {
        alert('주문 정보를 불러올 수 없습니다.');
        router.push('/orders');
      }
    } catch (error) {
      console.error('주문 조회 오류:', error);
      alert('주문 정보를 불러오는 중 오류가 발생했습니다.');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">주문을 찾을 수 없습니다</h2>
            <Button asChild className="mt-4">
              <Link href="/orders">주문 내역으로 돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 배송 추적 정보가 없는 경우
  if (!order.trackingNumber && !order.partnerOrders?.some(po => po.trackingNumber)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">배송 추적 정보가 없습니다</h2>
            <p className="text-gray-600 mb-6">
              아직 배송이 시작되지 않았거나 배송 정보가 등록되지 않았습니다.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" asChild>
                <Link href="/orders">주문 내역</Link>
              </Button>
              <Button asChild>
                <Link href={`/orders/${orderId}`}>주문 상세</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const trackingEvents = generateTrackingEvents(order);
  const currentStatus = order.status;

  const statusLabels = {
    pending: { label: '주문 대기', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    confirmed: { label: '주문 확인', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    shipped: { label: '배송 중', color: 'text-purple-600', bgColor: 'bg-purple-100' },
    delivered: { label: '배송 완료', color: 'text-green-600', bgColor: 'bg-green-100' },
  };

  const getStatusIcon = (eventStatus: string) => {
    switch (eventStatus) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_transit':
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              주문 내역으로 돌아가기
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">배송 추적</h1>
              <p className="text-gray-600 mt-2">주문번호: {order.orderNumber}</p>
            </div>
            {currentStatus && statusLabels[currentStatus as keyof typeof statusLabels] && (
              <div className={`px-4 py-2 rounded-full ${statusLabels[currentStatus as keyof typeof statusLabels].bgColor}`}>
                <span className={`font-semibold ${statusLabels[currentStatus as keyof typeof statusLabels].color}`}>
                  {statusLabels[currentStatus as keyof typeof statusLabels].label}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 배송 추적 타임라인 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 송장 번호 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  송장 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.trackingNumber && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-blue-900">택배사</span>
                      <span className="text-sm text-blue-800">{order.courierCompany || '미지정'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-blue-900">송장 번호</span>
                      <span className="text-sm font-mono text-blue-800">{order.trackingNumber}</span>
                    </div>
                    {order.courierCompany && (
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full"
                        >
                          <a
                            href={`https://www.cjlogistics.com/ko/tool/parcel/tracking?gnbInvcNo=${order.trackingNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            택배사 홈페이지에서 추적하기
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {order.partnerOrders?.map((po, index) => 
                  po.trackingNumber && (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-blue-900">택배사</span>
                        <span className="text-sm text-blue-800">{po.courierCompany || '미지정'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-blue-900">송장 번호</span>
                        <span className="text-sm font-mono text-blue-800">{po.trackingNumber}</span>
                      </div>
                    </div>
                  )
                )}
              </CardContent>
            </Card>

            {/* 배송 추적 타임라인 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  배송 추적
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {trackingEvents.map((event, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(event.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900">{event.description}</p>
                          <p className="text-xs text-gray-500">{event.time}</p>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                        {index < trackingEvents.length - 1 && (
                          <div className="mt-4 ml-2.5 h-8 w-0.5 bg-gray-200"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 배송지 정보 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>배송지 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">받는 사람</p>
                  <p className="font-medium">{order.shippingAddress.recipient}</p>
                </div>
                {order.shippingAddress.phone && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">연락처</p>
                    <p className="font-medium">{order.shippingAddress.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">주소</p>
                  <p className="font-medium">
                    ({order.shippingAddress.zipCode})<br />
                    {order.shippingAddress.address1}<br />
                    {order.shippingAddress.address2}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>안내사항</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• 배송 추적 정보는 택배사 시스템과 실시간으로 연동됩니다.</p>
                <p>• 배송 상태 업데이트에 약간의 지연이 있을 수 있습니다.</p>
                <p>• 배송 관련 문의는 고객센터로 연락주시기 바랍니다.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

