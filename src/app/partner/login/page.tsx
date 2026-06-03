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
import { Eye, EyeOff, Store, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import CharacterImage from '@/components/ui/CharacterImage';
import { isWebView, handleWebViewOAuth } from '@/utils/webViewDetection';

export default function PartnerLoginPage() {
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
    setIsInWebView(isWebView());
  }, []);

  // URL 파라미터에서 오류 확인
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');

    if (error) {
      console.log('소셜 로그인 오류:', error);
      let errorMessage = '소셜 로그인 중 오류가 발생했습니다.';

      const status = urlParams.get('status');

      switch (error) {
        case 'no-session':
          errorMessage = '세션을 찾을 수 없습니다. 다시 로그인해주세요.';
          break;
        case 'user-not-found':
          errorMessage = '사용자를 찾을 수 없습니다.';
          break;
        case 'not-partner':
          if (status === 'pending') {
            errorMessage = '파트너 신청이 검토 중입니다. 승인 완료 후 이용 가능합니다.';
          } else if (status === 'rejected') {
            errorMessage = '파트너 신청이 거부되었습니다. 관리자에게 문의해주세요.';
          } else if (status === 'suspended') {
            errorMessage = '파트너 계정이 정지되었습니다. 관리자에게 문의해주세요.';
          } else if (status === 'none') {
            errorMessage = '파트너 신청이 필요합니다. 파트너 신청을 먼저 해주세요.';
          } else {
            errorMessage = `파트너 승인이 필요한 서비스입니다. 현재 상태: ${status || 'none'}. 파트너 신청을 먼저 해주세요.`;
          }
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
    // WebView 환경에서 Google 로그인 시도 시 경고
    if (provider === 'google') {
      const handled = await handleWebViewOAuth(provider, '/api/partner/auth/callback');
      if (handled) {
        return; // WebView 처리 완료 또는 사용자 취소
      }
    }

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
                <AlertDescription>
                  <div className="space-y-2">
                    <div>{error}</div>
                    {error.includes('파트너 승인') && (
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <p className="text-xs text-red-700 mb-2">디버깅 도구:</p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                const response = await fetch('/api/partner/auth/debug-status');
                                const data = await response.json();
                                if (data.success) {
                                  alert(`현재 상태: ${data.user.partnerStatus}\n이메일: ${data.user.email}\n신청 여부: ${data.user.hasPartnerApplication ? '있음' : '없음'}`);
                                } else {
                                  alert('상태 확인 실패: ' + (data.error || '알 수 없는 오류'));
                                }
                              } catch (err) {
                                alert('상태 확인 중 오류 발생');
                              }
                            }}
                            className="text-xs"
                          >
                            내 상태 확인
                          </Button>
                          {/* 개발 환경에서만 테스트 승인 버튼 표시 */}
                          {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                if (!confirm('테스트용으로 파트너를 승인하시겠습니까? (개발 환경만 가능)')) return;
                                try {
                                  const response = await fetch('/api/partner/auth/test-approve', { method: 'POST' });
                                  const data = await response.json();
                                  if (data.success) {
                                    alert('파트너로 승인되었습니다! 다시 로그인해주세요.');
                                    window.location.reload();
                                  } else {
                                    alert('승인 실패: ' + (data.error || '알 수 없는 오류'));
                                  }
                                } catch (err) {
                                  alert('승인 처리 중 오류 발생');
                                }
                              }}
                              className="text-xs"
                            >
                              테스트 승인
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
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
            <div className="mb-4 p-3 bg-blue-50 border border-primary/30 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                <strong>소셜 로그인 사용법:</strong><br />
                소셜 계정(구글, 카카오)으로 가입한 후 파트너 신청을 완료하신 분들만 이용 가능합니다.<br />
                <span className="text-xs text-primary">※ 소셜 로그인 시 자동으로 파트너 토큰이 발급됩니다.</span>
              </p>
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

            {/* 소셜 로그인 안내 문구 */}
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700 text-center">
                <span className="font-medium">네이버 로그인은 준비 중입니다.</span><br />
                현재는 구글과 카카오 로그인, 이메일 로그인만 이용 가능합니다.
              </p>
            </div>

            {/* 소셜 로그인 버튼들 */}
            <div className="space-y-3 mb-6">
              <Button
                onClick={() => handleSocialLogin('google')}
                className="w-full h-12 bg-white border-2 border-line text-obsidian hover:bg-surface hover:border-gray-300 transition-all duration-200 font-medium"
                disabled={loading}
              >
                <GoogleIcon className="w-5 h-5 mr-3" />
                {loading ? (loadingStep || '구글 로그인 중...') : '구글로 파트너 로그인'}
              </Button>

              <Button
                onClick={() => handleSocialLogin('kakao')}
                className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD835] text-black border-none transition-all duration-200 font-medium"
                disabled={loading}
              >
                <KakaoIcon className="w-5 h-5 mr-3" />
                {loading ? (loadingStep || '카카오 로그인 중...') : '카카오로 파트너 로그인'}
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
                <span className="px-4 bg-white text-foreground/70 font-medium">또는</span>
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

