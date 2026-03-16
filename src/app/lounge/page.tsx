'use client';

import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import ChapterWrapper from '@/components/layout/ChapterWrapper';

export default function LoungePage() {
    const { update: updateSession } = useSession();

    useEffect(() => {
        // Handle subscription success from URL
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('subscribed') === 'true') {
                updateSession();
                alert('유니클 프리미엄 라운지 멤버십이 활성화되었습니다! 🎊');
                // Clean up URL
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }
        }
    }, [updateSession]);

    return (
        <ChapterWrapper chapter="lounge">
            <div className="relative w-full min-h-screen bg-luxury-silk flex flex-col items-center justify-center p-8">
                <h1 className="text-3xl font-black mb-4">유저 라운지</h1>
                <p className="text-slate">곧 새로운 모습으로 찾아뵙겠습니다.</p>
            </div>
        </ChapterWrapper>
    );
}


