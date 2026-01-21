'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import Image from 'next/image';
import { Star, ShieldCheck, HeartPulse, Zap, ScrollText, ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import ChatInterface from '../chat/ChatInterface';

interface LoungeLegacySectionProps {
    master: any;
    session: any;
    subscriptionActive: boolean;
    onShowResults?: () => void;
    aiPlans?: any;
}

export default function LoungeLegacySection({ master, session, subscriptionActive, onShowResults, aiPlans }: LoungeLegacySectionProps) {
    const items = master?.items || [
        {
            id: 'consult-1',
            title: '1:1 인텐시브 회복 상담',
            description: '원장이 직접 당신의 생체 데이터와 라이프스타일을 분석하여 최적의 회복 경로를 설계합니다.',
            price: '₩550,000',
            duration: '90분'
        },
        {
            id: 'consult-2',
            title: '프라이빗 컨시어지 (월간)',
            description: '한 달간 실시간 모니터링과 데일리 루틴 가이드를 통해 완벽한 컨디션을 유지하도록 돕습니다.',
            price: '₩2,500,000',
            duration: '월간 관리'
        }
    ];

    return (
        <div className="mt-32 space-y-32">
            {/* 1. Consultation Items (Items Grid) */}
            <section>
                <div className="text-center mb-16">
                    <span className="text-[10px] font-black luxury-gold-text uppercase tracking-[0.4em] block mb-2">Special Consultation</span>
                    <h2 className="text-4xl font-black text-luxury-navy italic tracking-tighter uppercase leading-none">
                        Professional <span className="luxury-gold-text">Services</span>
                    </h2>
                </div>

                {aiPlans && (
                    <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="flex items-center gap-3 mb-8">
                            <Sparkles className="w-5 h-5 text-luxury-gold" />
                            <h3 className="text-xl font-black text-luxury-navy tracking-tight italic">나의 맞춤 회복 설계 결과</h3>
                            <Badge className="bg-luxury-gold text-luxury-navy border-none font-black ml-2 px-3">AI Optimized</Badge>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {Object.entries(aiPlans.plans || {}).map(([key, plan]: [string, any]) => (
                                <Card key={plan.planId} className="group relative bg-luxury-gold/5 border-2 border-luxury-gold/20 rounded-[40px] overflow-hidden hover:bg-white hover:border-luxury-gold transition-all duration-500">
                                    <CardContent className="p-8 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <Badge className="bg-luxury-navy text-white border-none font-black px-3 py-1 uppercase tracking-widest text-[8px]">
                                                Plan {key.slice(-1)}
                                            </Badge>
                                            <p className="text-sm font-black text-luxury-gold">{plan.priceEstimate}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-lg font-black text-luxury-navy transition-colors">{plan.title}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{plan.focusArea}</p>
                                        </div>
                                        <Button
                                            onClick={onShowResults}
                                            variant="ghost"
                                            className="w-full h-12 rounded-2xl border border-luxury-gold/10 bg-white shadow-sm font-black text-[10px] uppercase tracking-widest hover:bg-luxury-navy hover:text-white transition-all"
                                        >
                                            자세히 보기 <ArrowRight className="ml-2 w-3 h-3" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {items.map((item: any) => (
                        <Card key={item.id} className="group relative bg-white border-2 border-slate-50 rounded-[40px] overflow-hidden hover:border-luxury-gold/30 hover:shadow-2xl hover:shadow-luxury-gold/5 transition-all duration-500">
                            <CardContent className="p-10 space-y-6">
                                <div className="flex justify-between items-start">
                                    <Badge className="bg-luxury-gold/10 text-luxury-gold border-none font-black px-4 py-1.5 uppercase tracking-widest text-[9px]">
                                        {item.duration || 'Session'}
                                    </Badge>
                                    <p className="text-2xl font-black text-luxury-navy">{item.price}</p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-luxury-navy group-hover:text-luxury-gold transition-colors">{item.title}</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.description}</p>
                                </div>
                                <Button
                                    onClick={onShowResults}
                                    variant="ghost"
                                    className="w-full h-14 rounded-2xl border border-slate-100 font-black text-xs uppercase tracking-widest hover:bg-luxury-navy hover:text-white transition-all"
                                >
                                    {onShowResults ? '상담 결과 확인하기' : '플랜 설계 문의하기'} <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* 2. Profile Section - Text Only version (Image is already at the top) */}
            <section className="bg-white/50 backdrop-blur-sm p-12 md:p-20 rounded-[60px] border border-white/50 luxury-shadow">
                <div className="max-w-4xl mx-auto space-y-8 text-center">
                    <div className="space-y-4">
                        <Badge variant="outline" className="px-4 py-1 border-luxury-gold text-luxury-gold font-black uppercase tracking-widest text-[10px]">Representative Director</Badge>
                        <h2 className="text-4xl md:text-5xl font-black text-luxury-navy italic tracking-tighter">김미정 원장</h2>
                    </div>
                    <p className="text-2xl md:text-3xl text-slate-600 font-medium leading-relaxed italic">
                        "시술은 기적이 아닙니다. <br className="hidden md:block" />
                        회복된 몸 위에 놓일 때 비로소 완성되는 <span className="luxury-gold-text font-black">도구</span>일 뿐입니다."
                    </p>
                    <p className="text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                        유니클(Youniqle)의 모든 프로그램은 '어떻게 하면 시술을 덜 하게 할까'를 고민하며 설계되었습니다.
                        스스로 회복할 수 있는 힘을 길러드리는 것이 저의 진짜 처방입니다.
                    </p>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-14 px-10 rounded-full border-luxury-gold text-luxury-gold font-black hover:bg-luxury-gold hover:text-white transition-all text-xs uppercase tracking-widest">
                                원장 이력 전체보기
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md bg-white rounded-[40px] border-none luxury-shadow p-10">
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-black text-luxury-navy italic mb-6">김미정 원장 프로필</DialogTitle>
                                <div className="space-y-4 border-t border-slate-100 pt-6 text-left">
                                    <ul className="space-y-3 text-sm font-bold text-slate-600">
                                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-luxury-gold rounded-full" /> 고려대학교 외래교수 역임</li>
                                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-luxury-gold rounded-full" /> 대한 발란스의학회 부회장</li>
                                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-luxury-gold rounded-full" /> 세계얼굴 총회 상임회장</li>
                                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-luxury-gold rounded-full" /> 춘사 영화제 운영위원</li>
                                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-luxury-gold rounded-full" /> 국제 항노화 협회장 역임</li>
                                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-luxury-gold rounded-full" /> 미스코리아 심사위원</li>
                                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-luxury-gold rounded-full" /> 미래경희 병원장 역임</li>
                                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-luxury-gold rounded-full" /> 일본 중입자 크리닉 대표원장 역임</li>
                                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-luxury-gold rounded-full" /> 사랑의 크리닉 대원장 역임</li>
                                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-luxury-gold rounded-full" /> 독일 프리덴바일 병원 연수</li>
                                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-luxury-gold rounded-full" /> 독일 웨셀브 면역병원 연수</li>
                                    </ul>
                                </div>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>
            </section>

            {/* 3. Philosophy Section */}
            <section>
                <div className="text-center mb-16">
                    <span className="text-[10px] font-black luxury-gold-text uppercase tracking-[0.4em] block mb-2">Philosophy</span>
                    <h2 className="text-4xl font-black text-luxury-navy italic tracking-tighter mb-12">
                        Why <span className="luxury-gold-text underline decoration-1 underline-offset-8">Recovery</span> First?
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { emoji: '🧱', title: '기초 없는 건축은 위험합니다', desc: '기초가 없는 상태에서의 고강도 시술은 위험합니다. 유니클은 근본적인 회복을 최우선으로 합니다.' },
                        { emoji: '🌱', title: '몸은 스스로 낫고 싶어 합니다', desc: '우리의 몸은 이미 회복할 능력을 가지고 있습니다. 그 능력을 방해하는 요소(나쁜 루틴)만 제거해도 놀라운 변화가 시작됩니다.' },
                        { emoji: '🤝', title: '평생의 동행을 약속합니다', desc: '한 번의 시술로 끝나는 관계가 아닙니다. 안티그레비티 클리닉은 당신이 홀로서기 할 때까지 매일의 루틴을 함께 고민합니다.' },
                    ].map((card, i) => (
                        <Card key={i} className="text-center p-10 bg-white border-2 border-slate-50 rounded-[40px] hover:border-luxury-gold/20 hover:-translate-y-2 transition-all duration-500 luxury-shadow shadow-sm">
                            <CardContent className="pt-6 space-y-4">
                                <div className="text-5xl mb-6">{card.emoji}</div>
                                <h3 className="text-xl font-black text-luxury-navy italic tracking-tight">{card.title}</h3>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed word-keep-all">
                                    {card.desc}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* 4. FAQ Section */}
            <section className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-[10px] font-black luxury-gold-text uppercase tracking-[0.4em] block mb-2">Resources</span>
                    <h2 className="text-4xl font-black text-luxury-navy italic tracking-tighter">자주 묻는 질문 (FAQ)</h2>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {[
                        { q: 'Q. 시술은 언제 받는 것이 좋은가요?', a: '회복 점수가 "MID" 단계 이상으로 안정되었을 때 시술 효과가 극대화됩니다. 몸이 너무 지쳐있는 상태에서는 무리한 시술보다 수면과 영양 밸런스를 먼저 잡는 것을 권장합니다.' },
                        { q: 'Q. 컨시어지 프로그램은 누구나 신청 가능한가요?', a: '아니요, 컨시어지는 1:1 맞춤 설계의 밀도가 높기 때문에 매월 한정된 인원만 초대제로 운영됩니다. 신청 폼을 작성해 주시면, 현재 상태와 시급성을 원장이 직접 검토하여 초대를 드립니다.' },
                        { q: 'Q. 지방에 사는데 프로그램 진행이 가능한가요?', a: '네, 가능합니다. AI 네비게이터와 데일리 코칭은 100% 온라인으로 진행 가능합니다. 필요한 키트는 택배로 발송되며, 대면 상담이나 시술이 꼭 필요한 시점에만 내원하시면 됩니다.' }
                    ].map((faq, i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="border-none bg-slate-50/50 rounded-3xl overflow-hidden px-8">
                            <AccordionTrigger className="text-lg font-black text-luxury-navy hover:no-underline py-6">
                                {faq.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-500 font-medium leading-relaxed pb-8 text-base">
                                {faq.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </section>

            {/* 5. Private Lounge Entrance (Gemini Chat) */}
            <section className="flex flex-col items-center justify-center py-10 space-y-8">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            size="lg"
                            className="h-20 px-12 bg-luxury-navy text-white rounded-full shadow-2xl hover:scale-105 transition-all duration-300 border-4 border-white/10 group"
                        >
                            <MessageCircle className="mr-4 w-8 h-8 text-luxury-gold group-hover:rotate-12 transition-transform" />
                            <div className="flex flex-col items-start text-left">
                                <span className="text-xs font-black luxury-gold-text opacity-80 mb-0.5">김미정 원장 1:1</span>
                                <span className="text-xl font-black italic tracking-tight">
                                    {subscriptionActive ? '1:1 채팅방 입장하기' : '프라이빗 라운지 입장하기'}
                                </span>
                            </div>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 overflow-hidden bg-white border-none luxury-shadow rounded-[40px]" aria-describedby="chat-desc">
                        <DialogHeader className="sr-only">
                            <DialogTitle>김미정 원장 1:1 채팅</DialogTitle>
                            <DialogDescription id="chat-desc">
                                김미정 원장(AI)과 1:1 상담을 진행하는 라운지입니다.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-hidden relative">
                            <ChatInterface
                                session={session}
                                subscriptionActive={subscriptionActive}
                                onSubscribe={() => window.location.href = '/lounge/subscribe'}
                            />
                        </div>
                    </DialogContent>
                </Dialog>

                <p className="text-xs font-bold text-slate-400 text-center leading-relaxed">
                    더 궁금한 점이 있으신가요? <br />
                    위의 채팅창을 통해 원장 혹은 AI 어시스턴트에게 실시간으로 문의하실 수 있습니다.
                </p>
            </section>
        </div>
    );
}
