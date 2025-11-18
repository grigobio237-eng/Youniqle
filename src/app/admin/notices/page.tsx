'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { INotice } from '@/models/Notice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Megaphone,
  Plus,
  Search,
  RefreshCw,
  Pin,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { toast } from 'sonner';

// Notice 타입은 INotice를 사용

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<INotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [analytics, setAnalytics] = useState<{ status?: Record<string, number> }>({});
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<INotice | null>(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    type: 'general',
    category: '',
    tags: '',
    isPinned: false,
    isImportant: false,
    isPopup: false,
    targetAudience: 'all',
    status: 'draft',
  });
  const [previewNotice, setPreviewNotice] = useState<INotice | null>(null);

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/notices?${params}`);
      const data = await response.json();

      if (data.success) {
        setNotices(data.data.notices);
        setTotal(data.data.pagination.total);
        if (data.data.stats) {
          const statusSummary = data.data.stats.reduce((acc: Record<string, number>, item: { _id: string; count: number }) => {
            acc[item._id] = item.count;
            return acc;
          }, {});
          setAnalytics({ status: statusSummary });
        }
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, search]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleSearch = () => {
    setPage(1);
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/admin/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('공지사항이 생성되었습니다.');
        setShowCreateDialog(false);
        resetForm();
        fetchNotices();
      } else {
        toast.error(data.error?.message || '공지사항 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error creating notice:', error);
      toast.error('공지사항 생성 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = async () => {
    if (!selectedNotice) return;

    try {
      const response = await fetch(`/api/admin/notices/${selectedNotice._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('공지사항이 수정되었습니다.');
        setShowEditDialog(false);
        setSelectedNotice(null);
        resetForm();
        fetchNotices();
      } else {
        toast.error(data.error?.message || '공지사항 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating notice:', error);
      toast.error('공지사항 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmDialog({ open: true, id });
  };

  const handleDelete = async () => {
    if (!deleteConfirmDialog.id) return;

    try {
      const response = await fetch(`/api/admin/notices/${deleteConfirmDialog.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('공지사항이 삭제되었습니다.');
        setDeleteConfirmDialog({ open: false, id: null });
        fetchNotices();
      } else {
        toast.error(data.error?.message || '공지사항 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting notice:', error);
      toast.error('공지사항 삭제 중 오류가 발생했습니다.');
    }
  };

  const openEditDialog = (notice: INotice) => {
    setSelectedNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      summary: notice.summary || '',
      type: notice.type,
      category: '',
      tags: '',
      isPinned: notice.isPinned,
      isImportant: notice.isImportant,
      isPopup: notice.isPopup,
      targetAudience: notice.targetAudience || 'all',
      status: notice.status,
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      summary: '',
      type: 'general',
      category: '',
      tags: '',
      isPinned: false,
      isImportant: false,
      isPopup: false,
      targetAudience: 'all',
      status: 'draft',
    });
  };

  const handleQuickUpdate = useCallback(async (id: string, payload: Partial<INotice>) => {
    try {
      const response = await fetch(`/api/admin/notices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('공지사항이 업데이트되었습니다.');
        fetchNotices();
      } else {
        toast.error(data.error?.message || '공지사항 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('공지사항 업데이트 오류:', error);
      toast.error('공지사항 업데이트 중 오류가 발생했습니다.');
    }
  }, [fetchNotices]);

  const getTypeBadge = (type: string) => {
    const config: Record<string, { variant: any; label: string }> = {
      general: { variant: 'secondary', label: '일반' },
      important: { variant: 'destructive', label: '중요' },
      event: { variant: 'default', label: '이벤트' },
      maintenance: { variant: 'outline', label: '점검' },
      update: { variant: 'default', label: '업데이트' },
    };
    const c = config[type] || config.general;
    return <Badge variant={c.variant as any}>{c.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; label: string }> = {
      draft: { variant: 'outline', label: '임시저장' },
      published: { variant: 'default', label: '게시됨' },
      archived: { variant: 'secondary', label: '보관됨' },
    };
    const c = config[status] || config.draft;
    return <Badge variant={c.variant as any}>{c.label}</Badge>;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const statusSummary = useMemo(() => {
    const counts = analytics.status || {};
    return {
      draft: counts.draft ?? 0,
      published: counts.published ?? 0,
      archived: counts.archived ?? 0,
    };
  }, [analytics]);

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Megaphone className="w-8 h-8" />
            공지사항 관리
          </h1>
          <p className="text-gray-500 mt-1">공지사항을 작성하고 관리합니다</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            새 공지사항
          </Button>
          <Button onClick={() => fetchNotices()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">총 공지</p>
            <p className="text-2xl font-semibold mt-2">{total.toLocaleString()}건</p>
            <p className="text-xs text-gray-400 mt-1">
              게시 {statusSummary.published} · 임시 {statusSummary.draft} · 보관 {statusSummary.archived}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">고정/팝업 공지</p>
            <p className="text-2xl font-semibold mt-2">
              {notices.filter(n => n.isPinned).length} / {notices.filter(n => n.isPopup).length}
            </p>
            <p className="text-xs text-gray-400 mt-1">고정된 공지와 팝업 공지 수</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">검색어</p>
            <p className="text-xl font-semibold mt-2 truncate">{search ? `"${search}"` : '전체'}</p>
            <p className="text-xs text-gray-400 mt-1">필터 적용: {typeFilter || '전체 유형'}</p>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle>공지사항 목록</CardTitle>
          <CardDescription>게시된 공지사항을 관리합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <Input
                placeholder="제목, 내용, 태그 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                <SelectItem value="draft">임시저장</SelectItem>
                <SelectItem value="published">게시됨</SelectItem>
                <SelectItem value="archived">보관됨</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                <SelectItem value="general">일반</SelectItem>
                <SelectItem value="important">중요</SelectItem>
                <SelectItem value="event">이벤트</SelectItem>
                <SelectItem value="maintenance">점검</SelectItem>
                <SelectItem value="update">업데이트</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              검색
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>제목</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-center">옵션</TableHead>
                    <TableHead className="text-right">조회수</TableHead>
                    <TableHead>작성일</TableHead>
                    <TableHead className="text-center">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notices.map((notice) => (
                    <TableRow key={String(notice._id)}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {notice.isPinned && <Pin className="w-4 h-4 text-red-500" />}
                          {notice.isImportant && <AlertCircle className="w-4 h-4 text-orange-500" />}
                          <span className="font-medium">{notice.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(notice.type)}</TableCell>
                      <TableCell>{getStatusBadge(notice.status)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-1 justify-center">
                          {notice.isPinned && <Badge variant="outline">고정</Badge>}
                          {notice.isPopup && <Badge variant="outline">팝업</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Eye className="w-4 h-4 text-gray-400" />
                          {notice.viewCount}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(notice.createdAt.toString())}</TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setPreviewNotice(notice)}>
                              <Eye className="w-4 h-4 mr-2" />
                              미리보기
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(notice)}>
                              <Edit className="w-4 h-4 mr-2" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleQuickUpdate(String(notice._id), { isPinned: !notice.isPinned })
                              }
                            >
                              <Pin className="w-4 h-4 mr-2" />
                              {notice.isPinned ? '고정 해제' : '상단 고정'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleQuickUpdate(String(notice._id), { isPopup: !notice.isPopup })
                              }
                            >
                              <Megaphone className="w-4 h-4 mr-2" />
                              {notice.isPopup ? '팝업 해제' : '팝업 설정'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleQuickUpdate(String(notice._id), {
                                  status: notice.status === 'published' ? 'draft' : 'published',
                                })
                              }
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              {notice.status === 'published' ? '임시저장으로 전환' : '즉시 게시'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(String(notice._id))}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 페이지네이션 */}
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  이전
                </Button>
                <span className="py-2 px-4">
                  {page} / {Math.ceil(total / 10)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(total / 10)}
                >
                  다음
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 공지사항 생성 다이얼로그 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 공지사항 작성</DialogTitle>
            <DialogDescription>공지사항을 작성합니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>제목 *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="공지사항 제목을 입력하세요"
                maxLength={200}
              />
            </div>
            
            <div>
              <Label>요약 (목록용)</Label>
              <Input
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="목록에 표시될 짧은 요약"
                maxLength={300}
              />
            </div>

            <div>
              <Label>내용 *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="공지사항 내용을 입력하세요"
                rows={10}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>유형</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">일반 공지</SelectItem>
                    <SelectItem value="important">중요 공지</SelectItem>
                    <SelectItem value="event">이벤트</SelectItem>
                    <SelectItem value="maintenance">점검 안내</SelectItem>
                    <SelectItem value="update">업데이트</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>상태</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">임시저장</SelectItem>
                    <SelectItem value="published">게시하기</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>노출 대상</Label>
              <Select value={formData.targetAudience} onValueChange={(value) => setFormData(prev => ({ ...prev, targetAudience: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 사용자</SelectItem>
                  <SelectItem value="new">신규 회원만</SelectItem>
                  <SelectItem value="existing">기존 회원만</SelectItem>
                  <SelectItem value="partner">파트너만</SelectItem>
                  <SelectItem value="admin">관리자만</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                팝업 공지의 경우 선택한 대상에게만 표시됩니다
              </p>
            </div>

            <div>
              <Label>태그 (쉼표로 구분)</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="이벤트, 할인, 신상품"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPinned"
                  checked={formData.isPinned}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isPinned: checked as boolean }))
                  }
                />
                <Label htmlFor="isPinned" className="cursor-pointer">
                  상단 고정 (목록 최상단에 표시)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isImportant"
                  checked={formData.isImportant}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isImportant: checked as boolean }))
                  }
                />
                <Label htmlFor="isImportant" className="cursor-pointer">
                  중요 표시 (강조 표시)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPopup"
                  checked={formData.isPopup}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isPopup: checked as boolean }))
                  }
                />
                <Label htmlFor="isPopup" className="cursor-pointer">
                  팝업으로 표시 (메인 페이지 팝업)
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
              취소
            </Button>
            <Button onClick={handleCreate}>생성</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 공지사항 수정 다이얼로그 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>공지사항 수정</DialogTitle>
            <DialogDescription>공지사항을 수정합니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>제목 *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                maxLength={200}
              />
            </div>

            <div>
              <Label>요약</Label>
              <Input
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                maxLength={300}
              />
            </div>

            <div>
              <Label>내용 *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={10}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>유형</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">일반 공지</SelectItem>
                    <SelectItem value="important">중요 공지</SelectItem>
                    <SelectItem value="event">이벤트</SelectItem>
                    <SelectItem value="maintenance">점검 안내</SelectItem>
                    <SelectItem value="update">업데이트</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>상태</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">임시저장</SelectItem>
                    <SelectItem value="published">게시하기</SelectItem>
                    <SelectItem value="archived">보관하기</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>노출 대상</Label>
              <Select value={formData.targetAudience} onValueChange={(value) => setFormData(prev => ({ ...prev, targetAudience: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 사용자</SelectItem>
                  <SelectItem value="new">신규 회원만</SelectItem>
                  <SelectItem value="existing">기존 회원만</SelectItem>
                  <SelectItem value="partner">파트너만</SelectItem>
                  <SelectItem value="admin">관리자만</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                팝업 공지의 경우 선택한 대상에게만 표시됩니다
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isPinned"
                  checked={formData.isPinned}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isPinned: checked as boolean }))
                  }
                />
                <Label htmlFor="edit-isPinned" className="cursor-pointer">
                  상단 고정
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isImportant"
                  checked={formData.isImportant}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isImportant: checked as boolean }))
                  }
                />
                <Label htmlFor="edit-isImportant" className="cursor-pointer">
                  중요 표시
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isPopup"
                  checked={formData.isPopup}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isPopup: checked as boolean }))
                  }
                />
                <Label htmlFor="edit-isPopup" className="cursor-pointer">
                  팝업으로 표시
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); setSelectedNotice(null); resetForm(); }}>
              취소
            </Button>
            <Button onClick={handleEdit}>수정</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteConfirmDialog.open} onOpenChange={(open) => setDeleteConfirmDialog({ open, id: open ? deleteConfirmDialog.id : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>공지사항 삭제</DialogTitle>
            <DialogDescription>
              정말 이 공지사항을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmDialog({ open: false, id: null })}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 미리보기 다이얼로그 */}
      <Dialog open={!!previewNotice} onOpenChange={(open) => !open && setPreviewNotice(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>공지사항 미리보기</DialogTitle>
            <DialogDescription>사용자에게 노출되는 형태를 확인하세요.</DialogDescription>
          </DialogHeader>
          {previewNotice && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {previewNotice.isPinned && <Badge variant="outline">고정</Badge>}
                {previewNotice.isPopup && <Badge variant="outline">팝업</Badge>}
                {getTypeBadge(previewNotice.type)}
                {getStatusBadge(previewNotice.status)}
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">{previewNotice.title}</h2>
                {previewNotice.summary && (
                  <p className="text-sm text-gray-500 mb-3">{previewNotice.summary}</p>
                )}
                <div className="prose max-w-none whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                  {previewNotice.content}
                </div>
              </div>
              {previewNotice.tags && previewNotice.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {previewNotice.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500 border-t pt-3">
                <span>조회 {previewNotice.viewCount}</span>
                {previewNotice.publishedAt && (
                  <span>게시일 {new Date(previewNotice.publishedAt).toLocaleString('ko-KR')}</span>
                )}
                {previewNotice.startDate && (
                  <span>시작 {new Date(previewNotice.startDate).toLocaleDateString('ko-KR')}</span>
                )}
                {previewNotice.endDate && (
                  <span>종료 {new Date(previewNotice.endDate).toLocaleDateString('ko-KR')}</span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}



