'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import GoogleAddressSearch from '@/components/ui/GoogleAddressSearch';
import CharacterImage from '@/components/ui/CharacterImage';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  ArrowLeft,
  Home,
  Building2,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

interface Address {
  _id?: string;
  label: string;
  recipient: string;
  phone: string;
  zip: string;
  addr1: string;
  addr2?: string;
  isDefault?: boolean;
}

export default function AddressesPage() {
  const { data: session, status } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Address>({
    label: '기본 배송지',
    recipient: '',
    phone: '',
    zip: '',
    addr1: '',
    addr2: '',
    isDefault: false,
  });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.user?.addresses || []);
        // 사용자 이름을 기본 수신인으로 설정
        if (!formData.recipient && data.user?.name) {
          setFormData(prev => ({ ...prev, recipient: data.user.name }));
        }
      }
    } catch (error) {
      console.error('배송지 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.recipient || !formData.phone || !formData.zip || !formData.addr1) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      const addressData = {
        label: formData.label,
        recipient: formData.recipient,
        phone: formData.phone,
        zip: formData.zip,
        addr1: formData.addr1,
        addr2: formData.addr2 || '',
        isDefault: formData.isDefault,
      };

      let response;
      if (editingId) {
        // 수정
        response = await fetch('/api/addresses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addressId: editingId, ...addressData }),
        });
      } else {
        // 추가
        response = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addressData),
        });
      }

      if (response.ok) {
        alert(editingId ? '배송지가 수정되었습니다.' : '배송지가 추가되었습니다.');
        setIsAdding(false);
        setEditingId(null);
        resetForm();
        fetchAddresses();
      } else {
        const errorData = await response.json();
        alert(errorData.error || '배송지 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('배송지 저장 오류:', error);
      alert('배송지 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('이 배송지를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/addresses`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId }),
      });

      if (response.ok) {
        alert('배송지가 삭제되었습니다.');
        fetchAddresses();
      } else {
        const errorData = await response.json();
        alert(errorData.error || '배송지 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('배송지 삭제 오류:', error);
      alert('배송지 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch('/api/addresses/default', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId }),
      });

      if (response.ok) {
        alert('기본 배송지가 설정되었습니다.');
        fetchAddresses();
      } else {
        const errorData = await response.json();
        alert(errorData.error || '기본 배송지 설정에 실패했습니다.');
      }
    } catch (error) {
      console.error('기본 배송지 설정 오류:', error);
      alert('기본 배송지 설정 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      label: address.label,
      recipient: address.recipient,
      phone: address.phone,
      zip: address.zip,
      addr1: address.addr1,
      addr2: address.addr2 || '',
      isDefault: address.isDefault || false,
    });
    setEditingId(address._id || null);
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormData({
      label: '기본 배송지',
      recipient: session?.user?.name || '',
      phone: '',
      zip: '',
      addr1: '',
      addr2: '',
      isDefault: false,
    });
    setEditingId(null);
  };

  const getLabelIcon = (label: string) => {
    if (label.includes('집') || label.includes('홈')) return <Home className="h-4 w-4" />;
    if (label.includes('회사') || label.includes('직장')) return <Building2 className="h-4 w-4" />;
    return <Briefcase className="h-4 w-4" />;
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
              배송지를 관리하려면 로그인해주세요.
            </p>
            <Button asChild>
              <Link href="/auth/signin">로그인하기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/me">
              <ArrowLeft className="h-4 w-4 mr-2" />
              마이페이지로 돌아가기
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">배송지 관리</h1>
          <p className="text-gray-600">
            배송지 정보를 추가하고 관리할 수 있습니다
          </p>
        </div>

        {/* 배송지 목록 */}
        <div className="space-y-4 mb-6">
          {addresses.length === 0 && !isAdding ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-6">등록된 배송지가 없습니다.</p>
                <Button onClick={() => setIsAdding(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  배송지 추가
                </Button>
              </CardContent>
            </Card>
          ) : (
            addresses.map((address, index) => (
              <Card key={index} className={address.isDefault ? 'border-blue-500 border-2' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getLabelIcon(address.label)}
                        <h3 className="font-semibold text-lg">{address.label}</h3>
                        {address.isDefault && (
                          <Badge className="bg-blue-600">기본</Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-gray-600">
                        <p className="font-medium">{address.recipient}</p>
                        <p>{address.phone}</p>
                        <p>
                          ({address.zip}) {address.addr1}
                        </p>
                        {address.addr2 && <p>{address.addr2}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      {!address.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(address._id || index.toString())}
                        >
                          기본 설정
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(address)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        수정
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(address._id || index.toString())}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        삭제
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 배송지 추가/수정 폼 */}
        {isAdding && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? '배송지 수정' : '배송지 추가'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="label">배송지 이름 *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="예: 집, 회사, 학교"
                />
              </div>

              <div>
                <Label htmlFor="recipient">수신인 *</Label>
                <Input
                  id="recipient"
                  value={formData.recipient}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
                  placeholder="수신인 이름"
                />
              </div>

              <div>
                <Label htmlFor="phone">연락처 *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="010-1234-5678"
                />
              </div>

              <div>
                <Label>주소 *</Label>
                <div className="mb-3 mt-2">
                  <GoogleAddressSearch
                    onAddressSelect={(address) => {
                      setFormData(prev => ({
                        ...prev,
                        zip: address.zonecode,
                        addr1: address.address,
                      }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={formData.zip}
                      onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                      placeholder="우편번호"
                      className="w-32"
                    />
                    <Input
                      value={formData.addr1}
                      onChange={(e) => setFormData(prev => ({ ...prev, addr1: e.target.value }))}
                      placeholder="도로명주소"
                      className="flex-1"
                    />
                  </div>
                  <Input
                    value={formData.addr2}
                    onChange={(e) => setFormData(prev => ({ ...prev, addr2: e.target.value }))}
                    placeholder="상세주소"
                  />
                </div>
              </div>

              {addresses.length > 0 && !editingId && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isDefault">기본 배송지로 설정</Label>
                </div>
              )}

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  저장
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!isAdding && addresses.length > 0 && (
          <Button onClick={() => setIsAdding(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            배송지 추가
          </Button>
        )}
      </div>
    </div>
  );
}

