'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Settings, 
  BarChart3, 
  Lightbulb,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

interface PersonalizationStats {
  totalUsers: number;
  personalizedUsers: number;
  activeRules: number;
  runningExperiments: number;
  averagePersonalizationScore: number;
  topPerformingRules: Array<{
    name: string;
    clickThroughRate: number;
    conversionRate: number;
  }>;
}

interface PersonalizationRule {
  _id: string;
  name: string;
  description: string;
  ruleType: string;
  isActive: boolean;
  priority: number;
  effectiveness: {
    impressions: number;
    clicks: number;
    conversions: number;
    clickThroughRate: number;
    conversionRate: number;
  };
  metadata: {
    category: string;
    tags: string[];
  };
  createdAt: string;
}

interface PersonalizationExperiment {
  _id: string;
  name: string;
  description: string;
  experimentType: string;
  status: string;
  startDate: string;
  endDate?: string;
  results: {
    totalUsers: number;
    variantResults: Array<{
      variantName: string;
      users: number;
      conversions: number;
      conversionRate: number;
      confidence: number;
      statisticalSignificance: boolean;
    }>;
    winner?: string;
  };
  metadata: {
    category: string;
    tags: string[];
  };
  createdAt: string;
}

export default function PersonalizationDashboard() {
  const [stats, setStats] = useState<PersonalizationStats | null>(null);
  const [rules, setRules] = useState<PersonalizationRule[]>([]);
  const [experiments, setExperiments] = useState<PersonalizationExperiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPersonalizationData();
  }, []);

  const fetchPersonalizationData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, rulesRes, experimentsRes] = await Promise.all([
        fetch('/api/admin/personalization/stats'),
        fetch('/api/admin/personalization/rules'),
        fetch('/api/admin/personalization/experiments')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      if (rulesRes.ok) {
        const rulesData = await rulesRes.json();
        setRules(rulesData.data.rules);
      }

      if (experimentsRes.ok) {
        const experimentsData = await experimentsRes.json();
        setExperiments(experimentsData.data.experiments);
      }

    } catch (error) {
      console.error('Error fetching personalization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/personalization/rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        setRules(rules.map(rule => 
          rule._id === ruleId ? { ...rule, isActive: !isActive } : rule
        ));
      }
    } catch (error) {
      console.error('Error toggling rule status:', error);
    }
  };

  const toggleExperimentStatus = async (experimentId: string, status: string) => {
    try {
      const newStatus = status === 'running' ? 'paused' : 'running';
      const response = await fetch(`/api/admin/personalization/experiments/${experimentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setExperiments(experiments.map(exp => 
          exp._id === experimentId ? { ...exp, status: newStatus } : exp
        ));
      }
    } catch (error) {
      console.error('Error toggling experiment status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">개인화 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">개인화 관리</h1>
          <p className="text-gray-600">사용자 개인화 및 추천 시스템 관리</p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            새 규칙
          </Button>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            새 실험
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="rules">규칙</TabsTrigger>
          <TabsTrigger value="experiments">실험</TabsTrigger>
          <TabsTrigger value="insights">인사이트</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  개인화 활성 사용자: {stats?.personalizedUsers || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">활성 규칙</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeRules || 0}</div>
                <p className="text-xs text-muted-foreground">
                  총 규칙: {rules.length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">실행 중인 실험</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.runningExperiments || 0}</div>
                <p className="text-xs text-muted-foreground">
                  총 실험: {experiments.length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">평균 개인화 점수</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.averagePersonalizationScore ? 
                    (stats.averagePersonalizationScore * 100).toFixed(1) + '%' : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  사용자 만족도 지표
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 성과가 좋은 규칙 */}
          <Card>
            <CardHeader>
              <CardTitle>성과가 좋은 규칙</CardTitle>
              <CardDescription>클릭률과 전환율이 높은 개인화 규칙</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.topPerformingRules?.map((rule, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{rule.name}</h4>
                      <p className="text-sm text-gray-600">
                        CTR: {(rule.clickThroughRate * 100).toFixed(2)}% | 
                        전환율: {(rule.conversionRate * 100).toFixed(2)}%
                      </p>
                    </div>
                    <Badge variant="secondary">우수</Badge>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">성과 데이터가 없습니다</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>개인화 규칙</CardTitle>
              <CardDescription>사용자 개인화를 위한 규칙 관리</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{rule.name}</h4>
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? '활성' : '비활성'}
                        </Badge>
                        <Badge variant="outline">{rule.ruleType}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>CTR: {(rule.effectiveness.clickThroughRate * 100).toFixed(2)}%</span>
                        <span>전환율: {(rule.effectiveness.conversionRate * 100).toFixed(2)}%</span>
                        <span>우선순위: {rule.priority}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleRuleStatus(rule._id, rule.isActive)}
                      >
                        {rule.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>개인화 실험</CardTitle>
              <CardDescription>A/B 테스트 및 다변량 실험 관리</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {experiments.map((experiment) => (
                  <div key={experiment._id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{experiment.name}</h4>
                        <Badge variant={
                          experiment.status === 'running' ? 'default' : 
                          experiment.status === 'completed' ? 'secondary' : 'outline'
                        }>
                          {experiment.status === 'running' ? '실행 중' :
                           experiment.status === 'completed' ? '완료' :
                           experiment.status === 'paused' ? '일시정지' : '초안'}
                        </Badge>
                        <Badge variant="outline">{experiment.experimentType}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleExperimentStatus(experiment._id, experiment.status)}
                        >
                          {experiment.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{experiment.description}</p>
                    
                    {experiment.results && experiment.results.variantResults.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">실험 결과</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {experiment.results.variantResults.map((variant, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                              <div className="font-medium">{variant.variantName}</div>
                              <div className="text-gray-600">
                                사용자: {variant.users} | 전환율: {(variant.conversionRate * 100).toFixed(2)}%
                              </div>
                              {variant.statisticalSignificance && (
                                <Badge variant="secondary" className="text-xs">통계적 유의성</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                        {experiment.results.winner && (
                          <div className="mt-2">
                            <Badge variant="default">승자: {experiment.results.winner}</Badge>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>개인화 인사이트</CardTitle>
              <CardDescription>AI가 생성한 개인화 관련 인사이트</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">인사이트 기능은 곧 추가될 예정입니다</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}















