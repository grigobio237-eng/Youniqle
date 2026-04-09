import { MousePointer2, Star, Crown } from 'lucide-react';
import React from 'react';

export const PASS_SPECS: Record<string, any> = {
  start: {
    id: 'start',
    name: 'START PASS',
    title: '[START PASS] 당신의 첫 번째 회복 저니(Journey)를 위한 안심 가이드',
    subtitle: '"병원은 처음이라 어디서부터 시작해야 할지 막막하신가요?"',
    intro: '수많은 정보 속에서 나에게 딱 맞는 회복 방향을 찾는 것은 쉽지 않습니다. START PASS는 "아무것도 모르고 시작하는 불안"을 확신으로 바꿔주는 입문형 회복 패스입니다.',
    price: '3,300,000',
    period: '2년',
    position: '처음 시작하는 사람을 위한 입문형 회복 패스',
    recommendations: [
      '첫 시술을 고민 중이지만 정보가 부족해 결정이 어려우신 분',
      '여러 곳을 비교·탐색하며 나에게 맞는 최적의 솔루션을 찾고 싶으신 분',
      '합리적인 비용으로 프리미엄 건강관리 서비스를 경험해보고 싶으신 분'
    ],
    keyBenefits: [
      { 
        id: 1, 
        title: '개인별 맞춤형 회복 방향 안내 리포트 (1회)', 
        desc: '유니클만의 데이터 분석을 통해 당신의 현재 상태를 진단하고, 가장 효율적인 회복 경로를 설계한 리포트를 홈페이지를 통해 제공합니다.' 
      },
      { 
        id: 2, 
        title: "파트너사 '멤버십 전용 프로그램' 우대", 
        desc: '유니클과 협력하는 파트너 의료기관 이용 시, 오직 PASS 회원만을 위해 구성된 프리미엄 회복 프로그램을 전용 우대 가격으로 이용하실 수 있습니다.' 
      },
      { 
        id: 3, 
        title: '전담 네비게이터 예약 관리 & 우선 배정', 
        desc: '유니클 멤버 전용 예약 라인을 통해 전담 네비게이터가 최적의 일정을 조율해 드립니다. 일반 예약보다 우선하여 배정받는 특권을 누리세요.' 
      }
    ],
    careServices: [
      { title: '회복관리 가이드 상시 제공', desc: '시술 후 일상 복귀까지, 홈페이지를 통해 전문적인 케어 가이드를 확인하실 수 있습니다.' },
      { title: '멤버 전용 프로모션 우선 안내', desc: '유니클의 새로운 서비스나 시즌별 집중 혜택을 누구보다 빠르게 안내받으실 수 있습니다.' }
    ],
    roadmap: [
      { step: '01', title: '데이터 진단', desc: '60초 정밀 분석 및 기초 지표 설정' },
      { step: '02', title: '설계 리포트', desc: '전담 네비게이터의 맞춤형 경로 컨설팅' },
      { step: '03', title: '안심 회복', desc: '2년 간의 상시 우대 혜택 적용 및 관리' }
    ],
    theme: 'bg-blue-50/50',
    accent: 'text-blue-600',
    buttonColor: 'bg-blue-600 hover:bg-blue-700'
  },
  signature: {
    id: 'signature',
    name: 'SIGNATURE PASS',
    title: '[SIGNATURE PASS] 유니클의 핵심, 5년의 완벽한 회복 설계',
    subtitle: '"단순한 시술 한 번이 아니라, 5년의 관리권을 소유하세요"',
    intro: 'SIGNATURE PASS는 유니클의 철학이 가장 집약된 핵심 상품입니다. 일회성 방문을 넘어, 장기적인 관점에서 가장 효율적이고 유리하게 건강 자산을 운영하고 싶은 분들을 위해 설계되었습니다.',
    price: '11,000,000',
    period: '5년',
    position: '유니클 프리미엄 서비스 1,100만 포인트 인정',
    recommendations: [
      '지속적이고 반복적인 관리가 필요하신 분',
      '5년이라는 장기적인 호흡으로 체계적인 관리를 받고 싶은 분',
      '비용보다 전체적인 흐름의 효율과 운영의 편리함을 중시하는 분'
    ],
    keyBenefits: [
      { 
        id: 1, 
        title: '개인 회복 설계 리포트 (1회)', 
        desc: '가입 즉시 전문가의 분석을 통해 고객님만을 위한 맞춤형 회복 로드맵을 홈페이지에서 확인하실 수 있습니다.' 
      },
      { 
        id: 2, 
        title: '멤버십 전용 전략 프로그램 운영', 
        desc: '제휴 파트너사의 핵심 프로그램 이용 시, 오직 시그니처 회원에게만 허용되는 특별 우대 조건이 적용됩니다.' 
      },
      { 
        id: 3, 
        title: '회복 키트 제공 (연 2회)', 
        desc: '시술 후 일상에서도 최상의 컨디션을 유지할 수 있도록 설계된 전용 회복 키트를 정기적으로 보내드립니다.' 
      },
      { 
        id: 4, 
        title: '스마트 알림 및 선공개', 
        desc: '신규 프로그램이 출시될 때 누구보다 먼저 홈페이지와 알림을 통해 우선 접근권을 가집니다.' 
      }
    ],
    careServices: [
      { title: '우선 일정 배정', desc: '원하는 시간에 가장 빠르게 케어를 받으실 수 있도록 예약 일정을 최우선으로 조율합니다.' },
      { title: '상시 가이드 제공', desc: '홈페이지를 통해 회복 단계별 가이드를 언제든 확인하실 수 있습니다.' }
    ],
    roadmap: [
      { step: '01', title: '정밀 설계', desc: 'DNA 및 라이프스타일 통합 분석' },
      { step: '02', title: '경로 최적화', desc: '매 시즌 변화에 맞춘 회복 루틴 조정' },
      { step: '03', title: '완전한 변천', desc: '5년 간의 체계적 관리를 통한 건강한 삶 안착' }
    ],
    theme: 'bg-chapter-accent/5',
    accent: 'text-chapter-accent',
    buttonColor: 'bg-chapter-accent hover:bg-chapter-accent/90'
  },
  black: {
    id: 'black',
    name: 'BLACK PASS',
    title: '[BLACK PASS] 단 한 분을 위한 프라이빗 컨시어지',
    subtitle: '"당신의 시간과 가치는 특별하기에, 모든 과정은 프라이빗해야 합니다"',
    intro: 'BLACK PASS는 선택의 피로를 줄이고, 오직 자신에게만 집중하고 싶은 VIP 고객을 위한 최상위 운영형 패스입니다.',
    price: '33,000,000',
    period: '5년',
    position: '유니클 모든 프리미엄 솔루션 3,300만 포인트 인정',
    recommendations: [
      '최고 수준의 프라이빗한 맞춤 관리를 선호하시는 분',
      '복잡한 과정 대신 시간 절약과 절대적인 우선권이 중요하신 분',
      '가족 또는 소중한 지인과 함께 특별한 혜택을 나누고 싶은 분'
    ],
    keyBenefits: [
      { 
        id: 1, 
        title: '프리미엄 리포트 상시 제공', 
        desc: '변화하는 데이터에 맞춰 실시간으로 업데이트되는 정밀 체크 리포트를 홈페이지에서 상시 확인하실 수 있습니다.' 
      },
      { 
        id: 2, 
        title: '최상위 회원 전용 우대', 
        desc: '제휴 파트너사의 모든 범위에서 블랙 회원만이 누릴 수 있는 최상위 수준의 프로그램 운영권이 부여됩니다.' 
      },
      { 
        id: 3, 
        title: '지정인 혜택 공유', 
        desc: '본인 외에 지정한 1인에 한해 연 3회 혜택을 함께 나누어 사용할 수 있습니다.' 
      },
      { 
        id: 4, 
        title: '특별 행사 및 고단가 프로그램 우선권', 
        desc: '유니클이 주최하는 프라이빗 행사 초청 및 신규 고급 프로그램에 대한 가장 빠른 접근권을 보장합니다.' 
      }
    ],
    careServices: [
      { title: '전담 응대 라인', desc: '블랙 회원님만을 위한 전용 소통 채널을 통해 모든 요청 사항을 신속하게 처리합니다.' },
      { title: '최상위 우선 예약', desc: '어떤 상황에서도 블랙 회원의 일정을 최우선으로 배정하는 시스템이 작동합니다.' }
    ],
    roadmap: [
      { step: '01', title: 'VIP 오리엔테이션', desc: '개인 전담팀 구성 및 마스터 분석' },
      { step: '02', title: '프라이빗 케어', desc: '모든 일정과 장소가 고객을 중심으로 재편' },
      { step: '03', title: '명예로운 회복', desc: '최상위 멤버십이 드리는 독점적 가치 영위' }
    ],
    theme: 'bg-obsidian text-mist',
    accent: 'text-chapter-accent',
    buttonColor: 'bg-chapter-accent hover:bg-chapter-accent/90'
  }
};
