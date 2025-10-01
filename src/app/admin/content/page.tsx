'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  authorName?: string;
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

export default function AdminContentPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    fetchContents();
  }, [searchQuery, platformFilter, typeFilter, statusFilter, sortBy]);

  const fetchContents = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (platformFilter !== 'all') params.append('platform', platformFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('sort', sortBy);

      const response = await fetch(`/api/admin/content?${params}`);
      if (response.ok) {
        const data = await response.json();
        setContents(data.contents);
      }
    } catch (error) {
      console.error('Failed to fetch contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContents();
  };

  const handleContentAction = async (contentId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: action !== 'delete' ? JSON.stringify({ action }) : undefined,
      });

      if (response.ok) {
        fetchContents(); // 새로고침
      }
    } catch (error) {
      console.error('Content action failed:', error);
    }
  };

  const filteredContents = contents.filter(content => {
    const matchesSearch = 
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlatform = platformFilter === 'all' || content.platform === platformFilter;
    const matchesType = typeFilter === 'all' || content.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || content.status === statusFilter;
    
    return matchesSearch && matchesPlatform && matchesType && matchesStatus;
  });

  const totalViews = contents.reduce((sum, content) => sum + content.views, 0);
  const totalLikes = contents.reduce((sum, content) => sum + content.likes, 0);
  const publishedContents = contents.filter(content => content.status === 'published').length;
  const draftContents = contents.filter(content => content.status === 'draft').length;

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
        return <Badge variant="default">발행</Badge>;
      case 'draft':
        return <Badge variant="secondary">임시저장</Badge>;
      case 'archived':
        return <Badge variant="outline">보관</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">콘텐츠 관리</h1>
            <p className="text-text-secondary mt-1">
              커뮤니티 글 및 동영상 관리
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
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
            총 {contents.length}개의 콘텐츠를 관리하고 있습니다
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content/new">
            <Plus className="h-4 w-4 mr-2" />
            새 콘텐츠 작성
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">총 콘텐츠</p>
                <p className="text-2xl font-bold text-text-primary">{contents.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">발행된 콘텐츠</p>
                <p className="text-2xl font-bold text-green-600">{publishedContents}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">총 조회수</p>
                <p className="text-2xl font-bold text-text-primary">
                  {totalViews.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Eye className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">총 좋아요</p>
                <p className="text-2xl font-bold text-red-600">
                  {totalLikes.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <Heart className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="제목 또는 설명으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            {/* Platform Filter */}
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-full md:w-40">
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

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="타입" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 타입</SelectItem>
                {types.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="published">발행</SelectItem>
                <SelectItem value="draft">임시저장</SelectItem>
                <SelectItem value="archived">보관</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">최신순</SelectItem>
                <SelectItem value="oldest">오래된순</SelectItem>
                <SelectItem value="views">조회순</SelectItem>
                <SelectItem value="likes">좋아요순</SelectItem>
                <SelectItem value="title">제목순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contents List */}
      <div className="space-y-4">
        {filteredContents.map((content) => {
          const PlatformIcon = getPlatformIcon(content.platform);
          const TypeIcon = getTypeIcon(content.type);
          
          return (
            <Card key={content.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Thumbnail */}
                  <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {content.thumbnail ? (
                      <Image
                        src={content.thumbnail}
                        alt={content.title}
                        width={128}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : content.images && content.images[0] ? (
                      <Image
                        src={content.images[0]}
                        alt={content.title}
                        width={128}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <TypeIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <PlatformIcon className="h-4 w-4 text-gray-500" />
                          <TypeIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500">
                            {platforms.find(p => p.value === content.platform)?.label}
                          </span>
                          {getStatusBadge(content.status)}
                          {content.featured && (
                            <Badge variant="default">인기</Badge>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
                          {content.title}
                        </h3>
                        
                        <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                          {content.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{content.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3" />
                            <span>{content.likes.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{content.comments}</span>
                          </div>
                          <span>{new Date(content.publishedAt).toLocaleDateString()}</span>
                          {content.authorName && (
                            <span>작성자: {content.authorName}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/content/${content.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/content/${content.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleContentAction(content.id, 'toggle-status')}
                            >
                              {content.status === 'published' ? '임시저장' : '발행'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleContentAction(content.id, 'toggle-featured')}
                            >
                              {content.featured ? '인기 해제' : '인기 설정'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleContentAction(content.id, 'delete')}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredContents.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              콘텐츠가 없습니다
            </h3>
            <p className="text-text-secondary mb-4">
              검색 조건에 맞는 콘텐츠를 찾을 수 없습니다.
            </p>
            <Button asChild>
              <Link href="/admin/content/new">
                <Plus className="h-4 w-4 mr-2" />
                첫 번째 콘텐츠 작성하기
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}



