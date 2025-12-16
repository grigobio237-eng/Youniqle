'use client';

import { Suspense } from 'react';
import ProductList from '@/components/products/ProductList';
import ProductFilters from '@/components/products/ProductFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

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

function ShopContent() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();

    // Construct params object for ProductList
    const params = {
        q: searchParams?.get('q') || undefined,
        category: searchParams?.get('category') || undefined,
        sort: searchParams?.get('sort') || undefined,
        page: searchParams?.get('page') || undefined,
        isFunding: searchParams?.get('isFunding') || undefined
    };

    const isFunding = params.isFunding === 'true';

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    회복 상점 (Recovery Shop)
                </h1>
                <p className="text-gray-600">
                    회복을 돕는 보조 도구들을 만나보세요.
                </p>
            </div>

            {/* Shop Mode Tabs */}
            <div className="mb-8">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                    <Link href="/membership/shop">
                        <div className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!isFunding ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
                            🛍️ 일반 상품
                        </div>
                    </Link>
                    <Link href="/membership/shop?isFunding=true">
                        <div className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isFunding ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
                            🔥 펀딩 프로젝트
                        </div>
                    </Link>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters Sidebar */}
                <aside className="lg:w-64 flex-shrink-0">
                    <Card>
                        <CardContent className="p-6">
                            <ProductFilters />
                        </CardContent>
                    </Card>
                </aside>

                {/* Products Grid */}
                <main className="flex-1">
                    <ErrorBoundary>
                        <Suspense fallback={<ProductListSkeleton />}>
                            <ProductList searchParams={params} />
                        </Suspense>
                    </ErrorBoundary>
                </main>
            </div>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={<ProductListSkeleton />}>
            <ShopContent />
        </Suspense>
    );
}
