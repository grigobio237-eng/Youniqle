'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { Heart, ShoppingCart } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images: Array<{
    url: string;
    w?: number;
    h?: number;
  }>;
  summary: string;
  category: string;
}

interface ProductListProps {
  searchParams: {
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
  };
}

export default function ProductList({ searchParams }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (searchParams.q) params.append('q', searchParams.q);
        if (searchParams.category) params.append('category', searchParams.category);
        if (searchParams.sort) params.append('sort', searchParams.sort);
        if (searchParams.page) params.append('page', searchParams.page);

        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setProducts(data.products);
          setPagination(data.pagination);
        } else {
          console.error('Failed to fetch products:', data.error);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const { addToCart, loading: cartLoading } = useCart();

  const handleAddToCart = async (productId: string) => {
    const success = await addToCart(productId, 1);
    if (success) {
      alert('장바구니에 추가되었습니다.');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <div className="aspect-square bg-gray-200 animate-pulse rounded-t-2xl" />
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-3 bg-gray-200 animate-pulse rounded mb-4" />
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 animate-pulse rounded w-20" />
                <div className="h-8 bg-gray-200 animate-pulse rounded w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary text-lg">상품을 찾을 수 없습니다.</p>
        <p className="text-text-secondary text-sm mt-2">
          다른 검색어로 시도해보세요.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product._id} className="overflow-hidden">
            <Link href={`/products/${product._id}`}>
              <div className="aspect-square relative bg-gray-100">
                {product.images.length > 0 ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <Heart className="h-12 w-12" />
                  </div>
                )}
                {product.stock === 0 && (
                  <Badge className="absolute top-3 left-3" variant="destructive">
                    품절
                  </Badge>
                )}
              </div>
            </Link>
            
            <CardContent className="p-6">
              <div className="mb-2">
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              </div>
              
              <h3 className="font-semibold mb-2 line-clamp-2">
                <Link 
                  href={`/products/${product._id}`}
                  className="hover:text-primary transition-colors"
                >
                  {product.name}
                </Link>
              </h3>
              
              <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                {product.summary}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(product._id)}
                  disabled={product.stock === 0 || cartLoading}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  {product.stock === 0 ? '품절' : cartLoading ? '추가중...' : '담기'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-12">
          <div className="flex space-x-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === pagination.page ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <Link href={`/products?${new URLSearchParams({
                  ...searchParams,
                  page: page.toString(),
                }).toString()}`}>
                  {page}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}


