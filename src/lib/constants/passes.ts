import { MousePointer2, Star, Crown, RefreshCcw, Leaf, Zap } from 'lucide-react';
import React from 'react';

export const PASS_SPECS: Record<string, any> = {
  reset: {
    id: 'reset',
    name: 'RESET PASS',
    title: '[RESET] 나를 멈춰 세우는 첫 번째 브레이크',
    subtitle: '"지금 나의 상태를 정확히 아는 것부터 시작합니다"',
    intro: '회복이 처음인 분들을 위한 입문 단계입니다. 1분 회복 점수 체크와 기초 루틴을 통해 현재의 나를 돌아보는 시간을 가집니다.',
    price: '0',
    period: '무료',
    position: '나의 유형 확인 및 기초 루틴 체험',
    recommendations: [
      '유니클의 회복 시스템을 가볍게 경험해보고 싶으신 분',
      '현재 나의 건강 상태를 정밀 데이터로 확인하고 싶으신 분',
      '작은 습관부터 시작하여 회복의 효능감을 느끼고 싶으신 분'
    ],
    keyBenefits: [
      { 
        id: 1, 
        title: '라이프 스냅 분석 (1일 1회)', 
        desc: '식단 또는 컨디션 사진 한 장으로 오늘의 회복 지수를 체크합니다.' 
      },
      { 
        id: 2, 
        title: '기초 회복 리포트 제공', 
        desc: '데이터를 바탕으로 한 기본적인 성향 분석 결과를 제공합니다.' 
      },
      { 
        id: 3, 
        title: '7일 데일리 루틴 체험', 
        desc: '초기 7일간의 필수 회복 미션을 가이드해 드립니다.' 
      }
    ],
    theme: 'bg-blue-50/50',
    accent: 'text-blue-600',
    buttonColor: 'bg-blue-600 hover:bg-blue-700'
  },
  reborn: {
    id: 'reborn',
    name: 'REBORN PASS',
    title: '[REBORN] 비워진 에너지를 다시 채우는 시간',
    subtitle: '"수면, 영양, 움직임을 데이터로 관리하여 기본기를 다집니다"',
    intro: '기록의 저장과 분석을 통해 몸과 마음의 기본기를 채우는 단계입니다. 주간 리포트를 통해 변화의 흐름을 파악하세요.',
    price: '19,900',
    period: '월',
    position: '기록 저장 및 주간 루틴 최적화',
    recommendations: [
      '꾸준한 기록을 통해 내 몸의 변화를 추적하고 싶으신 분',
      '주간 단위의 리포트로 체계적인 습관 교정을 원하시는 분',
      '프리미엄 회복 콘텐츠를 제한 없이 이용하고 싶으신 분'
    ],
    keyBenefits: [
      { 
        id: 1, 
        title: '반복 스냅 및 무제한 저장', 
        desc: '하루 여러 번의 스캔을 통해 정밀한 생활 패턴을 기록하고 영구 저장합니다.' 
      },
      { 
        id: 2, 
        title: '주간 분석 리포트 발행', 
        desc: '한 주간의 데이터를 결산하여 개선 방향과 칭찬 포인트를 짚어줍니다.' 
      },
      { 
        id: 3, 
        title: '프리미엄 사운드/명상 라이브러리', 
        desc: '숙면과 집중을 돕는 유니클만의 독점 오디오 콘텐츠를 제공합니다.' 
      }
    ],
    theme: 'bg-emerald-50/50',
    accent: 'text-emerald-600',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700'
  },
  restart: {
    id: 'restart',
    name: 'RESTART PASS',
    title: '[RESTART] 예전이 아닌, 더 건강한 삶으로의 시작',
    subtitle: '"회복된 몸으로 새로운 습관을 굳히는 통합 관리 단계"',
    intro: '시술 후 관리부터 장기적인 건강 루틴까지, 전담 네비게이터의 가이드 메시지와 함께하는 최상위 운영 단계입니다.',
    price: '49,900',
    period: '월',
    position: '정밀 분석 리포트 및 가이드 메시지',
    recommendations: [
      '병원 시술 전후 전문적인 데이터 케어가 필요하신 분',
      'AI와 전담팀의 정밀한 가이드에 따라 완벽한 회복을 원하는 분',
      '회복 멤버십 전용 프로그램 우대 혜택을 누리고 싶으신 분'
    ],
    keyBenefits: [
      { 
        id: 1, 
        title: '월 1회 종합 정밀 리포트', 
        desc: '빅데이터 기반의 심층 분석을 통해 한 달간의 회복 여정을 정리해 드립니다.' 
      },
      { 
        id: 2, 
        title: '전담 가이드 큐레이션 메시지', 
        desc: '현재 상태에 딱 맞는 맞춤형 가이드와 건강 정보를 정기적으로 발송합니다.' 
      },
      { 
        id: 3, 
        title: '면담 가이드 & 회복 로드맵 무제한', 
        desc: '시술 전 질문 리스트와 사후 관리 플랜을 무제한으로 생성하고 관리합니다.' 
      }
    ],
    theme: 'bg-amber-50/50',
    accent: 'text-amber-600',
    buttonColor: 'bg-amber-600 hover:bg-amber-700'
  },
  black: {
    id: 'black',
    name: 'BLACK PASS',
    title: '[BLACK] 단 한 분만을 위한 프라이빗 컨시어지',
    subtitle: '"모든 과정은 당신을 중심으로 프라이빗하게 재편됩니다"',
    intro: '최고 수준의 맞춤 관리를 선호하는 VIP 고객을 위한 최상위 서비스입니다. 비공개 상담과 전문 기관 연계를 지원합니다.',
    price: '상담 후 안내',
    period: '개별',
    position: '목표/일정/프라이버시 기반 1:1 맞춤',
    recommendations: [
      '절대적인 보안과 프라이빗한 집중 케어가 필요하신 분',
      '복잡한 과정 대신 시간 절약과 최상위 우선권이 중요하신 분',
      '전문 의료진 및 기관과의 유기적인 연계를 원하시는 분'
    ],
    keyBenefits: [
      { 
        id: 1, 
        title: '생활기록 실시간 검토 & 피드백', 
        desc: '전문 관리팀이 사용자의 생활 패턴을 상시 모니터링하고 즉각 피드백합니다.' 
      },
      { 
        id: 2, 
        title: '비공개 1:1 심층 상담 채널', 
        desc: '언제 어디서든 전담 상담사와 직접 소통할 수 있는 핫라인을 제공합니다.' 
      },
      { 
        id: 3, 
        title: '전문 기관/의료진 연계 및 동행', 
        desc: '필요 시 유니클 파트너 네트워크의 전문가 그룹을 직접 매칭하고 연결합니다.' 
      }
    ],
    theme: 'bg-obsidian text-mist',
    accent: 'text-chapter-accent',
    buttonColor: 'bg-chapter-accent hover:bg-chapter-accent/90'
  }
};
