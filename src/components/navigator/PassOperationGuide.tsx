'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Info, Star, ShieldCheck, Crown, Clock, CreditCard, Gift, MousePointer2, Users, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const passData = [
  {
    id: 'start',
    name: 'START PASS',
    position: '처음 시작하는 사람을 위한 입문형 회복 패스',
    price: '330만원',
    period: '2년',
    target: ['첫 시술 고민 고객', '비교/탐색 고객', '낮은 진입장벽이 필요한 고객'],
    whyBuy: '병원 이용을 처음 시작하는 고객이 "아무것도 모르고 들어가는 불안"을 줄이는 패스',
    benefits: [
      {
        category: '가입 즉시 지급',
        items: ['네비게이터 리워드 30만원', '개인 회복 방향 안내 리포트 1회']
      },
      {
        category: '기간 중 반복 혜택',
        items: ['제휴사 비급여 항목 20% 멤버십 전용가', '제휴 범위 내 핵심 프로그램 회원 전용 우대 적용', '회원 전용 예약 라인 이용 (네비게이터 역할)', '일반 예약 대비 우선 배정', '회복관리 가이드 제공']
      },
      {
        category: '추가 혜택',
        items: ['멤버 전용 프로모션 우선 안내']
      }
    ],
    theme: 'border-blue-200 bg-blue-50/30',
    accent: 'text-blue-600',
    icon: <MousePointer2 className="w-5 h-5" />
  },
  {
    id: 'signature',
    name: 'SIGNATURE PASS',
    position: '사피에넷의 주력 패스 / 가장 많이 팔아야 할 핵심 상품',
    price: '1,100만원',
    period: '5년',
    isMain: true,
    target: ['반복 시술 가능성 있는 고객', '장기적으로 관리받고 싶은 고객', '혼자 비교하기보다 운영받고 싶은 고객', '비용보다 전체 흐름의 효율을 중시하는 고객'],
    whyBuy: '5년 동안 병원 이용, 회복관리, 예약, 혜택을 가장 유리하게 묶는 주력 패스 (시술 1번 혜택이 아닌 5년간 유리한 운영권을 사는 구조)',
    benefits: [
      {
        category: '가입 즉시 지급',
        items: ['멤버 포인트 1,100만원 인정', '네비게이터 리워드 100만원', '개인 회복 설계 리포트 1회']
      },
      {
        category: '기간 중 반복 혜택',
        items: ['제휴사 비급여 항목 30% 멤버십 전용가', '제휴 범위 내 핵심 프로그램 회원 전용 우대', '핵심 전략 프로그램 특별 우대 적용 가능', '우선 일정 배정', '회복관리 가이드 상시 제공']
      },
      {
        category: '멤버 전용 권리',
        items: ['신상품/신규 프로그램 선공개', '멤버 전용 데이 또는 집중 혜택 기간 참여권']
      }
    ],
    theme: 'border-chapter-accent/20 bg-chapter-accent/5 ring-2 ring-chapter-accent/20',
    accent: 'text-chapter-accent',
    icon: <Star className="w-5 h-5" />
  },
  {
    id: 'black',
    name: 'BLACK PASS',
    position: 'VIP 고객을 위한 프라이빗 운영형 패스',
    price: '3,300만원',
    period: '5년',
    target: ['고액 이용 고객', '가족 단위 고객', 'VIP 성향 고객', '시간 절약과 우선권을 중시하는 고객'],
    whyBuy: '시간이 더 중요하고 선택 피로를 줄이고 싶고 프라이빗하게 관리받고 싶은 고객에게 적합',
    benefits: [
      {
        category: '가입 즉시 지급',
        items: ['멤버 포인트 3,300만원 인정', '네비게이터 리워드 300만원', '프리미엄 개인 회복 설계 리포트 상시 제공']
      },
      {
        category: '기간 중 반복 혜택',
        items: ['제휴사 비급여 항목 30% 멤버십 전용가', '제휴 범위 내 최상위 회원 전용 우대', '우선 예약 최상위 배정', '전담 응대 라인', '프리미엄 체크 리포트 상시 제공', '집중 관리 프로그램 우선 배정']
      },
      {
        category: '프라이빗 권리',
        items: ['지정인 1인 연 3회 사용권', '특별 행사 초청', '고급 프로그램 우선 접근권']
      }
    ],
    theme: 'border-obsidian bg-obsidian text-mist',
    accent: 'text-chapter-accent',
    icon: <Crown className="w-5 h-5" />
  }
];

