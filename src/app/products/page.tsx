'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ArrowRight, Palette, Compass, Wrench, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

export default function RecoveryPortalPage() {
  const { data: session } = useSession();
  const [userScore, setUserScore] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const score = localStorage.getItem('recovery_last_score');
      if (score) {
        setUserScore(parseInt(score));
      }
    }
  }, []);

  const handleProtectedClick = (e: React.MouseEvent) => {
    if ((session?.user as any)?.role !== 'admin') {
      e.preventDefault();
      alert('해당 등급 이외에 접근권한이 없습니다.');
    }
  };

  const portalSections = [
    {
      title: '회복 갤러리',
      subtitle: '예술을 통한 시각적 회복',
      description: '회복의 순간들을 영감으로 승화시킨 프리미엄 아트워크와 미디어 아트를 만나보세요.',
      icon: <Palette className="w-6 h-6" />,
      image: '/images/portal/gallery.png',
      link: '/gallery/artworks',
      color: 'from-purple-500/20 to-indigo-500/20'
    },
    {
      title: '치유의 여정',
      subtitle: '프라이빗 라운지 컴퍼니',
      description: '김미정 원장의 회복 설계 철학이 담긴 프라이빗 라운지에서 맞춤형 컨시어지 케어를 경험하세요.',
      icon: <Compass className="w-6 h-6" />,
      image: '/images/portal/journey.png',
      link: '/healing-center',
      color: 'from-emerald-500/20 to-teal-500/20'
    },
    {
      title: '회복의 도구',
      subtitle: '스마트 데이터 진단 툴',
      description: 'AI 비디오 자세 분석부터 호흡 가이드까지, 과학적인 회복을 위한 최신 도구를 활용하세요.',
      icon: <Wrench className="w-6 h-6" />,
      image: '/images/portal/tools.png',
      link: '/utils',
      color: 'from-blue-500/20 to-cyan-500/20'
    }
  ];

  if (!isMounted) return null;

  return (
    <ChapterWrapper chapter="products" className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-[120px] -z-10" />
        
        <div className="container mx-auto px-6 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-line text-primary text-[10px] font-extrabold uppercase tracking-[0.3em] shadow-xl"
          >
            <Sparkles className="w-4 h-4" /> Premium Healing Lounge
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-text-primary tracking-tighter leading-[1.1]"
          >
            완전한 휴식과 회복, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">나만의 힐링 라운지</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-text-secondary max-w-2xl mx-auto font-medium"
          >
            예술과 데이터, 그리고 프라이빗 케어가 만나는 곳. <br />
            당신만의 온전한 회복이 시작되는 프리미엄 라운지를 경험해 보세요.
          </motion.p>
        </div>
      </section>

      {/* Main Portal Navigation */}
      <section className="container mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {portalSections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
            >
              <Link 
                href={section.link} 
                className="group block h-full"
                onClick={section.title === '치유의 여정' ? handleProtectedClick : undefined}
              >
                <Card className="h-full bg-surface border-line overflow-hidden transition-all duration-500 hover:border-primary/50 group-hover:shadow-[0_0_50px_-12px_rgba(var(--primary-rgb),0.3)]">
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <Image 
                      src={section.image} 
                      alt={section.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${section.color} group-hover:opacity-60 transition-opacity`} />
                    <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-surface via-surface/80 to-transparent">
                      <div className="flex items-center gap-3 text-primary mb-3">
                        {section.icon}
                        <span className="text-[11px] font-black uppercase tracking-widest">{section.subtitle}</span>
                      </div>
                      <h3 className="text-3xl font-black text-white mb-4 group-hover:text-primary transition-colors">{section.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        {section.description}
                      </p>
                      <div className="flex items-center gap-2 text-primary text-sm font-bold opacity-60 group-hover:opacity-100 transition-all">
                        자세히 보기 <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

    </ChapterWrapper>
  );
}
