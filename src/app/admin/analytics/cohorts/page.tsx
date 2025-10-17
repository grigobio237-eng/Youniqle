'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Clock, 
  Plus, 
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
  GitCompare,
  Download,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap
} from 'lucide-react';

interface CohortMetrics {
  retention: Array<{
    period: number;
    periodType: string;
    activeUsers: number;
    retentionRate: number;
    churnRate: number;
  }>;
  revenue: Array<{
    period: number;
    periodType: string;
    totalRevenue: number;
    averageRevenuePerUser: number;
    cumulativeRevenue: number;
  }>;
  engagement: Array<{
    period: number;
    periodType: string;
    activeUsers: number;
    averageSessions: number;
    averagePageViews: number;
    averageTimeSpent: number;
  }>;
  purchase: Array<{
    period: number;
    periodType: string;
    purchasingUsers: number;
    totalOrders: number;
    averageOrderValue: number;
    repeatPurchaseRate: number;
  }>;
}

interface CohortInsight {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  data: any;
}

interface CohortAnalysis {
  _id: string;
  name: string;
  description: string;
  cohortType: 'signup' | 'first_purchase' | 'product_category' | 'subscription' | 'custom';
  isActive: boolean;
  metrics?: {
    totalMembers: number;
    retention: CohortMetrics['retention'];
    revenue: CohortMetrics['revenue'];
    engagement: CohortMetrics['engagement'];
    purchase: CohortMetrics['purchase'];
  };
  insights?: CohortInsight[];
  metadata: {
    category: string;
    createdBy: {
      name: string;
      email: string;
    };
    createdAt: string;
  };
}

