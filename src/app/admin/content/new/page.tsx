'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X, Upload, Play, FileText, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

export default function NewContentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 유튜브 썸네일 URL 생성
  const getYouTubeThumbnail = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg` : null;
  };

  // 태그 추가
  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  // 태그 제거
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 이미지 업로드 처리
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setLoading(true);
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload/files', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          return data.url;
        }
        throw new Error('Upload failed');
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

      toast.success(`${uploadedUrls.length}개 이미지가 업로드되었습니다.`);
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      toast.error('이미지 업로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 이미지 제거
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('콘텐츠가 성공적으로 작성되었습니다.');
        router.push('/admin/content');
      } else {
        const errorData = await response.json();
        setError(errorData.error || '콘텐츠 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('콘텐츠 생성 오류:', error);
      setError('콘텐츠 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/content">
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로 가기
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">새 콘텐츠 작성</h1>
            <p className="text-obsidian">새로운 콘텐츠를 작성합니다</p>
          </div>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">제목 *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="콘텐츠 제목을 입력하세요"
              required
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
            required
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
                    src={getYouTubeThumbnail(formData.url) || ''}
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
              <Upload className="mx-auto h-12 w-12 text-foreground/70" />
              <div className="mt-4">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-obsidian">
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
                <p className="mt-1 text-xs text-foreground/70">
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
          <div className="flex items-center space-x-2 pt-8">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
            />
            <label htmlFor="featured" className="text-sm font-medium">추천 콘텐츠</label>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/content">취소</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                작성 중...
              </>
            ) : (
              '작성'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
