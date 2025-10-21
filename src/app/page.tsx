'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CharacterImage from '@/components/ui/CharacterImage';
import RecommendationSection from '@/components/recommendations/RecommendationSection';
import PersonalizedRecommendations from '@/components/personalization/PersonalizedRecommendations';
import NoticePopup from '@/components/ui/NoticePopup';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, Star, Truck, Shield, Heart, ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: Array<{
    url: string;
    _id?: string;
  }>;
  category: string;
  featured?: boolean;
  stock: number;
}

export default function HomePage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products?limit=8&sort=newest');
      
      if (!response.ok) {
        throw new Error(t('home.products.errorLoading'));
      }
      
      const data = await response.json();
      
      if (data.products) {
        setProducts(data.products || []);
      } else {
        throw new Error(data.error || t('home.products.errorLoading'));
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError(error instanceof Error ? error.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productId: string) => {
    // 장바구니 추가 로직 (추후 구현)
    console.log('Add to cart:', productId);
  };

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsletterEmail) {
      setNewsletterMessage(t('home.newsletter.emailRequired'));
      return;
    }

    setNewsletterLoading(true);
    setNewsletterMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newsletterEmail,
          source: 'website'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewsletterMessage(t('home.newsletter.successMessage'));
        setNewsletterEmail('');
      } else {
        setNewsletterMessage(data.error || t('home.newsletter.errorMessage'));
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setNewsletterMessage(t('home.newsletter.errorMessage'));
    } finally {
      setNewsletterLoading(false);
    }
  };
  return (
    <div className="min-h-screen">
      {/* 팝업 공지사항 */}
      <NoticePopup />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 sm:py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-text-primary mb-6 animate-fade-in">
                  {t('home.hero.title')}<br />{t('home.hero.titleHighlight')}
                </h1>
                <p className="text-lg sm:text-xl text-text-secondary mb-8 animate-slide-up">
                  {t('home.hero.subtitle')}
                  <br />
                  {t('home.hero.description')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up">
                  <Button size="lg" asChild>
                    <Link href="/products">
                      {t('home.hero.shopNow')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/about">
                      {t('home.hero.learnMore')}
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Right Content - Character Images */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
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
                <p className="text-lg">{t('home.products.errorLoading')}</p>
                <p className="text-sm text-gray-500 mt-2">{error}</p>
              </div>
              <Button onClick={fetchProducts} variant="outline">
                {t('common.back')}
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
                          {t('home.products.featured')}
                        </Badge>
                      )}
                      {product.stock <= 5 && product.stock > 0 && (
                        <Badge className="absolute top-3 right-3" variant="destructive">
                          {t('products.stock')} {product.stock}
                        </Badge>
                      )}
                      {product.stock === 0 && (
                        <Badge className="absolute top-3 right-3" variant="outline">
                          {t('products.soldOut')}
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
                        {product.stock === 0 ? t('products.soldOut') : t('nav.cart')}
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
                <p className="text-lg">{t('home.products.noProducts')}</p>
                <p className="text-sm text-gray-500 mt-2">{t('home.products.loadingProducts')}</p>
              </div>
            </div>
          )}
          
          {products.length > 0 && (
            <div className="text-center">
              <Button size="lg" asChild>
                <Link href="/products">
                  {t('home.products.viewAll')}
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
              {t('home.features.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 relative">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{t('home.features.quality.title')}</h3>
                <p className="text-text-secondary">
                  {t('home.features.quality.description')}
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
                <h3 className="text-xl font-semibold mb-4">{t('home.features.shipping.title')}</h3>
                <p className="text-text-secondary">
                  {t('home.features.shipping.description')}
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
                <h3 className="text-xl font-semibold mb-4">{t('home.features.secure.title')}</h3>
                <p className="text-text-secondary">
                  {t('home.features.secure.description')}
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
            {t('home.newsletter.title')}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t('home.newsletter.subtitle')}
          </p>
          <form onSubmit={handleNewsletterSubscribe} className="max-w-md mx-auto">
            <div className="flex gap-4 mb-4">
              <input
                type="email"
                placeholder={t('home.newsletter.emailPlaceholder')}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                disabled={newsletterLoading}
                required
              />
              <Button 
                type="submit" 
                variant="secondary" 
                size="lg"
                disabled={newsletterLoading}
              >
                {newsletterLoading ? t('home.newsletter.subscribing') : t('home.newsletter.subscribe')}
              </Button>
            </div>
            {newsletterMessage && (
              <p className={`text-sm ${newsletterMessage.includes(t('home.newsletter.successMessage')) ? 'text-green-200' : 'text-red-200'}`}>
                {newsletterMessage}
              </p>
            )}
          </form>
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

      {/* 추천 상품 섹션 */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home.products.recommended')}</h2>
          
          <div className="space-y-12">
            <PersonalizedRecommendations
              title={t('recommendations.personalizedTitle')}
              itemType="product"
              limit={6}
              algorithms={['collaborative', 'content_based', 'popular']}
              showAlgorithm={false}
              showReason={true}
            />
            
            <RecommendationSection
              title={t('home.products.featured')}
              itemType="product"
              algorithm="popular"
              limit={8}
              showTitle={true}
              showAlgorithm={true}
              showRefresh={true}
            />
            
            <RecommendationSection
              title={t('home.products.new')}
              itemType="product"
              algorithm="trending"
              limit={8}
              showTitle={true}
              showAlgorithm={true}
              showRefresh={true}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

