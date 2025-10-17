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
  Megaphone, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  Pause,
  Square,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

interface Promotion {
  _id: string;
  name: string;
  description?: string;
  type: 'discount' | 'bundle' | 'free_shipping' | 'buy_x_get_y' | 'flash_sale' | 'seasonal';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  discountType?: 'percentage' | 'fixed' | 'free_item';
  discountValue?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usageCount: number;
  priority: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  createdBy: {
    name: string;
    email: string;
  };
  stats?: {
    totalViews: number;
    totalClicks: number;
    totalOrders: number;
    totalRevenue: number;
    conversionRate: number;
    avgOrderValue: number;
  };
}

interface PromotionStats {
  total: number;
  active: number;
  draft: number;
  paused: number;
  completed: number;
  cancelled: number;
  totalUsage: number;
  totalRevenue: number;
}

export default function PromotionDashboard() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [stats, setStats] = useState<PromotionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPromotionData();
  }, [currentPage, statusFilter, typeFilter, searchTerm]);

  const fetchPromotionData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/promotions?${params}`);
      
      if (!response.ok) {
        throw new Error('프로모션 데이터를 불러올 수 없습니다.');
      }
      
      const data = await response.json();
      setPromotions(data.promotions);
      setStats(data.stats);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch promotion data:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPromotionData();
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleTypeChange = (type: string) => {
    setTypeFilter(type);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">활성</Badge>;
      case 'draft':
        return <Badge variant="secondary">초안</Badge>;
      case 'paused':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">일시정지</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">완료</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">취소</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return <DollarSign className="h-4 w-4" />;
      case 'bundle':
        return <Users className="h-4 w-4" />;
      case 'free_shipping':
        return <Megaphone className="h-4 w-4" />;
      case 'buy_x_get_y':
        return <TrendingUp className="h-4 w-4" />;
      case 'flash_sale':
        return <Clock className="h-4 w-4" />;
      case 'seasonal':
        return <Megaphone className="h-4 w-4" />;
      default:
        return <Megaphone className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'discount':
        return '할인';
      case 'bundle':
        return '번들';
      case 'free_shipping':
        return '무료배송';
      case 'buy_x_get_y':
        return 'Buy X Get Y';
      case 'flash_sale':
        return '플래시 세일';
      case 'seasonal':
        return '시즌';
      default:
        return type;
    }
  };

  const isActive = (status: string, startDate: string, endDate: string) => {
    if (status !== 'active') return false;
    const now = new Date();
    return new Date(startDate) <= now && new Date(endDate) >= now;
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return '만료됨';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}일 ${hours}시간`;
    return `${hours}시간`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>프로모션 데이터를 불러오는 중...</p>
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
            <Megaphone className="h-16 w-16 mx-auto mb-4" />
            <p className="text-lg">프로모션 데이터를 불러올 수 없습니다</p>
            <p className="text-sm text-gray-500 mt-2">{error}</p>
          </div>
          <Button onClick={fetchPromotionData} variant="outline">
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
          <h1 className="text-3xl font-bold text-gray-900">프로모션 관리</h1>
          <p className="text-gray-600 mt-1">프로모션 생성, 관리 및 성과 분석</p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/admin/promotions/create">
              <Plus className="h-4 w-4 mr-2" />
              프로모션 생성
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/promotions/analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              성과 분석
            </Link>
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 프로모션</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">초안</CardTitle>
              <Edit className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.draft.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">일시정지</CardTitle>
              <Pause className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.paused.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.completed.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 사용</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalUsage.toLocaleString()}</div>
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
                  placeholder="프로모션 이름, 설명으로 검색..."
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
                <option value="active">활성</option>
                <option value="draft">초안</option>
                <option value="paused">일시정지</option>
                <option value="completed">완료</option>
                <option value="cancelled">취소</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">모든 타입</option>
                <option value="discount">할인</option>
                <option value="bundle">번들</option>
                <option value="free_shipping">무료배송</option>
                <option value="buy_x_get_y">Buy X Get Y</option>
                <option value="flash_sale">플래시 세일</option>
                <option value="seasonal">시즌</option>
              </select>
              <Button variant="outline" onClick={fetchPromotionData}>
                <Filter className="h-4 w-4 mr-2" />
                필터
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 프로모션 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>프로모션 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>타입</TableHead>
                <TableHead>할인 정보</TableHead>
                <TableHead>사용 제한</TableHead>
                <TableHead>사용 횟수</TableHead>
                <TableHead>유효 기간</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>우선순위</TableHead>
                <TableHead>성과</TableHead>
                <TableHead>생성자</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promotion) => (
                <TableRow key={promotion._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{promotion.name}</div>
                      {promotion.description && (
                        <div className="text-sm text-gray-500">{promotion.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(promotion.type)}
                      <span>{getTypeLabel(promotion.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {promotion.discountType && promotion.discountValue ? (
                      <div>
                        <div className="font-medium">
                          {promotion.discountType === 'percentage' 
                            ? `${promotion.discountValue}%` 
                            : `₩${promotion.discountValue.toLocaleString()}`
                          }
                        </div>
                        {promotion.minOrderAmount && (
                          <div className="text-sm text-gray-500">
                            최소 ₩{promotion.minOrderAmount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {promotion.usageLimit ? (
                      <span>{promotion.usageLimit.toLocaleString()}회</span>
                    ) : (
                      <span className="text-gray-500">제한 없음</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{promotion.usageCount.toLocaleString()}</span>
                      {promotion.usageLimit && (
                        <div className="text-sm text-gray-500">
                          ({Math.round((promotion.usageCount / promotion.usageLimit) * 100)}%)
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(promotion.startDate)}</div>
                      <div className="text-gray-500">~ {formatDate(promotion.endDate)}</div>
                      {isActive(promotion.status, promotion.startDate, promotion.endDate) && (
                        <div className="text-green-600 text-xs">
                          {getTimeRemaining(promotion.endDate)} 남음
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      {getStatusBadge(promotion.status)}
                      {isExpired(promotion.endDate) && (
                        <Badge variant="destructive" className="text-xs">만료됨</Badge>
                      )}
                      {isActive(promotion.status, promotion.startDate, promotion.endDate) && (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800">진행중</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{promotion.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    {promotion.stats ? (
                      <div className="text-sm">
                        <div>주문: {promotion.stats.totalOrders}</div>
                        <div>매출: ₩{promotion.stats.totalRevenue.toLocaleString()}</div>
                        <div>전환율: {promotion.stats.conversionRate.toFixed(1)}%</div>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{promotion.createdBy.name}</div>
                      <div className="text-gray-500">{promotion.createdBy.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {promotion.status === 'active' ? (
                        <Button variant="ghost" size="sm">
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : promotion.status === 'paused' ? (
                        <Button variant="ghost" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
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
