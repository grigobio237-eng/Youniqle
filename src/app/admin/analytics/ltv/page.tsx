'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target, 
  Plus, 
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  Zap,
  Crown,
  Star,
  ShoppingCart,
  Clock
} from 'lucide-react';

interface LTVMetrics {
  totalCustomers: number;
  averageLTV: number;
  medianLTV: number;
  totalLTV: number;
  ltvDistribution: Array<{
    tier: 'low' | 'medium' | 'high' | 'premium';
    count: number;
    percentage: number;
    averageLTV: number;
  }>;
  customerTierLTV: Array<{
    tier: 'new' | 'regular' | 'vip' | 'churned';
    count: number;
    averageLTV: number;
    totalLTV: number;
  }>;
  channelLTV: Array<{
    channel: string;
    count: number;
    averageLTV: number;
    totalLTV: number;
    averageCAC?: number;
    ltvCacRatio?: number;
  }>;
  categoryLTV: Array<{
    category: string;
    count: number;
    averageLTV: number;
    totalLTV: number;
  }>;
  ltvGrowth: {
    period: string;
    previousAverageLTV: number;
    currentAverageLTV: number;
    growthRate: number;
    growthAmount: number;
  };
  predictedLTV: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
    confidence: number;
  };
}

interface LTVInsight {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  data: any;
}

interface LTVSegment {
  _id: string;
  name: string;
  description: string;
  criteria: any;
  isActive: boolean;
  metrics?: LTVMetrics;
  insights?: LTVInsight[];
  metadata: {
    category: string;
    createdBy: {
      name: string;
      email: string;
    };
    createdAt: string;
  };
}

