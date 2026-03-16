'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getUserProgress, getMembershipLevel, UserProgress, TierType } from '@/lib/progress';
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
    const [progress, setProgress] = useState<UserProgress | null>(null);
    const [points, setPoints] = useState(0);
    const [streak, setStreak] = useState(0);
    const [userGrade, setUserGrade] = useState<GradeType>('cedar');
    const [userTier, setUserTier] = useState<TierType>('RESET');
    const [isLoadingUserData, setIsLoadingUserData] = useState(true);

    useEffect(() => {
        const p = getUserProgress();
        setProgress(p);
        setPoints(p.totalPoints);
        setStreak(p.currentStreak);

        // API에서 사용자 정보(grade, tier) 조회
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user?.grade) {
                        setUserGrade(data.user.grade as GradeType);
                    }
                    if (data.user?.tier) {
                        setUserTier(data.user.tier as TierType);
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

    const m = getMembershipLevel(points, streak);

    // 관리자가 수동으로 올린 등급(userTier)이 있으면 그것을 우선, 
    // 없으면 포인트 기반 자동 계산 등급 적용
    // 단, 포인트 기반 등급이 더 높을 수도 있으므로 '우선순위'를 정함
    const tierOrder: TierType[] = ['RESET', 'REBORN', 'RESTART'];
    const calculatedTierIndex = tierOrder.indexOf(m.level);
    const dbTierIndex = tierOrder.indexOf(userTier);

    // 더 높은 등급을 현재 등급으로 결정
    const activeTier = tierOrder[Math.max(calculatedTierIndex, dbTierIndex)];
    const userGradeIndex = GRADE_ORDER.indexOf(userGrade);

    // 등급 순서 정의 (비교용) - m.nextLevel 계산을 위해 필요
    const nextTierMap: Record<TierType, TierType | 'MAX'> = {
        'RESET': 'REBORN',
        'REBORN': 'RESTART',
        'RESTART': 'MAX'
    };
    const nextLevel = nextTierMap[activeTier];

    return (
        <ChapterWrapper chapter="membership" className="container mx-auto px-4 py-20 pb-32 min-h-screen">
            {/* 0. Nudge Section */}
            {nextLevel !== 'MAX' && (
                <div className="max-w-4xl mx-auto mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="bg-luxury-navy text-white rounded-[32px] p-8 md:p-12 relative overflow-hidden shadow-2xl border border-white/10">
                        {/* Background Deco */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-luxury-gold/20 blur-[100px] rounded-full" />

                        <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
                            <div className="flex-1 space-y-4">
                                <div className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full text-[8px] font-black tracking-widest uppercase border border-white/5">
                                    Next Milestone
                                </div>
                                <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
                                    <span className="text-luxury-gold uppercase">{nextLevel}</span> 등급까지 <br />
                                    <span className="text-4xl md:text-5xl">{m.pointsToNext}점</span> & <span className="text-4xl md:text-5xl">{m.streakToNext}일</span> 남았습니다.
                                </h2>
                                <p className="text-white/40 text-sm font-medium italic">
                                    * {activeTier === 'RESET' ? '매일의 진단과 기록으로 당신의 영향력을 증명하세요.' : '이미 충분히 잘하고 계십니다. 5층 전용 라운지가 곧 당신을 기다립니다.'}
                                </p>
                            </div>

                            <div className="shrink-0 flex flex-col items-center gap-2">
                                <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="50%" cy="50%" r="45%" className="stroke-white/5 fill-none" strokeWidth="6" />
                                        <circle cx="50%" cy="50%" r="45%" className="stroke-luxury-gold fill-none transition-all duration-1000 membership-progress" strokeWidth="6" strokeDasharray={`${m.progress * 2.8} 280`} />
                                        <style jsx>{`
                                            .membership-progress {
                                                stroke-dashoffset: 0;
                                            }
                                        `}</style>
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className="text-2xl font-black tracking-tighter">{m.progress}%</span>
                                    </div>
                                </div>
                                <Link href="/ai-navigator">
                                    <Button className="bg-luxury-gold text-luxury-navy font-black text-xs h-10 px-6 rounded-full hover:scale-105 transition-all">
                                        오늘의 회복 기록하기
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                        isActive={activeTier === 'RESET' || activeTier === 'REBORN' || activeTier === 'RESTART'}
                        isFocus={activeTier === 'RESET'}
                        description="멈추고 다시 세팅하는 시간"
                        benefits={['Daily Recovery Gate 접근 권한', 'AI 네비게이터 기본 코칭', '기초 회복 키트 구매 자격']}
                        progress={activeTier === 'RESET' ? m.progress : 100}
                        requirements="신규 가입 즉시 부여"
                    />

                    {/* Tier 2: Reborn */}
                    <TierCard
                        title="Reborn"
                        period="3~6개월"
                        icon={<Zap className="h-6 w-6" />}
                        isActive={activeTier === 'REBORN' || activeTier === 'RESTART'}
                        isFocus={activeTier === 'REBORN'}
                        description="에너지가 다시 차오르는 시기"
                        benefits={['5층 프라이빗 라운지 AI 플랜 설계 권한', '프리미엄 심층 리포트 열람', '신제품 베타 테스터 우선권']}
                        progress={activeTier === 'REBORN' ? m.progress : (activeTier === 'RESET' ? 0 : 100)}
                        requirements="500점 & 30일 연속 기록"
                    />

                    {/* Tier 3: Restart */}
                    <TierCard
                        title="Restart"
                        period="6개월+"
                        icon={<Award className="h-6 w-6" />}
                        isActive={activeTier === 'RESTART'}
                        isFocus={activeTier === 'RESTART'}
                        description="새로운 삶으로의 확장"
                        benefits={['SAPIENET 랩 투어 초대', '회복 큐레이터 자격 부여', '전용 프라이빗 라운지 입장']}
                        progress={activeTier === 'RESTART' ? m.progress : 0}
                        requirements="1500점 & 60일 연속 기록"
                    />
                </div>
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
                    <div className="bg-surface border border-line p-6 rounded-[32px] min-w-[240px]">
                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-50 block mb-1">Current Grade</span>
                        <div className="text-2xl font-black text-chapter-accent tracking-tighter uppercase">{userGrade}</div>
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

function TierCard({ title, period, icon, isActive, isFocus, description, benefits, progress, requirements }: any) {
    return (
        <Card className={`relative overflow-hidden transition-all duration-700 rounded-[40px] border-line flex flex-col p-10 
            ${isActive ? 'bg-surface border-chapter-accent/20' : 'bg-surface/30 opacity-40 grayscale'} 
            ${isFocus ? 'ring-2 ring-chapter-accent shadow-[0_32px_64px_-16px_rgba(var(--chapter-accent-rgb),0.15)] scale-[1.02] bg-surface border-chapter-accent' : ''}`}>
            <CardHeader className="p-0 space-y-6 mb-8">
                <div className="flex justify-between items-start">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-chapter-accent text-background shadow-lg shadow-chapter-accent/20' : 'bg-background border border-line text-text-secondary'}`}>
                        {icon}
                    </div>
                    <Badge className={`${isActive ? 'bg-chapter-accent text-background' : 'bg-background border-line text-text-secondary'} font-black text-[10px] tracking-widest h-7 px-3 uppercase`}>
                        {period}
                    </Badge>
                </div>
                <div className="space-y-2">
                    <h3 className="text-3xl font-black text-text-primary tracking-tight uppercase leading-none">{title}</h3>
                    <p className={`text-xs font-bold ${isActive ? 'text-chapter-accent' : 'text-text-secondary'}`}>{description}</p>
                </div>
            </CardHeader>
            <CardContent className="p-0 space-y-10 flex-1 flex flex-col">
                <div className="space-y-4">
                    <div className="flex justify-between text-[8px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">
                        <span>Tier Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className={`h-1 bg-background transition-all ${isActive ? '[&>div]:bg-chapter-accent' : '[&>div]:bg-text-secondary'}`} />
                </div>

                <ul className="space-y-4 flex-1">
                    {benefits.map((benefit: string, idx: number) => (
                        <li key={idx} className="text-xs font-bold flex items-start gap-4 text-text-primary leading-tight">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${isActive ? 'bg-chapter-accent' : 'bg-text-secondary'}`}></div>
                            {benefit}
                        </li>
                    ))}
                </ul>

                {!isActive ? (
                    <div className="pt-6 border-t border-line/10 flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-60">
                            <Lock className="w-3 h-3" /> Access Restricted
                        </div>
                        <div className="px-4 py-2 bg-slate-50 rounded-xl text-[9px] font-black text-chapter-accent/60 uppercase tracking-tighter">
                            Requirement: {requirements}
                        </div>
                    </div>
                ) : isFocus && (
                    <div className="pt-6 border-t border-line/10">
                        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-chapter-accent uppercase tracking-[0.3em]">
                            <Activity className="w-3 h-3 animate-pulse" /> Active Member
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
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
