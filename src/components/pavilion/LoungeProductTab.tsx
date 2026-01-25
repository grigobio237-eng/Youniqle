'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Sparkles, Dna, FlaskConical } from 'lucide-react';

interface Product {
    id: string;
    _id?: string;
    name: string;
    slug: string;
    summary: string;
    price: number;
    minPrice?: number;
    maxPrice?: number;
    originalPrice?: number;
    images: Array<{ url: string }>;
    category: string;
}

interface LoungeProductTabProps {
    category?: string;
}


function ProductCardSkeleton() {
    return (
        <Card className="bg-white/50 backdrop-blur-sm border-2 border-slate-50 rounded-[40px] overflow-hidden">
            <Skeleton className="aspect-square w-full bg-slate-100" />
            <CardContent className="p-6 space-y-3">
                <Skeleton className="h-4 w-3/4 bg-slate-100" />
                <Skeleton className="h-3 w-full bg-slate-100" />
                <Skeleton className="h-6 w-1/2 bg-slate-100" />
            </CardContent>
        </Card>
    );
}

export default function LoungeProductTab({ category = 'stem-cell' }: LoungeProductTabProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [useApiData, setUseApiData] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            console.log(`[LoungeProductTab] Fetching products for category: ${category}...`);
            setLoading(true);
            try {
                // API에서 줄기세포 카테고리 상품 조회 시도
                // API에서 5층 전용 상품 조회
                const res = await fetch(`/api/products?pavilionFloorId=floor-5&limit=8`);

                if (res.ok) {
                    const data = await res.json();
                    console.log(`[LoungeProductTab] API responded with ${data.products?.length || 0} products.`);

                    if (data.products && data.products.length > 0) {
                        setProducts(data.products);
                        setUseApiData(true);
                    } else {
                        console.warn('[LoungeProductTab] No products found in API.');
                        setProducts([]);
                        setUseApiData(false);
                    }
                } else {
                    console.error(`[LoungeProductTab] API error: ${res.status}`);
                    setProducts([]);
                    setUseApiData(false);
                }
            } catch (error) {
                console.error('[LoungeProductTab] Error fetching products:', error);
                setProducts([]);
                setUseApiData(false);
            } finally {
                setLoading(false);
                console.log('[LoungeProductTab] Loading finished.');
            }
        };

        fetchProducts();
    }, [category]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ko-KR').format(price);
    };

    return (
        <div className="space-y-12">
            {/* 헤더 섹션 */}
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                    <Dna className="w-6 h-6 text-luxury-gold" />
                    <Badge className="bg-luxury-gold/10 text-luxury-gold border-none font-black px-4 py-1.5 uppercase tracking-widest text-[10px]">
                        Stem Cell Solutions
                    </Badge>
                    <FlaskConical className="w-6 h-6 text-luxury-gold" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-luxury-navy tracking-tighter italic">
                    프리미엄 <span className="luxury-gold-text">줄기세포</span> 라인업
                </h2>
                <p className="text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                    김미정 원장이 직접 엄선한 고기능성 줄기세포 유래 성분 제품으로,
                    <br className="hidden md:block" />
                    피부 본연의 재생력을 깨워 근본적인 회복을 경험하세요.
                </p>
            </div>

            {/* 상품 그리드 */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.1 },
                        },
                    }}
                >
                    {products.map((product) => {
                        const productId = product._id || product.id;
                        const imageUrl = product.images?.[0]?.url || '/images/placeholder-product.jpg';
                        const hasDiscount = product.originalPrice && product.originalPrice > product.price;
                        const discountPercent = hasDiscount
                            ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
                            : 0;

                        return (
                            <motion.div
                                key={productId}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                            >
                                <Link href={`/products/${productId}`}>
                                    <Card className="group cursor-pointer bg-white border-2 border-slate-50 rounded-[40px] overflow-hidden hover:border-luxury-gold/30 hover:shadow-2xl hover:shadow-luxury-gold/5 transition-all duration-500">
                                        {/* 이미지 섹션 */}
                                        <div className="relative aspect-square overflow-hidden bg-slate-50">
                                            <Image
                                                src={imageUrl}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            {hasDiscount && (
                                                <Badge className="absolute top-4 left-4 bg-red-500 text-white border-none font-black px-3 py-1 text-xs">
                                                    -{discountPercent}%
                                                </Badge>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-luxury-navy/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        </div>

                                        {/* 정보 섹션 */}
                                        <CardContent className="p-6 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-3 h-3 text-luxury-gold" />
                                                <span className="text-[10px] font-black text-luxury-gold uppercase tracking-widest">
                                                    {product.category}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-black text-luxury-navy group-hover:text-luxury-gold transition-colors line-clamp-1">
                                                {product.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 font-medium line-clamp-2 min-h-[32px]">
                                                {product.summary}
                                            </p>
                                            <div className="flex flex-col gap-0.5 pt-2">
                                                {product.minPrice && product.maxPrice ? (
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-xl font-black text-luxury-navy">
                                                            ₩{formatPrice(product.minPrice)}
                                                        </span>
                                                        <span className="text-slate-300 font-black">~</span>
                                                        <span className="text-xl font-black text-luxury-navy">
                                                            ₩{formatPrice(product.maxPrice)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-end gap-2">
                                                        <span className="text-xl font-black text-luxury-navy">
                                                            ₩{formatPrice(product.price)}
                                                        </span>
                                                        {hasDiscount && (
                                                            <span className="text-sm text-slate-400 line-through">
                                                                ₩{formatPrice(product.originalPrice!)}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {/* 안내 문구 */}
            {!useApiData && !loading && products.length === 0 && (
                <p className="text-center text-slate-400 font-medium py-20">
                    현재 등록된 프리미엄 솔루션이 없습니다.
                </p>
            )}
        </div>
    );
}
