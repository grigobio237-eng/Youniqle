'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Sparkles,
  Paperclip,
} from 'lucide-react';
import { toast } from 'sonner';

interface Inquiry {
  _id: string;
  inquiryId: string;
  userName: string;
  userEmail: string;
  type: 'general' | 'delivery' | 'payment' | 'product' | 'technical' | 'refund' | 'partnership';
  subject: string;
  content: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  aiAnswer?: string;
  adminAnswer?: string;
  createdAt: string;
  answeredAt?: string;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
    type: string;
  }>;
}

const typeLabels = {
  general: '일반',
  delivery: '배송',
  payment: '결제',
  product: '상품',
  technical: '기술',
  refund: '환불',
  partnership: '파트너십',
};

const statusLabels = {
  pending: '대기',
  in_progress: '진행중',
  resolved: '해결',
  closed: '종료',
};

const priorityLabels = {
  low: '낮음',
  medium: '보통',
  high: '높음',
  urgent: '긴급',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [adminAnswer, setAdminAnswer] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }
      if (priorityFilter !== 'all') {
        params.append('priority', priorityFilter);
      }

      const response = await fetch(`/api/admin/inquiries?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setInquiries(data.data.inquiries || []);
      }
    } catch (error) {
      console.error('문의 조회 오류:', error);
      toast.error('문의를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, priorityFilter]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleViewDetail = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setAdminAnswer(inquiry.adminAnswer || '');
    setIsDetailDialogOpen(true);
  };

  const handleSaveAnswer = async () => {
    if (!selectedInquiry || !adminAnswer.trim()) {
      toast.error('답변을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/inquiries/${selectedInquiry.inquiryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminAnswer,
          status: 'resolved',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('답변이 저장되었습니다.');
        setIsDetailDialogOpen(false);
        fetchInquiries();
      } else {
        toast.error(data.error || '답변 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('답변 저장 오류:', error);
      toast.error('답변 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('상태가 변경되었습니다.');
        fetchInquiries();
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
      toast.error('상태 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">문의 관리</h1>
          <p className="text-gray-600 mt-1">고객 문의를 관리하고 답변하세요</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="pending">대기</SelectItem>
                <SelectItem value="in_progress">진행중</SelectItem>
                <SelectItem value="resolved">해결</SelectItem>
                <SelectItem value="closed">종료</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 유형</SelectItem>
                <SelectItem value="general">일반</SelectItem>
                <SelectItem value="delivery">배송</SelectItem>
                <SelectItem value="payment">결제</SelectItem>
                <SelectItem value="product">상품</SelectItem>
                <SelectItem value="technical">기술</SelectItem>
                <SelectItem value="refund">환불</SelectItem>
                <SelectItem value="partnership">파트너십</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="우선순위" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 우선순위</SelectItem>
                <SelectItem value="low">낮음</SelectItem>
                <SelectItem value="medium">보통</SelectItem>
                <SelectItem value="high">높음</SelectItem>
                <SelectItem value="urgent">긴급</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries List */}
      <Card>
        <CardHeader>
          <CardTitle>문의 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">문의가 없습니다.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>문의 ID</TableHead>
                  <TableHead>고객명</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>우선순위</TableHead>
                  <TableHead>작성일</TableHead>
                  <TableHead>액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow key={inquiry._id}>
                    <TableCell className="font-mono text-sm">
                      {inquiry.inquiryId}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{inquiry.userName}</p>
                        <p className="text-xs text-gray-500">{inquiry.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {typeLabels[inquiry.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium truncate max-w-xs">
                        {inquiry.subject}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[inquiry.status]}>
                        {statusLabels[inquiry.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[inquiry.priority]}>
                        {priorityLabels[inquiry.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(inquiry)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
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

      {/* Inquiry Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>문의 상세 정보</DialogTitle>
            <DialogDescription>
              문의 내용을 확인하고 답변을 작성하세요
            </DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-6">
              {/* 문의 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">문의 ID</h4>
                  <p className="font-mono text-sm">{selectedInquiry.inquiryId}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">상태</h4>
                  <Badge className={statusColors[selectedInquiry.status]}>
                    {statusLabels[selectedInquiry.status]}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">고객명</h4>
                  <p>{selectedInquiry.userName}</p>
                  <p className="text-sm text-gray-500">{selectedInquiry.userEmail}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">유형</h4>
                  <Badge variant="outline">
                    {typeLabels[selectedInquiry.type]}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">우선순위</h4>
                  <Badge className={priorityColors[selectedInquiry.priority]}>
                    {priorityLabels[selectedInquiry.priority]}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">작성일</h4>
                  <p>{new Date(selectedInquiry.createdAt).toLocaleString('ko-KR')}</p>
                </div>
              </div>

              {/* 문의 제목 및 내용 */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">제목</h4>
                <p className="mb-4">{selectedInquiry.subject}</p>
                <h4 className="font-semibold mb-2">내용</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedInquiry.content}</p>
                </div>
                {selectedInquiry.attachments && selectedInquiry.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h5 className="font-semibold text-sm">첨부 파일</h5>
                    <div className="space-y-2">
                      {selectedInquiry.attachments.map((file, index) => (
                        <a
                          key={index}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-blue-600" />
                            <span>{file.filename}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AI 답변 (있는 경우) */}
              {selectedInquiry.aiAnswer && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <h4 className="font-semibold">AI 답변</h4>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="whitespace-pre-wrap">{selectedInquiry.aiAnswer}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    이 답변을 검토하여 수정하거나 사용할 수 있습니다.
                  </p>
                </div>
              )}

              {/* 관리자 답변 */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">관리자 답변</h4>
                <Textarea
                  value={adminAnswer}
                  onChange={(e) => setAdminAnswer(e.target.value)}
                  placeholder="답변을 입력하세요..."
                  rows={8}
                  className="mb-4"
                />
                <Button
                  onClick={handleSaveAnswer}
                  disabled={saving || !adminAnswer.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {saving ? '저장 중...' : '답변 저장'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

