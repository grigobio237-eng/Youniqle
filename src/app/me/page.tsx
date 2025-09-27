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
import MembershipInfo from '@/components/ui/MembershipInfo';
import { User, Mail, Phone, MapPin, Settings, Save } from 'lucide-react';

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
      </div>
    </div>
  );
}
