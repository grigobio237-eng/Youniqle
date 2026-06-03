'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Dynamic import with SSR disabled to avoid hydration errors
const BackgroundRemovalClient = dynamic(() => import('@/components/utils/BackgroundRemovalClient'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-obsidian">유니클 모델 로딩 중...</span>
        </div>
    ),
});

export default function BackgroundRemovalPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <Link href="/utils" className="inline-flex items-center text-primary hover:underline mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    돌아가기
                </Link>

                <Card className="shadow-2xl border-0">
                    <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
                        <div className="mb-4 text-xl">✨</div>
                        <CardTitle className="font-bold text-4xl">유니클 배경 제거</CardTitle>
                        <CardDescription className="text-blue-100 text-lg mt-2">
                            브라우저에서 바로 처리되는 무료 유니클 배경 제거 도구
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-8">
                        <BackgroundRemovalClient />
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-obsidian">
                    <p className="font-semibold">🎁 무료 & 무제한 for Professionals</p>
                    <p className="mt-1">서버 업로드 없이 브라우저에서 안전하게 처리됩니다</p>
                </div>
            </div>
        </div>
    );
}
