'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Download, Lock, Sparkles, ChevronLeft } from 'lucide-react';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import { MockPaymentModal } from '@/components/payment/MockPaymentModal';
import { DeepDiagnosisModal } from '@/components/diagnosis/DeepDiagnosisModal';
import { DiagnosisRadarChart } from '@/components/charts/DiagnosisRadarChart';
import { SimcheungDiagnosisEngine } from '@/lib/logic/simcheung-diagnosis';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/components/ui/toast';
import { AISolutionSection } from '@/components/diagnosis/AISolutionSection';
import { GoldenTimeOffer } from '@/components/diagnosis/GoldenTimeOffer';
import { determineMood } from '@/lib/audio/voice-strategy';
import { AccessControl } from '@/lib/logic/access-control';
import MembershipUpsellDialog from '@/components/auth/MembershipUpsellDialog';

// Type definition for Diagnosis Result
interface DeepDiagnosisResult {
    _id?: string;
    totalScore: number;
    title: string;
    description: string;
    scores?: Record<string, number>; // Original scores map from DB
    categoryScores?: {
        physical: number;
        mental: number;
        lifestyle: number;
        sleep: number;
    };
    metadata?: {
        tScores?: {
            domains: Record<string, number>;
            facets: Record<string, number>;
        };
        userInfo?: {
            name: string;
        };
    };
    aiSolution?: {
        analysis: string;
        exercise: string;
        nutrition: string;
        mindset: string;
        sleep: string;
        productConcept: {
            name: string;
            reason: string;
            ingredients: string[];
        };
        audioScript?: string;
    };
    type?: string;
    createdAt: string;
}

