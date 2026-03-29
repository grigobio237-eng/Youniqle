'use client';

import React, { Suspense, useState, useEffect } from 'react';
import ProductList from '@/components/products/ProductList';
import ProductFilters from '@/components/products/ProductFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Sparkles, TrendingUp, Star, Filter } from 'lucide-react';
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

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
    isFunding?: string;
  }>;
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
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
      {/* AI Recommendation Banner */}
      {userScore && (
        <div className="mb-12 md:mb-20 bg-surface border border-line rounded-[32px] md:rounded-[40px] p-6 md:p-14 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles className="w-64 h-64 text-primary" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="bg-primary text-background text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" /> AI Tailored
                </span>
                <span className="text-sm font-bold text-primary">나의 회복 점수: {userScore}점</span>
              </div>
              <h2 className="text-2xl md:text-5xl font-black text-text-primary leading-tight tracking-tighter">
                {recommendationLabel}
              </h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-8 text-sm text-text-secondary font-medium">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span>동일 점수대 <b className="text-text-primary">92%가 만족</b></span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span>3주 내 <b className="text-text-primary">회복 지수 개선</b> 사례 다수</span>
                </div>
              </div>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-background font-black rounded-2xl px-10 h-14 shadow-xl transition-all hover:scale-105">
                <Link href="#recommended-products">추천 제품 보기</Link>
              </Button>
            </div>

            <div className="flex-shrink-0 grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-background/40 backdrop-blur-md p-6 rounded-3xl border border-line flex flex-col items-center group transition-all hover:border-primary">
                <div className="w-24 h-24 bg-surface rounded-2xl mb-3 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">💤</div>
                <p className="text-xs font-black text-text-secondary group-hover:text-primary">DEEP SLEEP</p>
              </div>
              <div className="bg-background/40 backdrop-blur-md p-6 rounded-3xl border border-line flex flex-col items-center group transition-all hover:border-primary">
                <div className="w-24 h-24 bg-surface rounded-2xl mb-3 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">⚡</div>
                <p className="text-xs font-black text-text-secondary group-hover:text-primary">VITALITY</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-12 bg-surface/50 p-2 rounded-[24px] w-fit border border-line backdrop-blur-md">
        {[
          { label: '회복 갤러리', value: 'gallery', icon: '🎨', href: '/gallery/artworks' },
          { label: '치유의 여정', value: 'program', icon: '🧭', href: '/healing-center' },
          { label: '도구', value: 'tool', icon: '🛠️', href: '/utils' },
        ].map((tab) => (
          <Button
            key={tab.value}
            variant={params.category === tab.value ? "default" : "ghost"}
            asChild
            className={`rounded-2xl px-8 h-12 font-black transition-all ${params.category === tab.value ? 'bg-primary text-background shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <Link href={tab.href}>
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </Link>
          </Button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6 pb-8 border-b border-line">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-text-primary tracking-tighter">
            회복 솔루션
            <span className="text-primary text-xl font-bold ml-2">
              Recovery Solutions
            </span>
          </h1>
          <p className="text-text-secondary text-lg font-medium opacity-60">
            진단 결과에 따라 당신에게 최적화된 실행 도구들을 제안합니다.
          </p>
        </div>
        {!userScore && (
          <Button asChild variant="outline" className="rounded-full border-chapter-accent text-chapter-accent font-bold hover:bg-chapter-accent/5">
            <Link href="/?action=diagnose">60초 진단 후 맞춤 추천 받기</Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Filters Sidebar - Desktop Only */}
        <aside className="lg:w-72 flex-shrink-0 hidden lg:block">
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
        <main className="flex-1" id="recommended-products">
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

