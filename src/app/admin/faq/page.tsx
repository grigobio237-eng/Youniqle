'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  HelpCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: 'order' | 'payment' | 'shipping' | 'member' | 'product' | 'refund' | 'other';
  order: number;
  views: number;
  helpful: number;
  notHelpful: number;
  status: 'active' | 'hidden';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

const categoryLabels = {
  order: '주문',
  payment: '결제',
  shipping: '배송',
  member: '회원',
  product: '상품',
  refund: '환불/교환',
  other: '기타',
};

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [analytics, setAnalytics] = useState<{
    totalCount: number;
    statusBreakdown?: Record<string, number>;
    categoryBreakdown?: Record<string, number>;
    topHelpful?: Array<Pick<FAQ, '_id' | 'question' | 'helpful' | 'views' | 'category' | 'status' | 'updatedAt'>>;
  }>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'other' as FAQ['category'],
    order: 0,
    status: 'active' as 'active' | 'hidden',
    tags: [] as string[],
  });
  const [previewFAQ, setPreviewFAQ] = useState<FAQ | null>(null);

  const fetchFAQs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`/api/faq?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setFaqs(data.data.faqs || []);
        if (data.data.analytics) {
          setAnalytics(data.data.analytics);
        }
      }
    } catch (error) {
      console.error('FAQ 조회 오류:', error);
      toast.error('FAQ를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter, searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchFAQs();
    }, 200);
    return () => clearTimeout(handler);
  }, [fetchFAQs]);

  const handleCreate = () => {
    setEditingFAQ(null);
    setFormData({
      question: '',
      answer: '',
      category: 'other',
      order: 0,
      status: 'active',
      tags: [],
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      status: faq.status,
      tags: faq.tags || [],
    });
    setIsDialogOpen(true);
  };

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setFaqToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!faqToDelete) return;

    try {
      const response = await fetch(`/api/faq/${faqToDelete}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('FAQ가 삭제되었습니다.');
        setDeleteConfirmOpen(false);
        setFaqToDelete(null);
        fetchFAQs();
      } else {
        toast.error(data.error || 'FAQ 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('FAQ 삭제 오류:', error);
      toast.error('FAQ 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSave = async () => {
    if (!formData.question || !formData.answer) {
      toast.error('질문과 답변을 모두 입력해주세요.');
      return;
    }

    try {
      const url = editingFAQ ? `/api/faq/${editingFAQ._id}` : '/api/faq';
      const method = editingFAQ ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingFAQ ? 'FAQ가 수정되었습니다.' : 'FAQ가 생성되었습니다.');
        setIsDialogOpen(false);
        fetchFAQs();
      } else {
        toast.error(data.error || 'FAQ 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('FAQ 저장 오류:', error);
      toast.error('FAQ 저장 중 오류가 발생했습니다.');
    }
  };

  const handleOrderChange = async (id: string, direction: 'up' | 'down') => {
    const faq = faqs.find(f => f._id === id);
    if (!faq) return;

    const newOrder = direction === 'up' ? faq.order - 1 : faq.order + 1;
    
    try {
      const response = await fetch(`/api/faq/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder }),
      });

      if (response.ok) {
        fetchFAQs();
      }
    } catch (error) {
      console.error('순서 변경 오류:', error);
    }
  };

  const handleStatusToggle = async (faq: FAQ) => {
    const nextStatus = faq.status === 'active' ? 'hidden' : 'active';
    try {
      const response = await fetch(`/api/faq/${faq._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (response.ok) {
        toast.success(`FAQ가 ${nextStatus === 'active' ? '활성화' : '숨김 처리'}되었습니다.`);
        fetchFAQs();
      } else {
        const data = await response.json();
        toast.error(data.error || '상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('FAQ 상태 변경 오류:', error);
      toast.error('상태 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">FAQ 관리</h1>
          <p className="text-gray-600 mt-1">자주 묻는 질문을 관리하세요</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          FAQ 추가
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">전체 FAQ</p>
            <p className="text-2xl font-semibold mt-2">
              {(analytics?.totalCount ?? faqs.length).toLocaleString()}건
            </p>
            <p className="text-xs text-gray-400 mt-1">
              활성 {analytics?.statusBreakdown?.active ?? 0} / 숨김 {analytics?.statusBreakdown?.hidden ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">많이 찾는 카테고리</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {analytics?.categoryBreakdown
                ? Object.entries(analytics.categoryBreakdown)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 4)
                    .map(([key, count]) => (
                      <Badge key={key} variant="outline" className="text-xs font-medium">
                        {categoryLabels[key as keyof typeof categoryLabels] || key} {count}
                      </Badge>
                    ))
                : <span className="text-xs text-gray-400">집계 데이터 없음</span>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="text-sm text-gray-500">도움이 많이 된 질문</p>
            {analytics?.topHelpful && analytics.topHelpful.length > 0 ? (
              analytics.topHelpful.map((item) => (
                <div key={String(item._id)} className="flex items-center justify-between text-xs text-gray-600">
                  <span className="truncate max-w-[160px]">{item.question}</span>
                  <span className="text-green-600 font-medium">+{item.helpful}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-400">집계 데이터 없음</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="FAQ 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                <SelectItem value="order">주문</SelectItem>
                <SelectItem value="payment">결제</SelectItem>
                <SelectItem value="shipping">배송</SelectItem>
                <SelectItem value="member">회원</SelectItem>
                <SelectItem value="product">상품</SelectItem>
                <SelectItem value="refund">환불/교환</SelectItem>
                <SelectItem value="other">기타</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="hidden">비활성</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchFAQs} variant="outline">
              검색
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FAQ List */}
      <Card>
        <CardHeader>
          <CardTitle>FAQ 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">FAQ가 없습니다.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">순서</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead>질문</TableHead>
                  <TableHead className="w-24">조회수</TableHead>
                  <TableHead className="w-24">도움이됨</TableHead>
                  <TableHead className="w-24">상태</TableHead>
                  <TableHead className="w-32">작성일</TableHead>
                  <TableHead className="w-32">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.map((faq) => (
                  <TableRow key={faq._id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleOrderChange(faq._id, 'up')}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <span className="text-center text-sm">{faq.order}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleOrderChange(faq._id, 'down')}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline">
                          {categoryLabels[faq.category]}
                        </Badge>
                        {faq.tags && faq.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {faq.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-[10px] font-normal">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md space-y-1">
                        <p className="font-medium truncate">{faq.question}</p>
                        <p className="text-sm text-gray-500 line-clamp-2 whitespace-pre-wrap">{faq.answer}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        {faq.views}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                        {faq.helpful}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={faq.status === 'active' ? 'outline' : 'secondary'}
                        onClick={() => handleStatusToggle(faq)}
                      >
                        {faq.status === 'active' ? '활성' : '숨김'}
                      </Button>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(faq.createdAt).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setPreviewFAQ(faq)}>
                            <Eye className="h-4 w-4 mr-2" />
                            미리보기
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(faq)}>
                            <Edit className="h-4 w-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(faq._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFAQ ? 'FAQ 수정' : 'FAQ 추가'}</DialogTitle>
            <DialogDescription>
              FAQ 질문과 답변을 입력하세요
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">카테고리 *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order">주문</SelectItem>
                  <SelectItem value="payment">결제</SelectItem>
                  <SelectItem value="shipping">배송</SelectItem>
                  <SelectItem value="member">회원</SelectItem>
                  <SelectItem value="product">상품</SelectItem>
                  <SelectItem value="refund">환불/교환</SelectItem>
                  <SelectItem value="other">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="question">질문 *</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                placeholder="질문을 입력하세요"
              />
            </div>

            <div>
              <Label htmlFor="answer">답변 *</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                placeholder="답변을 입력하세요"
                rows={8}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order">정렬 순서</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="status">상태</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">활성</SelectItem>
                    <SelectItem value="hidden">비활성</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
              <Input
                id="tags"
                value={formData.tags.join(', ')}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    tags: e.target.value
                      .split(',')
                      .map(tag => tag.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="배송, 쿠폰, 로그인"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>
              {editingFAQ ? '수정' : '생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>FAQ 삭제 확인</DialogTitle>
            <DialogDescription>
              이 FAQ를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteConfirmOpen(false); setFaqToDelete(null); }}>
              취소
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 미리보기 다이얼로그 */}
      <Dialog open={!!previewFAQ} onOpenChange={(open) => !open && setPreviewFAQ(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>FAQ 미리보기</DialogTitle>
            <DialogDescription>사용자 화면에서 표시되는 형태를 확인하세요.</DialogDescription>
          </DialogHeader>
          {previewFAQ && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{categoryLabels[previewFAQ.category]}</Badge>
                <Badge variant={previewFAQ.status === 'active' ? 'default' : 'secondary'}>
                  {previewFAQ.status === 'active' ? '활성' : '숨김'}
                </Badge>
              </div>
              <h3 className="font-semibold text-xl">{previewFAQ.question}</h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {previewFAQ.answer}
              </p>
              {previewFAQ.tags && previewFAQ.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {previewFAQ.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs font-normal">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500 border-t pt-3">
                <span>조회 {previewFAQ.views}</span>
                <span>도움이 됨 {previewFAQ.helpful}</span>
                <span>도움이 안 됨 {previewFAQ.notHelpful}</span>
                <span>업데이트 {new Date(previewFAQ.updatedAt).toLocaleString('ko-KR')}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

