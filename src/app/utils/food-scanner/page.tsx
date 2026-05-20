'use client';

import React, { Suspense } from 'react';
import FoodScanner from '@/components/utils/FoodScanner';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import { Badge } from '@/components/ui/badge';
import { Camera, Sparkles, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function FoodScannerContent() {
    const searchParams = useSearchParams();
    const autoStart = searchParams.get('auto') === 'true';
    return <FoodScanner autoStart={autoStart} />;
}

export default function FoodScannerPage() {
    return (
        <ChapterWrapper chapter="utils">
            <div className="min-h-screen bg-mist py-20 px-6">
                <div className="max-w-[1440px] mx-auto space-y-16">
                    {/* Header Section */}
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <Badge className="bg-obsidian text-white border-none px-6 py-2 rounded-full text-xs font-black tracking-[0.2em] uppercase">
                                Youniqle Vision v2.1
                            </Badge>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-obsidian tracking-tighter leading-none italic uppercase">
                            Youniqle<br />Food Scanner
                        </h1>
                        <p className="text-xl md:text-2xl text-slate font-medium max-w-2xl mx-auto leading-relaxed">
                            선수들이 하루 동안 먹는 음식을 카메라로 찍고 분석하는<br />
                            유니클의 실시간 비전 영양 분석 카메라입니다.
                        </p>
                        
                        <div className="flex items-center justify-center gap-4 text-sm font-black uppercase tracking-widest text-slate/40">
                            <Camera className="w-5 h-5" />
                            <span>Capture Food</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-line-heavy" />
                            <Sparkles className="w-5 h-5" />
                            <span>Analyze Nutrition</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-line-heavy" />
                            <Badge variant="outline" className="text-[10px] border-line font-black">Clubhouse Sync</Badge>
                        </div>
                    </div>

                    {/* Main Scanner Component */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-chapter-accent/5 blur-[120px] rounded-full -z-10"></div>
                        <Suspense fallback={
                            <div className="flex flex-col items-center justify-center p-12 bg-white/40 backdrop-blur-xl rounded-[40px] border border-line min-h-[300px]">
                                <Loader2 className="w-8 h-8 animate-spin text-pink-500 mb-2" />
                                <p className="text-sm font-bold text-obsidian">푸드 스캐너를 불러오는 중...</p>
                            </div>
                        }>
                            <FoodScannerContent />
                        </Suspense>
                    </div>

                    {/* Footer Guide */}
                    <div className="max-w-xl mx-auto p-12 bg-white/50 backdrop-blur-xl rounded-[40px] border border-line text-center space-y-4">
                        <h4 className="text-lg font-black text-obsidian tracking-tight">유니클 푸드 스캐너 이용 안내</h4>
                        <p className="text-sm font-medium text-slate opacity-60 leading-relaxed">
                            매 끼니마다 음식을 카메라로 찍으면 제미나이 유니클 엔진이 영양성분을 정밀하게 분석합니다. <br />
                            분석된 칼로리 점수와 코멘트는 실시간으로 클럽하우스 DB에 기록되며, <br />
                            코치 및 보호자의 대시보드 화면에 즉시 동기화되어 소속 팀과 연동됩니다.
                        </p>
                    </div>
                </div>
            </div>
        </ChapterWrapper>
    );
}
