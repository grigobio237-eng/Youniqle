'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Award, Activity, RefreshCcw, Zap, Sprout, Flower2, Sun, Share2, Crown, Lock, ArrowRight } from 'lucide-react';
import ChapterWrapper from '@/components/layout/ChapterWrapper';

type TierType = 'RESET' | 'REBORN' | 'RESTART';
type SeedingType = 'SEED' | 'BLOOM' | 'GLOW' | 'ECHO';

export default function MembershipPage() {
    const [userTier] = useState<TierType>('RESET');
    const [recoveryProgress] = useState(45);
    const [seedingLevel] = useState<SeedingType>('SEED');
    const [points] = useState(1250);

    return (
        <ChapterWrapper chapter="membership" className="container mx-auto px-4 py-20 pb-32 min-h-screen">
            {/* Header */}
            <div className="mb-24 text-center space-y-8 max-w-3xl mx-auto">
                <div className="inline-flex items-center px-4 py-1.5 bg-chapter-accent/5 text-chapter-accent rounded-full text-[10px] font-black tracking-widest uppercase border border-chapter-accent/20">
                    Authority & Access
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-text-primary tracking-tighter">회복 멤버십</h1>
                <p className="text-xl text-text-secondary leading-relaxed font-medium">
                    회복을 기록하고 증명할수록, <br />
                    당신만을 위한 <b className="text-text-primary">프라이빗 권한</b>과 <b className="text-text-primary">특별한 접근</b>이 열립니다.
                </p>
            </div>

            {/* 1. Main Tier Status */}
            <section className="mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
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
            <section className="mb-32 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 text-center md:text-left">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-text-primary tracking-tight">
                            🌱 마이크로 시딩 리워드
                        </h2>
                        <p className="text-text-secondary font-medium opacity-60 italic">작은 회복 행동들이 모여 거대한 숲을 이룹니다.</p>
                    </div>
                    <div className="bg-surface border border-line p-6 rounded-[32px] min-w-[240px]">
                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-50 block mb-1">Available Points</span>
                        <div className="text-4xl font-black text-chapter-accent tracking-tighter">{points.toLocaleString()} <span className="text-xl">P</span></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SeedingCard
                        level="SEED"
                        icon={<Sprout className="w-8 h-8 text-chapter-accent" />}
                        title="씨앗 단계"
                        desc="회복을 결심한 첫 걸음"
                        isUnlocked={true}
                    />
                    <SeedingCard
                        level="BLOOM"
                        icon={<Flower2 className="w-8 h-8 text-chapter-accent opacity-40" />}
                        title="개화 단계"
                        desc="변화가 꽃피는 시기"
                        isUnlocked={false}
                    />
                    <SeedingCard
                        level="GLOW"
                        icon={<Sun className="w-8 h-8 text-chapter-accent opacity-40" />}
                        title="광채 단계"
                        desc="주변을 밝히는 에너지"
                        isUnlocked={false}
                    />
                    <SeedingCard
                        level="ECHO"
                        icon={<Share2 className="w-8 h-8 text-chapter-accent opacity-40" />}
                        title="울림 단계"
                        desc="회복의 가치를 공유하는 권한"
                        isUnlocked={false}
                    />
                </div>
            </section>

            {/* 3. Shop & Actions */}
            <section className="max-w-6xl mx-auto">
                <Link href="/membership/shop" className="block group">
                    <div className="bg-surface border border-line rounded-[48px] overflow-hidden relative p-12 md:p-20 text-center space-y-8 hover:border-chapter-accent transition-all duration-700 shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-chapter-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <ShoppingBag className="w-16 h-16 mx-auto text-chapter-accent group-hover:scale-110 transition-transform duration-500" />
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-5xl font-black text-text-primary tracking-tighter">회복 상점 입장하기</h2>
                            <p className="text-text-secondary text-lg font-medium opacity-60">
                                오직 멤버십 회원에게만 허락된 큐레이션 셀렉션
                            </p>
                        </div>
                        <div className="inline-flex items-center text-chapter-accent font-black tracking-widest text-xs uppercase pt-4 group-hover:translate-x-2 transition-transform">
                            Enter Member Store <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                    </div>
                </Link>
            </section>
        </ChapterWrapper>
    );
}

function TierCard({ title, period, icon, isActive, description, benefits, progress }: any) {
    return (
        <Card className={`relative overflow-hidden transition-all duration-700 rounded-[40px] border-line flex flex-col p-10 ${isActive ? 'bg-surface border-chapter-accent shadow-2xl ring-1 ring-chapter-accent/20' : 'bg-surface/30 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 hover:border-line'}`}>
            <CardHeader className="p-0 space-y-6 mb-8">
                <div className="flex justify-between items-start">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-chapter-accent text-background shadow-lg shadow-chapter-accent/20' : 'bg-background border border-line text-text-secondary'}`}>
                        {icon}
                    </div>
                    <Badge className={`${isActive ? 'bg-chapter-accent text-background' : 'bg-background border-line text-text-secondary'} font-black text-[10px] tracking-widest h-7 px-3`}>
                        {period}
                    </Badge>
                </div>
                <div className="space-y-2">
                    <h3 className="text-3xl font-black text-text-primary tracking-tight uppercase">{title}</h3>
                    <p className={`text-sm font-bold ${isActive ? 'text-chapter-accent' : 'text-text-secondary'}`}>{description}</p>
                </div>
            </CardHeader>
            <CardContent className="p-0 space-y-10 flex-1 flex flex-col">
                <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-60">
                        <span>Tier Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className={`h-1.5 bg-background transition-all ${isActive ? '[&>div]:bg-chapter-accent' : '[&>div]:bg-text-secondary'}`} />
                </div>

                <ul className="space-y-4 flex-1">
                    {benefits.map((benefit: string, idx: number) => (
                        <li key={idx} className="text-sm font-medium flex items-center gap-3 text-text-primary">
                            <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-chapter-accent' : 'bg-text-secondary'}`}></div>
                            {benefit}
                        </li>
                    ))}
                </ul>

                {!isActive && (
                    <div className="pt-6 border-t border-line/10 flex items-center justify-center gap-2 text-[10px] font-black text-text-secondary uppercase tracking-widest">
                        <Lock className="w-3 h-3" /> Access Restricted
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function SeedingCard({ level, icon, title, desc, isUnlocked }: any) {
    return (
        <Card className={`relative overflow-hidden transition-all duration-500 rounded-[32px] border-line p-8 flex flex-col items-center text-center space-y-4 ${isUnlocked ? 'bg-surface shadow-xl' : 'bg-background opacity-30 grayscale border-dashed'}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-2 ${isUnlocked ? 'bg-chapter-accent/5' : ''}`}>
                {icon}
            </div>
            <div className="space-y-1">
                <div className="text-[10px] font-black text-chapter-accent uppercase tracking-widest">{level}</div>
                <h4 className="font-black text-lg text-text-primary">{title}</h4>
            </div>
            <p className="text-xs font-medium text-text-secondary tracking-tight leading-relaxed">{desc}</p>
            {isUnlocked ? (
                <div className="pt-2">
                    <Badge className="bg-chapter-accent/10 text-chapter-accent border-none text-[8px] font-black uppercase tracking-widest">UNLOCKED</Badge>
                </div>
            ) : (
                <Lock className="w-3 h-3 text-text-secondary opacity-30" />
            )}
        </Card>
    );
}
