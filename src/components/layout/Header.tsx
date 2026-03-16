'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, Menu, X, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CharacterImage from '@/components/ui/CharacterImage';
import { motion } from 'framer-motion';

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // Gate Logic
  const [isGateMode, setIsGateMode] = useState(false);

  useEffect(() => {
    if (pathname === '/') {
      const today = new Date().toISOString().split('T')[0];
      const lastCheck = localStorage.getItem('recovery_last_check');
      if (lastCheck !== today) {
        setIsGateMode(true);
      } else {
        setIsGateMode(false);
      }
    } else {
      setIsGateMode(false);
    }
  }, [pathname]);

  useEffect(() => {
    const handleGatePass = () => setIsGateMode(false);
    window.addEventListener('recovery-gate-passed', handleGatePass);
    return () => window.removeEventListener('recovery-gate-passed', handleGatePass);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      if (!isMounted) return;
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          if (data.user && isMounted) {
            setSession(data);
            fetchCartCount();
          } else {
            setSession(null);
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkSession();

    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.cart?.totalItems || 0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const menuItems = [
    { 
      label: 'Youniqle 갤러리', 
      href: '/gallery/artworks',
      desc: '작품 및 작가 소개',
      subItems: [
        { label: '작품 갤러리', href: '/gallery/artworks' },
        { label: '참여 작가', href: '/gallery/artists' },
      ]
    },
    { label: 'Youniqle 스토어', href: '/products', desc: '회복 관련 제품' },
    { label: 'Youniqle 트레이너', href: '/trainer', desc: '전문 코칭 서비스' },
    { label: '네비게이터', href: '/ai-navigator', desc: '맞춤 회복 루틴 안내' },
    { label: '힐링센터', href: '/healing-center', desc: '가상 공간 탐험 및 명상' },
    { 
      label: '커뮤니티', 
      href: '/community/lounge',
      desc: '유저 소통 공간',
      subItems: [
        { label: '유저 라운지', href: '/community/lounge' },
        { label: '미디어 쉐어', href: '/community/media' },
        { label: '리커버리 툴스', href: '/utils' },
      ]
    },
    { label: 'Youniqle ?', href: '/about', desc: '브랜드 및 정책 안내' },
  ];

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      localStorage.clear();
      window.location.href = '/';
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 group"
            onClick={(e) => {
              // If already checked in today, force refresh/navigation to clear gate state if necessary
              if (typeof window !== 'undefined') {
                const today = new Date().toISOString().split('T')[0];
                if (localStorage.getItem('recovery_last_check') === today) {
                  window.dispatchEvent(new Event('recovery-gate-passed'));
                }
              }
            }}
          >
            <div className="relative h-10 w-10 transition-transform duration-300 group-hover:scale-105">
              <CharacterImage
                src="/character/youniqle-1.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-serif-display text-text-primary tracking-tight">Youniqle</span>
          </Link>

          {/* Nav */}
          {!isGateMode ? (
            <nav className="hidden md:flex items-center space-x-6">
              {menuItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <div key={item.label} className="relative group">
                    <Link
                      href={item.href}
                      className={`text-sm font-semibold transition-all duration-200 relative py-2 ${
                        isActive ? 'text-primary' : 'text-text-secondary hover:text-primary'
                      }`}
                    >
                      {item.label}
                      {isActive && (
                        <motion.div
                          layoutId="nav-underline"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </Link>
                    {item.subItems && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-line rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className="block px-4 py-3 text-sm text-text-secondary hover:bg-mist hover:text-primary font-medium transition-colors"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          ) : (
            <div className="hidden md:block">
              <span className="text-xs font-black text-chapter-accent/40 uppercase tracking-[0.3em]">
                Daily Recovery Checkpoint
              </span>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center space-x-2">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {session ? (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/me"><User className="h-5 w-5" /></Link>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/signin">로그인</Link>
              </Button>
            )}

            {!isGateMode && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {!isGateMode && isMenuOpen && (
          <div className="md:hidden border-t py-4 max-h-[80vh] overflow-y-auto">
            <nav className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                <div key={item.label} className="flex flex-col space-y-2">
                  <Link
                    href={item.href}
                    className="text-sm font-bold text-text-secondary px-4 py-2 bg-mist/30 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.subItems && (
                    <div className="pl-8 flex flex-col space-y-2 border-l-2 border-line ml-6">
                      {item.subItems.map(sub => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="text-xs font-semibold text-text-secondary py-1"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {!session && (
                <Link href="/auth/signin" className="text-sm font-bold text-primary px-4 mt-4" onClick={() => setIsMenuOpen(false)}>
                  로그인
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

