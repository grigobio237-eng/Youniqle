'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// Accordion 컴포넌트 대신 자체 구현
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: 'order' | 'payment' | 'shipping' | 'member' | 'product' | 'refund' | 'other';
  views: number;
  helpful: number;
  notHelpful: number;
  createdAt: string;
}

const categoryLabels = {
  order: '주문',
  payment: '결제',
  shipping: '배송',
  member: '회원',
  product: '상품',
  refund: '환불/교환',
  other: '기타',
};

const categoryIcons = {
  order: '📦',
  payment: '💳',
  shipping: '🚚',
  member: '👤',
  product: '🛍️',
  refund: '↩️',
  other: '❓',
};

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [analytics, setAnalytics] = useState<{
    statusBreakdown?: Record<string, number>;
    categoryBreakdown?: Record<string, number>;
  }>();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [votedFAQs, setVotedFAQs] = useState<Set<string>>(new Set());
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('faq-votes');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setVotedFAQs(new Set(parsed));
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const fetchFAQs = useCallback(async (nextCategory: string, nextSearch: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (nextCategory && nextCategory !== 'all') {
        params.append('category', nextCategory);
      }
      if (nextSearch.trim()) {
        params.append('search', nextSearch.trim());
      }

      const response = await fetch(`/api/faq?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setFaqs(data.data.faqs || []);
        if (data.data.analytics) {
          setAnalytics({
            statusBreakdown: data.data.analytics.statusBreakdown,
            categoryBreakdown: data.data.analytics.categoryBreakdown,
          });
        }
      }
    } catch (error) {
      console.error('FAQ 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchFAQs(categoryFilter, searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [categoryFilter, searchQuery, fetchFAQs]);

  const handleVote = async (faqId: string, helpful: boolean) => {
    if (votedFAQs.has(faqId)) {
      return;
    }

    try {
      const response = await fetch(`/api/faq/${faqId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful }),
      });

      if (response.ok) {
        setVotedFAQs(prev => {
          const updated = new Set(prev).add(faqId);
          localStorage.setItem('faq-votes', JSON.stringify(Array.from(updated)));
          return updated;
        });
        fetchFAQs(categoryFilter, searchQuery);
      }
    } catch (error) {
      console.error('투표 오류:', error);
    }
  };

  const stats = useMemo(() => {
    const totalHelpful = faqs.reduce((sum, faq) => sum + (faq.helpful || 0), 0);
    const totalNotHelpful = faqs.reduce((sum, faq) => sum + (faq.notHelpful || 0), 0);
    const helpfulRate =
      totalHelpful + totalNotHelpful === 0
        ? 0
        : Math.round((totalHelpful / (totalHelpful + totalNotHelpful)) * 100);

    const categoryCounts = analytics?.categoryBreakdown
      ? Object.entries(analytics.categoryBreakdown)
          .map(([key, value]) => ({
            key,
            label: categoryLabels[key as keyof typeof categoryLabels] || key,
            count: value,
          }))
          .sort((a, b) => b.count - a.count)
      : [];

    return {
      total: faqs.length,
      helpfulRate,
      categoryCounts,
    };
  }, [faqs, analytics]);

  const highlight = useCallback(
    (text: string) => {
      if (!searchQuery.trim()) return text;
      const regex = new RegExp(`(${searchQuery.trim()})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 px-1 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      );
    },
    [searchQuery]
  );

  const topHelpfulFaqs = useMemo(() => {
    return [...faqs]
      .sort((a, b) => {
        const scoreA = (a.helpful || 0) - (a.notHelpful || 0);
        const scoreB = (b.helpful || 0) - (b.notHelpful || 0);
        return scoreB - scoreA;
      })
      .slice(0, 3);
  }, [faqs]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center space-y-3">
          <Badge variant="outline" className="px-3 py-1 text-blue-600 border-blue-200 bg-blue-50">
            FAQ Help Center
          </Badge>
          <h1 className="text-4xl font-bold">자주 묻는 질문</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            주문, 결제, 배송 등 자주 묻는 질문을 모았습니다. 검색이나 카테고리 필터를 활용해 빠르게 답을 찾아보세요.
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">현재 노출 중인 FAQ</p>
              <p className="text-2xl font-semibold mt-2">{stats.total.toLocaleString()}건</p>
              <p className="text-xs text-gray-400 mt-1">
                카테고리 {stats.categoryCounts.length}개 | 도움 지수 {stats.helpfulRate}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">도움이 많이 된 질문</p>
              {topHelpfulFaqs.length === 0 ? (
                <p className="text-sm text-gray-400 mt-2">최근 통계 없음</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                  {topHelpfulFaqs.map((faq) => (
                    <li key={faq._id} className="flex items-center justify-between gap-2">
                      <span className="truncate">{faq.question}</span>
                      <span className="text-xs text-green-600">+{faq.helpful}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">카테고리별 비중</p>
              {stats.categoryCounts.length === 0 ? (
                <p className="text-sm text-gray-400 mt-2">집계 데이터 없음</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {stats.categoryCounts.map((item) => (
                    <Badge key={item.key} variant="outline" className="text-xs font-medium">
                      {item.label} {item.count}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="검색어를 입력하세요..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 카테고리</SelectItem>
                  <SelectItem value="order">주문</SelectItem>
                  <SelectItem value="payment">결제</SelectItem>
                  <SelectItem value="shipping">배송</SelectItem>
                  <SelectItem value="member">회원</SelectItem>
                  <SelectItem value="product">상품</SelectItem>
                  <SelectItem value="refund">환불/교환</SelectItem>
                  <SelectItem value="other">기타</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => fetchFAQs(categoryFilter, searchQuery)}>검색</Button>
            </div>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setCategoryFilter('all')}
          >
            전체
          </Button>
          {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((category) => (
            <Button
              key={category}
              variant={categoryFilter === category ? 'default' : 'outline'}
              onClick={() => setCategoryFilter(category)}
            >
              {categoryIcons[category]} {categoryLabels[category]}
            </Button>
          ))}
        </div>

        {/* FAQ List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">FAQ를 불러오는 중...</p>
          </div>
        ) : faqs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <HelpCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">FAQ가 없습니다</h3>
              <p className="text-gray-600 mb-6">
                검색 결과가 없거나 해당 카테고리에 FAQ가 없습니다.
              </p>
              <Button variant="outline" asChild>
                <Link href="/support/inquiry">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  1:1 문의하기
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq._id} className="overflow-hidden">
                <button
                  onClick={() => setOpenFAQ(openFAQ === faq._id ? null : faq._id)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <Badge variant="outline" className="mt-1">
                      {categoryIcons[faq.category]} {categoryLabels[faq.category]}
                    </Badge>
                    <span className="flex-1 font-semibold">{highlight(faq.question)}</span>
                    <ArrowRight
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        openFAQ === faq._id ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </button>
                {openFAQ === faq._id && (
                  <div className="px-6 pb-6 border-t">
                    <div className="pt-4">
                      <div className="prose max-w-none mb-4">
                        <p className="whitespace-pre-wrap text-gray-700">{highlight(faq.answer)}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>조회 {faq.views}</span>
                          <div className="flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4 text-green-500" />
                            <span>{faq.helpful}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ThumbsDown className="h-4 w-4 text-red-500" />
                            <span>{faq.notHelpful}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVote(faq._id, true)}
                            disabled={votedFAQs.has(faq._id)}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            도움이 됨
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVote(faq._id, false)}
                            disabled={votedFAQs.has(faq._id)}
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            도움이 안됨
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">더 도움이 필요하신가요?</h3>
                <p className="text-gray-600">
                  FAQ에서 원하는 답을 찾지 못하셨다면 1:1 문의를 이용해주세요.
                </p>
              </div>
              <Button asChild>
                <Link href="/support/inquiry">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  1:1 문의하기
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

