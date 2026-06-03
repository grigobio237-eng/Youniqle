'use client';

import React, { useState } from 'react';
import CommunityBoard from '@/components/community/CommunityBoard';
import CommunityPostForm from '@/components/community/CommunityPostForm';
import CommunityPostDetail from '@/components/community/CommunityPostDetail';
import { AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';

export default function UserLoungePage() {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-chapter-accent/10 text-chapter-accent text-xs font-black uppercase tracking-widest mb-4">
            User Lounge
          </div>
          <h1 className="font-serif text-obsidian tracking-tight mb-4 text-4xl md:text-4xl">
            우리들의 <span className="italic">라운지</span>
          </h1>
          <p className="text-slate/60 text-lg">
            회복의 경험을 나누고 서로의 내일을 응원하는 따뜻한 공간입니다.
          </p>
        </div>

        {/* Board Area */}
        <div className="bg-white border border-line rounded-[40px] p-8 md:p-12 min-h-[600px] shadow-sm">
          <CommunityBoard 
            key={refreshKey}
            onPostSelect={setSelectedPostId}
            onPostCreate={() => {
              setEditingPostId(undefined);
              setIsFormOpen(true);
            }}
          />
        </div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {isFormOpen && (
          <CommunityPostForm 
            postId={editingPostId}
            onClose={() => setIsFormOpen(false)}
            onSuccess={handleRefresh}
          />
        )}
        {selectedPostId && (
          <CommunityPostDetail 
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
