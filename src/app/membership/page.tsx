'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Award, Activity, RefreshCcw, Zap, Sprout, Flower2, Sun, Share2 } from 'lucide-react';
type TierType = 'RESET' | 'REBORN' | 'RESTART';
type SeedingType = 'SEED' | 'BLOOM' | 'GLOW' | 'ECHO';

export default function MembershipPage() {
    // Mock Data (will be replaced by DB data later)
    const [userTier] = useState<TierType>('RESET');
    const [recoveryProgress] = useState(45); // 0-100% of current tier
    const [seedingLevel] = useState<SeedingType>('SEED');
    const [points] = useState(1250);

    return (
        <div className="container mx-auto px-4 py-12 pb-24">
            {/* Header */}
            <div className="mb-12 text-center space-y-4">
                <Badge variant="outline" className="px-3 py-1 text-primary border-primary">
                    Private Concierge Membership
                </Badge>
                <h1 className="text-4xl font-bold">회복 멤버십</h1>
                <p className="text-xl text-gray-600">
                    회복을 기록할수록, 더 높은 <b>권한(Authority)</b>과 <b>접근(Access)</b>이 열립니다.
                </p>
            </div>

            {/* 1. Main Tier Status */}
            <section className="mb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    {/* Progress Line Background (Desktop only) */}
                    <div className="hidden md:block absolute top-[20%] left-0 w-full h-1 bg-gray-100 -z-10" />

                    {/* Tier 1: Reset */}
                    <TierCard
                        title="Reset"
                        period="1개월차"
                        icon={<RefreshCcw className="h-6 w-6" />}
                        isActive={userTier === 'RESET'}
                        description="멈추고 다시 세팅하는 시간"
                        benefits={['Daily Recovery Gate 접근 권한', 'AI 네비게이터 기본 코칭', '기초 회복 키트 구매 자격']}
                        progress={userTier === 'RESET' ? recoveryProgress : 100}
                    />

                    {/* Tier 2: Reborn */}
                    <TierCard
                        title="Reborn"
                        period="3~6개월"
                        icon={<Zap className="h-6 w-6" />}
                        isActive={userTier === 'REBORN'}
                        description="에너지가 다시 차오르는 시기"
                        benefits={['비밀회복 컨시어지(오마카세) 신청 권한', '프리미엄 심층 리포트 열람', '신제품 베타 테스터 우선권']}
                        progress={userTier === 'REBORN' ? recoveryProgress : (userTier === 'RESET' ? 0 : 100)}
                    />

                    {/* Tier 3: Restart */}
                    <TierCard
                        title="Restart"
                        period="6개월+"
                        icon={<Award className="h-6 w-6" />}
                        isActive={userTier === 'RESTART'}
                        description="새로운 삶으로의 확장"
                        benefits={['SAPIENET 랩 투어 초대', '회복 큐레이터 자격 부여', '전용 프라이빗 라운지 입장']}
                        progress={userTier === 'RESTART' ? recoveryProgress : 0}
                    />
                </div>
            </section>

            {/* 2. Micro-seeding Rewards */}
            <section className="mb-20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            🌱 마이크로 시딩 리워드
                        </h2>
                        <p className="text-gray-500 mt-1">작은 회복 행동들이 모여 숲을 이룹니다.</p>
                    </div>
                    <div className="text-right">
                        <span className="text-sm text-gray-500">현재 보유 포인트</span>
                        <div className="text-3xl font-black text-primary">{points.toLocaleString()} P</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <SeedingCard
                        level="SEED"
                        icon={<Sprout className="w-8 h-8 text-green-500" />}
                        title="씨앗 단계"
                        desc="회복을 결심한 시작"
                        isUnlocked={true}
                    />
                    <SeedingCard
                        level="BLOOM"
                        icon={<Flower2 className="w-8 h-8 text-pink-500" />}
                        title="개화 단계"
                        desc="변화가 꽃피는 시기"
                        isUnlocked={false}
                    />
                    <SeedingCard
                        level="GLOW"
                        icon={<Sun className="w-8 h-8 text-orange-500" />}
                        title="광채 단계"
                        desc="주변을 밝히는 에너지"
                        isUnlocked={false}
                    />
                    <SeedingCard
                        level="ECHO"
                        icon={<Share2 className="w-8 h-8 text-blue-500" />}
                        title="울림 단계 (Referral)"
                        desc="친구와 7일 회복 챌린지 성공 시, 두 분 모두에게 '오마카세 우선권' 지급"
                        isUnlocked={false}
                    />
                </div>
            </section>

            {/* 3. Shop & Actions */}
            <section>
                <Link href="/membership/shop" className="block group">
                    <Card className="bg-gray-900 text-white border-none overflow-hidden relative h-48 flex items-center justify-center hover:scale-[1.01] transition-transform">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800" />
                        <CardContent className="relative z-10 text-center">
                            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300 group-hover:text-white transition-colors" />
                            <h2 className="text-3xl font-bold mb-2">회복 상점 입장하기</h2>
                            <p className="text-gray-400 group-hover:text-gray-200 transition-colors">
                                오직 멤버십 회원만을 위한 큐레이션 (구 쇼핑몰)
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </section>
        </div>
    );
}

function TierCard({ title, period, icon, isActive, description, benefits, progress }: any) {
    return (
        <Card className={`transition-all duration-300 ${isActive ? 'ring-2 ring-primary shadow-lg scale-105 z-10 bg-white' : 'opacity-70 grayscale bg-gray-50'}`}>
            <CardHeader>
                <div className="flex justify-between items-start mb-2">
                    <div className={`p-2 rounded-full ${isActive ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500'}`}>
                        {icon}
                    </div>
                    <Badge variant={isActive ? "default" : "secondary"}>
                        {period}
                    </Badge>
                </div>
                <CardTitle className="text-2xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-6 space-y-2">
                    <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>진행률</span>
                        <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <ul className="space-y-2">
                    {benefits.map((benefit: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-start gap-2 text-gray-600">
                            <span className="text-primary mt-1">•</span>
                            {benefit}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

function SeedingCard({ level, icon, title, desc, isUnlocked }: any) {
    return (
        <Card className={`text-center transition-all ${isUnlocked ? 'bg-white border-primary/20' : 'bg-gray-50 opacity-60'}`}>
            <CardContent className="pt-8 pb-6 px-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isUnlocked ? 'bg-primary/5' : 'bg-gray-200'}`}>
                    {icon}
                </div>
                <div className="font-bold text-lg mb-1">{title}</div>
                <div className="text-xs font-bold text-primary mb-2">{level}</div>
                <p className="text-xs text-gray-500 word-keep-all">{desc}</p>
            </CardContent>
            {isUnlocked && (
                <CardFooter className="pt-0 justify-center">
                    <Badge variant="outline" className="text-xs">획득 완료</Badge>
                </CardFooter>
            )}
        </Card>
    );
}
