'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GoogleIcon, KakaoIcon, NaverIcon } from '@/components/ui/social-icons';
import { Eye, EyeOff, Shield, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import CharacterImage from '@/components/ui/CharacterImage';
import { isWebView, handleWebViewOAuth } from '@/utils/webViewDetection';

export default function AdminLoginPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingStep, setLoadingStep] = useState('');
  const [isInWebView, setIsInWebView] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setIsInWebView(isWebView());
  }, []);

  // URL 파라미터에서 오류 확인
  useEffect(() => {
    if (!mounted) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      console.log('관리자 로그인 오류:', errorParam);
      let errorMessage = '관리자 로그인 중 오류가 발생했습니다.';
      
      switch (errorParam) {
        case 'no-session':
          errorMessage = '세션을 찾을 수 없습니다. 다시 로그인해주세요.';
          break;
        case 'user-not-found':
          errorMessage = '사용자를 찾을 수 없습니다.';
          break;
        case 'not-admin':
          errorMessage = '관리자 권한이 필요한 서비스입니다.';
          break;
        case 'callback-failed':
          errorMessage = '로그인 처리 중 오류가 발생했습니다.';
          break;
        default:
          errorMessage = `관리자 로그인 오류: ${errorParam}`;
      }
      
      setError(errorMessage);
      
      // URL에서 오류 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('로그인 성공! 대시보드로 이동합니다...');
        setTimeout(() => {
          window.location.replace('/admin/dashboard');
        }, 1500);
      } else {
        setError(data.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    // WebView 환경에서 Google 로그인 시도 시 경고
    if (provider === 'google') {
      const handled = await handleWebViewOAuth(provider, '/api/admin/auth/callback');
      if (handled) {
        return; // WebView 처리 완료 또는 사용자 취소
      }
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setLoadingStep('소셜 로그인 중...');

    try {
      // 기존 관리자 토큰 삭제
      document.cookie = 'admin-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // 관리자 로그인 상태를 sessionStorage에 저장
      sessionStorage.setItem('admin-login-attempt', 'true');
      sessionStorage.setItem('admin-login-provider', provider);
      
      // NextAuth.js의 signIn 함수를 redirect: true로 사용하여 직접 리다이렉트
      await signIn(provider, { 
        redirect: true,
        callbackUrl: '/api/admin/auth/callback'
      });
      
    } catch (error) {
      console.error('Social login error:', error);
      setError('소셜 로그인 중 오류가 발생했습니다.');
      setLoading(false);
      setLoadingStep('');
    }
  };

  // 초기 서버 렌더링 시에는 레이아웃만 유지
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4" />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      {/* Background Characters */}
      <div className="absolute top-10 left-10 w-20 h-20 opacity-20">
        <CharacterImage
          src="/character/youniqle-1.png"
          alt="관리자 캐릭터"
          fill
          className="object-contain"
          sizes="80px"
        />
      </div>
      <div className="absolute bottom-10 right-10 w-16 h-16 opacity-20">
        <CharacterImage
          src="/character/youniqle-6.png"
          alt="보안 캐릭터"
          fill
          className="object-contain"
          sizes="64px"
        />
      </div>

      <div className="w-full max-w-md relative">
        {/* Back to Home */}
        <Link 
          href="/" 
          className="absolute -top-16 left-0 flex items-center text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          홈페이지로 돌아가기
        </Link>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-text-primary">
                관리자 로그인
              </CardTitle>
              <CardDescription className="text-text-secondary">
                youniqle.vercel.app 관리자 시스템
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {loading && loadingStep && (
              <Alert className="mb-6 border-primary/30 bg-blue-50">
                <AlertDescription className="text-blue-800">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <div>
                      <div className="font-medium">{loadingStep}</div>
                      <div className="text-xs text-primary mt-1">
                        {loadingStep.includes('소셜 로그인') && 'OAuth 창이 열립니다...'}
                        {loadingStep.includes('관리자 권한 확인') && '소셜 로그인 사용자의 관리자 권한을 확인합니다...'}
                        {loadingStep.includes('관리자 토큰 발급') && '관리자 전용 토큰을 발급합니다...'}
                        {loadingStep.includes('대시보드로 이동') && '관리자 대시보드로 이동합니다...'}
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* 소셜 로그인 안내 - 구조 개선 (하이드레이션 방지) */}
            <div className="mb-4 p-3 bg-blue-50 border border-primary/30 rounded-lg text-center flex flex-col gap-1">
              <div className="text-sm text-blue-800 font-bold">소셜 로그인 사용법</div>
              <div className="text-sm text-blue-800">
                구글/카카오로 가입한 후 관리자 권한이 부여된 계정만 이용 가능합니다.
              </div>
              <div className="text-xs text-primary">
                ※ 소셜 로그인 시 자동으로 관리자 토큰이 발급됩니다.
              </div>
            </div>

            {/* WebView 경고 메시지 */}
            {isInWebView && (
              <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">앱 내 브라우저 감지됨</p>
                    <p className="text-xs">
                      Google 로그인은 보안상의 이유로 시스템 브라우저(Chrome, Safari 등)에서만 가능합니다. 
                      브라우저에서 직접 열어주세요.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 소셜 로그인 안내 문구 - 구조 개선 (하이드레이션 방지) */}
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center flex flex-col gap-1">
              <div className="text-sm text-red-700 font-medium">네이버 로그인은 준비 중입니다.</div>
              <div className="text-sm text-red-700">
                현재는 구글/카카오 로그인과 이메일 로그인만 이용 가능합니다.
              </div>
            </div>

            {/* 소셜 로그인 버튼들 */}
            <div className="space-y-3 mb-6">
              <Button
                onClick={() => handleSocialLogin('google')}
                className="w-full h-12 bg-white border-2 border-line text-obsidian hover:bg-surface hover:border-gray-300 transition-all duration-200 font-medium"
                disabled={loading}
              >
                <GoogleIcon className="w-5 h-5 mr-3" />
                {loading && loadingStep.includes('google') ? loadingStep : '구글로 관리자 로그인'}
              </Button>

              <Button
                onClick={() => handleSocialLogin('kakao')}
                className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD835] text-black border-0 transition-all duration-200 font-medium"
                disabled={loading}
              >
                <KakaoIcon className="w-5 h-5 mr-3" />
                {loading && loadingStep.includes('kakao') ? loadingStep : '카카오로 관리자 로그인'}
              </Button>

              <Button
                onClick={() => handleSocialLogin('naver')}
                disabled
                className="w-full h-12 bg-green-500/50 text-white/50 border-0 transition-all duration-200 font-medium cursor-not-allowed"
              >
                <NaverIcon className="w-5 h-5 mr-3" />
                네이버로 관리자 로그인 (준비중)
              </Button>
            </div>

            {/* 구분선 */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-foreground/70 font-medium">또는</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-foreground/70" />
                    ) : (
                      <Eye className="h-4 w-4 text-foreground/70" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? '로그인 중...' : '관리자 로그인'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <div className="text-sm text-text-secondary">
                관리자 권한이 필요합니다.
              </div>
              <div className="text-sm text-text-secondary">
                문의: suchwawa@sapienet.com
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
