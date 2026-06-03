'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  BarChart3,
  Target,
  Zap,
  Eye,
  ShoppingCart,
  CreditCard,
  RefreshCw,
  Play,
  Pause,
  Edit,
  Trash2,
  Download
} from 'lucide-react';

interface FunnelStep {
  stepId: string;
  stepName: string;
  stepOrder: number;
  users: number;
  conversionRate: number;
  dropOffRate: number;
  avgTimeToStep: number;
  dropOffUsers: number;
}

interface FunnelInsight {
  type: 'bottleneck' | 'opportunity' | 'anomaly' | 'trend';
  stepId: string;
  stepName: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  data: any;
}

interface FunnelAnalysis {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  steps: Array<{
    _id: string;
    stepName: string;
    stepOrder: number;
    stepType: string;
    isConversionStep: boolean;
  }>;
  metrics: {
    totalUsers: number;
    stepConversions: FunnelStep[];
    overallConversionRate: number;
    totalDropOffRate: number;
    avgTimeToConversion: number;
    lastCalculatedAt: string;
  };
  insights: FunnelInsight[];
  metadata: {
    category: string;
    createdBy: {
      name: string;
      email: string;
    };
    createdAt: string;
  };
}

export default function FunnelAnalysisDashboard() {
  const [funnels, setFunnels] = useState<FunnelAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFunnel, setSelectedFunnel] = useState<FunnelAnalysis | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchFunnels();
  }, []);

  const fetchFunnels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics/funnels');
      
      if (!response.ok) {
        throw new Error('퍼널 분석을 불러올 수 없습니다.');
      }
      
      const data = await response.json();
      setFunnels(data.data.funnels);
    } catch (error) {
      console.error('Failed to fetch funnels:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeFunnel = async (funnelId: string) => {
    try {
      const response = await fetch(`/api/admin/analytics/funnels/${funnelId}/analyze`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('퍼널 분석 실행에 실패했습니다.');
      }

      const data = await response.json();
      
      // 퍼널 목록 업데이트
      setFunnels(prev => prev.map(funnel => 
        funnel._id === funnelId 
          ? { ...funnel, metrics: data.data, insights: data.data.insights || [] }
          : funnel
      ));

      // 선택된 퍼널이 있다면 업데이트
      if (selectedFunnel && selectedFunnel._id === funnelId) {
        setSelectedFunnel({ ...selectedFunnel, metrics: data.data, insights: data.data.insights || [] });
      }

    } catch (error) {
      console.error('Failed to analyze funnel:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const toggleFunnelStatus = async (funnelId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/analytics/funnels/${funnelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!response.ok) {
        throw new Error('퍼널 상태 변경에 실패했습니다.');
      }

      setFunnels(prev => prev.map(funnel => 
        funnel._id === funnelId 
          ? { ...funnel, isActive: !isActive }
          : funnel
      ));
    } catch (error) {
      console.error('Failed to toggle funnel status:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const deleteFunnel = async (funnelId: string) => {
    if (!confirm('정말로 이 퍼널 분석을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/analytics/funnels/${funnelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('퍼널 삭제에 실패했습니다.');
      }

      setFunnels(prev => prev.filter(funnel => funnel._id !== funnelId));
      if (selectedFunnel && selectedFunnel._id === funnelId) {
        setSelectedFunnel(null);
      }
    } catch (error) {
      console.error('Failed to delete funnel:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
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
        return 'bg-surface0 text-white';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'bottleneck':
        return <AlertTriangle className="h-4 w-4" />;
      case 'opportunity':
        return <CheckCircle className="h-4 w-4" />;
      case 'anomaly':
        return <TrendingDown className="h-4 w-4" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
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
            <p>퍼널 분석을 불러오는 중...</p>
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
            <p className="text-lg">퍼널 분석을 불러올 수 없습니다</p>
            <p className="text-sm text-foreground/70 mt-2">{error}</p>
          </div>
          <Button onClick={fetchFunnels} variant="outline">
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
          <h1 className="text-3xl font-bold text-obsidian">퍼널 분석</h1>
          <p className="text-obsidian mt-1">사용자 전환 경로 분석 및 최적화</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          새 퍼널 생성
        </Button>
      </div>

      {/* 퍼널 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {funnels.map((funnel) => (
          <Card key={funnel._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{funnel.name}</span>
                    <Badge variant={funnel.isActive ? 'default' : 'secondary'}>
                      {funnel.isActive ? '활성' : '비활성'}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-obsidian mt-1">{funnel.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => analyzeFunnel(funnel._id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    분석
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFunnel(funnel)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    상세
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFunnelStatus(funnel._id, funnel.isActive)}
                  >
                    {funnel.isActive ? (
                      <Pause className="h-4 w-4 mr-1" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    {funnel.isActive ? '비활성화' : '활성화'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteFunnel(funnel._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* 퍼널 단계 시각화 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">전체 사용자</span>
                  <span className="text-obsidian">{funnel.metrics.totalUsers.toLocaleString()}명</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">전체 전환율</span>
                  <span className="text-green-600 font-semibold">
                    {formatPercentage(funnel.metrics.overallConversionRate)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">평균 전환 시간</span>
                  <span className="text-obsidian">
                    {formatTime(funnel.metrics.avgTimeToConversion)}
                  </span>
                </div>

                {/* 퍼널 단계 바 */}
                <div className="space-y-2">
                  {funnel.metrics.stepConversions.map((step, index) => (
                    <div key={step.stepId} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{step.stepName}</span>
                        <span className="text-foreground/70">
                          {step.users.toLocaleString()}명 ({formatPercentage(step.conversionRate)})
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${step.conversionRate}%` }}
                        ></div>
                      </div>
                      {step.dropOffRate > 0 && (
                        <div className="text-xs text-red-500">
                          {step.dropOffUsers.toLocaleString()}명 이탈 ({formatPercentage(step.dropOffRate)})
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 인사이트 */}
                {funnel.insights && funnel.insights.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-obsidian">주요 인사이트</h4>
                    {funnel.insights.slice(0, 2).map((insight, index) => (
                      <div key={index} className="flex items-start space-x-2 p-2 bg-surface rounded">
                        <div className="flex-shrink-0 mt-0.5">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-obsidian line-clamp-2">
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
            </CardContent>
          </Card>
        ))}
      </div>

      {funnels.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-foreground/70" />
            <h3 className="text-lg font-medium text-obsidian mb-2">퍼널 분석이 없습니다</h3>
            <p className="text-foreground/70 mb-4">새로운 퍼널 분석을 생성하여 사용자 전환 경로를 분석해보세요.</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              첫 번째 퍼널 생성
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 퍼널 상세 모달 */}
      {selectedFunnel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-obsidian">{selectedFunnel.name}</h2>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedFunnel(null)}
                >
                  ×
                </Button>
              </div>

              {/* 퍼널 상세 정보 */}
              <div className="space-y-6">
                {/* 전체 메트릭 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{selectedFunnel.metrics.totalUsers.toLocaleString()}</div>
                      <div className="text-sm text-obsidian">전체 사용자</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <div className="text-2xl font-bold text-green-600">
                        {formatPercentage(selectedFunnel.metrics.overallConversionRate)}
                      </div>
                      <div className="text-sm text-obsidian">전체 전환율</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-secondary" />
                      <div className="text-2xl font-bold">{formatTime(selectedFunnel.metrics.avgTimeToConversion)}</div>
                      <div className="text-sm text-obsidian">평균 전환 시간</div>
                    </CardContent>
                  </Card>
                </div>

                {/* 퍼널 단계 상세 */}
                <Card>
                  <CardHeader>
                    <CardTitle>퍼널 단계 분석</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedFunnel.metrics.stepConversions.map((step, index) => (
                        <div key={step.stepId} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{step.stepName}</h4>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-obsidian">{step.users.toLocaleString()}명</span>
                              <span className="text-green-600 font-semibold">
                                {formatPercentage(step.conversionRate)}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div
                              className="bg-primary h-3 rounded-full transition-all duration-300"
                              style={{ width: `${step.conversionRate}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-foreground/70">
                            <span>평균 도달 시간: {formatTime(step.avgTimeToStep)}</span>
                            {step.dropOffRate > 0 && (
                              <span className="text-red-500">
                                {step.dropOffUsers.toLocaleString()}명 이탈 ({formatPercentage(step.dropOffRate)})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 인사이트 */}
                {selectedFunnel.insights && selectedFunnel.insights.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>분석 인사이트</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedFunnel.insights.map((insight, index) => (
                          <div key={index} className="border-l-4 border-primary/30 pl-4 py-2">
                            <div className="flex items-start space-x-2">
                              {getInsightIcon(insight.type)}
                              <div className="flex-1">
                                <p className="font-medium">{insight.message}</p>
                                <Badge className={`mt-1 ${getSeverityColor(insight.severity)}`}>
                                  {insight.severity}
                                </Badge>
                                {insight.recommendations && insight.recommendations.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-sm font-medium text-obsidian mb-1">권장사항:</p>
                                    <ul className="text-sm text-obsidian list-disc list-inside space-y-1">
                                      {insight.recommendations.map((rec, recIndex) => (
                                        <li key={recIndex}>{rec}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}