export default function CohortAnalysisDashboard() {
  const [cohorts, setCohorts] = useState<CohortAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCohort, setSelectedCohort] = useState<CohortAnalysis | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>([]);

  useEffect(() => {
    fetchCohorts();
  }, []);

  const fetchCohorts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics/cohorts');
      
      if (!response.ok) {
        throw new Error('코호트 분석을 불러올 수 없습니다.');
      }
      
      const data = await response.json();
      setCohorts(data.data.cohorts);
    } catch (error) {
      console.error('Failed to fetch cohorts:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeCohort = async (cohortId: string) => {
    try {
      const response = await fetch(`/api/admin/analytics/cohorts/${cohortId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysisPeriod: 12 }),
      });

      if (!response.ok) {
        throw new Error('코호트 분석 실행에 실패했습니다.');
      }

      const data = await response.json();
      
      // 코호트 목록 업데이트
      setCohorts(prev => prev.map(cohort => 
        cohort._id === cohortId 
          ? { ...cohort, metrics: data.data.metrics, insights: data.data.insights || [] }
          : cohort
      ));

      // 선택된 코호트가 있다면 업데이트
      if (selectedCohort && selectedCohort._id === cohortId) {
        setSelectedCohort({ ...selectedCohort, metrics: data.data.metrics, insights: data.data.insights || [] });
      }

    } catch (error) {
      console.error('Failed to analyze cohort:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const toggleCohortStatus = async (cohortId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/analytics/cohorts/${cohortId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!response.ok) {
        throw new Error('코호트 상태 변경에 실패했습니다.');
      }

      setCohorts(prev => prev.map(cohort => 
        cohort._id === cohortId 
          ? { ...cohort, isActive: !isActive }
          : cohort
      ));
    } catch (error) {
      console.error('Failed to toggle cohort status:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const deleteCohort = async (cohortId: string) => {
    if (!confirm('정말로 이 코호트 분석을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/analytics/cohorts/${cohortId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('코호트 삭제에 실패했습니다.');
      }

      setCohorts(prev => prev.filter(cohort => cohort._id !== cohortId));
      if (selectedCohort && selectedCohort._id === cohortId) {
        setSelectedCohort(null);
      }
    } catch (error) {
      console.error('Failed to delete cohort:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const compareCohorts = async () => {
    if (selectedCohorts.length < 2) {
      alert('비교할 코호트를 2개 이상 선택해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/admin/analytics/cohorts/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cohortIds: selectedCohorts }),
      });

      if (!response.ok) {
        throw new Error('코호트 비교 분석에 실패했습니다.');
      }

      const data = await response.json();
      console.log('Cohort comparison result:', data.data);
      // 비교 결과를 모달이나 별도 페이지에 표시
      alert('코호트 비교 분석이 완료되었습니다. 콘솔을 확인해주세요.');
    } catch (error) {
      console.error('Failed to compare cohorts:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const getCohortTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      signup: '가입자',
      first_purchase: '첫 구매자',
      product_category: '제품 카테고리',
      subscription: '구독자',
      custom: '커스텀'
    };
    return labels[type] || type;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'retention_insight':
        return <Users className="h-4 w-4" />;
      case 'revenue_insight':
        return <DollarSign className="h-4 w-4" />;
      case 'engagement_insight':
        return <Target className="h-4 w-4" />;
      case 'purchase_insight':
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatCurrency = (value: number) => {
    return `₩${value.toLocaleString()}`;
  };

  const formatTime = (minutes: number) => {
    if (minutes < 1) return '< 1분';
    if (minutes < 60) return `${Math.round(minutes)}분`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}시간 ${mins}분`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>코호트 분석을 불러오는 중...</p>
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
            <BarChart3 className="h-16 w-16 mx-auto mb-4" />
            <p className="text-lg">코호트 분석을 불러올 수 없습니다</p>
            <p className="text-sm text-gray-500 mt-2">{error}</p>
          </div>
          <Button onClick={fetchCohorts} variant="outline">
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
          <h1 className="text-3xl font-bold text-gray-900">코호트 분석</h1>
          <p className="text-gray-600 mt-1">사용자 그룹별 장기 행동 패턴 분석</p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedCohorts.length >= 2 && (
            <Button onClick={compareCohorts} variant="outline">
              <GitCompare className="h-4 w-4 mr-2" />
              비교 분석
            </Button>
          )}
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            새 코호트 생성
          </Button>
        </div>
      </div>

      {/* 코호트 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cohorts.map((cohort) => (
          <Card key={cohort._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{cohort.name}</span>
                    <Badge variant={cohort.isActive ? 'default' : 'secondary'}>
                      {cohort.isActive ? '활성' : '비활성'}
                    </Badge>
                    <Badge variant="outline">
                      {getCohortTypeLabel(cohort.cohortType)}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{cohort.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => analyzeCohort(cohort._id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    분석
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCohort(cohort)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    상세
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleCohortStatus(cohort._id, cohort.isActive)}
                  >
                    {cohort.isActive ? (
                      <Pause className="h-4 w-4 mr-1" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    {cohort.isActive ? '비활성화' : '활성화'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCohort(cohort._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* 코호트 메트릭 요약 */}
              {cohort.metrics ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {cohort.metrics.totalMembers.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">총 멤버</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {cohort.metrics.retention.length > 0 ? 
                          formatPercentage(cohort.metrics.retention[0].retentionRate) : '0%'}
                      </div>
                      <div className="text-sm text-gray-600">첫 달 유지율</div>
                    </div>
                  </div>

                  {/* 유지율 차트 */}
                  {cohort.metrics.retention.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">유지율 추이</h4>
                      <div className="space-y-1">
                        {cohort.metrics.retention.slice(0, 6).map((retention, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <span>{retention.period}개월</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${retention.retentionRate}%` }}
                                ></div>
                              </div>
                              <span className="text-gray-600 w-12 text-right">
                                {formatPercentage(retention.retentionRate)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 인사이트 */}
                  {cohort.insights && cohort.insights.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">주요 인사이트</h4>
                      {cohort.insights.slice(0, 2).map((insight, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                          <div className="flex-shrink-0 mt-0.5">
                            {getInsightIcon(insight.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {insight.message}
                            </p>
                            <Badge 
                              className={`text-xs mt-1 ${getSeverityColor(insight.severity)}`}
                            >
                              {insight.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">아직 분석되지 않았습니다</p>
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => analyzeCohort(cohort._id)}
                  >
                    분석 실행
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {cohorts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">코호트 분석이 없습니다</h3>
            <p className="text-gray-500 mb-4">새로운 코호트 분석을 생성하여 사용자 그룹의 행동 패턴을 분석해보세요.</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              첫 번째 코호트 생성
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 코호트 상세 모달 */}
      {selectedCohort && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedCohort.name}</h2>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedCohort(null)}
                >
                  ×
                </Button>
              </div>

              {selectedCohort.metrics ? (
                <div className="space-y-6">
                  {/* 전체 메트릭 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <div className="text-2xl font-bold">{selectedCohort.metrics.totalMembers.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">총 멤버</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <div className="text-2xl font-bold text-green-600">
                          {selectedCohort.metrics.retention.length > 0 ? 
                            formatPercentage(selectedCohort.metrics.retention[0].retentionRate) : '0%'}
                        </div>
                        <div className="text-sm text-gray-600">첫 달 유지율</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <DollarSign className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                        <div className="text-2xl font-bold">
                          {selectedCohort.metrics.revenue.length > 0 ? 
                            formatCurrency(selectedCohort.metrics.revenue[0].averageRevenuePerUser) : '₩0'}
                        </div>
                        <div className="text-sm text-gray-600">평균 ARPU</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                        <div className="text-2xl font-bold">
                          {selectedCohort.metrics.purchase.length > 0 ? 
                            formatPercentage(selectedCohort.metrics.purchase[0].repeatPurchaseRate) : '0%'}
                        </div>
                        <div className="text-sm text-gray-600">재구매율</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 상세 차트 및 인사이트는 여기에 추가 */}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg text-gray-500 mb-4">아직 분석되지 않았습니다</p>
                  <Button onClick={() => analyzeCohort(selectedCohort._id)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    분석 실행
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