export default function DeepDiagnosisReportPage() {
    const router = useRouter();
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const requestedType = searchParams?.get('type')?.toUpperCase();
    const requestedId = searchParams?.get('id');
    
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<DeepDiagnosisResult | null>(null);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [deepDiagnosisModalOpen, setDeepDiagnosisModalOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const { data: session, update: updateSession } = useSession();
    const [showGenderModal, setShowGenderModal] = useState(false);
    const [isUpdatingGender, setIsUpdatingGender] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [showUpsell, setShowUpsell] = useState(false);
    const [userTier, setUserTier] = useState<string | null>(null);

    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleUnlockClick = () => {
        setShowUpsell(true);
    };

    const handlePaymentSuccess = () => {
        setPaymentOpen(false);
        setDeepDiagnosisModalOpen(true);
    };

    // PDF Download Logic
    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        setIsGeneratingPdf(true);

        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`Youniqle_Analysis_Report_${new Date().toISOString().slice(0, 10)}.pdf`);

            addToast({
                title: "리포트 다운로드 완료",
                description: "PDF 파일이 성공적으로 저장되었습니다.",
                variant: 'success'
            });
        } catch (error) {
            console.error('PDF Generation Error:', error);
            addToast({
                title: "다운로드 실패",
                description: "리포트 생성 중 오류가 발생했습니다.",
                variant: 'error'
            });
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const response = await fetch('/api/user/profile');
                if (response.ok) {
                    const userData = await response.json();
                    const diagnosisHistory = userData.diagnosisResults || [];
                    
                    if (userData.tier) {
                        setUserTier(userData.tier);
                    }

                    let latest = null;
                    if (requestedId) {
                        latest = diagnosisHistory.find((d: any) => d._id === requestedId);
                    }
                    
                    if (!latest) {
                        if (requestedType === 'PERSONALITY') {
                            const premiumTypes = ['PERSONALITY', 'DEEP', 'PAID'];
                            latest = [...diagnosisHistory].reverse().find((d: any) => premiumTypes.includes(d.type?.toUpperCase()));
                            
                            if (!latest) {
                                latest = [...diagnosisHistory].reverse().find((d: any) => d.type?.toUpperCase() === 'FREE');
                            }
                        } else if (requestedType) {
                            latest = [...diagnosisHistory].reverse().find((d: any) => d.type?.toUpperCase() === requestedType);
                        } else {
                            latest = diagnosisHistory.length > 0 ? diagnosisHistory[diagnosisHistory.length - 1] : null;
                        }
                    }

                    if (latest) {
                        const displayTitle = latest.title || (
                            latest.type?.toUpperCase() === 'FREE' ? '간단 유형 분석 리포트' :
                            (latest.type?.toUpperCase() === 'PAID' || latest.type?.toUpperCase() === 'DEEP' || latest.type?.toUpperCase() === 'PERSONALITY') ? '심층 성격 분석 리포트' :
                            '회복 분석 리포트'
                        );
                        
                        const updatedResult = { ...latest, title: displayTitle };
                        setResult(updatedResult);

                        if (!latest.aiSolution || !latest.aiSolution.audioScript) {
                            try {
                                let standardScores;
                                if (latest.type?.toLowerCase() === 'free') {
                                    standardScores = SimcheungDiagnosisEngine.mapFreeToStandard({
                                        convertedScores: latest.scores as any,
                                        totalScore: latest.totalScore,
                                        rawScores: {},
                                        lowestCategory: ''
                                    });
                                } else {
                                    standardScores = SimcheungDiagnosisEngine.mapPaidToStandard({
                                        domains: (latest.metadata?.tScores?.domains || latest.scores || {}) as any
                                    });
                                }

                                const solutionRes = await fetch('/api/ai/diagnosis-solution', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        scores: standardScores,
                                        tScores: latest.metadata?.tScores || { domains: latest.scores, facets: {} },
                                        userInfo: { name: userData.name || '회원' },
                                        diagnosisId: latest._id
                                    })
                                });
                                if (solutionRes.ok) {
                                    const solutionData = await solutionRes.json();
                                    setResult(prev => prev ? { ...prev, aiSolution: solutionData } : null);
                                }
                            } catch (err) {
                                console.error('Failed to fetch AI solution:', err);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch diagnosis report:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [requestedType]);

    useEffect(() => {
        if (result && session?.user && !(session.user as any).gender) {
            setShowGenderModal(true);
        }
    }, [result, session]);

    const handleGenderSelect = async (gender: 'male' | 'female') => {
        setIsUpdatingGender(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gender }),
            });

            if (res.ok) {
                await updateSession({ gender });
                setShowGenderModal(false);
            }
        } catch (err) {
            console.error('Failed to update gender:', err);
        } finally {
            setIsUpdatingGender(false);
        }
    };

    // Constant Domain Mapping
    const domainColors = useMemo(() => ({ 'N': '#f43f5e', 'E': '#f59e0b', 'O': '#10b981', 'A': '#3b82f6', 'C': '#8b5cf6' } as Record<string, string>), []);
    const domainNames = useMemo(() => ({ 'N': '신경증 (Neuroticism)', 'E': '외향성 (Extraversion)', 'O': '개방성 (Openness)', 'A': '우호성 (Agreeableness)', 'C': '성실성 (Conscientiousness)' } as Record<string, string>), []);

    // Access Control Logic
    const userRole = (session?.user as any)?.role;
    const isAdmin = userRole === 'admin' || userRole === 'superadmin' || AccessControl.isAdmin(session?.user);
    const finalTier = userTier || AccessControl.getUserGroup(session?.user);
    const isPremiumTier = ['REBORN', 'RESTART', 'BLACK'].includes(finalTier);
    const canSeePremium = isAdmin || isPremiumTier;
    const isPremiumType = result && ['PAID', 'DEEP', 'PERSONALITY'].includes(result.type?.toUpperCase() || '');
    const hasAccess = canSeePremium || isPremiumType;

    // Data Preparation
    const { chartData, big5DomainData } = useMemo(() => {
        let chart: any[] = [];
        let big5: any[] = [];

        if (result) {
            if (isPremiumType) {
                const domains = result.metadata?.tScores?.domains || {};
                const facets = result.metadata?.tScores?.facets || {};
                const std = SimcheungDiagnosisEngine.mapPaidToStandard({ domains });
                chart = [
                    { subject: '신체', score: std.physical, fullMark: 100, color: '#f43f5e' },
                    { subject: '멘탈', score: std.mental, fullMark: 100, color: '#f59e0b' },
                    { subject: '수면', score: std.sleep, fullMark: 100, color: '#3b82f6' },
                    { subject: '생활', score: std.lifestyle, fullMark: 100, color: '#10b981' },
                ];
                big5 = Object.keys(domains).map(key => ({
                    abbreviation: key,
                    subject: domainNames[key] || key,
                    score: domains[key],
                    color: domainColors[key] || '#cccccc',
                    facets: Object.keys(facets).filter(fk => fk.startsWith(key)).map(fk => ({ id: fk, name: getFacetName(fk), score: facets[fk] }))
                }));
            } else if (result.type?.toUpperCase() === 'FREE') {
                // Mapping keys: Mindset, Emotional, Social, Physical
                const raw = result.scores || {};
                const scores = {
                    mental: Math.round(((raw.Mindset || 50) + (raw.Emotional || 50)) / 2),
                    physical: raw.Physical || 50,
                    lifestyle: raw.Social || 50,
                    sleep: raw.Physical || 50
                };

                chart = [
                    { subject: '신체', score: scores.physical, color: '#f43f5e' },
                    { subject: '멘탈', score: scores.mental, color: '#f59e0b' },
                    { subject: '수면', score: scores.sleep, color: '#3b82f6' },
                    { subject: '생활', score: scores.lifestyle, color: '#10b981' },
                ];
                
                if (hasAccess) {
                    big5 = [
                        { abbreviation: 'M', subject: '멘탈 회복력', score: scores.mental, color: domainColors['N'], facets: [] },
                        { abbreviation: 'P', subject: '신체 활동성', score: scores.physical, color: domainColors['E'], facets: [] },
                        { abbreviation: 'L', subject: '생활 규칙성', score: scores.lifestyle, color: domainColors['C'], facets: [] },
                        { abbreviation: 'S', subject: '수면 안정성', score: scores.sleep, color: domainColors['A'], facets: [] },
                    ];
                }
            }
        }
        return { chartData: chart, big5DomainData: big5 };
    }, [result, isPremiumType, hasAccess, domainColors, domainNames]);

    if (loading) {
        return (
            <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
                <RefreshCw className="w-10 h-10 text-chapter-accent animate-spin mb-4" />
                <p className="text-foreground/70 font-medium">분석 리포트를 불러오는 중입니다...</p>
            </div>
        );
    }

    if (!result && !loading) {
        return (
            <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8 text-center">
                <Lock className="w-8 h-8 text-foreground/70 mb-6" />
                <h2 className="text-2xl font-black text-obsidian mb-2">분석 리포트가 없습니다</h2>
                <Button onClick={() => router.push('/ai-navigator')} className="mt-8 bg-chapter-accent text-white rounded-xl px-8">진단 하러 가기</Button>
            </div>
        );
    }

    return (
        <ChapterWrapper chapter="diagnosis-report">
            <div className="min-h-screen bg-[#F8FAFC]">
                {/* Navbar */}
                <div className="sticky top-0 z-[40] bg-white/80 backdrop-blur-md border-b border-line px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-slate-100 transition-colors">
                            <ChevronLeft className="w-5 h-5 text-obsidian" />
                        </Button>
                        <h1 className="text-lg font-black text-obsidian tracking-tight">내면 데이터 리포트</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleDownloadPDF} disabled={isGeneratingPdf} className="bg-chapter-accent/10 text-chapter-accent hover:bg-chapter-accent/20 border-none rounded-xl px-4 py-2 font-bold flex items-center gap-2">
                            <Download className={isGeneratingPdf ? 'animate-bounce' : ''} />
                            PDF
                        </Button>
                    </div>
                </div>

                <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-12 space-y-12 md:space-y-16" ref={reportRef}>
                    {/* Header Section */}
                    <section className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
                            <div className="flex flex-col items-center md:items-start">
                                <Badge variant="outline" className={`${hasAccess ? 'border-reward-gold text-reward-gold bg-reward-gold/5' : 'border-slate-300 text-foreground/70 bg-surface'} uppercase tracking-widest text-[10px] font-black px-3 py-1 rounded-full mb-3`}>
                                    {hasAccess ? 'Premium Analysis' : 'Basic Analysis'}
                                </Badge>
                                <h2 className="font-black text-obsidian tracking-tighter break-keep text-2xl md:text-4xl">
                                    {result?.title}
                                </h2>
                                <p className="mt-3 text-obsidian text-base md:text-lg leading-relaxed max-w-lg">
                                    현재 당신의 회복 탄력성(Resilience) 상태를 분석했습니다.
                                </p>
                            </div>
                            <div className="bg-white shadow-xl border border-line p-4 md:p-6 rounded-[24px] md:rounded-[32px] flex flex-col items-center min-w-[140px] md:min-w-[160px]">
                                <span className="text-[10px] md:text-xs font-bold text-foreground/70 uppercase tracking-widest mb-1">Total Score</span>
                                <span className="font-black text-obsidian tracking-tighter text-4xl md:text-4xl">{result?.totalScore || 0}</span>
                            </div>
                        </div>

                        {/* Radar Chart Summary */}
                        <Card className="bg-white border-line shadow-lg rounded-[32px] md:rounded-[40px] overflow-hidden">
                            <CardContent className="p-0 grid grid-cols-1 md:grid-cols-[1.2fr_1fr]">
                                <div className="p-4 md:p-12 flex items-center justify-center bg-gradient-to-b from-white to-slate-50/50 h-[320px] md:h-[400px]">
                                    {isMounted && <DiagnosisRadarChart data={chartData} color="#0F172A" />}
                                </div>
                                <div className="p-6 md:p-12 bg-surface/30 border-t md:border-t-0 md:border-l border-line flex flex-col justify-center space-y-6">
                                    <div>
                                        <h3 className="text-base md:text-lg font-bold text-obsidian mb-2">Analysis Insight</h3>
                                        <p className="text-obsidian text-xs md:text-sm leading-relaxed">
                                            4가지 핵심 회복 영역의 균형을 시각화했습니다. 그래프 면적이 넓을수록 회복탄력성이 이상적입니다.
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        {chartData.length > 0 ? chartData.map(d => (
                                            <div key={d.subject} className="flex items-center justify-between group">
                                                <span className="text-xs md:text-sm font-medium text-foreground/70 group-hover:text-obsidian">{d.subject}</span>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={d.score} className="w-20 md:w-24 h-1" />
                                                    <span className="text-xs md:text-sm font-bold text-obsidian w-8 text-right">{d.score}</span>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-4 bg-white/50 rounded-2xl border border-line">
                                                <p className="text-xs font-bold text-foreground/70">데이터가 없습니다.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Section 1: Personality Domains */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="bg-obsidian w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"><span className="text-white font-bold text-xl">1</span></div>
                            <div>
                                <h3 className="text-2xl font-black text-obsidian">심층 성격 요인 분석</h3>
                                <p className="text-foreground/70 text-sm">성향 및 회복 요인에 기반한 당신의 고유한 기질입니다.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {hasAccess ? (
                                big5DomainData.length > 0 ? (
                                    big5DomainData.map((domain) => (
                                        <Card key={domain.subject} className="bg-white border-line shadow-sm hover:shadow-md transition-shadow rounded-[24px] md:rounded-[32px] overflow-hidden group">
                                            <CardContent className="p-0 flex flex-col md:flex-row">
                                                <div 
                                                    className="w-full md:w-48 p-4 md:p-8 flex flex-row md:flex-col items-center justify-between md:justify-center text-white" 
                                                    style={{ backgroundColor: domain.color } as React.CSSProperties}
                                                >
                                                    <div className="flex items-center gap-3 md:flex-col md:gap-0">
                                                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-70 md:mb-2">{domain.abbreviation}</span>
                                                        <span className="text-lg md:text-xl font-black text-center break-keep">{domain.subject.split(' ')[0]}</span>
                                                    </div>
                                                    <div className="md:mt-4 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl px-3 py-1 md:px-4 md:py-2">
                                                        <span className="font-black text-xl md:text-2xl">{domain.score}</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 p-5 md:p-8">
                                                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                                                        <Sparkles className="w-3.5 h-3.5 text-chapter-accent" />
                                                        <span className="text-xs md:text-sm font-bold text-obsidian">분석 인사이트</span>
                                                    </div>
                                                    <p className="text-obsidian text-xs md:text-sm leading-relaxed">{getInterpretation(domain.subject, domain.score)}</p>
                                                    <div className="mt-4 md:mt-6">
                                                        <div className="flex justify-between items-center mb-1.5 md:mb-2">
                                                            <span className="text-[10px] md:text-xs font-bold text-foreground/70">강도</span>
                                                            <span className="text-[10px] md:text-xs font-bold text-obsidian">{domain.score}/100</span>
                                                        </div>
                                                        <Progress value={domain.score} className="h-1.5 md:h-2" indicatorColor={domain.color} />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <Card className="border-dashed border-2 border-line bg-surface/50 p-12 text-center rounded-[32px]">
                                        <p className="text-foreground/70 font-medium">상세 분석 데이터가 없습니다. 정밀 진단을 진행해 보세요.</p>
                                        <Button onClick={() => setDeepDiagnosisModalOpen(true)} variant="outline" className="mt-4 rounded-full">정밀 진단 시작하기</Button>
                                    </Card>
                                )
                            ) : (
                                <Card className="border-none shadow-inner bg-surface/50 p-12 text-center relative overflow-hidden group cursor-pointer" onClick={handleUnlockClick}>
                                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                                        <Lock className="w-6 h-6 text-chapter-accent mb-4" />
                                        <h3 className="font-bold text-obsidian mb-2 text-xl">프리미엄 리포트 잠금</h3>
                                        <p className="text-foreground/70 mb-6">5대 성격 요인과 30개 세부 국면을 확인하세요.</p>
                                        <Button className="bg-obsidian text-white rounded-full px-8">지금 확인하기</Button>
                                    </div>
                                    <div className="opacity-10 blur-sm pointer-events-none select-none h-40 bg-slate-200 rounded-3xl" />
                                </Card>
                            )}
                        </div>
                    </section>

                    {/* Section 2: 30 Facets Table */}
                    {hasAccess && (
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="bg-obsidian w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"><span className="text-white font-bold text-xl">2</span></div>
                                <div><h3 className="text-2xl font-black text-obsidian">세부 분석 국면</h3><p className="text-foreground/70 text-sm">나를 설명하는 디테일한 키워드들입니다.</p></div>
                            </div>

                            {big5DomainData.some(d => d.facets.length > 0) ? (
                                <div className="bg-white rounded-[32px] shadow-xl border border-line overflow-hidden divide-y divide-slate-100">
                                    {big5DomainData.filter(d => d.facets.length > 0).map((domain) => (
                                        <div key={domain.subject} className="p-8">
                                            <h4 className="text-sm font-bold text-foreground/70 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: domain.color } as React.CSSProperties} />
                                                {domain.subject} Facets
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
                                                {domain.facets.map((facet: any) => {
                                                    const isExtreme = facet.score > 60 || facet.score < 40;
                                                    return (
                                                        <div key={facet.id} className="group">
                                                            <div className="flex justify-between items-end mb-2">
                                                                <span className="font-bold text-obsidian text-sm group-hover:text-obsidian transition-colors">{facet.name}</span>
                                                                <span className="text-xs font-bold" style={{ color: isExtreme ? domain.color : '#94a3b8' } as React.CSSProperties}>{facet.score}</span>
                                                            </div>
                                                            <Progress value={facet.score} className="h-1.5" indicatorColor={domain.color} />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Card className="border-dashed border-2 border-line bg-surface/50 p-12 text-center rounded-[32px]">
                                    <p className="text-foreground/70 font-medium">세부 국면 분석 데이터는 정밀 진단 시 제공됩니다.</p>
                                </Card>
                            )}
                        </section>
                    )}

                    {/* Section 3: AI Solution */}
                    {hasAccess && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="bg-obsidian w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"><span className="text-white font-bold text-xl">3</span></div>
                                <div><h3 className="text-2xl font-black text-obsidian">유니클 맞춤 솔루션</h3><p className="text-foreground/70 text-sm">진단 결과를 바탕으로 설계된 처방전입니다.</p></div>
                            </div>
                            <GoldenTimeOffer
                                script={result?.aiSolution?.audioScript || "YOUNIQLE_LOADING"}
                                userName={result?.metadata?.userInfo?.name || session?.user?.name || '회원'}
                                gender={(session?.user as any)?.gender}
                                mood={result ? determineMood(result.totalScore, (result.metadata?.tScores?.domains || result.categoryScores || {}) as any) : 'PROFESSIONAL'}
                            />
                            <AISolutionSection diagnosisResult={result} />
                        </div>
                    )}
                </main>

                <MockPaymentModal open={paymentOpen} onOpenChange={setPaymentOpen} price={3900} productName="심층 심리 분석 리포트 + 유니클 솔루션" onSuccess={handlePaymentSuccess} />
                <DeepDiagnosisModal open={deepDiagnosisModalOpen} onOpenChange={setDeepDiagnosisModalOpen} />
                <MembershipUpsellDialog open={showUpsell} onOpenChange={setShowUpsell} title="심층 분석 리포트 접근 권한" description="5대 성격 요인과 30개 세부 지표, 그리고 유니클 맞춤 솔루션을 확인하시려면 멤버십을 확인하세요." />
            </div>
        </ChapterWrapper>
    );
}

function getInterpretation(subject: string, score: number): string {
    if (subject.includes('신경증') || subject.includes('멘탈')) return score > 60 ? '정서적 반응성이 높고 스트레스에 민감할 수 있습니다.' : score < 40 ? '정서적으로 매우 안정되어 있습니다.' : '적당한 수준의 정서적 민감성을 가지고 있습니다.';
    if (subject.includes('외향성') || subject.includes('신체')) return score > 60 ? '에너지가 넘치고 활동적입니다.' : score < 40 ? '차분하고 정적인 환경을 선호합니다.' : '상황에 따라 유연한 활동성을 보입니다.';
    if (subject.includes('성실성') || subject.includes('생활')) return score > 60 ? '목표 지향적이고 체계적입니다.' : score < 40 ? '자유롭고 즉흥적인 면이 있습니다.' : '필요한 수준의 책임감을 가지고 있습니다.';
    if (subject.includes('수면')) return score > 60 ? '수면의 질과 패턴이 안정적입니다.' : score < 40 ? '수면 환경이나 패턴의 개선이 필요할 수 있습니다.' : '무난한 수면 상태를 유지하고 있습니다.';
    return '당신의 고유한 성향을 바탕으로 잠재력을 극대화할 수 있습니다.';
}

function getFacetName(key: string): string {
    const map: Record<string, string> = {
        'N1': '불안', 'N2': '분노', 'N3': '우울', 'N4': '자의식', 'N5': '충동성', 'N6': '취약성',
        'E1': '친밀감', 'E2': '사교성', 'E3': '주장성', 'E4': '활동성', 'E5': '흥미추구', 'E6': '명랑함',
        'O1': '상상력', 'O2': '예술', 'O3': '감수성', 'O4': '모험심', 'O5': '지성', 'O6': '진보성',
        'A1': '신뢰', 'A2': '도덕성', 'A3': '이타성', 'A4': '협조성', 'A5': '겸손', 'A6': '공감',
        'C1': '유능감', 'C2': '질서', 'C3': '의무감', 'C4': '성취노력', 'C5': '자기절제', 'C6': '신중함'
    };
    return map[key] || key;
}
