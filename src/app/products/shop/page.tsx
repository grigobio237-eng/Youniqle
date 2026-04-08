'use client';

import React, { Suspense, useState, useEffect } from 'react';
import ProductList from '@/components/products/ProductList';
import ProductFilters from '@/components/products/ProductFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Sparkles, TrendingUp, Star, Filter, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import ExternalProductCuration from '@/components/products/ExternalProductCuration';

function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="bg-surface border-line">
          <Skeleton className="aspect-square w-full rounded-t-2xl bg-background animate-shimmer" />
          <CardContent className="p-6">
            <Skeleton className="h-4 w-3/4 mb-2 bg-background animate-shimmer" />
            <Skeleton className="h-3 w-full mb-4 bg-background animate-shimmer" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-20 bg-background animate-shimmer" />
              <Skeleton className="h-8 w-16 bg-background animate-shimmer" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface ShopPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
    isFunding?: string;
  }>;
}

export default function ShopPage({ searchParams }: ShopPageProps) {
  const params = React.use(searchParams);
  const isFunding = params.isFunding === 'true';
  const [userScore, setUserScore] = useState<number | null>(null);
  const [userTags, setUserTags] = useState<string[]>([]);
  const [recommendationLabel, setRecommendationLabel] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const score = localStorage.getItem('recovery_last_score');
      if (score) {
        const numScore = parseInt(score);
        setUserScore(numScore);

        if (numScore >= 70) {
          setRecommendationLabel('활기 회복을 위한 고농축 키트');
          setUserTags(['concentration', 'mental_care']);
        } else if (numScore >= 40) {
          setRecommendationLabel('지친 몸을 위한 집중 리셋 키트');
          setUserTags(['chronic_fatigue', 'stress']);
        } else {
          setRecommendationLabel('최우선 휴식을 위한 딥 슬립 키트');
          setUserTags(['sleep_lack', 'chronic_fatigue']);
        }
      }
    }
  }, []);

  return (
    <ChapterWrapper chapter="products" className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 pb-8 border-b border-line">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
            <ShoppingBag className="w-3 h-3" /> Youniqle Store
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tighter">
            유니클 스토어
          </h1>
          <p className="text-text-secondary text-lg font-medium opacity-60 max-w-2xl">
            유니클이 엄선한 프리미엄 회복 상품과 글로벌 큐레이션 아이템을 제안합니다.
          </p>
        </div>
        
        <Button asChild variant="ghost" className="rounded-2xl border border-line text-text-secondary font-bold hover:bg-surface">
          <Link href="/products">회복 솔루션 바로가기</Link>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Filters Sidebar */}
        <aside className="lg:w-72 flex-shrink-0">
          <div className="sticky top-28 space-y-6">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-text-secondary flex items-center gap-2 ml-1">
              <Filter className="w-3 h-3" /> Filters
            </h3>
            <Card className="border-line shadow-2xl overflow-hidden bg-surface rounded-[32px]">
              <CardContent className="p-0">
                <ProductFilters searchParams={params} />
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          {/* AI Recommendation Context */}
          {userScore && (
            <div className="mb-10 p-6 bg-primary/5 border border-primary/10 rounded-3xl flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-1">AI Recommendation Based on Your {userScore} Score</p>
                <h3 className="text-xl font-black text-text-primary">{recommendationLabel}</h3>
              </div>
              <Sparkles className="w-8 h-8 text-primary/40" />
            </div>
          )}

          <ErrorBoundary>
            <Suspense fallback={<ProductListSkeleton />}>
              <ProductList searchParams={params} />
            </Suspense>
          </ErrorBoundary>

          {/* AI 추천 외부 큐레이션 */}
          {!isFunding && (
            <div className="mt-16 pt-12 border-t border-line">
              <ExternalProductCuration
                recoveryScore={userScore || undefined}
                tags={userTags}
                maxItems={8}
              />
            </div>
          )}
        </main>
      </div>
    </ChapterWrapper>
  );
}
