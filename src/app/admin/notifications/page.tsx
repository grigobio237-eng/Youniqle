'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Bell, 
  Search, 
  Filter, 
  Plus, 
  Send, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Mail,
  Smartphone,
  MessageSquare,
  Users,
  BarChart3,
  Truck,
  Megaphone,
  Settings,
  Shield
} from 'lucide-react';
import Link from 'next/link';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'shipping' | 'promotion' | 'newsletter' | 'system' | 'marketing' | 'partner' | 'admin';
  category: 'info' | 'success' | 'warning' | 'error' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  priority: number;
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  targetUsers: number;
  deliveryResults?: {
    email?: { success: boolean; error?: string; sentAt: string };
    push?: { success: boolean; error?: string; sentAt: string };
    sms?: { success: boolean; error?: string; sentAt: string };
    inApp?: { success: boolean; sentAt: string };
  };
  createdBy: {
    name: string;
    email: string;
  };
}

interface NotificationStats {
  total: number;
  pending: number;
  sent: number;
  delivered: number;
  failed: number;
  read: number;
  unread: number;
  totalUsers: number;
  avgDeliveryTime: number;
  successRate: number;
}

export default function NotificationDashboard() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNotificationData();
  }, [currentPage, statusFilter, typeFilter, categoryFilter, searchTerm]);

  const fetchNotificationData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/notifications?${params}`);
      
      if (!response.ok) {
        throw new Error('알림 데이터를 불러올 수 없습니다.');
      }
      
      const data = await response.json();
      setNotifications(data.notifications);
      setStats(data.stats);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch notification data:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchNotificationData();
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleTypeChange = (type: string) => {
    setTypeFilter(type);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">대기중</Badge>;
      case 'sent':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">전송됨</Badge>;
      case 'delivered':
        return <Badge variant="default" className="bg-green-100 text-green-800">전달됨</Badge>;
      case 'failed':
        return <Badge variant="destructive">실패</Badge>;
      case 'read':
        return <Badge variant="secondary">읽음</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'info':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">정보</Badge>;
      case 'success':
        return <Badge variant="outline" className="bg-green-100 text-green-800">성공</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">경고</Badge>;
      case 'error':
        return <Badge variant="destructive">오류</Badge>;
      case 'urgent':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">긴급</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Bell className="h-4 w-4" />;
      case 'payment':
        return <CheckCircle className="h-4 w-4" />;
      case 'shipping':
        return <Truck className="h-4 w-4" />;
      case 'promotion':
        return <Megaphone className="h-4 w-4" />;
      case 'newsletter':
        return <Mail className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      case 'marketing':
        return <BarChart3 className="h-4 w-4" />;
      case 'partner':
        return <Users className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'order':
        return '주문';
      case 'payment':
        return '결제';
      case 'shipping':
        return '배송';
      case 'promotion':
        return '프로모션';
      case 'newsletter':
        return '뉴스레터';
      case 'system':
        return '시스템';
      case 'marketing':
        return '마케팅';
      case 'partner':
        return '파트너';
      case 'admin':
        return '관리자';
      default:
        return type;
    }
  };

  const getChannelIcons = (channels: any) => {
    const icons = [];
    if (channels.email) icons.push(<Mail className="h-3 w-3" />);
    if (channels.push) icons.push(<Smartphone className="h-3 w-3" />);
    if (channels.sms) icons.push(<MessageSquare className="h-3 w-3" />);
    if (channels.inApp) icons.push(<Bell className="h-3 w-3" />);
    return icons;
  };

  const getDeliveryStatus = (deliveryResults: any) => {
    if (!deliveryResults) return '-';
    
    const channels = Object.keys(deliveryResults);
    const successful = channels.filter(channel => deliveryResults[channel]?.success).length;
    const total = channels.length;
    
    return `${successful}/${total}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>알림 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <Bell className="h-16 w-16 mx-auto mb-4" />
            <p className="text-lg">알림 데이터를 불러올 수 없습니다</p>
            <p className="text-sm text-gray-500 mt-2">{error}</p>
          </div>
          <Button onClick={fetchNotificationData} variant="outline">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">알림 관리</h1>
          <p className="text-gray-600 mt-1">알림 전송, 관리 및 성과 분석</p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/admin/notifications/send">
              <Send className="h-4 w-4 mr-2" />
              알림 발송
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/notifications/templates">
              <Bell className="h-4 w-4 mr-2" />
              템플릿 관리
            </Link>
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 알림</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total?.toLocaleString() || '0'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">대기중</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending?.toLocaleString() || '0'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전송됨</CardTitle>
              <Send className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.sent?.toLocaleString() || '0'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전달됨</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.delivered?.toLocaleString() || '0'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">실패</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed?.toLocaleString() || '0'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">성공률</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.successRate?.toFixed(1) || '0.0'}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="제목, 메시지로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">모든 상태</option>
                <option value="pending">대기중</option>
                <option value="sent">전송됨</option>
                <option value="delivered">전달됨</option>
                <option value="failed">실패</option>
                <option value="read">읽음</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">모든 타입</option>
                <option value="order">주문</option>
                <option value="payment">결제</option>
                <option value="shipping">배송</option>
                <option value="promotion">프로모션</option>
                <option value="newsletter">뉴스레터</option>
                <option value="system">시스템</option>
                <option value="marketing">마케팅</option>
                <option value="partner">파트너</option>
                <option value="admin">관리자</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">모든 카테고리</option>
                <option value="info">정보</option>
                <option value="success">성공</option>
                <option value="warning">경고</option>
                <option value="error">오류</option>
                <option value="urgent">긴급</option>
              </select>
              <Button variant="outline" onClick={fetchNotificationData}>
                <Filter className="h-4 w-4 mr-2" />
                필터
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 알림 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>알림 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제목</TableHead>
                <TableHead>타입</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>채널</TableHead>
                <TableHead>우선순위</TableHead>
                <TableHead>대상 사용자</TableHead>
                <TableHead>전달 상태</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead>생성자</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {notification.message}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(notification.type)}
                      <span>{getTypeLabel(notification.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getCategoryBadge(notification.category)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(notification.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {getChannelIcons(notification.channels)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{notification.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{notification.targetUsers.toLocaleString()}명</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{getDeliveryStatus(notification.deliveryResults)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(notification.createdAt)}</div>
                      {notification.sentAt && (
                        <div className="text-gray-500">
                          전송: {formatDate(notification.sentAt)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{notification.createdBy.name}</div>
                      <div className="text-gray-500">{notification.createdBy.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                페이지 {currentPage} / {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  이전
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  다음
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
