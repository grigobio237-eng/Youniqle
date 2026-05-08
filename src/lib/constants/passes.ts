import { MousePointer2, Star, Crown, RefreshCcw, Leaf, Zap } from 'lucide-react';
import React from 'react';

export const PASS_SPECS: Record<string, any> = {
  reset: {
    id: 'reset',
    name: 'RESET PASS',
    title: '[RESET] 휘발되는 컨디션을 데이터로 고정하기',
    subtitle: '"가장 기초적인 나를 발견하는 시작"',
    intro: '회복의 첫걸음을 떼는 분들을 위해 준비된 입문 패스입니다. 오늘의 리듬을 체크하고 기초적인 데이터 패턴을 경험해 보세요.',
    price: '0',
    period: '무료체험',
    position: '기초 진단 및 리포트 체험',
    recommendations: [
      '유니클의 회복 진단 시스템이 궁금하신 분',
      '현재 나의 컨디션을 수치화해서 확인하고 싶으신 분',
      '작은 루틴부터 가볍게 시작하고 싶으신 분'
    ],
    keyBenefits: [
      { id: 1, title: '데일리 리듬 체크', desc: '1일 1회 AI 기반의 컨디션 및 회복 점수를 산출합니다.' },
      { id: 2, title: '기본 회복 리포트', desc: '오늘의 데이터를 바탕으로 한 기초적인 성향 분석을 제공합니다.' },
      { id: 3, title: '7일 루틴 가이드', desc: '회복의 감각을 깨우는 초기 7일 루틴을 체험할 수 있습니다.' }
    ],
    theme: 'bg-white',
    accent: 'text-slate',
    buttonColor: 'bg-slate hover:bg-slate/90'
  },
  reborn: {
    id: 'reborn',
    name: 'REBORN PASS',
    title: '[REBORN] 리듬 보관함으로 기록을 자산화하기',
    subtitle: '"과거의 내가 미래의 나를 돕는 데이터 OS"',
    intro: '기록이 사라지지 않도록 리듬 보관함을 활성화하는 단계입니다. 주간 단위의 심층 분석을 통해 나의 회복 흐름을 한눈에 파악하세요.',
    price: '19,900',
    period: '월',
    position: '리듬 보관함 활성화 및 데이터 영구 저장',
    recommendations: [
      '지난 회복 기록이 휘발되지 않고 자산으로 남길 원하시는 분',
      '주간 단위의 AI 심층 리포트로 정교한 관리를 원하시는 분',
      '프리미엄 회복 콘텐츠(사운드/명상)를 무제한 이용하고 싶으신 분'
    ],
    keyBenefits: [
      { id: 1, title: '리듬 보관함(Archive) 무제한', desc: '지난 모든 여정 기록을 영구적으로 보존하고 언제든 다시 열람합니다.' },
      { id: 2, title: '주간 AI 심층 해석 리포트', desc: '한 주간의 데이터를 다각도로 분석하여 맞춤형 인사이트를 도출합니다.' },
      { id: 3, title: '무제한 타임라인 기록', desc: '하루 횟수 제한 없이 모든 컨디션 변화를 촘촘하게 기록할 수 있습니다.' }
    ],
    theme: 'bg-emerald-50/50',
    accent: 'text-emerald-600',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700'
  },
  restart: {
    id: 'restart',
    name: 'RESTART PASS',
    title: '[RESTART] 조용한 정리로 최적의 선택 기준 세우기',
    subtitle: '"방대한 데이터 사이에서 나만의 정답을 찾아주는 프리미엄 OS"',
    intro: '전문 네비게이터의 수동 분석이 포함된 상위 패스입니다. 단순히 기록하는 것을 넘어, 나에게 꼭 맞는 선택의 기준을 정리해 드립니다.',
    price: '49,900',
    period: '월',
    position: '전문 네비게이터의 조용한 정리(Private Report) 포함',
    recommendations: [
      '시술이나 수술 후, 데이터 기반의 정밀한 사후 관리가 필요하신 분',
      'AI 분석을 넘어 전문가의 심층적인 해석과 정리가 필요하신 분',
      '회복을 위한 명확한 선택의 기준을 전문가와 함께 세우고 싶은 분'
    ],
    keyBenefits: [
      { id: 1, title: '월 1회 조용한 정리 (Private Report)', desc: '전문 네비게이터가 나의 데이터를 직접 검토하여 개인화된 보고서를 발행합니다.' },
      { id: 2, title: '전담 네비게이터 리마인드', desc: '중요한 회복 포인트마다 전문가의 따뜻한 조언과 알림을 보내드립니다.' },
      { id: 3, title: '프리미엄 큐레이션 서비스', desc: '나의 취향과 상태에 최적화된 회복 프로그램 및 공간을 우선 추천합니다.' }
    ],
    theme: 'bg-amber-50/50',
    accent: 'text-amber-600',
    buttonColor: 'bg-amber-600 hover:bg-amber-700'
  },
  black: {
    id: 'black',
    name: 'BLACK PASS',
    title: '[BLACK] 90일 회복 관리 패스',
    subtitle: '"데이터로 증명하는 90일간의 회복 여정"',
    intro: '전문 네비게이터와 의료기관이 협력하여 당신의 회복을 정밀하게 관리하는 90일 집중 프로그램입니다. 오프라인과 온라인을 잇는 폐쇄형 멤버십 서비스를 경험하세요.',
    price: '99,000',
    period: '3개월',
    position: '90일 집중 회복 관리 및 의료기관 연계 서비스',
    recommendations: [
      '신뢰할 수 있는 데이터 기반의 정밀 회복 관리가 필요하신 분',
      '전문 네비게이터의 밀착 가이드와 병원 진료를 연계하고 싶으신 분',
      '90일이라는 명확한 기간 동안 확실한 변화를 만들고 싶으신 분'
    ],
    keyBenefits: [
      { id: 1, title: '90일 집중 데이터 모니터링', desc: '매일 기록되는 회복 데이터를 전문가가 상시 모니터링하여 최적의 타이밍에 가이드를 드립니다.' },
      { id: 2, title: '의료기관 방문 전 문진 & 리포트', desc: '병원 방문 전 상세 문진을 통해 의료진에게 최적화된 상담 자료를 미리 전달합니다.' },
      { id: 3, title: '네비게이터 1:1 매칭 관리', desc: '전담 네비게이터가 모든 여정을 함께하며 회복의 흐름을 놓치지 않게 돕습니다.' }
    ],
    roadmap: [
      { step: '01', title: '네비게이터 상담 및 가입', desc: '전문 네비게이터와의 상담 후 90일 패스 전용 링크를 통해 가입을 완료합니다.' },
      { step: '02', title: '회복 관리 및 사전 문진', desc: '데일리 리듬을 기록하며 의료기관 방문 전 정밀 문진 데이터를 작성합니다.' },
      { step: '03', title: '의료기관 방문 및 심층 케어', desc: '작성된 데이터를 기반으로 제휴 의료기관에서 효율적이고 전문적인 진료를 받습니다.' }
    ],
    theme: 'bg-obsidian text-mist',
    accent: 'text-chapter-accent',
    buttonColor: 'bg-chapter-accent hover:bg-chapter-accent/90'
  }
};
