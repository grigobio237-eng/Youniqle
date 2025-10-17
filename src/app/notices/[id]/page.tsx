'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  Eye,
  User,
  Pin,
  AlertCircle,
} from 'lucide-react';

interface Notice {
  _id: string;
  title: string;
  content: string;
  summary?: string;
  type: 'general' | 'important' | 'event' | 'maintenance' | 'update';
  isPinned: boolean;
  isImportant: boolean;
  viewCount: number;
  createdAt: string;
  publishedAt?: string;
  authorName: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }[];
  images?: string[];
}

export default function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [noticeId, setNoticeId] = useState('');

  useEffect(() => {
    params.then(p => setNoticeId(p.id));
  }, [params]);

  useEffect(() => {
    if (noticeId) {
      fetchNotice();
    }
  }, [noticeId]);

  const fetchNotice = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notices/${noticeId}`);
      const data = await response.json();

      if (data.success) {
        setNotice(data.data.notice);
      } else {
        alert('공지사항을 찾을 수 없습니다.');
        router.push('/notices');
      }
    } catch (error) {
      console.error('Error fetching notice:', error);
      alert('공지사항을 불러오는 중 오류가 발생했습니다.');
      router.push('/notices');
    } finally {
      setLoading(false);
    }
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!notice) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 뒤로가기 */}
      <div className="mb-6">
        <Link href="/notices">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Button>
        </Link>
      </div>

      {/* 공지사항 내용 */}
      <Card>
        <CardContent className="p-8">
          {/* 헤더 */}
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-center gap-2 mb-3">
              {notice.isPinned && <Pin className="w-5 h-5 text-red-500" />}
              {notice.isImportant && <AlertCircle className="w-5 h-5 text-orange-500" />}
              {getTypeBadge(notice.type)}
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{notice.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {notice.authorName}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(notice.publishedAt || notice.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                조회 {notice.viewCount}
              </div>
            </div>
          </div>

          {/* 본문 */}
          <div 
            className="prose prose-lg max-w-none mb-6"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {notice.content}
          </div>

          {/* 첨부 파일 */}
          {notice.attachments && notice.attachments.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3">첨부 파일</h3>
              <div className="space-y-2">
                {notice.attachments.map((file, index) => (
                  <a
                    key={index}
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{file.fileName}</div>
                      <div className="text-sm text-gray-500">
                        {formatFileSize(file.fileSize)}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      다운로드
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 목록으로 버튼 */}
      <div className="mt-6 text-center">
        <Link href="/notices">
          <Button variant="outline" size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}



