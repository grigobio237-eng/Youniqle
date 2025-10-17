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
  Users, 
  Search, 
  Filter, 
  Plus, 
  Play, 
  Pause, 
  Archive,
  Edit,
  Trash2,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Target,
  Zap,
  Crown,
  Star
} from 'lucide-react';
import Link from 'next/link';

interface CustomerSegment {
  _id: string;
  name: string;
  description?: string;
  type: 'static' | 'dynamic' | 'behavioral' | 'predictive' | 'rfm' | 'cohort' | 'custom';
  status: 'active' | 'inactive' | 'archived';
  priority: number;
  rules: Array<{
    id: string;
    field: string;
    operator: string;
    value: any;
    logicalOperator?: string;
  }>;
  stats: {
    totalUsers: number;
    activeUsers: number;
    lastUpdated: Date;
    updateCount: number;
    growthRate: number;
    avgLifetimeValue: number;
    avgOrderValue: number;
    avgOrderFrequency: number;
    churnRate: number;
    engagementScore: number;
  };
  marketing: {
    targetAudience: boolean;
    preferredChannels: string[];
    messageTone: string;
  };
  tags: string[];
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface SegmentStats {
  total: number;
  totalUsers: number;
  active: number;
  inactive: number;
  archived: number;
}

export default function SegmentDashboard() {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [stats, setStats] = useState<SegmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSegments();
  }, [currentPage, statusFilter, typeFilter, searchTerm]);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/segments?${params}`);
      
      if (!response.ok) {
        throw new Error('세그먼트 데이터를 불러올 수 없습니다.');
      }
      
      const data = await response.json();
      setSegments(data.segments);
      setStats(data.stats);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch segments:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSegments();
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleTypeChange = (type: string) => {
    setTypeFilter(type);
    setCurrentPage(1);
  };

  const handleSegmentAction = async (segmentId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/segments/${segmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('세그먼트 액션 실행에 실패했습니다.');
      }

      // 세그먼트 목록 새로고침
      await fetchSegments();
    } catch (error) {
      console.error('Segment action error:', error);
      alert(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
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
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">활성</Badge>;
      case 'inactive':
        return <Badge variant="secondary">비활성</Badge>;
      case 'archived':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">보관됨</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'static':
        return <Users className="h-4 w-4" />;
      case 'dynamic':
        return <Zap className="h-4 w-4" />;
      case 'behavioral':
        return <Target className="h-4 w-4" />;
      case 'predictive':
        return <BarChart3 className="h-4 w-4" />;
      case 'rfm':
        return <Crown className="h-4 w-4" />;
      case 'cohort':
        return <TrendingUp className="h-4 w-4" />;
      case 'custom':
        return <Star className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'static':
        return '정적';
      case 'dynamic':
        return '동적';
      case 'behavioral':
        return '행동';
      case 'predictive':
        return '예측';
      case 'rfm':
        return 'RFM';
      case 'cohort':
        return '코호트';
      case 'custom':
        return '사용자 정의';
      default:
        return type;
    }
  };

  const getToneLabel = (tone: string) => {
    switch (tone) {
      case 'formal':
        return '격식';
      case 'casual':
        return '캐주얼';
      case 'friendly':
        return '친근';
      case 'professional':
        return '전문';
      default:
        return tone;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>세그먼트 데이터를 불러오는 중...</p>
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
            <Users className="h-16 w-16 mx-auto mb-4" />
            <p className="text-lg">세그먼트 데이터를 불러올 수 없습니다</p>
            <p className="text-sm text-gray-500 mt-2">{error}</p>
          </div>
          <Button onClick={fetchSegments} variant="outline">
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
          <h1 className="text-3xl font-bold text-gray-900">고객 세분화 관리</h1>
          <p className="text-gray-600 mt-1">고객별 맞춤 마케팅을 위한 세분화 시스템</p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/admin/segments/create">
              <Plus className="h-4 w-4 mr-2" />
              세그먼트 생성
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/segments/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              분석 대시보드
            </Link>
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 세그먼트</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 고객</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalUsers.toLocaleString()}</div>
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
              <CardTitle className="text-sm font-medium">비활성</CardTitle>
              <XCircle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.inactive.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">보관됨</CardTitle>
              <Archive className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.archived.toLocaleString()}</div>
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
                  placeholder="세그먼트 이름, 설명, 태그로 검색..."
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
                <option value="inactive">비활성</option>
                <option value="archived">보관됨</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">모든 타입</option>
                <option value="static">정적</option>
                <option value="dynamic">동적</option>
                <option value="behavioral">행동</option>
                <option value="predictive">예측</option>
                <option value="rfm">RFM</option>
                <option value="cohort">코호트</option>
                <option value="custom">사용자 정의</option>
              </select>
              <Button variant="outline" onClick={fetchSegments}>
                <Filter className="h-4 w-4 mr-2" />
                필터
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 세그먼트 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>세그먼트 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>세그먼트 이름</TableHead>
                <TableHead>타입</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>고객 수</TableHead>
                <TableHead>성장률</TableHead>
                <TableHead>참여도</TableHead>
                <TableHead>마케팅 설정</TableHead>
                <TableHead>우선순위</TableHead>
                <TableHead>마지막 업데이트</TableHead>
                <TableHead>생성자</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segments.map((segment) => (
                <TableRow key={segment._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{segment.name}</div>
                      {segment.description && (
                        <div className="text-sm text-gray-500">{segment.description}</div>
                      )}
                      {segment.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {segment.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {segment.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{segment.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(segment.type)}
                      <span>{getTypeLabel(segment.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(segment.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{segment.stats.totalUsers.toLocaleString()}</div>
                      <div className="text-gray-500">
                        활성: {segment.stats.activeUsers.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {segment.stats.growthRate > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : segment.stats.growthRate < 0 ? (
                        <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-500" />
                      )}
                      <span className={`text-sm ${
                        segment.stats.growthRate > 0 ? 'text-green-600' :
                        segment.stats.growthRate < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {segment.stats.growthRate > 0 ? '+' : ''}{segment.stats.growthRate.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{segment.stats.engagementScore.toFixed(0)}점</div>
                      <div className="text-gray-500">
                        {segment.stats.engagementScore >= 80 ? '높음' :
                         segment.stats.engagementScore >= 60 ? '보통' : '낮음'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center space-x-1">
                        {segment.marketing.targetAudience ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-gray-400" />
                        )}
                        <span>타겟</span>
                      </div>
                      <div className="text-gray-500">
                        {getToneLabel(segment.marketing.messageTone)}
                      </div>
                      <div className="text-gray-500">
                        {segment.marketing.preferredChannels.join(', ')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{segment.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(segment.stats.lastUpdated.toString())}</div>
                      <div className="text-gray-500">
                        {segment.stats.updateCount}회 업데이트
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{segment.createdBy.name}</div>
                      <div className="text-gray-500">{segment.createdBy.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {segment.status === 'inactive' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSegmentAction(segment._id, 'activate')}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {segment.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSegmentAction(segment._id, 'deactivate')}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSegmentAction(segment._id, 'calculate')}
                      >
                        <Zap className="h-4 w-4" />
                      </Button>
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
