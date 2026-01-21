'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  FileText,
  ChevronRight,
  Wallet,
  CreditCard,
  ArrowUpRight,
} from 'lucide-react';
import PartnerLayout from '@/components/partner/PartnerLayout';

interface Settlement {
  _id: string;
  settlementNumber: string;
  periodStart: string;
  periodEnd: string;
  totalOrders: number;
  totalOrderAmount: number;
  totalCommissionAmount: number;
  totalSettlementAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  createdAt: string;
  completedAt?: string;
}

interface TotalStats {
  totalSettlements: number;
  totalEarnings: number;
  totalCommission: number;
  totalOrders: number;
}

// 예상 정산일 계산 (매월 15일 또는 말일)
const getNextSettlementDate = () => {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth();
  const year = now.getFullYear();

  if (day < 15) {
    return new Date(year, month, 15);
  } else {
    // 다음 달 1일 - 1일 = 이번 달 마지막 날
    return new Date(year, month + 1, 0);
  }
};

function PartnerSettlementsContent() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [totalStats, setTotalStats] = useState<TotalStats>({
    totalSettlements: 0,
    totalEarnings: 0,
    totalCommission: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [settlementDetails, setSettlementDetails] = useState<any>(null);
  const [pendingAmount, setPendingAmount] = useState(0);
  const nextSettlementDate = getNextSettlementDate();

  useEffect(() => {
    fetchSettlements();
  }, [page, statusFilter, yearFilter]);

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter && { status: statusFilter }),
        ...(yearFilter && { year: yearFilter }),
      });

      const response = await fetch(`/api/partner/settlements?${params}`);
      const data = await response.json();

      if (data.success) {
        setSettlements(data.data.settlements);
        setTotal(data.data.pagination.total);
        setTotalStats(data.data.totalStats);
        // 모의 예정 정산액 설정 (실제로는 API에서 가져와야 함)
        setPendingAmount(Math.floor(Math.random() * 500000) + 100000);
      }
    } catch (error) {
      console.error('Error fetching settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettlementDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/partner/settlements/${id}`);
      const data = await response.json();

      if (data.success) {
        setSettlementDetails(data.data.settlement);
        setShowDetailDialog(true);
      }
    } catch (error) {
      console.error('Error fetching settlement details:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      pending: { variant: 'secondary', label: '대기', icon: Clock },
      processing: { variant: 'default', label: '처리중', icon: RefreshCw },
      completed: { variant: 'default', label: '완료', icon: CheckCircle },
      failed: { variant: 'destructive', label: '실패', icon: Clock },
      cancelled: { variant: 'outline', label: '취소', icon: Clock },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR');
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">정산 내역</h1>
          <p className="text-gray-500 mt-1">나의 정산 내역을 확인합니다</p>
        </div>
        <Button onClick={() => fetchSettlements()} variant="outline" className="rounded-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          새로고침
        </Button>
      </div>

      {/* 예상 정산 정보 카드 */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-sm">다음 정산 예정액</p>
                <p className="text-3xl font-bold">{formatCurrency(pendingAmount)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 min-w-[120px]">
                <p className="text-white/60 text-xs">예상 정산일</p>
                <p className="text-white font-bold text-lg">
                  {nextSettlementDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 min-w-[120px]">
                <p className="text-white/60 text-xs">D-Day</p>
                <p className="text-white font-bold text-lg">
                  {Math.ceil((nextSettlementDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}일
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 min-w-[120px]">
                <p className="text-white/60 text-xs">평균 정산 주기</p>
                <p className="text-white font-bold text-lg">매월 15일/말일</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 정산 금액</CardTitle>
            <div className="p-2 bg-purple-100 rounded-xl">
              <DollarSign className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalStats.totalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalStats.totalSettlements}회 정산
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 수수료</CardTitle>
            <div className="p-2 bg-orange-100 rounded-xl">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalStats.totalCommission)}
            </div>
            <p className="text-xs text-muted-foreground">
              평균 {totalStats.totalOrders > 0
                ? ((totalStats.totalCommission / (totalStats.totalEarnings + totalStats.totalCommission)) * 100).toFixed(1)
                : 0}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 주문 건수</CardTitle>
            <div className="p-2 bg-green-100 rounded-xl">
              <FileText className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalOrders}건</div>
            <p className="text-xs text-muted-foreground">
              정산 완료된 주문
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 정산액</CardTitle>
            <div className="p-2 bg-blue-100 rounded-xl">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                totalStats.totalSettlements > 0
                  ? totalStats.totalEarnings / totalStats.totalSettlements
                  : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">건당 평균</p>
          </CardContent>
        </Card>
      </div>

      {/* 정산 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>정산 내역</CardTitle>
          <CardDescription>월별 정산 내역을 확인할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}년
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="전체 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                <SelectItem value="pending">대기</SelectItem>
                <SelectItem value="processing">처리중</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : settlements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              정산 내역이 없습니다
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>정산번호</TableHead>
                    <TableHead>정산 기간</TableHead>
                    <TableHead className="text-right">주문 건수</TableHead>
                    <TableHead className="text-right">주문 금액</TableHead>
                    <TableHead className="text-right">수수료</TableHead>
                    <TableHead className="text-right">정산 금액</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-center">상세</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settlements.map((settlement) => (
                    <TableRow key={settlement._id}>
                      <TableCell className="font-medium">
                        {settlement.settlementNumber}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(settlement.periodStart)} ~<br />
                          {formatDate(settlement.periodEnd)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{settlement.totalOrders}건</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(settlement.totalOrderAmount)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        -{formatCurrency(settlement.totalCommissionAmount)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        {formatCurrency(settlement.totalSettlementAmount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(settlement.status)}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => fetchSettlementDetails(settlement._id)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 페이지네이션 */}
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  이전
                </Button>
                <span className="py-2 px-4">
                  {page} / {Math.ceil(total / 10)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(total / 10)}
                >
                  다음
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 정산 상세 다이얼로그 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>정산 상세 내역</DialogTitle>
            <DialogDescription>
              {settlementDetails?.settlementNumber}
            </DialogDescription>
          </DialogHeader>
          {settlementDetails && (
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">정산 기간</h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(settlementDetails.periodStart)} ~ {formatDate(settlementDetails.periodEnd)}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">정산 상태</h3>
                  {getStatusBadge(settlementDetails.status)}
                </div>
              </div>

              {/* 금액 정보 */}
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>주문 금액</span>
                  <span className="font-semibold">
                    {formatCurrency(settlementDetails.totalOrderAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>수수료 ({((settlementDetails.totalCommissionAmount / settlementDetails.totalOrderAmount) * 100).toFixed(1)}%)</span>
                  <span className="font-semibold">
                    -{formatCurrency(settlementDetails.totalCommissionAmount)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold text-green-600">
                  <span>정산 금액</span>
                  <span>{formatCurrency(settlementDetails.totalSettlementAmount)}</span>
                </div>
              </div>

              {/* 계좌 정보 */}
              <div>
                <h3 className="font-semibold mb-2">입금 계좌</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                  <p className="text-sm">
                    <span className="text-gray-600">은행:</span> {settlementDetails.bankAccount.bankName}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">계좌번호:</span> {settlementDetails.bankAccount.accountNumber}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">예금주:</span> {settlementDetails.bankAccount.accountHolder}
                  </p>
                </div>
              </div>

              {/* 주문 내역 */}
              {settlementDetails.items && settlementDetails.items.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">주문 내역 ({settlementDetails.totalOrders}건)</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>주문일</TableHead>
                          <TableHead>상품</TableHead>
                          <TableHead className="text-right">수량</TableHead>
                          <TableHead className="text-right">금액</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {settlementDetails.items.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="text-sm">
                              {formatDate(item.orderDate)}
                            </TableCell>
                            <TableCell className="text-sm">{item.productName}</TableCell>
                            <TableCell className="text-right text-sm">{item.quantity}</TableCell>
                            <TableCell className="text-right text-sm">
                              {formatCurrency(item.orderAmount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PartnerSettlementsPage() {
  return (
    <PartnerLayout>
      <PartnerSettlementsContent />
    </PartnerLayout>
  );
}
