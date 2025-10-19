'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  MoreVertical,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Star,
  Check,
  X,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';
import { PRODUCT_CATEGORIES, getCategoryLabel } from '@/constants/categories';
import { toast } from 'sonner';

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
  sales: number;
  reviews: number;
  averageRating: number;
}

// 카테고리 목록 (전체 프로젝트 공통 사용)
const categories = PRODUCT_CATEGORIES;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (approvalFilter !== 'all') params.append('approvalStatus', approvalFilter);
      params.append('sort', sortBy);

      const response = await fetch(`/api/admin/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter, statusFilter, approvalFilter, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleProductAction = async (productId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: action !== 'delete' ? JSON.stringify({ action }) : undefined,
      });

      if (response.ok) {
        fetchProducts(); // 새로고침
      }
    } catch (error) {
      console.error('Product action failed:', error);
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

  const getApprovalStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalRevenue = products.reduce((sum, product) => sum + (product.price * product.sales), 0);
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStockProducts = products.filter(product => product.stock < 10).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">상품 관리</h1>
            <p className="text-text-secondary mt-1">
              상품 등록 및 관리
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">상품 관리</h1>
          <p className="text-text-secondary mt-1">
            총 {products.length}개의 상품을 관리하고 있습니다
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            새 상품 등록
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">총 상품 수</p>
                <p className="text-2xl font-bold text-text-primary">{products.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">총 매출</p>
                <p className="text-2xl font-bold text-text-primary">
                  ₩{totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">총 재고</p>
                <p className="text-2xl font-bold text-text-primary">
                  {totalStock.toLocaleString()}개
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">재고 부족</p>
                <p className="text-2xl font-bold text-red-600">
                  {lowStockProducts}개
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="상품명 또는 설명으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 카테고리</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="hidden">숨김</SelectItem>
              </SelectContent>
            </Select>

            {/* Approval Status Filter */}
            <Select value={approvalFilter} onValueChange={setApprovalFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="승인 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 승인 상태</SelectItem>
                <SelectItem value="pending">승인 대기</SelectItem>
                <SelectItem value="approved">승인됨</SelectItem>
                <SelectItem value="rejected">거부됨</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">최신순</SelectItem>
                <SelectItem value="oldest">오래된순</SelectItem>
                <SelectItem value="price-high">가격 높은순</SelectItem>
                <SelectItem value="price-low">가격 낮은순</SelectItem>
                <SelectItem value="sales">판매순</SelectItem>
                <SelectItem value="name">이름순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square relative bg-gray-100">
              {product.images[0] ? (
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.featured && (
                  <Badge variant="default">인기</Badge>
                )}
                {product.stock < 10 && (
                  <Badge variant="destructive">재고부족</Badge>
                )}
                <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                  {product.status === 'active' ? '활성' : '숨김'}
                </Badge>
                {getApprovalStatusBadge(product.approvalStatus)}
              </div>

              <div className="absolute top-3 right-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/products/${product.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        상세보기
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        수정
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleProductAction(product.id, 'toggle-status')}
                    >
                      {product.status === 'active' ? '숨기기' : '활성화'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleProductAction(product.id, 'delete')}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-text-primary line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-2 mt-1">
                    {product.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-primary">
                      ₩{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-text-secondary line-through">
                        ₩{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline">
                    {product.category}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm text-text-secondary">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <ShoppingCart className="h-3 w-3" />
                      <span>{product.sales}개</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>{product.averageRating.toFixed(1)}</span>
                      <span>({product.reviews})</span>
                    </div>
                  </div>
                  <span>재고: {product.stock}개</span>
                </div>

                {/* 파트너 상품 정보 표시 */}
                {product.partnerName && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <div>파트너: {product.partnerName}</div>
                    {product.partnerEmail && <div>이메일: {product.partnerEmail}</div>}
                  </div>
                )}

                {/* 거부 사유 표시 */}
                {product.approvalStatus === 'rejected' && product.rejectionReason && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                    <div className="font-medium">거부 사유:</div>
                    <div>{product.rejectionReason}</div>
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  {product.approvalStatus === 'pending' && (
                    <>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => handleApprove(product.id)}
                        disabled={processing}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        승인
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsRejectDialogOpen(true);
                        }}
                        disabled={processing}
                        className="flex-1"
                      >
                        <X className="h-3 w-3 mr-1" />
                        거부
                      </Button>
                    </>
                  )}
                  {product.approvalStatus !== 'pending' && (
                    <>
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Edit className="h-3 w-3 mr-1" />
                          수정
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/products/${product.slug}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          보기
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              상품이 없습니다
            </h3>
            <p className="text-text-secondary mb-4">
              검색 조건에 맞는 상품을 찾을 수 없습니다.
            </p>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="h-4 w-4 mr-2" />
                첫 번째 상품 등록하기
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 거부 사유 입력 다이얼로그 */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>상품 거부 사유 입력</DialogTitle>
            <DialogDescription>
              상품 &quot;{selectedProduct?.name}&quot;을(를) 거부하는 사유를 입력해주세요. 파트너에게 전달됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rejectionReason">거부 사유 *</Label>
              <Textarea
                id="rejectionReason"
                placeholder="예: 이미지 품질이 낮습니다. 상품 설명이 불충분합니다."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? (
                <Clock className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              거부 확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



























