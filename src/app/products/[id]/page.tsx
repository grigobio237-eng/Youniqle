'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CharacterImage from '@/components/ui/CharacterImage';
import ReviewSection from '@/components/reviews/ReviewSection';
import ReviewForm from '@/components/reviews/ReviewForm';
import RelatedProducts from '@/components/products/RelatedProducts';
import CategorySpecificInfo from '@/components/products/CategorySpecificInfo';
import QuestionSection from '@/components/qa/QuestionSection';
import SocialSharing from '@/components/products/SocialSharing';
import { addToRecentlyViewed } from '@/components/products/RecentlyViewed';
import { 
  Heart, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Truck, 
  Shield, 
  RotateCcw,
  Star,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
  summary: string;
  description: string;
  images: Array<{
    url: string;
    w?: number;
    h?: number;
    type?: string;
  }>;
  status: 'active' | 'inactive';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, []);

  useEffect(() => {
    if (session?.user && product) {
      checkWishlistStatus();
    }
  }, [session, product]);

  useEffect(() => {
    if (product) {
      // 최근 본 상품에 추가
      addToRecentlyViewed({
        _id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        images: product.images,
        category: product.category,
        summary: product.summary,
        stock: product.stock,
        featured: product.featured,
      });
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      const { id } = await params;
      const response = await fetch(`/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      } else {
        console.error('상품 조회 실패');
      }
    } catch (error) {
      console.error('상품 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    if (!session?.user || !product) return;

    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        const isInList = data.wishlist?.some((item: any) => 
          item.productId._id === product._id
        );
        setIsInWishlist(isInList);
      }
    } catch (error) {
      console.error('위시리스트 상태 확인 오류:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!session?.user) {
      alert('로그인이 필요합니다.');
      return;
    }

    setAddingToCart(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product?._id,
          quantity: quantity,
        }),
      });

      if (response.ok) {
        alert(`${product?.name} ${quantity}개가 장바구니에 추가되었습니다!`);
        // 헤더 장바구니 개수 업데이트
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const errorData = await response.json();
        alert(`장바구니 추가 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('장바구니 추가 중 오류:', error);
      alert('장바구니 추가 중 오류가 발생했습니다.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!session?.user) {
      alert('로그인이 필요합니다.');
      return;
    }

    setAddingToWishlist(true);
    try {
      const method = isInWishlist ? 'DELETE' : 'POST';
      const response = await fetch('/api/wishlist', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product?._id,
        }),
      });

      if (response.ok) {
        setIsInWishlist(!isInWishlist);
        alert(isInWishlist ? '위시리스트에서 제거되었습니다.' : '위시리스트에 추가되었습니다!');
      } else {
        const errorData = await response.json();
        alert(`위시리스트 처리 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('위시리스트 처리 중 오류:', error);
      alert('위시리스트 처리 중 오류가 발생했습니다.');
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!product?.images) return;
    
    const totalImages = product.images.length;
    if (direction === 'prev') {
      setSelectedImageIndex(prev => 
        prev === 0 ? totalImages - 1 : prev - 1
      );
    } else {
      setSelectedImageIndex(prev => 
        prev === totalImages - 1 ? 0 : prev + 1
      );
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR');
  };

  const calculateDiscount = () => {
    if (!product?.originalPrice || !product?.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">상품을 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-6">
              요청하신 상품이 존재하지 않거나 삭제되었습니다.
            </p>
              <Button asChild>
                <Link href="/products">상품 목록으로 돌아가기</Link>
              </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const discountRate = calculateDiscount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* 브레드크럼 */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600">홈</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-blue-600">상품</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category}`} className="hover:text-blue-600">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* 이미지 갤러리 */}
          <div className="space-y-4">
            {/* 메인 이미지 */}
            <div className="relative aspect-square bg-white rounded-lg shadow-lg overflow-hidden">
              {product.images && product.images.length > 0 && product.images[0]?.url ? (
                <>
                  <Image
                    src={product.images[selectedImageIndex].url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={selectedImageIndex === 0}
                  />
                  {product.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={() => handleImageNavigation('prev')}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={() => handleImageNavigation('next')}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <CharacterImage
                    src="/character/youniqle-4.png"
                    alt="상품 이미지 없음"
                    width={200}
                    height={200}
                    className="object-contain opacity-50"
                    sizes="200px"
                  />
                </div>
              )}
            </div>

            {/* 썸네일 이미지들 */}
            {product.images && product.images.length > 1 && product.images.every(img => img?.url) && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index 
                        ? 'border-blue-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="space-y-6">
            {/* 상품 기본 정보 */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                {product.featured && (
                  <Badge className="bg-yellow-100 text-yellow-800">인기</Badge>
                )}
                {discountRate > 0 && (
                  <Badge className="bg-red-100 text-red-800">{discountRate}% 할인</Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <p className="text-gray-600 text-lg mb-4">{product.summary}</p>
              
              <div className="flex items-center space-x-4 mb-4">
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}원
                  </span>
                )}
                <span className="text-3xl font-bold text-blue-600">
                  {formatPrice(product.price)}원
                </span>
              </div>
            </div>

            {/* 재고 상태 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">재고:</span>
              <span className={`font-medium ${
                product.stock > 10 ? 'text-green-600' :
                product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {product.stock > 0 ? `${product.stock}개 남음` : '품절'}
              </span>
            </div>

            {/* 수량 선택 */}
            {product.stock > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">수량:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-1 text-center min-w-[3rem]">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* 총 가격 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-700">총 상품금액</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(product.price * quantity)}원
                </span>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="space-y-3">
              {/* 메인 구매 버튼 */}
              <Button
                onClick={() => window.location.href = `/checkout?product=${product._id}&quantity=${quantity}`}
                disabled={product.stock === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
              >
                {product.stock === 0 ? '품절' : '바로 구매하기'}
              </Button>
              
              {/* 보조 버튼들 */}
              <div className="flex space-x-3">
                <Button
                  variant={isInWishlist ? "default" : "outline"}
                  onClick={handleToggleWishlist}
                  disabled={addingToWishlist}
                  className="flex-1"
                >
                  <Heart className={`h-4 w-4 mr-2 ${isInWishlist ? 'fill-current' : ''}`} />
                  {isInWishlist ? '위시리스트 제거' : '위시리스트'}
                </Button>
                
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className="flex-1"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.stock === 0 ? '품절' : '장바구니 담기'}
                </Button>
              </div>
            </div>

            {/* 추가 기능 버튼들 */}
            <div className="flex space-x-2">
              <SocialSharing
                productName={product.name}
                productUrl={`${window.location.origin}/products/${product._id}`}
                productPrice={product.price}
              />
            </div>

            {/* 배송 정보 */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold text-blue-900 flex items-center">
                <Truck className="h-4 w-4 mr-2" />
                배송 정보
              </h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• 무료배송 (3만원 이상 구매시, 국내배송 한정)</p>
                <p>• 평일 오후 2시 이전 주문시 당일 발송</p>
                <p>• 배송 기간: 1-2일 (주말/공휴일 제외)</p>
                <p>• 섬지역 추가 배송비: 5,000원</p>
              </div>
            </div>

            {/* 안전 결제 정보 */}
            <div className="bg-green-50 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold text-green-900 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                안전 결제
              </h3>
              <div className="text-sm text-green-800 space-y-1">
                <p>• Nicepay 보안 결제 시스템</p>
                <p>• SSL 암호화 통신</p>
                <p>• 7일 무조건 환불 보장</p>
              </div>
            </div>
          </div>
        </div>

        {/* 카테고리별 특화 정보 */}
        <div className="mt-12">
          <CategorySpecificInfo product={product} />
        </div>

        {/* 상품 상세 정보 */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">상품 설명</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 리뷰 섹션 */}
        <div className="mt-12">
          <ReviewSection productId={product._id} />
        </div>

        {/* 리뷰 작성 폼 */}
        <div className="mt-12">
          <ReviewForm 
            productId={product._id}
            productName={product.name}
            onReviewSubmitted={() => {
              // 리뷰 섹션 새로고침
              window.location.reload();
            }}
          />
        </div>

        {/* Q&A 섹션 */}
        <div className="mt-12">
          <QuestionSection 
            productId={product._id}
            productName={product.name}
          />
        </div>

        {/* 관련 상품 섹션 */}
        <div className="mt-12">
          <RelatedProducts 
            productId={product._id}
            currentProductName={product.name}
            currentProductCategory={product.category}
          />
        </div>
      </div>
    </div>
  );
}
