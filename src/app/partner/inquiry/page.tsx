'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Mail, Phone, MapPin, Building, FileText, Send, CheckCircle } from 'lucide-react';
import CharacterImage from '@/components/ui/CharacterImage';

interface PartnerInquiryData {
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  businessType: string;
  website: string;
  message: string;
}

export default function PartnerInquiryPage() {
  const [formData, setFormData] = useState<PartnerInquiryData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    businessType: '',
    website: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: keyof PartnerInquiryData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/partner/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('문의 전송 성공:', result);
        setIsSubmitted(true);
      } else {
        const errorData = await response.json();
        console.error('문의 전송 실패:', errorData);
        alert(`문의 전송 실패: ${errorData.error || '알 수 없는 오류가 발생했습니다.'}`);
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      alert('문의 전송 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              문의가 성공적으로 전송되었습니다!
            </h2>
            <p className="text-gray-600 mb-6">
              파트너십 문의를 검토하여 2-3일 내에 연락드리겠습니다.
              <br />
              감사합니다.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/about">
                  소개 페이지로 돌아가기
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  홈으로 돌아가기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/about" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  소개 페이지로 돌아가기
                </Link>
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">파트너십 문의</span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 왼쪽: 안내 정보 */}
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  파트너십 문의
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Youniqle과 함께 성장할 파트너가 되어주세요.
                  <br />
                  브랜드, 유통사, 크리에이터 등 다양한 파트너십을 기다리고 있습니다.
                </p>
              </div>

              {/* 파트너십 혜택 */}
              <Card className="bg-gradient-to-br from-blue-50 to-emerald-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    파트너십 혜택
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">투명한 수수료 정책</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">전문적인 마케팅 지원</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">빠른 정산 시스템</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">1:1 담당자 지원</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">데이터 분석 및 인사이트 제공</span>
                  </div>
                </CardContent>
              </Card>

              {/* 연락처 정보 */}
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-800">연락처 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">이메일</p>
                      <p className="text-gray-600">partner@youniqle.co.kr</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">전화</p>
                      <p className="text-gray-600">02-1234-5678</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">주소</p>
                      <p className="text-gray-600">서울특별시 강남구 테헤란로 123</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 캐릭터 */}
              <div className="relative w-32 h-32 mx-auto lg:mx-0">
                <CharacterImage
                  src="/character/youniqle-2.png"
                  alt="Youniqle 파트너십 캐릭터"
                  fill
                  className="object-contain animate-bounce"
                  sizes="128px"
                />
              </div>
            </div>

            {/* 오른쪽: 문의 폼 */}
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <FileText className="h-5 w-5 mr-2" />
                  문의하기
                </CardTitle>
                <CardDescription>
                  파트너십에 대한 문의사항을 남겨주세요. 빠른 시일 내에 연락드리겠습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 기본 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">이름 *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="홍길동"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">이메일 *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="example@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">연락처 *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="010-1234-5678"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">회사명 *</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder="(주)예시회사"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="position">직책</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                        placeholder="대표, 팀장 등"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">사업 유형 *</Label>
                      <Select
                        value={formData.businessType}
                        onValueChange={(value) => handleInputChange('businessType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="사업 유형을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brand">브랜드/제조사</SelectItem>
                          <SelectItem value="distributor">유통업체</SelectItem>
                          <SelectItem value="creator">크리에이터/인플루언서</SelectItem>
                          <SelectItem value="service">서비스업체</SelectItem>
                          <SelectItem value="other">기타</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">웹사이트</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">문의 내용 *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="파트너십에 대한 구체적인 문의사항을 남겨주세요..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        전송 중...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        문의 전송하기
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
