'use client';

import { useState, useEffect } from 'react';
import PartnerLayout from '@/components/partner/PartnerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Eye,
  Truck,
  Clock,
  AlertCircle,
  CheckCircle,
  Star,
  Users,
  FileText,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalCommission: number;
  pendingCommission: number;
  recentOrders: Array<{
    id: string;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: Array<{
      name: string;
      quantity: number;
    }>;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  notifications: Array<{
    id: string;
    type: 'order' | 'payment' | 'product' | 'system';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>;
}

function PartnerDashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/partner/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: '총 상품 수',
      value: stats?.totalProducts || 0,
      active: stats?.activeProducts || 0,
      icon: Package,
      color: 'text-blue-600',
      href: '/partner/products'
    },
    {
      title: '총 주문 수',
      value: stats?.totalOrders || 0,
      pending: stats?.pendingOrders || 0,
      icon: ShoppingCart,
      color: 'text-green-600',
      href: '/partner/orders'
    },
    {
      title: '총 매출',
      value: `₩${(stats?.totalRevenue || 0).toLocaleString()}`,
      monthly: `₩${(stats?.monthlyRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      href: '/partner/analytics'
    },
    {
      title: '총 수수료',
      value: `₩${(stats?.totalCommission || 0).toLocaleString()}`,
      pending: `₩${(stats?.pendingCommission || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-orange-600',
      href: '/partner/settings'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center space-x-1"><Clock className="h-3 w-3" />대기</Badge>;
      case 'confirmed':
        return <Badge variant="default" className="flex items-center space-x-1"><CheckCircle className="h-3 w-3" />확인</Badge>;
      case 'shipped':
        return <Badge variant="default" className="flex items-center space-x-1"><Truck className="h-3 w-3" />배송중</Badge>;
      case 'delivered':
        return <Badge variant="default" className="flex items-center space-x-1"><CheckCircle className="h-3 w-3" />완료</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="flex items-center space-x-1"><AlertCircle className="h-3 w-3" />취소</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">파트너 대시보드</h1>
          <p className="text-text-secondary mt-1">
            나의 상점 현황 및 매출 통계
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/partner/products?action=new">
              <Package className="h-4 w-4 mr-2" />
              새 상품 등록
            </Link>
          </Button>
          <Button 
            variant="outline"
            asChild
          >
            <Link href="/partner/content">
              <FileText className="h-4 w-4 mr-2" />
              콘텐츠 작성
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-text-primary">
                      {stat.value}
                    </p>
                    {stat.active !== undefined && (
                      <p className="text-xs text-green-600 mt-1">
                        활성: {stat.active}개
                      </p>
                    )}
                    {stat.pending !== undefined && (
                      <p className="text-xs text-orange-600 mt-1">
                        대기: {stat.pending}
                      </p>
                    )}
                    {stat.monthly !== undefined && (
                      <p className="text-xs text-blue-600 mt-1">
                        이번 달: {stat.monthly}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href={stat.href}>
                      자세히 보기
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>최근 주문</span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/partner/orders">
                  <Eye className="h-4 w-4 mr-1" />
                  모두 보기
                </Link>
              </Button>
            </CardTitle>
            <CardDescription>
              최근 들어온 주문들
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentOrders?.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{order.customerName}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-text-secondary">
                      {order.items.map(item => `${item.name} ${item.quantity}개`).join(', ')}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-text-primary">
                      ₩{order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>알림</span>
              <Badge variant="secondary">
                {stats?.notifications?.filter(n => !n.isRead).length || 0}개
              </Badge>
            </CardTitle>
            <CardDescription>
              새로운 알림이 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.notifications?.slice(0, 5).map((notification) => (
                <div key={notification.id} className={`p-3 rounded-lg border ${
                  !notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                }`}>
                  <div className="flex items-start space-x-2">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === 'order' ? 'bg-green-500' :
                      notification.type === 'payment' ? 'bg-blue-500' :
                      notification.type === 'product' ? 'bg-orange-500' : 'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-text-primary">
                        {notification.title}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>인기 상품</CardTitle>
          <CardDescription>
            판매량 기준 상위 상품들
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.topProducts?.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary">{product.name}</h3>
                    <p className="text-sm text-text-secondary">
                      {product.sales}개 판매
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-text-primary">
                    ₩{product.revenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-text-secondary">매출</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 작업</CardTitle>
          <CardDescription>
            자주 사용하는 파트너 기능들
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/partner/products?action=new">
                <Package className="h-6 w-6 mb-2" />
                상품 등록
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/partner/orders">
                <ShoppingCart className="h-6 w-6 mb-2" />
                주문 관리
              </Link>
            </Button>
            <Button 
              variant="outline" 
              disabled 
              className="h-20 flex-col"
              title="준비 중인 기능입니다"
            >
              <FileText className="h-6 w-6 mb-2" />
              콘텐츠 작성 (준비 중)
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/partner/analytics">
                <BarChart3 className="h-6 w-6 mb-2" />
                매출 분석
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PartnerDashboard() {
  return (
    <PartnerLayout>
      <PartnerDashboardContent />
    </PartnerLayout>
  );
}
