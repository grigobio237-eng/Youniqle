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
import { useLanguage } from '@/contexts/LanguageContext';
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
  ChevronRight,
  Tag,
  Gift,
  Bell,
  MessageCircle,
  CheckCircle,
  XCircle
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
  const { t } = useLanguage();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [stockAlertRegistered, setStockAlertRegistered] = useState(false);
  const [registeringStockAlert, setRegisteringStockAlert] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, []);

  useEffect(() => {
    if (session?.user && product) {
      checkWishlistStatus();
      checkStockAlertStatus();
    }
  }, [session, product]);

  const checkStockAlertStatus = async () => {
    if (!session?.user || !product || product.stock > 0) return;

    try {
      const response = await fetch(`/api/stock-alerts?productId=${product._id}`);
      if (response.ok) {
        const data = await response.json();
        // 이미 알림이 등록되어 있는지 확인
        if (data.alerts && data.alerts.some((alert: any) => 
          alert.product?._id === product._id && !alert.notified
        )) {
          setStockAlertRegistered(true);
        }
      }
    } catch (error) {
      console.error('재입고 알림 상태 확인 오류:', error);
    }
  };

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
      alert(t('auth.loginRequired'));
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
        alert(t('cart.addSuccess', { name: product?.name, count: quantity }));
        // 헤더 장바구니 개수 업데이트
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const errorData = await response.json();
        alert(t('cart.addFailed', { error: errorData.error }));
      }
    } catch (error) {
      console.error('장바구니 추가 중 오류:', error);
      alert(t('cart.addError'));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!session?.user) {
      alert(t('auth.loginRequired'));
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
        alert(isInWishlist ? t('cart.wishlistRemoveSuccess') : t('cart.wishlistAddSuccess'));
      } else {
        const errorData = await response.json();
        alert(t('cart.wishlistFailed', { error: errorData.error }));
      }
    } catch (error) {
      console.error('위시리스트 처리 중 오류:', error);
      alert(t('cart.wishlistError'));
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

  const handleStockAlert = async () => {
    if (!session?.user) {
      alert('재입고 알림은 로그인이 필요합니다.');
      return;
    }

    setRegisteringStockAlert(true);
    try {
      const response = await fetch('/api/stock-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product?._id,
        }),
      });

      if (response.ok) {
        setStockAlertRegistered(true);
        alert('재입고 알림이 등록되었습니다. 재입고 시 이메일로 알려드리겠습니다.');
      } else {
        const errorData = await response.json();
        if (errorData.error?.includes('이미 등록')) {
          setStockAlertRegistered(true);
          alert('이미 재입고 알림이 등록되어 있습니다.');
        } else {
          alert(errorData.error || '재입고 알림 등록에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('재입고 알림 등록 중 오류:', error);
      alert('재입고 알림 등록 중 오류가 발생했습니다.');
    } finally {
      setRegisteringStockAlert(false);
    }
  };

  const scrollToQnA = () => {
    const qnaSection = document.getElementById('product-qna');
    if (qnaSection) {
      qnaSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('productDetail.loading')}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{t('productDetail.notFound')}</h2>
            <p className="text-gray-600 mb-6">
              요청하신 상품이 존재하지 않거나 삭제되었습니다.
            </p>
              <Button asChild>
                <Link href="/products">{t('productDetail.backToList')}</Link>
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
                  <Badge className="bg-yellow-100 text-yellow-800">{t('products.popular')}</Badge>
                )}
                {discountRate > 0 && (
                  <Badge className="bg-red-100 text-red-800">{t('productDetail.discount', { percent: discountRate })}</Badge>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{t('productDetail.stock')}:</span>
                <span className={`font-medium ${
                  product.stock > 10 ? 'text-green-600' :
                  product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {product.stock > 0 ? t('productDetail.stockRemaining', { count: product.stock }) : t('productDetail.outOfStock')}
                </span>
              </div>
              {/* 재입고 알림 버튼 (품절 시) */}
              {product.stock === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStockAlert}
                  disabled={registeringStockAlert || stockAlertRegistered}
                  className={`flex items-center space-x-2 ${
                    stockAlertRegistered ? 'bg-green-50 border-green-200 text-green-700' : ''
                  }`}
                >
                  {stockAlertRegistered ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>알림 등록됨</span>
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4" />
                      <span>{registeringStockAlert ? '등록 중...' : '재입고 알림 받기'}</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* 수량 선택 */}
            {product.stock > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">{t('productDetail.quantity')}:</span>
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
                <span className="text-lg font-medium text-gray-700">{t('productDetail.totalPrice')}</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(product.price * quantity)}원
                </span>
              </div>
            </div>

            {/* 쿠폰 안내 */}
            <Card className="mb-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Gift className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold text-orange-800">쿠폰 혜택</span>
                </div>
                <p className="text-sm text-orange-700 mb-3">
                  구매 시 쿠폰을 사용하여 추가 할인을 받을 수 있습니다!
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild className="text-orange-700 border-orange-300">
                    <Link href="/coupons">
                      <Tag className="h-4 w-4 mr-1" />
                      쿠폰 다운로드
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="text-orange-700 border-orange-300">
                    <Link href="/me/coupons">
                      <Gift className="h-4 w-4 mr-1" />
                      내 쿠폰함
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 액션 버튼들 */}
            <div className="space-y-3">
              {/* 메인 구매 버튼 */}
              <Button
                onClick={() => window.location.href = `/checkout?product=${product._id}&quantity=${quantity}`}
                disabled={product.stock === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
              >
                {product.stock === 0 ? t('productDetail.outOfStock') : t('productDetail.buyNow')}
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
                  {isInWishlist ? t('productDetail.removeFromWishlist') : t('productDetail.addToWishlist')}
                </Button>
                
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className="flex-1"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.stock === 0 ? t('productDetail.outOfStock') : t('productDetail.addToCart')}
                </Button>
              </div>
            </div>

            {/* 추가 기능 버튼들 */}
            <div className="flex flex-wrap gap-2">
              <SocialSharing
                productName={product.name}
                productUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/products/${product._id}`}
                productPrice={product.price}
              />
              <Button
                variant="outline"
                onClick={scrollToQnA}
                className="flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>상품 문의하기</span>
              </Button>
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

            {/* 교환/반품 안내 */}
            <div className="bg-purple-50 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold text-purple-900 flex items-center">
                <RotateCcw className="h-4 w-4 mr-2" />
                교환/반품 안내
              </h3>
              <div className="text-sm text-purple-800 space-y-1">
                <p>• <strong>반품 가능 기간:</strong> 배송 완료 후 7일 이내</p>
                <p>• <strong>반품 불가:</strong> 고객 단순 변심 (단, 미개봉 제품은 가능)</p>
                <p>• <strong>교환 가능:</strong> 상품 불량, 오배송 시 무료 교환</p>
                <p>• <strong>반품 배송비:</strong> 단순 변심 시 5,000원 (상품 불량 시 무료)</p>
                <p>• <strong>반품 주소:</strong> 서울특별시 강동구 고덕비즈밸리로 26</p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-purple-700 underline text-xs mt-2"
                  onClick={() => window.open('/terms', '_blank')}
                >
                  자세한 교환/반품 정책 보기 →
                </Button>
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
        <div id="product-qna" className="mt-12 scroll-mt-20">
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
