'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Download, Share2, ChevronLeft, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
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

// Type definition for Diagnosis Result
interface DeepDiagnosisResult {
    totalScore: number;
    title: string;
    description: string;
    categoryScores: {
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
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<DeepDiagnosisResult | null>(null);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [deepDiagnosisModalOpen, setDeepDiagnosisModalOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const reportRef = useRef<HTMLDivElement>(null);

    const handleUnlockClick = () => {
        setPaymentOpen(true);
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
                scale: 2, // Higher resolution
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff' // Ensure white background
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 Width
            const pageHeight = 297; // A4 Height
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
                variant: 'success',
                duration: 3000
            });
        } catch (error) {
            console.error('PDF Generation Error:', error);
            addToast({
                title: "다운로드 실패",
                description: "리포트 생성 중 오류가 발생했습니다.",
                variant: 'error',
                duration: 3000
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
                    const latest = diagnosisHistory.length > 0 ? diagnosisHistory[diagnosisHistory.length - 1] : null;

                    if (latest) {
                        setResult(latest);

                        // If solution is missing, fetch it
                        if (!latest.aiSolution) {
                            try {
                                // Calculate standard scores for AI
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
                                        domains: (latest.metadata?.tScores?.domains || latest.scores) as any
                                    });
                                }

                                const solutionRes = await fetch('/api/ai/diagnosis-solution', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        scores: standardScores,
                                        tScores: latest.metadata?.tScores || { domains: latest.scores, facets: {} },
                                        userInfo: { name: userData.name || '회원' }
                                        // diagnosisId: latest._id // If available
                                    })
                                });
                                if (solutionRes.ok) {
                                    const solutionData = await solutionRes.json();
                                    setResult(prev => prev ? { ...prev, aiSolution: solutionData } : null);
                                }
                            } catch (err) {
                                console.error('Failed to fetch AI solution on mount:', err);
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
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <RefreshCw className="w-10 h-10 text-chapter-accent animate-spin mb-4" />
                <p className="text-slate-500 font-medium">분석 리포트를 불러오는 중입니다...</p>
            </div>
        );
    }

    if (!result && !loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">분석 리포트가 없습니다</h2>
                <p className="text-slate-500 mb-8 max-w-sm">
                    아직 심층 진단을 완료하지 않으셨네요.<br />
                    진단을 먼저 진행해주세요.
                </p>
                <Button onClick={() => router.push('/ai-navigator')} className="bg-chapter-accent text-white rounded-xl px-8 py-4 font-bold">
                    진단 하러 가기
                </Button>
            </div>
        );
    }

    // Data Preparation
    let tScores = { N: 50, E: 50, O: 50, A: 50, C: 50 };
    let isPaid = false;
    let chartData: { subject: string; score: number; fullMark: number; color: string; }[] = [];
    let big5DomainData: { subject: string; abbreviation: string; score: number; color: string; facets: { name: string; score: number }[] }[] = [];

    const domainColors: Record<string, string> = {
        'N': '#f43f5e', // Rose
        'E': '#f59e0b', // Amber
        'O': '#10b981', // Emerald
        'A': '#3b82f6', // Blue
        'C': '#8b5cf6', // Violet
    };

    const domainNames: Record<string, string> = {
        'N': '신경증 (Neuroticism)',
        'E': '외향성 (Extraversion)',
        'O': '개방성 (Openness)',
        'A': '우호성 (Agreeableness)',
        'C': '성실성 (Conscientiousness)',
    };

    if (result && (result.type?.toUpperCase() === 'PAID' || result.type?.toUpperCase() === 'DEEP')) {
        isPaid = true;
        const domains = (result.metadata?.tScores?.domains as any) || tScores;
        const facets = (result.metadata?.tScores?.facets as any) || {};

        // Prepare chartData for PMSS radar chart
        const std = SimcheungDiagnosisEngine.mapPaidToStandard({ domains });
        chartData = [
            { subject: '신체', score: std.physical, fullMark: 100, color: '#f43f5e' },
            { subject: '멘탈', score: std.mental, fullMark: 100, color: '#f59e0b' },
            { subject: '수면', score: std.sleep, fullMark: 100, color: '#3b82f6' },
            { subject: '생활', score: std.lifestyle, fullMark: 100, color: '#10b981' },
        ];

        // Prepare big5DomainData for detailed Big 5 analysis
        big5DomainData = Object.keys(domains).map(key => {
            const domainFacets = Object.keys(facets)
                .filter(facetKey => facetKey.startsWith(key))
                .map(facetKey => ({
                    name: facetKey.substring(1), // Remove the domain prefix (e.g., N1 -> 1)
                    score: facets[facetKey]
                }));

            return {
                subject: domainNames[key] || key,
                abbreviation: key,
                score: domains[key],
                color: domainColors[key] || '#cccccc',
                facets: domainFacets
            };
        });

    } else if (result && result.type?.toUpperCase() === 'FREE') {
        isPaid = false;
        // The DB result.categoryScores is already PMSS standardized (from save route update)
        // ideally, but to be safe we use the mapFreeToStandard if the type is FreeDiagnosisResult-like
        // Actually, if we pull from DB, it already has the 'categoryScores' field populated with PMSS.
        // Let's use that directly for consistency.
        const scores = result.categoryScores || { physical: 50, mental: 50, lifestyle: 50, sleep: 50 };
        chartData = [
            { subject: '신체', score: scores.physical, fullMark: 100, color: '#f43f5e' },
            { subject: '멘탈', score: scores.mental, fullMark: 100, color: '#f59e0b' },
            { subject: '수면', score: scores.sleep, fullMark: 100, color: '#3b82f6' },
            { subject: '생활', score: scores.lifestyle, fullMark: 100, color: '#10b981' },
        ];
    }

    // Facet Data Setup
    const dummyFacets = isPaid ? [] : [
        { domain: '신경증 (N)', color: '#f43f5e', facets: ['불안', '분노', '우울', '자의식', '충동성', '취약성'] },
        { domain: '외향성 (E)', color: '#f59e0b', facets: ['친밀감', '사교성', '주장성', '활동성', '흥미추구', '명랑함'] },
        { domain: '개방성 (O)', color: '#10b981', facets: ['상상력', '예술', '감수성', '모험심', '지성', '진보성'] },
        { domain: '우호성 (A)', color: '#3b82f6', facets: ['신뢰', '도덕성', '이타성', '협조성', '겸손', '공감'] },
        { domain: '성실성 (C)', color: '#8b5cf6', facets: ['유능감', '질서', '의무감', '성취노력', '자기절제', '신중함'] },
    ];

    return (
        <ChapterWrapper chapter="diagnosis-report">
            <div className="min-h-screen bg-surface relative overflow-hidden">
                {/* Background Atmosphere - Morning Light */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-b from-sky-100/40 to-transparent rounded-full blur-[120px]" />
                    <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-r from-teal-50/50 to-emerald-50/30 rounded-full blur-[100px]" />
                </div>

                {/* Header */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-surface-highlight">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-slate-100 rounded-full">
                                <ChevronLeft className="w-5 h-5 text-obsidian" />
                            </Button>
                            <h1 className="text-sm font-bold text-obsidian uppercase tracking-wider">Analysis Report</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadPDF}
                                disabled={isGeneratingPdf}
                                className="gap-2 rounded-full border-slate-200 hover:border-chapter-accent hover:text-chapter-accent transition-colors"
                            >
                                {isGeneratingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                <span className="hidden sm:inline">PDF 저장</span>
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-4 py-8 max-w-4xl relative z-10 space-y-16" ref={reportRef}>

                    {/* 1. Hero Summary Section */}
                    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="outline" className={`
                                        ${isPaid ? 'border-reward-gold text-reward-gold bg-reward-gold/5' : 'border-slate-300 text-slate-500 bg-slate-50'}
                                        uppercase tracking-widest text-[10px] font-black px-3 py-1 rounded-full
                                    `}>
                                        {isPaid ? 'Premium Analysis' : 'Basic Analysis'}
                                    </Badge>
                                    <span className="text-xs font-medium text-slate-400">
                                        {new Date(result?.createdAt || Date.now()).toLocaleDateString()}
                                    </span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-obsidian tracking-tighter break-keep">
                                    {result?.title}
                                </h2>
                                <p className="mt-4 text-slate-600 text-lg leading-relaxed max-w-lg">
                                    현재 당신의 회복 탄력성(Resilience) 상태를 분석했습니다.
                                    <br />
                                    당신은 <span className="font-bold text-obsidian underline decoration-chapter-accent/50 underline-offset-4">성장하는 과정</span>에 있습니다.
                                </p>
                            </div>

                            {/* Total Score Badge */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-chapter-accent/20 rounded-full blur-2xl group-hover:bg-chapter-accent/30 transition-all duration-500" />
                                <div className="relative bg-white/90 backdrop-blur border border-white p-6 rounded-[32px] shadow-2xl flex flex-col items-center min-w-[160px]">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Score</span>
                                    <span className="text-5xl font-black text-obsidian tracking-tighter">
                                        {result?.totalScore || 0}
                                    </span>
                                    <div className="flex gap-1 mt-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Sparkles key={star} className={`w-3 h-3 ${star <= Math.round(((result?.totalScore || 0) / 20)) ? 'text-reward-gold fill-reward-gold' : 'text-slate-200'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Diamond Graph */}
                        <Card className="bg-white/60 backdrop-blur-xl border-white/50 shadow-xl rounded-[40px] overflow-hidden">
                            <CardContent className="p-0 relative">
                                {!isPaid && (
                                    <div className="absolute top-6 right-6 z-20">
                                        <Badge className="bg-slate-900 text-white hover:bg-slate-800">Free Version</Badge>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] min-h-[400px]">
                                    {/* Graph Area */}
                                    <div className="p-8 md:p-12 relative flex items-center justify-center bg-gradient-to-b from-white to-slate-50/50">
                                        <div className="w-full h-[320px]">
                                            <DiagnosisRadarChart
                                                data={chartData}
                                                color="#0F172A" // Obsidian
                                            />
                                        </div>
                                    </div>
                                    {/* Insight Text Area */}
                                    <div className="p-8 md:p-12 bg-white/40 flex flex-col justify-center space-y-6 border-l border-white/50">
                                        <div>
                                            <h3 className="text-lg font-bold text-obsidian mb-2">Analysis Insight</h3>
                                            <p className="text-slate-600 text-sm leading-relaxed">
                                                4가지 핵심 회복 영역의 균형을 시각화했습니다.
                                                그래프의 면적이 넓고 정다각형에 가까울수록 회복탄력성이 이상적인 상태입니다.
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            {chartData.map((d) => (
                                                <div key={d.subject} className="flex items-center justify-between group">
                                                    <span className="text-sm font-medium text-slate-500 group-hover:text-obsidian transition-colors">{d.subject}</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-chapter-accent/80 rounded-full"
                                                                style={{ width: `${d.score}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-bold text-obsidian w-8 text-right">{d.score}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>


                    {/* 2. Detailed Breakdown (Big 5) */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="bg-obsidian w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                                <span className="text-white font-bold text-xl">1</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-obsidian">심층 성격 요인 분석</h3>
                                <p className="text-slate-500 text-sm">Big 5 모델에 기반한 당신의 고유한 기질입니다.</p>
                            </div>
                        </div>

                        {/* Detail Cards Grid */}
                        <div className="grid grid-cols-1 gap-6">
                            {isPaid ? chartData.map((domain, idx) => (
                                <Card key={domain.subject} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                                    <div className={`h-2 w-full bg-gradient-to-r from-transparent via-${domain.color === '#f43f5e' ? 'rose-500' : 'indigo-500'} to-transparent opacity-50`} style={{ backgroundColor: domain.color }} />
                                    <CardContent className="p-8 bg-white/80 backdrop-blur-sm">
                                        <div className="flex flex-col md:flex-row gap-8 items-center">
                                            {/* Score Ring */}
                                            <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48" />
                                                    <circle
                                                        className="text-current transition-all duration-1000 ease-out"
                                                        strokeWidth="8"
                                                        strokeLinecap="round"
                                                        stroke={domain.color}
                                                        fill="transparent"
                                                        r="40"
                                                        cx="48"
                                                        cy="48"
                                                        strokeDasharray={`${2 * Math.PI * 40}`}
                                                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - domain.score / 100)}`}
                                                    />
                                                </svg>
                                                <span className="absolute text-2xl font-black text-obsidian">{domain.score}</span>
                                            </div>

                                            <div className="flex-1 text-center md:text-left">
                                                <h4 className="text-xl font-bold text-obsidian mb-2">{domain.subject}</h4>
                                                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                                    {getInterpretation(domain.subject, domain.score)}
                                                </p>

                                                {/* Mini Facets (Top 3) */}
                                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                                    {/* Mapping logic for simplified facets display would go here */}
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">상세 분석 포함</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )) : (
                                <Card className="border-none shadow-inner bg-slate-50/50 p-12 text-center relative overflow-hidden group cursor-pointer" onClick={handleUnlockClick}>
                                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                            <Lock className="w-6 h-6 text-chapter-accent" />
                                        </div>
                                        <h3 className="text-xl font-bold text-obsidian mb-2">프리미엄 리포트 잠금</h3>
                                        <p className="text-slate-500 mb-6">5대 성격 요인과 30개 세부 국면을 확인하세요.</p>
                                        <Button className="bg-obsidian text-white rounded-full px-8 hover:bg-slate-800 transition-colors shadow-lg">
                                            지금 확인하기
                                        </Button>
                                    </div>
                                    {/* Fake Content Behind */}
                                    <div className="opacity-20 blur-sm pointer-events-none select-none" aria-hidden="true">
                                        <div className="h-40 bg-slate-200 rounded-3xl mb-4 w-full" />
                                        <div className="h-40 bg-slate-200 rounded-3xl mb-4 w-full" />
                                    </div>
                                </Card>
                            )}
                        </div>
                    </section>

                    {/* 3. Detailed Facets Table (Only Paid) */}
                    {isPaid && (
                        <section className="space-y-8 pb-12">
                            <div className="flex items-center gap-4">
                                <div className="bg-obsidian w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform rotate-2">
                                    <span className="text-white font-bold text-xl">2</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-obsidian">30개 세부 국면</h3>
                                    <p className="text-slate-500 text-sm">나를 설명하는 디테일한 키워드들입니다.</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                                {chartData.map((domain) => {
                                    const domainChar = domain.subject.includes('신체') || domain.subject.includes('외향성') ? 'E' :
                                        domain.subject.includes('멘탈') || domain.subject.includes('신경증') ? 'N' :
                                            domain.subject.includes('생활') || domain.subject.includes('성실성') ? 'C' :
                                                domain.subject.includes('수면') ? 'N' : 'O'; // Simplified mapping

                                    const facets = result?.metadata?.tScores?.facets || {};
                                    const domainFacets = Object.entries(facets)
                                        .filter(([key]) => key.startsWith(domainChar))
                                        .sort();

                                    return (
                                        <div key={domain.subject} className="p-6 md:p-8">
                                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: domain.color }} />
                                                {domain.subject} Facets
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
                                                {domainFacets.map(([facetKey, score]) => (
                                                    <div key={facetKey} className="group">
                                                        <div className="flex justify-between items-end mb-2">
                                                            <span className="font-bold text-slate-700 text-sm group-hover:text-obsidian transition-colors">
                                                                {getFacetName(facetKey)}
                                                            </span>
                                                            <span className="text-xs font-bold" style={{ color: score > 60 || score < 40 ? domain.color : '#94a3b8' }}>
                                                                {score}
                                                            </span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full transition-all duration-700 group-hover:opacity-100 opacity-70"
                                                                style={{
                                                                    width: `${Math.min(100, (score / 100) * 100)}%`,
                                                                    backgroundColor: domain.color
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* 4. AI Solution Section (New) */}
                    {isPaid && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                            <div className="flex items-center gap-4">
                                <div className="bg-obsidian w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-1">
                                    <span className="text-white font-bold text-xl">3</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-obsidian">AI 맞춤 솔루션</h3>
                                    <p className="text-slate-500 text-sm">진단 결과를 바탕으로 설계된 처방전입니다.</p>
                                </div>
                            </div>

                            <GoldenTimeOffer
                                script={result?.aiSolution?.audioScript || "AI_LOADING"}
                                userName={result?.metadata?.userInfo?.name || '회원'}
                            />
                            <AISolutionSection diagnosisResult={result} />
                        </div>
                    )}

                </main>

                <MockPaymentModal
                    open={paymentOpen}
                    onOpenChange={setPaymentOpen}
                    price={3900}
                    productName="심층 심리 분석 리포트 + AI 솔루션"
                    onSuccess={handlePaymentSuccess}
                />

                <DeepDiagnosisModal
                    open={deepDiagnosisModalOpen}
                    onOpenChange={setDeepDiagnosisModalOpen}
                />
            </div>
        </ChapterWrapper>
    );
}

// Simple logic to generate dynamic interpretation text (Example)
function getInterpretation(subject: string, score: number): string {
    const level = score > 60 ? '높음' : score < 40 ? '낮음' : '보통';

    if (subject.includes('신경증') || subject.includes('멘탈')) {
        return score > 60
            ? '정서적 반응성이 높고 스트레스에 민감한 편입니다. 작은 일에도 걱정이 많을 수 있지만, 그만큼 위험을 감지하는 능력이 뛰어납니다.'
            : score < 40
                ? '정서적으로 매우 안정되어 있으며 스트레스 상황에서도 침착함을 유지합니다. 다만 때로 무심해 보일 수도 있습니다.'
                : '적당한 수준의 정서적 민감성을 가지고 있습니다. 일상적인 스트레스를 무난하게 관리할 수 있습니다.';
    }
    if (subject.includes('외향성') || subject.includes('신체')) {
        return score > 60
            ? '에너지가 넘치고 사교적이며 활동적입니다. 사람들과 어울리는 것에서 활력을 얻는 편입니다.'
            : score < 40
                ? '차분하고 조용한 환경을 선호합니다. 혼자만의 시간을 통해 에너지를 충전하는 내향적인 성향입니다.'
                : '상황에 따라 외향적이거나 내향적인 모습을 유연하게 보일 수 있는 양향적 성향을 가지고 있습니다.';
    }
    // ... Add more mappings or generic fallback
    return '당신의 고유한 성향을 바탕으로 잠재력을 극대화할 수 있습니다.';
}

// Helper to get friendly name for facet
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
