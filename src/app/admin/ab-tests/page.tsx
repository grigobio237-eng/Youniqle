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
  FlaskConical,
  Search,
  Filter,
  Plus,
  Play,
  Pause,
  Square,
  Edit,
  Trash2,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Target,
  Mail,
  Globe,
  Megaphone,
  Bell,
  Tag,
  Image,
  MousePointer,
  ShoppingCart,
  RefreshCw,
  Settings,
  DollarSign,
  Brain,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import ABTestAdvancedDashboard from '@/components/admin/ABTestAdvancedDashboard';

interface ABTest {
  _id: string;
  name: string;
  description?: string;
  type: 'email' | 'landing_page' | 'promotion' | 'notification' | 'coupon' | 'banner' | 'button' | 'pricing';
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
  hypothesis: string;
  successMetric: string;
  variants: Array<{
    name: string;
    weight: number;
    isControl: boolean;
  }>;
  startDate: string;
  endDate?: string;
  currentSampleSize: number;
  minSampleSize: number;
  results?: {
    statisticalSignificance: boolean;
    winner?: string;
    recommendation?: string;
  };
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface ABTestStats {
  total: number;
  draft: number;
  running: number;
  paused: number;
  completed: number;
  cancelled: number;
}

export default function ABTestDashboard() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [stats, setStats] = useState<ABTestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAdvancedDashboard, setShowAdvancedDashboard] = useState(false);
  const [selectedTestForDashboard, setSelectedTestForDashboard] = useState<string | null>(null);

  useEffect(() => {
    fetchABTests();
  }, [currentPage, statusFilter, typeFilter, searchTerm]);

  const fetchABTests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/ab-tests?${params}`);
      
      if (!response.ok) {
        throw new Error('A/B 테스트 데이터를 불러올 수 없습니다.');
      }
      
      const data = await response.json();
      setTests(data.tests);
      setStats(data.stats);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch AB tests:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchABTests();
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleTypeChange = (type: string) => {
    setTypeFilter(type);
    setCurrentPage(1);
  };

  const handleTestAction = async (testId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/ab-tests/${testId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('테스트 액션 실행에 실패했습니다.');
      }

      // 테스트 목록 새로고침
      await fetchABTests();
    } catch (error) {
      console.error('Test action error:', error);
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

  const handleViewAdvancedDashboard = (testId: string) => {
    setSelectedTestForDashboard(testId);
    setShowAdvancedDashboard(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">초안</Badge>;
      case 'running':
        return <Badge variant="default" className="bg-green-100 text-green-800">실행중</Badge>;
      case 'paused':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">일시정지</Badge>;
      case 'completed':
        return <Badge variant="secondary">완료</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">취소</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'landing_page':
        return <Globe className="h-4 w-4" />;
      case 'promotion':
        return <Megaphone className="h-4 w-4" />;
      case 'notification':
        return <Bell className="h-4 w-4" />;
      case 'coupon':
        return <Tag className="h-4 w-4" />;
      case 'banner':
        return <Image className="h-4 w-4" />;
      case 'button':
        return <MousePointer className="h-4 w-4" />;
      case 'pricing':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <FlaskConical className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'email':
        return '이메일';
      case 'landing_page':
        return '랜딩페이지';
      case 'promotion':
        return '프로모션';
      case 'notification':
        return '알림';
      case 'coupon':
        return '쿠폰';
      case 'banner':
        return '배너';
      case 'button':
        return '버튼';
      case 'pricing':
        return '가격';
      default:
        return type;
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'conversion_rate':
        return '전환율';
      case 'click_rate':
        return '클릭율';
      case 'open_rate':
        return '오픈율';
      case 'purchase_rate':
        return '구매율';
      case 'engagement_rate':
        return '참여율';
      case 'revenue':
        return '매출';
      case 'custom':
        return '사용자 정의';
      default:
        return metric;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>A/B 테스트 데이터를 불러오는 중...</p>
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
            <FlaskConical className="h-16 w-16 mx-auto mb-4" />
            <p className="text-lg">A/B 테스트 데이터를 불러올 수 없습니다</p>
            <p className="text-sm text-gray-500 mt-2">{error}</p>
          </div>
          <Button onClick={fetchABTests} variant="outline">
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
          <h1 className="text-3xl font-bold text-gray-900">A/B 테스트 관리</h1>
          <p className="text-gray-600 mt-1">마케팅 캠페인 최적화를 위한 A/B 테스트</p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/admin/ab-tests/create">
              <Plus className="h-4 w-4 mr-2" />
              테스트 생성
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/ab-tests/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              분석 대시보드
            </Link>
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 테스트</CardTitle>
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
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
              <CardTitle className="text-sm font-medium">실행중</CardTitle>
              <Play className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.running.toLocaleString()}</div>
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
              <CardTitle className="text-sm font-medium">취소</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelled.toLocaleString()}</div>
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
                  placeholder="테스트 이름, 가설로 검색..."
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
                <option value="draft">초안</option>
                <option value="running">실행중</option>
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
                <option value="email">이메일</option>
                <option value="landing_page">랜딩페이지</option>
                <option value="promotion">프로모션</option>
                <option value="notification">알림</option>
                <option value="coupon">쿠폰</option>
                <option value="banner">배너</option>
                <option value="button">버튼</option>
                <option value="pricing">가격</option>
              </select>
              <Button variant="outline" onClick={fetchABTests}>
                <Filter className="h-4 w-4 mr-2" />
                필터
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* A/B 테스트 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>A/B 테스트 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>테스트 이름</TableHead>
                <TableHead>타입</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>가설</TableHead>
                <TableHead>성공 지표</TableHead>
                <TableHead>변형</TableHead>
                <TableHead>샘플 크기</TableHead>
                <TableHead>기간</TableHead>
                <TableHead>결과</TableHead>
                <TableHead>생성자</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests.map((test) => (
                <TableRow key={test._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{test.name}</div>
                      {test.description && (
                        <div className="text-sm text-gray-500">{test.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(test.type)}
                      <span>{getTypeLabel(test.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(test.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-xs truncate" title={test.hypothesis}>
                      {test.hypothesis}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getMetricLabel(test.successMetric)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{test.variants.length}개 변형</div>
                      <div className="text-gray-500">
                        대조군: {test.variants.find(v => v.isControl)?.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{test.currentSampleSize.toLocaleString()} / {test.minSampleSize.toLocaleString()}</div>
                      <div className="text-gray-500">
                        {Math.round((test.currentSampleSize / test.minSampleSize) * 100)}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>시작: {formatDate(test.startDate)}</div>
                      {test.endDate && (
                        <div className="text-gray-500">종료: {formatDate(test.endDate)}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {test.results ? (
                      <div className="flex flex-col space-y-1">
                        {test.results.statisticalSignificance ? (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            유의함
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            무의미
                          </Badge>
                        )}
                        {test.results.winner && (
                          <Badge variant="secondary" className="text-xs">
                            승자: {test.results.winner}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{test.createdBy.name}</div>
                      <div className="text-gray-500">{test.createdBy.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {test.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestAction(test._id, 'start')}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {test.status === 'running' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestAction(test._id, 'pause')}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      {test.status === 'paused' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestAction(test._id, 'resume')}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {['running', 'paused'].includes(test.status) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestAction(test._id, 'stop')}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewAdvancedDashboard(test._id)}
                        title="고급 분석 대시보드"
                      >
                        <Brain className="h-4 w-4" />
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

      {/* 고급 분석 대시보드 모달 */}
      {showAdvancedDashboard && selectedTestForDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-semibold text-xl">고급 A/B 테스트 분석</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedDashboard(false)}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
            <div className="h-full overflow-y-auto p-6">
              <ABTestAdvancedDashboard testId={selectedTestForDashboard} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
