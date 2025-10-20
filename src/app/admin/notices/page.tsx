'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';

interface Notice {
  _id: string;
  title: string;
  content: string;
  summary?: string;
  type: 'general' | 'important' | 'event' | 'maintenance' | 'update';
  status: 'draft' | 'published' | 'archived';
  isPinned: boolean;
  isImportant: boolean;
  isPopup: boolean;
  viewCount: number;
  createdAt: string;
  publishedAt?: string;
  authorName: string;
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  
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

  useEffect(() => {
    fetchNotices();
  }, [page, statusFilter, typeFilter]);

  const fetchNotices = async () => {
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
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchNotices();
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
        alert('공지사항이 생성되었습니다.');
        setShowCreateDialog(false);
        resetForm();
        fetchNotices();
      } else {
        alert(data.error.message);
      }
    } catch (error) {
      console.error('Error creating notice:', error);
      alert('생성 실패');
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
        alert('공지사항이 수정되었습니다.');
        setShowEditDialog(false);
        setSelectedNotice(null);
        resetForm();
        fetchNotices();
      } else {
        alert(data.error.message);
      }
    } catch (error) {
      console.error('Error updating notice:', error);
      alert('수정 실패');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/notices/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        alert('공지사항이 삭제되었습니다.');
        fetchNotices();
      } else {
        alert(data.error.message);
      }
    } catch (error) {
      console.error('Error deleting notice:', error);
      alert('삭제 실패');
    }
  };

  const openEditDialog = (notice: Notice) => {
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
                    <TableRow key={notice._id}>
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
                      <TableCell>{formatDate(notice.createdAt)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(notice)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            수정
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(notice._id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
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
    </div>
  );
}



