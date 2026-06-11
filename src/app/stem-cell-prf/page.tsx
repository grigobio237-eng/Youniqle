'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CalendarCheck, Shield, Award, ChevronRight, Activity, Zap, CheckCircle2, Link as LinkIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const FadeUp = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
  >
    {children}
  </motion.div>
);

export default function StemCellPrfPage() {
  const [activeTab, setActiveTab] = useState<'face' | 'body'>('face');
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-mist selection:bg-emerald-200">
      
      {/* 1. Hero Section */}
      <section className="relative h-[50vh] w-full flex items-center justify-center overflow-hidden bg-obsidian pt-16 md:pt-0">
        <Image 
          src="/images/stem-cell/prf_hero_image_1781142377655.png" 
          alt="Premium Glowing Skin" 
          fill 
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-tight mb-4 md:mb-6">
              당신의 시간은 <br />거꾸로 흐를 수 있습니다.
            </h1>
            <p className="text-lg md:text-2xl text-mist/90 font-medium mb-6 md:mb-8">
              내 몸이 만드는 가장 완벽한 재생의 기적
            </p>
            <div className="inline-block border border-white/20 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 md:px-6 md:py-2 text-xs md:text-base text-white font-bold uppercase tracking-widest leading-relaxed break-keep">
              단 1%의 화학적 첨가물도 허용하지 않는<br className="md:hidden" /> 100% 자가 혈액 재생술
            </div>
            <p className="mt-6 md:mt-8 text-[#D4AF37] font-black tracking-widest uppercase text-sm md:text-base drop-shadow-md">
              SVF + PRF Combination Therapy
            </p>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-[1px] h-12 bg-white/50" />
        </motion.div>
      </section>

      {/* 2. Empathy & Targeting */}
      <section className="py-20 md:py-48 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <FadeUp>
            <h2 className="text-2xl md:text-5xl font-black text-obsidian tracking-tight leading-tight mb-10 md:mb-16 break-keep">
              이제 겉을 가리는 시술이 아닌,<br />
              <span className="text-emerald-700">세포부터 젊어지는 근본적인 재생</span>이 필요할 때입니다.
            </h2>
          </FadeUp>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-24 text-left">
            <FadeUp delay={0.2}>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                  <SparkleIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-obsidian border-b border-line pb-4">피부 미용 (Face)</h3>
                <p className="text-slate/80 leading-relaxed font-medium break-keep">
                  "아무리 비싼 스킨케어와 레이저로도 채워지지 않는 피부 속 근본적인 노화감."<br/><br/>
                  표면적인 관리를 넘어, 무너진 콜라겐 층을 복원하고 피부 속 코어를 채우는 근본적인 안티에이징 솔루션이 필요합니다.
                </p>
              </div>
            </FadeUp>
            <FadeUp delay={0.4}>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                  <Activity className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-obsidian border-b border-line pb-4">통증 관리 (Body)</h3>
                <p className="text-slate/80 leading-relaxed font-medium break-keep">
                  "만성적인 관절 통증으로 인해 방해받는 여유로운 일상과 스포츠 활동."<br/><br/>
                  일시적인 진통제가 아닌, 손상된 연골과 인대를 직접적으로 재생시켜 고통 없는 본래의 자유로운 일상으로 되돌립니다.
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* 3. The Core Solution */}
      <section className="py-16 md:py-32 bg-mist">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <FadeUp>
              <div className="relative aspect-square md:aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl">
                <Image 
                  src="/images/stem-cell/prf_cell_concept_1781142390328.png" 
                  alt="SVF and PRF Core Concept" 
                  fill 
                  className="object-cover"
                />
              </div>
            </FadeUp>
            
            <div className="space-y-12">
              <FadeUp delay={0.2}>
                <div className="inline-block px-3 py-1.5 md:px-4 md:py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] md:text-xs font-black uppercase tracking-widest mb-3 md:mb-4">
                  The Core Synergy
                </div>
                <h2 className="text-2xl md:text-5xl font-black text-obsidian mb-4 md:mb-6 leading-tight break-keep">
                  완벽한 재생을 위한<br />씨앗과 토양의 결합
                </h2>
                <p className="text-base md:text-lg text-slate/80 font-medium leading-relaxed break-keep">
                  SVF(줄기세포)를 강력한 재생의 <strong className="text-obsidian">'씨앗'</strong>으로, 
                  PRF를 이 씨앗이 뿌리내리도록 돕는 비옥한 <strong className="text-obsidian">'토양과 천연 비료'</strong>로 활용합니다. 
                  이 두 가지의 결합이 기존 시술과는 차원이 다른 시너지를 만들어냅니다.
                </p>
              </FadeUp>

              <FadeUp delay={0.4}>
                <div className="space-y-6">
                  {[
                    { title: "100% Natural", desc: "인공 항응고제 ZERO, 오직 내 몸의 혈액으로만 만든 천연 생체막." },
                    { title: "Long-lasting", desc: "일회성 효과가 아닌, 1~2주간 지속적으로 성장인자를 방출하는 구조적 차이." },
                    { title: "High Engraftment", desc: "줄기세포가 손상된 피부와 연골에 완벽하게 생착되도록 돕는 3D 지지체 역할." }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-black text-obsidian text-lg">{item.title}</h4>
                        <p className="text-slate/70 font-medium mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Dramatic Transformations */}
      <section className="py-16 md:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-10 md:mb-16">
            <FadeUp>
              <h2 className="text-2xl md:text-5xl font-black text-obsidian mb-4 md:mb-6">드라마틱한 변화</h2>
              <p className="text-sm md:text-lg text-slate/70 font-medium max-w-2xl mx-auto break-keep">
                피부의 시간을 되돌리고, 통증 없는 자유를 되찾는 기적을 경험하세요.
              </p>
            </FadeUp>
          </div>

          <FadeUp delay={0.2}>
            <div className="bg-mist rounded-3xl md:rounded-[40px] overflow-hidden shadow-lg border border-line/50">
              <div className="flex flex-row border-b border-line/50">
                <button 
                  onClick={() => setActiveTab('face')}
                  className={`flex-1 py-4 md:py-6 text-sm md:text-lg font-black transition-colors ${activeTab === 'face' ? 'bg-white text-emerald-700' : 'bg-transparent text-slate hover:bg-white/50'}`}
                >
                  Face & Anti-aging
                </button>
                <button 
                  onClick={() => setActiveTab('body')}
                  className={`flex-1 py-4 md:py-6 text-sm md:text-lg font-black transition-colors ${activeTab === 'body' ? 'bg-white text-emerald-700' : 'bg-transparent text-slate hover:bg-white/50'}`}
                >
                  Body & Recovery
                </button>
              </div>
              
              <div className="p-6 md:p-16 grid lg:grid-cols-2 gap-8 md:gap-12 items-center bg-white">
                <div className="space-y-4 md:space-y-6">
                  <h3 className="text-xl md:text-3xl font-black text-obsidian break-keep">
                    {activeTab === 'face' ? '피부의 시간을 되돌리다' : '통증 없는 자유를 되찾다'}
                  </h3>
                  <ul className="space-y-4">
                    {(activeTab === 'face' ? [
                      "콜라겐 및 엘라스틴 자가 생성 극대화",
                      "깊은 주름 개선, 강력한 타이트닝, 무너진 얼굴선 복원",
                      "속부터 차오르는 맑고 투명한 피부 톤"
                    ] : [
                      "손상된 연골 및 관절 조직의 근본적인 재생 유도",
                      "강력한 항염 작용으로 만성 통증의 빠르고 안전한 완화",
                      "수술 없이 일상으로 즉시 복귀하는 비수술적 치료"
                    ]).map((point, i) => (
                      <li key={i} className="flex items-start gap-2 md:gap-3">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span className="text-slate/80 font-bold text-sm md:text-lg break-keep leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative aspect-square md:aspect-[4/3] rounded-[24px] overflow-hidden shadow-md">
                   <Image 
                    src="/images/stem-cell/prf_transformation_1781142401794.png" 
                    alt="Dramatic Transformation" 
                    fill 
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* 5. Authority & Trust */}
      <section className="py-16 md:py-32 bg-obsidian text-mist">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-6 md:space-y-8">
              <FadeUp>
                <div className="inline-block px-3 py-1.5 md:px-4 md:py-1.5 rounded-full bg-white/10 text-emerald-300 text-[10px] md:text-xs font-black uppercase tracking-widest mb-2">
                  Authority & Trust
                </div>
                <h2 className="text-2xl md:text-5xl font-black mb-4 md:mb-6 leading-tight break-keep">
                  결과의 차이는<br />의료진의 디테일에서.
                </h2>
                <div className="w-8 md:w-12 h-1 bg-emerald-500 mb-6 md:mb-8" />
                <p className="text-base md:text-lg text-mist/80 font-medium leading-relaxed break-keep mb-6 md:mb-8">
                  "줄기세포 추출부터 PRF 배합, 그리고 정확한 타겟층 주입까지. 섬세한 손길과 독보적인 노하우가 결과를 완성합니다."
                </p>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 flex items-center justify-center">
                    <Award className="w-6 h-6 md:w-8 md:h-8 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-black text-lg md:text-xl">대표원장 김미정</p>
                    <p className="text-mist/60 text-xs md:text-sm font-bold">줄기세포 항노화 연구센터</p>
                  </div>
                </div>
              </FadeUp>
            </div>
            
            <FadeUp delay={0.2} className="order-1 lg:order-2">
              <div className="relative aspect-[4/5] md:aspect-square rounded-[40px] overflow-hidden shadow-2xl">
                <Image 
                  src="/images/stem-cell/prf_clinic_interior_1781142417264.png" 
                  alt="State of the art clinic" 
                  fill 
                  className="object-cover"
                />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* 6. The Bridge (Membership) */}
      <section className="py-16 md:py-32 bg-[#FAF7F2]">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <FadeUp>
            <div className="text-center mb-10 md:mb-16 px-2">
              <h2 className="text-2xl md:text-5xl font-black text-[#5A4711] mb-4 md:mb-6 leading-tight break-keep">
                세포를 깨우는 단 한 번의 기적.<br />하지만 진정한 젊음은 '유지'에서 완성됩니다.
              </h2>
              <p className="text-sm md:text-lg text-[#5A4711]/70 font-medium max-w-3xl mx-auto break-keep leading-relaxed">
                SVF와 PRF 시술로 잃어버린 젊음의 본질(Essence)을 되찾으셨다면, 이제 완벽한 균형(Balance)을 유지할 차례입니다. 
                단발성 시술의 기적을 평생의 자산으로 만드는 것, 그것이 바로 유니클 프리미엄 멤버십입니다.
              </p>
            </div>
          </FadeUp>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-stretch">
            <FadeUp delay={0.2}>
              <div className="relative h-64 md:h-full min-h-[300px] md:min-h-[400px] rounded-3xl md:rounded-[40px] overflow-hidden shadow-xl">
                <Image 
                  src="/images/stem-cell/prf_vip_lounge_1781142430117.png" 
                  alt="VIP Concierge Lounge" 
                  fill 
                  className="object-cover"
                />
              </div>
            </FadeUp>
            
            <FadeUp delay={0.4}>
              <div className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-12 shadow-xl border border-[#D4AF37]/20 h-full flex flex-col justify-center">
                <div className="space-y-6 md:space-y-10">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="mt-0.5 md:mt-1 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#F3E5AB] flex items-center justify-center flex-shrink-0 text-[#5A4711]">
                      <Shield className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg md:text-xl text-[#5A4711] mb-1 md:mb-2">Private Care</h4>
                      <p className="text-sm md:text-base text-slate/80 font-medium leading-relaxed break-keep">멤버십 전용 프라이빗 룸 대기 및 전담 메디컬 컨시어지 1:1 배정.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="mt-0.5 md:mt-1 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#F3E5AB] flex items-center justify-center flex-shrink-0 text-[#5A4711]">
                      <Zap className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg md:text-xl text-[#5A4711] mb-1 md:mb-2">Continuous Regeneration</h4>
                      <p className="text-sm md:text-base text-slate/80 font-medium leading-relaxed break-keep">시술 효과를 극대화하고 유지하는 주기적인 정밀 안티에이징 및 통증 관리 프로그램.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="mt-0.5 md:mt-1 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#F3E5AB] flex items-center justify-center flex-shrink-0 text-[#5A4711]">
                      <CalendarCheck className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg md:text-xl text-[#5A4711] mb-1 md:mb-2">Life-care Solution</h4>
                      <p className="text-sm md:text-base text-slate/80 font-medium leading-relaxed break-keep">단순한 병원 방문을 넘어선 프리미엄 웰니스 라이프스타일 혜택 및 예약 우선권 제공.</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* 7. CTA & Footer Notes */}
      <section className="py-16 md:py-24 bg-white text-center">
        <div className="container mx-auto px-6 max-w-4xl">
          <FadeUp>
            <h2 className="text-2xl md:text-5xl font-black text-obsidian mb-6 md:mb-8">
              오직 당신만을 위한<br className="md:hidden"/> 1:1 맞춤 재생 솔루션
            </h2>
            <p className="text-base md:text-xl text-slate/70 font-medium mb-10 md:mb-12 break-keep">
              지금 이 페이지의 링크를 복사하여 소중한 분들께 공유해보세요.
            </p>

            <Button 
              size="lg" 
              onClick={handleCopyLink}
              className={`h-14 md:h-16 px-8 md:px-12 rounded-full text-white text-base md:text-lg font-black shadow-2xl transition-all hover:-translate-y-1 w-full md:w-auto ${
                isCopied ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-obsidian hover:bg-obsidian/90'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="mr-2 w-4 h-4 md:w-5 md:h-5" /> 링크 복사 완료!
                </>
              ) : (
                <>
                  <LinkIcon className="mr-2 w-4 h-4 md:w-5 md:h-5" /> 페이지 링크 복사하기
                </>
              )}
            </Button>

            <div className="text-left md:text-center text-xs md:text-sm text-slate/50 font-medium space-y-2 border-t border-line/50 pt-8 mt-12 break-keep">
              <p>* <strong className="text-slate/70">SVF (Stromal Vascular Fraction, 기질혈관분획)</strong>: 지방 조직에서 추출한 세포 집단으로, 다량의 줄기세포를 함유하여 강력한 세포 재생 및 혈관 생성 능력을 가집니다.</p>
              <p>* <strong className="text-slate/70">PRF (Platelet-Rich Fibrin, 고농축 혈소판 섬유소)</strong>: 환자 본인의 혈액에서 추출한 100% 천연 생체막으로, 인공 화학 첨가물 없이 상처 치유와 조직 재생을 돕는 성장인자를 지속적으로 방출합니다.</p>
            </div>
          </FadeUp>
        </div>
      </section>

    </div>
  );
}

// Sparkle Custom Icon
function SparkleIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}
