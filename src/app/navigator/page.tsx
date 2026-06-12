'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, MessageCircle, Users, ChevronRight, Lock, Plus, CreditCard, Presentation, Building2, ChevronDown, Sparkles, Share2 } from 'lucide-react';
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
      id: 'navigator-guide',
      label: '네비게이터 사용설명서',
      icon: BookOpen,
      desc: '네비게이터 라운지의 핵심 메뉴 및 도구 활용 가이드',
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
      label: '조직 및 리드 관리',
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
      case 'hotline': return <HotlineChat />;
      case 'archive': return <ArchiveContent />;
      case 'catalog': return <PassCatalog />;
      case 'shops': return <ShopManagement />;
      case 'consultations': return <ConsultationList />;
      case 'navigator-guide': return <NavigatorGuideContent />;
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
          <h1 className="font-serif text-obsidian tracking-tight mb-4 text-4xl md:text-4xl">
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
                      <Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/auth/signup?ref=${(session.user as any).referralCode || (session.user.id.slice(-6).toUpperCase())}&callbackUrl=/navigator/passes/black`)}`}
                        alt="QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      const link = `${window.location.origin}/auth/signup?ref=${(session.user as any).referralCode || (session.user.id.slice(-6).toUpperCase())}&callbackUrl=/navigator/passes/black`;
                      if (navigator.share) {
                        try {
                          await navigator.share({
                            title: 'Youniqle 네비게이터 초대',
                            text: 'Youniqle 프리미엄 멤버십에 초대합니다.',
                            url: link,
                          });
                        } catch (err) {
                          console.error('Failed to share:', err);
                        }
                      } else {
                        try {
                          await navigator.clipboard.writeText(link);
                          alert('네비게이터 전용 초대 링크가 복사되었습니다.');
                        } catch (err) {
                          console.error('Failed to copy text:', err);
                        }
                      }
                    }}
                    className="w-full py-4 bg-white text-obsidian rounded-xl font-black text-sm hover:bg-primary transition-all flex items-center justify-center gap-2 group"
                  >
                    공유하기
                    <Share2 className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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

function NavigatorGuideContent() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto py-8">
      {/* Introduction */}
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-3xl font-black text-obsidian tracking-tight">네비게이터 100% 활용 가이드</h2>
        <p className="text-slate/70 font-medium text-lg">성공적인 네비게이터 활동을 위한 라운지 메뉴별 핵심 사용법을 안내합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Feature 1 */}
        <div className="bg-mist/30 p-8 rounded-[32px] border border-line hover:border-chapter-accent/50 transition-colors group">
          <div className="w-12 h-12 bg-obsidian text-mist rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-obsidian mb-3 group-hover:text-chapter-accent transition-colors">고객 초대 전용 도구</h3>
          <p className="text-slate/70 leading-relaxed font-medium text-sm break-keep">
            화면 상단의 검은색 섹션입니다. <strong className="text-obsidian">초대 링크 복사하기</strong> 버튼을 눌러 발급된 고유 URL을 고객에게 전달하세요. 
            해당 링크로 가입한 고객은 네비게이터님의 리드로 자동 등록되며, 즉시 패스 결제 안내 화면으로 연결됩니다.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-mist/30 p-8 rounded-[32px] border border-line hover:border-chapter-accent/50 transition-colors group">
          <div className="w-12 h-12 bg-obsidian text-mist rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-obsidian mb-3 group-hover:text-chapter-accent transition-colors">조직 및 리드 관리</h3>
          <p className="text-slate/70 leading-relaxed font-medium text-sm break-keep">
            초대 링크를 통해 유입된 고객 명단과 등록된 산하 조직(업체)의 현황을 파악하는 대시보드입니다. 
            고객별 설문 완료 여부 및 마케팅 진행 단계를 체계적으로 관리하여 영업 효율을 극대화하세요.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-mist/30 p-8 rounded-[32px] border border-line hover:border-chapter-accent/50 transition-colors group">
          <div className="w-12 h-12 bg-obsidian text-mist rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Presentation className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-obsidian mb-3 group-hover:text-chapter-accent transition-colors">상품 프리젠테이션</h3>
          <p className="text-slate/70 leading-relaxed font-medium text-sm break-keep">
            유니클의 핵심 패스 상품을 현장에서 바로 고객에게 설명할 수 있는 영업용 브로슈어입니다. 
            태블릿이나 스마트폰으로 고객과 마주보며 효과적으로 세일즈하기에 최적화되어 있습니다.
          </p>
        </div>

        {/* Feature 4 */}
        <div className="bg-mist/30 p-8 rounded-[32px] border border-line hover:border-chapter-accent/50 transition-colors group">
          <div className="w-12 h-12 bg-obsidian text-mist rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-obsidian mb-3 group-hover:text-chapter-accent transition-colors">상담 요청 현황</h3>
          <p className="text-slate/70 leading-relaxed font-medium text-sm break-keep">
            고객들이 보내온 상담 티켓과 문의 내역을 모아보고 응대하는 관리 메뉴입니다.
            고객의 요구사항에 빠르게 대응하고, 맞춤형 컨설팅을 제공하여 신뢰를 구축할 수 있습니다.
          </p>
        </div>

        {/* Feature 5 */}
        <div className="bg-mist/30 p-8 rounded-[32px] border border-line hover:border-chapter-accent/50 transition-colors group">
          <div className="w-12 h-12 bg-obsidian text-mist rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-obsidian mb-3 group-hover:text-chapter-accent transition-colors">자문위 핫라인 & 커뮤니티</h3>
          <p className="text-slate/70 leading-relaxed font-medium text-sm break-keep">
            의학적 전문 지식이나 본사 지원이 필요할 때 <strong className="text-obsidian">자문위 핫라인</strong>으로 소통하세요. 
            또한 <strong className="text-obsidian">커뮤니티</strong>에서 전국 네비게이터들과 성공 사례, 영업 노하우를 교류할 수 있습니다.
          </p>
        </div>

        {/* Feature 6 */}
        <div className="bg-mist/30 p-8 rounded-[32px] border border-line hover:border-chapter-accent/50 transition-colors group">
          <div className="w-12 h-12 bg-obsidian text-mist rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-obsidian mb-3 group-hover:text-chapter-accent transition-colors">네비게이터의 역할</h3>
          <p className="text-slate/70 leading-relaxed font-medium text-sm break-keep">
            줄기세포 시술에 대한 필수 기초 상식과 자료를 모아둔 아카이브입니다.
            최신 의료 트렌드와 유니클 서비스의 핵심 가치를 학습하여 전문가로서의 역량을 강화하세요.
          </p>
        </div>
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
