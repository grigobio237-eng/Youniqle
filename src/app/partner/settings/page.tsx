'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
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
  Briefcase,
  Clock,
  MessageSquare,
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

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
  // 운영 설정
  businessHours?: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  autoReplyMessage?: string;
  autoReplyEnabled?: boolean;
  // 브랜딩
  shopLogo?: string;
  shopBanner?: string;

  // 코치 정보
  partnerType?: string;
  coachProfile?: {
    title: string;
    specialty: string;
    philosophy: string;
    description: string;
    certifications: string[];
    programs: Array<{
      title: string;
      duration: string;
      intensity: 'Low' | 'Medium' | 'High' | 'Mild';
      price: string;
      tags: string[];
    }>;
    profileImage: string;
  };
}

const tabs = [
  { id: 'basic', label: '기본 정보', icon: User },
  { id: 'business', label: '사업자 정보', icon: Building2 },
  { id: 'hours', label: '운영 설정', icon: Clock },
  { id: 'branding', label: '상점 브랜딩', icon: ImageIcon },
  { id: 'payment', label: '정산 정보', icon: CreditCard },
  { id: 'notifications', label: '알림 설정', icon: Bell },
  { id: 'security', label: '보안', icon: Lock }
];

const defaultBusinessHours = {
  monday: { open: '09:00', close: '18:00', isOpen: true },
  tuesday: { open: '09:00', close: '18:00', isOpen: true },
  wednesday: { open: '09:00', close: '18:00', isOpen: true },
  thursday: { open: '09:00', close: '18:00', isOpen: true },
  friday: { open: '09:00', close: '18:00', isOpen: true },
  saturday: { open: '10:00', close: '17:00', isOpen: false },
  sunday: { open: '10:00', close: '17:00', isOpen: false },
};

