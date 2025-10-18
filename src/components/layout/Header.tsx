'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CharacterImage from '@/components/ui/CharacterImage';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import RealtimeNotificationCenter from '@/components/notifications/RealtimeNotificationCenter';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Header() {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    
    // 세션 상태 확인 (최초 1회만)
    const checkSession = async () => {
      if (!isMounted) return;
      
      try {
        // NextAuth 세션 확인
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('세션 확인 결과:', data);
          
          // 세션이 있고 사용자 정보가 유효한 경우에만 로그인 상태로 설정
          if (data.user && data.user.email && data.user.name && isMounted) {
            console.log('유효한 세션 확인됨, 로그인 상태 설정');
            setSession(data);
            fetchCartCount();
          } else if (isMounted) {
            console.log('세션이 없거나 유효하지 않음, 로그아웃 상태 설정');
            setSession(null);
            // localStorage 토큰도 확인하여 일관성 유지
            const token = localStorage.getItem('token');
            if (token) {
              console.log('세션은 없지만 토큰이 있음, 토큰 제거');
              localStorage.removeItem('token');
            }
          }
        } else if (isMounted) {
          console.log('세션 확인 API 실패, 로그아웃 상태 설정');
          setSession(null);
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        if (isMounted) {
          setSession(null);
          localStorage.removeItem('token');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkSession();
    
    // 컴포넌트 언마운트 시 플래그 설정
    return () => {
      isMounted = false;
    };

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
      console.log('🚨 완전 로그아웃 시작...');
      
      // 1. 상태 즉시 초기화 (UI에서 먼저 로그아웃 상태로 변경)
      setSession(null);
      setCartCount(0);
      console.log('✅ UI 상태 초기화 완료');
      
      // 2. 모든 저장소 데이터 즉시 정리
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ 모든 저장소 데이터 정리 완료');
      
      // 3. NextAuth 세션 쿠키 특별 처리
      const nextAuthCookies = [
        'next-auth.session-token',
        'next-auth.csrf-token', 
        'next-auth.callback-url',
        '__Secure-next-auth.session-token',
        '__Host-next-auth.csrf-token'
      ];
      
      nextAuthCookies.forEach(cookieName => {
        // 모든 가능한 경로와 도메인에서 쿠키 삭제
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.grigobio.co.kr`;
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.www.grigobio.co.kr`;
      });
      
      // 4. 모든 쿠키 강제 삭제
      const allCookies = document.cookie.split(";");
      allCookies.forEach(function(cookie) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name) {
          // 모든 가능한 경로와 도메인에서 쿠키 삭제
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
        }
      });
      console.log('✅ 모든 쿠키 강제 삭제 완료');
      
      // 5. NextAuth 로그아웃 API 호출 (복구됨)
      try {
        const signoutResponse = await fetch('/api/auth/signout', { 
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (signoutResponse.ok) {
          const signoutData = await signoutResponse.json();
          console.log('NextAuth 로그아웃 응답:', signoutResponse.status, signoutData);
        } else {
          console.error('NextAuth 로그아웃 실패:', signoutResponse.status);
        }
      } catch (signoutError) {
        console.error('NextAuth 로그아웃 실패:', signoutError);
      }
      
      // 6. 커스텀 로그아웃 API 호출
      try {
        const customLogoutResponse = await fetch('/api/auth/logout', { 
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        console.log('커스텀 로그아웃 응답:', customLogoutResponse.status);
      } catch (customError) {
        console.error('커스텀 로그아웃 실패:', customError);
      }
      
      // 7. 추가 대기 시간 (서버 처리 완료 대기)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 8. 추가 쿠키 정리 (NextAuth 특화)
      const nextAuthSessionToken = document.cookie
        .split(';')
        .find(cookie => cookie.trim().startsWith('next-auth.session-token='));
      
      if (nextAuthSessionToken) {
        console.log('⚠️ NextAuth 세션 토큰이 여전히 존재합니다. 강제 삭제 시도...');
        const tokenName = nextAuthSessionToken.split('=')[0].trim();
        // 모든 가능한 경로와 도메인에서 강제 삭제
        document.cookie = `${tokenName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${tokenName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        document.cookie = `${tokenName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
        document.cookie = `${tokenName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.grigobio.co.kr`;
        document.cookie = `${tokenName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.www.grigobio.co.kr`;
        console.log('✅ NextAuth 세션 토큰 강제 삭제 완료');
      }
      
      // 9. 최종 페이지 리다이렉트
      console.log('🔄 최종 페이지 리다이렉트...');
      window.location.replace('/');
      
    } catch (error) {
      console.error('❌ 로그아웃 중 오류:', error);
      // 에러가 발생해도 강제로 로그아웃 처리
      localStorage.clear();
      sessionStorage.clear();
      setSession(null);
      setCartCount(0);
      
      // 모든 쿠키 강제 삭제
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      window.location.replace('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative h-8 w-8 sm:h-10 sm:w-10">
              <CharacterImage
                src="/character/youniqle-1.png"
                alt="Youniqle 로고"
                fill
                className="object-contain"
                priority
                sizes="32px"
              />
            </div>
            <span className="text-lg sm:text-xl font-bold text-text-primary">Youniqle</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-text-primary hover:text-primary transition-colors">
              {t('nav.products')}
            </Link>
            <Link href="/content" className="text-text-primary hover:text-primary transition-colors">
              {t('nav.content')}
            </Link>
            <Link href="/notices" className="text-text-primary hover:text-primary transition-colors">
              공지사항
            </Link>
            <Link href="/about" className="text-text-primary hover:text-primary transition-colors">
              {t('nav.about')}
            </Link>
            <button 
              onClick={() => alert('문의하기 기능은 현재 준비 중입니다. 곧 서비스할 예정입니다.')}
              className="text-text-primary hover:text-primary transition-colors cursor-pointer opacity-60"
            >
              문의하기
            </button>
            <button 
              onClick={() => alert('실시간 채팅 기능은 현재 준비 중입니다. 곧 서비스할 예정입니다.')}
              className="text-text-primary hover:text-primary transition-colors cursor-pointer opacity-60"
            >
              실시간 채팅
            </button>
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
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Language Switcher - Hide on very small screens */}
            <div className="hidden xs:block">
              <LanguageSwitcher />
            </div>

            {/* Real-time Notifications */}
            {session && (
              <RealtimeNotificationCenter />
            )}

            {/* Cart */}
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/cart">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {cartCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-xs p-0"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </Badge>
                )}
                <span className="sr-only">{t('nav.cart')}</span>
              </Link>
            </Button>

            {/* Auth Buttons */}
            {loading ? (
              <div className="w-16 sm:w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button variant="ghost" size="icon" asChild className="h-8 w-8 sm:h-10 sm:w-10">
                  <Link href="/me">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="sr-only">{t('nav.myPage')}</span>
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">{t('nav.logout')}</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm px-2 sm:px-3">
                  <Link href="/auth/signin">
                    <span className="hidden sm:inline">{t('nav.login')}</span>
                    <span className="sm:hidden">로그인</span>
                  </Link>
                </Button>
                <Button size="sm" asChild className="text-xs sm:text-sm px-2 sm:px-3">
                  <Link href="/auth/signup">
                    <span className="hidden sm:inline">{t('nav.signup')}</span>
                    <span className="sm:hidden">가입</span>
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden z-50 relative h-8 w-8 sm:h-10 sm:w-10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
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
              <Link href="/notices" className="text-text-primary hover:text-primary transition-colors">
                공지사항
              </Link>
              <Link href="/about" className="text-text-primary hover:text-primary transition-colors">
                {t('nav.about')}
              </Link>
              <button 
                onClick={() => alert('문의하기 기능은 현재 준비 중입니다. 곧 서비스할 예정입니다.')}
                className="text-text-primary hover:text-primary transition-colors cursor-pointer opacity-60 text-left"
              >
                문의하기
              </button>
              <button 
                onClick={() => alert('실시간 채팅 기능은 현재 준비 중입니다. 곧 서비스할 예정입니다.')}
                className="text-text-primary hover:text-primary transition-colors cursor-pointer opacity-60 text-left"
              >
                실시간 채팅
              </button>
              
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

