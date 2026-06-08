'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home, User, ShoppingBag, Heart, Shield, MessageCircle } from 'lucide-react';

const SITEMAP_DATA = [
  {
    title: '서비스 소개',
    icon: <Home className="w-5 h-5" />,
    links: [
      { name: '홈', href: '/' },
      { name: '유니클 소개', href: '/about' },
      { name: '시작하기', href: '/start' },
      { name: '창립 멤버 패스', href: '/founder-pass' },
    ]
  },
  {
    title: '회복 솔루션',
    icon: <Heart className="w-5 h-5" />,
    links: [
      { name: '유니클 리듬체크', href: '/diagnosis' },
      { name: '유니클 내비게이터', href: '/ai-navigator' },
      { name: '유니클 어드바이스', href: '/ai-advice' },
      { name: '힐링 센터', href: '/healing-center' },
      { name: '딥 사운드 테라피', href: '/therapy' },
    ]
  },
  {
    title: '커뮤니티 & 활동',
    icon: <MessageCircle className="w-5 h-5" />,
    links: [
      { name: '커뮤니티', href: '/community' },
      { name: '갤러리', href: '/gallery/artworks' },
      { name: '성공 사례', href: '/cases' },
      { name: '라운지', href: '/lounge' },
      { name: '트레이너', href: '/trainer' },
    ]
  },
  {
    title: '유니클 스토어',
    icon: <ShoppingBag className="w-5 h-5" />,
    links: [
      { name: '전체 상품', href: '/products/shop' },
      { name: '멤버십 안내', href: '/membership' },
      { name: '장바구니', href: '/cart' },
      { name: '쿠폰함', href: '/coupons' },
    ]
  },
  {
    title: '마이페이지',
    icon: <User className="w-5 h-5" />,
    links: [
      { name: '내 대시보드', href: '/me' },
      { name: '주문 내역', href: '/me/history' },
      { name: '포인트 관리', href: '/me/points' },
      { name: '배송지 관리', href: '/me/addresses' },
      { name: '회원 정보 수정', href: '/me/settings' },
    ]
  },
  {
    title: '고객 지원 & 정책',
    icon: <Shield className="w-5 h-5" />,
    links: [
      { name: '공지사항', href: '/notices' },
      { name: '자주 묻는 질문(FAQ)', href: '/faq' },
      { name: '1:1 문의', href: '/support/inquiry' },
      { name: '이용약관', href: '/terms' },
      { name: '개인정보처리방침', href: '/privacy' },
    ]
  }
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header Section */}
      <div className="bg-obsidian pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-black text-white tracking-tight mb-4 text-4xl md:text-4xl">
            사이트맵
          </h1>
          <p className="text-foreground/70 text-lg max-w-2xl font-medium leading-relaxed">
            Youniqle의 모든 서비스와 정보를 한눈에 확인하고<br />
            원하는 페이지로 빠르게 이동하실 수 있습니다.
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-6xl mx-auto px-6 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SITEMAP_DATA.map((section, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-line/10 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-obsidian flex items-center justify-center text-white shadow-lg shadow-obsidian/10">
                  {section.icon}
                </div>
                <h2 className="font-bold text-obsidian tracking-tight text-xl">
                  {section.title}
                </h2>
              </div>
              <ul className="space-y-4">
                {section.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link 
                      href={link.href}
                      className="flex items-center justify-between group/link text-foreground/70 hover:text-obsidian transition-colors py-1"
                    >
                      <span className="text-sm font-medium tracking-tight">{link.name}</span>
                      <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-chapter-accent" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-6xl mx-auto px-6 mt-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface rounded-full text-xs text-foreground/70 font-medium border border-line">
          찾으시는 페이지가 없나요? <Link href="/support/inquiry" className="text-chapter-accent font-bold">고객센터</Link>에 문의해 주세요.
        </div>
      </div>
    </div>
  );
}
