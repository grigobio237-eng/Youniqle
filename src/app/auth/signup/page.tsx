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
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, ChevronLeft } from 'lucide-react';

import { isWebView, handleWebViewOAuth } from '@/utils/webViewDetection';
import ReferralTracker from '@/components/auth/ReferralTracker';

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  const [showPassword, setShowPassword] = useState(false);
  const [isInWebView, setIsInWebView] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    marketingConsent: false,
  });

  useEffect(() => {
    setIsInWebView(isWebView());
  }, []);

  const handleSocialLogin = async (provider: string) => {
    if (provider === 'google') {
      const handled = await handleWebViewOAuth(provider, callbackUrl);
      if (handled) return;
    }
    signIn(provider, { callbackUrl: callbackUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    const referralCode = searchParams?.get('ref') || '';

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          marketingConsent: formData.marketingConsent,
          referralCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.emailSent) {
          alert('회원가입이 완료되었습니다! 이메일을 확인하여 인증을 완료해주세요.');
          window.location.href = '/auth/verify-email';
        } else {
          alert('회원가입이 완료되었습니다! 로그인해주세요.');
          window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;
        }
      } else {
        alert(data.error || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('서버 오류가 발생했습니다.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
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

      <div className="w-full max-w-md relative z-10 space-y-8 py-12">
        <div className="text-center space-y-4">
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
          <h1 className="text-3xl font-black text-text-primary tracking-tighter">회원가입</h1>
          <p className="text-text-secondary font-medium text-balance underline-offset-4">
            Youniqle에 오신 것을 환영합니다!
          </p>
        </div>

        <Card className="bg-surface border-line shadow-2xl rounded-[32px] overflow-hidden">
          <CardContent className="p-8 space-y-8">
            {/* WebView Warning */}
            {isInWebView && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-text-primary font-bold">
                    보안을 위해 시스템 브라우저 이용을 권장합니다.
                  </div>
                </div>
              </div>
            )}

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleSocialLogin('kakao')}
                className="h-14 bg-[#FEE500] hover:bg-[#FDD835] text-black border-none rounded-2xl font-bold transition-all"
              >
                <KakaoIcon className="w-5 h-5 mr-3" />
                카카오
              </Button>
              <Button
                onClick={() => handleSocialLogin('google')}
                className="h-14 bg-white border-none text-gray-900 hover:bg-gray-100 rounded-2xl font-bold transition-all"
              >
                <GoogleIcon className="w-5 h-5 mr-3" />
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

            {/* Email Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">이름</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-background border-line h-14 pl-12 rounded-2xl focus:border-primary transition-all text-text-primary"
                    placeholder="성함을 입력하세요"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-background border-line h-14 pl-12 rounded-2xl focus:border-primary transition-all text-text-primary"
                    placeholder="example@email.com"
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
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-background border-line h-14 pl-12 rounded-2xl focus:border-primary transition-all text-text-primary"
                    placeholder="••••••••"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">비밀번호 확인</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="bg-background border-line h-14 pl-12 rounded-2xl focus:border-primary transition-all text-text-primary"
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 px-1">
                <input
                  id="marketingConsent"
                  name="marketingConsent"
                  type="checkbox"
                  checked={formData.marketingConsent}
                  onChange={handleInputChange}
                  className="h-4 w-4 bg-background border-line rounded text-primary focus:ring-primary"
                  aria-label="마케팅 정보 수신 동의"
                />
                <Label htmlFor="marketingConsent" className="text-sm text-text-secondary font-medium cursor-pointer">
                  마케팅 정보 수신에 동의합니다 (선택사항)
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-16 bg-primary hover:bg-primary/90 text-background font-black text-lg rounded-2xl shadow-xl transition-all hover:scale-[1.02]"
              >
                가입하기
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-text-secondary font-medium">
                이미 계정이 있으신가요?{' '}
                <Link
                  href="/auth/signin"
                  className="text-primary font-bold hover:underline"
                >
                  로그인하기
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    }>
      <ReferralTracker />
      <SignupContent />
    </Suspense>
  );
}
