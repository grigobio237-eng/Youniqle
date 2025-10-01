'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  Search, 
  Filter, 
  Play,
  Eye,
  Heart,
  Calendar,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import CharacterImage from '@/components/ui/CharacterImage';

interface VideoContent {
  id: string;
  _id?: string; // MongoDB _id 필드 (API에서 전송될 수 있음)
  title: string;
  description: string;
  thumbnail?: string;
  url?: string;
  videoUrl?: string;
  duration?: string;
  views: number;
  likes: number;
  publishedAt: string;
  category: string;
  tags: string[];
  featured: boolean;
  createdAt: string;
}

const categories = [
  '전체',
  '제품 리뷰',
  '사용법 가이드',
  '브랜드 스토리',
  '요리/레시피',
  '라이프스타일',
  '기타'
];

export default function VideoContentPage() {
  const [contents, setContents] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('전체');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    fetchContents();
  }, [searchQuery, categoryFilter, sortBy]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter !== '전체') params.append('category', categoryFilter);
      params.append('platform', 'video');
      params.append('sort', sortBy);

      const response = await fetch(`/api/content?${params}`);
      if (response.ok) {
        const data = await response.json();
        setContents(data.contents || []);
      } else {
        console.error('Failed to fetch video contents');
        setContents([]);
      }
    } catch (error) {
      console.error('Failed to fetch video contents:', error);
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContents();
  };

  const formatDuration = (duration: string) => {
    return duration;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const getYouTubeThumbnail = (url: string) => {
    if (!url) return '';
    
    // YouTube URL에서 비디오 ID 추출
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-text-secondary">동영상 콘텐츠를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/content">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                콘텐츠 홈
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Play className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">동영상 콘텐츠</h1>
              <p className="text-text-secondary mt-1">
                제품 리뷰, 사용법 가이드, 브랜드 스토리 등 다양한 동영상 콘텐츠를 만나보세요
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-4 w-4" />
                <Input
                  placeholder="동영상 검색..."
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
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
        </div>
      </div>

      {/* Content List */}
      <div className="container mx-auto px-4 py-8">
        {contents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Play className="h-12 w-12 text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                동영상 콘텐츠가 없습니다
              </h3>
              <p className="text-text-secondary mb-4">
                아직 등록된 동영상 콘텐츠가 없습니다
              </p>
              <Button asChild>
                <Link href="/content">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  콘텐츠 홈으로 돌아가기
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((content) => (
              <Card key={content.id || content._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  {content.thumbnail || content.url ? (
                    <Image
                      src={content.thumbnail || getYouTubeThumbnail(content.url || '')}
                      alt={content.title}
                      fill
                      className="object-cover cursor-pointer"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onClick={() => window.location.href = `/content/video/${content.id}`}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Play className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  {content.duration && (
                    <Badge className="absolute top-4 left-4 bg-black/80 text-white">
                      {formatDuration(content.duration)}
                    </Badge>
                  )}
                  {content.featured && (
                    <Badge className="absolute top-4 right-4 bg-yellow-500 text-white">
                      추천
                    </Badge>
                  )}
                  <Link 
                    href={`/content/video/${content.id}`}
                    className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <Play className="h-12 w-12 text-white opacity-0 hover:opacity-100 transition-opacity" />
                  </Link>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {content.title}
                  </h3>
                  <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                    {content.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-text-secondary mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {formatViews(content.views)}
                      </span>
                      <span className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {formatViews(content.likes)}
                      </span>
                    </div>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(content.publishedAt).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {content.category}
                    </Badge>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/content/video/${content.id}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        보기
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Character Images */}
      <div className="fixed bottom-8 right-8 flex flex-col space-y-4 opacity-30">
        <div className="relative w-12 h-12">
          <CharacterImage
            src="/character/youniqle-5.png"
            alt="동영상 캐릭터"
            fill
            className="object-contain"
            sizes="48px"
          />
        </div>
        <div className="relative w-16 h-16">
          <CharacterImage
            src="/character/youniqle-1.png"
            alt="동영상 캐릭터"
            fill
            className="object-contain"
            sizes="64px"
          />
        </div>
      </div>
    </div>
  );
}
