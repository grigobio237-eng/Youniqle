'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Bot, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Zap,
  Target,
  Mail,
  MessageSquare,
  Bell,
  Tag,
  Users,
  Calendar,
  Activity
} from 'lucide-react';

interface AutomationRule {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  priority: number;
  triggers: {
    type: string;
    eventType?: string;
    schedule?: {
      type: string;
      time: string;
    };
  };
  actions: Array<{
    type: string;
    name: string;
  }>;
  stats: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    lastExecutedAt?: string;
    successRate: number;
  };
  metadata: {
    category: string;
    createdBy: {
      name: string;
      email: string;
    };
    createdAt: string;
  };
}

export default function AutomationDashboard() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchRules();
  }, [searchTerm, selectedCategory, selectedStatus]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);

      const response = await fetch(`/api/admin/automation/rules?${params}`);
      
      if (!response.ok) {
        throw new Error('자동화 규칙을 불러올 수 없습니다.');
      }
      
      const data = await response.json();
      setRules(data.data.rules);
    } catch (error) {
      console.error('Failed to fetch rules:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/automation/rules/${ruleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!response.ok) {
        throw new Error('규칙 상태 변경에 실패했습니다.');
      }

      setRules(rules.map(rule => 
        rule._id === ruleId 
          ? { ...rule, isActive: !isActive }
          : rule
      ));
    } catch (error) {
      console.error('Failed to toggle rule status:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const executeRule = async (ruleId: string) => {
    try {
      const response = await fetch(`/api/admin/automation/rules/${ruleId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('규칙 실행에 실패했습니다.');
      }

      // 성공 메시지 표시
      alert('자동화 규칙이 실행되었습니다.');
    } catch (error) {
      console.error('Failed to execute rule:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm('정말로 이 자동화 규칙을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/automation/rules/${ruleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('규칙 삭제에 실패했습니다.');
      }

      setRules(rules.filter(rule => rule._id !== ruleId));
    } catch (error) {
      console.error('Failed to delete rule:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'push':
        return <Bell className="h-4 w-4" />;
      case 'coupon':
        return <Tag className="h-4 w-4" />;
      case 'promotion':
        return <Zap className="h-4 w-4" />;
      case 'segment':
        return <Users className="h-4 w-4" />;
      case 'tag':
        return <Tag className="h-4 w-4" />;
      case 'webhook':
        return <Settings className="h-4 w-4" />;
      case 'api':
        return <Settings className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'marketing':
        return 'bg-blue-100 text-blue-800';
      case 'sales':
        return 'bg-green-100 text-green-800';
      case 'support':
        return 'bg-purple-100 text-purple-800';
      case 'retention':
        return 'bg-orange-100 text-orange-800';
      case 'acquisition':
        return 'bg-pink-100 text-pink-800';
      case 'engagement':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>자동화 규칙을 불러오는 중...</p>
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
            <Bot className="h-16 w-16 mx-auto mb-4" />
            <p className="text-lg">자동화 규칙을 불러올 수 없습니다</p>
            <p className="text-sm text-gray-500 mt-2">{error}</p>
          </div>
          <Button onClick={fetchRules} variant="outline">
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
          <h1 className="text-3xl font-bold text-gray-900">마케팅 자동화</h1>
          <p className="text-gray-600 mt-1">규칙 기반 마케팅 자동화 관리</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          새 규칙 생성
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 규칙</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.length}</div>
            <p className="text-xs text-muted-foreground">
              활성: {rules.filter(r => r.isActive).length}개
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 실행</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rules.reduce((sum, rule) => sum + rule.stats.totalExecutions, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              성공률: {Math.round(rules.reduce((sum, rule) => sum + rule.stats.successRate, 0) / rules.length || 0)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">성공 실행</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {rules.reduce((sum, rule) => sum + rule.stats.successfulExecutions, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              성공한 실행
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">실패 실행</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {rules.reduce((sum, rule) => sum + rule.stats.failedExecutions, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              실패한 실행
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle>필터 및 검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="규칙 이름 또는 설명 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">모든 카테고리</option>
              <option value="marketing">마케팅</option>
              <option value="sales">판매</option>
              <option value="support">지원</option>
              <option value="retention">리텐션</option>
              <option value="acquisition">획득</option>
              <option value="engagement">참여</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">모든 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 자동화 규칙 목록 */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{rule.name}</h3>
                    <Badge className={getCategoryColor(rule.metadata.category)}>
                      {rule.metadata.category}
                    </Badge>
                    <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                      {rule.isActive ? '활성' : '비활성'}
                    </Badge>
                    <Badge variant="outline">
                      우선순위: {rule.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{rule.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">트리거</h4>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {rule.triggers.type === 'event' ? '이벤트' : 
                           rule.triggers.type === 'schedule' ? '스케줄' : 
                           rule.triggers.type === 'condition' ? '조건' : 
                           rule.triggers.type}
                        </span>
                        {rule.triggers.eventType && (
                          <Badge variant="outline" className="text-xs">
                            {rule.triggers.eventType}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">액션</h4>
                      <div className="flex flex-wrap gap-1">
                        {rule.actions.map((action, index) => (
                          <div key={index} className="flex items-center space-x-1">
                            {getActionIcon(action.type)}
                            <span className="text-xs">{action.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">통계</h4>
                      <div className="text-sm space-y-1">
                        <div>총 실행: {rule.stats.totalExecutions}</div>
                        <div>성공률: {rule.stats.successRate.toFixed(1)}%</div>
                        {rule.stats.lastExecutedAt && (
                          <div className="text-xs text-gray-500">
                            마지막 실행: {formatDate(rule.stats.lastExecutedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    생성자: {rule.metadata.createdBy.name} • 
                    생성일: {formatDate(rule.metadata.createdAt)}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => executeRule(rule._id)}
                    disabled={!rule.isActive}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    실행
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleRuleStatus(rule._id, rule.isActive)}
                  >
                    {rule.isActive ? (
                      <Pause className="h-4 w-4 mr-1" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    {rule.isActive ? '비활성화' : '활성화'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* 편집 로직 */}}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    편집
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteRule(rule._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    삭제
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rules.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Bot className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">자동화 규칙이 없습니다</h3>
            <p className="text-gray-500 mb-4">새로운 자동화 규칙을 생성하여 마케팅을 자동화해보세요.</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              첫 번째 규칙 생성
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}











