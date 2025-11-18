'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Upload, XCircle, AlertCircle, CheckCircle } from 'lucide-react';

interface Attachment {
  filename: string;
  url: string;
  size: number;
  type: string;
}

const inquiryTypes = [
  { value: 'general', label: '일반 문의' },
  { value: 'delivery', label: '배송 문의' },
  { value: 'payment', label: '결제 문의' },
  { value: 'product', label: '상품 문의' },
  { value: 'technical', label: '기술 지원' },
  { value: 'refund', label: '환불/교환' },
  { value: 'partnership', label: '제휴 문의' },
];

const priorityOptions = [
  { value: 'low', label: '낮음' },
  { value: 'medium', label: '보통' },
  { value: 'high', label: '높음' },
  { value: 'urgent', label: '긴급' },
];

export default function SupportInquiryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [type, setType] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      setAgreePolicy(true);
    }
  }, [status]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadTasks = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('파일 업로드에 실패했습니다.');
        }

        const data = await response.json();
        if (!data?.url) {
          throw new Error('업로드 URL을 확인할 수 없습니다.');
        }

        return {
          filename: file.name,
          url: data.url,
          size: file.size,
          type: file.type || 'application/octet-stream',
        } as Attachment;
      });

      const uploaded = await Promise.all(uploadTasks);
      setAttachments((prev) => [...prev, ...uploaded]);
      toast.success('첨부 파일을 업로드했습니다.');
    } catch (error: any) {
      console.error('파일 업로드 오류:', error);
      toast.error(error?.message || '파일 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
      // 입력 초기화
      event.target.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!subject.trim()) {
      toast.error('문의 제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      toast.error('문의 내용을 입력해주세요.');
      return;
    }

    if (!agreePolicy) {
      toast.error('개인정보 처리방침에 동의해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          priority,
          subject,
          content,
          attachments,
          tags: ['user-submitted'],
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || '문의가 접수되었습니다.');
        router.push('/support/my-inquiries');
      } else {
        toast.error(data.error?.message || '문의 접수에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('문의 접수 오류:', error);
      toast.error(error?.message || '문의 접수 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">로그인 상태를 확인하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">로그인이 필요합니다</CardTitle>
            <CardDescription>문의 작성 전 로그인을 진행해주세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => router.push('/auth/signin')}>
              로그인하러 가기
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
              메인으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-10">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-10 text-center space-y-3">
          <Badge className="px-4 py-1 bg-blue-100 text-blue-800">고객센터</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">1:1 문의 접수</h1>
          <p className="text-muted-foreground">
            궁금하신 점이나 도움이 필요하신 내용을 작성해주시면 빠르게 답변드리겠습니다.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="shadow-xl border border-slate-100">
            <CardHeader>
              <CardTitle>문의 내용 작성</CardTitle>
              <CardDescription>아래 정보를 작성해주시면 담당자가 확인 후 답변드립니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type">문의 유형</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="문의 유형을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {inquiryTypes.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">우선순위</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="우선순위를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">문의 제목</Label>
                <Input
                  id="subject"
                  placeholder="예) 배송 상태 확인 요청"
                  maxLength={120}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">문의 내용</Label>
                <Textarea
                  id="content"
                  placeholder="상세하게 작성해주실수록 빠른 안내가 가능합니다."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  주문번호, 연락처 등 필요한 정보를 함께 작성해주시면 더욱 빠르게 도와드릴 수 있습니다.
                </p>
              </div>

              <div className="space-y-3">
                <Label>첨부 파일 (선택)</Label>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" disabled={isUploading}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Upload className="h-4 w-4" />
                      파일 업로드
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/*,.pdf,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                      />
                    </label>
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    최대 10MB, 이미지 및 문서 파일을 업로드할 수 있습니다.
                  </span>
                </div>

                {attachments.length > 0 && (
                  <div className="grid gap-3">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border border-dashed border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-medium">{file.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAttachment(index)}
                        >
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="sr-only">첨부 삭제</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-3 rounded-md border border-slate-200 bg-slate-50 p-4">
                <Checkbox
                  id="agree-policy"
                  checked={agreePolicy}
                  onCheckedChange={(checked) => setAgreePolicy(Boolean(checked))}
                />
                <div className="space-y-1 text-sm">
                  <Label htmlFor="agree-policy" className="font-medium">
                    개인정보 수집 및 이용에 동의합니다.
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    수집된 정보는 문의 응대 목적 외에는 사용되지 않으며, 처리가 완료되면 즉시 파기됩니다.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  영업일 기준 24시간 이내 답변을 드립니다.
                </div>
                <Button type="submit" disabled={isSubmitting || isUploading} className="w-full sm:w-auto">
                  {isSubmitting ? '접수 중...' : '문의 접수하기'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Card className="flex-1 border-slate-200">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-blue-600">
                <CheckCircle className="h-5 w-5" />
                <h2 className="font-semibold">문의 접수 전 체크사항</h2>
              </div>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>주문 관련 문의 시 주문번호를 함께 작성해주세요.</li>
                <li>첨부 파일은 최대 10MB까지 업로드 가능합니다.</li>
                <li>긴급 문의는 고객센터(1588-0000)로 연락해주시면 빠르게 도와드리겠습니다.</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="flex-1 border-slate-200 bg-white/80">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-slate-700">
                <AlertCircle className="h-5 w-5" />
                <h2 className="font-semibold">답변 확인 방법</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                답변은 이메일과 마이페이지 &gt; 문의내역에서 확인하실 수 있습니다. 추가 문의가 필요한 경우 동일
                화면에서 답변에 대한 댓글을 남겨주세요.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/support/my-inquiries')}
              >
                내 문의 내역 확인
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}





