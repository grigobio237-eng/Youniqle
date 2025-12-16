'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Leaf, Shield, UserCheck, Heart } from 'lucide-react';
import Link from 'next/link';

export default function RecoveryStartPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="bg-primary/5 py-20 px-4 text-center">
                <div className="max-w-4xl mx-auto space-y-6">
                    <span className="text-primary font-bold tracking-wider text-sm uppercase">Recovery Philosophy</span>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                        회복은 <span className="text-primary">멈춤</span>이 아니라<br />
                        더 멀리 가기 위한 <span className="text-primary">도약</span>입니다.
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Youniqle은 단순한 휴식을 넘어, <br className="md:hidden" />
                        과학적인 데이터와 맞춤형 솔루션으로<br />
                        당신의 일상을 지탱하는 에너지를 설계합니다.
                    </p>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-16">회복의 3가지 원칙</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Leaf className="w-12 h-12 text-green-500" />}
                            title="자연스러운 균형"
                            description="억지로 채우는 것이 아니라, 비워내고 순환시킴으로써 몸이 스스로 회복하는 힘을 기릅니다."
                        />
                        <FeatureCard
                            icon={<Shield className="w-12 h-12 text-blue-500" />}
                            title="데이터 기반 설계"
                            description="감에 의존하지 않고, 당신의 수면, 활동, 컨디션 데이터를 분석하여 가장 필요한 솔루션을 제안합니다."
                        />
                        <FeatureCard
                            icon={<UserCheck className="w-12 h-12 text-purple-500" />}
                            title="지속 가능한 습관"
                            description="일시적인 처방이 아닌, 평생 가져갈 수 있는 건강한 회복 루틴을 당신의 삶에 심어드립니다."
                        />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-gray-50 py-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-3xl font-bold text-center mb-16">어떻게 시작하나요?</h2>

                    <div className="space-y-8">
                        <StepRow
                            step="01"
                            title="매일의 상태 체크"
                            desc="하루 1분, 간단한 질문으로 당신의 몸 상태를 확인하세요. AI 네비게이터가 당신의 컨디션을 실시간으로 분석합니다."
                        />
                        <StepRow
                            step="02"
                            title="맞춤형 리포트 & 미션"
                            desc="현재 상태에 딱 맞는 '오늘의 회복 미션'을 받으세요. 물 마시기, 환기하기 같은 작은 행동이 큰 변화를 만듭니다."
                        />
                        <StepRow
                            step="03"
                            title="전문가와 함께하는 심화 과정"
                            desc="혼자서 어렵다면 '비밀 회복 오마카세'나 '닥터 라운지'를 통해 전문가의 도움을 받을 수 있습니다."
                        />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-4 text-center">
                <div className="max-w-2xl mx-auto space-y-8">
                    <h2 className="text-3xl font-bold">지금, 당신의 회복을 시작하세요</h2>
                    <p className="text-gray-600">
                        준비물은 가벼운 마음뿐입니다. <br />
                        나를 위한 투자를 더 이상 미루지 마세요.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="h-14 px-8 text-lg rounded-full" asChild>
                            <Link href="/">
                                오늘의 상태 체크하기 <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full" asChild>
                            <Link href="/cases">
                                리얼 회복 사례 보기
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-8 pb-8 px-6 space-y-4">
                <div className="flex justify-center mb-4">{icon}</div>
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                <p className="text-gray-500 leading-relaxed word-keep-all">{description}</p>
            </CardContent>
        </Card>
    );
}

function StepRow({ step, title, desc }: { step: string, title: string, desc: string }) {
    return (
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-white p-6 rounded-2xl shadow-sm">
            <div className="text-4xl font-black text-gray-200">{step}</div>
            <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-gray-600 leading-relaxed word-keep-all">{desc}</p>
            </div>
        </div>
    );
}
