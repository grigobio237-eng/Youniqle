'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Bell, 
  Mail, 
  Shield, 
  Database, 
  Globe, 
  CreditCard, 
  Users, 
  Store, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
  Upload,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Key,
  Server,
  Zap,
  Monitor,
  Smartphone,
  Wifi,
  Lock,
  Unlock
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminSettings {
  general: {
    siteName: string;
    siteDescription: string;
    siteLogo?: string;
    siteFavicon?: string;
    defaultLanguage: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    currencySymbol: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
  };
  security: {
    enableTwoFactor: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    requireStrongPassword: boolean;
    passwordMinLength: number;
    enableCaptcha: boolean;
    allowedFileTypes: string[];
    maxFileSize: number;
    enableRateLimiting: boolean;
    rateLimitWindow: number;
    rateLimitMax: number;
  };
  notifications: {
    emailNotifications: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    smtpSecure: boolean;
    fromEmail: string;
    fromName: string;
    adminEmails: string[];
    orderNotifications: boolean;
    userNotifications: boolean;
    systemNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
  };
  payment: {
    defaultPaymentMethod: string;
    enablePaypal: boolean;
    paypalClientId: string;
    paypalClientSecret: string;
    enableStripe: boolean;
    stripePublishableKey: string;
    stripeSecretKey: string;
    enableNicepay: boolean;
    nicepayMid: string;
    nicepaySecretKey: string;
    enableEscrow: boolean;
    escrowCommission: number;
    enableRefund: boolean;
    refundPeriod: number;
  };
  business: {
    companyName: string;
    businessNumber: string;
    ceoName: string;
    address: string;
    phone: string;
    email: string;
    taxRate: number;
    shippingCost: number;
    freeShippingThreshold: number;
    returnPolicy: string;
    privacyPolicy: string;
    termsOfService: string;
    commissionRate: number;
    partnerApprovalRequired: boolean;
    autoApprovePartners: boolean;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    googleAnalyticsId: string;
    googleTagManagerId: string;
    facebookPixelId: string;
    enableSitemap: boolean;
    enableRobotsTxt: boolean;
    canonicalUrl: string;
  };
  performance: {
    enableCaching: boolean;
    cacheDuration: number;
    enableImageOptimization: boolean;
    enableLazyLoading: boolean;
    enableCompression: boolean;
    maxConcurrentRequests: number;
    enableCdn: boolean;
    cdnUrl: string;
  };
  backup: {
    enableAutoBackup: boolean;
    backupFrequency: string;
    backupRetention: number;
    backupLocation: string;
    enableDatabaseBackup: boolean;
    enableFileBackup: boolean;
    backupNotifications: boolean;
  };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        toast.error('설정을 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('설정 조회 오류:', error);
      toast.error('설정 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
        credentials: 'include'
      });
      
      if (response.ok) {
        toast.success('설정이 저장되었습니다.');
      } else {
        toast.error('설정 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('설정 저장 오류:', error);
      toast.error('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: keyof AdminSettings, field: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value
      }
    }));
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const resetSettings = async () => {
    if (confirm('설정을 기본값으로 초기화하시겠습니까?')) {
      await fetchSettings();
      toast.info('설정이 초기화되었습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">설정을 불러오는 중...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">설정을 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">시스템 설정</h1>
          <p className="text-text-secondary mt-1">
            시스템 전반의 설정을 관리하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            초기화
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            일반
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            보안
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            알림
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            결제
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            비즈니스
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            성능
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            백업
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                일반 설정
              </CardTitle>
              <CardDescription>
                사이트의 기본 정보와 일반적인 설정을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">사이트 이름</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => updateSettings('general', 'siteName', e.target.value)}
                    placeholder="사이트 이름을 입력하세요"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">기본 언어</Label>
                  <Select 
                    value={settings.general.defaultLanguage}
                    onValueChange={(value) => updateSettings('general', 'defaultLanguage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">사이트 설명</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) => updateSettings('general', 'siteDescription', e.target.value)}
                  placeholder="사이트에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">시간대</Label>
                  <Select 
                    value={settings.general.timezone}
                    onValueChange={(value) => updateSettings('general', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Seoul">Asia/Seoul (KST)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">통화</Label>
                  <Select 
                    value={settings.general.currency}
                    onValueChange={(value) => updateSettings('general', 'currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KRW">KRW (원)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currencySymbol">통화 기호</Label>
                  <Input
                    id="currencySymbol"
                    value={settings.general.currencySymbol}
                    onChange={(e) => updateSettings('general', 'currencySymbol', e.target.value)}
                    placeholder="₩"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  checked={settings.general.maintenanceMode}
                  onCheckedChange={(checked) => updateSettings('general', 'maintenanceMode', checked)}
                />
                <Label htmlFor="maintenanceMode">유지보수 모드</Label>
              </div>

              {settings.general.maintenanceMode && (
                <div className="space-y-2">
                  <Label htmlFor="maintenanceMessage">유지보수 메시지</Label>
                  <Textarea
                    id="maintenanceMessage"
                    value={settings.general.maintenanceMessage}
                    onChange={(e) => updateSettings('general', 'maintenanceMessage', e.target.value)}
                    placeholder="유지보수 중 메시지를 입력하세요"
                    rows={2}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                보안 설정
              </CardTitle>
              <CardDescription>
                시스템 보안과 접근 제어 설정을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">세션 타임아웃 (분)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">최대 로그인 시도 횟수</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSettings('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">최소 비밀번호 길이</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSettings('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">최대 파일 크기 (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.security.maxFileSize}
                    onChange={(e) => updateSettings('security', 'maxFileSize', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableTwoFactor"
                    checked={settings.security.enableTwoFactor}
                    onCheckedChange={(checked) => updateSettings('security', 'enableTwoFactor', checked)}
                  />
                  <Label htmlFor="enableTwoFactor">2단계 인증 활성화</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireStrongPassword"
                    checked={settings.security.requireStrongPassword}
                    onCheckedChange={(checked) => updateSettings('security', 'requireStrongPassword', checked)}
                  />
                  <Label htmlFor="requireStrongPassword">강력한 비밀번호 요구</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableCaptcha"
                    checked={settings.security.enableCaptcha}
                    onCheckedChange={(checked) => updateSettings('security', 'enableCaptcha', checked)}
                  />
                  <Label htmlFor="enableCaptcha">캡차 활성화</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableRateLimiting"
                    checked={settings.security.enableRateLimiting}
                    onCheckedChange={(checked) => updateSettings('security', 'enableRateLimiting', checked)}
                  />
                  <Label htmlFor="enableRateLimiting">속도 제한 활성화</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                알림 설정
              </CardTitle>
              <CardDescription>
                이메일 및 알림 설정을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP 호스트</Label>
                  <Input
                    id="smtpHost"
                    value={settings.notifications.smtpHost}
                    onChange={(e) => updateSettings('notifications', 'smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP 포트</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={settings.notifications.smtpPort}
                    onChange={(e) => updateSettings('notifications', 'smtpPort', parseInt(e.target.value))}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP 사용자명</Label>
                  <Input
                    id="smtpUser"
                    value={settings.notifications.smtpUser}
                    onChange={(e) => updateSettings('notifications', 'smtpUser', e.target.value)}
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP 비밀번호</Label>
                  <div className="relative">
                    <Input
                      id="smtpPassword"
                      type={showPasswords.smtpPassword ? "text" : "password"}
                      value={settings.notifications.smtpPassword}
                      onChange={(e) => updateSettings('notifications', 'smtpPassword', e.target.value)}
                      placeholder="앱 비밀번호"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('smtpPassword')}
                    >
                      {showPasswords.smtpPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailNotifications"
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => updateSettings('notifications', 'emailNotifications', checked)}
                  />
                  <Label htmlFor="emailNotifications">이메일 알림 활성화</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="orderNotifications"
                    checked={settings.notifications.orderNotifications}
                    onCheckedChange={(checked) => updateSettings('notifications', 'orderNotifications', checked)}
                  />
                  <Label htmlFor="orderNotifications">주문 알림</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="userNotifications"
                    checked={settings.notifications.userNotifications}
                    onCheckedChange={(checked) => updateSettings('notifications', 'userNotifications', checked)}
                  />
                  <Label htmlFor="userNotifications">사용자 알림</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="systemNotifications"
                    checked={settings.notifications.systemNotifications}
                    onCheckedChange={(checked) => updateSettings('notifications', 'systemNotifications', checked)}
                  />
                  <Label htmlFor="systemNotifications">시스템 알림</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                결제 설정
              </CardTitle>
              <CardDescription>
                결제 시스템과 관련 설정을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="defaultPaymentMethod">기본 결제 수단</Label>
                <Select 
                  value={settings.payment.defaultPaymentMethod}
                  onValueChange={(value) => updateSettings('payment', 'defaultPaymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">신용카드</SelectItem>
                    <SelectItem value="bank">계좌이체</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="nicepay">나이스페이</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nicepayMid">나이스페이 MID</Label>
                  <Input
                    id="nicepayMid"
                    value={settings.payment.nicepayMid}
                    onChange={(e) => updateSettings('payment', 'nicepayMid', e.target.value)}
                    placeholder="상점 ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nicepaySecretKey">나이스페이 Secret Key</Label>
                  <div className="relative">
                    <Input
                      id="nicepaySecretKey"
                      type={showPasswords.nicepaySecretKey ? "text" : "password"}
                      value={settings.payment.nicepaySecretKey}
                      onChange={(e) => updateSettings('payment', 'nicepaySecretKey', e.target.value)}
                      placeholder="Secret Key"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('nicepaySecretKey')}
                    >
                      {showPasswords.nicepaySecretKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableNicepay"
                    checked={settings.payment.enableNicepay}
                    onCheckedChange={(checked) => updateSettings('payment', 'enableNicepay', checked)}
                  />
                  <Label htmlFor="enableNicepay">나이스페이 활성화</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableEscrow"
                    checked={settings.payment.enableEscrow}
                    onCheckedChange={(checked) => updateSettings('payment', 'enableEscrow', checked)}
                  />
                  <Label htmlFor="enableEscrow">에스크로 활성화</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableRefund"
                    checked={settings.payment.enableRefund}
                    onCheckedChange={(checked) => updateSettings('payment', 'enableRefund', checked)}
                  />
                  <Label htmlFor="enableRefund">환불 기능 활성화</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Settings */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                비즈니스 설정
              </CardTitle>
              <CardDescription>
                회사 정보와 비즈니스 정책을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">회사명</Label>
                  <Input
                    id="companyName"
                    value={settings.business.companyName}
                    onChange={(e) => updateSettings('business', 'companyName', e.target.value)}
                    placeholder="회사명을 입력하세요"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessNumber">사업자등록번호</Label>
                  <Input
                    id="businessNumber"
                    value={settings.business.businessNumber}
                    onChange={(e) => updateSettings('business', 'businessNumber', e.target.value)}
                    placeholder="000-00-00000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ceoName">대표자명</Label>
                  <Input
                    id="ceoName"
                    value={settings.business.ceoName}
                    onChange={(e) => updateSettings('business', 'ceoName', e.target.value)}
                    placeholder="대표자명을 입력하세요"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">대표 전화번호</Label>
                  <Input
                    id="phone"
                    value={settings.business.phone}
                    onChange={(e) => updateSettings('business', 'phone', e.target.value)}
                    placeholder="02-0000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">주소</Label>
                <Textarea
                  id="address"
                  value={settings.business.address}
                  onChange={(e) => updateSettings('business', 'address', e.target.value)}
                  placeholder="회사 주소를 입력하세요"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">세율 (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={settings.business.taxRate}
                    onChange={(e) => updateSettings('business', 'taxRate', parseFloat(e.target.value))}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingCost">배송비</Label>
                  <Input
                    id="shippingCost"
                    type="number"
                    value={settings.business.shippingCost}
                    onChange={(e) => updateSettings('business', 'shippingCost', parseInt(e.target.value))}
                    placeholder="3000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commissionRate">수수료율 (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    value={settings.business.commissionRate}
                    onChange={(e) => updateSettings('business', 'commissionRate', parseFloat(e.target.value))}
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="partnerApprovalRequired"
                    checked={settings.business.partnerApprovalRequired}
                    onCheckedChange={(checked) => updateSettings('business', 'partnerApprovalRequired', checked)}
                  />
                  <Label htmlFor="partnerApprovalRequired">파트너 승인 필요</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoApprovePartners"
                    checked={settings.business.autoApprovePartners}
                    onCheckedChange={(checked) => updateSettings('business', 'autoApprovePartners', checked)}
                  />
                  <Label htmlFor="autoApprovePartners">파트너 자동 승인</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                SEO 설정
              </CardTitle>
              <CardDescription>
                검색 엔진 최적화 설정을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">메타 타이틀</Label>
                <Input
                  id="metaTitle"
                  value={settings.seo.metaTitle}
                  onChange={(e) => updateSettings('seo', 'metaTitle', e.target.value)}
                  placeholder="페이지 타이틀을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">메타 설명</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.seo.metaDescription}
                  onChange={(e) => updateSettings('seo', 'metaDescription', e.target.value)}
                  placeholder="페이지 설명을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaKeywords">메타 키워드</Label>
                <Input
                  id="metaKeywords"
                  value={settings.seo.metaKeywords}
                  onChange={(e) => updateSettings('seo', 'metaKeywords', e.target.value)}
                  placeholder="키워드1, 키워드2, 키워드3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    value={settings.seo.googleAnalyticsId}
                    onChange={(e) => updateSettings('seo', 'googleAnalyticsId', e.target.value)}
                    placeholder="GA-XXXXXXXXX-X"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                  <Input
                    id="facebookPixelId"
                    value={settings.seo.facebookPixelId}
                    onChange={(e) => updateSettings('seo', 'facebookPixelId', e.target.value)}
                    placeholder="123456789012345"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableSitemap"
                    checked={settings.seo.enableSitemap}
                    onCheckedChange={(checked) => updateSettings('seo', 'enableSitemap', checked)}
                  />
                  <Label htmlFor="enableSitemap">사이트맵 활성화</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableRobotsTxt"
                    checked={settings.seo.enableRobotsTxt}
                    onCheckedChange={(checked) => updateSettings('seo', 'enableRobotsTxt', checked)}
                  />
                  <Label htmlFor="enableRobotsTxt">robots.txt 활성화</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                성능 설정
              </CardTitle>
              <CardDescription>
                시스템 성능과 최적화 설정을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cacheDuration">캐시 지속 시간 (초)</Label>
                  <Input
                    id="cacheDuration"
                    type="number"
                    value={settings.performance.cacheDuration}
                    onChange={(e) => updateSettings('performance', 'cacheDuration', parseInt(e.target.value))}
                    placeholder="3600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxConcurrentRequests">최대 동시 요청 수</Label>
                  <Input
                    id="maxConcurrentRequests"
                    type="number"
                    value={settings.performance.maxConcurrentRequests}
                    onChange={(e) => updateSettings('performance', 'maxConcurrentRequests', parseInt(e.target.value))}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cdnUrl">CDN URL</Label>
                <Input
                  id="cdnUrl"
                  value={settings.performance.cdnUrl}
                  onChange={(e) => updateSettings('performance', 'cdnUrl', e.target.value)}
                  placeholder="https://cdn.example.com"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableCaching"
                    checked={settings.performance.enableCaching}
                    onCheckedChange={(checked) => updateSettings('performance', 'enableCaching', checked)}
                  />
                  <Label htmlFor="enableCaching">캐싱 활성화</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableImageOptimization"
                    checked={settings.performance.enableImageOptimization}
                    onCheckedChange={(checked) => updateSettings('performance', 'enableImageOptimization', checked)}
                  />
                  <Label htmlFor="enableImageOptimization">이미지 최적화</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableLazyLoading"
                    checked={settings.performance.enableLazyLoading}
                    onCheckedChange={(checked) => updateSettings('performance', 'enableLazyLoading', checked)}
                  />
                  <Label htmlFor="enableLazyLoading">지연 로딩</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableCompression"
                    checked={settings.performance.enableCompression}
                    onCheckedChange={(checked) => updateSettings('performance', 'enableCompression', checked)}
                  />
                  <Label htmlFor="enableCompression">압축 활성화</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableCdn"
                    checked={settings.performance.enableCdn}
                    onCheckedChange={(checked) => updateSettings('performance', 'enableCdn', checked)}
                  />
                  <Label htmlFor="enableCdn">CDN 활성화</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                백업 설정
              </CardTitle>
              <CardDescription>
                데이터 백업과 복구 설정을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">백업 빈도</Label>
                  <Select 
                    value={settings.backup.backupFrequency}
                    onValueChange={(value) => updateSettings('backup', 'backupFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">매일</SelectItem>
                      <SelectItem value="weekly">매주</SelectItem>
                      <SelectItem value="monthly">매월</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupRetention">백업 보존 기간 (일)</Label>
                  <Input
                    id="backupRetention"
                    type="number"
                    value={settings.backup.backupRetention}
                    onChange={(e) => updateSettings('backup', 'backupRetention', parseInt(e.target.value))}
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupLocation">백업 저장 위치</Label>
                <Input
                  id="backupLocation"
                  value={settings.backup.backupLocation}
                  onChange={(e) => updateSettings('backup', 'backupLocation', e.target.value)}
                  placeholder="/backup"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableAutoBackup"
                    checked={settings.backup.enableAutoBackup}
                    onCheckedChange={(checked) => updateSettings('backup', 'enableAutoBackup', checked)}
                  />
                  <Label htmlFor="enableAutoBackup">자동 백업 활성화</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableDatabaseBackup"
                    checked={settings.backup.enableDatabaseBackup}
                    onCheckedChange={(checked) => updateSettings('backup', 'enableDatabaseBackup', checked)}
                  />
                  <Label htmlFor="enableDatabaseBackup">데이터베이스 백업</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableFileBackup"
                    checked={settings.backup.enableFileBackup}
                    onCheckedChange={(checked) => updateSettings('backup', 'enableFileBackup', checked)}
                  />
                  <Label htmlFor="enableFileBackup">파일 백업</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="backupNotifications"
                    checked={settings.backup.backupNotifications}
                    onCheckedChange={(checked) => updateSettings('backup', 'backupNotifications', checked)}
                  />
                  <Label htmlFor="backupNotifications">백업 알림</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  수동 백업
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  백업 복원
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
