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
    { label: 'Youniqle?', href: '/about', desc: '브랜드 및 회복 경로 소개' },
    { label: '진단', href: '/ai-navigator', desc: '맞춤 회복 루틴 안내' },
    { label: '대시보드', href: '/dashboard', desc: '나의 회복 현황 대시보드' },
    { label: '힐링 라운지', href: '/products', desc: '프리미엄 회복 공간 및 프로그램' },
    { label: '파트너', href: '/partners', desc: '협업 및 제휴 안내' },
    ...(session?.user?.isNavigator ? [{ label: '네비게이터', href: '/navigator', desc: '네비게이터 전용 공간' }] : []),
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
    <header className={`fixed top-0 left-0 right-0 z-50 w-full border-b border-line transition-all duration-300 ${
      isMenuOpen ? 'bg-background shadow-xl' : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80'
    }`}>
      <div className="container mx-auto px-3 md:px-4">
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
              setIsMenuOpen(false);
            }}
          >
            <div className="relative h-8 w-8 md:h-10 md:w-10 transition-transform duration-300 group-hover:scale-105">
              <CharacterImage
                src="/character/youniqle-1.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-lg md:text-xl font-serif-display text-text-primary tracking-tight">Youniqle</span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => {
              const isActive = pathname?.startsWith(item.href) || false;
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
                </div>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-1 md:space-x-2">
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

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-6 max-h-[85vh] overflow-y-auto bg-background animate-in slide-in-from-top-4 duration-300">
            <nav className="flex flex-col space-y-6 px-4">
              {menuItems.map((item) => (
                <div key={item.label} className="flex flex-col space-y-1">
                  <Link
                    href={item.href}
                    className="flex flex-col gap-1 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-lg font-black text-text-primary group-active:text-primary transition-colors">
                      {item.label}
                    </span>
                    <span className="text-[11px] font-medium text-text-secondary opacity-70">
                      {item.desc}
                    </span>
                  </Link>
                  <div className="h-px bg-line/10 w-full mt-2" />
                </div>
              ))}
              {!session && (
                <Link href="/auth/signin" className="group flex flex-col gap-1" onClick={() => setIsMenuOpen(false)}>
                  <span className="text-lg font-black text-primary">로그인</span>
                  <span className="text-[11px] font-medium text-text-secondary opacity-70">회원 서비스 이용을 위한 로그인</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
