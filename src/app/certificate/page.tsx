'use client';

import React from 'react';
import RecoveryCertificate from '@/components/home/RecoveryCertificate';
import { useSession } from 'next-auth/react';

export default function CertificatePage() {
  const { data: session } = useSession();

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
