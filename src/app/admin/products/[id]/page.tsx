'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Edit,
    Package,
    Calendar,
    DollarSign,
    User,
    Tag,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import { PRODUCT_CATEGORIES } from '@/constants/categories';

interface Product {
    _id: string; // or id depending on API
    id?: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    stock: number;
    category: string;
    status: 'active' | 'hidden';
    featured: boolean;
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;

    // Funding
    isFunding?: boolean;
    fundingGoal?: number;
    fundingEndDate?: string;

    // Partner
    partnerName?: string;
    partnerEmail?: string;

    images: Array<{
        url: string;
        w?: number;
        h?: number;
        type?: string;
    }>;
    summary: string;
    description: string;

    // Specifics
    nutritionInfo?: any;
    originInfo?: any;
    clothingInfo?: any;
    electronicsInfo?: any;

    createdAt: string;
    updatedAt: string;
}

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params?.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/products/${productId}`);

            if (!response.ok) {
                throw new Error('상품을 불러오는데 실패했습니다.');
            }

            const data = await response.json();
            setProduct(data.product);
        } catch (error) {
            console.error('Failed to fetch product:', error);
            toast.error('상품 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryLabel = (value: string) => {
        return PRODUCT_CATEGORIES.find(c => c.value === value)?.label || value;
    };

    const getApprovalBadge = (status?: string) => {
        if (status === 'approved') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">승인됨</Badge>;
        if (status === 'rejected') return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">거부됨</Badge>;
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">승인 대기</Badge>;
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-64 bg-gray-200 rounded md:col-span-1"></div>
                    <div className="h-64 bg-gray-200 rounded md:col-span-2"></div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-foreground/70 mx-auto mb-4" />
                <h3 className="text-lg font-medium">상품을 찾을 수 없습니다</h3>
                <Button onClick={() => router.push('/admin/products')} className="mt-4" variant="outline">
                    목록으로 돌아가기
                </Button>
            </div>
        );
    }

    // Handle _id vs id inconsistency if any
    const id = product._id || product.id;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-bold">{product.name}</h1>
                            <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                                {product.status === 'active' ? '활성' : '숨김'}
                            </Badge>
                            {getApprovalBadge(product.approvalStatus)}
                        </div>
                        <p className="text-foreground/70 text-sm">Product ID: {id}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push(`/admin/products/${id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        수정하기
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Images & Quick Info */}
                <div className="space-y-6">
                    {/* Main Image */}
                    <Card className="overflow-hidden">
                        <div className="aspect-square relative bg-gray-100">
                            {product.images?.[0] ? (
                                // 이미지 URL에 ?v=1을 추가하고 속성을 crossorigin(소문자)으로 통일
                                <Image
                                    src={product.images[0].url.includes('?') ? `${product.images[0].url}&v=1` : `${product.images[0].url}?v=1`}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    crossOrigin="anonymous"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-foreground/70">
                                    <Package className="h-16 w-16" />
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Price & Stock Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">가격 및 재고</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-foreground/70">판매가</span>
                                <span className="font-bold text-primary text-xl">{formatPrice(product.price)}</span>
                            </div>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <div className="flex justify-between items-center pb-2 border-b">
                                    <span className="text-foreground/70">정상가</span>
                                    <span className="text-foreground/70 line-through">{formatPrice(product.originalPrice)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-foreground/70">재고</span>
                                <div className={`font-semibold ${product.stock < 10 ? 'text-red-500' : 'text-obsidian'}`}>
                                    {product.stock.toLocaleString()}개
                                    {product.stock === 0 && <Badge variant="destructive" className="ml-2">품절</Badge>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Partner Info Card */}
                    {(product.partnerName || product.partnerEmail) && (
                        <Card className="bg-surface border-blue-100">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary" />
                                    파트너 정보
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {product.partnerName && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-foreground/70">이름</span>
                                        <span className="font-medium">{product.partnerName}</span>
                                    </div>
                                )}
                                {product.partnerEmail && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-foreground/70">이메일</span>
                                        <span className="font-medium text-sm">{product.partnerEmail}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Detailed Info */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Funding Status (Conditional) */}
                    {product.isFunding && (
                        <Card className="border-orange-200 bg-orange-50">
                            <CardHeader>
                                <CardTitle className="text-orange-800 flex items-center gap-2">
                                    🔥 펀딩 프로젝트 정보
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-orange-600/80 mb-1">목표 금액</p>
                                    <p className="text-2xl font-bold text-orange-900">
                                        {product.fundingGoal ? formatPrice(product.fundingGoal) : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-orange-600/80 mb-1">종료일</p>
                                    <p className="text-lg font-medium text-orange-900 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {product.fundingEndDate ? new Date(product.fundingEndDate).toLocaleDateString() : '-'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Basic Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>상세 정보</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h4 className="font-medium text-obsidian mb-2 flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-foreground/70" /> 카테고리
                                </h4>
                                <p className="text-obsidian pl-6">{getCategoryLabel(product.category)}</p>
                            </div>

                            <div>
                                <h4 className="font-medium text-obsidian mb-2">요약</h4>
                                <p className="text-obsidian bg-surface p-3 rounded-lg border">{product.summary}</p>
                            </div>

                            <div>
                                <h4 className="font-medium text-obsidian mb-2">상세 설명</h4>
                                <div
                                    className="prose max-w-none bg-white p-6 rounded-lg border min-h-[150px] text-sm text-obsidian"
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Category Specific Info (Conditional) */}
                    {product.nutritionInfo && Object.values(product.nutritionInfo).some(v => v) && (
                        <Card>
                            <CardHeader><CardTitle>영양 정보</CardTitle></CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.entries(product.nutritionInfo).map(([key, val]: [string, any]) => val && (
                                        <div key={key} className="bg-surface p-2 rounded">
                                            <span className="text-xs text-foreground/70 capitalize">{key}</span>
                                            <p className="font-medium">{val}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Approval Rejection Reason (If any) */}
                    {product.approvalStatus === 'rejected' && product.rejectionReason && (
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader>
                                <CardTitle className="text-red-700 text-base flex items-center gap-2">
                                    <XCircle className="h-5 w-5" /> 거부 사유
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-red-800">{product.rejectionReason}</p>
                            </CardContent>
                        </Card>
                    )}

                </div>
            </div>
        </div>
    );
}
