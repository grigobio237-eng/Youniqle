'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageSquare, Video, ArrowRight, Users, Sparkles } from 'lucide-react';

export default function CommunityPortalPage() {
  const portalItems = [
    {
      title: '유저 라운지',
      desc: '자유롭게 소통하고 회복 노하우를 공유하는 소중한 공간',
      href: '/community/lounge',
      icon: MessageSquare,
      color: 'bg-emerald-500',
      badge: 'Active',
    },
    {
      title: '미디어 쉐어',
      desc: '유튜브 쇼츠, 틱톡 등 나만의 회복 스토리를 영상으로 공유',
      href: '/community/media',
      icon: Video,
      color: 'bg-rose-500',
      badge: 'Coming Soon',
    },
    {
      title: '유니클 소통 채널',
      desc: '김미정 원장님(유니클)과 함께하는 1:1 회복 상담 및 소통',
      href: '/chat',
      icon: Sparkles,
      color: 'bg-indigo-500',
      badge: 'New',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-20 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-chapter-accent/10 text-chapter-accent text-xs font-black uppercase tracking-widest"
          >
            <Users className="w-3 h-3" />
            Youniqle Community
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-obsidian tracking-tight text-xl md:text-4xl"
          >
            우리들의 <span className="italic">회복 광장</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-slate/60 text-lg font-medium"
          >
            혼자가 아닙니다. 당신의 경험이 누군가에게는 새로운 에너지가 되고,<br className="hidden md:block" /> 
            타인의 노하우가 당신의 일상을 변화시키는 특별한 커뮤니티입니다.
          </motion.p>
        </div>

        {/* Portal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portalItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
              >
                <Link 
                  href={item.href}
                  className="group block relative bg-white border border-line rounded-[40px] p-10 h-full hover:shadow-2xl hover:border-chapter-accent transition-all duration-500"
                >
                  <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-current/20`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-black text-obsidian">{item.title}</h2>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate/40">{item.badge}</span>
                    </div>
                    <p className="text-slate/60 font-medium leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-12 flex items-center text-obsidian gap-2 font-black text-sm group-hover:gap-4 transition-all">
                    자세히 보기 <ArrowRight className="w-4 h-4" />
                  </div>

                  {/* Glass Reflection */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-12 bg-obsidian rounded-[48px] text-center space-y-8 relative overflow-hidden"
        >
          <div className="relative z-10 space-y-4">
            <h2 className="font-serif text-white tracking-tight text-3xl md:text-4xl">당신의 이야기를 들려주세요</h2>
            <p className="text-mist/40 max-w-xl mx-auto font-medium">따뜻한 말 한마디가 누군가의 오늘을 바꿀 수 있습니다. 지금 바로 라운지에서 대화를 시작해 보세요.</p>
            <div className="pt-4">
              <Link href="/community/lounge">
                <button className="bg-white text-obsidian px-10 h-16 rounded-2xl font-black hover:scale-105 transition-all shadow-xl shadow-white/10">
                  라운지로 이동하기
                </button>
              </Link>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-chapter-accent/20 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-48 -mb-48" />
        </motion.div>
      </div>
    </div>
  );
}
