'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SoundTherapy from '@/components/utils/SoundTherapy';

export default function SoundTherapyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-chapter-accent">
      <header className="fixed top-0 left-0 right-0 z-50 p-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="text-white hover:bg-white/10 rounded-full font-bold group"
        >
          <ArrowLeft className="w-6 h-6 mr-2 group-hover:-translate-x-1 transition-transform" /> 돌아가기
        </Button>
      </header>

      <main className="container mx-auto px-6 pt-32 pb-32 flex items-center justify-center min-h-screen">
        <SoundTherapy />
      </main>
    </div>
  );
}
