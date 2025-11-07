'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RefreshCw, Clock, CheckCircle, Eye, Search, X, Image as ImageIcon, MessageSquare, FileText } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface Refund {
  _id: string;
  refundNumber: string;
  type: 'refund' | 'exchange';
  userName: string;
  userEmail: string;
  userPhone?: string;
  orderNumber: string;
  orderId?: any;
  finalRefundAmount: number;
  refundAmount: number;
  totalAmount: number;
  shippingFee: number;
  refundShippingFee: number;
  deductionAmount: number;
  status: string;
  reason: string;
  reasonDetail: string;
  images?: string[];
  refundMethod: 'credit_card' | 'bank_transfer' | 'point';
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  pickupAddress?: {
    zipCode: string;
    address1: string;
    address2: string;
    phone: string;
  };
  exchangeInfo?: {
    newProductId?: string;
    newProductName?: string;
    newSize?: string;
    newColor?: string;
    additionalPayment?: number;
  };
  items?: Array<{
    productId: any;
    productName: string;
    quantity: number;
    price: number;
    totalPrice: number;
    imageUrl?: string;
  }>;
  adminNotes?: string;
  rejectionReason?: string;
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
  createdAt: string;
}

const reasonLabels: Record<string, string> = {
  change_of_mind: '단순 변심',
  defective_product: '상품 불량',
  wrong_product: '오배송',
  size_mismatch: '사이즈 불일치',
  different_from_image: '상품 상이',
  delivery_delay: '배송 지연',
  other: '기타',
};

