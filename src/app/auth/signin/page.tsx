'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleIcon, KakaoIcon } from '@/components/ui/social-icons';
import CharacterImage from '@/components/ui/CharacterImage';
import { Eye, EyeOff, Mail, Lock, AlertCircle, ChevronLeft } from 'lucide-react';

import { isWebView, handleWebViewOAuth, openExternalBrowser } from '@/utils/webViewDetection';
import ReferralTracker from '@/components/auth/ReferralTracker';

function SigninContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';
  const [showPassword, setShowPassword] = useState(false);
  const [isInWebView, setIsInWebView] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    setIsInWebView(isWebView());
  }, []);

  const handleOpenExternalBrowser = () => {
    if (typeof window !== 'undefined') {
      openExternalBrowser(window.location.href);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider === 'google') {
      const handled = await handleWebViewOAuth(provider, callbackUrl);
      if (handled) return;
    }
    signIn(provider, { callbackUrl: callbackUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) {
        window.location.href = callbackUrl;
      } else {
        alert('이메일 또는 비밀번호를 확인해주세요.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('로그인 처리 중 오류가 발생했습니다.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-background flex flex-col items-center justify-start md:justify-center p-4 pt-8 md:pt-4">
      {/* Back Button */}
      <div className="absolute top-8 left-8">
        <Button variant="ghost" asChild className="text-text-secondary hover:text-text-primary">
          <Link href="/"><ChevronLeft className="mr-2 h-4 w-4" /> 홈으로</Link>
        </Button>
      </div>

      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-4 md:space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="relative w-16 h-16">
              <CharacterImage
                src="/character/youniqle-1.png"
                alt="Youniqle 로고"
                fill
                className="object-contain"
                sizes="64px"
              />
            </div>
          </div>
          <h1 className="text-3xl font-black text-text-primary tracking-tighter">로그인</h1>
          <p className="text-text-secondary font-medium">다시 만나서 반갑습니다.</p>
        </div>

        <Card className="bg-surface border-line shadow-2xl rounded-[32px] overflow-hidden">
          <CardContent className="p-5 md:p-8 space-y-4 md:space-y-8">
            {/* WebView Warning */}
            {isInWebView && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl space-y-3">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-text-primary">
                    <p className="font-bold mb-1">앱 브라우저 감지</p>
                    <p className="text-xs opacity-70">
                      보안을 위해 시스템 브라우저(Chrome, Safari 등)에서 이용을 권장합니다.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleOpenExternalBrowser}
                  className="w-full h-10 bg-primary text-background font-bold rounded-xl"
                >
                  외부 브라우저에서 열기
                </Button>
              </div>
            )}

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleSocialLogin('kakao')}
                className="h-12 md:h-14 bg-[#FEE500] hover:bg-[#FDD835] text-black border-none rounded-2xl font-bold transition-all"
              >
                <KakaoIcon className="w-5 h-5 mr-2" />
                카카오
              </Button>
              <Button
                onClick={() => handleSocialLogin('google')}
                className="h-12 md:h-14 bg-white border-none text-gray-900 hover:bg-gray-100 rounded-2xl font-bold transition-all"
              >
                <GoogleIcon className="w-5 h-5 mr-2" />
                구글
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="px-4 bg-surface text-text-secondary">OR</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-background border-line h-12 md:h-14 pl-12 rounded-2xl focus:border-primary transition-all text-text-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-background border-line h-12 md:h-14 pl-12 rounded-2xl focus:border-primary transition-all text-text-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 bg-background border-line rounded text-primary focus:ring-primary"
                    aria-label="로그인 상태 유지"
                  />
                  <Label htmlFor="remember" className="text-sm text-text-secondary font-medium cursor-pointer">
                    로그인 상태 유지
                  </Label>
                </div>
                <Link href="/auth/forgot-password" className="text-sm text-primary font-bold hover:underline">
                  비밀번호 찾기
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-14 md:h-16 bg-primary hover:bg-primary/90 text-background font-black text-lg rounded-2xl shadow-xl transition-all hover:scale-[1.02]"
              >
                로그인하기
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-text-secondary font-medium">
                아직 계정이 없으신가요?{' '}
                <Link
                  href={`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                  className="text-primary font-bold hover:underline"
                >
                  회원가입
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    }>
      <ReferralTracker />
      <SigninContent />
    </Suspense>
  );
}
