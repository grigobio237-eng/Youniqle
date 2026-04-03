'use client';

import React from 'react';
import FoodScanner from '@/components/utils/FoodScanner';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Sparkles } from 'lucide-react';

export default function FoodScannerPage() {
    return (
        <ChapterWrapper chapter="utils">
            <div className="min-h-screen bg-mist py-20 px-6">
                <div className="max-w-[1440px] mx-auto space-y-16">
                    {/* Header Section */}
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <Badge className="bg-obsidian text-white border-none px-6 py-2 rounded-full text-xs font-black tracking-[0.2em] uppercase">
                                Youniqle AI Vision v2.1
                            </Badge>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-obsidian tracking-tighter leading-none italic uppercase">
                            Recovery<br />Food Scanner
                        </h1>
                        <p className="text-xl md:text-2xl text-slate font-medium max-w-2xl mx-auto leading-relaxed">
                            당신이 먹는 음식이 곧 당신의 회복 데이터가 됩니다.<br />
                            AI로 스캔하고 개인 맞춤형 회복 가이드를 확인하세요.
                        </p>
                        
                        <div className="flex items-center justify-center gap-4 text-sm font-black uppercase tracking-widest text-slate/40">
                            <ChefHat className="w-5 h-5" />
                            <span>Identify Food</span>
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
                            카메라로 음식을 비추면 AI가 영양 성분을 분석하고, <br />
                            최근 당신의 회복 점수와 대조하여 최적의 섭취 가이드를 제공합니다. <br />
                            모든 분석 데이터는 저장되지 않으며 이 세션에서만 확인 가능합니다.
                        </p>
                    </div>
                </div>
            </div>
        </ChapterWrapper>
    );
}
