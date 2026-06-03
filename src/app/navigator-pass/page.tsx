'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles,
    Check,
    ArrowRight,
    Shield,
    RefreshCw,
    Zap,
    Brain,
    BarChart3,
    Gift,
    Crown,
    Star,
    ChevronDown
} from 'lucide-react';
import Link from 'next/link';

// Tier Data
const tiers = [
    {
        id: 'start',
        name: 'START PASS',
        subtitle: 'Digital & Care Starter',
        price: 3300000,
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconBg: 'bg-blue-100',
        textColor: 'text-blue-700',
        description: '처음 시작하는 사람을 위한 입문형 회복 패스',
        coreFeatures: [
            { icon: BarChart3, text: '개인별 맞춤형 회복 방향 안내 리포트 (1회)' },
            { icon: Brain, text: "파트너사 '멤버십 전용 프로그램' 우대" },
            { icon: Zap, text: '전담 네비게이터 예약 관리 & 우선 배정' },
        ],
        economicBenefits: [
            '제휴사 비급여 항목 최대 30% 멤버십 전용가',
            '활동 포인트 적립률 5% 보장',
        ],
    },
    {
        id: 'signature',
        name: 'SIGNATURE PASS',
        subtitle: 'Main Strategic Product',
        price: 11000000,
        color: 'from-chapter-accent to-chapter-accent/80',
        bgColor: 'bg-chapter-accent/5',
        borderColor: 'border-chapter-accent/20',
        iconBg: 'bg-chapter-accent/10',
        textColor: 'text-chapter-accent',
        description: '유니클의 정수, 5년의 완벽한 회복 설계',
        popular: true,
        coreFeatures: [
            { icon: Star, text: 'START PASS 혜택 전체 포함' },
            { icon: Brain, text: '멤버십 전용 전략 프로그램 운영' },
            { icon: RefreshCw, text: '회복 키트 제공 (연 2회)' },
            { icon: Zap, text: '스마트 알림 및 신규 솔루션 선공개' },
        ],
        economicBenefits: [
            '제휴사 비급여 항목 최대 30% 멤버십 전용가',
            '활동 포인트 적립률 10% 보장',
            '멤버십 우선순위 예약 권한',
        ],
    },
    {
        id: 'black',
        name: 'BLACK PASS',
        subtitle: 'Private Concierge VIP',
        price: 33000000,
        color: 'from-slate-700 to-obsidian',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-300',
        iconBg: 'bg-slate-200',
        textColor: 'text-obsidian',
        description: 'VIP 고객을 위한 프라이빗 운영형 패스',
        coreFeatures: [
            { icon: Crown, text: 'SIGNATURE PASS 혜택 전체 포함' },
            { icon: Sparkles, text: '프리미엄 리포트 상시 제공' },
            { icon: Brain, text: '지정인 1인 혜택 공유 (연 3회)' },
            { icon: Shield, text: '유니클 독점 프로그램 평생 이용권' },
        ],
        economicBenefits: [
            '제휴사 비급여 항목 최대 30% 멤버십 전용가',
            '활동 포인트 적립률 15% 보장',
            '최상위 우선 예약 및 전담 응대 라인',
        ],
    },
];

// FAQ Data
const faqs = [
    {
        q: 'Navigator Pass는 의료 서비스인가요?',
        a: '아닙니다. Youniqle은 의료 행위를 제공하지 않는 "정보·연결·설계 플랫폼"입니다. 건강 관련 정보와 유니클 기반 인사이트를 제공하지만, 이는 의료적 진단이나 치료를 대체하지 않습니다.'
    },
    {
        q: '다단계 구조인가요?',
        a: '아닙니다. Navigator Pass는 순수한 멤버십 서비스입니다. 다른 사람을 모집하는 것과 관계없이, 구매하신 티어의 혜택을 온전히 누리실 수 있습니다.'
    },
    {
        q: '투자 상품인가요?',
        a: '아닙니다. Navigator Pass는 투자 상품이 아닌 서비스 이용권입니다. 금전적 수익을 보장하지 않으며, 플랫폼의 기능과 혜택을 이용하기 위한 멤버십입니다.'
    },
    {
        q: '환불이 가능한가요?',
        a: '네, 결제 후 7일 이내에 서비스를 이용하지 않으셨다면 100% 환불이 가능합니다. 환불 요청은 고객센터로 문의해 주세요.'
    },
    {
        q: '기존 멤버십과의 차이점은?',
        a: 'Navigator Pass는 기존 멤버십의 상위 등급으로, 모든 기존 멤버십 혜택을 포함합니다. Navigator Pass 가입 시 별도의 월 구독료 없이 모든 서비스를 이용하실 수 있습니다.'
    },
];

