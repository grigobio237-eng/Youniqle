'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  RefreshCw,
  Search,
  RotateCcw,
  Eye,
  Package,
  Truck,
  ClipboardList,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface RefundItem {
  productId: {
    _id: string;
    name: string;
  };
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  imageUrl?: string;
}

interface Refund {
  _id: string;
  refundNumber: string;
  type: 'refund' | 'exchange';
  userName: string;
  userEmail: string;
  orderNumber: string;
  finalRefundAmount: number;
  status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'pickup_requested'
    | 'pickup_completed'
    | 'inspecting'
    | 'completed'
    | 'cancelled';
  reason: string;
  reasonDetail?: string;
  items?: RefundItem[];
  pickupAddress?: {
    zipCode: string;
    address1: string;
    address2?: string;
    phone: string;
  };
  courierCompany?: string;
  trackingNumber?: string;
  pickupDate?: string;
  partnerNotes?: string;
  requestedAt?: string;
  approvedAt?: string;
  updatedAt?: string;
  createdAt: string;
}

const statusLabels: Record<
  Refund['status'],
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: { label: '검토중', variant: 'outline' },
  approved: { label: '승인됨', variant: 'secondary' },
  rejected: { label: '거부됨', variant: 'destructive' },
  pickup_requested: { label: '수거요청', variant: 'default' },
  pickup_completed: { label: '수거완료', variant: 'default' },
  inspecting: { label: '검수중', variant: 'default' },
  completed: { label: '완료', variant: 'secondary' },
  cancelled: { label: '취소됨', variant: 'outline' },
};

const typeLabels: Record<string, string> = {
  refund: '환불',
  exchange: '교환',
};

const reasonLabels: Record<string, string> = {
  change_of_mind: '단순 변심',
  defective_product: '상품 불량',
  wrong_product: '오배송',
  size_mismatch: '사이즈 불일치',
  different_from_image: '상품 상이',
  delivery_delay: '배송 지연',
  other: '기타',
};

const partnerStatusOptions = [
  { value: 'pickup_requested', label: '수거 요청' },
  { value: 'pickup_completed', label: '수거 완료' },
  { value: 'inspecting', label: '검수 중' },
  { value: 'completed', label: '처리 완료' },
];

