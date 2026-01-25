'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CharacterImage from '@/components/ui/CharacterImage';
import { ABOUT_CONTENT } from '@/content/siteAbout';
import { ExternalLink, Mail, Heart, Sparkles, Shield, Wallet, BadgeCheck, MessageSquare } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden border-b border-line">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              {/* 왼쪽: 텍스트 콘텐츠 */}
              <div className="text-center lg:text-left space-y-10">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest">
                  <Sparkles className="w-3 h-3 mr-2" />
                  Premium Curation Brand
                </div>

                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-text-primary leading-[0.9] mb-8">
                  프리미엄을<br />
                  <span className="text-primary">더 공정하게.</span>
                </h1>

                <p className="text-xl md:text-2xl text-text-secondary leading-relaxed font-medium max-w-xl">
                  Youniqle은 (주)사피에넷(Sapienet)의 회복 큐레이션 브랜드입니다. <br />
                  우리는 &apos;감각&apos;이 아닌 &apos;데이터&apos;로 증명된 회복의 가치를 제안합니다.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-6">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-background px-10 h-16 text-xl font-black rounded-full shadow-2xl transition-all duration-300 hover:scale-105" asChild>
                    <Link href="/products">
                      회복 상점 가기
                      <ExternalLink className="ml-3 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="border-line text-text-primary hover:bg-white/5 px-10 h-16 text-xl font-bold rounded-full transition-all duration-300 hover:scale-105" asChild>
                    <Link href="/cases">
                      회복 데이터 보기
                    </Link>
                  </Button>
                </div>
              </div>

              {/* 오른쪽: 캐릭터 이미지들 */}
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative w-80 h-80 lg:w-[450px] lg:h-[450px]">
                  {/* 메인 캐릭터 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>
                  <div className="relative z-10 w-full h-full">
                    <CharacterImage
                      src="/character/youniqle-1.png"
                      alt="Youniqle 대표 캐릭터"
                      fill
                      className="object-contain drop-shadow-[0_20px_50px_rgba(233,226,214,0.15)] animate-float"
                      priority
                    />
                  </div>

                  {/* 플로팅 요소들 */}
                  <div className="absolute -top-4 -right-4 bg-surface/80 backdrop-blur-md p-4 rounded-3xl border border-line shadow-2xl animate-bounce-slow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-black uppercase text-xs">OS</div>
                      <div className="text-left">
                        <div className="text-[10px] font-bold opacity-40 leading-none mb-1">RECOVERY</div>
                        <div className="text-xs font-black">SYSTEM UNLOCKED</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 가치 선언 섹션 */}
      <section className="py-32 bg-surface/30">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24 space-y-6">
              <span className="text-primary font-black tracking-widest text-xs uppercase">Core Values</span>
              <h2 className="text-4xl md:text-6xl font-black text-text-primary tracking-tighter">
                조용하지만 권위 있는 원칙들
              </h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium">
                우리는 화려한 광고보다 투명한 데이터와 정직한 마진을 선택합니다.<br />
                Youniqle이 지키는 5가지 프리미엄 약속입니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { title: "선별 큐레이션", desc: "검증된 품질 표준", icon: Sparkles },
                { title: "투명 가격", desc: "합리적 마진 보장", icon: BadgeCheck },
                { title: "빠른 응대", desc: "1:1 케어 지원", icon: MessageSquare },
                { title: "안전 결제", desc: "보안 결제 시스템", icon: Shield },
                { title: "멤버십 혜택", desc: "데이터 기반 보상", icon: Wallet }
              ].map((value, index) => (
                <Card
                  key={index}
                  className="group bg-surface/50 border-line hover:border-primary/30 transition-all duration-500 overflow-hidden"
                >
                  <CardContent className="p-8 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                      <value.icon className="h-8 w-8 text-primary group-hover:text-background transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-3">
                      {value.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-tight opacity-70">
                      {value.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 브랜드 스토리 */}
      <section className="py-32 border-t border-line">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-20">
            <div className="space-y-12">
              <h3 className="text-3xl md:text-5xl font-black text-text-primary tracking-tighter">우리의 이야기</h3>
              <div className="space-y-8 text-xl text-text-secondary leading-relaxed font-medium">
                <p>
                  Youniqle은 프리미엄을 &apos;생활 가능한 가격&apos;으로 연결하는 큐레이션 커머스입니다.
                  우리는 파트너사와의 직접 협업, 데이터 기반 수요 예측, 표준화된 품질 검수를 통해 과장 없는 정보를 제공합니다.
                </p>
                <p>
                  고객의 시간과 신뢰를 가장 큰 자산으로 생각합니다.
                  가격, 원산지, 구성, 사후 보장 범위를 투명하게 안내하고, 구매 이후에도 빠르게 돕는 것이 Youniqle의 기본입니다.
                </p>
                <p>
                  운영사 (주)사피에넷(Sapienet)은 독자적인 &apos;리커버리 OS&apos; 기술력을 바탕으로,
                  단순한 소비를 넘어 사용자의 데이터가 회복의 결과로 이어질 수 있도록 돕습니다.
                </p>
              </div>
            </div>

            {/* 정체성 강조 */}
            <div className="bg-surface p-12 rounded-[40px] border border-line flex flex-col md:flex-row items-center gap-12">
              <div className="w-24 h-24 relative flex-shrink-0">
                <CharacterImage src="/character/youniqle-2.png" alt="Identity" fill className="object-contain" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-2xl font-black text-text-primary mb-2">프리미엄의 정의를 다시 씁니다.</h4>
                <p className="text-text-secondary font-medium">비싸서 좋은 것이 아니라, 좋아서 가치 있는 것들을 선별합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-32 bg-primary text-background text-center relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-background/10 text-background text-xs font-bold uppercase tracking-widest">
              Establish Your Recovery
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              Youniqle과 함께<br />기록을 시작하세요.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="bg-background text-primary hover:bg-background/90 px-12 h-16 text-xl font-black rounded-full" asChild>
                <Link href="/">홈으로 가기</Link>
              </Button>
              <Button variant="outline" size="lg" className="border-background/20 text-background hover:bg-background/5 px-12 h-16 text-xl font-black rounded-full" asChild>
                <Link href="/products">회복 상품 둘러보기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
