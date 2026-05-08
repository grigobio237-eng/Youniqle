'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, MessageCircle, Users, ChevronRight, Lock, Plus, CreditCard, Presentation, Building2, ChevronDown } from 'lucide-react';

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
      label: '스템셀 아카이브',
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
      id: 'square',
      label: '네비게이터 스퀘어',
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
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="mb-12">
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

        {/* Tab Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <div key={tab.id} className="flex flex-col gap-4">
                <button
                  onClick={() => {
                    if (activeTab === tab.id) {
                      setActiveTab(null);
                    } else {
                      setActiveTab(tab.id);
                      if (isMobile) {
                        setTimeout(() => {
                          const el = document.getElementById(`tab-${tab.id}`);
                          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }
                    }
                  }}
                  id={`tab-${tab.id}`}
                  className={`text-left p-6 rounded-3xl border transition-all relative overflow-hidden group ${
                    isActive
                      ? 'bg-obsidian border-obsidian text-mist shadow-xl scale-[1.02]'
                      : 'bg-white border-line hover:border-chapter-accent/50 text-obsidian shadow-sm'
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-mist/5 rounded-full blur-3xl -mr-16 -mt-16" />
                  )}
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        isActive ? 'bg-white/10 text-mist' : 'bg-mist text-slate group-hover:text-chapter-accent'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      {isMobile && (
                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'rotate-180 text-chapter-accent' : 'text-slate/30'}`} />
                      )}
                    </div>
                    <h3 className="font-black text-xl mb-1">{tab.label}</h3>
                    <p className={`text-[11px] leading-relaxed ${isActive ? 'text-mist/60' : 'text-slate/60'}`}>
                      {tab.desc}
                    </p>
                  </div>
                </button>

                {/* Mobile Accordion Content */}
                <AnimatePresence>
                  {isMobile && isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden bg-white border border-line rounded-[32px] p-6 shadow-lg mb-4"
                    >
                      {renderTabContent(tab.id)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Desktop Tab Content Area */}
        {!isMobile && (
          <div ref={contentRef} className="bg-white border border-line rounded-[40px] p-8 md:p-12 min-h-[600px] shadow-sm relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab && renderTabContent(activeTab)}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
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
