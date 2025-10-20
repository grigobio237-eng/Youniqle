'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package, 
  Plus, 
  RefreshCw,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  BarChart3,
  Clock,
  Activity
} from 'lucide-react';

interface PredictionModel {
  _id: string;
  name: string;
  description: string;
  modelType: 'churn' | 'purchase' | 'revenue' | 'demand' | 'lifetime_value' | 'custom';
  targetVariable: string;
  algorithm: string;
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    auc: number;
    mse?: number;
    mae?: number;
  };
  status: 'training' | 'ready' | 'deployed' | 'retired' | 'error';
  version: string;
  isActive: boolean;
  metadata: {
    category: string;
    createdBy: {
      name: string;
      email: string;
    };
    lastTrained: string;
  };
}

interface PredictionResult {
  entityId: string;
  entityType: string;
  predictionType: string;
  predictionValue: number;
  probability?: number;
  confidence: number;
  targetDate: string;
  features: Record<string, any>;
  insights: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
  }>;
}

export default function PredictiveAnalyticsDashboard() {
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<PredictionModel | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [predictionResults, setPredictionResults] = useState<PredictionResult[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics/predictions');
      
      if (!response.ok) {
        throw new Error('예측 모델을 불러올 수 없습니다.');
      }
      
      const data = await response.json();
      setModels(data.data.models);
    } catch (error) {
      console.error('Failed to fetch prediction models:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const runPrediction = async (modelType: string, additionalParams: any = {}) => {
    try {
      setIsPredicting(true);
      
      let endpoint = '';
      let body = {};
      
      switch (modelType) {
        case 'churn':
          endpoint = '/api/admin/analytics/predictions/churn';
          body = { userId: additionalParams.userId || 'test-user-id' };
          break;
        case 'purchase':
          endpoint = '/api/admin/analytics/predictions/purchase';
          body = { userId: additionalParams.userId || 'test-user-id', productId: additionalParams.productId };
          break;
        case 'revenue':
          endpoint = '/api/admin/analytics/predictions/revenue';
          body = { timeframe: additionalParams.timeframe || 'daily' };
          break;
        case 'demand':
          endpoint = '/api/admin/analytics/predictions/demand';
          body = { productId: additionalParams.productId || 'test-product-id', timeframe: additionalParams.timeframe || 'daily' };
          break;
        default:
          throw new Error('지원하지 않는 예측 타입입니다.');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('예측 실행에 실패했습니다.');
      }

      const data = await response.json();
      setPredictionResults(prev => [data.data, ...prev.slice(0, 9)]); // 최근 10개 결과만 유지

    } catch (error) {
      console.error('Failed to run prediction:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsPredicting(false);
    }
  };

  const toggleModelStatus = async (modelId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/analytics/predictions/${modelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!response.ok) {
        throw new Error('모델 상태 변경에 실패했습니다.');
      }

      setModels(prev => prev.map(model => 
        model._id === modelId 
          ? { ...model, isActive: !isActive }
          : model
      ));
    } catch (error) {
      console.error('Failed to toggle model status:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const deleteModel = async (modelId: string) => {
    if (!confirm('정말로 이 예측 모델을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/analytics/predictions/${modelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('모델 삭제에 실패했습니다.');
      }

      setModels(prev => prev.filter(model => model._id !== modelId));
      if (selectedModel && selectedModel._id === modelId) {
        setSelectedModel(null);
      }
    } catch (error) {
      console.error('Failed to delete model:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const getModelTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      churn: '이탈 예측',
      purchase: '구매 예측',
      revenue: '매출 예측',
      demand: '수요 예측',
      lifetime_value: 'LTV 예측',
      custom: '커스텀'
    };
    return labels[type] || type;
  };

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'churn':
        return <Users className="h-5 w-5 text-red-500" />;
      case 'purchase':
        return <ShoppingCart className="h-5 w-5 text-blue-500" />;
      case 'revenue':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'demand':
        return <Package className="h-5 w-5 text-purple-500" />;
      case 'lifetime_value':
        return <Target className="h-5 w-5 text-orange-500" />;
      default:
        return <Brain className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-500 text-white';
      case 'deployed':
        return 'bg-blue-500 text-white';
      case 'training':
        return 'bg-yellow-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'retired':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
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
        return 'bg-gray-500 text-white';
    }
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatCurrency = (value: number) => {
    return `₩${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>예측 모델을 불러오는 중...</p>
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
            <Brain className="h-16 w-16 mx-auto mb-4" />
            <p className="text-lg">예측 모델을 불러올 수 없습니다</p>
            <p className="text-sm text-gray-500 mt-2">{error}</p>
          </div>
          <Button onClick={fetchModels} variant="outline">
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
          <h1 className="text-3xl font-bold text-gray-900">예측 분석</h1>
          <p className="text-gray-600 mt-1">머신러닝 기반 미래 예측 및 인사이트</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          새 모델 생성
        </Button>
      </div>

      {/* 예측 실행 버튼들 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>빠른 예측 실행</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => runPrediction('churn')}
              disabled={isPredicting}
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>이탈 예측</span>
            </Button>
            <Button
              onClick={() => runPrediction('purchase')}
              disabled={isPredicting}
              className="flex items-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>구매 예측</span>
            </Button>
            <Button
              onClick={() => runPrediction('revenue')}
              disabled={isPredicting}
              className="flex items-center space-x-2"
            >
              <DollarSign className="h-4 w-4" />
              <span>매출 예측</span>
            </Button>
            <Button
              onClick={() => runPrediction('demand')}
              disabled={isPredicting}
              className="flex items-center space-x-2"
            >
              <Package className="h-4 w-4" />
              <span>수요 예측</span>
            </Button>
          </div>
          {isPredicting && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
              <span className="text-sm text-gray-600">예측 실행 중...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 예측 결과 */}
      {predictionResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>최근 예측 결과</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictionResults.slice(0, 3).map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getModelTypeIcon(result.predictionType)}
                      <span className="font-medium">{getModelTypeLabel(result.predictionType)}</span>
                      <Badge variant="outline">
                        신뢰도 {formatPercentage(result.confidence)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(result.targetDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {result.predictionType === 'revenue' ? formatCurrency(result.predictionValue) :
                     result.predictionType === 'demand' ? `${result.predictionValue}개` :
                     formatPercentage(result.probability || result.predictionValue)}
                  </div>
                  
                  {result.insights && result.insights.length > 0 && (
                    <div className="mt-2">
                      {result.insights.slice(0, 1).map((insight, insightIndex) => (
                        <div key={insightIndex} className="flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 mt-0.5 text-orange-500" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">{insight.message}</p>
                            <Badge className={`text-xs mt-1 ${getSeverityColor(insight.severity)}`}>
                              {insight.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 예측 모델 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {models.map((model) => (
          <Card key={model._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    {getModelTypeIcon(model.modelType)}
                    <span>{model.name}</span>
                    <Badge className={getStatusColor(model.status)}>
                      {model.status}
                    </Badge>
                    <Badge variant={model.isActive ? 'default' : 'secondary'}>
                      {model.isActive ? '활성' : '비활성'}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runPrediction(model.modelType)}
                    disabled={isPredicting}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    실행
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedModel(model)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    상세
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleModelStatus(model._id, model.isActive)}
                  >
                    {model.isActive ? (
                      <Pause className="h-4 w-4 mr-1" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    {model.isActive ? '비활성화' : '활성화'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteModel(model._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* 모델 성능 메트릭 */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercentage(model.performance.accuracy)}
                    </div>
                    <div className="text-sm text-gray-600">정확도</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPercentage(model.performance.precision)}
                    </div>
                    <div className="text-sm text-gray-600">정밀도</div>
                  </div>
                </div>

                {/* 성능 차트 */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">모델 성능</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>정확도</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${model.performance.accuracy * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-600 w-12 text-right">
                          {formatPercentage(model.performance.accuracy)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>정밀도</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${model.performance.precision * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-600 w-12 text-right">
                          {formatPercentage(model.performance.precision)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>재현율</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${model.performance.recall * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-600 w-12 text-right">
                          {formatPercentage(model.performance.recall)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 모델 정보 */}
                <div className="text-xs text-gray-500 space-y-1">
                  <div>알고리즘: {model.algorithm}</div>
                  <div>버전: {model.version}</div>
                  <div>마지막 훈련: {new Date(model.metadata.lastTrained).toLocaleDateString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {models.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">예측 모델이 없습니다</h3>
            <p className="text-gray-500 mb-4">새로운 예측 모델을 생성하여 미래를 예측해보세요.</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              첫 번째 모델 생성
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 모델 상세 모달 */}
      {selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedModel.name}</h2>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedModel(null)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                {/* 모델 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">모델 정보</h3>
                      <div className="space-y-1 text-sm">
                        <div>타입: {getModelTypeLabel(selectedModel.modelType)}</div>
                        <div>알고리즘: {selectedModel.algorithm}</div>
                        <div>버전: {selectedModel.version}</div>
                        <div>상태: {selectedModel.status}</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">성능 지표</h3>
                      <div className="space-y-1 text-sm">
                        <div>정확도: {formatPercentage(selectedModel.performance.accuracy)}</div>
                        <div>정밀도: {formatPercentage(selectedModel.performance.precision)}</div>
                        <div>재현율: {formatPercentage(selectedModel.performance.recall)}</div>
                        <div>F1 점수: {formatPercentage(selectedModel.performance.f1Score)}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 상세 성능 차트 및 특성 중요도는 여기에 추가 */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}















