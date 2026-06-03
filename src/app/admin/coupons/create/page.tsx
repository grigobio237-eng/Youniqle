'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tag,
  Save,
  ArrowLeft,
  Calendar,
  DollarSign,
  Percent,
  Truck,
  Users,
  Package
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CreateCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed' | 'free_shipping',
    value: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    userUsageLimit: '1',
    validityType: 'fixed' as 'fixed' | 'from_download',
    validFrom: '',
    validUntil: '',
    validityDurationDays: '',
    targetAudience: 'all' as 'all' | 'new_customers' | 'existing_customers' | 'vip_customers',
    applicableCategories: [] as string[],
    conditions: {
      minOrderCount: '',
      maxOrderCount: '',
      minTotalSpent: '',
      maxTotalSpent: '',
      userGrades: [] as string[]
    }
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('conditions.')) {
      const conditionField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        conditions: {
          ...prev.conditions,
          [conditionField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      if (checked) {
        return {
          ...prev,
          [field]: [...currentArray, value]
        };
      } else {
        return {
          ...prev,
          [field]: currentArray.filter(item => item !== value)
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.name || !formData.value) {
      toast.error('필수 필드를 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        value: parseFloat(formData.value),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        userUsageLimit: parseInt(formData.userUsageLimit),
        validFrom: new Date(formData.validFrom),
        validUntil: new Date(formData.validUntil),
        conditions: {
          ...formData.conditions,
          minOrderCount: formData.conditions.minOrderCount ? parseInt(formData.conditions.minOrderCount) : undefined,
          maxOrderCount: formData.conditions.maxOrderCount ? parseInt(formData.conditions.maxOrderCount) : undefined,
          minTotalSpent: formData.conditions.minTotalSpent ? parseFloat(formData.conditions.minTotalSpent) : undefined,
          maxTotalSpent: formData.conditions.maxTotalSpent ? parseFloat(formData.conditions.maxTotalSpent) : undefined,
        }
      };

      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        toast.success('쿠폰이 성공적으로 생성되었습니다!');
        router.push('/admin/coupons');
      } else {
        const error = await response.json();
        toast.error(error.error || '쿠폰 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('쿠폰 생성 오류:', error);
      toast.error('쿠폰 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getCouponIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-5 w-5" />;
      case 'fixed':
        return <DollarSign className="h-5 w-5" />;
      case 'free_shipping':
        return <Truck className="h-5 w-5" />;
      default:
        return <Tag className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/coupons">
              <ArrowLeft className="h-4 w-4 mr-2" />
              쿠폰 목록으로
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-obsidian">쿠폰 생성</h1>
            <p className="text-obsidian mt-1">새로운 쿠폰을 생성합니다</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                기본 정보
              </CardTitle>
              <p className="text-sm text-obsidian mt-2">
                쿠폰의 기본적인 식별 정보를 입력합니다. 쿠폰 코드는 영문 대문자와 숫자로만 구성되어야 하며, 
                쿠폰명과 설명은 사용자가 보게 될 정보입니다.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="code">쿠폰 코드 *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="WELCOME10"
                  required
                />
                <p className="text-xs text-foreground/70 mt-1">영문 대문자와 숫자로 입력하세요</p>
              </div>

              <div>
                <Label htmlFor="name">쿠폰명 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="신규 회원 환영 쿠폰"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="쿠폰에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* 할인 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {getCouponIcon(formData.type)}
                <span className="ml-2">할인 정보</span>
              </CardTitle>
              <p className="text-sm text-obsidian mt-2">
                쿠폰의 할인 유형과 금액을 설정합니다. 퍼센트 할인은 비율로, 고정 금액 할인은 원화로 입력하며, 
                최소 주문 금액과 최대 할인 금액을 통해 사용 조건을 제한할 수 있습니다.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>할인 유형 *</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="percentage" />
                    <Label htmlFor="percentage">퍼센트 할인</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed">고정 금액 할인</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free_shipping" id="free_shipping" />
                    <Label htmlFor="free_shipping">무료 배송</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.type !== 'free_shipping' && (
                <div>
                  <Label htmlFor="value">
                    {formData.type === 'percentage' ? '할인율 (%)' : '할인 금액 (원)'} *
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                    placeholder={formData.type === 'percentage' ? '10' : '5000'}
                    required
                    min="0"
                    step={formData.type === 'percentage' ? '0.1' : '1'}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="minOrderAmount">최소 주문 금액 (원)</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                  placeholder="30000"
                  min="0"
                />
              </div>

              {formData.type === 'percentage' && (
                <div>
                  <Label htmlFor="maxDiscountAmount">최대 할인 금액 (원)</Label>
                  <Input
                    id="maxDiscountAmount"
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxDiscountAmount: e.target.value }))}
                    placeholder="10000"
                    min="0"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 사용 제한 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                사용 제한
              </CardTitle>
              <p className="text-sm text-obsidian mt-2">
                쿠폰의 사용 횟수와 대상 고객을 제한합니다. 총 사용 횟수는 전체 사용 가능 횟수이며, 
                사용자당 사용 횟수는 한 명의 사용자가 사용할 수 있는 횟수입니다. 0 또는 비워두면 무제한입니다.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="usageLimit">총 사용 횟수 제한</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                  placeholder="1000"
                  min="1"
                />
                <p className="text-xs text-foreground/70 mt-1">비워두면 무제한</p>
              </div>

              <div>
                <Label htmlFor="userUsageLimit">사용자당 사용 횟수</Label>
                <Input
                  id="userUsageLimit"
                  type="number"
                  value={formData.userUsageLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, userUsageLimit: e.target.value }))}
                  min="1"
                />
              </div>

              <div>
                <Label>대상 고객</Label>
                <Select
                  value={formData.targetAudience}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, targetAudience: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 고객</SelectItem>
                    <SelectItem value="new_customers">신규 고객</SelectItem>
                    <SelectItem value="existing_customers">기존 고객</SelectItem>
                    <SelectItem value="vip_customers">VIP 고객</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 유효기간 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                유효기간
              </CardTitle>
              <p className="text-sm text-obsidian mt-2">
                쿠폰의 유효기간을 설정합니다. 고정 기간은 관리자가 직접 시작일과 종료일을 지정하고, 
                다운로드 시점부터는 사용자가 쿠폰을 다운로드한 시점부터 일정 기간 동안 유효합니다.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>유효기간 설정 방식</Label>
                <RadioGroup
                  value={formData.validityType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, validityType: value as any }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed_period" />
                    <Label htmlFor="fixed_period">고정 기간</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="from_download" id="from_download" />
                    <Label htmlFor="from_download">다운로드 시점부터</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.validityType === 'fixed' ? (
                <>
                  <div>
                    <Label htmlFor="validFrom">시작일 *</Label>
                    <Input
                      id="validFrom"
                      type="datetime-local"
                      value={formData.validFrom}
                      onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="validUntil">종료일 *</Label>
                    <Input
                      id="validUntil"
                      type="datetime-local"
                      value={formData.validUntil}
                      onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <Label htmlFor="validityDurationDays">유효 기간 (일) *</Label>
                  <Input
                    id="validityDurationDays"
                    type="number"
                    value={formData.validityDurationDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, validityDurationDays: e.target.value }))}
                    placeholder="7"
                    min="1"
                    required
                  />
                  <p className="text-xs text-foreground/70 mt-1">
                    사용자가 쿠폰을 다운로드한 시점부터 계산됩니다
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 적용 카테고리 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                적용 카테고리
              </CardTitle>
              <p className="text-sm text-obsidian mt-2">
                쿠폰이 적용될 상품 카테고리를 선택합니다. 하나 이상의 카테고리를 선택할 수 있으며, 
                선택하지 않으면 모든 카테고리에 적용됩니다. 체크박스를 클릭하여 선택/해제할 수 있습니다.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['패션', '뷰티', '홈&리빙', '디지털', '스포츠', '도서', '식품', '기타'].map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={formData.applicableCategories.includes(category)}
                      onCheckedChange={(checked) => 
                        handleArrayChange('applicableCategories', category, checked as boolean)
                      }
                    />
                    <Label htmlFor={category}>{category}</Label>
                  </div>
                ))}
                <p className="text-xs text-foreground/70 mt-2">
                  선택하지 않으면 모든 카테고리에 적용됩니다
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 추가 조건 */}
          <Card>
            <CardHeader>
              <CardTitle>추가 조건</CardTitle>
              <p className="text-sm text-obsidian mt-2">
                쿠폰 사용을 위한 추가적인 조건을 설정합니다. 사용자의 주문 횟수, 총 구매 금액, 
                사용자 등급 등을 기준으로 쿠폰 사용 자격을 제한할 수 있습니다. 비워두면 해당 조건이 적용되지 않습니다.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minOrderCount">최소 주문 횟수</Label>
                  <Input
                    id="minOrderCount"
                    type="number"
                    value={formData.conditions.minOrderCount}
                    onChange={(e) => handleInputChange('conditions.minOrderCount', e.target.value)}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="maxOrderCount">최대 주문 횟수</Label>
                  <Input
                    id="maxOrderCount"
                    type="number"
                    value={formData.conditions.maxOrderCount}
                    onChange={(e) => handleInputChange('conditions.maxOrderCount', e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minTotalSpent">최소 총 구매 금액 (원)</Label>
                  <Input
                    id="minTotalSpent"
                    type="number"
                    value={formData.conditions.minTotalSpent}
                    onChange={(e) => handleInputChange('conditions.minTotalSpent', e.target.value)}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="maxTotalSpent">최대 총 구매 금액 (원)</Label>
                  <Input
                    id="maxTotalSpent"
                    type="number"
                    value={formData.conditions.maxTotalSpent}
                    onChange={(e) => handleInputChange('conditions.maxTotalSpent', e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div>
                <Label>적용 가능한 사용자 등급</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['cedar', 'rooter', 'bloomer', 'glower', 'ecosoul'].map((grade) => (
                    <div key={grade} className="flex items-center space-x-2">
                      <Checkbox
                        id={grade}
                        checked={formData.conditions.userGrades.includes(grade)}
                        onCheckedChange={(checked) => 
                          handleArrayChange('conditions.userGrades', grade, checked as boolean)
                        }
                      />
                      <Label htmlFor={grade} className="text-sm capitalize">{grade}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/coupons">취소</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                생성 중...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                쿠폰 생성
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
