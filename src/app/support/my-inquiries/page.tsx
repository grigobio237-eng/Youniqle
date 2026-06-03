'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, MessageSquare, RotateCcw, ArrowLeft, Paperclip, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface Inquiry {
  _id: string;
  inquiryId: string;
  type: string;
  subject: string;
  content: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  adminAnswer?: string;
  aiAnswer?: string;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
    type: string;
  }>;
  createdAt: string;
  updatedAt: string;
  answeredAt?: string;
}

const statusLabels: Record<
  Inquiry['status'],
  { label: string; color: string; description: string }
> = {
  pending: {
    label: '대기 중',
    color: 'bg-yellow-100 text-yellow-800',
    description: '담당자가 문의 내용을 검토하고 있습니다.',
  },
  in_progress: {
    label: '진행 중',
    color: 'bg-primary-container text-blue-800',
    description: '담당자가 답변을 준비 중입니다.',
  },
  resolved: {
    label: '답변 완료',
    color: 'bg-green-100 text-green-800',
    description: '답변이 등록되었습니다. 내용 확인 후 추가 문의가 필요하면 댓글을 남겨주세요.',
  },
  closed: {
    label: '종료',
    color: 'bg-gray-100 text-obsidian',
    description: '문의가 마무리되었습니다.',
  },
};

const typeLabels: Record<string, string> = {
  general: '일반 문의',
  delivery: '배송 문의',
  payment: '결제 문의',
  product: '상품 문의',
  technical: '기술 지원',
  refund: '환불/교환',
  partnership: '제휴 문의',
};

const priorityLabels: Record<string, string> = {
  low: '낮음',
  medium: '보통',
  high: '높음',
  urgent: '긴급',
};

