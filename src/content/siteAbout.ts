import { 
  Sparkles, 
  BadgeCheck, 
  MessageSquare, 
  Shield, 
  Wallet,
  LucideIcon 
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
  payment: "Nicepay",
  hero: "프리미엄을 더 공정하게.",
  short: "Youniqle은 주식회사 사피에넷이 운영하는 프리미엄 큐레이션 몰입니다. 우리는 '정직한 정보·투명한 가격·빠른 사후지원'을 원칙으로, 파트너 네트워크에서 선별한 상품만 소개합니다. 안전결제(Nicepay)와 멤버십 포인트로 더 스마트한 쇼핑을 경험하세요.",
  standard: [
    "우리는 좋은 것을 바르게 전합니다.",
    "Youniqle은 품질이 검증된 상품을 선별(큐레이션)하고, 파트너와의 직접 협업으로 합리적 가격과 안정적 재고를 유지합니다.",
    "모든 정보는 투명하게 공개하고, 구매 전후 신속한 응대로 고객 시간을 아낍니다.",
    "멤버십 포인트·등급 혜택으로 살수록 유리해지는 쇼핑을 제공하며, 결제는 Nicepay로 안전하게 처리됩니다."
  ],
  extended: [
    "Youniqle은 프리미엄을 '생활 가능한 가격'으로 연결하는 큐레이션 커머스입니다. 우리는 파트너사와의 직접 협업, 데이터 기반 수요 예측, 표준화된 품질 검수를 통해 과장 없는 정보를 제공합니다.",
    "고객의 시간과 신뢰를 가장 큰 자산으로 생각합니다. 가격·원산지·구성·A/S 범위를 투명하게 안내하고, 구매 이후에도 빠르게 돕는 것이 Youniqle의 기본입니다.",
    "혜택은 단순하고, 결제는 안전하게. 멤버십 등급과 포인트로 합리성을 높이고, 결제는 Nicepay로 안전하게 처리합니다. 운영사: 주식회사 사피에넷."
  ],
  values: [
    { title: "선별 큐레이션", desc: "파트너 검증·품질 표준화", icon: Sparkles },
    { title: "투명 가격", desc: "합리적 마진, 숨김 없음", icon: BadgeCheck },
    { title: "빠른 응대", desc: "구매 전후 1:1 지원", icon: MessageSquare },
    { title: "안전 결제", desc: "Nicepay 기반 보안 결제", icon: Shield },
    { title: "멤버십 혜택", desc: "등급·포인트로 더 합리하게", icon: Wallet }
  ],
  partnerOneLiner: "함께 성장할 파트너를 찾습니다. 브랜드 스토어·전문 유통사·크리에이터와의 공정한 협업을 약속합니다. (입점/제휴 문의: partner@youniqle.co.kr)",
  abTests: [
    "좋은 것을 더 바르게, Youniqle.",
    "프리미엄, 이제 합리의 영역으로.",
    "선택은 가볍게, 신뢰는 단단하게."
  ]
} as const;

export default ABOUT_CONTENT;

