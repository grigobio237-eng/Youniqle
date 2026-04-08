'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getUserProgress, getMembershipLevel, UserProgress } from '@/lib/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Award, Activity, RefreshCcw, Zap, Sprout, Flower2, Sun, Share2, Crown, Lock, ArrowRight, Leaf, Star, Sparkles } from 'lucide-react';
import ChapterWrapper from '@/components/layout/ChapterWrapper';

// 구매/활동 기반 회원등급 타입
type GradeType = 'cedar' | 'rooter' | 'bloomer' | 'glower' | 'ecosoul' | 'essence' | 'balance' | 'miracle';

// 등급 순서 정의 (비교용)
const GRADE_ORDER: GradeType[] = ['cedar', 'rooter', 'bloomer', 'glower', 'ecosoul', 'essence', 'balance', 'miracle'];

// 등급별 혜택 정의
const GRADE_BENEFITS: Record<GradeType, { title: string; desc: string; benefits: string[] }> = {
    cedar: {
        title: '시더',
        desc: '새싹 회원',
        benefits: ['기본 회복 콘텐츠 열람', '일반 상품 구매']
    },
    rooter: {
        title: '루터',
        desc: '뿌리를 내리는 회원',
        benefits: ['시더 혜택 포함', '월간 회복 리포트', '10% 추가 적립']
    },
    bloomer: {
        title: '블루머',
        desc: '꽃을 피우는 회원',
        benefits: ['루터 혜택 포함', '프리미엄 상품 할인', '전용 웨비나 참석']
    },
    glower: {
        title: '글로워',
        desc: '빛을 발하는 회원',
        benefits: ['블루머 혜택 포함', 'VIP 전용 상품 구매', '1:1 전문 상담']
    },
    ecosoul: {
        title: '에코소울',
        desc: '숲의 영혼, 최고 등급',
        benefits: ['글로워 혜택 포함', '신제품 우선 체험', '연간 멤버십 기프트']
    },
    essence: {
        title: '에센스',
        desc: 'Founder Pass 1단계',
        benefits: ['생체 나이 진단 1회', '주간 회복 리포트', '전 제품 5% 상시 할인']
    },
    balance: {
        title: '밸런스',
        desc: 'Founder Pass 2단계',
        benefits: ['에센스 혜택 전체 포함', '8대 무형 자산 강좌', '전 제품 10% 상시 할인']
    },
    miracle: {
        title: '미라클',
        desc: 'Founder Pass 최고 등급',
        benefits: ['밸런스 혜택 전체 포함', 'AI 웹툰 제네레이터', '전 제품 15% 상시 할인']
    }
};

