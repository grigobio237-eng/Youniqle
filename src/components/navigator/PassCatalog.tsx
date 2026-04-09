'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Crown, MousePointer2, Percent, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import CharacterImage from '@/components/ui/CharacterImage';

const passItems = [
  {
    id: 'start',
    name: 'START PASS',
    description: '처음 시작하는 사람을 위한 입문형 회복 패스',
    price: '330만원',
    period: '2년',
    discount: '20%',
    theme: 'border-blue-200 bg-blue-50/30',
    accent: 'text-blue-600',
    benefitText: '멤버십 전용 회복 프로그램가 적용',
    icon: <MousePointer2 className="w-6 h-6" />
  },
  {
    id: 'signature',
    name: 'SIGNATURE PASS',
    description: '유니클의 주력 패스 / 가장 선호되는 핵심 상품',
    price: '1,100만원',
    period: '5년',
    discount: '30%',
    isMain: true,
    theme: 'border-chapter-accent/20 bg-chapter-accent/5 ring-2 ring-chapter-accent/20',
    accent: 'text-chapter-accent',
    benefitText: '프리미엄 전용 솔루션 우대 적용',
    icon: <Star className="w-6 h-6" />
  },
  {
    id: 'black',
    name: 'BLACK PASS',
    description: 'VIP 고객을 위한 프라이빗 운영형 패스',
    price: '3,300만원',
    period: '5년',
    discount: '30%',
    theme: 'border-obsidian bg-obsidian text-mist',
    accent: 'text-chapter-accent',
    benefitText: '최상위 익스클루시브 프로그램가 적용',
    icon: <Crown className="w-6 h-6" />
  }
];

export default function PassCatalog() {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-black text-obsidian mb-4">상품 프리젠테이션</h2>
        <p className="text-slate/60 font-medium leading-relaxed">
          고객에게 최적의 회복 경로를 제안하세요. 
          각 등급별 상세 스펙 페이지를 통해 고객과 함께 구체적인 혜택을 확인하실 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {passItems.map((pass, idx) => (
          <motion.div
            key={pass.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={`h-full relative overflow-hidden flex flex-col rounded-[32px] border transition-all duration-300 hover:shadow-xl ${pass.theme}`}>
              {pass.isMain && (
                <div className="absolute top-0 right-0 bg-chapter-accent text-white px-4 py-1.5 rounded-bl-2xl text-[10px] font-black tracking-widest uppercase">
                  Best Seller
                </div>
              )}
              
              <CardContent className="p-8 flex-1 flex flex-col">
                <div className="mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${
                    pass.id === 'black' ? 'bg-white/10 text-white' : 'bg-white text-primary'
                  }`}>
                    {pass.icon}
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter mb-2">{pass.name}</h3>
                  <p className={`text-sm font-bold opacity-70 mb-8 min-h-[40px]`}>{pass.description}</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg ${pass.id === 'black' ? 'bg-white/10' : 'bg-primary/5'} overflow-hidden relative shrink-0`}>
                      <CharacterImage 
                        src="/character/youniqle-1.png" 
                        alt="Y" 
                        fill 
                        className="object-contain p-1"
                      />
                    </div>
                    <span className="text-sm font-bold">{pass.benefitText}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black">{pass.price}</span>
                    <span className="text-sm font-bold opacity-60">/ {pass.period} 운영</span>
                  </div>
                </div>

                <div className="mt-auto space-y-3 pt-6 border-t border-current/10">
                  <Button 
                    asChild
                    className={`w-full h-14 rounded-2xl font-black text-sm transition-all shadow-lg ${
                      pass.id === 'black' ? 'bg-mist text-obsidian hover:bg-white' : 'bg-obsidian text-mist hover:bg-obsidian/90'
                    }`}
                  >
                    <Link href={`/navigator/passes/${pass.id}`}>
                      고객용 상세 스펙 보기 <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  
                  <p className={`text-[11px] text-center font-bold opacity-40 uppercase tracking-widest`}>
                    Share link to customer
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Guide Banner */}
      <div className="bg-primary/5 border border-line rounded-[32px] p-8 flex items-center gap-6">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm flex-shrink-0">
          <Star className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h4 className="font-black text-obsidian">정밀 회복 설계를 위한 제안 툴</h4>
          <p className="text-sm text-slate font-medium opacity-60">
            고객과 함께 상세 스펙을 보며 회복 로드맵을 설계하세요. 
            공유된 페이지를 통해 고객이 가입하면 네비게이터 리워드가 자동으로 적립됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
