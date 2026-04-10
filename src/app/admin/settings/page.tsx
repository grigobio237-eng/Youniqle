'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface AdminSettings {
  general: {
    // 사이트 기본 정보
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    adminEmail: string;
    timezone: string;
    language: string;

    // 회사 정보
    companyInfo: {
      companyName: string;
      businessNumber: string;
      ceoName: string;
      establishmentDate: string;
      businessType: string;
      businessStatus: string;
    };

    // 사업자등록증 정보
    businessRegistration: {
      registrationNumber: string;
      registrationDate: string;
      businessAddress: string;
      businessAddressDetail: string;
      businessPostalCode: string;
      businessPhone: string;
      businessFax: string;
      businessEmail: string;
    };

    // 통신판매업 신고 정보
    ecommerceRegistration: {
      reportNumber: string;
      reportDate: string;
      reportAuthority: string;
      reportStatus: string;
    };

    // 연락처 정보
    contactInfo: {
      customerServicePhone: string;
      customerServiceEmail: string;
      businessInquiryPhone: string;
      businessInquiryEmail: string;
      address: string;
      addressDetail: string;
      postalCode: string;
      fax: string;
    };

    // 법적 고지사항
    legalInfo: {
      privacyPolicyUrl: string;
      termsOfServiceUrl: string;
      refundPolicyUrl: string;
      shippingPolicyUrl: string;
      returnPolicyUrl: string;
    };
  };
  security: {
    enableTwoFactor: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireStrongPassword: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    adminAlerts: boolean;
  };
  performance: {
    enableCaching: boolean;
    cacheTimeout: number;
    enableCompression: boolean;
    maxFileSize: number;
  };
  maintenance: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    allowAdminAccess: boolean;
  };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>({
    general: {
      // 사이트 기본 정보
      siteName: 'Youniqle',
      siteDescription: 'AI 기반 개인화 이커머스 플랫폼',
      siteUrl: 'https://youniqle.com',
      adminEmail: 'admin@youniqle.com',
      timezone: 'Asia/Seoul',
      language: 'ko',

      // 회사 정보
      companyInfo: {
        companyName: '주식회사 사피에넷',
        businessNumber: '000-00-00000',
        ceoName: '',
        establishmentDate: '',
        businessType: '통신판매업',
        businessStatus: '영업중'
      },

      // 사업자등록증 정보
      businessRegistration: {
        registrationNumber: '000-00-00000',
        registrationDate: '',
        businessAddress: '',
        businessAddressDetail: '',
        businessPostalCode: '',
        businessPhone: '',
        businessFax: '',
        businessEmail: 'admin@youniqle.com'
      },

      // 통신판매업 신고 정보
      ecommerceRegistration: {
        reportNumber: '제2024-서울강남-0000호',
        reportDate: '',
        reportAuthority: '서울특별시 강남구청',
        reportStatus: '신고완료'
      },

      // 연락처 정보
      contactInfo: {
        customerServicePhone: '1588-0000',
        customerServiceEmail: 'cs@youniqle.com',
        businessInquiryPhone: '02-0000-0000',
        businessInquiryEmail: 'business@youniqle.com',
        address: '서울특별시 강남구 테헤란로 123',
        addressDetail: '그리고바이오 빌딩 10층',
        postalCode: '06292',
        fax: '02-0000-0001'
      },

      // 법적 고지사항
      legalInfo: {
        privacyPolicyUrl: '/privacy',
        termsOfServiceUrl: '/terms',
        refundPolicyUrl: '/refund',
        shippingPolicyUrl: '/shipping',
        returnPolicyUrl: '/return'
      }
    },
    security: {
      enableTwoFactor: false,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireStrongPassword: true
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      adminAlerts: true
    },
    performance: {
      enableCaching: true,
      cacheTimeout: 3600,
      enableCompression: true,
      maxFileSize: 10
    },
    maintenance: {
      maintenanceMode: false,
      maintenanceMessage: '시스템 점검 중입니다. 잠시 후 다시 방문해주세요.',
      allowAdminAccess: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
        // API에서 설정을 가져오지 못한 경우 기본값 유지
      }
    } catch (error) {
      console.error('설정 로드 실패:', error);
      // 에러 발생 시 기본값 유지
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '설정이 성공적으로 저장되었습니다.' });
      } else {
        setMessage({ type: 'error', text: '설정 저장에 실패했습니다.' });
      }
    } catch (error) {
      console.error('설정 저장 실패:', error);
      setMessage({ type: 'error', text: '설정 저장 중 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: keyof AdminSettings, key: string, value: any, subKey?: string) => {
    setSettings(prev => {
      // 안전한 접근을 위해 기본값 보장
      const currentSection = prev[section] || {};

      if (subKey) {
        return {
          ...prev,
          [section]: {
            ...currentSection,
            [key]: {
              ...(currentSection as any)[key] || {},
              [subKey]: value
            }
          }
        };
      } else {
        return {
          ...prev,
          [section]: {
            ...currentSection,
            [key]: value
          }
        };
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">관리자 설정</h1>
          <p className="text-muted-foreground">시스템 설정을 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchSettings}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
          <Button
            onClick={saveSettings}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            저장
          </Button>
        </div>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">일반</TabsTrigger>
          <TabsTrigger value="security">보안</TabsTrigger>
          <TabsTrigger value="notifications">알림</TabsTrigger>
          <TabsTrigger value="performance">성능</TabsTrigger>
          <TabsTrigger value="maintenance">유지보수</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* 사이트 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>사이트 기본 정보</CardTitle>
              <CardDescription>사이트의 기본 정보를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">사이트 이름</Label>
                  <Input
                    id="siteName"
                    value={settings.general?.siteName || ''}
                    onChange={(e) => updateSettings('general', 'siteName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">사이트 URL</Label>
                  <Input
                    id="siteUrl"
                    value={settings.general?.siteUrl || ''}
                    onChange={(e) => updateSettings('general', 'siteUrl', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">사이트 설명</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general?.siteDescription || ''}
                  onChange={(e) => updateSettings('general', 'siteDescription', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">관리자 이메일</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.general?.adminEmail || ''}
                    onChange={(e) => updateSettings('general', 'adminEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">시간대</Label>
                  <Select
                    value={settings.general?.timezone || ''}
                    onValueChange={(value) => updateSettings('general', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Seoul">Asia/Seoul</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 회사 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>회사 정보</CardTitle>
              <CardDescription>회사의 기본 정보를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">회사명</Label>
                  <Input
                    id="companyName"
                    value={settings.general?.companyInfo?.companyName || ''}
                    onChange={(e) => updateSettings('general', 'companyInfo', e.target.value, 'companyName')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessNumber">사업자등록번호</Label>
                  <Input
                    id="businessNumber"
                    value={settings.general?.companyInfo?.businessNumber || ''}
                    onChange={(e) => updateSettings('general', 'companyInfo', e.target.value, 'businessNumber')}
                    placeholder="000-00-00000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ceoName">대표자명</Label>
                  <Input
                    id="ceoName"
                    value={settings.general?.companyInfo?.ceoName}
                    onChange={(e) => updateSettings('general', 'companyInfo', e.target.value, 'ceoName')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="establishmentDate">설립일</Label>
                  <Input
                    id="establishmentDate"
                    type="date"
                    value={settings.general?.companyInfo?.establishmentDate}
                    onChange={(e) => updateSettings('general', 'companyInfo', e.target.value, 'establishmentDate')}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessType">업종</Label>
                  <Input
                    id="businessType"
                    value={settings.general?.companyInfo?.businessType}
                    onChange={(e) => updateSettings('general', 'companyInfo', e.target.value, 'businessType')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessStatus">사업상태</Label>
                  <Select
                    value={settings.general?.companyInfo?.businessStatus}
                    onValueChange={(value) => updateSettings('general', 'companyInfo', value, 'businessStatus')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="영업중">영업중</SelectItem>
                      <SelectItem value="휴업">휴업</SelectItem>
                      <SelectItem value="폐업">폐업</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 사업자등록증 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>사업자등록증 정보</CardTitle>
              <CardDescription>사업자등록증에 기재된 정보를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">사업자등록번호</Label>
                  <Input
                    id="registrationNumber"
                    value={settings.general?.businessRegistration?.registrationNumber}
                    onChange={(e) => updateSettings('general', 'businessRegistration', e.target.value, 'registrationNumber')}
                    placeholder="000-00-00000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationDate">등록일</Label>
                  <Input
                    id="registrationDate"
                    type="date"
                    value={settings.general?.businessRegistration?.registrationDate}
                    onChange={(e) => updateSettings('general', 'businessRegistration', e.target.value, 'registrationDate')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessAddress">사업장 주소</Label>
                <Input
                  id="businessAddress"
                  value={settings.general?.businessRegistration?.businessAddress}
                  onChange={(e) => updateSettings('general', 'businessRegistration', e.target.value, 'businessAddress')}
                  placeholder="서울특별시 강남구 테헤란로 123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessAddressDetail">상세주소</Label>
                <Input
                  id="businessAddressDetail"
                  value={settings.general?.businessRegistration?.businessAddressDetail}
                  onChange={(e) => updateSettings('general', 'businessRegistration', e.target.value, 'businessAddressDetail')}
                  placeholder="그리고바이오 빌딩 10층"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessPostalCode">우편번호</Label>
                  <Input
                    id="businessPostalCode"
                    value={settings.general?.businessRegistration?.businessPostalCode}
                    onChange={(e) => updateSettings('general', 'businessRegistration', e.target.value, 'businessPostalCode')}
                    placeholder="06292"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">사업장 전화번호</Label>
                  <Input
                    id="businessPhone"
                    value={settings.general?.businessRegistration?.businessPhone}
                    onChange={(e) => updateSettings('general', 'businessRegistration', e.target.value, 'businessPhone')}
                    placeholder="02-0000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessFax">팩스번호</Label>
                  <Input
                    id="businessFax"
                    value={settings.general?.businessRegistration?.businessFax}
                    onChange={(e) => updateSettings('general', 'businessRegistration', e.target.value, 'businessFax')}
                    placeholder="02-0000-0001"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessEmail">사업장 이메일</Label>
                <Input
                  id="businessEmail"
                  type="email"
                  value={settings.general?.businessRegistration?.businessEmail}
                  onChange={(e) => updateSettings('general', 'businessRegistration', e.target.value, 'businessEmail')}
                  placeholder="admin@youniqle.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* 통신판매업 신고 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>통신판매업 신고 정보</CardTitle>
              <CardDescription>통신판매업 신고 관련 정보를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportNumber">신고번호</Label>
                  <Input
                    id="reportNumber"
                    value={settings.general?.ecommerceRegistration?.reportNumber}
                    onChange={(e) => updateSettings('general', 'ecommerceRegistration', e.target.value, 'reportNumber')}
                    placeholder="제2024-서울강남-0000호"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportDate">신고일</Label>
                  <Input
                    id="reportDate"
                    type="date"
                    value={settings.general?.ecommerceRegistration?.reportDate}
                    onChange={(e) => updateSettings('general', 'ecommerceRegistration', e.target.value, 'reportDate')}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportAuthority">신고기관</Label>
                  <Input
                    id="reportAuthority"
                    value={settings.general?.ecommerceRegistration?.reportAuthority}
                    onChange={(e) => updateSettings('general', 'ecommerceRegistration', e.target.value, 'reportAuthority')}
                    placeholder="서울특별시 강남구청"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportStatus">신고상태</Label>
                  <Select
                    value={settings.general?.ecommerceRegistration?.reportStatus}
                    onValueChange={(value) => updateSettings('general', 'ecommerceRegistration', value, 'reportStatus')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="신고완료">신고완료</SelectItem>
                      <SelectItem value="신고중">신고중</SelectItem>
                      <SelectItem value="미신고">미신고</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 연락처 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>연락처 정보</CardTitle>
              <CardDescription>고객 서비스 및 업무 문의 연락처를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerServicePhone">고객센터 전화번호</Label>
                  <Input
                    id="customerServicePhone"
                    value={settings.general?.contactInfo?.customerServicePhone}
                    onChange={(e) => updateSettings('general', 'contactInfo', e.target.value, 'customerServicePhone')}
                    placeholder="1588-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerServiceEmail">고객센터 이메일</Label>
                  <Input
                    id="customerServiceEmail"
                    type="email"
                    value={settings.general?.contactInfo?.customerServiceEmail}
                    onChange={(e) => updateSettings('general', 'contactInfo', e.target.value, 'customerServiceEmail')}
                    placeholder="cs@youniqle.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessInquiryPhone">업무 문의 전화번호</Label>
                  <Input
                    id="businessInquiryPhone"
                    value={settings.general?.contactInfo?.businessInquiryPhone}
                    onChange={(e) => updateSettings('general', 'contactInfo', e.target.value, 'businessInquiryPhone')}
                    placeholder="02-0000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessInquiryEmail">업무 문의 이메일</Label>
                  <Input
                    id="businessInquiryEmail"
                    type="email"
                    value={settings.general?.contactInfo?.businessInquiryEmail}
                    onChange={(e) => updateSettings('general', 'contactInfo', e.target.value, 'businessInquiryEmail')}
                    placeholder="business@youniqle.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">회사 주소</Label>
                <Input
                  id="address"
                  value={settings.general?.contactInfo?.address}
                  onChange={(e) => updateSettings('general', 'contactInfo', e.target.value, 'address')}
                  placeholder="서울특별시 강남구 테헤란로 123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressDetail">상세주소</Label>
                <Input
                  id="addressDetail"
                  value={settings.general?.contactInfo?.addressDetail}
                  onChange={(e) => updateSettings('general', 'contactInfo', e.target.value, 'addressDetail')}
                  placeholder="그리고바이오 빌딩 10층"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">우편번호</Label>
                  <Input
                    id="postalCode"
                    value={settings.general?.contactInfo?.postalCode}
                    onChange={(e) => updateSettings('general', 'contactInfo', e.target.value, 'postalCode')}
                    placeholder="06292"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fax">팩스번호</Label>
                  <Input
                    id="fax"
                    value={settings.general?.contactInfo?.fax}
                    onChange={(e) => updateSettings('general', 'contactInfo', e.target.value, 'fax')}
                    placeholder="02-0000-0001"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 법적 고지사항 */}
          <Card>
            <CardHeader>
              <CardTitle>법적 고지사항</CardTitle>
              <CardDescription>법적 고지사항 페이지 URL을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="privacyPolicyUrl">개인정보처리방침 URL</Label>
                  <Input
                    id="privacyPolicyUrl"
                    value={settings.general?.legalInfo?.privacyPolicyUrl}
                    onChange={(e) => updateSettings('general', 'legalInfo', e.target.value, 'privacyPolicyUrl')}
                    placeholder="/privacy"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termsOfServiceUrl">이용약관 URL</Label>
                  <Input
                    id="termsOfServiceUrl"
                    value={settings.general?.legalInfo?.termsOfServiceUrl}
                    onChange={(e) => updateSettings('general', 'legalInfo', e.target.value, 'termsOfServiceUrl')}
                    placeholder="/terms"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="refundPolicyUrl">환불정책 URL</Label>
                  <Input
                    id="refundPolicyUrl"
                    value={settings.general?.legalInfo?.refundPolicyUrl}
                    onChange={(e) => updateSettings('general', 'legalInfo', e.target.value, 'refundPolicyUrl')}
                    placeholder="/refund"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingPolicyUrl">배송정책 URL</Label>
                  <Input
                    id="shippingPolicyUrl"
                    value={settings.general?.legalInfo?.shippingPolicyUrl}
                    onChange={(e) => updateSettings('general', 'legalInfo', e.target.value, 'shippingPolicyUrl')}
                    placeholder="/shipping"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="returnPolicyUrl">교환/반품정책 URL</Label>
                <Input
                  id="returnPolicyUrl"
                  value={settings.general?.legalInfo?.returnPolicyUrl}
                  onChange={(e) => updateSettings('general', 'legalInfo', e.target.value, 'returnPolicyUrl')}
                  placeholder="/return"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>보안 설정</CardTitle>
              <CardDescription>시스템 보안 관련 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>2단계 인증</Label>
                  <p className="text-sm text-muted-foreground">관리자 로그인 시 2단계 인증을 요구합니다.</p>
                </div>
                <Switch
                  checked={settings.security?.enableTwoFactor || false}
                  onCheckedChange={(checked) => updateSettings('security', 'enableTwoFactor', checked)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">세션 타임아웃 (시간)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security?.sessionTimeout || 24}
                    onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">최대 로그인 시도 횟수</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security?.maxLoginAttempts || 5}
                    onChange={(e) => updateSettings('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">최소 비밀번호 길이</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security?.passwordMinLength || 8}
                    onChange={(e) => updateSettings('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>강력한 비밀번호 요구</Label>
                    <p className="text-sm text-muted-foreground">특수문자, 숫자, 대소문자 포함</p>
                  </div>
                  <Switch
                    checked={settings.security?.requireStrongPassword || false}
                    onCheckedChange={(checked) => updateSettings('security', 'requireStrongPassword', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>알림 설정</CardTitle>
              <CardDescription>시스템 알림 관련 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>이메일 알림</Label>
                  <p className="text-sm text-muted-foreground">이메일을 통한 알림을 활성화합니다.</p>
                </div>
                <Switch
                  checked={settings.notifications?.emailNotifications || false}
                  onCheckedChange={(checked) => updateSettings('notifications', 'emailNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS 알림</Label>
                  <p className="text-sm text-muted-foreground">SMS를 통한 알림을 활성화합니다.</p>
                </div>
                <Switch
                  checked={settings.notifications?.smsNotifications || false}
                  onCheckedChange={(checked) => updateSettings('notifications', 'smsNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>푸시 알림</Label>
                  <p className="text-sm text-muted-foreground">브라우저 푸시 알림을 활성화합니다.</p>
                </div>
                <Switch
                  checked={settings.notifications?.pushNotifications || false}
                  onCheckedChange={(checked) => updateSettings('notifications', 'pushNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>관리자 알림</Label>
                  <p className="text-sm text-muted-foreground">관리자에게 중요한 알림을 전송합니다.</p>
                </div>
                <Switch
                  checked={settings.notifications?.adminAlerts || false}
                  onCheckedChange={(checked) => updateSettings('notifications', 'adminAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>성능 설정</CardTitle>
              <CardDescription>시스템 성능 관련 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>캐싱 활성화</Label>
                  <p className="text-sm text-muted-foreground">시스템 캐싱을 활성화합니다.</p>
                </div>
                <Switch
                  checked={settings.performance?.enableCaching || false}
                  onCheckedChange={(checked) => updateSettings('performance', 'enableCaching', checked)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cacheTimeout">캐시 타임아웃 (초)</Label>
                  <Input
                    id="cacheTimeout"
                    type="number"
                    value={settings.performance?.cacheTimeout || 3600}
                    onChange={(e) => updateSettings('performance', 'cacheTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">최대 파일 크기 (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.performance?.maxFileSize || 10}
                    onChange={(e) => updateSettings('performance', 'maxFileSize', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>압축 활성화</Label>
                  <p className="text-sm text-muted-foreground">응답 압축을 활성화합니다.</p>
                </div>
                <Switch
                  checked={settings.performance?.enableCompression || false}
                  onCheckedChange={(checked) => updateSettings('performance', 'enableCompression', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>유지보수 설정</CardTitle>
              <CardDescription>시스템 유지보수 관련 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>유지보수 모드</Label>
                  <p className="text-sm text-muted-foreground">사이트를 유지보수 모드로 전환합니다.</p>
                </div>
                <Switch
                  checked={settings.maintenance?.maintenanceMode || false}
                  onCheckedChange={(checked) => updateSettings('maintenance', 'maintenanceMode', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenanceMessage">유지보수 메시지</Label>
                <Textarea
                  id="maintenanceMessage"
                  value={settings.maintenance?.maintenanceMessage || ''}
                  onChange={(e) => updateSettings('maintenance', 'maintenanceMessage', e.target.value)}
                  placeholder="유지보수 중일 때 사용자에게 표시할 메시지를 입력하세요."
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>관리자 접근 허용</Label>
                  <p className="text-sm text-muted-foreground">유지보수 모드에서도 관리자 접근을 허용합니다.</p>
                </div>
                <Switch
                  checked={settings.maintenance?.allowAdminAccess || false}
                  onCheckedChange={(checked) => updateSettings('maintenance', 'allowAdminAccess', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
