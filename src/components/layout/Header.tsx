'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CharacterImage from '@/components/ui/CharacterImage';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Header() {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // 세션 상태 확인 (최초 1회만)
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          setSession(data.user ? data : null);
          
          // 로그인된 경우 장바구니 개수 가져오기 (최초 1회만)
          if (data.user) {
            fetchCartCount();
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // 장바구니 업데이트 이벤트 리스너 (사용자 액션 시에만 동작)
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []); // session 의존성 제거 - 최초 1회만 실행

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.cart?.totalItems || 0);
      }
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSession(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative h-10 w-10">
              <CharacterImage
                src="/character/youniqle-1.png"
                alt="Youniqle 로고"
                fill
                className="object-contain"
                priority
                sizes="40px"
              />
            </div>
            <span className="text-xl font-bold text-text-primary">Youniqle</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-text-primary hover:text-primary transition-colors">
              {t('nav.products')}
            </Link>
            <Link href="/content" className="text-text-primary hover:text-primary transition-colors">
              {t('nav.content')}
            </Link>
            <Link href="/about" className="text-text-primary hover:text-primary transition-colors">
              {t('nav.about')}
            </Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder={t('products.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Cart */}
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </Badge>
                )}
                <span className="sr-only">{t('nav.cart')}</span>
              </Link>
            </Button>

            {/* Auth Buttons */}
            {loading ? (
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/me">
                    <User className="h-5 w-5" />
                    <span className="sr-only">{t('nav.myPage')}</span>
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin">
                    {t('nav.login')}
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">
                    {t('nav.signup')}
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden z-50 relative"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/products" className="text-text-primary hover:text-primary transition-colors">
                {t('nav.products')}
              </Link>
              <Link href="/content" className="text-text-primary hover:text-primary transition-colors">
                {t('nav.content')}
              </Link>
              <Link href="/about" className="text-text-primary hover:text-primary transition-colors">
                {t('nav.about')}
              </Link>
              
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder={t('products.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4"
                  />
                </div>
              </form>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

