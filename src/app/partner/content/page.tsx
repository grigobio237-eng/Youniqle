'use client';

import { useState, useEffect } from 'react';
import PartnerLayout from '@/components/partner/PartnerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  MoreVertical,
  Play,
  Image as ImageIcon,
  Link as LinkIcon,
  MessageCircle,
  Heart,
  TrendingUp,
  Upload,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import Image from 'next/image';

interface Content {
  id: string;
  title: string;
  description: string;
  content?: string;
  platform: 'video' | 'blog';
  type: 'video' | 'image' | 'text' | 'link';
  url?: string;
  thumbnail?: string;
  images?: string[];
  videos?: string[];
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  category: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

const platforms = [
  { value: 'video', label: '동영상', icon: Play },
  { value: 'blog', label: '블로그', icon: FileText }
];

const types = [
  { value: 'text', label: '텍스트', icon: FileText },
  { value: 'image', label: '이미지', icon: ImageIcon },
  { value: 'video', label: '동영상', icon: Play },
  { value: 'link', label: '링크', icon: LinkIcon }
];

const categories = [
  '상품 리뷰',
  '라이프스타일',
  '요리/레시피',
  '패션/뷰티',
  '홈데코',
  '여행',
  '육아',
  '기타'
];

function PartnerContentPageContent() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    platform: 'video' as 'video' | 'blog',
    type: 'text' as 'video' | 'image' | 'text' | 'link',
    url: '',
    thumbnail: '',
    images: [] as string[],
    videos: [] as string[],
    status: 'draft' as 'draft' | 'published' | 'archived',
    tags: [] as string[],
    category: '',
    featured: false,
  });

  useEffect(() => {
    fetchContents();
  }, [searchQuery, platformFilter, typeFilter, statusFilter, sortBy]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (platformFilter !== 'all') params.append('platform', platformFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('sort', sortBy);

      const response = await fetch(`/api/partner/content?${params}`);
      if (response.ok) {
        const data = await response.json();
        setContents(data.contents || []);
      } else {
        console.error('Failed to fetch contents');
        setContents([]);
      }
    } catch (error) {
      console.error('Failed to fetch contents:', error);
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContents();
  };

  const handleCreateContent = () => {
    setEditingContent(null);
    setFormData({
      title: '',
      description: '',
      content: '',
      platform: 'video',
      type: 'text',
      url: '',
      thumbnail: '',
      images: [],
      videos: [],
      status: 'draft',
      tags: [],
      category: '',
      featured: false,
    });
    setIsDialogOpen(true);
  };

  const handleEditContent = (content: Content) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      description: content.description,
      content: content.content || '',
      platform: content.platform as 'video' | 'blog',
      type: content.type,
      url: content.url || '',
      thumbnail: content.thumbnail || '',
      images: content.images || [],
      videos: content.videos || [],
      status: content.status,
      tags: content.tags,
      category: content.category,
      featured: content.featured,
    });
    setIsDialogOpen(true);
  };

  // YouTube 썸네일 추출 함수
  const getYouTubeThumbnail = (url: string) => {
    if (!url) return '';
    
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    
    return '';
  };

  const handleSaveContent = async () => {
    try {
      setUploading(true);
      
      // URL이 있고 썸네일이 없으면 자동으로 YouTube 썸네일 추출
      const thumbnailToSend = formData.thumbnail || 
        (formData.url ? getYouTubeThumbnail(formData.url) : '');
      
      const contentData = {
        ...formData,
        thumbnail: thumbnailToSend
      };
      
      const url = editingContent 
        ? `/api/partner/content/${editingContent.id}`
        : '/api/partner/content';
      
      const method = editingContent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contentData),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        fetchContents();
        // 성공 메시지 표시
        alert(editingContent ? '콘텐츠가 수정되었습니다.' : '콘텐츠가 등록되었습니다.');
      } else {
        const error = await response.json();
        alert(error.error || '콘텐츠 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('콘텐츠 저장 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('정말로 이 콘텐츠를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/partner/content/${contentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchContents();
        alert('콘텐츠가 삭제되었습니다.');
      } else {
        const error = await response.json();
        alert(error.error || '콘텐츠 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('콘텐츠 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'partner-content');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          return data.url;
        } else {
          throw new Error(`Failed to upload ${file.name}`);
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find(p => p.value === platform);
    return platformData ? platformData.icon : FileText;
  };

  const getTypeIcon = (type: string) => {
    const typeData = types.find(t => t.value === type);
    return typeData ? typeData.icon : FileText;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">발행됨</Badge>;
      case 'draft':
        return <Badge variant="secondary">임시저장</Badge>;
      case 'archived':
        return <Badge variant="outline">보관됨</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">콘텐츠를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">콘텐츠 관리</h1>
          <p className="text-text-secondary mt-1">
            커뮤니티 글, 리뷰, 동영상 등 콘텐츠를 관리하세요
          </p>
        </div>
        <Button onClick={handleCreateContent}>
          <Plus className="h-4 w-4 mr-2" />
          새 콘텐츠 작성
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-4 w-4" />
                <Input
                  placeholder="콘텐츠 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <div className="flex gap-2">
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="플랫폼" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 플랫폼</SelectItem>
                  {platforms.map(platform => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 유형</SelectItem>
                  {types.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="published">발행됨</SelectItem>
                  <SelectItem value="draft">임시저장</SelectItem>
                  <SelectItem value="archived">보관됨</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">최신순</SelectItem>
                  <SelectItem value="oldest">오래된순</SelectItem>
                  <SelectItem value="views">조회수순</SelectItem>
                  <SelectItem value="likes">좋아요순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content List */}
      {contents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              콘텐츠가 없습니다
            </h3>
            <p className="text-text-secondary mb-4">
              첫 번째 콘텐츠를 작성해보세요
            </p>
            <Button onClick={handleCreateContent}>
              <Plus className="h-4 w-4 mr-2" />
              새 콘텐츠 작성
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contents.map((content) => {
            const PlatformIcon = getPlatformIcon(content.platform);
            const TypeIcon = getTypeIcon(content.type);
            
            return (
              <Card key={content.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <PlatformIcon className="h-4 w-4 text-primary" />
                        <TypeIcon className="h-4 w-4 text-text-secondary" />
                        <span className="text-sm text-text-secondary">
                          {platforms.find(p => p.value === content.platform)?.label}
                        </span>
                        <span className="text-sm text-text-secondary">•</span>
                        <span className="text-sm text-text-secondary">
                          {types.find(t => t.value === content.type)?.label}
                        </span>
                        {getStatusBadge(content.status)}
                        {content.featured && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            추천
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-text-primary mb-2">
                        {content.title}
                      </h3>
                      
                      <p className="text-text-secondary mb-3 line-clamp-2">
                        {content.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-text-secondary mb-3">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {content.views.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {content.likes.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {content.comments.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <span>카테고리: {content.category}</span>
                        {content.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <span>태그: {content.tags.slice(0, 3).join(', ')}</span>
                            {content.tags.length > 3 && <span>...</span>}
                          </>
                        )}
                      </div>

                      <div className="text-xs text-text-secondary mt-2">
                        {new Date(content.publishedAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditContent(content)}>
                          <Edit className="h-4 w-4 mr-2" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteContent(content.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? '콘텐츠 수정' : '새 콘텐츠 작성'}
            </DialogTitle>
            <DialogDescription>
              커뮤니티 글, 리뷰, 동영상 등을 작성하고 관리하세요
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">제목 *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="콘텐츠 제목을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">카테고리 *</label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">플랫폼</label>
                <Select value={formData.platform} onValueChange={(value: any) => setFormData(prev => ({ ...prev, platform: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="플랫폼 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map(platform => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">유형</label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">설명 *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="콘텐츠에 대한 간단한 설명을 입력하세요"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">내용</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="콘텐츠의 상세 내용을 입력하세요"
                rows={8}
              />
            </div>

            {formData.type === 'link' && (
              <div>
                <label className="block text-sm font-medium mb-2">URL</label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  type="url"
                />
                {formData.url && getYouTubeThumbnail(formData.url) && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-2">썸네일 미리보기</label>
                    <div className="relative w-full max-w-xs aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={getYouTubeThumbnail(formData.url)}
                        alt="썸네일 미리보기"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 320px"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">이미지</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        이미지를 선택하거나 드래그하세요
                      </span>
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="sr-only"
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, GIF, WebP, AVIF 파일 (최대 10MB)
                    </p>
                  </div>
                </div>
              </div>

              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={image}
                        alt={`Upload ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">태그</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="태그를 입력하고 Enter를 누르세요"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>

            {/* Status and Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">상태</label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">임시저장</SelectItem>
                    <SelectItem value="published">발행</SelectItem>
                    <SelectItem value="archived">보관</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  추천 콘텐츠로 설정
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={uploading}
            >
              취소
            </Button>
            <div className="flex flex-col items-end">
              <Button
                onClick={handleSaveContent}
                disabled={uploading || !formData.title || !formData.description || !formData.category || (formData.type === 'link' && !formData.url)}
              >
                {uploading ? '저장 중...' : (editingContent ? '수정' : '등록')}
              </Button>
              {(!formData.title || !formData.description || !formData.category || (formData.type === 'link' && !formData.url)) && (
                <p className="text-xs text-red-500 mt-2">
                  필수 항목: {!formData.title && '제목 '}
                  {!formData.description && '설명 '}
                  {!formData.category && '카테고리 '}
                  {formData.type === 'link' && !formData.url && 'URL '}
                  을 입력해주세요
                </p>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PartnerContentPage() {
  return (
    <PartnerLayout>
      <PartnerContentPageContent />
    </PartnerLayout>
  );
}