export default function LTVAnalysisDashboard() {
  const [segments, setSegments] = useState<LTVSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<LTVSegment | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics/ltv');
      
      if (!response.ok) {
        throw new Error('LTV 분석을 불러올 수 없습니다.');
      }
      
      const data = await response.json();
      setSegments(data.data.segments);
    } catch (error) {
      console.error('Failed to fetch LTV segments:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeSegment = async (segmentId: string) => {
    try {
      const response = await fetch(`/api/admin/analytics/ltv/segment/${segmentId}/analyze`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('LTV 분석 실행에 실패했습니다.');
      }

      const data = await response.json();
      
      // 세그먼트 목록 업데이트
      setSegments(prev => prev.map(segment => 
        segment._id === segmentId 
          ? { ...segment, metrics: data.data, insights: data.data.insights || [] }
          : segment
      ));

      // 선택된 세그먼트가 있다면 업데이트
      if (selectedSegment && selectedSegment._id === segmentId) {
        setSelectedSegment({ ...selectedSegment, metrics: data.data, insights: data.data.insights || [] });
      }

    } catch (error) {
      console.error('Failed to analyze segment:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const toggleSegmentStatus = async (segmentId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/analytics/ltv/segment/${segmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!response.ok) {
        throw new Error('세그먼트 상태 변경에 실패했습니다.');
      }

      setSegments(prev => prev.map(segment => 
        segment._id === segmentId 
          ? { ...segment, isActive: !isActive }
          : segment
      ));
    } catch (error) {
      console.error('Failed to toggle segment status:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const deleteSegment = async (segmentId: string) => {
    if (!confirm('정말로 이 LTV 세그먼트를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/analytics/ltv/segment/${segmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('세그먼트 삭제에 실패했습니다.');
      }

      setSegments(prev => prev.filter(segment => segment._id !== segmentId));
      if (selectedSegment && selectedSegment._id === segmentId) {
        setSelectedSegment(null);
      }
    } catch (error) {
      console.error('Failed to delete segment:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      ltv_tier: 'LTV 등급',
      customer_behavior: '고객 행동',
      acquisition: '획득',
      retention: '유지',
      custom: '커스텀'
    };
    return labels[category] || category;
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
      case 'ltv_insight':
        return <DollarSign className="h-4 w-4" />;
      case 'growth_insight':
        return <TrendingUp className="h-4 w-4" />;
      case 'segment_insight':
        return <Users className="h-4 w-4" />;
      case 'prediction_insight':
        return <Target className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'premium':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'high':
        return <Star className="h-4 w-4 text-blue-500" />;
      case 'medium':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return `₩${value.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>LTV 분석을 불러오는 중...</p>
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
            <p className="text-lg">LTV 분석을 불러올 수 없습니다</p>
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
          <h1 className="text-3xl font-bold text-gray-900">LTV 분석</h1>
          <p className="text-gray-600 mt-1">고객 생애 가치 분석 및 최적화</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          새 세그먼트 생성
        </Button>
      </div>

      {/* LTV 세그먼트 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {segments.map((segment) => (
          <Card key={segment._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{segment.name}</span>
                    <Badge variant={segment.isActive ? 'default' : 'secondary'}>
                      {segment.isActive ? '활성' : '비활성'}
                    </Badge>
                    <Badge variant="outline">
                      {getCategoryLabel(segment.metadata.category)}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{segment.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => analyzeSegment(segment._id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    분석
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSegment(segment)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    상세
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSegmentStatus(segment._id, segment.isActive)}
                  >
                    {segment.isActive ? (
                      <Pause className="h-4 w-4 mr-1" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    {segment.isActive ? '비활성화' : '활성화'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSegment(segment._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* LTV 메트릭 요약 */}
              {segment.metrics ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {segment.metrics.totalCustomers.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">총 고객</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(segment.metrics.averageLTV)}
                      </div>
                      <div className="text-sm text-gray-600">평균 LTV</div>
                    </div>
                  </div>

                  {/* LTV 분포 */}
                  {segment.metrics.ltvDistribution && segment.metrics.ltvDistribution.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">LTV 분포</h4>
                      <div className="space-y-1">
                        {segment.metrics.ltvDistribution.map((dist, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1">
                              {getTierIcon(dist.tier)}
                              <span className="capitalize">{dist.tier}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${dist.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-gray-600 w-12 text-right">
                                {formatPercentage(dist.percentage)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 성장률 */}
                  {segment.metrics.ltvGrowth && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">LTV 성장률</span>
                      <div className="flex items-center space-x-1">
                        {segment.metrics.ltvGrowth.growthRate > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                        )}
                        <span className={segment.metrics.ltvGrowth.growthRate > 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatPercentage(segment.metrics.ltvGrowth.growthRate)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 인사이트 */}
                  {segment.insights && segment.insights.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">주요 인사이트</h4>
                      {segment.insights.slice(0, 2).map((insight, index) => (
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
                    onClick={() => analyzeSegment(segment._id)}
                  >
                    분석 실행
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {segments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">LTV 분석이 없습니다</h3>
            <p className="text-gray-500 mb-4">새로운 LTV 세그먼트를 생성하여 고객 생애 가치를 분석해보세요.</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              첫 번째 세그먼트 생성
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 세그먼트 상세 모달 */}
      {selectedSegment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedSegment.name}</h2>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedSegment(null)}
                >
                  ×
                </Button>
              </div>

              {selectedSegment.metrics ? (
                <div className="space-y-6">
                  {/* 전체 메트릭 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <div className="text-2xl font-bold">{selectedSegment.metrics.totalCustomers.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">총 고객</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(selectedSegment.metrics.averageLTV)}
                        </div>
                        <div className="text-sm text-gray-600">평균 LTV</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Target className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                        <div className="text-2xl font-bold">
                          {formatCurrency(selectedSegment.metrics.medianLTV)}
                        </div>
                        <div className="text-sm text-gray-600">중간값 LTV</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                        <div className="text-2xl font-bold">
                          {selectedSegment.metrics.ltvGrowth ? 
                            formatPercentage(selectedSegment.metrics.ltvGrowth.growthRate) : '0%'}
                        </div>
                        <div className="text-sm text-gray-600">성장률</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 상세 차트 및 인사이트는 여기에 추가 */}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg text-gray-500 mb-4">아직 분석되지 않았습니다</p>
                  <Button onClick={() => analyzeSegment(selectedSegment._id)}>
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











