'use client';

import { useState, useEffect } from 'react';
import PartnerLayout from '@/components/partner/PartnerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Building2, 
  CreditCard, 
  Bell, 
  Lock, 
  Save,
  AlertCircle,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Briefcase
} from 'lucide-react';

interface PartnerSettings {
  // 기본 정보
  name: string;
  email: string;
  phone?: string;
  
  // 파트너 정보
  businessName?: string;
  businessNumber?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessDescription?: string;
  
  // 정산 정보
  bankName?: string;
  bankAccount?: string;
  accountHolder?: string;
  commissionRate: number;
  
  // 알림 설정
  notificationEmail?: string;
  notificationPhone?: string;
  autoApproval: boolean;
  
  // 알림 옵션
  emailNotifications: {
    newOrder: boolean;
    lowStock: boolean;
    paymentReceived: boolean;
    systemUpdates: boolean;
  };
}

function PartnerSettingsContent() {
  const [settings, setSettings] = useState<PartnerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // 비밀번호 변경
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/partner/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBasicInfo = async () => {
    if (!settings) return;
    
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/partner/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settings.name,
          phone: settings.phone,
          businessDescription: settings.businessDescription
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '기본 정보가 저장되었습니다.' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || '저장에 실패했습니다.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBusinessInfo = async () => {
    if (!settings) return;
    
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/partner/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: settings.businessName,
          businessNumber: settings.businessNumber,
          businessAddress: settings.businessAddress,
          businessPhone: settings.businessPhone
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '사업자 정보가 저장되었습니다.' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || '저장에 실패했습니다.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePaymentInfo = async () => {
    if (!settings) return;
    
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/partner/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: settings.bankName,
          bankAccount: settings.bankAccount,
          accountHolder: settings.accountHolder
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '정산 정보가 저장되었습니다.' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || '저장에 실패했습니다.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!settings) return;
    
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/partner/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationEmail: settings.notificationEmail,
          notificationPhone: settings.notificationPhone,
          autoApproval: settings.autoApproval,
          emailNotifications: settings.emailNotifications
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '알림 설정이 저장되었습니다.' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || '저장에 실패했습니다.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: '비밀번호는 8자 이상이어야 합니다.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/partner/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || '비밀번호 변경에 실패했습니다.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-text-secondary">
          설정을 불러올 수 없습니다.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">파트너 설정</h1>
        <p className="text-text-secondary mt-1">
          파트너 계정 및 알림 설정 관리
        </p>
      </div>

      {/* Message */}
      {message && (
        <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">
            <User className="h-4 w-4 mr-2" />
            기본 정보
          </TabsTrigger>
          <TabsTrigger value="business">
            <Building2 className="h-4 w-4 mr-2" />
            사업자 정보
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 mr-2" />
            정산 정보
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            알림 설정
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            보안
          </TabsTrigger>
        </TabsList>

        {/* 기본 정보 */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>
                파트너 계정의 기본 정보를 관리합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  placeholder="이름을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-text-secondary">
                  이메일은 변경할 수 없습니다
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="010-0000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">사업 소개</Label>
                <textarea
                  id="description"
                  className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md"
                  value={settings.businessDescription || ''}
                  onChange={(e) => setSettings({ ...settings, businessDescription: e.target.value })}
                  placeholder="파트너 사업에 대한 간단한 소개를 작성하세요"
                />
              </div>

              <Button onClick={handleSaveBasicInfo} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? '저장 중...' : '저장'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 사업자 정보 */}
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>사업자 정보</CardTitle>
              <CardDescription>
                사업자 등록 정보를 관리합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">사업자명 *</Label>
                <Input
                  id="businessName"
                  value={settings.businessName || ''}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  placeholder="사업자명을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessNumber">사업자등록번호 *</Label>
                <Input
                  id="businessNumber"
                  value={settings.businessNumber || ''}
                  onChange={(e) => setSettings({ ...settings, businessNumber: e.target.value })}
                  placeholder="000-00-00000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessAddress">사업장 주소 *</Label>
                <Input
                  id="businessAddress"
                  value={settings.businessAddress || ''}
                  onChange={(e) => setSettings({ ...settings, businessAddress: e.target.value })}
                  placeholder="사업장 주소를 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessPhone">사업장 전화번호</Label>
                <Input
                  id="businessPhone"
                  value={settings.businessPhone || ''}
                  onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
                  placeholder="02-0000-0000"
                />
              </div>

              <Button onClick={handleSaveBusinessInfo} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? '저장 중...' : '저장'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 정산 정보 */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>정산 정보</CardTitle>
              <CardDescription>
                정산 계좌 및 수수료 정보를 관리합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">수수료율</span>
                </div>
                <div className="mt-2 text-2xl font-bold text-blue-600">
                  {settings.commissionRate}%
                </div>
                <p className="mt-1 text-sm text-blue-700">
                  상품 판매 시 적용되는 수수료율입니다
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">은행명 *</Label>
                <Input
                  id="bankName"
                  value={settings.bankName || ''}
                  onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                  placeholder="은행명을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccount">계좌번호 *</Label>
                <Input
                  id="bankAccount"
                  value={settings.bankAccount || ''}
                  onChange={(e) => setSettings({ ...settings, bankAccount: e.target.value })}
                  placeholder="계좌번호를 입력하세요 (- 없이)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountHolder">예금주 *</Label>
                <Input
                  id="accountHolder"
                  value={settings.accountHolder || ''}
                  onChange={(e) => setSettings({ ...settings, accountHolder: e.target.value })}
                  placeholder="예금주명을 입력하세요"
                />
              </div>

              <Button onClick={handleSavePaymentInfo} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? '저장 중...' : '저장'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 알림 설정 */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>알림 설정</CardTitle>
              <CardDescription>
                알림 수신 방법 및 항목을 설정합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notificationEmail">알림 이메일</Label>
                  <Input
                    id="notificationEmail"
                    type="email"
                    value={settings.notificationEmail || settings.email}
                    onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                    placeholder="알림 받을 이메일"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notificationPhone">알림 전화번호</Label>
                  <Input
                    id="notificationPhone"
                    value={settings.notificationPhone || settings.phone || ''}
                    onChange={(e) => setSettings({ ...settings, notificationPhone: e.target.value })}
                    placeholder="알림 받을 전화번호"
                  />
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold">이메일 알림 설정</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>새 주문 알림</Label>
                    <p className="text-sm text-text-secondary">
                      새로운 주문이 들어올 때 알림을 받습니다
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications?.newOrder ?? true}
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        emailNotifications: {
                          ...settings.emailNotifications,
                          newOrder: checked
                        }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>재고 부족 알림</Label>
                    <p className="text-sm text-text-secondary">
                      상품 재고가 부족할 때 알림을 받습니다
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications?.lowStock ?? true}
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        emailNotifications: {
                          ...settings.emailNotifications,
                          lowStock: checked
                        }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>정산 완료 알림</Label>
                    <p className="text-sm text-text-secondary">
                      정산이 완료될 때 알림을 받습니다
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications?.paymentReceived ?? true}
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        emailNotifications: {
                          ...settings.emailNotifications,
                          paymentReceived: checked
                        }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>시스템 업데이트 알림</Label>
                    <p className="text-sm text-text-secondary">
                      시스템 업데이트 및 공지사항 알림을 받습니다
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications?.systemUpdates ?? true}
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        emailNotifications: {
                          ...settings.emailNotifications,
                          systemUpdates: checked
                        }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div className="space-y-0.5">
                    <Label>주문 자동 승인</Label>
                    <p className="text-sm text-text-secondary">
                      새 주문을 자동으로 승인합니다
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoApproval ?? false}
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        autoApproval: checked
                      })
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotifications} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? '저장 중...' : '저장'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 보안 */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>비밀번호 변경</CardTitle>
              <CardDescription>
                계정 보안을 위해 주기적으로 비밀번호를 변경하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">현재 비밀번호 *</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">새 비밀번호 *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="새 비밀번호를 입력하세요 (8자 이상)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">새 비밀번호 확인 *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-800">
                  <strong>비밀번호 요구사항:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>최소 8자 이상</li>
                    <li>영문, 숫자, 특수문자 조합 권장</li>
                    <li>다른 사이트와 동일한 비밀번호 사용 금지</li>
                  </ul>
                </div>
              </div>

              <Button onClick={handleChangePassword} disabled={saving}>
                <Lock className="h-4 w-4 mr-2" />
                {saving ? '변경 중...' : '비밀번호 변경'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function PartnerSettingsPage() {
  return (
    <PartnerLayout>
      <PartnerSettingsContent />
    </PartnerLayout>
  );
}

