'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Megaphone,
  Search,
  Pin,
  AlertCircle,
  Eye,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Notice {
  _id: string;
  title: string;
  summary?: string;
  type: 'general' | 'important' | 'event' | 'maintenance' | 'update';
  isPinned: boolean;
  isImportant: boolean;
  viewCount: number;
  createdAt: string;
  publishedAt?: string;
}

export default function NoticesPage() {
  const { t } = useLanguage();
  const [pinnedNotices, setPinnedNotices] = useState<Notice[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchNotices();
  }, [page, typeFilter]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(typeFilter && { type: typeFilter }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/notices?${params}`);
      const data = await response.json();

      if (data.success) {
        setPinnedNotices(data.data.pinnedNotices);
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

  const getTypeBadge = (type: string) => {
    const config: Record<string, { variant: any; label: string; color: string }> = {
      general: { variant: 'secondary', label: '일반', color: 'text-gray-600' },
      important: { variant: 'destructive', label: '중요', color: 'text-red-600' },
      event: { variant: 'default', label: '이벤트', color: 'text-blue-600' },
      maintenance: { variant: 'outline', label: '점검', color: 'text-orange-600' },
      update: { variant: 'default', label: '업데이트', color: 'text-green-600' },
    };
    const c = config[type] || config.general;
    return <Badge variant={c.variant as any}>{c.label}</Badge>;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const NoticeCard = ({ notice, isPinned = false }: { notice: Notice; isPinned?: boolean }) => (
    <Link href={`/notices/${notice._id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {isPinned && <Pin className="w-4 h-4 text-red-500" />}
                {notice.isImportant && <AlertCircle className="w-4 h-4 text-orange-500" />}
                {getTypeBadge(notice.type)}
              </div>
              
              <h3 className="text-lg font-semibold mb-2 hover:text-blue-600">
                {notice.title}
              </h3>
              
              {notice.summary && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {notice.summary}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(notice.publishedAt || notice.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {notice.viewCount}
                </div>
              </div>
            </div>
            
            <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Megaphone className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold">{t('notices.title')}</h1>
        </div>
        <p className="text-gray-600">{t('notices.subtitle')}</p>
      </div>

      {/* 검색 및 필터 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder={t('notices.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t('notices.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('notices.all')}</SelectItem>
                <SelectItem value="general">{t('notices.general')}</SelectItem>
                <SelectItem value="important">{t('notices.important')}</SelectItem>
                <SelectItem value="event">{t('notices.event')}</SelectItem>
                <SelectItem value="maintenance">{t('notices.maintenance')}</SelectItem>
                <SelectItem value="update">{t('notices.update')}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              {t('notices.search')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">{t('notices.loading')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 고정 공지사항 */}
          {pinnedNotices.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Pin className="w-5 h-5 text-red-500" />
                {t('notices.pinned')}
              </h2>
              <div className="space-y-3">
                {pinnedNotices.map((notice) => (
                  <NoticeCard key={notice._id} notice={notice} isPinned />
                ))}
              </div>
            </div>
          )}

          {/* 일반 공지사항 */}
          <div>
            {pinnedNotices.length > 0 && (
              <h2 className="text-xl font-bold mb-4">{t('notices.allNotices')}</h2>
            )}
            {notices.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {t('notices.noNotices')}
              </div>
            ) : (
              <div className="space-y-3">
                {notices.map((notice) => (
                  <NoticeCard key={notice._id} notice={notice} />
                ))}
              </div>
            )}
          </div>

          {/* 페이지네이션 */}
          {total > 10 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t('notices.previous')}
              </Button>
              <span className="py-2 px-4 bg-gray-100 rounded">
                {page} / {Math.ceil(total / 10)}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 10)}
              >
                {t('notices.next')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}



