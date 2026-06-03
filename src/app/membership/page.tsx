'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Award, Activity, RefreshCcw, Zap, Sprout, Flower2, Sun, Share2, Crown, Lock, ArrowRight, Leaf, Star, Sparkles, Shield, MousePointer2, CheckCircle2 } from 'lucide-react';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import { PASS_SPECS } from '@/lib/constants/passes';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// 구매/활동 기반 회원등급 타입
type GradeType = 'cedar' | 'rooter' | 'bloomer' | 'glower' | 'ecosoul' | 'reset' | 'reborn' | 'restart' | 'black';

// 등급 순서 정의 (비교용)
const GRADE_ORDER: GradeType[] = ['cedar', 'rooter', 'bloomer', 'glower', 'ecosoul', 'reset', 'reborn', 'restart', 'black'];

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
    reset: {
        title: '리셋',
        desc: '회복의 시작',
        benefits: ['기초 회복 점수 체크', '7일 루틴 가이드']
    },
    reborn: {
        title: '리본',
        desc: '기본기를 다지는 시간',
        benefits: ['주간 분석 리포트', '프리미엄 사운드 라이브러리']
    },
    restart: {
        title: '리스타트',
        desc: '새로운 습관의 정착',
        benefits: ['전담 네비게이터 가이드', '정밀 분석 리포트']
    },
    black: {
        title: '블랙',
        desc: '프라이빗 컨시어지',
        benefits: ['1:1 전담 마케어', '전문 기관 연계 및 동행']
    }
};