const refundMethodLabels: Record<string, string> = {
  credit_card: '카드 취소',
  bank_transfer: '계좌 이체',
  point: '포인트',
};

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [statusToChange, setStatusToChange] = useState<{ id: string; status: string; rejectionReason: string } | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchRefunds = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/admin/refunds?${params}`);
      const data = await response.json();

      if (data.success) {
        setRefunds(data.data.refunds || []);
        setTotal(data.data.pagination?.total || 0);
      } else {
        toast.error('환불 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error fetching refunds:', error);
      toast.error('환불 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, searchQuery]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const handleViewDetail = async (refund: Refund) => {
    try {
      const response = await fetch(`/api/admin/refunds/${refund._id}`);
      const data = await response.json();

      if (data.success) {
        setSelectedRefund(data.data);
        setAdminNotes(data.data.adminNotes || '');
        setIsDetailDialogOpen(true);
      } else {
        toast.error('환불 상세 정보를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error fetching refund detail:', error);
      toast.error('환불 상세 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleStatusChangeClick = (id: string, newStatus: string) => {
    setStatusToChange({ id, status: newStatus, rejectionReason: '' });
    setIsStatusDialogOpen(true);
  };

  const handleStatusChange = async () => {
    if (!statusToChange) return;

    try {
      const response = await fetch(`/api/admin/refunds/${statusToChange.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: statusToChange.status,
          reason: statusToChange.rejectionReason || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('상태가 변경되었습니다.');
        setIsStatusDialogOpen(false);
        setStatusToChange(null);
        fetchRefunds();
        if (selectedRefund && selectedRefund._id === statusToChange.id) {
          handleViewDetail(selectedRefund);
        }
      } else {
        toast.error(data.error?.message || '상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleSaveAdminNotes = async () => {
    if (!selectedRefund) return;

    try {
      const response = await fetch(`/api/admin/refunds/${selectedRefund._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('메모가 저장되었습니다.');
        fetchRefunds();
        if (selectedRefund) {
          handleViewDetail(selectedRefund);
        }
      } else {
        toast.error(data.error || '메모 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error saving admin notes:', error);
      toast.error('메모 저장 중 오류가 발생했습니다.');
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
          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="환불번호, 주문번호, 사용자명, 이메일 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setPage(1);
                      fetchRefunds();
                    }
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 유형</SelectItem>
                <SelectItem value="refund">환불</SelectItem>
                <SelectItem value="exchange">교환</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체 상태</SelectItem>
                <SelectItem value="pending">대기</SelectItem>
                <SelectItem value="approved">승인</SelectItem>
                <SelectItem value="rejected">거부</SelectItem>
                <SelectItem value="pickup_requested">수거요청</SelectItem>
                <SelectItem value="pickup_completed">수거완료</SelectItem>
                <SelectItem value="inspecting">검수중</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
                <SelectItem value="cancelled">취소</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => { setPage(1); fetchRefunds(); }} variant="outline">
              검색
            </Button>
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
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(refund)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          상세
                        </Button>
                        {refund.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStatusChangeClick(refund._id, 'approved')}
                            >
                              승인
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusChangeClick(refund._id, 'rejected')}
                            >
                              거부
                            </Button>
                          </>
                        )}
                        {refund.status === 'approved' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChangeClick(refund._id, 'completed')}
                          >
                            완료
                          </Button>
                        )}
                      </div>
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

      {/* 환불 상세 다이얼로그 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>환불/교환 상세 정보</DialogTitle>
            <DialogDescription>
              환불 상세 정보를 확인하고 처리하세요
            </DialogDescription>
          </DialogHeader>
          {selectedRefund && (
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">환불번호</h4>
                  <p className="font-mono text-sm">{selectedRefund.refundNumber}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">상태</h4>
                  {getStatusBadge(selectedRefund.status)}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">유형</h4>
                  <Badge variant={selectedRefund.type === 'refund' ? 'default' : 'secondary'}>
                    {selectedRefund.type === 'refund' ? '환불' : '교환'}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">주문번호</h4>
                  <p>{selectedRefund.orderNumber}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">신청일</h4>
                  <p>{new Date(selectedRefund.requestedAt || selectedRefund.createdAt).toLocaleString('ko-KR')}</p>
                </div>
                {selectedRefund.approvedAt && (
                  <div>
                    <h4 className="font-semibold mb-2">승인일</h4>
                    <p>{new Date(selectedRefund.approvedAt).toLocaleString('ko-KR')}</p>
                  </div>
                )}
              </div>

              {/* 사용자 정보 */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">사용자 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">이름</p>
                    <p className="font-medium">{selectedRefund.userName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">이메일</p>
                    <p className="font-medium">{selectedRefund.userEmail}</p>
                  </div>
                  {selectedRefund.userPhone && (
                    <div>
                      <p className="text-sm text-gray-600">전화번호</p>
                      <p className="font-medium">{selectedRefund.userPhone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 환불 상품 */}
              {selectedRefund.items && selectedRefund.items.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4">환불 상품</h4>
                  <div className="space-y-3">
                    {selectedRefund.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {item.imageUrl && (
                          <Image
                            src={item.imageUrl}
                            alt={item.productName}
                            width={64}
                            height={64}
                            className="rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity}개 × ₩{item.price.toLocaleString()}
                          </p>
                        </div>
                        <p className="font-semibold">₩{item.totalPrice.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 환불 사유 */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">환불 사유</h4>
                <Badge variant="outline" className="mb-2">
                  {reasonLabels[selectedRefund.reason] || selectedRefund.reason}
                </Badge>
                <div className="p-4 bg-gray-50 rounded-lg mt-2">
                  <p className="whitespace-pre-wrap">{selectedRefund.reasonDetail}</p>
                </div>
                {selectedRefund.images && selectedRefund.images.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium mb-2">증빙 이미지</h5>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedRefund.images.map((image, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                          <Image
                            src={image}
                            alt={`증빙 이미지 ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 교환 정보 */}
              {selectedRefund.type === 'exchange' && selectedRefund.exchangeInfo && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4">교환 정보</h4>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    {selectedRefund.exchangeInfo.newProductName && (
                      <p className="mb-2">
                        <span className="font-medium">교환 상품:</span> {selectedRefund.exchangeInfo.newProductName}
                      </p>
                    )}
                    {selectedRefund.exchangeInfo.newSize && (
                      <p className="mb-2">
                        <span className="font-medium">사이즈:</span> {selectedRefund.exchangeInfo.newSize}
                      </p>
                    )}
                    {selectedRefund.exchangeInfo.newColor && (
                      <p className="mb-2">
                        <span className="font-medium">색상:</span> {selectedRefund.exchangeInfo.newColor}
                      </p>
                    )}
                    {selectedRefund.exchangeInfo.additionalPayment && selectedRefund.exchangeInfo.additionalPayment > 0 && (
                      <p className="mb-2">
                        <span className="font-medium">추가 결제:</span> ₩{selectedRefund.exchangeInfo.additionalPayment.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 금액 정보 */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">금액 정보</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>총 주문 금액</span>
                    <span className="font-medium">₩{selectedRefund.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>환불 금액</span>
                    <span className="font-medium">₩{selectedRefund.refundAmount.toLocaleString()}</span>
                  </div>
                  {selectedRefund.shippingFee > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>배송비</span>
                      <span>₩{selectedRefund.shippingFee.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedRefund.refundShippingFee > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>반품 배송비</span>
                      <span>-₩{selectedRefund.refundShippingFee.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedRefund.deductionAmount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>차감 금액</span>
                      <span>-₩{selectedRefund.deductionAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t font-bold text-lg">
                    <span>최종 환불 금액</span>
                    <span className="text-primary">₩{selectedRefund.finalRefundAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 환불 방법 */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">환불 방법</h4>
                <p>{refundMethodLabels[selectedRefund.refundMethod] || selectedRefund.refundMethod}</p>
                {selectedRefund.refundMethod === 'bank_transfer' && selectedRefund.bankAccount && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">은행:</span> {selectedRefund.bankAccount.bankName}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">계좌번호:</span> {selectedRefund.bankAccount.accountNumber}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">예금주:</span> {selectedRefund.bankAccount.accountHolder}
                    </p>
                  </div>
                )}
              </div>

              {/* 수거지 정보 */}
              {selectedRefund.pickupAddress && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">수거지 정보</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p>{selectedRefund.pickupAddress.address1} {selectedRefund.pickupAddress.address2}</p>
                    <p className="text-sm text-gray-600">({selectedRefund.pickupAddress.zipCode})</p>
                    <p className="text-sm text-gray-600 mt-1">연락처: {selectedRefund.pickupAddress.phone}</p>
                  </div>
                </div>
              )}

              {/* 거부 사유 */}
              {selectedRefund.rejectionReason && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2 text-red-600">거부 사유</h4>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p>{selectedRefund.rejectionReason}</p>
                  </div>
                </div>
              )}

              {/* 관리자 메모 */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">관리자 메모</h4>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="관리자 메모를 입력하세요..."
                  rows={4}
                  className="mb-2"
                />
                <Button onClick={handleSaveAdminNotes} size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  메모 저장
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 상태 변경 확인 다이얼로그 */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>상태 변경 확인</DialogTitle>
            <DialogDescription>
              {statusToChange?.status === 'rejected' && (
                <div className="mt-4">
                  <Label htmlFor="rejectionReason">거부 사유를 입력하세요 *</Label>
                  <Textarea
                    id="rejectionReason"
                    value={statusToChange.rejectionReason}
                    onChange={(e) => setStatusToChange(prev => prev ? { ...prev, rejectionReason: e.target.value } : null)}
                    placeholder="거부 사유를 입력하세요..."
                    rows={4}
                    className="mt-2"
                  />
                </div>
              )}
              {statusToChange?.status !== 'rejected' && (
                <p>
                  상태를 &quot;{statusToChange && getStatusBadge(statusToChange.status)}&quot;로 변경하시겠습니까?
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsStatusDialogOpen(false); setStatusToChange(null); }}>
              취소
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={statusToChange?.status === 'rejected' && !statusToChange.rejectionReason.trim()}
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



