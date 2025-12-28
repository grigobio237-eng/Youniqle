'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import GoogleAddressSearch from '@/components/ui/GoogleAddressSearch';
import MembershipInfo from '@/components/ui/MembershipInfo';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Settings,
  Save,
  Store,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  X,
  Upload,
  FileImage,
  ChevronRight,
  ClipboardList,
  ShieldCheck,
  CreditCard,
  Ticket,
  Bell,
  LogOut,
  UserX,
  ShoppingBag,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import ReferralSection from '@/components/ui/ReferralSection';
import Image from 'next/image';

export default function MyPage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    marketingConsent: false,
    zipCode: '',
    address1: '',
    address2: '',
  });
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPartnerApplication, setShowPartnerApplication] = useState(false);
  const [partnerApplicationData, setPartnerApplicationData] = useState({
    businessName: '',
    businessNumber: '',
    businessZipCode: '',
    businessAddress: '',
    businessDetailAddress: '',
    businessPhone: '',
    businessDescription: '',
    bankAccount: '',
    bankName: '',
    accountHolder: '',
    businessRegistrationImage: '',
    bankStatementImage: ''
  });
  const [partnerApplicationLoading, setPartnerApplicationLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: '',
        marketingConsent: false,
        zipCode: '',
        address1: '',
        address2: '',
      });
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    if (!session?.user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        const u = data.user || data;
        setUserData(u);

        if (u.addresses && u.addresses.length > 0) {
          const defaultAddress = u.addresses[0];
          setFormData(prev => ({
            ...prev,
            phone: u.phone || '',
            marketingConsent: u.marketingConsent || false,
            zipCode: defaultAddress.zip || '',
            address1: defaultAddress.addr1 || '',
            address2: defaultAddress.addr2 || '',
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            phone: u.phone || '',
            marketingConsent: u.marketingConsent || false,
          }));
        }
      }
    } catch (error) {
      console.error('사용자 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddressSelect = (data: any) => {
    setFormData(prev => ({
      ...prev,
      zipCode: data.zonecode,
      address1: data.address,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData: any = {
        phone: formData.phone,
        marketingConsent: formData.marketingConsent,
      };

      if (formData.zipCode && formData.address1) {
        updateData.zipCode = formData.zipCode;
        updateData.address1 = formData.address1;
        updateData.address2 = formData.address2;
      }

      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user || data);
        setIsEditing(false);
        alert('프로필이 업데이트되었습니다.');
      } else {
        const errorData = await response.json();
        alert(`저장 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerApplicationChange = (field: string, value: string) => {
    setPartnerApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'businessRegistrationImage' | 'bankStatementImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'partner-documents');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });

      if (response.ok) {
        const result = await response.json();
        handlePartnerApplicationChange(field, result.url);
      } else {
        const errorData = await response.json();
        alert(`업로드 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('업로드 오류:', error);
    }
  };

  const handlePartnerApplicationSubmit = async () => {
    setPartnerApplicationLoading(true);
    try {
      let fullBusinessAddress = partnerApplicationData.businessAddress;
      if (partnerApplicationData.businessZipCode) {
        fullBusinessAddress = `[${partnerApplicationData.businessZipCode}] ${fullBusinessAddress}`;
      }
      if (partnerApplicationData.businessDetailAddress) {
        fullBusinessAddress = `${fullBusinessAddress} ${partnerApplicationData.businessDetailAddress}`;
      }

      const response = await fetch('/api/partner/auth/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email,
          name: session?.user?.name,
          phone: formData.phone,
          ...partnerApplicationData,
          businessAddress: fullBusinessAddress
        }),
      });

      if (response.ok) {
        alert('파트너 신청이 접수되었습니다. 검토 후 연락드리겠습니다.');
        setShowPartnerApplication(false);
        fetchUserData();
      } else {
        const errorData = await response.json();
        alert(`신청 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('신청 오류:', error);
    } finally {
      setPartnerApplicationLoading(false);
    }
  };

  const getPartnerStatusInfo = () => {
    if (!userData?.partnerStatus || userData.partnerStatus === 'none') {
      return {
        status: 'none',
        title: '파트너 프로토콜 시작',
        description: '회복의 전문가로서 본인만의 상점을 운영하십시오.',
        icon: Store,
        color: 'text-chapter-accent',
        bgColor: 'bg-chapter-accent/5',
        action: () => setShowPartnerApplication(true)
      };
    }

    switch (userData.partnerStatus) {
      case 'pending':
        return {
          status: 'pending',
          title: '검토 진행 중',
          description: '보안 심사가 진행 중입니다. 3-5영업일이 소요됩니다.',
          icon: Clock,
          color: 'text-status-amber',
          bgColor: 'bg-status-amber/5',
          action: null
        };
      case 'approved':
        return {
          status: 'approved',
          title: '파트너 인증 완료',
          description: '인증된 파트너입니다. 관리 대시보드에 접근 가능합니다.',
          icon: CheckCircle,
          color: 'text-status-good',
          bgColor: 'bg-status-good/5',
          action: () => window.open('/partner/login', '_blank')
        };
      case 'rejected':
        return {
          status: 'rejected',
          title: '인증 승인 거절',
          description: userData.partnerApplication?.rejectedReason || '보안 정책에 부합하지 않습니다.',
          icon: XCircle,
          color: 'text-status-danger',
          bgColor: 'bg-status-danger/5',
          action: () => setShowPartnerApplication(true)
        };
      default:
        return null;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-mist flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chapter-accent"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-mist flex items-center justify-center">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[40px] bg-white text-center p-12">
          <div className="w-20 h-20 bg-mist rounded-[24px] flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner">🔒</div>
          <h2 className="text-2xl font-black text-obsidian tracking-tight mb-2">접근 권한 제한</h2>
          <p className="text-slate font-medium mb-8">대시보드 접근을 위해 인증 프로토콜이 필요합니다.</p>
          <Button asChild className="w-full h-14 rounded-2xl bg-obsidian text-mist font-black">
            <Link href="/auth/signin">인증 시작</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const partnerInfo = getPartnerStatusInfo();

  return (
    <div className="min-h-screen bg-mist py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center mb-16">
          <p className="text-slate font-black uppercase tracking-[0.2em] text-[10px] mb-2 p-1 px-3 bg-chapter-accent/5 text-chapter-accent rounded-full border border-chapter-accent/10">Personal Control Center</p>
          <h1 className="text-5xl font-black text-obsidian tracking-tighter">나의 프로필</h1>
          <p className="text-slate font-bold tracking-tight mt-1">{session.user?.name} 요원의 개인 설정 및 활동 현황입니다.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            {/* 프로필 정보 */}
            <Card className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden">
              <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between border-b border-mist">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-mist rounded-2xl text-obsidian">
                    <User className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl font-black text-obsidian tracking-tighter">프로필 설정</CardTitle>
                </div>
                <Button variant="ghost" onClick={() => setIsEditing(!isEditing)} className="font-black text-xs text-slate hover:bg-mist h-10 px-4 rounded-xl">
                  {isEditing ? <><X className="h-4 w-4 mr-2" /> 취소</> : <><Settings className="h-4 w-4 mr-2" /> 편집</>}
                </Button>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="bg-mist/30 p-8 rounded-[32px] border border-line/30 flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-[32px] overflow-hidden bg-white shadow-md border-4 border-white">
                    <Image src={session.user?.image || '/placeholder-user.jpg'} alt="" fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-obsidian">{session.user?.name}</h3>
                    <p className="text-sm font-bold text-slate flex items-center gap-2 opacity-60">
                      <Mail className="h-3 w-3" /> {session.user?.email}
                    </p>
                    <Badge className="mt-2 bg-chapter-accent/10 text-chapter-accent border-none font-black text-[9px] uppercase tracking-widest px-3">
                      {(session.user as any)?.provider || 'Email Member'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-xs font-black text-slate uppercase tracking-widest ml-1">연락처</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate h-4 w-4 opacity-40" />
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="010-XXXX-XXXX"
                        className="h-14 pl-12 rounded-2xl bg-mist/50 border-line focus:ring-chapter-accent"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black text-slate uppercase tracking-widest ml-1">마케팅 활용 동의</Label>
                    <div className={`h-14 flex items-center px-5 rounded-2xl border transition-all ${formData.marketingConsent ? 'border-chapter-accent bg-chapter-accent/5' : 'border-line bg-mist/50'}`}>
                      <Checkbox
                        id="marketing"
                        checked={formData.marketingConsent}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, marketingConsent: c as boolean }))}
                        disabled={!isEditing}
                        className="rounded-md"
                      />
                      <label htmlFor="marketing" className="ml-3 text-sm font-bold text-slate cursor-pointer select-none">이벤트 등 마케팅 수신동의 (선택)</label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-xs font-black text-slate uppercase tracking-widest ml-1">배송지 정보</Label>
                  <div className="space-y-3">
                    <GoogleAddressSearch onAddressSelect={handleAddressSelect} disabled={!isEditing} />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <Input value={formData.zipCode} readOnly placeholder="우편번호" className="h-14 rounded-2xl bg-mist/50 border-line" />
                      <Input value={formData.address1} readOnly placeholder="주소" className="h-14 md:col-span-3 rounded-2xl bg-mist/50 border-line" />
                    </div>
                    <Input name="address2" value={formData.address2} onChange={handleInputChange} disabled={!isEditing} placeholder="상세 주소를 입력하세요" className="h-14 rounded-2xl bg-mist/50 border-line" />
                  </div>
                </div>

                {isEditing && (
                  <Button onClick={handleSave} className="w-full h-16 rounded-[24px] bg-obsidian text-mist font-black text-lg shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
                    <Save className="h-5 w-5" /> 프로필 저장하기
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* 친구 초대 섹션 */}
            <ReferralSection referralCode={userData?.referralCode} />
          </div>

          <div className="lg:col-span-4 space-y-8">
            {/* 멤버십 위젯 */}
            <Card className="border-none shadow-2xl rounded-[40px] bg-obsidian text-mist overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-reward-gold/10 blur-[60px] rounded-full -translate-y-12 translate-x-12" />
              <CardHeader className="p-8 pb-4 relative z-10">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-reward-gold">Authority Level</p>
                  <Link href="/membership" className="text-[9px] font-black text-mist/40 hover:text-reward-gold transition-colors">BENEFITS GUIDE</Link>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-2 text-center relative z-10">
                <MembershipInfo currentGrade={userData?.grade || 'cedar'} currentPoints={userData?.points || 0} />
                <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-end">
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Total Points</p>
                    <p className="text-3xl font-black text-reward-gold tracking-tighter">{userData?.points?.toLocaleString() || 0}<span className="text-sm ml-1 opacity-60">P</span></p>
                  </div>
                  <Button asChild variant="ghost" className="h-10 px-4 rounded-xl text-xs font-black text-mist hover:bg-white/5 flex gap-2">
                    <Link href="/me/points">내역 관측</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 파트너 상태 */}
            {partnerInfo && (
              <Card className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden p-8 border border-mist transition-all hover:shadow-md">
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-start">
                    <div className={`p-4 rounded-2xl ${partnerInfo.bgColor} ${partnerInfo.color}`}>
                      <partnerInfo.icon className="h-6 w-6" />
                    </div>
                    {partnerInfo.status === 'approved' && (
                      <Badge className="bg-status-good text-mist font-black text-[9px] uppercase tracking-widest px-3 border-none shadow-sm shadow-status-good/20">ACTIVE</Badge>
                    )}
                  </div>
                  <div>
                    <h3 className={`text-xl font-black ${partnerInfo.color} tracking-tight`}>{partnerInfo.title}</h3>
                    <p className="text-xs font-medium text-slate mt-1 leading-relaxed">{partnerInfo.description}</p>
                  </div>
                  {partnerInfo.action && (
                    <Button onClick={partnerInfo.action} className={`w-full h-12 rounded-xl font-black text-xs shadow-lg transition-all ${partnerInfo.status === 'approved' ? 'bg-status-good text-mist' : 'bg-obsidian text-mist'}`}>
                      {partnerInfo.status === 'approved' ? '파트너 대시보드' : partnerInfo.status === 'rejected' ? '다시 신청하기' : '시작 프로토콜'}
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* 바로가기 그리드 */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { href: '/orders', label: '주문 내역', icon: ClipboardList },
                { href: '/me/coupons', label: '내 쿠폰함', icon: Ticket },
                { href: '/cart', label: '장바구니', icon: ShoppingBag },
                { href: '/wishlist', label: '관심 목록', icon: Heart },
                { href: '/me/addresses', label: '주소 관리', icon: MapPin },
                { href: '/me/payment-methods', label: '결제 수단', icon: CreditCard },
              ].map((link, i) => (
                <Link key={i} href={link.href} className="group relative bg-white p-6 rounded-[28px] border border-mist shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3 text-center active:scale-95">
                  <div className="p-3 bg-mist rounded-2xl text-slate group-hover:bg-chapter-accent group-hover:text-mist transition-colors">
                    <link.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-black text-obsidian tracking-tight">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* 위기 관리 (하단 메뉴) */}
            <Card className="border-none bg-mist/50 rounded-[32px] p-8 space-y-4">
              <Button asChild variant="ghost" className="w-full justify-between h-12 px-2 text-slate hover:bg-white rounded-xl transition-all">
                <Link href="/me/notifications" className="flex items-center gap-3">
                  <Bell className="h-4 w-4" />
                  <span className="text-xs font-black">알림 프로토콜 설정</span>
                  <ChevronRight className="h-3 w-3 ml-auto opacity-30" />
                </Link>
              </Button>
              <div className="h-px bg-line/20 w-full" />
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1 justify-center h-10 text-slate hover:text-obsidian text-[10px] font-bold">
                  로그아웃
                </Button>
                <div className="w-px bg-line/20 h-4 self-center" />
                <Button asChild variant="ghost" className="flex-1 justify-center h-10 text-slate hover:text-status-danger text-[10px] font-bold">
                  <Link href="/me/delete-account">회원 탈퇴</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* 파트너 신청 모달 리뉴얼 (스타일만 업그레이드) */}
      {showPartnerApplication && (
        <div className="fixed inset-0 bg-obsidian/90 backdrop-blur-md flex items-center justify-center z-[100] p-6 overflow-y-auto">
          <Card className="max-w-3xl w-full border-none shadow-2xl rounded-[48px] bg-white overflow-hidden my-auto">
            <div className="p-10 md:p-16">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-black text-obsidian tracking-tighter">파트너 권한 신청</h2>
                  <p className="text-xs font-black text-slate uppercase tracking-widest mt-1">Specialist Authority Protocol</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowPartnerApplication(false)} className="rounded-full hover:bg-mist h-12 w-12"><X className="h-6 w-6" /></Button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handlePartnerApplicationSubmit(); }} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-slate uppercase tracking-widest ml-1">상호명 / 성함</Label>
                      <Input value={partnerApplicationData.businessName} onChange={(e) => handlePartnerApplicationChange('businessName', e.target.value)} required placeholder="정식 명칭을 입력하십시오" className="h-14 rounded-2xl bg-mist/50 border-line" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-slate uppercase tracking-widest ml-1">사업자 번호 (개인은 생년월일)</Label>
                      <Input value={partnerApplicationData.businessNumber} onChange={(e) => handlePartnerApplicationChange('businessNumber', e.target.value)} required placeholder="000-00-00000" className="h-14 rounded-2xl bg-mist/50 border-line" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-slate uppercase tracking-widest ml-1">사업장/비상 연락처</Label>
                      <Input value={partnerApplicationData.businessPhone} onChange={(e) => handlePartnerApplicationChange('businessPhone', e.target.value)} required placeholder="02-XXXX-XXXX" className="h-14 rounded-2xl bg-mist/50 border-line" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-slate uppercase tracking-widest ml-1">사업장 주소</Label>
                      <GoogleAddressSearch onAddressSelect={(a) => { handlePartnerApplicationChange('businessZipCode', a.zonecode); handlePartnerApplicationChange('businessAddress', a.address); }} />
                      <Input value={partnerApplicationData.businessAddress} placeholder="기본 주소" className="h-14 rounded-2xl bg-mist/50 border-line text-xs font-bold" readOnly />
                      <Input value={partnerApplicationData.businessDetailAddress} onChange={(e) => handlePartnerApplicationChange('businessDetailAddress', e.target.value)} placeholder="상세 주소" className="h-14 rounded-2xl bg-mist/50 border-line" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <Label className="text-[10px] font-black text-slate uppercase tracking-widest ml-1">정산 계좌 정보</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input value={partnerApplicationData.bankName} onChange={(e) => handlePartnerApplicationChange('bankName', e.target.value)} required placeholder="은행명" className="h-14 rounded-2xl bg-mist/50 border-line" />
                    <Input value={partnerApplicationData.accountHolder} onChange={(e) => handlePartnerApplicationChange('accountHolder', e.target.value)} required placeholder="예금주" className="h-14 rounded-2xl bg-mist/50 border-line" />
                    <Input value={partnerApplicationData.bankAccount} onChange={(e) => handlePartnerApplicationChange('bankAccount', e.target.value)} required placeholder="계좌번호" className="h-14 rounded-2xl bg-mist/50 border-line" />
                  </div>
                </div>

                <div className="space-y-6">
                  <Label className="text-[10px] font-black text-slate uppercase tracking-widest ml-1">증빙 서류 전송</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-8 rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all ${partnerApplicationData.businessRegistrationImage ? 'border-status-good bg-status-good/5' : 'border-line hover:border-chapter-accent hover:bg-mist/50'}`}>
                      <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center ${partnerApplicationData.businessRegistrationImage ? 'bg-status-good text-white' : 'bg-mist text-slate'}`}>
                        <FileImage className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black text-obsidian">사업자등록증</p>
                        <p className="text-[10px] font-bold text-slate mt-1">{partnerApplicationData.businessRegistrationImage ? '전송 완료' : '이미지 업로드'}</p>
                      </div>
                      <input type="file" onChange={(e) => handleDocumentUpload(e, 'businessRegistrationImage')} className="absolute inset-x-8 h-32 opacity-0 cursor-pointer" />
                    </div>
                    <div className={`p-8 rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all ${partnerApplicationData.bankStatementImage ? 'border-status-good bg-status-good/5' : 'border-line hover:border-chapter-accent hover:bg-mist/50'}`}>
                      <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center ${partnerApplicationData.bankStatementImage ? 'bg-status-good text-white' : 'bg-mist text-slate'}`}>
                        <FileImage className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black text-obsidian">통장 사본</p>
                        <p className="text-[10px] font-bold text-slate mt-1">{partnerApplicationData.bankStatementImage ? '전송 완료' : '이미지 업로드'}</p>
                      </div>
                      <input type="file" onChange={(e) => handleDocumentUpload(e, 'bankStatementImage')} className="absolute inset-x-8 h-32 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={partnerApplicationLoading} className="w-full h-20 rounded-[32px] bg-obsidian text-mist font-black text-xl shadow-2xl hover:scale-[1.02] transition-all">
                  {partnerApplicationLoading ? '신청 프로토콜 가동 중...' : '파트너 신청 프로토콜 제출'}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