export default function MembershipPage() {
    const { data: session } = useSession();
    const [userGrade, setUserGrade] = useState<GradeType>('cedar');
    const [isLoadingUserData, setIsLoadingUserData] = useState(true);

    useEffect(() => {
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
        <ChapterWrapper chapter="membership" className="container mx-auto px-4 py-12 md:py-20 pb-24 md:pb-40 min-h-screen">
            {/* Header: OS Identity Rebranding */}
            <div className="mb-16 md:mb-32 text-center space-y-6 md:space-y-10 max-w-4xl mx-auto">
                <div className="inline-flex items-center px-4 md:px-6 py-1.5 md:py-2 bg-primary/10 text-primary rounded-full text-[10px] md:text-xs font-black tracking-[0.3em] uppercase border border-primary/20 animate-pulse">
                    YOUNIQLE Life Pass Upgrade
                </div>
                <h1 className="font-black text-obsidian tracking-tighter leading-[1.2] break-keep text-xl md:text-4xl">
                    기록은 사라지지 않고<br />
                    <span className="text-primary">나를 이해하는 자산</span>이 됩니다
                </h1>
                <p className="text-[11px] md:text-sm text-slate/70 leading-relaxed font-bold max-w-2xl mx-auto break-keep px-2 md:px-4">
                    유니클 패스는 당신의 회복 여정을 기록하고 영구 소장하는 데이터 멤버십입니다. 
                    흩어진 일상의 흔적을 정밀한 데이터로 해석받아 당신만의 완벽한 회복 OS를 완성하세요.
                </p>
            </div>

            {/* Active Membership Status (Only for paid members) */}
            {(session?.user as any)?.passInfo?.status === 'ACTIVE' && (() => {
              const passInfo = (session.user as any).passInfo;
              const endDateStr = passInfo.endDate || passInfo.expiredAt;
              const endDate = endDateStr ? new Date(endDateStr) : null;
              const isValidDate = endDate && !isNaN(endDate.getTime());
              
              return (
              <div className="max-w-6xl mx-auto mb-16 md:mb-32">
                <div className="bg-obsidian rounded-[32px] md:rounded-[48px] p-6 md:p-12 text-mist relative overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
                  {/* Gold Gradient Shine */}
                  <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-chapter-accent/10 rounded-full blur-[80px] md:blur-[150px] -mr-40 md:-mr-96 -mt-40 md:-mt-96" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                    <div className="space-y-5 md:space-y-6 flex-1 text-center md:text-left w-full">
                      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                        <Badge className="bg-chapter-accent text-obsidian border-none font-black text-[9px] md:text-[10px] tracking-widest px-3 md:px-4 py-1 md:py-1.5 rounded-full">
                          ACTIVE {passInfo.type} MEMBER
                        </Badge>
                        <span className="text-mist/40 text-[9px] md:text-xs font-bold">
                          {isValidDate ? `Expired at: ${endDate.toLocaleDateString()}` : 'Lifetime Access'}
                        </span>
                      </div>
                      
                      <div className="space-y-1.5 md:space-y-2">
                        <h2 className="text-lg md:text-3xl font-black tracking-tighter break-keep leading-tight">
                          {session.user?.name}님, <br/>
                          최적의 회복 흐름을 유지하고 있습니다
                        </h2>
                        <p className="text-mist/60 text-xs md:text-base font-medium break-keep">네비게이터와 의료기관이 당신의 데이터를 정밀하게 분석 중입니다.</p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5 md:gap-4 pt-2 md:pt-4 w-full">
                        {passInfo.type === 'BLACK' && (
                          <>
                            <Button 
                              asChild
                              className="bg-chapter-accent hover:bg-white text-obsidian font-black rounded-xl md:rounded-2xl h-12 md:h-16 px-6 md:px-8 transition-all hover:scale-105 text-xs md:text-sm w-full sm:w-auto"
                            >
                              <Link href="/event/consultation">
                                사전 문진 작성하기 <ArrowRight className="ml-1.5 md:ml-2 w-4 h-4 md:w-5 md:h-5" />
                              </Link>
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline"
                                  className="bg-white/5 border-white/20 hover:bg-white/10 text-white font-black rounded-xl md:rounded-2xl h-12 md:h-16 px-6 md:px-8 text-xs md:text-sm w-full sm:w-auto"
                                >
                                  진료용 QR 제시 <Activity className="ml-1.5 md:ml-2 w-4 h-4 md:w-5 md:h-5" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-10 max-w-[320px] md:max-w-sm border-none shadow-2xl flex flex-col items-center text-center space-y-6 md:space-y-8 w-[90vw]">
                                <DialogHeader>
                                  <DialogTitle className="font-black text-obsidian tracking-tight text-xl md:text-2xl">진료 전용 QR</DialogTitle>
                                </DialogHeader>
                                <div className="p-4 md:p-6 bg-mist rounded-2xl md:rounded-3xl shadow-inner border border-line/50">
                                  <Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`YOUNIQLE_USER_${session.user?.name}`)}`}
                                    alt="Treatment QR"
                                    className="w-40 h-40 md:w-48 md:h-48 mix-blend-multiply"
                                  />
                                </div>
                                <div className="space-y-1 md:space-y-2">
                                  <p className="text-obsidian font-black text-base md:text-lg">{session.user?.name} 님</p>
                                  <p className="text-slate/60 font-bold text-xs md:text-sm leading-relaxed break-keep">
                                    의료기관 담당자에게 이 코드를 제시하세요.<br/>
                                    안전하게 데이터를 연동합니다.
                                  </p>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="w-full md:w-auto shrink-0 flex justify-center mt-6 md:mt-0">
                      <div className="w-32 h-32 md:w-64 md:h-64 rounded-[32px] md:rounded-[48px] bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center p-6 md:p-8 relative group">
                        <div className="absolute inset-0 bg-chapter-accent/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Activity className="w-12 h-12 md:w-24 md:h-24 text-chapter-accent animate-pulse relative z-10" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              );
            })()}

            {/* 1. Core Value Pillars: Why Upgrade? */}
            <section className="mb-24 md:mb-40 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
                {[
                  { icon: '📦', title: '리듬 보관함', desc: '7일 이상의 모든 사진과 한 줄 기록을 유실 없이 영구 보관합니다.' },
                  { icon: '📊', title: '주간 심층 해석', desc: 'AI가 매주 누적된 데이터를 분석해 당신만의 회복 리듬을 정의합니다.' },
                  { icon: '🛡️', title: '조용한 정리', desc: '더 깊은 정리가 필요할 때, 비공개로 선택 기준 리포트를 제공합니다.' }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-line/50 shadow-xl space-y-3 md:space-y-4 hover:border-primary/30 transition-all hover:-translate-y-2">
                    <div className="mb-3 md:mb-6 text-3xl md:text-4xl">{item.icon}</div>
                    <h3 className="text-base md:text-xl font-black text-obsidian">{item.title}</h3>
                    <p className="text-[11px] md:text-sm text-slate/60 font-bold leading-relaxed break-keep">{item.desc}</p>
                  </div>
                ))}
            </section>

            {/* 2. Pass Series: Choosing your OS Level */}
            <section className="mb-20 md:mb-40 max-w-7xl mx-auto">
                <div className="flex flex-col items-center text-center gap-2 md:gap-4 mb-10 md:mb-20">
                    <h2 className="text-lg md:text-3xl font-black text-obsidian tracking-tight">유니클 라이프 패스</h2>
                    <p className="text-slate/40 font-bold tracking-widest uppercase text-[10px] md:text-xs">Choose Your Operating Level</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {Object.values(PASS_SPECS).map((pass) => (
                      <Link key={pass.id} href={`/membership/${pass.id}`} className="block transition-transform hover:scale-[1.02] active:scale-[0.98]">
                        <GradeCard
                          level={pass.name.split(' ')[0]}
                          icon={
                            pass.id === 'reset' ? <RefreshCcw className="w-8 h-8 text-foreground/70" /> :
                            pass.id === 'reborn' ? <Leaf className="w-8 h-8 text-secondary" /> :
                            pass.id === 'restart' ? <Zap className="w-8 h-8 text-primary" /> :
                            <Crown className="w-8 h-8 text-slate-300" />
                          }
                          title={pass.id.charAt(0).toUpperCase() + pass.id.slice(1)}
                          desc={pass.position}
                          benefits={pass.keyBenefits.map((b: any) => b.title)}
                          isCurrent={(session?.user as any)?.passInfo?.type === pass.id.toUpperCase()}
                          isFounder
                          accentColor={pass.id === 'black' ? 'obsidian' : pass.id === 'reborn' ? 'emerald' : pass.id === 'restart' ? 'amber' : 'chapter-accent'}
                          period={pass.id === 'black' ? '상담 후 안내' : `${pass.period} ${pass.price}원`}
                        />
                      </Link>
                    ))}
                </div>
            </section>

            {/* 3. Privacy & Compliance Notice */}
            <section className="max-w-4xl mx-auto bg-mist/30 p-8 md:p-12 rounded-[32px] md:rounded-[48px] text-center space-y-4 md:space-y-6">
                <Shield className="w-10 h-10 md:w-12 md:h-12 mx-auto text-slate/40" />
                <div className="space-y-1.5 md:space-y-2">
                    <h3 className="text-base md:text-xl font-black text-obsidian tracking-tight break-keep">당신의 기록은 당신의 데이터 자산입니다</h3>
                    <p className="text-[11px] md:text-sm text-slate/60 font-bold leading-relaxed break-keep">
                        유니클은 사용자의 명시적 요청과 별도 동의 없이는 어떠한 데이터도 외부 전문기관에 공유하지 않습니다.<br />
                        멤버십은 파편화된 기록을 체계적인 데이터로 자산화하고, 더 깊은 회복의 통찰을 제공하는 데 집중합니다.
                    </p>
                </div>
            </section>

            {/* 4. Footer CTA: Store (Secondary) */}
            <div className="mt-40 text-center">
                <Link href="/products/shop" className="text-slate/30 hover:text-primary font-black text-xs tracking-[0.4em] transition-colors flex items-center justify-center gap-3">
                    ENTER MEMBER STORE <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </ChapterWrapper>
    );
}

function GradeCard({ level, icon, title, desc, benefits, isCurrent, isFounder, accentColor = 'chapter-accent', period }: any) {
    const isObsidian = accentColor === 'obsidian';

    // Safe static mapping for Tailwind JIT
    const colorStyles: Record<string, any> = {
        blue: {
            ring: 'ring-primary',
            border: 'border-blue-100 hover:border-primary/30',
            bgLight: 'bg-blue-50',
            text: 'text-primary',
            textDark: 'text-primary',
            bgDark: 'bg-primary'
        },
        emerald: {
            ring: 'ring-emerald-500',
            border: 'border-emerald-100 hover:border-emerald-300',
            bgLight: 'bg-emerald-50',
            text: 'text-secondary',
            textDark: 'text-secondary',
            bgDark: 'bg-secondary'
        },
        amber: {
            ring: 'ring-primary',
            border: 'border-amber-100 hover:border-primary/30',
            bgLight: 'bg-amber-50',
            text: 'text-primary',
            textDark: 'text-primary',
            bgDark: 'bg-primary'
        },
        'chapter-accent': {
            ring: 'ring-chapter-accent',
            border: 'border-chapter-accent/10 hover:border-chapter-accent/30',
            bgLight: 'bg-chapter-accent/5',
            text: 'text-chapter-accent',
            textDark: 'text-chapter-accent',
            bgDark: 'bg-chapter-accent'
        },
        obsidian: {
            ring: 'ring-slate-400',
            border: 'border-slate-800 hover:border-slate-700',
            bgLight: 'bg-white/10',
            text: 'text-slate-300',
            textDark: 'text-foreground/70',
            bgDark: 'bg-slate-800'
        }
    };

    const styles = colorStyles[accentColor] || colorStyles['chapter-accent'];

    return (
        <Card className={`relative overflow-hidden transition-all duration-700 rounded-[32px] md:rounded-[40px] border-line p-6 md:p-10 flex flex-col items-center text-center space-y-4 md:space-y-6 h-full min-h-[460px] md:min-h-[580px] group
            ${isCurrent ? (isFounder ? (isObsidian ? 'bg-obsidian text-mist ring-4 ring-slate-400 shadow-2xl' : `bg-white ring-4 ${styles.ring} shadow-2xl`) : 'bg-chapter-accent/10 ring-4 ring-chapter-accent shadow-xl') : (isObsidian ? 'bg-surface hover:bg-obsidian hover:text-mist' : 'bg-surface shadow-md hover:shadow-xl')}
            ${isFounder && !isCurrent ? styles.border : ''}`}>

            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[24px] md:rounded-[32px] flex items-center justify-center transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 shrink-0 ${isCurrent ? (isObsidian ? 'bg-white/10' : styles.bgLight) : (isObsidian ? 'bg-slate-100 group-hover:bg-white/10' : styles.bgLight)}`}>
                {icon}
            </div>
            <div className="space-y-2 md:space-y-3">
                <div className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] ${isCurrent ? (isObsidian ? 'text-amber-400' : styles.text) : (isObsidian ? 'text-foreground/70 group-hover:text-amber-400' : 'text-text-secondary')}`}>{level}</div>
                <h4 className={`font-black text-sm md:text-lg tracking-tighter ${isCurrent && isObsidian ? 'text-white' : 'text-text-primary group-hover:text-inherit'}`}>{title}</h4>
                <p className={`text-[10px] md:text-xs font-bold tracking-tight opacity-70 break-keep min-h-[28px] md:min-h-[32px] ${isCurrent && isObsidian ? 'text-mist' : 'text-text-secondary group-hover:text-inherit'}`}>{desc}</p>
            </div>
            
            <div className="pt-1 md:pt-2">
                {period && <Badge variant="secondary" className="text-[9px] md:text-[10px] font-black px-3 py-1 md:px-4 md:py-1 rounded-full bg-slate-100">{period}</Badge>}
            </div>

            {/* 혜택 목록 */}
            <ul className={`text-[10px] md:text-[11px] space-y-3 md:space-y-4 pt-4 md:pt-8 w-full flex-1 ${isCurrent && isObsidian ? 'text-mist/80' : 'text-text-secondary group-hover:text-inherit'}`}>
                {benefits?.map((benefit: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${isCurrent ? (isObsidian ? 'text-amber-400' : styles.textDark) : (isObsidian ? 'text-slate-300 group-hover:text-amber-400' : styles.textDark)}`} />
                        <span className="text-left leading-relaxed font-bold break-keep">{benefit}</span>
                    </li>
                ))}
            </ul>

            <div className="pt-6 mt-auto">
                {isCurrent ? (
                    <Badge className={`${isObsidian ? 'bg-primary' : styles.bgDark} text-white border-none text-[9px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg`}>CURRENT PLAN</Badge>
                ) : (
                    <div className={`text-[10px] font-black transition-all duration-300 uppercase tracking-widest flex items-center gap-2 group-hover:gap-3
                        ${isObsidian ? 'text-mist/40 group-hover:text-amber-400' : 'text-foreground/70 group-hover:text-primary'}`}>
                        View Details <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                )}
            </div>
        </Card>
    );
}

