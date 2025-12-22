'use client';

import React, { Suspense, useState, useEffect } from 'react';
import ProductList from '@/components/products/ProductList';
import ProductFilters from '@/components/products/ProductFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, TrendingUp, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}>
          <Skeleton className="aspect-square w-full rounded-t-2xl" />
          <CardContent className="p-6">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-full mb-4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const { t } = useLanguage();
  const [userScore, setUserScore] = useState<number | null>(null);
  const [recommendationLabel, setRecommendationLabel] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const score = localStorage.getItem('recovery_last_score');
      if (score) {
        const numScore = parseInt(score);
        setUserScore(numScore);

        if (numScore >= 70) setRecommendationLabel('활기 회복을 위한 고농축 키트');
        else if (numScore >= 40) setRecommendationLabel('지친 몸을 위한 집중 리셋 키트');
        else setRecommendationLabel('최우선 휴식을 위한 딥 슬립 키트');
      }
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* AI Recommendation Banner */}
      {userScore && (
        <div className="mb-12 bg-gradient-to-br from-primary/10 via-purple-50 to-blue-50 border border-primary/20 rounded-3xl p-6 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-32 h-32 text-primary" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI 맞춤 추천
                </span>
                <span className="text-sm font-bold text-primary">당신의 회복 점수: {userScore}점</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 leading-tight">
                {recommendationLabel}
              </h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>동일 점수대 <b>92%가 만족</b></span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>3주 내 <b>회복 점수 향상</b> 사례 다수</span>
                </div>
              </div>
              <Button asChild size="lg" className="rounded-full px-8 h-12 shadow-lg hover:scale-105 transition-transform">
                <Link href="#recommended-products">추천 제품 보기</Link>
              </Button>
            </div>

            <div className="flex-shrink-0 grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-100 rounded-xl mb-2 flex items-center justify-center text-2xl">💤</div>
                <p className="text-xs font-bold">딥 슬립</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-100 rounded-xl mb-2 flex items-center justify-center text-2xl">⚡</div>
                <p className="text-xs font-bold">피로 삭제</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            전체 상품 <span className="text-primary text-lg font-bold ml-2">All Selection</span>
          </h1>
          <p className="text-gray-500">당신의 회복 데이터를 완성하는 최고의 파트너들</p>
        </div>
        {/* Simple Quiz-like Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="rounded-full border-gray-200 shrink-0">😴 수면부족</Button>
          <Button variant="outline" size="sm" className="rounded-full border-gray-200 shrink-0">😩 만성피로</Button>
          <Button variant="outline" size="sm" className="rounded-full border-gray-200 shrink-0">🤰 붓기관리</Button>
          <Button variant="outline" size="sm" className="rounded-full border-gray-200 shrink-0">🧘 멘탈케어</Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar - Desktop Only */}
        <aside className="lg:w-64 flex-shrink-0 hidden lg:block">
          <div className="sticky top-24">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4" /> 세부 필터 (Filters)
            </h3>
            <Card className="border-gray-100 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <ProductFilters />
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="flex-1" id="recommended-products">
          <ErrorBoundary>
            <Suspense fallback={<ProductListSkeleton />}>
              <ProductList searchParams={{}} />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

