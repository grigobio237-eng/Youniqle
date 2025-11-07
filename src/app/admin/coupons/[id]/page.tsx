'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Tag, Percent, DollarSign, Truck, Calendar } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface CouponDetail {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  userUsageLimit?: number;
  status: 'active' | 'inactive' | 'expired';
  validFrom: string;
  validUntil: string;
  targetAudience: 'all' | 'new_customers' | 'existing_customers' | 'vip_customers';
}

export default function EditCouponPage() {
  const params = useParams();
  const router = useRouter();
  const couponId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coupon, setCoupon] = useState<CouponDetail | null>(null);

  useEffect(() => {
    if (couponId) {
      fetchDetail();
    }
  }, [couponId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/coupons/${couponId}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || '쿠폰 정보를 불러오지 못했습니다.');
        router.push('/admin/coupons');
        return;
      }
      const d = data.coupon as any;
      setCoupon({
        _id: d._id,
        code: d.code,
        name: d.name,
        description: d.description || '',
        type: d.type,
        value: d.value,
        minOrderAmount: d.minOrderAmount || undefined,
        maxDiscountAmount: d.maxDiscountAmount || undefined,
        usageLimit: d.usageLimit || undefined,
        userUsageLimit: d.userUsageLimit || 1,
        status: d.status,
        validFrom: d.validFrom ? new Date(d.validFrom).toISOString().slice(0,16) : '',
        validUntil: d.validUntil ? new Date(d.validUntil).toISOString().slice(0,16) : '',
        targetAudience: d.targetAudience || 'all'
      });
    } catch (e) {
      toast.error('쿠폰 정보를 불러오는 중 오류가 발생했습니다.');
      router.push('/admin/coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CouponDetail, value: any) => {
    if (!coupon) return;
    setCoupon({ ...coupon, [field]: value });
  };

  const handleSave = async () => {
    if (!coupon) return;
    try {
      setSaving(true);
      const payload: any = {
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type,
        value: coupon.type === 'free_shipping' ? 0 : Number(coupon.value),
        minOrderAmount: coupon.minOrderAmount ?? undefined,
        maxDiscountAmount: coupon.type === 'percentage' ? (coupon.maxDiscountAmount ?? undefined) : undefined,
        usageLimit: coupon.usageLimit ?? undefined,
        userUsageLimit: coupon.userUsageLimit ?? 1,
        validFrom: coupon.validFrom ? new Date(coupon.validFrom) : undefined,
        validUntil: coupon.validUntil ? new Date(coupon.validUntil) : undefined,
        targetAudience: coupon.targetAudience,
        status: coupon.status
      };

      const res = await fetch(`/api/admin/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || '수정에 실패했습니다.');
        return;
      }
      toast.success('수정되었습니다.');
      router.push('/admin/coupons');
    } catch (e) {
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !coupon) {
    return (
      <div className="p-6">로딩 중...</div>
    );
  }

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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/coupons">
              <ArrowLeft className="h-4 w-4 mr-2" />
              쿠폰 목록으로
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">쿠폰 수정</h1>
            <p className="text-gray-600 mt-1">쿠폰 정보를 수정합니다</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? '저장 중...' : (<><Save className="h-4 w-4 mr-2" />저장</>)}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="code">쿠폰 코드</Label>
              <Input id="code" value={coupon.code} onChange={(e) => handleChange('code', e.target.value.toUpperCase())} />
            </div>
            <div>
              <Label htmlFor="name">쿠폰명</Label>
              <Input id="name" value={coupon.name} onChange={(e) => handleChange('name', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="description">설명</Label>
              <Textarea id="description" value={coupon.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {getCouponIcon(coupon.type)}
              <span className="ml-2">할인 정보</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>할인 유형</Label>
              <RadioGroup value={coupon.type} onValueChange={(v) => handleChange('type', v as any)}>
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

            {coupon.type !== 'free_shipping' && (
              <div>
                <Label htmlFor="value">{coupon.type === 'percentage' ? '할인율 (%)' : '할인 금액 (원)'}</Label>
                <Input id="value" type="number" value={coupon.value} onChange={(e) => handleChange('value', Number(e.target.value))} />
              </div>
            )}

            <div>
              <Label htmlFor="minOrderAmount">최소 주문 금액 (원)</Label>
              <Input id="minOrderAmount" type="number" value={coupon.minOrderAmount ?? ''} onChange={(e) => handleChange('minOrderAmount', e.target.value ? Number(e.target.value) : undefined)} />
            </div>

            {coupon.type === 'percentage' && (
              <div>
                <Label htmlFor="maxDiscountAmount">최대 할인 금액 (원)</Label>
                <Input id="maxDiscountAmount" type="number" value={coupon.maxDiscountAmount ?? ''} onChange={(e) => handleChange('maxDiscountAmount', e.target.value ? Number(e.target.value) : undefined)} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              유효기간 및 상태
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="validFrom">시작일</Label>
              <Input id="validFrom" type="datetime-local" value={coupon.validFrom} onChange={(e) => handleChange('validFrom', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="validUntil">종료일</Label>
              <Input id="validUntil" type="datetime-local" value={coupon.validUntil} onChange={(e) => handleChange('validUntil', e.target.value)} />
            </div>
            <div>
              <Label>대상 고객</Label>
              <Select value={coupon.targetAudience} onValueChange={(v) => handleChange('targetAudience', v as any)}>
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
            <div>
              <Label>상태</Label>
              <Select value={coupon.status} onValueChange={(v) => handleChange('status', v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                  <SelectItem value="expired">만료</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



