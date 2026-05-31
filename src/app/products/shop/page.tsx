'use client';

import React, { Suspense, useState, useEffect } from 'react';
import ProductList from '@/components/products/ProductList';
import ProductFilters, { categories } from '@/components/products/ProductFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Sparkles, TrendingUp, Star, Filter, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import ExternalProductCuration from '@/components/products/ExternalProductCuration';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="border-line shadow-sm overflow-hidden rounded-[24px] bg-white">
          <Skeleton className="aspect-square w-full rounded-t-[24px] bg-slate-50 animate-shimmer" />
          <CardContent className="p-3 sm:p-5">
            <Skeleton className="h-4 w-3/4 mb-2 bg-slate-100 animate-pulse rounded" />
            <Skeleton className="h-3 w-full mb-4 bg-slate-100 animate-pulse rounded" />
            <div className="flex justify-between items-center gap-2">
              <Skeleton className="h-6 w-16 bg-slate-100 animate-pulse rounded" />
              <Skeleton className="h-8 w-10 sm:w-16 bg-slate-100 animate-pulse rounded" />
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
    <ChapterWrapper chapter="products" className="container mx-auto px-4 py-8 md:py-20">
      
      {/* Premium Boutique Header Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 md:p-12 mb-8 md:mb-12 border border-slate-800/80 shadow-lg">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <ShoppingBag className="w-3 h-3" /> Youniqle Store
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
              유니클 스토어
            </h1>
            <p className="text-slate-300 text-sm md:text-base font-bold opacity-80 max-w-2xl leading-relaxed">
              유니클이 엄선한 프리미엄 회복 상품과 글로벌 큐레이션 아이템을 제안합니다.
            </p>
          </div>
          
          <Button asChild variant="outline" className="rounded-2xl border-slate-700 bg-white/5 backdrop-blur-md text-slate-200 font-bold hover:bg-white/10 hover:text-white transition-all">
            <Link href="/products">회복 솔루션 바로가기</Link>
          </Button>
        </div>
      </div>

      {/* Mobile Horizontal Category Pills (lg:hidden, Sticky at top-[56px] for premium mobile experience) */}
      <div className="block lg:hidden sticky top-[56px] z-20 bg-white/95 backdrop-blur-md pb-3 border-b border-slate-100 mb-6 -mx-4 px-4 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2 items-center">
        {categories.map((cat) => {
          let isActive = false;
          if (cat.value === 'funding') {
            isActive = params.isFunding === 'true';
          } else {
            isActive = (params.category || '') === cat.value && params.isFunding !== 'true';
          }

          // Construct exact URL
          const queryParams = new URLSearchParams();
          if (params.q) queryParams.set('q', params.q);
          if (params.sort) queryParams.set('sort', params.sort);
          if (cat.value) queryParams.set('category', cat.value);
          
          return (
            <Link
              key={cat.value}
              href={`/products/shop?${queryParams.toString()}`}
              className={`inline-flex items-center h-9 px-4 rounded-full text-xs font-black transition-all shrink-0 border ${
                isActive 
                  ? 'bg-[#0E3A3A] text-white border-[#0E3A3A] shadow-sm' 
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
              }`}
            >
              {cat.name}
            </Link>
          );
        })}

        {/* Mobile Filters Drawer Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="h-9 px-3.5 rounded-full text-slate border border-slate-100 bg-white hover:border-slate-300 transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-sm ml-auto">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-black">필터</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-[32px] p-0 bg-white max-h-[85vh] overflow-y-auto border-t border-slate-100">
            <div className="p-6">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-lg font-black text-obsidian tracking-tighter text-left">스토어 필터 및 정렬</SheetTitle>
              </SheetHeader>
              <ProductFilters searchParams={params} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Filters Sidebar (Hidden on mobile, displayed as a sidebar only on lg and up) */}
        <aside className="hidden lg:block lg:w-72 flex-shrink-0">
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
            <div className="mb-8 p-5 bg-emerald-50/50 border border-emerald-100 rounded-3xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[9px] font-black text-[#0E3A3A] uppercase tracking-[0.2em] mb-1">Youniqle Recommendation Based on Your {userScore} Score</p>
                <h3 className="text-base sm:text-lg font-black text-obsidian">{recommendationLabel}</h3>
              </div>
              <Sparkles className="w-6 h-6 text-primary/60 shrink-0" />
            </div>
          )}

          <ErrorBoundary>
            <Suspense fallback={<ProductListSkeleton />}>
              <ProductList searchParams={params} />
            </Suspense>
          </ErrorBoundary>

          {/* 유니클 추천 외부 큐레이션 */}
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
