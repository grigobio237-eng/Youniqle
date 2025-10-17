'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Clock, CheckCircle } from 'lucide-react';

interface Refund {
  _id: string;
  refundNumber: string;
  type: 'refund' | 'exchange';
  userName: string;
  userEmail: string;
  orderNumber: string;
  finalRefundAmount: number;
  status: string;
  createdAt: string;
}

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchRefunds = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/refunds?${params}`);
      const data = await response.json();

      if (data.success) {
        setRefunds(data.data.refunds);
        setTotal(data.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching refunds:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!confirm('상태를 변경하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/refunds/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        alert('상태가 변경되었습니다.');
        fetchRefunds();
      } else {
        alert(data.error.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('상태 변경 실패');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: '대기' },
      approved: { variant: 'default', label: '승인' },
      rejected: { variant: 'destructive', label: '거부' },
      pickup_requested: { variant: 'default', label: '수거요청' },
      pickup_completed: { variant: 'default', label: '수거완료' },
      inspecting: { variant: 'default', label: '검수중' },
      completed: { variant: 'default', label: '완료' },
      cancelled: { variant: 'outline', label: '취소' },
    };

    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">환불/교환 관리</h1>
          <p className="text-gray-500 mt-1">환불 및 교환 요청을 관리합니다</p>
        </div>
        <Button onClick={() => fetchRefunds()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          새로고침
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>환불/교환 목록</CardTitle>
          <CardDescription>환불 및 교환 요청을 조회하고 처리합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                <SelectItem value="pending">대기</SelectItem>
                <SelectItem value="approved">승인</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>번호</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>사용자</TableHead>
                    <TableHead>주문번호</TableHead>
                    <TableHead className="text-right">금액</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>신청일</TableHead>
                    <TableHead className="text-center">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refunds.map((refund) => (
                    <TableRow key={refund._id}>
                      <TableCell className="font-medium">{refund.refundNumber}</TableCell>
                      <TableCell>
                        <Badge variant={refund.type === 'refund' ? 'default' : 'secondary'}>
                          {refund.type === 'refund' ? '환불' : '교환'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{refund.userName}</div>
                          <div className="text-sm text-gray-500">{refund.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{refund.orderNumber}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(refund.finalRefundAmount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(refund.status)}</TableCell>
                      <TableCell>{formatDate(refund.createdAt)}</TableCell>
                      <TableCell className="text-center">
                        {refund.status === 'pending' && (
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(refund._id, 'approved')}
                            >
                              승인
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(refund._id, 'rejected')}
                            >
                              거부
                            </Button>
                          </div>
                        )}
                        {refund.status === 'approved' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(refund._id, 'completed')}
                          >
                            완료 처리
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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
    </div>
  );
}



