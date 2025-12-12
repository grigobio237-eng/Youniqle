'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleIcon, KakaoIcon, NaverIcon } from '@/components/ui/social-icons';
import CharacterImage from '@/components/ui/CharacterImage';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

import { isWebView, handleWebViewOAuth } from '@/utils/webViewDetection';

export default function SigninPage() {
  const { t } = useLanguage();
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

  const handleSocialLogin = async (provider: string) => {
    // WebView 환경에서 Google 로그인 시도 시 경고
    if (provider === 'google') {
      const handled = await handleWebViewOAuth(provider, '/');
      if (handled) {
        return; // WebView 처리 완료 또는 사용자 취소
      }
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
        alert(t('auth.form.loginError'));
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(t('auth.form.loginFailed'));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      {/* 배경 캐릭터들 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 opacity-20">
          <CharacterImage
            src="/character/youniqle-2.png"
            alt="배경 캐릭터"
            fill
            className="object-contain animate-bounce"
            sizes="128px"
          />
        </div>
        <div className="absolute bottom-20 right-10 w-40 h-40 opacity-15">
          <CharacterImage
            src="/character/youniqle-3.png"
            alt="배경 캐릭터"
            fill
            className="object-contain animate-pulse"
            sizes="160px"
          />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-8 pt-12">
            <div className="flex justify-center mb-6">
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
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              {t('auth.login')}
            </CardTitle>
            <p className="text-gray-600">
              {t('auth.welcomeBack')}
            </p>
          </CardHeader>

          <CardContent className="px-8 pb-12">
            {/* WebView 경고 메시지 */}
            {isInWebView && (
              <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
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

            {/* 소셜 로그인 버튼들 */}
            <div className="space-y-4 mb-8">
              <Button
                onClick={() => handleSocialLogin('google')}
                className="w-full h-12 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <GoogleIcon className="w-5 h-5 mr-3" />
                {t('auth.socialLogin.google')}
              </Button>

              <Button
                onClick={() => handleSocialLogin('kakao')}
                disabled
                className="w-full h-12 bg-yellow-400/50 text-black/50 border-0 transition-all duration-200 cursor-not-allowed"
              >
                <KakaoIcon className="w-5 h-5 mr-3" />
                {t('auth.socialLogin.kakaoPreparing')}
              </Button>

              <Button
                onClick={() => handleSocialLogin('naver')}
                disabled
                className="w-full h-12 bg-green-500/50 text-white/50 border-0 transition-all duration-200 cursor-not-allowed"
              >
                <NaverIcon className="w-5 h-5 mr-3" />
                {t('auth.socialLogin.naverPreparing')}
              </Button>
            </div>

            {/* 소셜 로그인 안내 문구 */}
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 text-center">
                <span className="font-medium">{t('auth.socialLogin.notice')}</span><br />
                {t('auth.socialLogin.noticeDesc')}
              </p>
            </div>

            {/* 구분선 */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">{t('auth.socialLogin.or')}</span>
              </div>
            </div>

            {/* 이메일 로그인 폼 */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('auth.email')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder={t('auth.emailPlaceholder')}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('auth.password')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder={t('auth.passwordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    {t('auth.form.rememberMe')}
                  </Label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  {t('auth.form.forgotPassword')}
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105"
              >
                {t('auth.login')}
              </Button>
            </form>

            {/* 회원가입 링크 */}
            <div className="text-center mt-8">
              <p className="text-gray-600">
                {t('auth.noAccount')}{' '}
                <Link
                  href={`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  {t('auth.signup')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
