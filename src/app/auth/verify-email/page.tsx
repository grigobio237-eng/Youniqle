'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CharacterImage from '@/components/ui/CharacterImage';
import { CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('인증 토큰이 없습니다.');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`);
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        setUserEmail(data.user?.email || '');
      } else {
        if (data.error.includes('만료')) {
          setStatus('expired');
        } else {
          setStatus('error');
        }
        setMessage(data.error);
      }
    } catch (error) {
      setStatus('error');
      setMessage('인증 중 오류가 발생했습니다.');
    }
  };

  const resendVerification = async () => {
    if (!userEmail) {
      setMessage('이메일 주소를 입력해주세요.');
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('인증 이메일이 재발송되었습니다.');
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('이메일 재발송 중 오류가 발생했습니다.');
    } finally {
      setIsResending(false);
    }
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
              이메일 인증
            </CardTitle>
          </CardHeader>

          <CardContent className="px-8 pb-12 text-center">
            {status === 'loading' && (
              <div className="space-y-6">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600">이메일을 인증하고 있습니다...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    인증 완료! 🎉
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {message}
                  </p>
                  <p className="text-sm text-gray-500">
                    이제 Youniqle의 모든 서비스를 이용하실 수 있습니다.
                  </p>
                </div>
                <Button 
                  size="lg" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.location.href = '/auth/signin'}
                >
                  로그인하기
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    인증 실패
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {message}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  onClick={() => window.location.href = '/auth/signup'}
                >
                  다시 회원가입
                </Button>
              </div>
            )}

            {status === 'expired' && (
              <div className="space-y-6">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="h-10 w-10 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    인증 링크 만료
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {message}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    새로운 인증 이메일을 발송해드리겠습니다.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="이메일 주소를 입력하세요"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button 
                    size="lg" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={resendVerification}
                    disabled={isResending}
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        발송 중...
                      </>
                    ) : (
                      '인증 이메일 재발송'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {message && status !== 'loading' && status !== 'success' && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">{message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
