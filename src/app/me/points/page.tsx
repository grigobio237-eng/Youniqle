'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CharacterImage from '@/components/ui/CharacterImage';
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Gift,
  ShoppingCart,
  User,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

interface PointTransaction {
  _id: string;
  type: 'earned' | 'used' | 'expired' | 'admin_grant' | 'admin_deduct';
  amount: number;
  description: string;
  balance: number;
  orderId?: {
    _id: string;
    orderNumber: string;
    totalAmount: number;
  };
  createdAt: string;
  expiresAt?: string;
}

interface PointHistoryData {
  transactions: PointTransaction[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  stats: {
    totalEarned: number;
    totalUsed: number;
    totalExpired: number;
    totalAdminGrant: number;
    totalAdminDeduct: number;
  };
  currentBalance: number;
}

export default function PointHistoryPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<PointHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [error, setError] = useState('');

  const fetchPointHistory = async (page: number = 1, type: string = 'all') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (type !== 'all') {
        params.append('type', type);
      }

      const response = await fetch(`/api/points/history?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || '포인트 내역을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('포인트 내역 조회 오류:', error);
      setError('포인트 내역을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPointHistory(currentPage, selectedType);
    } else if (status === 'unauthenticated') {
      setError('로그인이 필요합니다.');
      setLoading(false);
    }
  }, [status, currentPage, selectedType]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'used':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-gray-600" />;
      case 'admin_grant':
        return <Gift className="h-4 w-4 text-blue-600" />;
      case 'admin_deduct':
        return <User className="h-4 w-4 text-orange-600" />;
      default:
        return <Star className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'earned':
        return '적립';
      case 'used':
        return '사용';
      case 'expired':
        return '만료';
      case 'admin_grant':
        return '관리자 지급';
      case 'admin_deduct':
        return '관리자 차감';
      default:
        return '기타';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned':
        return 'bg-green-100 text-green-800';
      case 'used':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'admin_grant':
        return 'bg-blue-100 text-blue-800';
      case 'admin_deduct':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'loading' || loading) {
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
          <p className="text-gray-600">포인트 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CharacterImage
            src="/character/youniqle-1.png"
            alt="오류"
            width={64}
            height={64}
            className="w-16 h-16 mx-auto mb-4"
            sizes="64px"
          />
          <h2 className="text-xl font-semibold mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button asChild>
            <Link href="/me">마이페이지로 돌아가기</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CharacterImage
            src="/character/youniqle-1.png"
            alt="데이터 없음"
            width={64}
            height={64}
            className="w-16 h-16 mx-auto mb-4"
            sizes="64px"
          />
          <h2 className="text-xl font-semibold mb-2">포인트 내역이 없습니다</h2>
          <p className="text-gray-600 mb-4">아직 포인트 거래 내역이 없습니다.</p>
          <Button asChild>
            <Link href="/products">쇼핑하러 가기</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button variant="ghost" asChild className="mr-4">
              <Link href="/me">
                ← 마이페이지로 돌아가기
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">포인트 내역</h1>
          </div>
          
          {/* 현재 포인트 표시 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold mb-2">현재 포인트</h2>
                  <p className="text-3xl font-bold text-yellow-600">
                    {data.currentBalance.toLocaleString()}P
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-600 mb-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm">총 적립</span>
                  </div>
                  <p className="text-lg font-semibold text-green-600">
                    +{data.stats.totalEarned.toLocaleString()}P
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">총 적립</p>
                  <p className="text-lg font-semibold text-green-600">
                    +{data.stats.totalEarned.toLocaleString()}P
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">총 사용</p>
                  <p className="text-lg font-semibold text-red-600">
                    -{data.stats.totalUsed.toLocaleString()}P
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-gray-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">만료</p>
                  <p className="text-lg font-semibold text-gray-600">
                    -{data.stats.totalExpired.toLocaleString()}P
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Gift className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">관리자 지급</p>
                  <p className="text-lg font-semibold text-blue-600">
                    +{data.stats.totalAdminGrant.toLocaleString()}P
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 포인트 내역 */}
        <Card>
          <CardHeader>
            <CardTitle>포인트 거래 내역</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedType} onValueChange={setSelectedType}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="earned">적립</TabsTrigger>
                <TabsTrigger value="used">사용</TabsTrigger>
                <TabsTrigger value="expired">만료</TabsTrigger>
                <TabsTrigger value="admin_grant">지급</TabsTrigger>
                <TabsTrigger value="admin_deduct">차감</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedType} className="mt-6">
                <div className="space-y-4">
                  {data.transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge className={getTransactionColor(transaction.type)}>
                              {getTransactionLabel(transaction.type)}
                            </Badge>
                            {transaction.orderId && (
                              <Link 
                                href={`/orders/${transaction.orderId._id}`}
                                className="text-blue-600 hover:underline text-sm"
                              >
                                주문 #{transaction.orderId.orderNumber}
                              </Link>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{transaction.description}</p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}P
                        </p>
                        <p className="text-sm text-gray-500">
                          잔액: {transaction.balance.toLocaleString()}P
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {data.transactions.length === 0 && (
                    <div className="text-center py-8">
                      <CharacterImage
                        src="/character/youniqle-1.png"
                        alt="내역 없음"
                        width={48}
                        height={48}
                        className="w-12 h-12 mx-auto mb-4"
                        sizes="48px"
                      />
                      <p className="text-gray-600">해당 유형의 포인트 내역이 없습니다.</p>
                    </div>
                  )}
                </div>
                
                {/* 페이지네이션 */}
                {data.pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        이전
                      </Button>
                      
                      {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(Math.min(data.pagination.totalPages, currentPage + 1))}
                        disabled={currentPage === data.pagination.totalPages}
                      >
                        다음
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
