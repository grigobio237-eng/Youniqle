'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import CharacterImage from '@/components/ui/CharacterImage';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  CheckCircle, 
  ArrowLeft,
  Lock
} from 'lucide-react';
import Link from 'next/link';

interface PaymentMethod {
  _id?: string;
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cardType: 'visa' | 'mastercard' | 'amex' | 'other';
  isDefault?: boolean;
  last4?: string;
}

export default function PaymentMethodsPage() {
  const { data: session, status } = useSession();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<PaymentMethod>({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cardType: 'visa',
    isDefault: false,
  });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPaymentMethods();
    }
  }, [status]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payment-methods');
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.paymentMethods || []);
      }
    } catch (error) {
      console.error('결제 수단 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCardType = (cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'other' => {
    const number = cardNumber.replace(/\s/g, '');
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    return 'other';
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    const cardType = getCardType(formatted);
    setFormData(prev => ({
      ...prev,
      cardNumber: formatted,
      cardType,
    }));
  };

  const handleSave = async () => {
    if (!formData.cardNumber || !formData.cardHolder || !formData.expiryMonth || !formData.expiryYear) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    // 카드번호 유효성 검사 (최소 16자리)
    const cardNumberOnly = formData.cardNumber.replace(/\s/g, '');
    if (cardNumberOnly.length < 16) {
      alert('올바른 카드번호를 입력해주세요.');
      return;
    }

    // 만료일 유효성 검사
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const expiryYearNum = parseInt(formData.expiryYear);
    const expiryMonthNum = parseInt(formData.expiryMonth);

    if (expiryYearNum < currentYear || (expiryYearNum === currentYear && expiryMonthNum < currentMonth)) {
      alert('만료일이 유효하지 않습니다.');
      return;
    }

    try {
      const cardNumberOnly = formData.cardNumber.replace(/\s/g, '');
      const last4 = cardNumberOnly.slice(-4);

      const paymentData = {
        cardNumber: cardNumberOnly, // 서버에 전송할 때는 마스킹된 값
        cardHolder: formData.cardHolder,
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        cardType: formData.cardType,
        isDefault: formData.isDefault,
        last4,
      };

      const response = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        alert('결제 수단이 추가되었습니다.');
        setIsAdding(false);
        resetForm();
        fetchPaymentMethods();
      } else {
        const errorData = await response.json();
        alert(errorData.error || '결제 수단 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('결제 수단 저장 오류:', error);
      alert('결제 수단 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (paymentMethodId: string) => {
    if (!confirm('이 결제 수단을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/payment-methods`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId }),
      });

      if (response.ok) {
        alert('결제 수단이 삭제되었습니다.');
        fetchPaymentMethods();
      } else {
        const errorData = await response.json();
        alert(errorData.error || '결제 수단 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('결제 수단 삭제 오류:', error);
      alert('결제 수단 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      const response = await fetch('/api/payment-methods/default', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId }),
      });

      if (response.ok) {
        alert('기본 결제 수단이 설정되었습니다.');
        fetchPaymentMethods();
      } else {
        const errorData = await response.json();
        alert(errorData.error || '기본 결제 수단 설정에 실패했습니다.');
      }
    } catch (error) {
      console.error('기본 결제 수단 설정 오류:', error);
      alert('기본 결제 수단 설정 중 오류가 발생했습니다.');
    }
  };

  const resetForm = () => {
    setFormData({
      cardNumber: '',
      cardHolder: '',
      expiryMonth: '',
      expiryYear: '',
      cardType: 'visa',
      isDefault: false,
    });
  };

  const getCardIcon = (cardType: string) => {
    switch (cardType) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  const maskCardNumber = (cardNumber: string) => {
    const last4 = cardNumber.slice(-4);
    return `**** **** **** ${last4}`;
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
              결제 수단을 관리하려면 로그인해주세요.
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
          <h1 className="text-3xl font-bold mb-2">결제 수단 관리</h1>
          <p className="text-gray-600">
            등록된 결제 수단을 관리할 수 있습니다
          </p>
        </div>

        {/* 보안 안내 */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">보안 안내</p>
                <p>카드 정보는 암호화되어 안전하게 저장됩니다. 실제 카드번호는 표시되지 않으며, 마지막 4자리만 확인할 수 있습니다.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 결제 수단 목록 */}
        <div className="space-y-4 mb-6">
          {paymentMethods.length === 0 && !isAdding ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-6">등록된 결제 수단이 없습니다.</p>
                <Button onClick={() => setIsAdding(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  결제 수단 추가
                </Button>
              </CardContent>
            </Card>
          ) : (
            paymentMethods.map((method) => (
              <Card key={method._id} className={method.isDefault ? 'border-blue-500 border-2' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{getCardIcon(method.cardType)}</span>
                        <h3 className="font-semibold text-lg capitalize">{method.cardType}</h3>
                        {method.isDefault && (
                          <Badge className="bg-blue-600">기본</Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-gray-600">
                        <p className="font-medium text-xl font-mono">
                          {method.cardNumber ? maskCardNumber(method.cardNumber) : `**** **** **** ${method.last4}`}
                        </p>
                        <p className="font-medium">{method.cardHolder}</p>
                        <p className="text-sm">
                          만료일: {method.expiryMonth}/{method.expiryYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(method._id || '')}
                        >
                          기본 설정
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(method._id || '')}
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

        {/* 결제 수단 추가 폼 */}
        {isAdding && (
          <Card>
            <CardHeader>
              <CardTitle>결제 수단 추가</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">카드번호 *</Label>
                <Input
                  id="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.cardType !== 'other' && (
                    <span className="capitalize">{formData.cardType}</span>
                  )}
                </p>
              </div>

              <div>
                <Label htmlFor="cardHolder">카드 소유자 *</Label>
                <Input
                  id="cardHolder"
                  value={formData.cardHolder}
                  onChange={(e) => setFormData(prev => ({ ...prev, cardHolder: e.target.value.toUpperCase() }))}
                  placeholder="홍길동"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryMonth">만료월 *</Label>
                  <Input
                    id="expiryMonth"
                    value={formData.expiryMonth}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                      if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                        setFormData(prev => ({ ...prev, expiryMonth: value }));
                      }
                    }}
                    placeholder="MM"
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label htmlFor="expiryYear">만료년 *</Label>
                  <Input
                    id="expiryYear"
                    value={formData.expiryYear}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                      if (value === '' || parseInt(value) >= new Date().getFullYear()) {
                        setFormData(prev => ({ ...prev, expiryYear: value }));
                      }
                    }}
                    placeholder="YYYY"
                    maxLength={4}
                  />
                </div>
              </div>

              {paymentMethods.length > 0 && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isDefault">기본 결제 수단으로 설정</Label>
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

        {!isAdding && paymentMethods.length > 0 && (
          <Button onClick={() => setIsAdding(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            결제 수단 추가
          </Button>
        )}
      </div>
    </div>
  );
}

