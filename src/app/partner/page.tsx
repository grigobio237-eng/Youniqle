'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PartnerPage() {
  const router = useRouter();

  useEffect(() => {
    // 파트너 로그인 페이지로 리다이렉트
    router.replace('/partner/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/10 via-background to-primary/10">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">파트너 로그인 페이지로 이동 중...</p>
      </div>
    </div>
  );
}

