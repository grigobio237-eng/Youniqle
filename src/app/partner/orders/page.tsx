'use client';

import { useState, useEffect } from 'react';
import PartnerLayout from '@/components/partner/PartnerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { canTransitionTo, STATUS_INFO } from '@/lib/orderStatusRules';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    detail: string;
    zipCode: string;
  };
  trackingNumber?: string;
  courierCompany?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

const statusLabels = {
  pending: '주문 대기',
  confirmed: '주문 확인',
  preparing: '상품 준비중',
  shipped: '배송중',
  delivered: '배송완료',
  cancelled: '주문 취소'
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const paymentStatusLabels = {
  pending: '결제 대기',
  paid: '결제완료',
  failed: '결제실패',
  refunded: '환불완료'
};

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800'
};

export default function PartnerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState({
    trackingNumber: '',
    courierCompany: '',
  });
  const [downloadFilters, setDownloadFilters] = useState({
    format: 'csv' as 'csv' | 'json',
    status: 'all',
    paymentStatus: 'all',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/partner/orders', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        toast.error('주문 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('주문 조회 오류:', error);
      toast.error('주문 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    // 배송중 상태로 변경할 때는 송장 번호 입력 다이얼로그 열기
    if (newStatus === 'shipped') {
      const order = orders.find(o => o._id === orderId);
      if (order) {
        setSelectedOrder(order);
        setTrackingInfo({
          trackingNumber: order.trackingNumber || '',
          courierCompany: order.courierCompany || '',
        });
        setIsTrackingDialogOpen(true);
      }
      return;
    }

    try {
      const response = await fetch(`/api/partner/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('주문 상태가 업데이트되었습니다.');
        fetchOrders();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || '주문 상태 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('주문 상태 업데이트 오류:', error);
      toast.error('주문 상태 업데이트 중 오류가 발생했습니다.');
    }
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;

    if (!trackingInfo.trackingNumber || !trackingInfo.courierCompany) {
      toast.error('송장 번호와 택배사를 모두 입력해주세요.');
      return;
    }

    try {
      // 송장 정보 저장과 함께 상태를 배송중으로 변경
      const response = await fetch(`/api/partner/orders/${selectedOrder._id}/tracking`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(trackingInfo),
      });

      if (response.ok) {
        toast.success('송장 정보가 저장되었고 주문 상태가 배송중으로 변경되었습니다.');
        setIsTrackingDialogOpen(false);
        setTrackingInfo({ trackingNumber: '', courierCompany: '' });
        fetchOrders();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || '송장 정보 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('송장 정보 저장 오류:', error);
      toast.error('송장 정보 저장 중 오류가 발생했습니다.');
    }
  };

  const courierCompanies = [
    'CJ대한통운',
    '한진택배',
    '롯데택배',
    '로젠택배',
    '일양로지스',
    'CU편의점택배',
    '한서울택배',
    '경동택배',
    '대신택배',
    '합동택배',
    '한의사랑택배',
    '기타',
  ];

  const handleDownload = async () => {
    try {
      const params = new URLSearchParams();
      params.append('format', downloadFilters.format);
      if (downloadFilters.status !== 'all') params.append('status', downloadFilters.status);
      if (downloadFilters.paymentStatus !== 'all') params.append('paymentStatus', downloadFilters.paymentStatus);
      if (downloadFilters.startDate) params.append('startDate', downloadFilters.startDate);
      if (downloadFilters.endDate) params.append('endDate', downloadFilters.endDate);

      const response = await fetch(`/api/partner/orders/export?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        if (downloadFilters.format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `partner_orders_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success('주문 내역이 다운로드되었습니다.');
        } else {
          const data = await response.json();
          // JSON 파일 생성
          const jsonData = JSON.stringify(data.data, null, 2);
          const blob = new Blob([jsonData], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `partner_orders_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success('주문 내역이 다운로드되었습니다. (JSON 형식)');
        }
        setIsDownloadDialogOpen(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || '다운로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('다운로드 오류:', error);
      toast.error('다운로드 중 오류가 발생했습니다.');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || order.paymentStatus === paymentStatusFilter;
    
    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'preparing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <PartnerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">주문을 불러오는 중...</div>
        </div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">주문 관리</h1>
            <p className="text-gray-600 mt-1">파트너 상품의 주문을 관리하고 처리하세요</p>
          </div>
          <Button variant="outline" onClick={() => setIsDownloadDialogOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            주문 내역 다운로드
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="주문번호, 고객명, 이메일로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="주문 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 상태</SelectItem>
                    <SelectItem value="pending">주문 대기</SelectItem>
                    <SelectItem value="confirmed">주문 확인</SelectItem>
                    <SelectItem value="preparing">상품 준비중</SelectItem>
                    <SelectItem value="shipped">배송중</SelectItem>
                    <SelectItem value="delivered">배송완료</SelectItem>
                    <SelectItem value="cancelled">주문 취소</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="결제 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 결제</SelectItem>
                    <SelectItem value="pending">결제 대기</SelectItem>
                    <SelectItem value="paid">결제완료</SelectItem>
                    <SelectItem value="failed">결제실패</SelectItem>
                    <SelectItem value="refunded">환불완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">주문이 없습니다</h3>
                <p className="text-gray-600">아직 주문된 상품이 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order._id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                        <Badge className={statusColors[order.status]}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{statusLabels[order.status]}</span>
                        </Badge>
                        <Badge className={paymentStatusColors[order.paymentStatus]}>
                          {paymentStatusLabels[order.paymentStatus]}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">고객 정보</h4>
                          <p className="text-sm text-gray-600">{order.customer.name}</p>
                          <p className="text-sm text-gray-600">{order.customer.email}</p>
                          <p className="text-sm text-gray-600">{order.customer.phone}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">배송지</h4>
                          <p className="text-sm text-gray-600">{order.shippingAddress.name}</p>
                          <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
                          <p className="text-sm text-gray-600">
                            {order.shippingAddress.address} {order.shippingAddress.detail}
                          </p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">주문 상품</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1">
                                <p className="font-medium">{item.productName}</p>
                                <p className="text-sm text-gray-600">
                                  {item.quantity}개 × ₩{item.price.toLocaleString()}
                                </p>
                              </div>
                              <p className="font-semibold">
                                ₩{(item.quantity * item.price).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <div>주문일: {new Date(order.createdAt).toLocaleDateString('ko-KR')}</div>
                          {order.trackingNumber && (
                            <div className="mt-1">
                              <span className="font-medium">송장번호: </span>
                              <span>{order.trackingNumber}</span>
                              {order.courierCompany && (
                                <span className="text-gray-500"> ({order.courierCompany})</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-lg font-bold text-primary">
                          총 ₩{order.totalAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:w-48">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleViewDetail(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        상세보기
                      </Button>
                      
                      {/* 동적으로 상태 변경 버튼 생성 (파트너 권한) */}
                      {['confirmed', 'preparing', 'shipped', 'delivered'].map((status) => {
                        if (canTransitionTo(order.status, status, 'partner')) {
                          const statusInfo = STATUS_INFO[status as keyof typeof STATUS_INFO];
                          return (
                            <Button
                              key={status}
                              size="sm"
                              onClick={() => handleStatusUpdate(order._id, status)}
                              className="w-full"
                            >
                              {statusInfo.label}
                            </Button>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* 주문 상세보기 다이얼로그 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>주문 상세 정보</DialogTitle>
            <DialogDescription>
              주문번호: {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* 주문 상태 */}
              <div>
                <Label>주문 상태</Label>
                <div className="flex gap-2 mt-2">
                  <Badge className={statusColors[selectedOrder.status]}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1">{statusLabels[selectedOrder.status]}</span>
                  </Badge>
                  <Badge className={paymentStatusColors[selectedOrder.paymentStatus]}>
                    {paymentStatusLabels[selectedOrder.paymentStatus]}
                  </Badge>
                </div>
              </div>

              {/* 고객 정보 */}
              <div>
                <Label>고객 정보</Label>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">이름: {selectedOrder.customer.name}</p>
                  <p className="text-sm">이메일: {selectedOrder.customer.email}</p>
                  <p className="text-sm">전화번호: {selectedOrder.customer.phone}</p>
                </div>
              </div>

              {/* 배송지 정보 */}
              <div>
                <Label>배송지 정보</Label>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">받는 분: {selectedOrder.shippingAddress.name}</p>
                  <p className="text-sm">전화번호: {selectedOrder.shippingAddress.phone}</p>
                  <p className="text-sm">
                    주소: {selectedOrder.shippingAddress.address} {selectedOrder.shippingAddress.detail}
                  </p>
                  <p className="text-sm">우편번호: {selectedOrder.shippingAddress.zipCode}</p>
                </div>
              </div>

              {/* 송장 정보 */}
              {selectedOrder.trackingNumber && (
                <div>
                  <Label>송장 정보</Label>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">택배사: {selectedOrder.courierCompany}</p>
                    <p className="text-sm">송장번호: {selectedOrder.trackingNumber}</p>
                    {selectedOrder.shippedAt && (
                      <p className="text-sm">배송 시작일: {new Date(selectedOrder.shippedAt).toLocaleDateString('ko-KR')}</p>
                    )}
                  </div>
                </div>
              )}

              {/* 주문 상품 */}
              <div>
                <Label>주문 상품</Label>
                <div className="mt-2 space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity}개 × ₩{item.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ₩{(item.quantity * item.price).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 주문 정보 */}
              <div>
                <Label>주문 정보</Label>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">주문일: {new Date(selectedOrder.createdAt).toLocaleDateString('ko-KR')}</p>
                  <p className="text-sm">최종 수정일: {new Date(selectedOrder.updatedAt).toLocaleDateString('ko-KR')}</p>
                  <p className="text-lg font-bold text-primary mt-2">
                    총 주문 금액: ₩{selectedOrder.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 송장 번호 입력 다이얼로그 */}
      <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>송장 번호 입력</DialogTitle>
            <DialogDescription>
              주문번호: {selectedOrder?.orderNumber}<br />
              배송 중 상태로 변경하려면 송장 번호를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="courierCompany">택배사 *</Label>
              <Select
                value={trackingInfo.courierCompany}
                onValueChange={(value) => setTrackingInfo(prev => ({ ...prev, courierCompany: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="택배사 선택" />
                </SelectTrigger>
                <SelectContent>
                  {courierCompanies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>송장 번호 *</Label>
              <Input
                value={trackingInfo.trackingNumber}
                onChange={(e) => setTrackingInfo(prev => ({ ...prev, trackingNumber: e.target.value }))}
                placeholder="송장 번호를 입력하세요"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTrackingDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveTracking}>
              저장 및 배송중으로 변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 다운로드 다이얼로그 */}
      <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>주문 내역 다운로드</DialogTitle>
            <DialogDescription>
              주문 내역을 CSV 또는 JSON 형식으로 다운로드합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>다운로드 형식</Label>
              <Select
                value={downloadFilters.format}
                onValueChange={(value) => setDownloadFilters(prev => ({ ...prev, format: value as 'csv' | 'json' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel 호환)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>주문 상태</Label>
              <Select
                value={downloadFilters.status}
                onValueChange={(value) => setDownloadFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">주문 대기</SelectItem>
                  <SelectItem value="confirmed">주문 확인</SelectItem>
                  <SelectItem value="preparing">상품 준비중</SelectItem>
                  <SelectItem value="shipped">배송중</SelectItem>
                  <SelectItem value="delivered">배송완료</SelectItem>
                  <SelectItem value="cancelled">주문 취소</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>결제 상태</Label>
              <Select
                value={downloadFilters.paymentStatus}
                onValueChange={(value) => setDownloadFilters(prev => ({ ...prev, paymentStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">결제 대기</SelectItem>
                  <SelectItem value="paid">결제완료</SelectItem>
                  <SelectItem value="failed">결제실패</SelectItem>
                  <SelectItem value="refunded">환불완료</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">시작일</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={downloadFilters.startDate}
                  onChange={(e) => setDownloadFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endDate">종료일</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={downloadFilters.endDate}
                  onChange={(e) => setDownloadFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDownloadDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              다운로드
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PartnerLayout>
  );
}
