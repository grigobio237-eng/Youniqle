'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CharacterImage from '@/components/ui/CharacterImage';
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Settings,
  FileText,
  Calculator,
  Clock,
  Gift,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

interface PointStats {
  totalUsers: number;
  totalPoints: number;
  totalEarned: number;
  totalUsed: number;
  totalExpired: number;
  averagePointsPerUser: number;
}

export default function AdminPointManagementPage() {
  const [stats, setStats] = useState<PointStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 실제 구현에서는 API에서 통계 데이터를 가져옴
    setStats({
      totalUsers: 1250,
      totalPoints: 1250000,
      totalEarned: 2500000,
      totalUsed: 800000,
      totalExpired: 450000,
      averagePointsPerUser: 1000
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CharacterImage
            src="/character/youniqle-1.png"
            alt="로딩 중"
            width={64}
            height={64}
            className="w-16 h-16 mx-auto mb-4 animate-bounce"
            sizes="64px"
          />
          <p className="text-gray-600">포인트 통계를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">포인트 관리</h1>
          <p className="text-gray-600">포인트 시스템 관리 및 규칙 확인</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="rules">시스템 규칙</TabsTrigger>
            <TabsTrigger value="management">포인트 관리</TabsTrigger>
            <TabsTrigger value="analytics">분석</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">총 회원 수</p>
                      <p className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}명</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">총 보유 포인트</p>
                      <p className="text-2xl font-bold">{stats?.totalPoints.toLocaleString()}P</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">총 적립 포인트</p>
                      <p className="text-2xl font-bold">{stats?.totalEarned.toLocaleString()}P</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingDown className="h-8 w-8 text-red-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">총 사용 포인트</p>
                      <p className="text-2xl font-bold">{stats?.totalUsed.toLocaleString()}P</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 시스템 상태 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  시스템 상태
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="font-semibold text-green-800">포인트 적립</p>
                      <p className="text-sm text-green-600">정상 작동</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="font-semibold text-green-800">포인트 사용</p>
                      <p className="text-sm text-green-600">정상 작동</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="font-semibold text-green-800">만료 처리</p>
                      <p className="text-sm text-green-600">정상 작동</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 시스템 규칙 탭 */}
          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  포인트 시스템 규칙
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 적립 규칙 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    포인트 적립 규칙
                  </h3>
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        포인트는 구매 완료 시 자동으로 적립되며, 멤버십 등급에 따라 차등 적용됩니다.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">등급별 적립률</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-amber-600">CEDAR (시작)</span>
                            <Badge variant="outline">1%</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-600">ROOTER (뿌리)</span>
                            <Badge variant="outline">1.5%</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-600">BLOOMER (꽃)</span>
                            <Badge variant="outline">2%</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-pink-600">GLOWER (빛)</span>
                            <Badge variant="outline">2.5%</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-600">ECOSOUL (영혼)</span>
                            <Badge variant="outline">3%</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">적립 조건</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            결제 완료 시 자동 적립
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            실제 결제 금액 기준
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            포인트 사용 금액 제외
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            소수점 이하 버림 처리
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 사용 규칙 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                    포인트 사용 규칙
                  </h3>
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        포인트 사용 시 주문 금액의 최대 50%까지만 사용 가능하며, 최소 주문 금액 제한이 있습니다.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">사용 제한</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                            주문 금액의 최대 50%
                          </li>
                          <li className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                            보유 포인트 범위 내
                          </li>
                          <li className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                            최소 주문 금액 1,000원
                          </li>
                          <li className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                            정수 단위로만 사용
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">사용 예시</h4>
                        <div className="space-y-2 text-sm">
                          <div className="p-2 bg-gray-50 rounded">
                            <p><strong>주문 금액:</strong> 50,000원</p>
                            <p><strong>최대 사용:</strong> 25,000P</p>
                            <p><strong>실제 결제:</strong> 25,000원</p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <p><strong>보유 포인트:</strong> 10,000P</p>
                            <p><strong>실제 사용:</strong> 10,000P</p>
                            <p><strong>실제 결제:</strong> 40,000원</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 만료 규칙 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-gray-600" />
                    포인트 만료 규칙
                  </h3>
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        포인트는 적립 후 1년이 지나면 자동으로 만료되며, 만료 예정 포인트는 미리 알림됩니다.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">만료 정책</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-600 mr-2" />
                            적립 후 365일 만료
                          </li>
                          <li className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-600 mr-2" />
                            자동 만료 처리
                          </li>
                          <li className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-600 mr-2" />
                            만료 예정 30일 전 알림
                          </li>
                          <li className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-600 mr-2" />
                            만료 내역 기록 보관
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">만료 처리</h4>
                        <div className="space-y-2 text-sm">
                          <div className="p-2 bg-gray-50 rounded">
                            <p><strong>처리 주기:</strong> 매일 자정</p>
                            <p><strong>처리 방식:</strong> 자동 배치</p>
                            <p><strong>알림 방식:</strong> 이메일 + 푸시</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 관리자 규칙 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-blue-600" />
                    관리자 포인트 관리
                  </h3>
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        관리자는 특별한 경우에 한해 사용자에게 포인트를 지급하거나 차감할 수 있습니다.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">관리자 지급</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center">
                            <Gift className="h-4 w-4 text-blue-600 mr-2" />
                            이벤트 보상
                          </li>
                          <li className="flex items-center">
                            <Gift className="h-4 w-4 text-blue-600 mr-2" />
                            고객 만족도 보상
                          </li>
                          <li className="flex items-center">
                            <Gift className="h-4 w-4 text-blue-600 mr-2" />
                            시스템 오류 보상
                          </li>
                          <li className="flex items-center">
                            <Gift className="h-4 w-4 text-blue-600 mr-2" />
                            기타 특별 혜택
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">관리자 차감</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                            부정 사용 적발
                          </li>
                          <li className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                            시스템 오류 복구
                          </li>
                          <li className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                            정책 위반 시
                          </li>
                          <li className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                            기타 특별 사유
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 포인트 관리 탭 */}
          <TabsContent value="management" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  포인트 관리 도구
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    포인트 관리 기능은 별도 API 구현이 필요합니다. 현재는 UI만 제공됩니다.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">포인트 지급</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="userId">사용자 ID</Label>
                        <Input id="userId" placeholder="사용자 ID 또는 이메일" />
                      </div>
                      <div>
                        <Label htmlFor="points">지급 포인트</Label>
                        <Input id="points" type="number" placeholder="지급할 포인트" />
                      </div>
                      <div>
                        <Label htmlFor="reason">사유</Label>
                        <Input id="reason" placeholder="지급 사유" />
                      </div>
                      <Button className="w-full">
                        포인트 지급
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">포인트 차감</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="userId2">사용자 ID</Label>
                        <Input id="userId2" placeholder="사용자 ID 또는 이메일" />
                      </div>
                      <div>
                        <Label htmlFor="points2">차감 포인트</Label>
                        <Input id="points2" type="number" placeholder="차감할 포인트" />
                      </div>
                      <div>
                        <Label htmlFor="reason2">사유</Label>
                        <Input id="reason2" placeholder="차감 사유" />
                      </div>
                      <Button variant="destructive" className="w-full">
                        포인트 차감
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 분석 탭 */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  포인트 분석
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    포인트 분석 기능은 별도 구현이 필요합니다. 현재는 기본 통계만 표시됩니다.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3">포인트 현황</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>총 보유 포인트</span>
                        <span className="font-semibold">{stats?.totalPoints.toLocaleString()}P</span>
                      </div>
                      <div className="flex justify-between">
                        <span>총 적립 포인트</span>
                        <span className="font-semibold text-green-600">+{stats?.totalEarned.toLocaleString()}P</span>
                      </div>
                      <div className="flex justify-between">
                        <span>총 사용 포인트</span>
                        <span className="font-semibold text-red-600">-{stats?.totalUsed.toLocaleString()}P</span>
                      </div>
                      <div className="flex justify-between">
                        <span>총 만료 포인트</span>
                        <span className="font-semibold text-gray-600">-{stats?.totalExpired.toLocaleString()}P</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3">회원별 평균</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>평균 보유 포인트</span>
                        <span className="font-semibold">{stats?.averagePointsPerUser.toLocaleString()}P</span>
                      </div>
                      <div className="flex justify-between">
                        <span>총 회원 수</span>
                        <span className="font-semibold">{stats?.totalUsers.toLocaleString()}명</span>
                      </div>
                      <div className="flex justify-between">
                        <span>포인트 사용률</span>
                        <span className="font-semibold">
                          {stats ? Math.round((stats.totalUsed / stats.totalEarned) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
