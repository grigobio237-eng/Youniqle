'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import CharacterImage from '@/components/ui/CharacterImage';
import PostcodeSearch from '@/components/ui/PostcodeSearch';
import AddressSearch from '@/components/ui/AddressSearch';
import MembershipInfo from '@/components/ui/MembershipInfo';
import { User, Mail, Phone, MapPin, Settings, Save, Store, CheckCircle, Clock, XCircle, AlertCircle, X, Upload, FileImage } from 'lucide-react';

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
        setUserData(data.user);
        
        // 사용자 데이터로 폼 초기화
        if (data.user.addresses && data.user.addresses.length > 0) {
          const defaultAddress = data.user.addresses[0];
          setFormData(prev => ({
            ...prev,
            phone: data.user.phone || '',
            marketingConsent: data.user.marketingConsent || false,
            zipCode: defaultAddress.zip || '',
            address1: defaultAddress.addr1 || '',
            address2: defaultAddress.addr2 || '',
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            phone: data.user.phone || '',
            marketingConsent: data.user.marketingConsent || false,
          }));
        }
      }
    } catch (error) {
      console.error('사용자 데이터 가져오기 실패:', error);
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

  const handleAddressSelect = (data: {
    zonecode: string;
    address: string;
    addressEnglish: string;
    addressType: string;
    bname: string;
    buildingName: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      zipCode: data.zonecode,
      address1: data.address,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // 주소 정보가 있을 때만 전송
      const updateData: any = {
        phone: formData.phone,
        marketingConsent: formData.marketingConsent,
      };

      // 주소 정보가 완전한 경우에만 추가
      if (formData.zipCode && formData.address1) {
        updateData.zipCode = formData.zipCode;
        updateData.address1 = formData.address1;
        updateData.address2 = formData.address2;
      }

      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setIsEditing(false);
        alert('프로필이 성공적으로 업데이트되었습니다.');
      } else {
        const errorData = await response.json();
        console.error('Save error details:', errorData);
        alert(`저장 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Save error:', error);
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

    // 파일 크기 검증 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('이미지 파일만 업로드 가능합니다. (JPEG, PNG, GIF, WebP)');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'partner-documents');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        handlePartnerApplicationChange(field, result.url);
      } else {
        const errorData = await response.json();
        alert(`파일 업로드 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('파일 업로드 오류:', error);
      alert('파일 업로드 중 오류가 발생했습니다.');
    }
  };

  const handlePartnerApplicationSubmit = async () => {
    setPartnerApplicationLoading(true);
    try {
      // 전체 주소를 결합 (기본 주소 + 상세주소)
      const fullBusinessAddress = partnerApplicationData.businessDetailAddress 
        ? `${partnerApplicationData.businessAddress} ${partnerApplicationData.businessDetailAddress}`
        : partnerApplicationData.businessAddress;

      const response = await fetch('/api/partner/auth/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session?.user?.email,
          name: session?.user?.name,
          phone: formData.phone,
          ...partnerApplicationData,
          businessAddress: fullBusinessAddress
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('파트너 신청이 완료되었습니다. 관리자 검토 후 결과를 안내드립니다.');
        setShowPartnerApplication(false);
        fetchUserData(); // 사용자 데이터 새로고침
      } else {
        const errorData = await response.json();
        alert(`신청 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Partner application error:', error);
      alert('신청 중 오류가 발생했습니다.');
    } finally {
      setPartnerApplicationLoading(false);
    }
  };

  const getPartnerStatusInfo = () => {
    if (!userData?.partnerStatus || userData.partnerStatus === 'none') {
      return {
        status: 'none',
        title: '파트너 신청하기',
        description: '나만의 온라인 상점을 열어보세요!',
        icon: Store,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        action: () => setShowPartnerApplication(true)
      };
    }

    switch (userData.partnerStatus) {
      case 'pending':
        return {
          status: 'pending',
          title: '승인 대기 중',
          description: '파트너 신청이 검토 중입니다. 3-5 영업일 내에 결과를 안내드립니다.',
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          action: null
        };
      case 'approved':
        return {
          status: 'approved',
          title: '파트너 승인됨',
          description: `파트너로 승인되었습니다! 파트너 대시보드에서 상점을 관리하세요.`,
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          action: () => window.open('/partner/login', '_blank')
        };
      case 'rejected':
        return {
          status: 'rejected',
          title: '신청이 거부되었습니다',
          description: userData.partnerApplication?.rejectedReason || '승인 기준에 맞지 않습니다.',
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          action: () => setShowPartnerApplication(true)
        };
      case 'suspended':
        return {
          status: 'suspended',
          title: '파트너 정지됨',
          description: '파트너 활동이 정지되었습니다. 문의사항이 있으시면 고객센터로 연락해주세요.',
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          action: null
        };
      default:
        return null;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
            <p className="text-gray-600 mb-6">
              마이페이지를 이용하려면 로그인해주세요.
            </p>
            <Button asChild>
              <a href="/auth/signin">로그인하기</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20">
              <CharacterImage
                src="/character/youniqle-1.png"
                alt="Youniqle 캐릭터"
                fill
                className="object-contain"
                sizes="80px"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">마이페이지</h1>
          <p className="text-xl text-gray-600">
            {session.user?.name}님, 안녕하세요!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 프로필 정보 */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  프로필 정보
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {isEditing ? '취소' : '편집'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 기본 정보 (소셜에서 가져온 정보) */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-gray-700">기본 정보</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {(session.user as any)?.provider ?
                      `${(session.user as any).provider}에서 가져온 정보입니다.` :
                      '이메일로 가입한 계정입니다.'
                    }
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-600">이메일: {session.user?.email}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-600">이름: {session.user?.name}</span>
                    </div>
                    {session.user?.image && (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">프로필 이미지: </span>
                        <img 
                          src={session.user.image} 
                          alt="프로필" 
                          className="w-8 h-8 rounded-full ml-2"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 추가 정보 (쇼핑 시 필요) */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700">쇼핑을 위한 추가 정보</h3>
                  
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                      휴대폰 번호
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="pl-10"
                        placeholder="010-1234-5678"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      기본 배송지
                    </Label>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            value={formData.zipCode}
                            disabled={!isEditing}
                            className="pl-10"
                            placeholder="우편번호"
                            readOnly
                          />
                        </div>
                        <PostcodeSearch
                          onAddressSelect={handleAddressSelect}
                          disabled={!isEditing}
                        />
                      </div>
                      <Input
                        value={formData.address1}
                        onChange={handleInputChange}
                        name="address1"
                        disabled={!isEditing}
                        placeholder="기본 주소"
                        readOnly
                      />
                      <Input
                        value={formData.address2}
                        onChange={handleInputChange}
                        name="address2"
                        disabled={!isEditing}
                        placeholder="상세 주소 (동/호수, 건물명 등)"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="marketingConsent"
                      name="marketingConsent"
                      checked={formData.marketingConsent}
                      onCheckedChange={(checked) => setFormData(prev => ({...prev, marketingConsent: checked as boolean}))}
                      disabled={!isEditing}
                    />
                    <Label htmlFor="marketingConsent" className="text-sm text-gray-600">
                      마케팅 정보 수신에 동의합니다 (선택사항)
                    </Label>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      취소
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="flex items-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      저장
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 멤버십 정보 */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">멤버십</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    userData?.grade === 'ecosoul' ? 'bg-purple-100' : 
                    userData?.grade === 'glower' ? 'bg-pink-100' : 
                    userData?.grade === 'bloomer' ? 'bg-green-100' : 
                    userData?.grade === 'rooter' ? 'bg-blue-100' : 'bg-amber-100'
                  }`}>
                    <span className="text-2xl">
                      {userData?.grade === 'ecosoul' ? '🌿' : 
                       userData?.grade === 'glower' ? '🌸' : 
                       userData?.grade === 'bloomer' ? '🌺' : 
                       userData?.grade === 'rooter' ? '🌱' : '🌲'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 uppercase">
                    {userData?.grade === 'cedar' ? 'CEDAR' :
                     userData?.grade === 'rooter' ? 'ROOTER' :
                     userData?.grade === 'bloomer' ? 'BLOOMER' :
                     userData?.grade === 'glower' ? 'GLOWER' :
                     userData?.grade === 'ecosoul' ? 'ECOSOUL' : 'CEDAR'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    현재 포인트: {userData?.points || 0}P
                  </p>
                  <MembershipInfo 
                    currentGrade={userData?.grade || 'cedar'} 
                    currentPoints={userData?.points || 0} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* 파트너 섹션 */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Store className="h-5 w-5 mr-2" />
                  파트너
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const partnerInfo = getPartnerStatusInfo();
                  if (!partnerInfo) return null;
                  
                  const Icon = partnerInfo.icon;
                  
                  return (
                    <div className={`p-4 rounded-lg ${partnerInfo.bgColor} border`}>
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${partnerInfo.bgColor}`}>
                          <Icon className={`h-5 w-5 ${partnerInfo.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${partnerInfo.color} mb-2`}>
                            {partnerInfo.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-3">
                            {partnerInfo.description}
                          </p>
                          {partnerInfo.action && (
                            <Button 
                              onClick={partnerInfo.action}
                              size="sm"
                              className="w-full"
                            >
                              {partnerInfo.status === 'approved' ? '파트너 대시보드' : 
                               partnerInfo.status === 'rejected' ? '재신청하기' : 
                               '파트너 신청하기'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* 빠른 링크 */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">빠른 링크</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/orders">주문 내역</a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/cart">장바구니</a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/wishlist">위시리스트</a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/support">고객센터</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 파트너 신청 모달 */}
        {showPartnerApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-text-primary">파트너 신청</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPartnerApplication(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handlePartnerApplicationSubmit(); }} className="space-y-6">
                  {/* 기본 정보 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-text-primary">기본 정보</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="businessName">상호명 *</Label>
                        <Input
                          id="businessName"
                          value={partnerApplicationData.businessName}
                          onChange={(e) => handlePartnerApplicationChange('businessName', e.target.value)}
                          required
                          placeholder="상호명을 입력하세요"
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessNumber">사업자등록번호 *</Label>
                        <Input
                          id="businessNumber"
                          value={partnerApplicationData.businessNumber}
                          onChange={(e) => handlePartnerApplicationChange('businessNumber', e.target.value)}
                          required
                          placeholder="123-45-67890"
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessPhone">사업장 전화번호 *</Label>
                        <Input
                          id="businessPhone"
                          value={partnerApplicationData.businessPhone}
                          onChange={(e) => handlePartnerApplicationChange('businessPhone', e.target.value)}
                          required
                          placeholder="02-1234-5678"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 사업장 정보 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-text-primary">사업장 정보</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="businessAddress">사업장 주소 *</Label>
                        <AddressSearch
                          value={partnerApplicationData.businessAddress}
                          detailValue={partnerApplicationData.businessDetailAddress}
                          onAddressSelect={(address, detailAddress) => {
                            handlePartnerApplicationChange('businessAddress', address);
                            if (detailAddress !== undefined) {
                              handlePartnerApplicationChange('businessDetailAddress', detailAddress);
                            }
                          }}
                          placeholder="사업장 주소를 검색하세요"
                          detailPlaceholder="상세주소를 입력하세요 (예: 101호, 2층)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessDescription">사업 설명 *</Label>
                        <textarea
                          id="businessDescription"
                          value={partnerApplicationData.businessDescription}
                          onChange={(e) => handlePartnerApplicationChange('businessDescription', e.target.value)}
                          required
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="사업 내용을 자세히 설명해주세요 (판매 상품, 경험, 특장점 등)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 정산 정보 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-text-primary">정산 정보</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bankName">은행명 *</Label>
                        <Input
                          id="bankName"
                          value={partnerApplicationData.bankName}
                          onChange={(e) => handlePartnerApplicationChange('bankName', e.target.value)}
                          required
                          placeholder="국민은행"
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountHolder">예금주 *</Label>
                        <Input
                          id="accountHolder"
                          value={partnerApplicationData.accountHolder}
                          onChange={(e) => handlePartnerApplicationChange('accountHolder', e.target.value)}
                          required
                          placeholder="홍길동"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="bankAccount">계좌번호 *</Label>
                        <Input
                          id="bankAccount"
                          value={partnerApplicationData.bankAccount}
                          onChange={(e) => handlePartnerApplicationChange('bankAccount', e.target.value)}
                          required
                          placeholder="123456-78-901234"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 서류 업로드 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-text-primary">서류 업로드</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 사업자등록증 */}
                      <div>
                        <Label htmlFor="businessRegistration">사업자등록증 *</Label>
                        <div className="space-y-2">
                          <input
                            type="file"
                            id="businessRegistration"
                            accept="image/*"
                            onChange={(e) => handleDocumentUpload(e, 'businessRegistrationImage')}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          {partnerApplicationData.businessRegistrationImage && (
                            <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                              <FileImage className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-700">사업자등록증 업로드 완료</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 통장사본 */}
                      <div>
                        <Label htmlFor="bankStatement">통장사본 *</Label>
                        <div className="space-y-2">
                          <input
                            type="file"
                            id="bankStatement"
                            accept="image/*"
                            onChange={(e) => handleDocumentUpload(e, 'bankStatementImage')}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          {partnerApplicationData.bankStatementImage && (
                            <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                              <FileImage className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-700">통장사본 업로드 완료</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      * 사업자등록증과 통장사본을 업로드해주세요. 이미지 파일만 업로드 가능합니다.
                    </p>
                    
                    {/* 업로드 완료 안내 */}
                    {partnerApplicationData.businessRegistrationImage && partnerApplicationData.bankStatementImage ? (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            모든 서류 업로드가 완료되었습니다!
                          </span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                          아래 &quot;파트너 신청하기&quot; 버튼을 클릭하여 신청을 완료해주세요.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">
                            서류 업로드 필요
                          </span>
                        </div>
                        <p className="text-xs text-yellow-600 mt-1">
                          사업자등록증과 통장사본을 모두 업로드한 후 &quot;파트너 신청하기&quot; 버튼을 클릭해주세요.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 제출 버튼 */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPartnerApplication(false)}
                    >
                      취소
                    </Button>
                    <Button
                      type="submit"
                      disabled={partnerApplicationLoading}
                      className="flex items-center"
                    >
                      {partnerApplicationLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          신청 중...
                        </>
                      ) : (
                        <>
                          <Store className="h-4 w-4 mr-2" />
                          파트너 신청하기
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
