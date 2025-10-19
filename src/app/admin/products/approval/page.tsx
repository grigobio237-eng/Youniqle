'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Package, 
  Check, 
  X, 
  Eye,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { PRODUCT_CATEGORIES, getCategoryLabel } from '@/constants/categories';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
  status: 'active' | 'hidden';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  featured: boolean;
  images: Array<{
    url: string;
    w?: number;
    h?: number;
    type?: string;
  }>;
  summary: string;
  description: string;
  partnerName?: string;
  partnerEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductApprovalPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [filterStatus]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        
        // 승인 상태에 따라 필터링
        let filteredProducts = data.products;
        if (filterStatus !== 'all') {
          filteredProducts = data.products.filter(
            (p: Product) => p.approvalStatus === filterStatus
          );
        }
        
        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('상품 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId: string) => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}/approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (response.ok) {
        toast.success('상품이 승인되었습니다.');
        fetchProducts();
      } else {
        const error = await response.json();
        toast.error(error.message || '승인 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to approve product:', error);
      toast.error('승인 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProduct || !rejectionReason.trim()) {
      toast.error('거부 사유를 입력해주세요.');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/products/${selectedProduct.id}/approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'reject',
          rejectionReason 
        }),
      });

      if (response.ok) {
        toast.success('상품이 거부되었습니다.');
        setIsRejectDialogOpen(false);
        setRejectionReason('');
        setSelectedProduct(null);
        fetchProducts();
      } else {
        const error = await response.json();
        toast.error(error.message || '거부 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to reject product:', error);
      toast.error('거부 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            승인 대기
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <Check className="h-3 w-3 mr-1" />
            승인됨
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
            <X className="h-3 w-3 mr-1" />
            거부됨
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">상품 승인 관리</h1>
            <p className="text-text-secondary mt-1">
              파트너가 등록한 상품을 검토하고 승인/거부할 수 있습니다
            </p>
          </div>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">상품 승인 관리</h1>
          <p className="text-text-secondary mt-1">
            파트너가 등록한 상품을 검토하고 승인/거부할 수 있습니다
          </p>
        </div>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Label>상태 필터:</Label>
            <Select 
              value={filterStatus} 
              onValueChange={(value: any) => setFilterStatus(value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="pending">승인 대기</SelectItem>
                <SelectItem value="approved">승인됨</SelectItem>
                <SelectItem value="rejected">거부됨</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">
              총 {products.length}개의 상품
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <div className="grid gap-4">
        {products.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">상품이 없습니다</h3>
              <p className="text-gray-600">
                {filterStatus === 'pending' 
                  ? '승인 대기 중인 상품이 없습니다.' 
                  : '필터 조건에 맞는 상품이 없습니다.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* 상품 이미지 */}
                  {product.images.length > 0 && (
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover rounded-lg"
                        sizes="128px"
                      />
                    </div>
                  )}
                  
                  {/* 상품 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{product.name}</h3>
                          {getStatusBadge(product.approvalStatus)}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {product.summary}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="font-semibold text-lg text-primary">
                            ₩{product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="line-through text-gray-400">
                              ₩{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                          <Badge variant="outline">
                            {getCategoryLabel(product.category)}
                          </Badge>
                          <span>재고: {product.stock}개</span>
                        </div>
                        
                        {product.partnerName && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">파트너:</span> {product.partnerName}
                            {product.partnerEmail && (
                              <span className="ml-2">({product.partnerEmail})</span>
                            )}
                          </div>
                        )}
                        
                        {product.approvalStatus === 'rejected' && product.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                            <strong>거부 사유:</strong> {product.rejectionReason}
                          </div>
                        )}
                      </div>
                      
                      {/* 액션 버튼 */}
                      <div className="flex flex-col gap-2">
                        {product.approvalStatus === 'pending' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApprove(product.id)}
                              disabled={processing}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              승인
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsRejectDialogOpen(true);
                              }}
                              disabled={processing}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 mr-1" />
                              거부
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/products/${product.slug}`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          미리보기
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>상품 거부</DialogTitle>
            <DialogDescription>
              {selectedProduct?.name}을(를) 거부하는 이유를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">거부 사유 *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="파트너에게 전달될 거부 사유를 입력해주세요."
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectionReason('');
                setSelectedProduct(null);
              }}
              disabled={processing}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? '처리 중...' : '거부'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

