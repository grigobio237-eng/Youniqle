import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CharacterImage from '@/components/ui/CharacterImage';
import { Play, ExternalLink, Calendar, Eye, Heart } from 'lucide-react';

export default function ContentPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
              Youniqle 콘텐츠
            </h1>
            <p className="text-xl text-text-secondary mb-8">
              동영상, 블로그 등 다양한 미디어 콘텐츠를 만나보세요
            </p>
            
            {/* Character Images */}
            <div className="flex justify-center space-x-4 mb-8">
              <div className="relative w-16 h-16">
                <CharacterImage
                  src="/character/youniqle-2.png"
                  alt="콘텐츠 캐릭터 1"
                  fill
                  className="object-contain animate-bounce"
                  sizes="64px"
                />
              </div>
              <div className="relative w-20 h-20">
                <CharacterImage
                  src="/character/youniqle-3.png"
                  alt="콘텐츠 캐릭터 2"
                  fill
                  className="object-contain animate-pulse"
                  sizes="80px"
                />
              </div>
              <div className="relative w-16 h-16">
                <CharacterImage
                  src="/character/youniqle-4.png"
                  alt="콘텐츠 캐릭터 3"
                  fill
                  className="object-contain animate-bounce"
                  sizes="64px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              콘텐츠 카테고리
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              다양한 플랫폼의 콘텐츠를 카테고리별로 확인하세요
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 동영상 */}
            <Card className="text-center p-8 hover:shadow-lg transition-shadow relative">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Play className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">동영상</h3>
                <p className="text-text-secondary mb-6">
                  제품 리뷰, 사용법 가이드, 브랜드 스토리
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/content/video">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    동영상 콘텐츠 보기
                  </Link>
                </Button>
                {/* Character 5 */}
                <div className="absolute -top-2 -right-2 w-12 h-12 opacity-30">
                  <CharacterImage
                    src="/character/youniqle-5.png"
                    alt="동영상 캐릭터"
                    fill
                    className="object-contain"
                  />
                </div>
              </CardContent>
            </Card>


            {/* 블로그 */}
            <Card className="text-center p-8 hover:shadow-lg transition-shadow relative">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ExternalLink className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">블로그</h3>
                <p className="text-text-secondary mb-6">
                  상세한 제품 정보, 사용 후기, 브랜드 뉴스
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/content/blog">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    블로그 콘텐츠 보기
                  </Link>
                </Button>
                {/* Character 1 */}
                <div className="absolute -top-2 -right-2 w-12 h-12 opacity-30">
                  <CharacterImage
                    src="/character/youniqle-1.png"
                    alt="블로그 캐릭터"
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

      {/* Featured Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              인기 콘텐츠
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              지금 가장 인기 있는 콘텐츠들을 확인해보세요
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Sample Content Items */}
            {[
              {
                title: "Youniqle 신상품 소개",
                platform: "동영상",
                views: "12.5K",
                likes: "1.2K",
                date: "2024-01-15",
                thumbnail: "/character/youniqle-1.png"
              },
              {
                title: "유기농 토마토 재배기",
                platform: "블로그",
                views: "5.3K",
                likes: "234",
                date: "2024-01-13",
                thumbnail: "/character/youniqle-3.png"
              },
              {
                title: "스포츠웨어 착용법",
                platform: "동영상",
                views: "15.2K",
                likes: "2.1K",
                date: "2024-01-12",
                thumbnail: "/character/youniqle-4.png"
              },
              {
                title: "브랜드 스토리",
                platform: "블로그",
                views: "7.4K",
                likes: "456",
                date: "2024-01-10",
                thumbnail: "/character/youniqle-6.png"
              }
            ].map((content, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  <CharacterImage
                    src={content.thumbnail}
                    alt={content.title}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-black/80 text-white">
                    {content.platform}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {content.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {content.views}
                      </span>
                      <span className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {content.likes}
                      </span>
                    </div>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {content.date}
                    </span>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={content.platform === '동영상' ? '/content/video' : '/content/blog'}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      보러가기
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            더 많은 콘텐츠를 만나보세요
          </h2>
          <p className="text-xl mb-8 opacity-90">
            다양한 플랫폼에서 Youniqle의 콘텐츠를 확인하세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/content/video">
                <ExternalLink className="mr-2 h-5 w-5" />
                모든 콘텐츠 보기
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
              구독하기
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