const PassOperationGuide = () => {
  return (
    <div className="space-y-16 animate-in fade-in duration-500">
      {/* Intro Message */}
      <div className="max-w-3xl">
        <h2 className="text-2xl font-black text-obsidian mb-4 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-chapter-accent" />
          네비게이터 패스 운영 정책 가이드
        </h2>
        <p className="text-slate/60 font-medium leading-relaxed">
          유니클의 패스는 단순한 시술 혜택이 아닌, 고객의 <span className="text-obsidian font-bold">리커버리 운영권</span>을 설계하는 핵심 상품입니다. 
          각 등급별 타겟과 혜택을 숙지하여 최적의 회복 경로를 제안하세요.
        </p>
      </div>

      {/* Common Key Policy Highlight */}
      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex items-center gap-6 shadow-sm">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
          <Percent className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-black text-obsidian mb-1">핵심 혜택: 제휴사 비급여 항목 최대 30% 멤버십 전용가</h4>
          <p className="text-sm text-slate font-medium">모든 패스 구매 고객은 사용 기간 내 제휴 센터 이용 시 <span className="text-primary font-bold underline">비급여 항목에 한해</span> 등급별 멤버십 전용가를 상시 적용받습니다.</p>
        </div>
      </div>

      {/* Pass Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {passData.map((pass, idx) => (
          <motion.div
            key={pass.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex flex-col rounded-[32px] border p-8 shadow-sm h-full relative group ${pass.theme}`}
          >
            {pass.isMain && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-chapter-accent text-white px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg">
                Main Product
              </div>
            )}

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-xl border ${pass.id === 'black' ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-line'}`}>
                  {pass.icon}
                </div>
                <h3 className="text-2xl font-black tracking-tighter">{pass.name}</h3>
              </div>
              <div className={`text-sm font-bold opacity-80 mb-6 min-h-[40px]`}>{pass.position}</div>
              
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-black">{pass.price}</span>
                <span className="text-sm font-bold opacity-60">/ {pass.period}</span>
              </div>
            </div>

            {/* Target & Why Buy */}
            <div className="space-y-6 mb-8 flex-1">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Target Customers
                </h4>
                <div className="flex flex-wrap gap-2">
                  {pass.target.map(t => (
                    <Badge key={t} variant="outline" className={`rounded-full px-3 py-0.5 text-[10px] font-bold ${pass.id === 'black' ? 'border-white/20 text-white/80' : 'border-line text-slate'}`}>
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className={`p-4 rounded-2xl ${pass.id === 'black' ? 'bg-white/10' : 'bg-white/60 shadow-inner'}`}>
                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Why buy this?
                </h4>
                <p className="text-sm font-medium leading-relaxed opacity-90">{pass.whyBuy}</p>
              </div>
            </div>

            {/* Benefits List */}
            <div className="space-y-6 mt-auto">
              {pass.benefits.map((group) => (
                <div key={group.category}>
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-3">{group.category}</h4>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item} className="flex gap-2 text-xs font-medium leading-relaxed">
                        <Check className={`w-3.5 h-3.5 shrink-0 ${pass.accent}`} />
                        <span className={item.includes('멤버십 전용가') ? 
                          `${pass.id === 'black' ? 'text-white' : pass.accent} font-bold italic underline ${pass.id === 'black' ? 'decoration-chapter-accent' : 'decoration-chapter-accent/30'} underline-offset-4` 
                          : ''}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comparison Bottom Alert */}
      <div className="bg-chapter-accent/5 border border-chapter-accent/20 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-chapter-accent">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-xl font-black text-obsidian mb-1">패스 운영 시 유의사항</h4>
            <p className="text-sm text-slate font-medium">모든 패스는 명시된 유효기간 동안 <span className="text-obsidian font-bold underline">비급여 멤버십 전용가를 포함한 모든 혜택</span>이 상시 유지되어야 합니다.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="text-[10px] font-black px-4 py-2 rounded-full border-chapter-accent/30 text-chapter-accent bg-white shadow-sm">
            시술권이 아닌 운영권
          </Badge>
          <Badge variant="outline" className="text-[10px] font-black px-4 py-2 rounded-full border-chapter-accent/30 text-chapter-accent bg-white shadow-sm">
            체계적 회복 관리
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default PassOperationGuide;
