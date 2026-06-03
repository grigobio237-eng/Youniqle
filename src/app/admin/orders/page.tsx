'use client';

import { useState, useEffect } from 'react';
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
  Download,
  Users,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Edit,
  Save,
  CheckSquare,
  Square,
  FileDown
} from 'lucide-react';
import { toast } from 'sonner';
import { canTransitionTo, STATUS_INFO } from '@/lib/orderStatusRules';
import OrderAnalytics from '@/components/admin/OrderAnalytics';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';

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
    partnerName?: string;
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
  confirmed: 'bg-primary-container text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  shipped: 'bg-secondary-container text-purple-800',
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
  refunded: 'bg-gray-100 text-obsidian'
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [activeView, setActiveView] = useState<'list' | 'analytics'>('list');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalAttempts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState({
    trackingNumber: '',
    courierCompany: '',
  });
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'status' | 'tracking' | null>(null);
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkTrackingInfo, setBulkTrackingInfo] = useState({
    trackingNumber: '',
    courierCompany: '',
  });
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [downloadFilters, setDownloadFilters] = useState({
    format: 'csv' as 'csv' | 'excel',
    status: 'all',
    paymentStatus: 'all',
    startDate: '',
    endDate: '',
    selectedOnly: false,
  });

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders', {
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

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/orders/stats', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('통계 조회 오류:', error);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
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
        fetchStats();
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
    setTrackingInfo({
      trackingNumber: order.trackingNumber || '',
      courierCompany: order.courierCompany || '',
    });
    setIsDetailDialogOpen(true);
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;

    if (selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered') {
      if (!trackingInfo.trackingNumber || !trackingInfo.courierCompany) {
        toast.error('송장 번호와 택배사를 모두 입력해주세요.');
        return;
      }
    }

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder._id}/tracking`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(trackingInfo),
      });

      if (response.ok) {
        toast.success('송장 정보가 저장되었습니다.');
        setIsDetailDialogOpen(false);
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

  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(order => order._id)));
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedOrders.size === 0) return;

    try {
      const response = await fetch('/api/admin/orders/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          orderIds: Array.from(selectedOrders),
          status: bulkStatus,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || '주문 상태가 업데이트되었습니다.');
        setSelectedOrders(new Set());
        setIsBulkActionDialogOpen(false);
        setBulkActionType(null);
        fetchOrders();
        fetchStats();
      } else {
        toast.error(data.error || '일괄 상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('일괄 상태 변경 오류:', error);
      toast.error('일괄 상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleBulkTrackingUpdate = async () => {
    if (!bulkTrackingInfo.trackingNumber || !bulkTrackingInfo.courierCompany || selectedOrders.size === 0) {
      toast.error('송장 번호와 택배사를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/admin/orders/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          orderIds: Array.from(selectedOrders),
          trackingNumber: bulkTrackingInfo.trackingNumber,
          courierCompany: bulkTrackingInfo.courierCompany,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || '송장 정보가 입력되었습니다.');
        setSelectedOrders(new Set());
        setIsBulkActionDialogOpen(false);
        setBulkActionType(null);
        setBulkTrackingInfo({ trackingNumber: '', courierCompany: '' });
        fetchOrders();
      } else {
        toast.error(data.error || '일괄 송장 정보 입력에 실패했습니다.');
      }
    } catch (error) {
      console.error('일괄 송장 정보 입력 오류:', error);
      toast.error('일괄 송장 정보 입력 중 오류가 발생했습니다.');
    }
  };

  const handleDownload = async () => {
    try {
      const params = new URLSearchParams();
      params.append('format', downloadFilters.format);
      if (downloadFilters.status !== 'all') params.append('status', downloadFilters.status);
      if (downloadFilters.paymentStatus !== 'all') params.append('paymentStatus', downloadFilters.paymentStatus);
      if (downloadFilters.startDate) params.append('startDate', downloadFilters.startDate);
      if (downloadFilters.endDate) params.append('endDate', downloadFilters.endDate);
      if (downloadFilters.selectedOnly && selectedOrders.size > 0) {
        params.append('orderIds', Array.from(selectedOrders).join(','));
      }

      const response = await fetch(`/api/admin/orders/export?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        if (downloadFilters.format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success('주문 내역이 다운로드되었습니다.');
        } else {
          const data = await response.json();
          // Excel 파일 생성 (클라이언트 측)
          const jsonData = JSON.stringify(data.data, null, 2);
          const blob = new Blob([jsonData], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `orders_${new Date().toISOString().split('T')[0]}.json`;
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
      (order.orderNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (order.customer?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (order.customer?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());

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
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">주문을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">주문 관리</h1>
          <p className="text-obsidian mt-1">전체 주문을 관리하고 처리하세요</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeView === 'list' ? 'default' : 'outline'}
            onClick={() => setActiveView('list')}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            주문 목록
          </Button>
          <Button
            variant={activeView === 'analytics' ? 'default' : 'outline'}
            onClick={() => setActiveView('analytics')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            분석 대시보드
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsDownloadDialogOpen(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            주문 내역 다운로드
          </Button>
          {selectedOrders.size > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setBulkActionType('status');
                  setIsBulkActionDialogOpen(true);
                }}
              >
                일괄 상태 변경 ({selectedOrders.size})
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setBulkActionType('tracking');
                  setIsBulkActionDialogOpen(true);
                }}
              >
                일괄 송장 입력 ({selectedOrders.size})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 분석 대시보드 */}
      {activeView === 'analytics' && <OrderAnalytics />}

      {/* 주문 목록 */}
      {activeView === 'list' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-container rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-foreground/70">총 주문 (결제)</p>
                    <p className="font-bold text-xl">{stats.totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-foreground/70">주문 시도</p>
                    <p className="font-bold text-xl">{stats.totalAttempts || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-foreground/70">총 매출</p>
                    <p className="font-bold text-xl">₩{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-foreground/70">처리 대기</p>
                    <p className="font-bold text-xl">{stats.pendingOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-secondary-container rounded-lg">
                    <CheckCircle className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-foreground/70">완료된 주문</p>
                    <p className="font-bold text-xl">{stats.completedOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/70 h-4 w-4" />
                  <Input
                    placeholder="주문번호, 고객명, 이메일로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
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
          < div className="space-y-4" >
            {
              filteredOrders.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAll}
                        >
                          {selectedOrders.size === filteredOrders.length ? (
                            <CheckSquare className="h-4 w-4 mr-2" />
                          ) : (
                            <Square className="h-4 w-4 mr-2" />
                          )}
                          전체 선택
                        </Button>
                        <span className="text-sm text-obsidian">
                          {selectedOrders.size}개 선택됨
                        </span>
                      </div>
                      {selectedOrders.size > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrders(new Set())}
                        >
                          선택 해제
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            }
            {
              filteredOrders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 mx-auto text-foreground/70 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">주문이 없습니다</h3>
                    <p className="text-obsidian">아직 주문된 상품이 없습니다.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredOrders.map((order) => (
                  <Card key={order._id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* 체크박스 */}
                        <div className="flex items-start">
                          <Checkbox
                            checked={selectedOrders.has(order._id)}
                            onCheckedChange={() => handleSelectOrder(order._id)}
                            className="mt-1"
                          />
                        </div>
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
                              <h4 className="font-medium text-obsidian mb-2">고객 정보</h4>
                              <p className="text-sm text-obsidian">{order.customer.name}</p>
                              <p className="text-sm text-obsidian">{order.customer.email}</p>
                              <p className="text-sm text-obsidian">{order.customer.phone}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-obsidian mb-2">배송지</h4>
                              <p className="text-sm text-obsidian">{order.shippingAddress.name}</p>
                              <p className="text-sm text-obsidian">{order.shippingAddress.phone}</p>
                              <p className="text-sm text-obsidian">
                                {order.shippingAddress.address} {order.shippingAddress.detail}
                              </p>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="mb-4">
                            <h4 className="font-medium text-obsidian mb-2">주문 상품</h4>
                            <div className="space-y-2">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-surface rounded-lg">
                                  <Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized                                     src={item.image}
                                    alt={item.productName}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium">{item.productName}</p>
                                    <p className="text-sm text-obsidian">
                                      {item.quantity}개 × ₩{item.price.toLocaleString()}
                                    </p>
                                    {item.partnerName && (
                                      <p className="text-xs text-primary">파트너: {item.partnerName}</p>
                                    )}
                                  </div>
                                  <p className="font-semibold">
                                    ₩{(item.quantity * item.price).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-obsidian">
                              주문일: {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                            </div>
                            <div className="text-lg font-bold text-primary">
                              총 ₩{order.totalAmount.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* 송장 정보 표시 */}
                        {(order.status === 'shipped' || order.status === 'delivered') && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Truck className="h-4 w-4 text-primary" />
                              <span className="text-sm font-semibold text-blue-900">배송 정보</span>
                            </div>
                            {order.trackingNumber ? (
                              <div className="text-sm text-blue-800">
                                <p>택배사: {order.courierCompany || '미입력'}</p>
                                <p>송장번호: {order.trackingNumber}</p>
                                {order.shippedAt && (
                                  <p className="text-xs text-obsidian">
                                    배송일: {new Date(order.shippedAt).toLocaleDateString('ko-KR')}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-primary">송장 정보가 등록되지 않았습니다.</p>
                            )}
                          </div>
                        )}

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

                          {/* 동적으로 상태 변경 버튼 생성 */}
                          {['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'].map((status) => {
                            if (canTransitionTo(order.status, status, 'admin')) {
                              const statusInfo = STATUS_INFO[status as keyof typeof STATUS_INFO];
                              return (
                                <Button
                                  key={status}
                                  size="sm"
                                  variant={status === 'cancelled' ? 'destructive' : 'default'}
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
              )
            }
          </div >
        </>
      )
      }

      {/* 주문 상세 다이얼로그 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>주문 상세 정보</DialogTitle>
            <DialogDescription>
              주문 정보를 확인하고 배송 정보를 입력하세요
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* 주문 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">주문번호</h4>
                  <p>{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">주문 상태</h4>
                  <Badge className={statusColors[selectedOrder.status as keyof typeof statusColors]}>
                    {statusLabels[selectedOrder.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">결제 상태</h4>
                  <Badge className={paymentStatusColors[selectedOrder.paymentStatus as keyof typeof paymentStatusColors]}>
                    {paymentStatusLabels[selectedOrder.paymentStatus as keyof typeof paymentStatusLabels]}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">주문일</h4>
                  <p>{new Date(selectedOrder.createdAt).toLocaleString('ko-KR')}</p>
                </div>
              </div>

              {/* 배송 정보 입력 */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">배송 정보</h4>
                <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="CJ대한통운">CJ대한통운</SelectItem>
                        <SelectItem value="한진택배">한진택배</SelectItem>
                        <SelectItem value="로젠택배">로젠택배</SelectItem>
                        <SelectItem value="롯데택배">롯데택배</SelectItem>
                        <SelectItem value="쿠팡">쿠팡</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="trackingNumber">송장번호 *</Label>
                    <Input
                      id="trackingNumber"
                      value={trackingInfo.trackingNumber}
                      onChange={(e) => setTrackingInfo(prev => ({ ...prev, trackingNumber: e.target.value }))}
                      placeholder="송장번호 입력"
                    />
                  </div>
                </div>
                {(selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered') && (
                  <Button
                    onClick={handleSaveTracking}
                    className="mt-4"
                    disabled={!trackingInfo.trackingNumber || !trackingInfo.courierCompany}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    송장 정보 저장
                  </Button>
                )}
              </div>

              {/* 주문 상품 */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">주문 상품</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-surface rounded-lg">
                      <Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized                         src={item.image}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-obsidian">
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

              {/* 고객 정보 */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">고객 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-obsidian">이름</p>
                    <p className="font-medium">{selectedOrder.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-obsidian">이메일</p>
                    <p className="font-medium">{selectedOrder.customer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-obsidian">전화번호</p>
                    <p className="font-medium">{selectedOrder.customer.phone}</p>
                  </div>
                </div>
              </div>

              {/* 배송지 */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">배송지</h4>
                <div className="space-y-2">
                  <p>{selectedOrder.shippingAddress.name}</p>
                  <p>{selectedOrder.shippingAddress.phone}</p>
                  <p>
                    ({selectedOrder.shippingAddress.zipCode}) {selectedOrder.shippingAddress.address} {selectedOrder.shippingAddress.detail}
                  </p>
                </div>
              </div>

              {/* 주문 금액 */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">총 주문 금액</span>
                  <span className="text-2xl font-bold text-primary">
                    ₩{selectedOrder.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 일괄 작업 다이얼로그 */}
      <Dialog open={isBulkActionDialogOpen} onOpenChange={setIsBulkActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkActionType === 'status' ? '일괄 상태 변경' : '일괄 송장 정보 입력'}
            </DialogTitle>
            <DialogDescription>
              선택된 {selectedOrders.size}개의 주문에 대해 {bulkActionType === 'status' ? '상태를 변경' : '송장 정보를 입력'}합니다.
            </DialogDescription>
          </DialogHeader>
          {bulkActionType === 'status' && (
            <div className="space-y-4">
              <div>
                <Label>상태 선택</Label>
                <Select value={bulkStatus} onValueChange={setBulkStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="상태를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">주문 확인</SelectItem>
                    <SelectItem value="preparing">상품 준비중</SelectItem>
                    <SelectItem value="shipped">배송중</SelectItem>
                    <SelectItem value="delivered">배송완료</SelectItem>
                    <SelectItem value="cancelled">주문 취소</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {bulkActionType === 'tracking' && (
            <div className="space-y-4">
              <div>
                <Label>택배사 *</Label>
                <Select
                  value={bulkTrackingInfo.courierCompany}
                  onValueChange={(value) => setBulkTrackingInfo(prev => ({ ...prev, courierCompany: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="택배사 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CJ대한통운">CJ대한통운</SelectItem>
                    <SelectItem value="한진택배">한진택배</SelectItem>
                    <SelectItem value="로젠택배">로젠택배</SelectItem>
                    <SelectItem value="롯데택배">롯데택배</SelectItem>
                    <SelectItem value="쿠팡">쿠팡</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>송장번호 *</Label>
                <Input
                  value={bulkTrackingInfo.trackingNumber}
                  onChange={(e) => setBulkTrackingInfo(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  placeholder="송장번호 입력"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsBulkActionDialogOpen(false);
              setBulkActionType(null);
              setBulkStatus('');
              setBulkTrackingInfo({ trackingNumber: '', courierCompany: '' });
            }}>
              취소
            </Button>
            <Button
              onClick={bulkActionType === 'status' ? handleBulkStatusUpdate : handleBulkTrackingUpdate}
              disabled={
                (bulkActionType === 'status' && !bulkStatus) ||
                (bulkActionType === 'tracking' && (!bulkTrackingInfo.trackingNumber || !bulkTrackingInfo.courierCompany))
              }
            >
              적용
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
              다운로드할 주문 내역의 옵션을 선택하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>파일 형식</Label>
              <Select
                value={downloadFilters.format}
                onValueChange={(value) => setDownloadFilters(prev => ({ ...prev, format: value as 'csv' | 'excel' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel (JSON)</SelectItem>
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
                <Label>시작일</Label>
                <Input
                  type="date"
                  value={downloadFilters.startDate}
                  onChange={(e) => setDownloadFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label>종료일</Label>
                <Input
                  type="date"
                  value={downloadFilters.endDate}
                  onChange={(e) => setDownloadFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            {selectedOrders.size > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="selectedOnly"
                  checked={downloadFilters.selectedOnly}
                  onCheckedChange={(checked) => setDownloadFilters(prev => ({ ...prev, selectedOnly: checked as boolean }))}
                />
                <Label htmlFor="selectedOnly" className="cursor-pointer">
                  선택된 주문만 다운로드 ({selectedOrders.size}개)
                </Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDownloadDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleDownload}>
              <FileDown className="h-4 w-4 mr-2" />
              다운로드
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