export default function NavigatorPassPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ko-KR').format(price);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-24 px-4">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-violet-200/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto text-center relative z-10"
                >
                    <Badge className="mb-6 bg-obsidian text-white px-4 py-1.5 text-sm font-bold">
                        NAVIGATOR PASS 2026
                    </Badge>
                    <h1 className="font-black text-obsidian leading-tight tracking-tight mb-6 text-3xl md:text-4xl">
                        유니클 생태계에 들어오는<br />
                        <span className="bg-gradient-to-r from-violet-600 to-amber-500 bg-clip-text text-transparent">
                            단 하나의 입장권
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
                        회복을 '관리'가 아닌 '시스템'으로.<br />
                        Navigator Pass와 함께 당신만의 회복 OS를 구축하세요.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-500" />
                            <span>7일 이내 100% 환불 보장</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-blue-500" />
                            <span>평생 멤버십 유지</span>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Pricing Cards */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {tiers.map((tier, index) => (
                            <motion.div
                                key={tier.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <Card className={`relative h-full flex flex-col ${tier.borderColor} border-2 ${tier.popular ? 'ring-2 ring-violet-500 ring-offset-2' : ''}`}>
                                    {tier.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <Badge className="bg-violet-600 text-white px-4 py-1">
                                                가장 인기
                                            </Badge>
                                        </div>
                                    )}

                                    <CardHeader className={`${tier.bgColor} rounded-t-lg pb-6`}>
                                        <div className="text-center">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                {tier.subtitle}
                                            </p>
                                            <h3 className={`text-2xl font-black ${tier.textColor}`}>
                                                {tier.name}
                                            </h3>
                                            <div className="mt-4">
                                                <span className="font-black text-obsidian text-4xl">
                                                    {formatPrice(tier.price)}
                                                </span>
                                                <span className="text-slate-500 ml-1">원</span>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-2">
                                                {tier.description}
                                            </p>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="pt-6 pb-8 flex-1 flex flex-col">
                                        {/* Core Features */}
                                        <div className="space-y-3 mb-6">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                핵심 혜택
                                            </p>
                                            {tier.coreFeatures.map((feature, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <div className={`${tier.iconBg} p-1.5 rounded-lg flex-shrink-0`}>
                                                        <feature.icon className={`w-4 h-4 ${tier.textColor}`} />
                                                    </div>
                                                    <span className="text-sm text-slate-700 leading-relaxed">
                                                        {feature.text}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Economic Benefits */}
                                        <div className="space-y-2 mb-8 pt-4 border-t border-slate-100">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                                경제적 혜택
                                            </p>
                                            {tier.economicBenefits.map((benefit, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                    <span className="text-sm text-slate-600">{benefit}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* CTA Button */}
                                        <Button
                                            className={`w-full h-12 mt-auto text-base font-bold bg-gradient-to-r ${tier.color} hover:opacity-90 text-white rounded-xl`}
                                            asChild
                                        >
                                            <Link href={`/checkout?product=navigator-${tier.id}&name=${tier.name}&price=${tier.price}&quantity=1`}>
                                                {tier.name} 시작하기
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Membership Relationship Notice */}
            <section className="py-12 px-4 bg-slate-50">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-4">
                        <Crown className="w-5 h-5 text-amber-500" />
                        <span className="text-sm font-bold text-slate-700">멤버십 관계 안내</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                        Navigator Pass는 기존 멤버십의 <strong className="text-obsidian">상위 등급</strong>입니다.<br />
                        가입 시 모든 멤버십 혜택이 자동으로 포함되며, 별도 구독료가 필요 없습니다.
                    </p>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 px-4">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-black text-center text-obsidian mb-12">
                        자주 묻는 질문
                    </h2>
                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full text-left bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="font-bold text-obsidian">{faq.q}</span>
                                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                                    </div>
                                    {openFaq === index && (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="text-slate-600 mt-4 pt-4 border-t border-slate-100 leading-relaxed"
                                        >
                                            {faq.a}
                                        </motion.p>
                                    )}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Footer */}
            <section className="py-12 px-4 bg-obsidian text-white">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="font-bold mb-2 text-xl">운영 정보</h3>
                            <div className="text-slate-400 text-sm space-y-1">
                                <p>상호: 주식회사 사피에넷</p>
                                <p>대표: 장범진</p>
                                <p>사업자등록번호: 838-88-02527</p>
                            </div>
                        </div>
                        <div className="text-sm text-slate-400">
                            <p className="mb-2">
                                Youniqle은 의료 행위를 제공하지 않는 정보·연결·설계 플랫폼입니다.
                            </p>
                            <div className="flex gap-4">
                                <Link href="/terms" className="hover:text-white underline">이용약관</Link>
                                <Link href="/privacy" className="hover:text-white underline">개인정보처리방침</Link>
                                <Link href="/faq" className="hover:text-white underline">FAQ</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
