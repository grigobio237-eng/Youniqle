'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
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
import ChatInterface from '@/components/chat/ChatInterface';
import { useSession } from 'next-auth/react';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function LoungeContent() {
    const { data: session } = useSession();
    const userGrade = (session?.user as any)?.grade || 'cedar';
    const isPremiumMember = ['ecosoul', 'glower', 'bloomer'].includes(userGrade);
    const [subscriptionActive, setSubscriptionActive] = React.useState(isPremiumMember);
    const router = useRouter();

    const handleSubscribe = () => {
        router.push('/membership');
    };

    return (
        <div className="absolute inset-0 z-30 bg-white overflow-y-auto">
            <div className="container mx-auto px-4 py-12">
                {/* 1. Profile Section */}
                <section className="mb-20">
                    <div className="flex flex-col md:flex-row gap-12 items-center bg-surface p-8 md:p-12 rounded-3xl border border-line shadow-2xl relative overflow-hidden">
                        {isPremiumMember && (
                            <div className="absolute top-0 right-0 px-10 py-2 bg-[#D4AF37] text-white text-[10px] font-black uppercase tracking-[0.3em] rotate-45 translate-x-8 translate-y-4 shadow-lg">
                                Premium
                            </div>
                        )}
                        <div className="w-48 h-48 md:w-64 md:h-64 relative shrink-0 rounded-full overflow-hidden border-4 border-surface shadow-xl">
                            <Image
                                src="/images/kim-mijeong-profile.jpg"
                                alt="김미정 원장 프로필"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 192px, 256px"
                                priority
                            />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                <Badge variant="outline" className="px-4 py-1 badge-primary">Representative Director</Badge>
                                {isPremiumMember && (
                                    <Badge className="bg-[#D4AF37] text-white border-none px-4 py-1 uppercase font-black text-[10px] tracking-widest leading-none">VIP Member</Badge>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-text-primary">김미정 원장</h1>
                            <p className="text-xl text-text-secondary mb-6 leading-relaxed">
                                "시술은 기적이 아닙니다. <br className="hidden md:block" />
                                회복된 몸 위에 놓일 때 비로소 완성되는 <span className="text-primary font-bold">도구</span>일 뿐입니다."
                            </p>
                            <p className="text-text-secondary mb-6 word-keep-all opacity-80">
                                유니클(Youniqle)의 모든 프로그램은 '어떻게 하면 시술을 덜 하게 할까'를 고민하며 설계되었습니다.
                                스스로 회복할 수 있는 힘을 길러드리는 것이 저의 진짜 처방입니다.
                            </p>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">원장 이력 전체보기</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold mb-4">김미정 원장 프로필</DialogTitle>
                                        <DialogDescription asChild className="text-base text-gray-700">
                                            <div className="space-y-4">
                                                <ul className="list-disc pl-5 space-y-2 mt-4">
                                                    <li>고려대학교 외래교수 역임</li>
                                                    <li>대한 발란스의학회 부회장</li>
                                                    <li>세계얼굴 총회 상임회장</li>
                                                    <li>춘사 영화제 운영위원</li>
                                                    <li>국제 항노화 협회장 역임</li>
                                                    <li>미스코리아 심사위원</li>
                                                    <li>미래경희 병원장 역임</li>
                                                    <li>일본 중입자 크리닉 대표원장 역임</li>
                                                    <li>사랑의 크리닉 대원장 역임</li>
                                                    <li>독일 프리덴바일 병원 연수</li>
                                                    <li>독일 웨셀브 면역병원 연수</li>
                                                </ul>
                                            </div>
                                        </DialogDescription>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </section>

                {/* 2. Philosophy Section */}
                <section className="mb-24">
                    <h2 className="text-2xl font-bold text-center mb-12 text-text-primary">왜 '회복'이 먼저일까요?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="text-center p-6 bg-surface border-line shadow-lg">
                            <CardContent className="pt-6">
                                <div className="text-4xl mb-4">🧱</div>
                                <h3 className="text-xl font-bold mb-4">기초 없는 건축은 위험합니다</h3>
                                <p className="text-text-secondary word-keep-all">
                                    기초가 없는 상태에서의 고강도 시술은 위험합니다. 유니클은 근본적인 회복을 최우선으로 합니다.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="text-center p-6 bg-surface border-primary/20 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                            <CardContent className="pt-6">
                                <div className="text-4xl mb-4">🌱</div>
                                <h3 className="text-xl font-bold mb-4">몸은 스스로 낫고 싶어 합니다</h3>
                                <p className="text-text-secondary word-keep-all">
                                    우리의 몸은 이미 회복할 능력을 가지고 있습니다. 그 능력을 방해하는 요소만 제거해도 놀라운 변화가 시작됩니다.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="text-center p-6 bg-surface border-line shadow-lg">
                            <CardContent className="pt-6">
                                <div className="text-4xl mb-4">🤝</div>
                                <h3 className="text-xl font-bold mb-4">평생의 동행을 약속합니다</h3>
                                <p className="text-text-secondary word-keep-all">
                                    한 번의 시술로 끝나는 관계가 아닙니다. 안티그레비티 클리닉은 당신이 홀로서기 할 때까지 매일의 루틴을 함께 고민합니다.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* 3. FAQ Section */}
                <section className="max-w-3xl mx-auto mb-20">
                    <h2 className="text-2xl font-bold text-center mb-12 text-text-primary">자주 묻는 질문 (FAQ)</h2>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-line">
                            <AccordionTrigger className="text-lg text-text-primary hover:text-primary">Q. 시술은 언제 받는 것이 좋은가요?</AccordionTrigger>
                            <AccordionContent className="text-text-secondary leading-relaxed text-base p-4 bg-background/50 rounded-lg">
                                회복 점수가 'MID' 단계(8~15점) 이상으로 안정되었을 때 시술 효과가 극대화됩니다.
                                몸이 너무 지쳐있는 'HIGH' 단계에서는 무리한 시술보다 수면과 영양 밸런스를 먼저 잡는 것을 권장합니다.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="border-line">
                            <AccordionTrigger className="text-lg text-text-primary hover:text-primary">Q. 컨시어지 프로그램은 누구나 신청 가능한가요?</AccordionTrigger>
                            <AccordionContent className="text-text-secondary leading-relaxed text-base p-4 bg-background/50 rounded-lg">
                                아니요, 컨시어지는 1:1 맞춤 설계의 밀도가 높기 때문에 매월 한정된 인원만 초대제로 운영됩니다.
                                신청 폼을 작성해 주시면, 현재 상태와 시급성을 원장이 직접 검토하여 초대를 드립니다.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3" className="border-line">
                            <AccordionTrigger className="text-lg text-text-primary hover:text-primary">Q. 지방에 사는데 프로그램 진행이 가능한가요?</AccordionTrigger>
                            <AccordionContent className="text-text-secondary leading-relaxed text-base p-4 bg-background/50 rounded-lg">
                                네, 가능합니다. '회복 OS'의 핵심인 AI 네비게이터와 데일리 코칭은 100% 온라인으로 진행됩니다.
                                필요한 영양제나 키트는 택배로 발송되며, 시술이 필요한 시점에만 내원하시면 됩니다.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </section>

                {/* 4. Private Lounge Entrance */}
                <section className="max-w-4xl mx-auto mb-20 flex justify-center py-10">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                size="lg"
                                className="h-20 px-12 text-xl font-bold rounded-full shadow-2xl bg-primary hover:shadow-xl hover:scale-105 transition-all duration-300 border-4 border-surface shadow-primary/20"
                            >
                                <span className="mr-3 text-3xl">💬</span>
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-normal opacity-80 mb-0.5">김미정 원장 1:1</span>
                                    <span>프라이빗 라운지 입장하기</span>
                                </div>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 overflow-hidden bg-gray-50 border-0 rounded-2xl" aria-describedby="chat-desc">
                            <DialogHeader className="sr-only">
                                <DialogTitle>김미정 원장 1:1 채팅</DialogTitle>
                                <DialogDescription id="chat-desc">
                                    프라이빗 라운지 채팅 창입니다.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex-1 overflow-hidden relative">
                                <ChatInterface
                                    session={session}
                                    subscriptionActive={subscriptionActive}
                                    onSubscribe={handleSubscribe}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </section>

                <section className="text-center pb-12">
                    <p className="text-text-secondary text-sm">
                        더 궁금한 점이 있으신가요? <br />
                        위의 채팅창을 통해 실시간으로 문의하실 수 있습니다.
                    </p>
                </section>
            </div>
        </div>
    );
}