const dayLabels: Record<string, string> = {
  monday: '월요일',
  tuesday: '화요일',
  wednesday: '수요일',
  thursday: '목요일',
  friday: '금요일',
  saturday: '토요일',
  sunday: '일요일',
};

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
    },
    businessHours: defaultBusinessHours,
    autoReplyMessage: '안녕하세요! 문의를 접수하였습니다. 영업시간 내에 답변 드리겠습니다.',
    autoReplyEnabled: false,
    shopLogo: '',
    shopBanner: '',
    coachProfile: {
      title: '',
      specialty: '',
      philosophy: '',
      description: '',
      certifications: [],
      programs: [],
      profileImage: ''
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

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

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

  const handleBrandingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 용량 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'partner-branding');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          [type === 'logo' ? 'shopLogo' : 'shopBanner']: data.url
        }));
        toast.success(type === 'logo' ? '로고가 업로드되었습니다.' : '배너가 업로드되었습니다.');
      } else {
        const error = await response.json();
        toast.error(error.error || '이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
      // 같은 파일 다시 올릴 수 있도록 초기화
      e.target.value = '';
    }
  };

  const handleSaveHours = async () => {
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/partner/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessHours: settings.businessHours,
          autoReplyMessage: settings.autoReplyMessage,
          autoReplyEnabled: settings.autoReplyEnabled
        })
      });

      if (response.ok) {
        toast.success('운영 설정이 저장되었습니다.');
        setMessage({ type: 'success', text: '운영 설정이 저장되었습니다.' });
      } else {
        toast.error('저장에 실패했습니다.');
      }
    } catch (error) {
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBranding = async () => {
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/partner/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopLogo: settings.shopLogo,
          shopBanner: settings.shopBanner
        })
      });

      if (response.ok) {
        toast.success('브랜딩 정보가 저장되었습니다.');
        setMessage({ type: 'success', text: '브랜딩 정보가 저장되었습니다.' });
      } else {
        toast.error('저장에 실패했습니다.');
      }
    } catch (error) {
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
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
          businessName: settings.businessName,
          businessNumber: settings.businessNumber,
          businessAddress: settings.businessAddress,
          businessPhone: settings.businessPhone,
          businessDescription: settings.businessDescription
        })
      });

      if (response.ok) {
        toast.success('기본 정보가 저장되었습니다.');
        setMessage({ type: 'success', text: '기본 정보가 저장되었습니다.' });
      } else {
        toast.error('저장에 실패했습니다.');
      }
    } catch (error) {
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCoachProfile = async () => {
    if (!settings || !settings.coachProfile) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/partner/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachProfile: settings.coachProfile
        })
      });

      if (response.ok) {
        toast.success('코치 프로필이 저장되었습니다.');
        setMessage({ type: 'success', text: '코치 프로필이 저장되었습니다.' });
      } else {
        toast.error('저장에 실패했습니다.');
      }
    } catch (error) {
      toast.error('저장 중 오류가 발생했습니다.');
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
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
            {settings.partnerType === 'coach' && (
              <button
                onClick={() => setActiveTab('coach')}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'coach'
                  ? 'border-chapter-accent text-chapter-accent'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                코치 프로필
              </button>
            )}
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

          {/* 운영 설정 */}
          {activeTab === 'hours' && (
            <div className="space-y-6">
              {/* 영업시간 설정 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    영업시간 설정
                  </CardTitle>
                  <CardDescription>요일별 영업시간을 설정하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(dayLabels).map(([day, label]) => {
                    const hours = settings.businessHours?.[day as keyof typeof defaultBusinessHours] || defaultBusinessHours[day as keyof typeof defaultBusinessHours];
                    return (
                      <div key={day} className="flex items-center gap-4 p-3 border rounded-xl">
                        <div className="w-20">
                          <Label className="font-medium">{dayLabels[day]}</Label>
                        </div>
                        <Switch
                          checked={hours.isOpen}
                          onCheckedChange={(checked) => {
                            setSettings({
                              ...settings,
                              businessHours: {
                                ...settings.businessHours!,
                                [day]: { ...hours, isOpen: checked }
                              }
                            });
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={hours.open}
                            disabled={!hours.isOpen}
                            className="w-32"
                            onChange={(e) => {
                              setSettings({
                                ...settings,
                                businessHours: {
                                  ...settings.businessHours!,
                                  [day]: { ...hours, open: e.target.value }
                                }
                              });
                            }}
                          />
                          <span className="text-gray-500">~</span>
                          <Input
                            type="time"
                            value={hours.close}
                            disabled={!hours.isOpen}
                            className="w-32"
                            onChange={(e) => {
                              setSettings({
                                ...settings,
                                businessHours: {
                                  ...settings.businessHours!,
                                  [day]: { ...hours, close: e.target.value }
                                }
                              });
                            }}
                          />
                        </div>
                        <Badge variant={hours.isOpen ? "default" : "secondary"}>
                          {hours.isOpen ? '영업' : '휴무'}
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* 자동 응답 설정 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    자동 응답 메시지
                  </CardTitle>
                  <CardDescription>영업시간 외 고객 문의에 자동 응답 메시지를 보냅니다</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>자동 응답 활성화</Label>
                      <p className="text-sm text-gray-500">영업시간 외 자동 응답 발송</p>
                    </div>
                    <Switch
                      checked={settings.autoReplyEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, autoReplyEnabled: checked })}
                    />
                  </div>
                  <div>
                    <Label>자동 응답 메시지</Label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md resize-none mt-2"
                      rows={4}
                      value={settings.autoReplyMessage || ''}
                      onChange={(e) => setSettings({ ...settings, autoReplyMessage: e.target.value })}
                      placeholder="자동 응답 메시지를 입력하세요"
                      disabled={!settings.autoReplyEnabled}
                    />
                  </div>
                  <Button onClick={handleSaveHours} disabled={saving} className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? '저장 중...' : '저장'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 상점 브랜딩 */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    상점 로고 & 배너
                  </CardTitle>
                  <CardDescription>유니클 플랫폼에 표시될 상점 이미지를 업로드하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 로고 업로드 */}
                  <div>
                    <Label>상점 로고</Label>
                    <p className="text-sm text-gray-500 mb-2">권장 크기: 200x200px (정사각형)</p>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden">
                        {settings.shopLogo ? (
                          <Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized src={settings.shopLogo} alt="로고" className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          ref={logoInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleBrandingImageUpload(e, 'logo')}
                          aria-label="상점 로고 업로드"
                        />
                        <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                          <Upload className="h-4 w-4 mr-2" />
                          이미지 업로드
                        </Button>
                        {settings.shopLogo && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => setSettings({ ...settings, shopLogo: '' })}
                          >
                            삭제
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 배너 업로드 */}
                  <div>
                    <Label>상점 배너</Label>
                    <p className="text-sm text-gray-500 mb-2">권장 크기: 1200x400px (3:1 비율)</p>
                    <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden">
                      {settings.shopBanner ? (
                        <Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized src={settings.shopBanner} alt="배너" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">배너 이미지 업로드</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="file"
                        ref={bannerInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleBrandingImageUpload(e, 'banner')}
                        aria-label="상점 배너 업로드"
                      />
                      <Button variant="outline" size="sm" onClick={() => bannerInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        배너 업로드
                      </Button>
                      {settings.shopBanner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => setSettings({ ...settings, shopBanner: '' })}
                        >
                          삭제
                        </Button>
                      )}
                    </div>
                  </div>

                  <Button onClick={handleSaveBranding} disabled={saving} className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? '저장 중...' : '저장'}
                  </Button>
                </CardContent>
              </Card>
            </div>
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
                      readOnly
                      className="bg-gray-50 font-medium text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">수수료율은 관리자가 설정하며 파트너가 직접 수정할 수 없습니다.</p>
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
          {/* 코치 프로필 설정 */}
          {activeTab === 'coach' && settings.partnerType === 'coach' && settings.coachProfile && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>코치 전문성 정보</CardTitle>
                  <CardDescription>유니클 트레이너 페이지에 노출될 전문 정보를 입력하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="coachTitle">전문 타이틀 (예: Senior Recovery Curator)</Label>
                      <Input
                        id="coachTitle"
                        value={settings.coachProfile.title}
                        onChange={(e) => setSettings({
                          ...settings,
                          coachProfile: { ...settings.coachProfile!, title: e.target.value }
                        })}
                        placeholder="전문화된 직함을 입력하세요"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="coachSpecialty">주요 전문 분야 (예: Neuromuscular Reset)</Label>
                      <Input
                        id="coachSpecialty"
                        value={settings.coachProfile.specialty}
                        onChange={(e) => setSettings({
                          ...settings,
                          coachProfile: { ...settings.coachProfile!, specialty: e.target.value }
                        })}
                        placeholder="핵심 전문 분야를 입력하세요"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coachPhilosophy">전문 철학 (한 문장 요약)</Label>
                    <Input
                      id="coachPhilosophy"
                      value={settings.coachProfile.philosophy}
                      onChange={(e) => setSettings({
                        ...settings,
                        coachProfile: { ...settings.coachProfile!, philosophy: e.target.value }
                      })}
                      placeholder="내면의 평화가 신체 회복의 시작임을 증명합니다."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coachDescription">상세 소개</Label>
                    <Textarea
                      id="coachDescription"
                      rows={4}
                      value={settings.coachProfile.description}
                      onChange={(e) => setSettings({
                        ...settings,
                        coachProfile: { ...settings.coachProfile!, description: e.target.value }
                      })}
                      placeholder="자신의 경력과 철학을 상세히 설명해주세요."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>자격 사항 (엔터로 구분)</Label>
                    <Textarea
                      rows={3}
                      value={settings.coachProfile.certifications.join('\n')}
                      onChange={(e) => setSettings({
                        ...settings,
                        coachProfile: {
                          ...settings.coachProfile!,
                          certifications: e.target.value.split('\n').filter(s => s.trim() !== '')
                        }
                      })}
                      placeholder="보유하신 자격증이나 교육 이수 사항을 입력하세요."
                    />
                  </div>

                  <Button onClick={handleSaveCoachProfile} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? '저장 중...' : '프로필 저장'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>코칭 프로그램</CardTitle>
                      <CardDescription>제공하시는 회복 프로그램을 등록하고 관리하세요</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      const newProgram = {
                        title: '새 프로그램',
                        duration: '60 min',
                        intensity: 'Medium' as const,
                        price: '100,000₩',
                        tags: []
                      };
                      setSettings({
                        ...settings,
                        coachProfile: {
                          ...settings.coachProfile!,
                          programs: [...settings.coachProfile!.programs, newProgram]
                        }
                      });
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      프로그램 추가
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {settings.coachProfile.programs.map((program, index) => (
                      <div key={index} className="p-4 border rounded-xl space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                            <div className="space-y-2">
                              <Label>프로그램 명</Label>
                              <Input
                                value={program.title}
                                onChange={(e) => {
                                  const newPrograms = [...settings.coachProfile!.programs];
                                  newPrograms[index].title = e.target.value;
                                  setSettings({
                                    ...settings,
                                    coachProfile: { ...settings.coachProfile!, programs: newPrograms }
                                  });
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>소요 시간 (예: 90 min)</Label>
                              <Input
                                value={program.duration}
                                onChange={(e) => {
                                  const newPrograms = [...settings.coachProfile!.programs];
                                  newPrograms[index].duration = e.target.value;
                                  setSettings({
                                    ...settings,
                                    coachProfile: { ...settings.coachProfile!, programs: newPrograms }
                                  });
                                }}
                              />
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-500 ml-4" onClick={() => {
                            const newPrograms = [...settings.coachProfile!.programs];
                            newPrograms.splice(index, 1);
                            setSettings({
                              ...settings,
                              coachProfile: { ...settings.coachProfile!, programs: newPrograms }
                            });
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>강도</Label>
                            <Select
                              value={program.intensity}
                              onValueChange={(val: any) => {
                                const newPrograms = [...settings.coachProfile!.programs];
                                newPrograms[index].intensity = val;
                                setSettings({
                                  ...settings,
                                  coachProfile: { ...settings.coachProfile!, programs: newPrograms }
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="강도 선택" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Mild">Mild</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>가격 (예: 180,000₩)</Label>
                            <Input
                              value={program.price}
                              onChange={(e) => {
                                const newPrograms = [...settings.coachProfile!.programs];
                                newPrograms[index].price = e.target.value;
                                setSettings({
                                  ...settings,
                                  coachProfile: { ...settings.coachProfile!, programs: newPrograms }
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {settings.coachProfile.programs.length > 0 && (
                    <Button onClick={handleSaveCoachProfile} disabled={saving} className="mt-6">
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? '저장 중...' : '프로그램 정보 저장'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PartnerLayout>
  );
}