'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  Zap,
  Clock,
  Users,
  Target,
  Settings
} from 'lucide-react';

interface TriggerCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface UserCondition {
  id: string;
  type: 'segment' | 'behavior' | 'demographic';
  field: string;
  operator: string;
  value: string;
  timeWindow?: number;
}

interface Action {
  id: string;
  type: string;
  config: {
    templateId?: string;
    subject?: string;
    content?: string;
    delay?: number;
    priority?: string;
  };
}

export default function CreateAutomationRule() {
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [eventType, setEventType] = useState('');
  const [priority, setPriority] = useState('1');
  const [cooldown, setCooldown] = useState('60');
  const [triggerConditions, setTriggerConditions] = useState<TriggerCondition[]>([]);
  const [userConditions, setUserConditions] = useState<UserCondition[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [timeRestrictions, setTimeRestrictions] = useState({
    enabled: false,
    startTime: '09:00',
    endTime: '18:00',
    daysOfWeek: [1, 2, 3, 4, 5] // 월-금
  });

  const eventTypes = [
    'page_view',
    'product_view',
    'add_to_cart',
    'remove_from_cart',
    'purchase',
    'abandon_cart',
    'login',
    'logout',
    'search',
    'wishlist_add',
    'wishlist_remove',
    'review_submit',
    'email_open',
    'email_click',
    'push_open',
    'push_click'
  ];

  const operators = [
    { value: 'equals', label: '같음' },
    { value: 'not_equals', label: '다름' },
    { value: 'greater_than', label: '보다 큼' },
    { value: 'less_than', label: '보다 작음' },
    { value: 'contains', label: '포함' },
    { value: 'not_contains', label: '포함하지 않음' },
    { value: 'in', label: '목록에 포함' },
    { value: 'not_in', label: '목록에 포함되지 않음' }
  ];

  const actionTypes = [
    { value: 'send_email', label: '이메일 발송' },
    { value: 'send_push', label: '푸시 알림' },
    { value: 'send_sms', label: 'SMS 발송' },
    { value: 'create_coupon', label: '쿠폰 생성' },
    { value: 'apply_discount', label: '할인 적용' },
    { value: 'add_to_segment', label: '세그먼트 추가' },
    { value: 'remove_from_segment', label: '세그먼트 제거' },
    { value: 'add_tag', label: '태그 추가' },
    { value: 'remove_tag', label: '태그 제거' },
    { value: 'webhook', label: '웹훅 호출' },
    { value: 'delay', label: '지연' }
  ];

  const addTriggerCondition = () => {
    const newCondition: TriggerCondition = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: ''
    };
    setTriggerConditions([...triggerConditions, newCondition]);
  };

  const removeTriggerCondition = (id: string) => {
    setTriggerConditions(triggerConditions.filter(condition => condition.id !== id));
  };

  const updateTriggerCondition = (id: string, field: string, value: string) => {
    setTriggerConditions(triggerConditions.map(condition => 
      condition.id === id ? { ...condition, [field]: value } : condition
    ));
  };

  const addUserCondition = () => {
    const newCondition: UserCondition = {
      id: Date.now().toString(),
      type: 'segment',
      field: '',
      operator: 'equals',
      value: ''
    };
    setUserConditions([...userConditions, newCondition]);
  };

  const removeUserCondition = (id: string) => {
    setUserConditions(userConditions.filter(condition => condition.id !== id));
  };

  const updateUserCondition = (id: string, field: string, value: string) => {
    setUserConditions(userConditions.map(condition => 
      condition.id === id ? { ...condition, [field]: value } : condition
    ));
  };

  const addAction = () => {
    const newAction: Action = {
      id: Date.now().toString(),
      type: 'send_email',
      config: {}
    };
    setActions([...actions, newAction]);
  };

  const removeAction = (id: string) => {
    setActions(actions.filter(action => action.id !== id));
  };

  const updateAction = (id: string, field: string, value: string) => {
    setActions(actions.map(action => 
      action.id === id ? { 
        ...action, 
        [field]: field === 'config' ? { ...action.config, [Object.keys(action.config)[0]]: value } : value 
      } : action
    ));
  };

  const handleSave = () => {
    // 실제 구현에서는 API 호출
    console.log('Saving automation rule:', {
      name: ruleName,
      description: ruleDescription,
      eventType,
      priority: parseInt(priority),
      cooldown: parseInt(cooldown),
      triggerConditions,
      userConditions,
      actions,
      timeRestrictions
    });
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로
        </Button>
        <div>
          <h1 className="text-3xl font-bold">자동화 규칙 생성</h1>
          <p className="text-gray-600">새로운 마케팅 자동화 규칙을 생성합니다</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 설정 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ruleName">규칙 이름</Label>
                <Input
                  id="ruleName"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="예: 장바구니 이탈 고객 재참여"
                />
              </div>
              <div>
                <Label htmlFor="ruleDescription">설명</Label>
                <Textarea
                  id="ruleDescription"
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                  placeholder="규칙에 대한 자세한 설명을 입력하세요"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">우선순위</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">높음 (1)</SelectItem>
                      <SelectItem value="2">중간 (2)</SelectItem>
                      <SelectItem value="3">낮음 (3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cooldown">쿨다운 (분)</Label>
                  <Input
                    id="cooldown"
                    type="number"
                    value={cooldown}
                    onChange={(e) => setCooldown(e.target.value)}
                    placeholder="60"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 트리거 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                트리거 설정
              </CardTitle>
              <CardDescription>이벤트 발생 조건을 설정합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="eventType">이벤트 타입</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger>
                    <SelectValue placeholder="이벤트 타입을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>트리거 조건</Label>
                  <Button size="sm" onClick={addTriggerCondition}>
                    <Plus className="h-4 w-4 mr-1" />
                    조건 추가
                  </Button>
                </div>
                {triggerConditions.map((condition, index) => (
                  <div key={condition.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <Input
                        placeholder="필드명"
                        value={condition.field}
                        onChange={(e) => updateTriggerCondition(condition.id, 'field', e.target.value)}
                      />
                      <Select
                        value={condition.operator}
                        onValueChange={(value) => updateTriggerCondition(condition.id, 'operator', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map(op => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="값"
                        value={condition.value}
                        onChange={(e) => updateTriggerCondition(condition.id, 'value', e.target.value)}
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeTriggerCondition(condition.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 사용자 조건 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                사용자 조건
              </CardTitle>
              <CardDescription>대상 사용자 조건을 설정합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <Label>사용자 조건</Label>
                <Button size="sm" onClick={addUserCondition}>
                  <Plus className="h-4 w-4 mr-1" />
                  조건 추가
                </Button>
              </div>
              {userConditions.map((condition, index) => (
                <div key={condition.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    <Select
                      value={condition.type}
                      onValueChange={(value) => updateUserCondition(condition.id, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="segment">세그먼트</SelectItem>
                        <SelectItem value="behavior">행동</SelectItem>
                        <SelectItem value="demographic">인구통계</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="필드명"
                      value={condition.field}
                      onChange={(e) => updateUserCondition(condition.id, 'field', e.target.value)}
                    />
                    <Select
                      value={condition.operator}
                      onValueChange={(value) => updateUserCondition(condition.id, 'operator', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map(op => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="값"
                      value={condition.value}
                      onChange={(e) => updateUserCondition(condition.id, 'value', e.target.value)}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeUserCondition(condition.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 액션 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                액션 설정
              </CardTitle>
              <CardDescription>트리거 발생 시 실행할 액션을 설정합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <Label>액션</Label>
                <Button size="sm" onClick={addAction}>
                  <Plus className="h-4 w-4 mr-1" />
                  액션 추가
                </Button>
              </div>
              {actions.map((action, index) => (
                <div key={action.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">액션 {index + 1}</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeAction(action.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>액션 타입</Label>
                      <Select
                        value={action.type}
                        onValueChange={(value) => updateAction(action.id, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {actionTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>지연 (분)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        onChange={(e) => updateAction(action.id, 'config', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 시간 제한 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                시간 제한
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={timeRestrictions.enabled}
                  onCheckedChange={(checked) => setTimeRestrictions({...timeRestrictions, enabled: checked})}
                />
                <Label>시간 제한 활성화</Label>
              </div>
              {timeRestrictions.enabled && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>시작 시간</Label>
                      <Input
                        type="time"
                        value={timeRestrictions.startTime}
                        onChange={(e) => setTimeRestrictions({...timeRestrictions, startTime: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>종료 시간</Label>
                      <Input
                        type="time"
                        value={timeRestrictions.endTime}
                        onChange={(e) => setTimeRestrictions({...timeRestrictions, endTime: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>실행 요일</Label>
                    <div className="flex space-x-2 mt-2">
                      {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant={timeRestrictions.daysOfWeek.includes(index) ? "default" : "outline"}
                          onClick={() => {
                            const newDays = timeRestrictions.daysOfWeek.includes(index)
                              ? timeRestrictions.daysOfWeek.filter(d => d !== index)
                              : [...timeRestrictions.daysOfWeek, index];
                            setTimeRestrictions({...timeRestrictions, daysOfWeek: newDays});
                          }}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 미리보기 */}
          <Card>
            <CardHeader>
              <CardTitle>규칙 미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>이름:</strong> {ruleName || '규칙 이름'}</div>
                <div><strong>이벤트:</strong> {eventType || '이벤트 타입'}</div>
                <div><strong>우선순위:</strong> {priority}</div>
                <div><strong>쿨다운:</strong> {cooldown}분</div>
                <div><strong>트리거 조건:</strong> {triggerConditions.length}개</div>
                <div><strong>사용자 조건:</strong> {userConditions.length}개</div>
                <div><strong>액션:</strong> {actions.length}개</div>
              </div>
            </CardContent>
          </Card>

          {/* 저장 버튼 */}
          <div className="space-y-2">
            <Button onClick={handleSave} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              규칙 저장
            </Button>
            <Button variant="outline" className="w-full">
              미리보기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}











