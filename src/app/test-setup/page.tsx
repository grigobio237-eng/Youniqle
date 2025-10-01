'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, User, Store, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TestSetupPage() {
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  const handleCreateAccounts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/create-accounts', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setCreated(true);
        toast.success('테스트 계정이 성공적으로 생성되었습니다!');
      } else {
        throw new Error('계정 생성 실패');
      }
    } catch (error) {
      console.error('계정 생성 오류:', error);
      toast.error('테스트 계정 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-background to-primary/10 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            🧪 Youniqle 테스트 환경 설정
          </h1>
          <p className="text-text-secondary text-lg">
            파트너 시스템 검증을 위한 테스트 계정을 생성합니다
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              테스트 계정 생성
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!created ? (
              <div className="text-center">
                <p className="text-text-secondary mb-6">
                  아래 버튼을 클릭하여 테스트용 계정들을 생성하세요.
                  <br />
                  관리자, 파트너, 일반 사용자 계정이 자동으로 생성됩니다.
                </p>
                <Button 
                  onClick={handleCreateAccounts}
                  disabled={loading}
                  size="lg"
                  className="px-8 py-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      계정 생성 중...
                    </>
                  ) : (
                    '테스트 계정 생성하기'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-600 mb-2">
                    테스트 계정 생성 완료!
                  </h3>
                  <p className="text-text-secondary">
                    이제 아래 계정들로 로그인하여 테스트를 시작할 수 있습니다.
                  </p>
                </div>

                <div className="grid gap-4">
                  {/* 관리자 계정 */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Shield className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-blue-900">관리자 계정</h4>
                            <Badge variant="default" className="bg-blue-600">Admin</Badge>
                          </div>
                          <p className="text-blue-700 text-sm mb-2">
                            모든 관리자 기능 접근 가능
                          </p>
                          <div className="space-y-1 text-sm">
                            <p><strong>이메일:</strong> admin@youniqle.com</p>
                            <p><strong>비밀번호:</strong> admin123!</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 파트너 계정 */}
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Store className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-green-900">파트너 계정</h4>
                            <Badge variant="default" className="bg-green-600">Approved</Badge>
                          </div>
                          <p className="text-green-700 text-sm mb-2">
                            승인된 파트너 (모든 파트너 기능 사용 가능)
                          </p>
                          <div className="space-y-1 text-sm">
                            <p><strong>이메일:</strong> partner@youniqle.com</p>
                            <p><strong>비밀번호:</strong> partner123!</p>
                            <p><strong>사업자명:</strong> 파트너샵</p>
                            <p><strong>수수료율:</strong> 12%</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 일반 사용자 계정 */}
                  <Card className="border-gray-200 bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900">일반 사용자 계정</h4>
                            <Badge variant="secondary">User</Badge>
                          </div>
                          <p className="text-gray-700 text-sm mb-2">
                            파트너 신청 테스트용
                          </p>
                          <div className="space-y-1 text-sm">
                            <p><strong>이메일:</strong> user@youniqle.com</p>
                            <p><strong>비밀번호:</strong> user123!</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">🚀 다음 단계</h4>
                  <ol className="list-decimal list-inside space-y-1 text-yellow-700 text-sm">
                    <li>개발 서버 실행: <code className="bg-yellow-100 px-1 rounded">npm run dev</code></li>
                    <li>관리자로 로그인하여 파트너 관리 페이지 확인</li>
                    <li>파트너로 로그인하여 상품 등록 및 이미지 업로드 테스트</li>
                    <li>일반 사용자로 파트너 신청 테스트</li>
                    <li>전체 파트너 시스템 플로우 검증</li>
                  </ol>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}














