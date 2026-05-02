'use client';

import React from 'react';
import FoodScanner from '@/components/utils/FoodScanner';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import { Badge } from '@/components/ui/badge';
import { Camera, Sparkles } from 'lucide-react';

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
                            Life Snap<br />Scanner
                        </h1>
                        <p className="text-xl md:text-2xl text-slate font-medium max-w-2xl mx-auto leading-relaxed">
                            당신이 머무는 공간, 보는 것과 듣는 것,<br />
                            그리고 먹는 모든 것이 회복의 조각입니다.
                        </p>
                        
                        <div className="flex items-center justify-center gap-4 text-sm font-black uppercase tracking-widest text-slate/40">
                            <Camera className="w-5 h-5" />
                            <span>Capture Life</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-line-heavy" />
                            <Sparkles className="w-5 h-5" />
                            <span>Analyze Recovery</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-line-heavy" />
                            <Badge variant="outline" className="text-[10px] border-line font-black">NO STORAGE</Badge>
                        </div>
                    </div>

                    {/* Main Scanner Component */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-chapter-accent/5 blur-[120px] rounded-full -z-10"></div>
                        <FoodScanner />
                    </div>

                    {/* Footer Guide */}
                    <div className="max-w-xl mx-auto p-12 bg-white/50 backdrop-blur-xl rounded-[40px] border border-line text-center space-y-4">
                        <h4 className="text-lg font-black text-obsidian tracking-tight">How it works?</h4>
                        <p className="text-sm font-medium text-slate opacity-60 leading-relaxed">
                            카메라로 당신의 일상을 비추면 유니클이 현재 상태를 분석하고, <br />
                            최근 당신의 회복 점수와 대조하여 최적의 라이프스타일 가이드를 제공합니다. <br />
                            모든 분석 데이터는 저장되지 않으며 이 세션에서만 확인 가능합니다.
                        </p>
                    </div>
                </div>
            </div>
        </ChapterWrapper>
    );
}
