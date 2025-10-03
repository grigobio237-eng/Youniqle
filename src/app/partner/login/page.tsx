'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GoogleIcon, KakaoIcon, NaverIcon } from '@/components/ui/social-icons';
import { Eye, EyeOff, Store, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CharacterImage from '@/components/ui/CharacterImage';

export default function PartnerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingStep, setLoadingStep] = useState('');
  const router = useRouter();

  // URL 파라미터에서 오류 확인
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error) {
      console.log('소셜 로그인 오류:', error);
      let errorMessage = '소셜 로그인 중 오류가 발생했습니다.';
      
      switch (error) {
        case 'no-session':
          errorMessage = '세션을 찾을 수 없습니다. 다시 로그인해주세요.';
          break;
        case 'user-not-found':
          errorMessage = '사용자를 찾을 수 없습니다.';
          break;
        case 'not-partner':
          errorMessage = '파트너 승인이 필요한 서비스입니다. 파트너 신청을 먼저 해주세요.';
          break;
        case 'callback-failed':
          errorMessage = '로그인 처리 중 오류가 발생했습니다.';
          break;
        default:
          errorMessage = `소셜 로그인 오류: ${error}`;
      }
      
      setError(errorMessage);
      
      // URL에서 오류 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/partner/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 파트너 로그인 성공
        router.push('/partner/dashboard');
      } else {
        setError(data.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Partner login error:', error);
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    setLoadingStep('소셜 로그인 중...');

    try {
      // 기존 파트너 토큰 삭제
      document.cookie = 'partner-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // 파트너 로그인 상태를 sessionStorage에 저장 (페이지 새로고침 시에도 유지)
      sessionStorage.setItem('partner-login-attempt', 'true');
      sessionStorage.setItem('partner-login-provider', provider);
      
      // NextAuth.js의 signIn 함수를 redirect: true로 사용하여 직접 리다이렉트
      await signIn(provider, { 
        redirect: true,
        callbackUrl: '/api/partner/auth/callback'
      });
      
    } catch (error) {
      console.error('Social login error:', error);
      setError('소셜 로그인 중 오류가 발생했습니다.');
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-background to-primary/10 flex items-center justify-center p-4">
      {/* Background Characters */}
      <div className="absolute top-10 left-10 w-20 h-20 opacity-20">
        <CharacterImage
          src="/character/youniqle-4.png"
          alt="파트너 캐릭터"
          fill
          className="object-contain"
        />
      </div>
      <div className="absolute bottom-10 right-10 w-16 h-16 opacity-20">
        <CharacterImage
          src="/character/youniqle-5.png"
          alt="파트너 캐릭터"
          fill
          className="object-contain"
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
            <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
              <Store className="h-8 w-8 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-text-primary">
                파트너 로그인
              </CardTitle>
              <CardDescription className="text-text-secondary">
                youniqle.vercel.app 파트너 시스템
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
              <Alert className="mb-6 border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <div>
                      <div className="font-medium">{loadingStep}</div>
                      <div className="text-xs text-blue-600 mt-1">
                        {loadingStep.includes('소셜 로그인') && 'OAuth 창이 열립니다...'}
                        {loadingStep.includes('파트너 권한 확인') && '소셜 로그인 사용자의 파트너 권한을 확인합니다...'}
                        {loadingStep.includes('파트너 토큰 발급') && '파트너 전용 토큰을 발급합니다...'}
                        {loadingStep.includes('대시보드로 이동') && '파트너 대시보드로 이동합니다...'}
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* 소셜 로그인 안내 */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                <strong>소셜 로그인 사용법:</strong><br />
                구글로 가입한 후 파트너 신청을 완료하신 분들만 이용 가능합니다.<br />
                <span className="text-xs text-blue-600">※ 소셜 로그인 시 자동으로 파트너 토큰이 발급됩니다.</span>
              </p>
            </div>

            {/* 소셜 로그인 안내 문구 */}
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700 text-center">
                <span className="font-medium">카카오톡과 네이버 로그인은 준비 중입니다.</span><br />
                현재는 구글 로그인과 이메일 로그인만 이용 가능합니다.
              </p>
            </div>

            {/* 소셜 로그인 버튼들 */}
            <div className="space-y-3 mb-6">
              <Button
                onClick={() => handleSocialLogin('google')}
                className="w-full h-12 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                disabled={loading}
              >
                <GoogleIcon className="w-5 h-5 mr-3" />
                {loading ? (loadingStep || '구글 로그인 중...') : '구글로 파트너 로그인'}
              </Button>

              <Button
                onClick={() => handleSocialLogin('kakao')}
                disabled
                className="w-full h-12 bg-yellow-400/50 text-black/50 border-0 transition-all duration-200 font-medium cursor-not-allowed"
              >
                <KakaoIcon className="w-5 h-5 mr-3" />
                카카오로 파트너 로그인 (준비중)
              </Button>

              <Button
                onClick={() => handleSocialLogin('naver')}
                disabled
                className="w-full h-12 bg-green-500/50 text-white/50 border-0 transition-all duration-200 font-medium cursor-not-allowed"
              >
                <NaverIcon className="w-5 h-5 mr-3" />
                네이버로 파트너 로그인 (준비중)
              </Button>
            </div>

            {/* 구분선 */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">또는</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? '로그인 중...' : '파트너 로그인'}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-text-secondary">
                  아직 파트너가 아니신가요?
                </p>
                <Button variant="link" asChild className="p-0 h-auto">
                  <Link href="/partner/apply">
                    파트너 신청하기
                  </Link>
                </Button>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-xs text-text-secondary text-center">
                  파트너 승인이 필요한 서비스입니다.
                  <br />
                  문의: suchwawa@sapienet.com
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

