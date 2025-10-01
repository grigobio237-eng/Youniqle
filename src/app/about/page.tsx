import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CharacterImage from '@/components/ui/CharacterImage';
import { ABOUT_CONTENT } from '@/content/siteAbout';
import { ExternalLink, Mail, Star, Zap, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-white">
        {/* 배경 그라디언트 원형 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* 왼쪽: 텍스트 콘텐츠 */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center px-6 py-3 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-8 shadow-sm">
                  <Star className="w-4 h-4 mr-2" />
                  프리미엄 큐레이션 몰
                </div>
                
                <h1 className="text-6xl md:text-8xl font-black tracking-[-0.02em] text-gray-900 mb-8 leading-tight drop-shadow-sm">
                  {ABOUT_CONTENT.hero}
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-10 font-medium">
                  {ABOUT_CONTENT.short}
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    상품 둘러보기
                    <ExternalLink className="ml-3 h-6 w-6" />
                  </Button>
                  <Button variant="outline" size="lg" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-10 py-5 text-xl font-bold transition-all duration-300 hover:scale-105">
                    파트너십 문의
                  </Button>
                </div>
              </div>

              {/* 오른쪽: 캐릭터 이미지들 */}
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative w-80 h-80 lg:w-96 lg:h-96">
                  {/* 메인 캐릭터 */}
                  <div className="absolute inset-0">
                    <CharacterImage
                      src="/character/youniqle-1.png"
                      alt="Youniqle 대표 캐릭터"
                      fill
                      className="object-contain animate-fade-in drop-shadow-lg"
                      sizes="(max-width: 768px) 320px, 384px"
                    />
                  </div>
                  
                  {/* 플로팅 캐릭터들 */}
                  <div className="absolute -top-8 -right-8 w-20 h-20 opacity-80 animate-bounce drop-shadow-md">
                    <CharacterImage
                      src="/character/youniqle-2.png"
                      alt="Youniqle 캐릭터 2"
                      fill
                      className="object-contain"
                      sizes="80px"
                    />
                  </div>
                  <div className="absolute -bottom-8 -left-8 w-24 h-24 opacity-70 animate-pulse drop-shadow-md">
                    <CharacterImage
                      src="/character/youniqle-3.png"
                      alt="Youniqle 캐릭터 3"
                      fill
                      className="object-contain"
                      sizes="96px"
                    />
                  </div>
                  <div className="absolute top-1/2 -left-12 w-16 h-16 opacity-60 animate-bounce drop-shadow-md" style={{animationDelay: '1s'}}>
                    <CharacterImage
                      src="/character/youniqle-4.png"
                      alt="Youniqle 캐릭터 4"
                      fill
                      className="object-contain"
                      sizes="64px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 가치 선언 섹션 */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50/30 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-6">
                <Heart className="w-4 h-4 mr-2" />
                고객 중심의 가치
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Youniqle의 핵심 가치
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                고객 만족을 위한 5가지 핵심 원칙으로 프리미엄 쇼핑 경험을 제공합니다
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ABOUT_CONTENT.values.map((value, index) => {
                const IconComponent = value.icon;
                const colors = [
                  'from-blue-500 to-blue-600',
                  'from-emerald-500 to-emerald-600', 
                  'from-amber-500 to-amber-600',
                  'from-purple-500 to-purple-600',
                  'from-rose-500 to-rose-600'
                ];
                const bgColors = [
                  'bg-blue-50',
                  'bg-emerald-50',
                  'bg-amber-50', 
                  'bg-purple-50',
                  'bg-rose-50'
                ];
                
                return (
                  <Card 
                    key={index}
                    className="group rounded-3xl shadow-lg hover:shadow-2xl bg-white border-0 overflow-hidden transition-all duration-500 hover:-translate-y-2"
                  >
                    <CardContent className="p-0">
                      {/* 상단 그라디언트 */}
                      <div className={`h-2 bg-gradient-to-r ${colors[index]}`}></div>
                      
                      <div className="p-8 text-center">
                        <div className={`w-20 h-20 ${bgColors[index]} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className={`h-10 w-10 ${colors[index].includes('blue') ? 'text-blue-600' : colors[index].includes('emerald') ? 'text-emerald-600' : colors[index].includes('amber') ? 'text-amber-600' : colors[index].includes('purple') ? 'text-purple-600' : 'text-rose-600'}`} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                          {value.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-lg">
                          {value.desc}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 상세 소개 섹션 */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50/30 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold mb-6">
                <Zap className="w-4 h-4 mr-2" />
                브랜드 스토리
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                우리의 이야기
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Youniqle이 추구하는 가치와 비전을 소개합니다
              </p>
            </div>

            <div className="space-y-12">
              {ABOUT_CONTENT.extended.map((paragraph, index) => (
                <div key={index} className="group">
                  <div className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-xl border border-gray-100 transition-all duration-300 group-hover:border-blue-200">
                    <div className="flex items-start space-x-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                          {paragraph}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* A/B 테스트 슬로건 섹션 */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-emerald-600 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-emerald-600/90"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 text-white text-sm font-semibold mb-8 backdrop-blur-sm">
              <Star className="w-4 h-4 mr-2" />
              브랜드 슬로건
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-12">
              우리의 메시지
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {ABOUT_CONTENT.abTests.map((slogan, index) => (
                <div 
                  key={index}
                  className="group bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="text-6xl text-white/20 mb-4 group-hover:text-white/40 transition-colors">
                    &ldquo;
                  </div>
                  <p className="text-xl font-semibold text-white leading-relaxed group-hover:text-white/90 transition-colors">
                    {slogan}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 파트너 섹션 */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-blue-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-3xl p-12 text-center border border-blue-100 shadow-xl">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-8">
                <Heart className="w-4 h-4 mr-2" />
                파트너십
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                함께 성장하는 파트너
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-12 max-w-4xl mx-auto">
                {ABOUT_CONTENT.partnerOneLiner}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                  <Mail className="mr-2 h-5 w-5" />
                  파트너십 문의
                </Button>
                <Button variant="outline" size="lg" className="border-blue-200 text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  상품 둘러보기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* CTA 섹션 */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-blue-700/90 to-emerald-600/90"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 text-white text-sm font-semibold mb-8 backdrop-blur-sm">
              <Star className="w-4 h-4 mr-2" />
              지금 시작하세요
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Youniqle과 함께하세요
            </h2>
            <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              프리미엄 쇼핑의 새로운 경험을 지금 시작해보세요
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 px-10 py-5 text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105" asChild>
                <Link href="/products">
                  쇼핑 시작하기
                  <ExternalLink className="ml-3 h-6 w-6" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-5 text-xl font-semibold transition-all duration-300 hover:scale-105" asChild>
                <Link href="/content">
                  콘텐츠 보기
                </Link>
              </Button>
            </div>
            
            {/* 하단 캐릭터들 */}
            <div className="flex justify-center space-x-8 mt-16">
              <div className="relative w-16 h-16 opacity-60">
                <CharacterImage
                  src="/character/youniqle-5.png"
                  alt="Youniqle 캐릭터 5"
                  fill
                  className="object-contain animate-bounce"
                />
              </div>
              <div className="relative w-20 h-20 opacity-80">
                <CharacterImage
                  src="/character/youniqle-6.png"
                  alt="Youniqle 캐릭터 6"
                  fill
                  className="object-contain animate-pulse"
                />
              </div>
              <div className="relative w-16 h-16 opacity-60 animate-bounce" style={{animationDelay: '0.5s'}}>
                <CharacterImage
                  src="/character/youniqle-1.png"
                  alt="Youniqle 대표 캐릭터"
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