export default function PartnerReturnsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    courierCompany: '',
    trackingNumber: '',
    pickupDate: '',
    partnerNotes: '',
  });

  const fetchRefunds = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/partner/refunds?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        setRefunds(data.data?.refunds || []);
        setTotal(data.data?.pagination?.total || 0);
      } else {
        toast.error(data.error?.message || '환불 목록을 불러오지 못했습니다.');
      }
    } catch (error) {
      console.error('Failed to fetch partner refunds:', error);
      toast.error('환불 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, searchQuery]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const handleViewDetail = async (refundId: string) => {
    try {
      const response = await fetch(`/api/partner/refunds/${refundId}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        const detail: Refund = data.data;
        setSelectedRefund(detail);
        setUpdateForm({
          status: partnerStatusOptions.some((opt) => opt.value === detail.status)
            ? detail.status
            : '',
          courierCompany: detail.courierCompany || '',
          trackingNumber: detail.trackingNumber || '',
          pickupDate: detail.pickupDate
            ? new Date(detail.pickupDate).toISOString().slice(0, 10)
            : '',
          partnerNotes: detail.partnerNotes || '',
        });
        setIsDetailOpen(true);
      } else {
        toast.error(data.error?.message || '상세 정보를 불러오지 못했습니다.');
      }
    } catch (error) {
      console.error('Failed to fetch refund detail:', error);
      toast.error('상세 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateRefund = async () => {
    if (!selectedRefund) return;

    try {
      const response = await fetch(`/api/partner/refunds/${selectedRefund._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: updateForm.status || undefined,
          courierCompany: updateForm.courierCompany || undefined,
          trackingNumber: updateForm.trackingNumber || undefined,
          pickupDate: updateForm.pickupDate || undefined,
          partnerNotes: updateForm.partnerNotes ?? undefined,
        }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success('환불 정보를 업데이트했습니다.');
        setIsDetailOpen(false);
        setSelectedRefund(null);
        fetchRefunds();
      } else {
        toast.error(data.error?.message || '업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to update partner refund:', error);
      toast.error('업데이트 중 오류가 발생했습니다.');
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);

  const formatDateTime = (value?: string) =>
    value ? new Date(value).toLocaleString('ko-KR') : '-';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">환불/교환 요청</h1>
          <p className="text-muted-foreground mt-1">
            고객의 환불·교환 요청을 확인하고 진행 상황을 업데이트하세요.
          </p>
        </div>
        <Button onClick={() => fetchRefunds()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          새로고침
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>환불/교환 목록</CardTitle>
          <CardDescription>
            승인된 요청을 수거/검수 후 처리 완료 상태로 업데이트할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="환불번호, 주문번호, 고객명, 이메일 검색..."
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
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 유형</SelectItem>
                <SelectItem value="refund">환불</SelectItem>
                <SelectItem value="exchange">교환</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-44">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체 상태</SelectItem>
                <SelectItem value="pending">검토중</SelectItem>
                <SelectItem value="approved">승인됨</SelectItem>
                <SelectItem value="pickup_requested">수거요청</SelectItem>
                <SelectItem value="pickup_completed">수거완료</SelectItem>
                <SelectItem value="inspecting">검수중</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
                <SelectItem value="rejected">거부됨</SelectItem>
                <SelectItem value="cancelled">취소됨</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setPage(1);
                fetchRefunds();
              }}
            >
              검색
            </Button>
          </div>

          {loading ? (
            <div className="py-10 text-center text-muted-foreground">로딩 중...</div>
          ) : refunds.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              표시할 환불/교환 요청이 없습니다.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>환불번호</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>고객</TableHead>
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
                      <TableCell className="font-mono text-sm">{refund.refundNumber}</TableCell>
                      <TableCell>
                        <Badge variant={refund.type === 'refund' ? 'default' : 'secondary'}>
                          {typeLabels[refund.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{refund.userName}</div>
                          <div className="text-sm text-muted-foreground">{refund.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{refund.orderNumber}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(refund.finalRefundAmount || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusLabels[refund.status]?.variant}>
                          {statusLabels[refund.status]?.label || refund.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(refund.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(refund._id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            상세
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  이전
                </Button>
                <span className="text-sm">
                  {page} / {Math.max(1, Math.ceil(total / 10))}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={page >= Math.ceil(total / 10)}
                >
                  다음
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>환불/교환 상세</DialogTitle>
            <DialogDescription>
              고객 요청 내용을 확인하고 수거/검수 상태를 업데이트하세요.
            </DialogDescription>
          </DialogHeader>
          {selectedRefund && (
            <div className="space-y-8">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">기본 정보</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{selectedRefund.refundNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedRefund.orderNumber}</span>
                    </div>
                    <div>
                      <Badge variant={statusLabels[selectedRefund.status]?.variant}>
                        {statusLabels[selectedRefund.status]?.label || selectedRefund.status}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      신청 {formatDateTime(selectedRefund.requestedAt || selectedRefund.createdAt)}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">고객 정보</h4>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{selectedRefund.userName}</p>
                    <p className="text-muted-foreground">{selectedRefund.userEmail}</p>
                    {selectedRefund.pickupAddress && (
                      <div className="mt-2 rounded-md bg-muted p-3">
                        <p className="text-xs text-muted-foreground mb-1">수거지</p>
                        <p className="text-sm">
                          ({selectedRefund.pickupAddress.zipCode}){' '}
                          {selectedRefund.pickupAddress.address1}{' '}
                          {selectedRefund.pickupAddress.address2}
                        </p>
                        <p className="text-xs mt-1">
                          연락처: {selectedRefund.pickupAddress.phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedRefund.items && selectedRefund.items.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    환불 상품
                  </h4>
                  <div className="grid gap-3">
                    {selectedRefund.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <div className="relative h-16 w-16 rounded-md bg-muted overflow-hidden">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-muted-foreground m-auto" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity}개 × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="font-semibold">
                          {formatCurrency(item.totalPrice)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">환불 사유</h4>
                <Badge variant="outline" className="mb-2">
                  {reasonLabels[selectedRefund.reason] || selectedRefund.reason}
                </Badge>
                {selectedRefund.reasonDetail && (
                  <div className="rounded-md bg-muted/60 p-4 text-sm whitespace-pre-wrap">
                    {selectedRefund.reasonDetail}
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <Label>상태 업데이트</Label>
                  <Select
                    value={updateForm.status}
                    onValueChange={(value) =>
                      setUpdateForm((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">선택 안 함</SelectItem>
                      {partnerStatusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="pickup-date">수거 예정일</Label>
                  <Input
                    id="pickup-date"
                    type="date"
                    value={updateForm.pickupDate}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({ ...prev, pickupDate: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="courier">택배사</Label>
                  <Input
                    id="courier"
                    placeholder="예: CJ대한통운"
                    value={updateForm.courierCompany}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({ ...prev, courierCompany: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="tracking">송장번호</Label>
                  <Input
                    id="tracking"
                    placeholder="송장번호를 입력하세요"
                    value={updateForm.trackingNumber}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({ ...prev, trackingNumber: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="partner-notes">파트너 메모</Label>
                <Textarea
                  id="partner-notes"
                  placeholder="관리자와 공유할 메모를 남기세요"
                  value={updateForm.partnerNotes}
                  onChange={(e) =>
                    setUpdateForm((prev) => ({ ...prev, partnerNotes: e.target.value }))
                  }
                  rows={4}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  닫기
                </Button>
                <Button onClick={handleUpdateRefund}>
                  <Truck className="h-4 w-4 mr-2" />
                  정보 업데이트
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}





