'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Mail, User, FileText, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    type: '',
    subject: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userName || !formData.userEmail || !formData.type || !formData.subject || !formData.content) {
      setSubmitMessage('모든 필드를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const inquiryId = `inquiry-${Date.now()}`;
      
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inquiryId,
          userName: formData.userName,
          userEmail: formData.userEmail,
          type: formData.type,
          subject: formData.subject,
          content: formData.content,
          source: 'website'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // n8n 워크플로우 트리거
        try {
          await fetch('http://localhost:5678/webhook/inquiry-monitor', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inquiryId,
              userName: formData.userName,
              userEmail: formData.userEmail,
              type: formData.type,
              subject: formData.subject,
              content: formData.content,
              source: 'webhook'
            }),
          });
          console.log('n8n 워크플로우 트리거 성공');
        } catch (error) {
          console.error('n8n 워크플로우 트리거 실패:', error);
        }

        setSubmitMessage('문의가 성공적으로 접수되었습니다! 빠른 시일 내에 답변드리겠습니다.');
        setFormData({
          userName: '',
          userEmail: '',
          type: '',
          subject: '',
          content: ''
        });
      } else {
        setSubmitMessage(`문의 접수 실패: ${data.error}`);
      }
    } catch (error) {
      console.error('문의 접수 오류:', error);
      setSubmitMessage('문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">문의하기</h1>
          <p className="text-gray-600">
            궁금한 점이 있으시면 언제든지 문의해주세요. 빠른 시일 내에 답변드리겠습니다.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              문의 양식
            </CardTitle>
            <CardDescription>
              아래 양식을 작성하여 문의사항을 보내주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    이름 *
                  </label>
                  <Input
                    id="userName"
                    type="text"
                    value={formData.userName}
                    onChange={(e) => handleInputChange('userName', e.target.value)}
                    placeholder="이름을 입력해주세요"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    이메일 *
                  </label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={formData.userEmail}
                    onChange={(e) => handleInputChange('userEmail', e.target.value)}
                    placeholder="이메일을 입력해주세요"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  문의 유형 *
                </label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="문의 유형을 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">일반 문의</SelectItem>
                    <SelectItem value="delivery">배송 문의</SelectItem>
                    <SelectItem value="payment">결제 문의</SelectItem>
                    <SelectItem value="product">상품 문의</SelectItem>
                    <SelectItem value="technical">기술 문의</SelectItem>
                    <SelectItem value="refund">환불 문의</SelectItem>
                    <SelectItem value="partnership">파트너십 문의</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4 inline mr-1" />
                  제목 *
                </label>
                <Input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="문의 제목을 입력해주세요"
                  required
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  문의 내용 *
                </label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="문의 내용을 자세히 입력해주세요"
                  rows={6}
                  required
                />
              </div>

              {submitMessage && (
                <div className={`p-4 rounded-md ${
                  submitMessage.includes('성공') 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    {submitMessage.includes('성공') ? (
                      <CheckCircle className="h-5 w-5 mr-2" />
                    ) : (
                      <MessageCircle className="h-5 w-5 mr-2" />
                    )}
                    {submitMessage}
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? '문의 접수 중...' : '문의 접수하기'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>문의 접수 후 24시간 이내에 답변드리겠습니다.</p>
          <p>긴급한 문의사항은 고객센터로 연락해주세요.</p>
        </div>
      </div>
    </div>
  );
}
