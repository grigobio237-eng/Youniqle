'use client';

import { useState, useEffect } from 'react';
import PartnerLayout from '@/components/partner/PartnerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  emailNotifications?: {
    newOrder: boolean;
    lowStock: boolean;
    paymentReceived: boolean;
    systemUpdates: boolean;
  };
}

const tabs = [
  { id: 'basic', label: '기본 정보', icon: User },
  { id: 'business', label: '사업자 정보', icon: Building2 },
  { id: 'payment', label: '정산 정보', icon: CreditCard },
  { id: 'notifications', label: '알림 설정', icon: Bell },
  { id: 'security', label: '보안', icon: Lock }
];

export default function PartnerSettingsPage() {
  const [activeTab, setActiveTab] = useState('basic');
  const [settings, setSettings] = useState<PartnerSettings>({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    businessNumber: '',
    businessAddress: '',
    businessPhone: '',
    businessDescription: '',
    bankName: '',
    bankAccount: '',
    accountHolder: '',
    commissionRate: 10,
    notificationEmail: '',
    notificationPhone: '',
    autoApproval: false,
    emailNotifications: {
      newOrder: true,
      lowStock: true,
      paymentReceived: true,
      systemUpdates: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordForm, setPasswordForm] = useState({
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
        setMessage({ type: 'error', text: '저장에 실패했습니다.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '저장 중 오류가 발생했습니다.' });
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
        setMessage({ type: 'error', text: '저장에 실패했습니다.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '저장 중 오류가 발생했습니다.' });
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
          accountHolder: settings.accountHolder,
          commissionRate: settings.commissionRate
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '정산 정보가 저장되었습니다.' });
      } else {
        setMessage({ type: 'error', text: '저장에 실패했습니다.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '저장 중 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
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
        setMessage({ type: 'error', text: '저장에 실패했습니다.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '저장 중 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: '비밀번호는 최소 6자 이상이어야 합니다.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/partner/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || '비밀번호 변경에 실패했습니다.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '비밀번호 변경 중 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PartnerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">파트너 설정</h1>
          <p className="text-gray-600">파트너 계정 정보를 관리하세요</p>
        </div>

        {message && (
          <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Custom Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* 기본 정보 */}
          {activeTab === 'basic' && (
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
                <CardDescription>개인 정보를 관리하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      value={settings.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">전화번호</Label>
                    <Input
                      id="phone"
                      value={settings.phone || ''}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="businessDescription">사업 설명</Label>
                  <textarea
                    id="businessDescription"
                    className="w-full p-3 border border-gray-300 rounded-md resize-none"
                    rows={4}
                    value={settings.businessDescription || ''}
                    onChange={(e) => setSettings({ ...settings, businessDescription: e.target.value })}
                    placeholder="사업에 대해 간단히 설명해주세요"
                  />
                </div>
                <Button onClick={handleSaveBasicInfo} disabled={saving} className="w-full md:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? '저장 중...' : '저장'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 사업자 정보 */}
          {activeTab === 'business' && (
            <Card>
              <CardHeader>
                <CardTitle>사업자 정보</CardTitle>
                <CardDescription>사업자 등록 정보를 입력하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">상호명</Label>
                    <Input
                      id="businessName"
                      value={settings.businessName || ''}
                      onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessNumber">사업자등록번호</Label>
                    <Input
                      id="businessNumber"
                      value={settings.businessNumber || ''}
                      onChange={(e) => setSettings({ ...settings, businessNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessPhone">사업장 전화번호</Label>
                    <Input
                      id="businessPhone"
                      value={settings.businessPhone || ''}
                      onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="businessAddress">사업장 주소</Label>
                  <Input
                    id="businessAddress"
                    value={settings.businessAddress || ''}
                    onChange={(e) => setSettings({ ...settings, businessAddress: e.target.value })}
                  />
                </div>
                <Button onClick={handleSaveBusinessInfo} disabled={saving} className="w-full md:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? '저장 중...' : '저장'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 정산 정보 */}
          {activeTab === 'payment' && (
            <Card>
              <CardHeader>
                <CardTitle>정산 정보</CardTitle>
                <CardDescription>정산받을 계좌 정보를 입력하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">은행명</Label>
                    <Input
                      id="bankName"
                      value={settings.bankName || ''}
                      onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankAccount">계좌번호</Label>
                    <Input
                      id="bankAccount"
                      value={settings.bankAccount || ''}
                      onChange={(e) => setSettings({ ...settings, bankAccount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountHolder">예금주명</Label>
                    <Input
                      id="accountHolder"
                      value={settings.accountHolder || ''}
                      onChange={(e) => setSettings({ ...settings, accountHolder: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="commissionRate">수수료율 (%)</Label>
                    <Input
                      id="commissionRate"
                      type="number"
                      value={settings.commissionRate}
                      onChange={(e) => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <Button onClick={handleSavePaymentInfo} disabled={saving} className="w-full md:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? '저장 중...' : '저장'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 알림 설정 */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>알림 설정</CardTitle>
                <CardDescription>알림 수신 설정을 관리하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="notificationEmail">알림 이메일</Label>
                    <Input
                      id="notificationEmail"
                      type="email"
                      value={settings.notificationEmail || ''}
                      onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notificationPhone">알림 전화번호</Label>
                    <Input
                      id="notificationPhone"
                      value={settings.notificationPhone || ''}
                      onChange={(e) => setSettings({ ...settings, notificationPhone: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>주문 자동 승인</Label>
                      <p className="text-sm text-gray-500">새로운 주문을 자동으로 승인합니다</p>
                    </div>
                    <Switch
                      checked={settings.autoApproval}
                      onCheckedChange={(checked) => setSettings({ ...settings, autoApproval: checked })}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>이메일 알림</Label>
                    {settings.emailNotifications && Object.entries(settings.emailNotifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="text-sm">
                          {key === 'newOrder' && '새 주문'}
                          {key === 'lowStock' && '재고 부족'}
                          {key === 'paymentReceived' && '정산 완료'}
                          {key === 'systemUpdates' && '시스템 업데이트'}
                        </Label>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            emailNotifications: {
                              newOrder: settings.emailNotifications?.newOrder ?? true,
                              lowStock: settings.emailNotifications?.lowStock ?? true,
                              paymentReceived: settings.emailNotifications?.paymentReceived ?? true,
                              systemUpdates: settings.emailNotifications?.systemUpdates ?? true,
                              [key]: checked
                            }
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button onClick={handleSaveNotificationSettings} disabled={saving} className="w-full md:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? '저장 중...' : '저장'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 보안 */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>비밀번호 변경</CardTitle>
                <CardDescription>계정 보안을 위해 정기적으로 비밀번호를 변경하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">현재 비밀번호</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">새 비밀번호</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    비밀번호는 최소 6자 이상이어야 하며, 영문, 숫자, 특수문자를 포함하는 것을 권장합니다.
                  </AlertDescription>
                </Alert>
                
                <Button onClick={handlePasswordChange} disabled={saving} className="w-full md:w-auto">
                  <Lock className="h-4 w-4 mr-2" />
                  {saving ? '변경 중...' : '비밀번호 변경'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PartnerLayout>
  );
}