export default function MyInquiriesPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inquiry) => {
      if (selectedStatus !== 'all' && inquiry.status !== selectedStatus) return false;
      if (selectedType !== 'all' && inquiry.type !== selectedType) return false;
      return true;
    });
  }, [inquiries, selectedStatus, selectedType]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedType !== 'all') params.append('type', selectedType);

      const response = await fetch(`/api/inquiries?${params.toString()}`, {
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setInquiries(data.data?.inquiries || []);
      } else {
        toast.error(data.error?.message || '문의 내역을 불러오는 데 실패했습니다.');
      }
    } catch (error: any) {
      console.error('문의 내역 조회 오류:', error);
      toast.error('문의 내역을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchInquiries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, selectedStatus, selectedType]);

  const openInquiryDetail = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsDialogOpen(true);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">로그인이 필요합니다</CardTitle>
            <CardDescription>문의 내역 확인은 로그인 후 이용할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" asChild>
              <Link href="/auth/signin">로그인하러 가기</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/support/inquiry">문의 작성하러 가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-10">
      <div className="container max-w-5xl mx-auto px-4 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-obsidian">내 문의 내역</h1>
            <p className="text-muted-foreground">
              현재까지 접수한 문의와 답변 진행 상황을 확인할 수 있습니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/support/inquiry">
                <ArrowLeft className="h-4 w-4 mr-2" />
                새로운 문의 작성
              </Link>
            </Button>
            <Button variant="outline" onClick={fetchInquiries}>
              <RotateCcw className="h-4 w-4 mr-2" />
              새로고침
            </Button>
          </div>
        </div>

        <Card className="border border-line shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <LabelWithHelper label="문의 상태" helper="보기 원하는 상태를 선택하세요." />
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="pending">대기 중</SelectItem>
                    <SelectItem value="in_progress">진행 중</SelectItem>
                    <SelectItem value="resolved">답변 완료</SelectItem>
                    <SelectItem value="closed">종료</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <LabelWithHelper label="문의 유형" helper="필터링할 유형을 선택하세요." />
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {Object.entries(typeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <LabelWithHelper label="문의 수" helper="필터 결과 총 건수" />
                <div className="h-10 rounded-md border border-line bg-surface flex items-center px-3 text-sm text-obsidian">
                  총 {filteredInquiries.length}건
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-line shadow">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>문의 목록</CardTitle>
              <CardDescription>신규 문의는 상단, 오래된 문의는 하단에 정렬됩니다.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                데이터를 불러오고 있습니다...
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
                <MessageSquare className="h-10 w-10" />
                현재 조회 가능한 문의가 없습니다.
                <Button variant="outline" size="sm" asChild>
                  <Link href="/support/inquiry">새 문의 작성</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">문의번호</TableHead>
                    <TableHead>제목</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>우선순위</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead className="text-right">확인</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInquiries.map((inquiry) => (
                    <TableRow key={inquiry._id}>
                      <TableCell className="font-mono text-xs text-obsidian">
                        {inquiry.inquiryId}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{inquiry.subject}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{typeLabels[inquiry.type] || inquiry.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusLabels[inquiry.status].color}>
                          {statusLabels[inquiry.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {priorityLabels[inquiry.priority] || inquiry.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openInquiryDetail(inquiry)}>
                          상세보기
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>문의 상세</DialogTitle>
            <DialogDescription>
              답변 내용과 진행 상황을 확인하고 추가 문의가 필요한 경우 고객센터로 연락해주세요.
            </DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-6">
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoBox title="문의번호">
                  <span className="font-mono text-sm text-obsidian">
                    {selectedInquiry.inquiryId}
                  </span>
                </InfoBox>
                <InfoBox title="작성일">
                  {new Date(selectedInquiry.createdAt).toLocaleString('ko-KR')}
                </InfoBox>
                <InfoBox title="문의 유형">
                  {typeLabels[selectedInquiry.type] || selectedInquiry.type}
                </InfoBox>
                <InfoBox title="진행 상태">
                  <div className="flex items-center gap-2">
                    <Badge className={statusLabels[selectedInquiry.status].color}>
                      {statusLabels[selectedInquiry.status].label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {statusLabels[selectedInquiry.status].description}
                    </span>
                  </div>
                </InfoBox>
              </section>

              <section className="space-y-3">
                <h3 className="font-semibold text-lg text-obsidian">문의 내용</h3>
                <div className="rounded-md border border-line bg-surface p-4">
                  <p className="text-sm font-semibold mb-2">{selectedInquiry.subject}</p>
                  <p className="whitespace-pre-wrap text-sm text-obsidian">
                    {selectedInquiry.content}
                  </p>
                </div>
                {selectedInquiry.attachments && selectedInquiry.attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-obsidian">첨부 파일</h4>
                    <div className="grid gap-2">
                      {selectedInquiry.attachments.map((file, index) => (
                        <a
                          key={index}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-md border border-line bg-white px-3 py-2 text-sm hover:bg-surface transition"
                        >
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-primary" />
                            <span>{file.filename}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <h3 className="font-semibold text-lg text-obsidian flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  관리자 답변
                </h3>
                {selectedInquiry.adminAnswer ? (
                  <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm leading-relaxed text-obsidian">
                    <p className="whitespace-pre-wrap">{selectedInquiry.adminAnswer}</p>
                    {selectedInquiry.answeredAt && (
                      <p className="text-xs text-muted-foreground mt-3">
                        답변일: {new Date(selectedInquiry.answeredAt).toLocaleString('ko-KR')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md border border-line bg-white p-4 text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    답변을 준비 중입니다. 조금만 기다려주세요.
                  </div>
                )}
              </section>

              <section className="rounded-md border border-line bg-surface p-4 text-xs text-muted-foreground space-y-2">
                <p>
                  - 추가 문의가 필요하거나 답변 내용이 만족스럽지 않다면 고객센터(1588-0000)로 연락주시기 바랍니다.
                </p>
                <p>- 문의가 종료된 경우에도 30일간 기록이 보관되며 이후 자동으로 삭제됩니다.</p>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LabelWithHelper({ label, helper }: { label: string; helper?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-obsidian">{label}</p>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

function InfoBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-line bg-white p-3 space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
      <div className="text-sm text-obsidian">{children}</div>
    </div>
  );
}


