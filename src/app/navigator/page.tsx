'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, MessageCircle, Users, ChevronRight, Lock, Plus } from 'lucide-react';
import SquareBoard from '@/components/navigator/SquareBoard';
import SquarePostForm from '@/components/navigator/SquarePostForm';
import SquarePostDetail from '@/components/navigator/SquarePostDetail';
import HotlineChat from '@/components/navigator/HotlineChat';
import ArchiveContent from '@/components/navigator/ArchiveContent';

export default function NavigatorLounge() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'archive' | 'hotline' | 'square'>('archive');
  
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
      id: 'hotline',
      label: '자문위 핫라인',
      icon: MessageCircle,
      desc: '의료 자문단 및 본사 관리자와의 실시간 채널',
    },
    {
      id: 'square',
      label: '네비게이터 스퀘어',
      icon: Users,
      desc: '현장 네비게이터 간의 노하우 공유 및 소통',
    },
  ] as const;

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

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

        {/* Tab Navigation */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 text-left p-6 rounded-3xl border transition-all relative overflow-hidden group ${
                  isActive
                    ? 'bg-obsidian border-obsidian text-mist shadow-xl'
                    : 'bg-white border-line hover:border-chapter-accent/50 text-obsidian shadow-sm'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-mist/5 rounded-full blur-3xl -mr-16 -mt-16" />
                )}
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                    isActive ? 'bg-white/10 text-mist' : 'bg-mist text-slate group-hover:text-chapter-accent'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-xl mb-1">{tab.label}</h3>
                  <p className={`text-sm ${isActive ? 'text-mist/60' : 'text-slate/60'}`}>
                    {tab.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="bg-white border border-line rounded-[40px] p-8 md:p-12 min-h-[600px] shadow-sm relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'square' ? (
                <SquareBoard 
                  key={`board-${refreshKey}`}
                  onPostSelect={setSelectedPostId} 
                  onPostCreate={() => {
                    setEditingPostId(undefined);
                    setIsFormOpen(true);
                  }} 
                />
              ) : activeTab === 'hotline' ? (
                <HotlineChat />
              ) : activeTab === 'archive' ? (
                <ArchiveContent />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 bg-mist rounded-full flex items-center justify-center">
                    {/* Placeholder for future tabs */}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
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