export default function MembershipPage() {
    const { data: session } = useSession();
    const [points, setPoints] = useState(0);
    const [userGrade, setUserGrade] = useState<GradeType>('cedar');
    const [isLoadingUserData, setIsLoadingUserData] = useState(true);

    useEffect(() => {
        const p = getUserProgress();
        setPoints(p.totalPoints);

        // API에서 사용자 정보(grade) 조회
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user?.grade) {
                        setUserGrade(data.user.grade as GradeType);
                    }
                }
            } catch (error) {
                console.error('[Membership] Failed to fetch user data:', error);
            } finally {
                setIsLoadingUserData(false);
            }
        };

        if (session?.user) {
            fetchUserData();
        } else {
            setIsLoadingUserData(false);
        }
    }, [session]);

    return (
        <ChapterWrapper chapter="membership" className="container mx-auto px-4 py-20 pb-32 min-h-screen">
            {/* Header */}
            <div className="mb-24 text-center space-y-8 max-w-3xl mx-auto">
                <div className="inline-flex items-center px-4 py-1.5 bg-chapter-accent/5 text-chapter-accent rounded-full text-[10px] font-black tracking-widest uppercase border border-chapter-accent/20">
                    Rewards & Partnership
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-text-primary tracking-tighter">리워드 멤버십</h1>
                <p className="text-xl text-text-secondary leading-relaxed font-medium">
                    건강한 습관이 쌓일수록 더 큰 혜택으로 돌아옵니다. <br />
                    유니클의 성장에 함께해주시는 당신을 위한 <b className="text-text-primary">특별한 가치</b>를 확인하세요.
                </p>
            </div>

            {/* 1. Grade Status Overview */}
            <section className="mb-20 max-w-4xl mx-auto">
                <Card className="bg-surface border-line p-8 md:p-12 rounded-[40px] text-center space-y-6">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-40 mb-2">My Current Status</span>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-chapter-accent/10 flex items-center justify-center text-chapter-accent">
                                <Award className="w-8 h-8" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-3xl font-black text-text-primary uppercase tracking-tighter">{userGrade} Grade</h2>
                                <p className="text-sm font-bold text-chapter-accent">{GRADE_BENEFITS[userGrade]?.desc}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </section>

            {/* 2. Micro-seeding Rewards - 구매/활동 기반 회원등급 */}
            <section className="mb-32 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 text-center md:text-left">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-text-primary tracking-tight">
                            🌳 회원 등급 리워드
                        </h2>
                        <p className="text-text-secondary font-medium opacity-60 italic">구매와 활동이 쌓여 더 큰 혜택을 열어갑니다.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <GradeCard
                        level="CEDAR"
                        icon={<Leaf className="w-7 h-7 text-chapter-accent" />}
                        title="시더"
                        desc="새싹 회원"
                        benefits={GRADE_BENEFITS.cedar.benefits}
                        isCurrent={userGrade === 'cedar'}
                    />
                    <GradeCard
                        level="ROOTER"
                        icon={<Sprout className="w-7 h-7 text-chapter-accent" />}
                        title="루터"
                        desc="뿌리를 내리는 회원"
                        benefits={GRADE_BENEFITS.rooter.benefits}
                        isCurrent={userGrade === 'rooter'}
                    />
                    <GradeCard
                        level="BLOOMER"
                        icon={<Flower2 className="w-7 h-7 text-chapter-accent" />}
                        title="블루머"
                        desc="꽃을 피우는 회원"
                        benefits={GRADE_BENEFITS.bloomer.benefits}
                        isCurrent={userGrade === 'bloomer'}
                    />
                    <GradeCard
                        level="GLOWER"
                        icon={<Sun className="w-7 h-7 text-chapter-accent" />}
                        title="글로워"
                        desc="빛을 발하는 회원"
                        benefits={GRADE_BENEFITS.glower.benefits}
                        isCurrent={userGrade === 'glower'}
                    />
                    <GradeCard
                        level="ECOSOUL"
                        icon={<Crown className="w-7 h-7 text-chapter-accent" />}
                        title="에코소울"
                        desc="숲의 영혼, 최고 등급"
                        benefits={GRADE_BENEFITS.ecosoul.benefits}
                        isCurrent={userGrade === 'ecosoul'}
                    />
                </div>
            </section>

            {/* 2.5 Founder Pass Section */}
            <section className="mb-32 max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-200" />
                    <div className="flex items-center gap-2 px-6 py-2 bg-obsidian text-white rounded-full shadow-xl">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <span className="font-black tracking-widest text-xs uppercase">Founder Pass Series</span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-200" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <GradeCard
                        level="ESSENCE"
                        icon={<Zap className="w-8 h-8 text-emerald-500" />}
                        title="에센스"
                        desc="Digital Starter"
                        benefits={GRADE_BENEFITS.essence.benefits}
                        isCurrent={userGrade === 'essence'}
                        isFounder
                    />
                    <GradeCard
                        level="BALANCE"
                        icon={<Star className="w-8 h-8 text-violet-500" />}
                        title="밸런스"
                        desc="Tech Enthusiast"
                        benefits={GRADE_BENEFITS.balance.benefits}
                        isCurrent={userGrade === 'balance'}
                        isFounder
                    />
                    <GradeCard
                        level="MIRACLE"
                        icon={<Crown className="w-8 h-8 text-amber-500" />}
                        title="미라클"
                        desc="Power User"
                        benefits={GRADE_BENEFITS.miracle.benefits}
                        isCurrent={userGrade === 'miracle'}
                        isFounder
                    />
                </div>
            </section>

            {/* 3. Shop & Actions */}
            <section className="max-w-6xl mx-auto">
                <Link href="/products/shop" className="block group">
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

function GradeCard({ level, icon, title, desc, benefits, isCurrent, isFounder }: any) {
    return (
        <Card className={`relative overflow-hidden transition-all duration-500 rounded-[28px] border-line p-6 flex flex-col items-center text-center space-y-3 min-h-[280px]
            ${isCurrent ? (isFounder ? 'bg-obsidian/5 ring-2 ring-amber-500 shadow-2xl scale-[1.05]' : 'bg-chapter-accent/10 ring-2 ring-chapter-accent shadow-xl') : 'bg-surface shadow-md hover:shadow-lg'}
            ${isFounder && !isCurrent ? 'border-amber-100 hover:border-amber-300' : ''}`}>

            {isFounder && (
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20">
                    <Crown className="w-12 h-12" />
                </div>
            )}

            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isCurrent ? (isFounder ? 'bg-amber-100' : 'bg-chapter-accent/20') : (isFounder ? 'bg-amber-50' : 'bg-chapter-accent/5')}`}>
                {icon}
            </div>
            <div className="space-y-1">
                <div className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-chapter-accent' : 'text-text-secondary'}`}>{level}</div>
                <h4 className="font-black text-base text-text-primary">{title}</h4>
            </div>
            <p className="text-xs font-medium text-text-secondary tracking-tight">{desc}</p>

            {/* 혜택 목록 */}
            <ul className="text-[11px] text-text-secondary space-y-2 pt-2 w-full flex-1">
                {benefits?.map((benefit: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isCurrent ? 'bg-chapter-accent' : 'bg-text-secondary/50'}`} />
                        <span className="text-left leading-relaxed">{benefit}</span>
                    </li>
                ))}
            </ul>

            {isCurrent && (
                <div className="pt-2">
                    <Badge className="bg-chapter-accent text-white border-none text-[9px] font-black uppercase tracking-widest px-3 py-1">MY GRADE</Badge>
                </div>
            )}
        </Card>
    );
}
