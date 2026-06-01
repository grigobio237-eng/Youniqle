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
    if (!['admin', 'superadmin'].includes((session?.user as any)?.role)) {
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
      bgImage: '/images/portal/gallery-1.png',
      charImage: '',
      link: '/gallery/artworks',
      color: 'from-purple-500/20 to-indigo-500/20'
    },
    {
      title: '치유의 여정',
      subtitle: '프라이빗 라운지 컴퍼니',
      description: '김미정 원장의 회복 설계 철학이 담긴 프라이빗 라운지에서 맞춤형 컨시어지 케어를 경험하세요.',
      icon: <Compass className="w-6 h-6" />,
      bgImage: '/images/portal/journey-1.png',
      charImage: '',
      link: '/healing-center',
      color: 'from-emerald-500/20 to-teal-500/20'
    },
    {
      title: '회복의 도구',
      subtitle: '스마트 데이터 진단 툴',
      description: '유니클 비디오 자세 분석부터 호흡 가이드까지, 과학적인 회복을 위한 최신 도구를 활용하세요.',
      icon: <Wrench className="w-6 h-6" />,
      bgImage: '/images/portal/tools-1.png',
      charImage: '',
      link: '/utils',
      color: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      title: '준비 중',
      subtitle: '새로운 회복 서비스',
      description: '더 깊은 내면의 치유와 성장을 위한 새로운 회복 서비스가 곧 공개됩니다. 기대해 주세요.',
      icon: <Sparkles className="w-6 h-6" />,
      bgImage: '/images/portal/soon-1.png',
      charImage: '',
      link: '#',
      color: 'from-amber-500/20 to-orange-500/20',
      isComingSoon: true
    }
  ];

  if (!isMounted) return null;

  return (
    <ChapterWrapper chapter="products" className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-6 md:pt-20 pb-4 md:pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[200px] md:h-[500px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-[80px] md:blur-[120px] -z-10" />
        
        <div className="container mx-auto px-4 md:px-6 text-center space-y-3.5 md:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-surface border border-line text-primary text-[8px] md:text-[10px] font-extrabold uppercase tracking-[0.3em] shadow-xl"
          >
            <Sparkles className="w-3.5 h-3.5" /> Premium Healing Lounge
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-7xl font-black text-text-primary tracking-tighter leading-[1.15]"
          >
            완전한 휴식과 회복, <br className="block md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400 text-xl sm:text-2xl md:text-6xl font-black">나만의 힐링 라운지</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[11px] sm:text-xs md:text-xl text-text-secondary max-w-[280px] xs:max-w-sm md:max-w-2xl mx-auto font-medium leading-normal"
          >
            예술과 데이터, 그리고 프라이빗 케어가 만나는 곳. <br className="hidden md:block" />
            당신만의 온전한 회복이 시작되는 프리미엄 라운지를 경험해 보세요.
          </motion.p>
        </div>
      </section>

      {/* Mobile Portal Navigation (Visible only on mobile/tablet) */}
      <section className="block lg:hidden container mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 gap-4">
          {portalSections.map((section, idx) => {
            // Short, premium uppercase tag based on category
            const shortTag = section.title === '회복 갤러리' ? 'GALLERY' :
                             section.title === '치유의 여정' ? 'LOUNGE' :
                             section.title === '회복의 도구' ? 'TOOLS' : 'SOON';
            
            const isSoon = 'isComingSoon' in section && section.isComingSoon;

            // Vibrant glowing card borders and background gradients matching each pastel theme
            const cardBg = section.title === '회복 갤러리' ? 'from-purple-500/15 via-indigo-500/10 to-surface border-purple-500/25' :
                           section.title === '치유의 여정' ? 'from-emerald-500/15 via-teal-500/10 to-surface border-emerald-500/25' :
                           section.title === '회복의 도구' ? 'from-blue-500/15 via-cyan-500/10 to-surface border-blue-500/25' :
                                                             'from-amber-500/15 via-orange-500/10 to-surface border-amber-500/25';

            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="h-full"
              >
                <Link 
                  href={section.link} 
                  className={`group block h-full ${isSoon ? 'cursor-not-allowed' : ''}`}
                  onClick={(e) => {
                    if (isSoon) {
                      e.preventDefault();
                      alert('새로운 회복 서비스가 준비 중입니다. 곧 찾아뵙겠습니다!');
                      return;
                    }
                    if (section.title === '치유의 여정') {
                      handleProtectedClick(e);
                    }
                  }}
                >
                  <Card className={`relative aspect-[1/1.25] bg-gradient-to-br ${cardBg} border overflow-hidden transition-all duration-300 hover:border-primary/50 flex flex-col justify-between p-4 rounded-3xl shadow-lg`}>
                    
                    {/* Background scene / glow effects */}
                    <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
                      {section.bgImage ? (
                        <Image 
                          src={section.bgImage} 
                          alt={section.title}
                          fill
                          sizes="(max-width: 768px) 150px, 200px"
                          className="object-cover opacity-20 group-hover:opacity-35 group-hover:scale-105 transition-all duration-700"
                        />
                      ) : isSoon ? (
                        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-zinc-900 to-black" />
                      ) : null}
                      <div className={`absolute inset-0 bg-gradient-to-t ${section.color} opacity-40 group-hover:opacity-60 transition-opacity`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>
                    
                    {/* Floating Ghibli Character Illustration (Cozy & Bright) */}
                    {section.charImage && (
                      <div className="absolute right-1 bottom-1 w-24 h-24 xs:w-[100px] xs:h-[100px] z-10 pointer-events-none transition-all duration-500 transform group-hover:scale-110 group-hover:-translate-y-1.5 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)]">
                        <Image 
                          src={section.charImage} 
                          alt={section.title}
                          fill
                          sizes="100px"
                          className="object-contain"
                          priority
                        />
                      </div>
                    )}

                    {/* Top: Premium Floating Icon (Glassmorphic) */}
                    <div className="relative z-20 self-start">
                      <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:bg-primary/20 group-hover:border-primary/40 transition-colors">
                        {React.cloneElement(section.icon as React.ReactElement, { className: 'w-4 h-4 text-white group-hover:text-primary transition-colors shrink-0' })}
                      </div>
                    </div>

                    {/* Bottom: Text Info */}
                    <div className={`relative z-20 text-left mt-auto space-y-0.5 ${section.charImage ? 'max-w-[70%]' : 'max-w-full'}`}>
                      <span className="text-[8px] font-black uppercase tracking-widest text-primary block leading-none">
                        {shortTag}
                      </span>
                      <h3 className="text-[13px] xs:text-sm font-black text-white group-hover:text-primary transition-colors leading-tight break-keep">
                        {section.title}
                      </h3>
                      <div className="flex items-center gap-0.5 text-white/50 group-hover:text-primary text-[8px] sm:text-[9px] font-bold transition-colors pt-0.5">
                        <span>{isSoon ? 'COMING' : 'GO'}</span>
                        <ArrowRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Main Portal Navigation (Visible only on Desktop) */}
      <section className="hidden lg:block container mx-auto px-4 md:px-6 pb-16 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {portalSections.map((section, idx) => {
            const isSoon = 'isComingSoon' in section && section.isComingSoon;

            const cardBg = section.title === '회복 갤러리' ? 'from-purple-500/15 via-indigo-500/10 to-surface border-purple-500/25' :
                           section.title === '치유의 여정' ? 'from-emerald-500/15 via-teal-500/10 to-surface border-emerald-500/25' :
                           section.title === '회복의 도구' ? 'from-blue-500/15 via-cyan-500/10 to-surface border-blue-500/25' :
                                                             'from-amber-500/15 via-orange-500/10 to-surface border-amber-500/25';

            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
              >
                <Link 
                  href={section.link} 
                  className={`group block h-full ${isSoon ? 'cursor-not-allowed' : ''}`}
                  onClick={(e) => {
                    if (isSoon) {
                      e.preventDefault();
                      alert('새로운 회복 서비스가 준비 중입니다. 곧 찾아뵙겠습니다!');
                      return;
                    }
                    if (section.title === '치유의 여정') {
                      handleProtectedClick(e);
                    }
                  }}
                >
                  <Card className={`relative aspect-[4/5] bg-gradient-to-br ${cardBg} border-line border overflow-hidden transition-all duration-500 hover:border-primary/50 group-hover:shadow-[0_0_50px_-12px_rgba(var(--primary-rgb),0.3)] rounded-[32px]`}>
                    
                    {/* Background scene / glow effects */}
                    <div className="absolute inset-0 z-0">
                      {section.bgImage ? (
                        <Image 
                          src={section.bgImage} 
                          alt={section.title}
                          fill
                          sizes="(max-width: 1200px) 150px, 300px"
                          className="object-cover opacity-20 group-hover:opacity-35 group-hover:scale-105 transition-all duration-700"
                        />
                      ) : isSoon ? (
                        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-zinc-900 to-black z-0" />
                      ) : null}
                      <div className={`absolute inset-0 bg-gradient-to-t ${section.color} group-hover:opacity-60 transition-opacity`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                    </div>

                    {/* Floating Ghibli Character Illustration (Cozy & Bright) */}
                    {section.charImage && (
                      <div className="absolute right-4 bottom-4 w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 z-10 pointer-events-none transition-all duration-700 transform group-hover:scale-110 group-hover:-translate-y-3 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]">
                        <Image 
                          src={section.charImage} 
                          alt={section.title}
                          fill
                          sizes="(max-width: 1200px) 150px, 200px"
                          className="object-contain"
                          priority
                        />
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-8 pt-12 md:pt-20 bg-gradient-to-t from-surface via-surface/40 to-transparent z-20">
                      <div className="flex items-center gap-2 md:gap-3 text-primary mb-2 md:mb-3">
                        {React.cloneElement(section.icon as React.ReactElement, { className: 'w-5 h-5 md:w-6 md:h-6' })}
                        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">{section.subtitle}</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-white mb-2 md:mb-4 group-hover:text-primary transition-colors">{section.title}</h3>
                      <p className={`text-gray-400 text-[13px] md:text-sm leading-relaxed mb-4 md:mb-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 line-clamp-2 md:line-clamp-none ${section.charImage ? 'max-w-[75%]' : 'max-w-full'}`}>
                        {section.description}
                      </p>
                      <div className="flex items-center gap-2 text-primary text-[13px] md:text-sm font-bold opacity-60 group-hover:opacity-100 transition-all">
                        {isSoon ? 'COMING SOON' : '자세히 보기'} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

    </ChapterWrapper>
  );
}
