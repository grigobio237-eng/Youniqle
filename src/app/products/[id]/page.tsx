'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  XCircle,
  Sparkles
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  minPrice?: number;
  maxPrice?: number;
  originalPrice?: number;
  stock: number;
  category: string;
  summary: string;
  description: string;
  descriptionIsHtml?: boolean;
  images: Array<{
    url: string;
    w?: number;
    h?: number;
    type?: string;
  }>;
  status: 'active' | 'inactive';
  featured: boolean;
  isFunding?: boolean;
  fundingGoal?: number;
  fundingEndDate?: string;
  participantCount?: number;
  totalFundingAmount?: number;
  createdAt: string;
  updatedAt: string;
}

// Helper function to calculate funding status
const getFundingStatus = (product: Product) => {
  if (!product.isFunding || !product.fundingGoal || !product.fundingEndDate) return null;

  const now = new Date();
  const endDate = new Date(product.fundingEndDate);
  const timeLeft = endDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  const currentAmount = product.totalFundingAmount || 0;
  const goal = product.fundingGoal;
  const percent = Math.min(Math.round((currentAmount / goal) * 100), 100);
  // Display percent can be over 100%
  const displayPercent = Math.round((currentAmount / goal) * 100);

  return { daysLeft, percent, displayPercent, currentAmount, goal };
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession();
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

  const [openInquiryForm, setOpenInquiryForm] = useState(false);

  useEffect(() => {
    if (product) {
      // 최근 본 상품에 추가
      addToRecentlyViewed({
        _id: product._id,
        name: product.name,
        price: product.price,
        minPrice: product.minPrice,
        maxPrice: product.maxPrice,
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
      if (confirm('로그인이 필요한 서비스입니다. 회원가입 하시겠습니까?')) {
        // 현재 페이지 URL을 callbackUrl로 전달
        window.location.href = `/auth/signup?callbackUrl=${encodeURIComponent(window.location.href)}`;
      }
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
        alert(`${product?.name} 상품 ${quantity}개가 장바구니에 담겼습니다.`);
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
      alert('로그인이 필요한 서비스입니다.');
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
        alert(isInWishlist ? '위시리스트에서 제거되었습니다.' : '위시리스트에 추가되었습니다.');
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-obsidian">상품 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">상품을 찾을 수 없습니다</h2>
            <p className="text-obsidian mb-6">
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
  const fundingStatus = product && product.isFunding ? getFundingStatus(product) : null;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* 브레드크럼 또는 뒤로가기 버튼 */}
        {product.category === 'stem-cell' ? (
          <Link
            href="/products?category=stem-cell"
            className="flex items-center text-sm font-bold text-text-secondary hover:text-primary mb-6 transition-all group"
          >
            <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            줄기세포 솔루션 리스트로 돌아가기
          </Link>
        ) : (
          <div className="flex items-center space-x-2 text-sm text-text-secondary mb-6">
            <Link href="/" className="hover:text-primary">홈</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary">상품</Link>
            <span>/</span>
            <Link href={`/products?category=${product.category}`} className="hover:text-primary">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-text-primary">{product.name}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* 이미지 갤러리 */}
          <div className="space-y-4">
            {/* 메인 이미지 */}
            <div className="relative aspect-square bg-white rounded-3xl shadow-sm overflow-hidden border border-line">
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
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                        onClick={() => handleImageNavigation('prev')}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
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
                  />
                </div>
              )}
            </div>

            {/* 썸네일 이미지들 */}
            {product.images && product.images.length > 1 && product.images.every(img => img?.url) && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={`${product.name} ${index + 1}번 이미지 보기`}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImageIndex === index
                      ? 'border-primary'
                      : 'border-transparent hover:border-gray-300'
                      }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
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
                <Badge variant="outline" className="text-primary border-primary">{product.category}</Badge>
                {product.featured && (
                  <Badge className="bg-reward-gold text-white border-none">인기 상품</Badge>
                )}
                {product.isFunding && (
                  <Badge className="bg-status-amber text-white border-none">펀딩 진행중</Badge>
                )}
                {!product.isFunding && discountRate > 0 && (
                  <Badge className="bg-status-danger text-white border-none">{discountRate}% 특별 할인</Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold text-text-primary mb-4 leading-tight">{product.name}</h1>
              <p className="text-text-secondary text-lg mb-6 leading-relaxed">{product.summary}</p>

              {product.isFunding && fundingStatus ? (
                <div className="space-y-4 p-6 bg-white rounded-3xl border border-line shadow-sm">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">모인 금액</p>
                      <span className="text-3xl font-bold text-status-amber">
                        {formatPrice(fundingStatus.currentAmount)}원
                      </span>
                      <span className="text-sm text-text-secondary ml-2 font-medium">
                        {fundingStatus.displayPercent}% 달성
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-text-secondary mb-1">남은 시간</p>
                      <span className="text-2xl font-bold text-text-primary">
                        {fundingStatus.daysLeft > 0 ? `${fundingStatus.daysLeft}일` : '마감임박'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Progress value={fundingStatus.percent} className="h-2 bg-gray-100" indicatorClassName="bg-status-amber" />
                    <div className="flex justify-between text-xs text-text-secondary pt-1">
                      <span>목표 금액 {formatPrice(fundingStatus.goal)}원</span>
                      <span>{product.participantCount || 0}명 참여</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline space-x-3 mb-6">
                  {product.category === 'stem-cell' && (product.minPrice || (product as any).minPrice) && (product.maxPrice || (product as any).maxPrice) ? (
                    <div className="flex items-center gap-2">
                      <span className="font-black text-primary text-4xl">
                        ₩{formatPrice(product.minPrice || (product as any).minPrice)}
                      </span>
                      <span className="text-slate-300 font-bold text-2xl">~</span>
                      <span className="font-black text-primary text-4xl">
                        ₩{formatPrice(product.maxPrice || (product as any).maxPrice)}
                      </span>
                    </div>
                  ) : (
                    <>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-text-secondary line-through text-xl">
                          {formatPrice(product.originalPrice)}원
                        </span>
                      )}
                      <span className="font-bold text-primary text-4xl">
                        {formatPrice(product.price)}원
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 재고 상태 */}
            {!product.isFunding && (
              <div className="flex items-center justify-between py-4 border-y border-line">
                {product.category !== 'stem-cell' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-text-secondary">재고 상태:</span>
                    <span className={`font-bold ${product.stock > 10 ? 'text-status-good' :
                      product.stock > 0 ? 'text-status-amber' : 'text-status-danger'
                      }`}>
                      {product.stock > 0 ? `${product.stock}개 남음` : '품절'}
                    </span>
                  </div>
                )}
                {/* 재입고 알림 버튼 */}
                {product.stock === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStockAlert}
                    disabled={registeringStockAlert || stockAlertRegistered}
                    className={`rounded-full ${stockAlertRegistered ? 'bg-status-good/10 border-status-good text-status-good' : ''}`}
                  >
                    {stockAlertRegistered ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>알림 등록됨</span>
                      </>
                    ) : (
                      <>
                        <Bell className="h-4 w-4 mr-2" />
                        <span>{registeringStockAlert ? '등록 중...' : '재입고 알림 받기'}</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* 수량 선택 */}
            {product.category !== 'stem-cell' && product.stock > 0 && (
              <div className="flex items-center space-x-6">
                <span className="text-sm font-bold text-text-primary">{product.isFunding ? '참여 구좌 수' : '구매 수량'}</span>
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="h-10 w-10 p-0 hover:bg-white hover:shadow-sm rounded-lg"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-6 py-1 text-center min-w-[3rem] font-bold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="h-10 w-10 p-0 hover:bg-white hover:shadow-sm rounded-lg"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* 총 가격 */}
            {product.category !== 'stem-cell' && (
              <div className="bg-mist p-6 rounded-3xl">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-text-primary">{product.isFunding ? '총 펀딩 금액' : '주문 금액'}</span>
                  <span className={`text-3xl font-black ${product.isFunding ? 'text-status-amber' : 'text-primary'}`}>
                    {formatPrice(product.price * quantity)}원
                  </span>
                </div>
              </div>
            )}

            {/* 액션 버튼들 */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={() => {
                  if (product.category === 'stem-cell') {
                    setOpenInquiryForm(true);
                    scrollToQnA();
                  } else {
                    window.location.href = `/checkout?product=${product._id}&quantity=${quantity}`;
                  }
                }}
                disabled={product.stock === 0 && product.category !== 'stem-cell'}
                className={`w-full text-xl py-8 rounded-[16px] font-black shadow-lg transition-all active:scale-[0.98] ${product.category === 'stem-cell'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-200'
                  : product.isFunding
                    ? 'bg-status-amber hover:bg-primary shadow-primary/20'
                    : 'btn-primary shadow-primary/20'
                  }`}
              >
                {product.category === 'stem-cell' ? '지금 상담하기' : (product.stock === 0 ? '품절되었습니다' : (product.isFunding ? '지금 펀딩하기' : '지금 구매하기'))}
              </Button>

              <div className="flex space-x-3">
                <Button
                  variant={isInWishlist ? "default" : "outline"}
                  onClick={handleToggleWishlist}
                  disabled={addingToWishlist}
                  className={`flex-1 py-7 rounded-[16px] font-bold ${isInWishlist ? 'bg-status-danger text-white border-none' : 'btn-outline'}`}
                >
                  <Heart className={`h-5 w-5 mr-2 ${isInWishlist ? 'fill-current' : ''}`} />
                  {isInWishlist ? '관심 상품 해제' : '관심 상품 등록'}
                </Button>

                {product.category !== 'stem-cell' && !product.isFunding && (
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || addingToCart}
                    variant="outline"
                    className="flex-1 py-7 rounded-[16px] font-bold btn-outline hover:bg-white"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    장바구니 담기
                  </Button>
                )}
              </div>
            </div>

            {/* 추가 기능 버튼들 (공유 등) */}
            <div className="flex flex-wrap gap-2 mt-4">
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

            {/* 배송/결제/교환 안내 (펀딩 및 줄기세포 제외) */}
            {product.category !== 'stem-cell' && !product.isFunding ? (
              <div className="space-y-4 mt-8">
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
                      className="p-0 h-auto text-secondary underline text-xs mt-2"
                      onClick={() => window.open('/terms', '_blank')}
                    >
                      자세한 교환/반품 정책 보기 →
                    </Button>
                  </div>
                </div>
              </div>
            ) : product.isFunding ? (
              <div className="space-y-4 mt-8">
                <div className="bg-surface p-5 rounded-xl border border-line">
                  <h3 className="font-bold text-obsidian mb-3 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-obsidian" />
                    펀딩/후원 안내
                  </h3>
                  <div className="text-sm text-obsidian space-y-2">
                    <p>• 펀딩은 일반 쇼핑과 달리 예약 구매의 성격을 띱니다.</p>
                    <p>• 목표 달성 시 결제가 진행되며, 종료일 이후 순차 발송됩니다.</p>
                    <p>• 단순 변심에 의한 환불은 펀딩 종료 전까지만 가능합니다.</p>
                    <p>• 프로젝트 사정에 따라 발송이 지연될 수 있습니다.</p>
                  </div>
                </div>
              </div>
            ) : (
              /* 줄기세포 전용 안내 */
              <div className="space-y-4 mt-8">
                <div className="bg-purple-50 p-6 rounded-[24px] border border-purple-100">
                  <h3 className="font-bold text-purple-900 mb-3 flex items-center italic">
                    <Sparkles className="h-5 w-5 mr-2 text-secondary" />
                    Premium Consultation
                  </h3>
                  <div className="text-sm text-purple-800 space-y-3 font-medium">
                    <p>• 본 프로그램은 개인의 피부 상태에 따른 1:1 맞춤형 정밀 진단 후 진행됩니다.</p>
                    <p>• {"'"}상담하기{"'"}를 통해 희망하시는 케어 부위와 고민을 남겨주시면 담당 메디컬 마케터가 24시간 내에 연락드립니다.</p>
                    <p>• 프라이빗 라운지 예약은 확정 알림 후 최종 완료됩니다.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 카테고리별 특화 정보 */}
        <div className="mt-12">
          <CategorySpecificInfo product={product} />
        </div>

        {/* 상품 상세 정보 */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-obsidian mb-6">상품 설명</h2>
            <div className={`prose prose-gray max-w-none ${product.descriptionIsHtml ? 'prose-img:rounded-xl prose-img:shadow-md' : ''}`}>
              {product.descriptionIsHtml ? (
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              ) : (
                <p className="text-obsidian leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              )}
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
            forceShowForm={openInquiryForm}
            onFormShown={() => setOpenInquiryForm(false)}
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
