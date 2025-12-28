import {
  Sparkles,
  BadgeCheck,
  MessageSquare,
  Shield,
  Wallet,
  LucideIcon,
  Activity,
  Zap,
  Lock
} from 'lucide-react';

export interface ValueItem {
  title: string;
  desc: string;
  icon: LucideIcon;
}

export interface AboutContent {
  brand: string;
  company: string;
  payment: string;
  hero: string;
  short: string;
  standard: string[];
  extended: string[];
  values: ValueItem[];
  partnerOneLiner: string;
  abTests: string[];
}

export const ABOUT_CONTENT: AboutContent = {
  brand: "Youniqle",
  company: "주식회사 사피에넷",
  payment: "Safety Secured",
  hero: "Recovery by Data, not Feeling.",
  short: "Youniqle(유니크)은 주식회사 사피에넷이 운영하는 프리미엄 회복 큐레이션 브랜드입니다. 우리는 감각이 아닌 '데이터'에 기반하여 당신의 삶을 다시 세팅하는 가장 과학적이고 프라이빗한 솔루션을 제안합니다. 사피에넷의 기술력과 파트너 네트워크가 엄선한 회복 프로토콜을 만나보세요.",
  standard: [
    "우리는 회복의 본질을 데이터로 증명합니다.",
    "Youniqle은 단순한 상품 판매를 넘어, 사용자의 생체 데이터와 회복 점수를 기반으로 최적의 '회복 경로'를 설계(큐레이션)합니다.",
    "사피에넷의 전문 연구진이 검증한 프로토콜만을 소개하며, 모든 회복 과정은 투명한 데이터로 기록됩니다.",
    "멤버십 등급에 따른 프라이빗 컨시어지 서비스와 전용 상점을 통해 차별화된 회복 경험을 제공합니다."
  ],
  extended: [
    "Youniqle은 '느낌'에 의존하던 회복 시장을 '데이터'의 영역으로 혁신하는 사피에넷의 핵심 브랜드입니다. 우리는 글로벌 파트너사와의 협업을 통해 검증된 장비와 보완책을 선별하고, 개별 사용자에게 최적화된 회복 루틴을 제공합니다.",
    "당신의 시간과 에너지를 가장 소중한 자산으로 여깁니다. 불필요한 시행착오를 줄이고, 단 1분의 행동으로도 실질적인 회복 점수의 변화를 만들어내는 것이 우리의 목표입니다.",
    "기술은 차갑지만 경험은 따뜻하게. 사피에넷의 정밀한 데이터 분석과 Youniqle의 섬세한 큐레이션이 만나 당신의 내일을 바꿉니다. 운영사: 주식회사 사피에넷."
  ],
  values: [
    { title: "데이터 기반", desc: "감각이 아닌 수치로 증명하는 회복", icon: Activity },
    { title: "엄선 큐레이션", desc: "사피에넷 연구진의 엄격한 검증", icon: Sparkles },
    { title: "전문가 코칭", desc: "AI와 원장님이 제안하는 개인 맞춤형 프로토콜", icon: Zap },
    { title: "프라이빗 권한", desc: "등급별 차별화된 컨시어지 및 접근권", icon: Lock },
    { title: "신뢰 프로세스", desc: "주식회사 사피에넷의 책임 운영", icon: Shield }
  ],
  partnerOneLiner: "회복의 가치를 함께 실현할 글로벌 파트너를 찾습니다. 브랜드, 연구소, 전문가 그룹과의 혁신적인 협업을 환영합니다. (제휴 문의: partner@youniqle.co.kr)",
  abTests: [
    "Recovery by Data, not Feeling.",
    "내일의 에너지를 오늘 설계하다.",
    "사피에넷의 프리미엄 회복 큐레이션, 유니크."
  ]
} as const;

export default ABOUT_CONTENT;

