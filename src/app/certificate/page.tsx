'use client';

import React, { useEffect, useState } from 'react';
import RecoveryCertificate from '@/components/home/RecoveryCertificate';
import { useSession } from 'next-auth/react';

export default function CertificatePage() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="bg-mist min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </main>
    );
  }

  // In a real app, you would fetch the user's latest 7-day completion data here
  const certificateData = {
    userName: session?.user?.name || '사용자',
    completionDate: new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    signalsFound: 12,
    improvement: 24,
    daysActive: 7,
    grade: 'GATE'
  };

  return (
    <main className="bg-mist min-h-screen">
      <RecoveryCertificate {...certificateData} />
    </main>
  );
}
