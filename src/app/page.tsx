'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CharacterImage from '@/components/ui/CharacterImage';
import { ArrowRight, Star, Truck, Shield, Heart, ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: Array<{
    url: string;
    _id: string;
  }>;
  category: string;
  featured?: boolean;
  stock: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products?limit=8&sort=newest');
      
      if (!response.ok) {
        throw new Error('상품을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      
      if (data.products) {
        setProducts(data.products || []);
      } else {
        throw new Error(data.error || '상품을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productId: string) => {
    // 장바구니 추가 로직 (추후 구현)
    console.log('Add to cart:', productId);
  };
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6 animate-fade-in">
                  프리미엄 쇼핑의<br />새로운 경험
                </h1>
                <p className="text-xl text-text-secondary mb-8 animate-slide-up">
                  Youniqle에서 특별한 상품들을 만나보세요. 
                  <br />
                  고품질과 합리적인 가격을 동시에 경험하세요.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up">
                  <Button size="lg" asChild>
                    <Link href="/products">
                      쇼핑 시작하기
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/about">
                      더 알아보기
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Right Content - Character Images */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative w-80 h-80 lg:w-96 lg:h-96">
                  {/* Main Character */}
                  <div className="absolute inset-0">
                    <CharacterImage
                      src="/character/youniqle-1.png"
                      alt="Youniqle 대표 캐릭터"
                      fill
                      className="object-contain animate-fade-in"
                      priority
                      sizes="(max-width: 768px) 320px, 384px"
                    />
                  </div>
                  
                  {/* Floating Characters */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 opacity-60 animate-bounce">
                    <CharacterImage
                      src="/character/youniqle-2.png"
                      alt="Youniqle 캐릭터 2"
                      fill
                      className="object-contain"
                      sizes="64px"
                    />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 opacity-50 animate-pulse">
                    <CharacterImage
                      src="/character/youniqle-3.png"
                      alt="Youniqle 캐릭터 3"
                      fill
                      className="object-contain"
                      sizes="80px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Preview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {[1, 2, 3, 4].map((item) => (
                <Card key={item} className="overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-text-secondary mb-4">
                <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">상품을 불러올 수 없습니다</p>
                <p className="text-sm text-gray-500 mt-2">{error}</p>
              </div>
              <Button onClick={fetchProducts} variant="outline">
                다시 시도
              </Button>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {products.slice(0, 8).map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/products/${product.id}`}>
                    <div className="aspect-square bg-gray-100 relative">
                      {product.images && product.images.length > 0 && product.images[0].url ? (
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
                      {product.featured && (
                        <Badge className="absolute top-3 left-3" variant="secondary">
                          인기
                        </Badge>
                      )}
                      {product.stock <= 5 && product.stock > 0 && (
                        <Badge className="absolute top-3 right-3" variant="destructive">
                          품절임박
                        </Badge>
                      )}
                      {product.stock === 0 && (
                        <Badge className="absolute top-3 right-3" variant="outline">
                          품절
                        </Badge>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-6">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold mb-2 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    </Link>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">
                        ₩{product.price.toLocaleString()}
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddToCart(product.id)}
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        {product.stock === 0 ? '품절' : '장바구니'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-text-secondary mb-4">
                <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">등록된 상품이 없습니다</p>
                <p className="text-sm text-gray-500 mt-2">새로운 상품이 곧 등록될 예정입니다.</p>
              </div>
            </div>
          )}
          
          {products.length > 0 && (
            <div className="text-center">
              <Button size="lg" asChild>
                <Link href="/products">
                  모든 상품 보기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              왜 Youniqle을 선택해야 할까요?
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              고객 만족을 최우선으로 하는 서비스와 품질을 경험해보세요.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 relative">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">프리미엄 품질</h3>
                <p className="text-text-secondary">
                  엄선된 고품질 상품만을 선별하여 제공합니다.
                </p>
                {/* Character 4 */}
                <div className="absolute -top-2 -right-2 w-12 h-12 opacity-30">
                  <CharacterImage
                    src="/character/youniqle-4.png"
                    alt="품질 캐릭터"
                    fill
                    className="object-contain"
                    sizes="48px"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 relative">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">빠른 배송</h3>
                <p className="text-text-secondary">
                  전국 어디든 빠르고 안전한 배송 서비스를 제공합니다.
                </p>
                {/* Character 5 */}
                <div className="absolute -top-2 -right-2 w-12 h-12 opacity-30">
                  <CharacterImage
                    src="/character/youniqle-5.png"
                    alt="배송 캐릭터"
                    fill
                    className="object-contain"
                    sizes="48px"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 relative">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-4">안전한 결제</h3>
                <p className="text-text-secondary">
                  안전한 결제 시스템으로 보호받는 쇼핑을 경험하세요.
                </p>
                {/* Character 6 */}
                <div className="absolute -top-2 -right-2 w-12 h-12 opacity-30">
                  <CharacterImage
                    src="/character/youniqle-6.png"
                    alt="보안 캐릭터"
                    fill
                    className="object-contain"
                    sizes="48px"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-primary text-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            특별 할인 소식을 받아보세요
          </h2>
          <p className="text-xl mb-8 opacity-90">
            신규 회원가입 시 10% 할인 쿠폰을 드립니다.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="이메일 주소를 입력하세요"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button variant="secondary" size="lg">
              구독하기
            </Button>
          </div>
        </div>
        
        {/* Background Characters */}
        <div className="absolute top-4 left-4 w-16 h-16 opacity-20">
          <CharacterImage
            src="/character/youniqle-2.png"
            alt="뉴스레터 캐릭터"
            fill
            className="object-contain"
            sizes="64px"
          />
        </div>
        <div className="absolute bottom-4 right-4 w-20 h-20 opacity-20">
          <CharacterImage
            src="/character/youniqle-3.png"
            alt="뉴스레터 캐릭터"
            fill
            className="object-contain"
            sizes="80px"
          />
        </div>
      </section>
    </div>
  );
}

