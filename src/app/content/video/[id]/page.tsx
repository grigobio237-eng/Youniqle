'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Play,
  Eye,
  Heart,
  Calendar,
  ExternalLink,
  Share2,
  ThumbsUp
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import CharacterImage from '@/components/ui/CharacterImage';

interface VideoDetail {
  id: string;
  title: string;
  description: string;
  content?: string;
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
  partnerName?: string;
  partnerEmail?: string;
}

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchVideoDetail(params.id as string);
    }
  }, [params.id]);

  const fetchVideoDetail = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/content/${id}`);
      if (response.ok) {
        const data = await response.json();
        setVideo(data.content);
      } else {
        setError('동영상을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('Failed to fetch video detail:', error);
      setError('동영상을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeThumbnail = (url: string) => {
    if (!url) return '';
    
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    
    return '';
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return '';
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const handleExternalLink = () => {
    if (video?.url) {
      window.open(video.url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-text-secondary">동영상을 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {error || '동영상을 찾을 수 없습니다'}
              </h3>
              <p className="text-text-secondary mb-4">
                요청하신 동영상이 존재하지 않거나 삭제되었습니다
              </p>
              <Button asChild>
                <Link href="/content/video">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  동영상 목록으로 돌아가기
                </Link>
              </Button>
            </CardContent>
          </Card>
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
            <Link href="/content/video">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                동영상 목록
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Video Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Area */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-black">
                {video.url ? (
                  <iframe
                    src={getYouTubeEmbedUrl(video.url)}
                    title={video.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Play className="h-16 w-16 text-white" />
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {formatViews(video.views)} 조회수
                      </span>
                      <span className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {formatViews(video.likes)} 좋아요
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(video.publishedAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExternalLink}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      원본 보기
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      공유
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">{video.category}</Badge>
                  {video.featured && (
                    <Badge className="bg-yellow-500 text-white">추천</Badge>
                  )}
                  {video.partnerName && (
                    <Badge variant="outline">파트너: {video.partnerName}</Badge>
                  )}
                </div>

                <div className="prose max-w-none">
                  <p className="text-text-secondary leading-relaxed">
                    {video.description}
                  </p>
                </div>

                {video.tags && video.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3">태그</h3>
                    <div className="flex flex-wrap gap-2">
                      {video.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">이 동영상이 마음에 드시나요?</h3>
                <div className="space-y-3">
                  <Button className="w-full">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    좋아요
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleExternalLink}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    YouTube에서 보기
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Related Content */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">관련 콘텐츠</h3>
                <p className="text-text-secondary text-sm">
                  더 많은 동영상 콘텐츠를 확인해보세요
                </p>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href="/content/video">
                    모든 동영상 보기
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
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




