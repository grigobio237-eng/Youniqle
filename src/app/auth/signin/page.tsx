'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleIcon, KakaoIcon, NaverIcon } from '@/components/ui/social-icons';
import CharacterImage from '@/components/ui/CharacterImage';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function SigninPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSocialLogin = (provider: string) => {
    signIn(provider, { callbackUrl: '/' });
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
        window.location.href = '/';
      } else {
        alert('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('로그인 중 오류가 발생했습니다.');
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
              로그인
            </CardTitle>
            <p className="text-gray-600">
              Youniqle에 다시 오신 것을 환영합니다!
            </p>
          </CardHeader>

          <CardContent className="px-8 pb-12">
            {/* 소셜 로그인 버튼들 */}
            <div className="space-y-4 mb-8">
              <Button
                onClick={() => handleSocialLogin('google')}
                className="w-full h-12 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <GoogleIcon className="w-5 h-5 mr-3" />
                구글로 계속하기
              </Button>

              <Button
                onClick={() => handleSocialLogin('kakao')}
                disabled
                className="w-full h-12 bg-yellow-400/50 text-black/50 border-0 transition-all duration-200 cursor-not-allowed"
              >
                <KakaoIcon className="w-5 h-5 mr-3" />
                카카오로 계속하기 (준비중)
              </Button>

              <Button
                onClick={() => handleSocialLogin('naver')}
                disabled
                className="w-full h-12 bg-green-500/50 text-white/50 border-0 transition-all duration-200 cursor-not-allowed"
              >
                <NaverIcon className="w-5 h-5 mr-3" />
                네이버로 계속하기 (준비중)
              </Button>
            </div>

            {/* 소셜 로그인 안내 문구 */}
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 text-center">
                <span className="font-medium">카카오톡과 네이버 로그인은 준비 중입니다.</span><br />
                현재는 구글 로그인과 이메일 로그인만 이용 가능합니다.
              </p>
            </div>

            {/* 구분선 */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">또는</span>
              </div>
            </div>

            {/* 이메일 로그인 폼 */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                  이메일
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
                    placeholder="이메일을 입력하세요"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                  비밀번호
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
                    placeholder="비밀번호를 입력하세요"
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
                    로그인 상태 유지
                  </Label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  비밀번호 찾기
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105"
              >
                로그인
              </Button>
            </form>

            {/* 회원가입 링크 */}
            <div className="text-center mt-8">
              <p className="text-gray-600">
                계정이 없으신가요?{' '}
                <Link
                  href="/auth/signup"
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  회원가입하기
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
