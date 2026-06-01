'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, MessageCircle, Users, ChevronRight, Lock, Plus, CreditCard, Presentation, Building2, ChevronDown, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import PassCatalog from '@/components/navigator/PassCatalog';
import SquareBoard from '@/components/navigator/SquareBoard';
import SquarePostForm from '@/components/navigator/SquarePostForm';
import SquarePostDetail from '@/components/navigator/SquarePostDetail';
import HotlineChat from '@/components/navigator/HotlineChat';
import ArchiveContent from '@/components/navigator/ArchiveContent';
import PassOperationGuide from '@/components/navigator/PassOperationGuide';
import ShopManagement from '@/components/navigator/ShopManagement';
import ConsultationList from '@/components/navigator/ConsultationList';


function NavigatorLoungeContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string | null>('archive');
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab && ['archive', 'policy', 'square', 'hotline', 'catalog', 'shops', 'consultations'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
  // Square State
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      // @ts-ignore
      if (!session?.user?.isNavigator) {
        router.push('/');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mist">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // @ts-ignore
  if (!session?.user?.isNavigator) {
    return null; // Will redirect in useEffect
  }

  const tabs = [
    {
      id: 'archive',
      label: '네비게이터의 역할',
      icon: BookOpen,
      desc: '줄기세포 시술에 대한 필수 기초 상식과 자료',
    },
    {
      id: 'policy',
      label: '패스 운영 가이드',
      icon: CreditCard,
      desc: 'START/SIGNATURE/BLACK 패스 상품 및 정책',
    },
    {
      id: 'black-pass-guide',
      label: 'Black Pass 사용설명서',
      icon: Sparkles,
      desc: '블랙 패스의 핵심 기능 및 프리미엄 혜택 활용 가이드',
    },
    {
      id: 'square',
      label: '커뮤니티',
      icon: Users,
      desc: '현장 네비게이터 간의 노하우 공유 및 소통',
    },
    {
      id: 'hotline',
      label: '자문위 핫라인',
      icon: MessageCircle,
      desc: '의료 자문단 및 본사 관리자와의 실시간 채널',
    },
    {
      id: 'catalog',
      label: '상품 프리젠테이션',
      icon: Presentation,
      desc: '고객에게 패스 상품을 제안하고 설명하는 공간',
    },
    {
      id: 'shops',
      label: '업소 및 리드 관리',
      icon: Building2,
      desc: '등록한 업체별 설문 리드 현황 및 마케팅 관리',
    },
    {
      id: 'consultations',
      label: '상담 요청 현황',
      icon: MessageCircle,
      desc: '고객들이 직접 보낸 상담 티켓 및 응대 관리',
    },
  ] as const;


  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case 'square': return <SquareBoard key={`board-${refreshKey}`} onPostSelect={setSelectedPostId} onPostCreate={() => { setEditingPostId(undefined); setIsFormOpen(true); }} />;
      case 'policy': return <PassOperationGuide />;
      case 'hotline': return <HotlineChat />;
      case 'archive': return <ArchiveContent />;
      case 'catalog': return <PassCatalog />;
      case 'shops': return <ShopManagement />;
      case 'consultations': return <ConsultationList />;
      case 'black-pass-guide': return <BlackPassGuideContent />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-6 md:pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-chapter-accent/10 text-chapter-accent text-xs font-black uppercase tracking-widest mb-4">
            <Lock className="w-3 h-3" />
            Navigator Only
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-obsidian tracking-tight mb-4">
            Navigator <span className="italic">Lounge</span>
          </h1>
          <p className="text-slate/60 text-lg">
            유니클 네비게이터들을 위한 특별한 소통 공간입니다. 필요한 지식을 얻고, 자문단과 소통하세요.
          </p>
        </div>

        {/* Tab Navigation (Sticky) */}
        <div className="sticky top-[112px] md:top-[120px] z-40 bg-[#FDFBF7]/95 backdrop-blur-md py-3 md:py-4 mb-6 md:mb-8 -mx-4 px-4 md:mx-0 md:px-0 border-b border-line/20 shadow-sm transition-all">
          <div className="flex flex-wrap gap-2 md:gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-full font-bold text-sm md:text-base transition-all border ${
                    isActive
                      ? 'bg-obsidian border-obsidian text-mist shadow-md scale-105'
                      : 'bg-white border-line text-slate hover:border-chapter-accent/50 hover:bg-mist/30'
                  }`}
                >
                  <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'text-mist' : 'text-slate/60'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigator Toolkit */}
        <div className="mb-12">
          <div className="bg-obsidian rounded-[40px] p-8 md:p-10 text-mist relative overflow-hidden shadow-2xl">
            {/* Background Decorative Gradient */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-chapter-accent/20 rounded-full blur-[120px] -mr-64 -mt-64" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-chapter-accent text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                  <Plus className="w-3 h-3" /> Navigator Assets
                </div>
                <h2 className="text-3xl font-black tracking-tight">고객 초대 전용 도구</h2>
                <p className="text-mist/60 font-medium max-w-md">
                  네비게이터님만의 고유 링크를 통해 고객을 초대하세요. 가입 즉시 블랙 패스 결제 안내로 연결됩니다.
                </p>
              </div>

              <div className="w-full md:w-auto space-y-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between gap-6 mb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-mist/40 mb-1">My Referral Code</p>
                      <p className="text-2xl font-black text-chapter-accent">{(session.user as any).referralCode || (session.user.id.slice(-6).toUpperCase())}</p>
                    </div>
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2 shadow-inner">
                      {/* Placeholder for QR code component if needed, or just an icon */}
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/auth/signup?ref=${(session.user as any).referralCode || (session.user.id.slice(-6).toUpperCase())}&callbackUrl=/navigator/passes/black`)}`}
                        alt="QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const link = `${window.location.origin}/auth/signup?ref=${(session.user as any).referralCode || (session.user.id.slice(-6).toUpperCase())}&callbackUrl=/navigator/passes/black`;
                      navigator.clipboard.writeText(link);
                      alert('네비게이터 전용 초대 링크가 복사되었습니다.');
                    }}
                    className="w-full py-4 bg-chapter-accent text-obsidian rounded-xl font-black text-sm hover:bg-white transition-all flex items-center justify-center gap-2 group"
                  >
                    초대 링크 복사하기
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Tab Content Area (Unified for Mobile & Desktop) */}
        <div ref={contentRef} className="bg-white border border-line rounded-[32px] md:rounded-[40px] p-3.5 sm:p-6 md:p-12 min-h-[600px] shadow-sm relative overflow-hidden mb-12">
          {activeTab ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {/* Selected Tab Info Header */}
                <div className="mb-8 pb-6 border-b border-line">
                  <div className="flex items-center gap-3 mb-2">
                    {(() => {
                      const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon || BookOpen;
                      return <ActiveIcon className="w-6 h-6 text-chapter-accent" />;
                    })()}
                    <h2 className="text-2xl font-black text-obsidian">
                      {tabs.find(t => t.id === activeTab)?.label}
                    </h2>
                  </div>
                  <p className="text-slate/70 font-medium">
                    {tabs.find(t => t.id === activeTab)?.desc}
                  </p>
                </div>
                
                {renderTabContent(activeTab)}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-slate/40">
              <BookOpen className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-medium text-lg">상단 탭을 선택하여 메뉴를 확인하세요.</p>
            </div>
          )}
        </div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {isFormOpen && (
          <SquarePostForm 
            postId={editingPostId}
            onClose={() => setIsFormOpen(false)}
            onSuccess={handleRefresh}
          />
        )}
        {selectedPostId && (
          <SquarePostDetail 
            postId={selectedPostId}
            onClose={() => setSelectedPostId(null)}
            onEdit={(id) => {
              setEditingPostId(id);
              setIsFormOpen(true);
            }}
            onDeleteSuccess={handleRefresh}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BlackPassGuideContent() {
  return (
    <div className="space-y-12 max-w-3xl mx-auto py-4">
      {/* Step 1 */}
      <div className="space-y-6 group">
        <div className="relative aspect-video rounded-[32px] overflow-hidden shadow-2xl border border-line bg-mist flex items-center justify-center">
          <Image 
            src="/images/guide/black-pass-guide-1.png" 
            alt="전용 QR 코드로 스마트한 진료 연동" 
            fill 
            className="object-contain p-6 transition-transform duration-700 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
        <div className="space-y-3 px-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-chapter-accent flex items-center justify-center text-obsidian font-black text-xs">01</span>
            <h3 className="text-2xl font-black text-obsidian">스마트한 진료 데이터 연동</h3>
          </div>
          <p className="text-slate/70 leading-relaxed font-medium break-keep">
            블랙 패스 허브 상단의 <strong className="text-obsidian font-black">'진료 전용 QR'</strong>을 파트너 클리닉에 제시하세요. 
            번거로운 문진 과정 없이 당신의 정밀 회복 데이터가 의료진에게 즉시 전달되어 개인화된 처방을 받을 수 있습니다.
          </p>
        </div>
      </div>

      {/* Step 2 */}
      <div className="space-y-6 group">
        <div className="relative aspect-video rounded-[32px] overflow-hidden shadow-2xl border border-line bg-mist flex items-center justify-center">
          <Image 
            src="/images/guide/black-pass-guide-2.png" 
            alt="영구적인 데이터 자산 관리" 
            fill 
            className="object-contain p-6 transition-transform duration-700 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
        <div className="space-y-3 px-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-chapter-accent flex items-center justify-center text-obsidian font-black text-xs">02</span>
            <h3 className="text-2xl font-black text-obsidian">영구적인 데이터 자산 관리</h3>
          </div>
          <p className="text-slate/70 leading-relaxed font-medium break-keep">
            <strong className="text-obsidian font-black">'나의 데이터 자산'</strong> 메뉴에서 당신의 모든 진단 기록과 회복 히스토리를 영구적으로 보관하세요. 
            주간 정밀 분석 리포트를 통해 시간이 지남에 따라 변화하는 회복의 궤적을 데이터로 증명할 수 있습니다.
          </p>
        </div>
      </div>

      {/* Step 3 */}
      <div className="space-y-6 group">
        <div className="relative aspect-[4/5] max-w-sm mx-auto rounded-[32px] overflow-hidden shadow-2xl border border-line bg-mist flex items-center justify-center">
          <Image 
            src="/images/guide/black-pass-guide-3.png" 
            alt="클리닉 전용 정밀 케어 시스템" 
            fill 
            className="object-contain p-6 transition-transform duration-700 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
        <div className="space-y-3 px-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-chapter-accent flex items-center justify-center text-obsidian font-black text-xs">03</span>
            <h3 className="text-2xl font-black text-obsidian">클리닉 전용 정밀 케어 시스템</h3>
          </div>
          <p className="text-slate/70 leading-relaxed font-medium break-keep">
            블랙 패스 허브의 <strong className="text-obsidian font-black">'병원 방문 전 정밀 문진'</strong>을 통해 최적의 시술 결과를 먼저 설계하세요. 
            클리닉 현장에서 QR을 제시하여 데이터를 연동하고, 귀가 후에는 <strong className="text-obsidian font-black">'시술/수술 후 맞춤 케어'</strong>를 통해 현재의 상태 분석 및 실시간 회복 관리를 받을 수 있습니다.
          </p>
        </div>
      </div>

      <div className="pt-10">
        <Button asChild className="w-full h-16 rounded-[24px] bg-obsidian text-mist font-black text-lg shadow-2xl shadow-obsidian/20 hover:scale-[1.02] transition-transform">
          <Link href="/black-pass">블랙 패스 허브로 이동하기</Link>
        </Button>
      </div>
    </div>
  );
}

export default function NavigatorLounge() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-mist">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <NavigatorLoungeContent />
    </Suspense>
  );
}
