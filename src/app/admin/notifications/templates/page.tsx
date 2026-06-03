'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
  Globe,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Smartphone,
  MessageSquare,
  Bell,
  Settings,
  Languages,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';
import CreateTemplateDialog from '@/components/notifications/CreateTemplateDialog';
import EditTemplateDialog from '@/components/notifications/EditTemplateDialog';
import DeleteTemplateDialog from '@/components/notifications/DeleteTemplateDialog';
import ViewTemplateDialog from '@/components/notifications/ViewTemplateDialog';

interface NotificationTemplate {
  _id: string;
  name: string;
  description: string;
  type: 'email' | 'push' | 'sms' | 'in_app';
  category: 'order' | 'payment' | 'delivery' | 'promotion' | 'system' | 'marketing' | 'security';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  language: string;
  status: 'active' | 'inactive' | 'draft';
  title: string;
  content: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: {
    name: string;
    email: string;
  };
  stats?: {
    totalSchedules: number;
    activeSchedules: number;
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    averageDeliveryRate: number;
    averageOpenRate: number;
    averageClickRate: number;
  };
}

const NotificationTemplatesPage = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);

  // 템플릿 생성/수정/삭제 성공 시 콜백
  const handleSuccess = () => {
    fetchTemplates(); // 목록 새로고침
  };

  // 템플릿 편집
  const handleEdit = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setShowEditDialog(true);
  };

  // 템플릿 삭제
  const handleDelete = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setShowDeleteDialog(true);
  };

  // 템플릿 상세보기
  const handleView = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setShowViewDialog(true);
  };

  // 템플릿 복제
  const handleDuplicate = async (template: NotificationTemplate) => {
    try {
      // 새 이름 생성
      const newName = `${template.name} (복사본)`;

      const response = await fetch('/api/admin/notifications/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newName,
          description: template.description,
          type: template.type,
          category: template.category,
          priority: template.priority,
          language: template.language,
          status: 'draft', // 복제본은 항상 초안으로
          title: template.title,
          content: template.content,
          tags: template.tags || [],
        }),
      });

      if (!response.ok) {
        throw new Error('템플릿 복제에 실패했습니다.');
      }

      alert('템플릿이 복제되었습니다.');
      fetchTemplates();
    } catch (error) {
      console.error('Template duplicate error:', error);
      alert(error instanceof Error ? error.message : '템플릿 복제에 실패했습니다.');
    }
  };

  // 템플릿 조회
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter && { type: typeFilter }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(languageFilter && { language: languageFilter })
      });

      const response = await fetch(`/api/admin/notifications/templates?${params}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        setTemplates(data.templates);
        setTotalPages(data.totalPages);
      } else {
        console.error('Failed to fetch templates:', data.error);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [page, searchTerm, typeFilter, categoryFilter, statusFilter, languageFilter]);

  // 상태별 아이콘
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-foreground/70" />;
    }
  };

  // 타입별 아이콘
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'push':
        return <Bell className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'in_app':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  // 우선순위별 색상
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-obsidian';
    }
  };

  // 카테고리별 색상
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'order':
        return 'bg-primary-container text-blue-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'delivery':
        return 'bg-secondary-container text-purple-800';
      case 'promotion':
        return 'bg-pink-100 text-pink-800';
      case 'system':
        return 'bg-gray-100 text-obsidian';
      case 'marketing':
        return 'bg-secondary-container text-indigo-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-obsidian';
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">알림 템플릿 관리</h1>
          <p className="text-obsidian">알림 템플릿을 생성하고 관리하세요</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          새 템플릿
        </Button>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle>필터 및 검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-foreground/70" />
              <Input
                placeholder="템플릿 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="타입" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">모든 타입</SelectItem>
                <SelectItem value="email">이메일</SelectItem>
                <SelectItem value="push">푸시</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="in_app">인앱</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">모든 카테고리</SelectItem>
                <SelectItem value="order">주문</SelectItem>
                <SelectItem value="payment">결제</SelectItem>
                <SelectItem value="delivery">배송</SelectItem>
                <SelectItem value="promotion">프로모션</SelectItem>
                <SelectItem value="system">시스템</SelectItem>
                <SelectItem value="marketing">마케팅</SelectItem>
                <SelectItem value="security">보안</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">모든 상태</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="inactive">비활성</SelectItem>
                <SelectItem value="draft">초안</SelectItem>
              </SelectContent>
            </Select>
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="언어" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">모든 언어</SelectItem>
                <SelectItem value="ko">한국어</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchTemplates}>
              <Filter className="h-4 w-4 mr-2" />
              필터 적용
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-container rounded-lg">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-obsidian">총 템플릿</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-obsidian">활성 템플릿</p>
                <p className="text-2xl font-bold">
                  {templates.filter(t => t.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-obsidian">초안</p>
                <p className="text-2xl font-bold">
                  {templates.filter(t => t.status === 'draft').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-secondary-container rounded-lg">
                <Globe className="h-6 w-6 text-secondary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-obsidian">다국어 지원</p>
                <p className="text-2xl font-bold">
                  {new Set(templates.map(t => t.language)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 템플릿 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>템플릿 목록</CardTitle>
          <CardDescription>
            {templates.length}개의 템플릿이 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>템플릿</TableHead>
                  <TableHead>타입</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead>우선순위</TableHead>
                  <TableHead>언어</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>통계</TableHead>
                  <TableHead>생성일</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-foreground/70">
                          {template.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getTypeIcon(template.type)}
                        <span className="ml-2 capitalize">{template.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(template.priority)}>
                        {template.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-1" />
                        {template.language.toUpperCase()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusIcon(template.status)}
                        <span className="ml-2 capitalize">{template.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.stats ? (
                        <div className="text-sm">
                          <div>전송: {template.stats.totalSent}</div>
                          <div>열람률: {template.stats.averageOpenRate.toFixed(1)}%</div>
                        </div>
                      ) : (
                        <span className="text-foreground/70">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground/70">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(template)}>
                            <Eye className="h-4 w-4 mr-2" />
                            보기
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            편집
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                            <Copy className="h-4 w-4 mr-2" />
                            복제
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert('번역 관리 기능은 준비 중입니다.')}>
                            <Languages className="h-4 w-4 mr-2" />
                            번역 관리
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert('상세 통계는 상세보기에서 확인할 수 있습니다.')}>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            통계
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDelete(template)}
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

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            이전
          </Button>
          <span className="text-sm text-obsidian">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            다음
          </Button>
        </div>
      )}

      {/* 템플릿 생성 다이얼로그 */}
      <CreateTemplateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleSuccess}
      />

      {/* 템플릿 편집 다이얼로그 */}
      <EditTemplateDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleSuccess}
        templateId={selectedTemplate?._id || null}
      />

      {/* 템플릿 삭제 다이얼로그 */}
      <DeleteTemplateDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onSuccess={handleSuccess}
        templateId={selectedTemplate?._id || null}
        templateName={selectedTemplate?.name || ''}
      />

      {/* 템플릿 상세보기 다이얼로그 */}
      <ViewTemplateDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        templateId={selectedTemplate?._id || null}
      />
    </div>
  );
};

export default NotificationTemplatesPage;









