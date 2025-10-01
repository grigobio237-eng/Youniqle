'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Store, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CharacterImage from '@/components/ui/CharacterImage';

export default function PartnerLoginPage() {
  const [email, setEmail] = useState('partner@youniqle.com');
  const [password, setPassword] = useState('partner123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="partner@example.com"
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

