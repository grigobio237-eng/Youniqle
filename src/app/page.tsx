import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CharacterImage from '@/components/ui/CharacterImage';
import { ArrowRight, Star, Truck, Shield, Heart } from 'lucide-react';

export default function HomePage() {
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
                  프리미엄 쇼핑의 새로운 경험
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
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              인기 상품
            </h2>
            <p className="text-lg text-text-secondary">
              지금 가장 인기 있는 상품들을 확인해보세요.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Placeholder Product Cards */}
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} className="overflow-hidden">
                <div className="aspect-square bg-gray-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <Heart className="h-12 w-12" />
                  </div>
                  <Badge className="absolute top-3 left-3" variant="secondary">
                    인기
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">샘플 상품 {item}</h3>
                  <p className="text-text-secondary text-sm mb-4">
                    고품질 샘플 상품 설명입니다.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">₩29,000</span>
                    <Button size="sm">장바구니</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button size="lg" asChild>
              <Link href="/products">
                모든 상품 보기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
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
          />
        </div>
        <div className="absolute bottom-4 right-4 w-20 h-20 opacity-20">
          <CharacterImage
            src="/character/youniqle-3.png"
            alt="뉴스레터 캐릭터"
            fill
            className="object-contain"
          />
        </div>
      </section>
    </div>
  );
}

