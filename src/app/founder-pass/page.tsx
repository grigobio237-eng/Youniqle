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
        id: 'essence',
        name: 'ESSENCE',
        subtitle: 'Digital Starter',
        price: 390000,
        color: 'from-emerald-500 to-teal-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        iconBg: 'bg-emerald-100',
        textColor: 'text-emerald-700',
        description: '디지털 회복 루틴을 가볍게 시작하고 싶은 분',
        coreFeatures: [
            { icon: BarChart3, text: 'Digital Bio-Check: 온라인 자가 생체 나이 진단' },
            { icon: Brain, text: 'AI 루틴 베이직: 기초 주간 회복 리포트' },
            { icon: Gift, text: '스타터 키트: 체험 샘플러 1회 제공' },
        ],
        economicBenefits: [
            '전 제품 5% 상시 할인',
            '활동 포인트 적립률 1.1배',
        ],
    },
    {
        id: 'balance',
        name: 'BALANCE',
        subtitle: 'Tech Enthusiast',
        price: 690000,
        color: 'from-violet-500 to-purple-600',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-200',
        iconBg: 'bg-violet-100',
        textColor: 'text-violet-700',
        description: 'AI 기술과 전문가 지식을 깊이 있게 경험하고 싶은 분',
        popular: true,
        coreFeatures: [
            { icon: Star, text: 'ESSENCE 혜택 전체 포함' },
            { icon: Brain, text: '전문가 디지털 가이드: 8대 무형 자산 VOD 강좌' },
            { icon: BarChart3, text: '3D 갤러리: 회복 데이터 시각화 공간' },
            { icon: Zap, text: 'AI 내비게이터 플러스: 일일 맞춤 푸시 알림' },
        ],
        economicBenefits: [
            '전 제품 10% 상시 할인',
            '활동 포인트 적립률 1.3배',
            '신규 디지털 도구 베타 테스트 우선권',
        ],
    },
    {
        id: 'miracle',
        name: 'MIRACLE',
        subtitle: 'Power User',
        price: 990000,
        color: 'from-amber-500 to-orange-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        iconBg: 'bg-amber-100',
        textColor: 'text-amber-700',
        description: '모든 기능을 활용하여 생체 데이터를 자산화하려는 분',
        coreFeatures: [
            { icon: Crown, text: 'BALANCE 혜택 전체 포함' },
            { icon: Sparkles, text: 'AI 웹툰 제네레이터: 월 1회 자동 생성' },
            { icon: Brain, text: '그룹 멘탈 큐레이팅: 분기별 라이브 웹세미나' },
            { icon: Shield, text: '디지털 금고(Vault): 보안 대시보드 강화 버전' },
        ],
        economicBenefits: [
            '전 제품 15% 상시 할인',
            '활동 포인트 적립률 1.5배',
            'Founders Flash Sale 전용 상점 이용',
        ],
    },
];

// FAQ Data
const faqs = [
    {
        q: 'Founder Pass는 의료 서비스인가요?',
        a: '아닙니다. Youniqle은 의료 행위를 제공하지 않는 "정보·연결·설계 플랫폼"입니다. 건강 관련 정보와 AI 기반 인사이트를 제공하지만, 이는 의료적 진단이나 치료를 대체하지 않습니다.'
    },
    {
        q: '다단계 구조인가요?',
        a: '아닙니다. Founder Pass는 순수한 멤버십 구독 서비스입니다. 다른 사람을 모집하는 것과 관계없이, 구매하신 티어의 혜택을 온전히 누리실 수 있습니다.'
    },
    {
        q: '투자 상품인가요?',
        a: '아닙니다. Founder Pass는 투자 상품이 아닌 서비스 이용권입니다. 금전적 수익을 보장하지 않으며, 플랫폼의 기능과 혜택을 이용하기 위한 멤버십입니다.'
    },
    {
        q: '환불이 가능한가요?',
        a: '네, 결제 후 7일 이내에 서비스를 이용하지 않으셨다면 100% 환불이 가능합니다. 환불 요청은 고객센터로 문의해 주세요.'
    },
    {
        q: '기존 멤버십과의 차이점은?',
        a: 'Founder Pass는 기존 멤버십의 상위 등급으로, 모든 기존 멤버십 혜택을 포함합니다. Founder Pass 가입 시 별도의 월 구독료 없이 모든 서비스를 이용하실 수 있습니다.'
    },
];

export default function FounderPassPage() {
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
                        FOUNDER PASS 2026
                    </Badge>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-obsidian leading-tight tracking-tight mb-6">
                        유니클 생태계에 들어오는<br />
                        <span className="bg-gradient-to-r from-violet-600 to-amber-500 bg-clip-text text-transparent">
                            단 하나의 입장권
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
                        회복을 '관리'가 아닌 '시스템'으로.<br />
                        Founder Pass와 함께 당신만의 회복 OS를 구축하세요.
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
                                                <span className="text-4xl font-black text-obsidian">
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
                                            <Link href={`/checkout?product=founder-${tier.id}&name=${tier.name}&price=${tier.price}&quantity=1`}>
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
                        Founder Pass는 기존 멤버십의 <strong className="text-obsidian">상위 등급</strong>입니다.<br />
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
                            <h3 className="text-xl font-bold mb-2">운영 정보</h3>
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
