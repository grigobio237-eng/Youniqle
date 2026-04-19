'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    ChevronLeft, BarChart3, Users, Target, CheckCircle2, 
    ArrowRight, Info, Plus, Save, Activity, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface StatItem {
  label: string;
  count: number;
}

interface AnalyticsStats {
  totalLeads: number;
  stressPoints: StatItem[];
  priorities: StatItem[];
  interestAreas: StatItem[];
  budgets: StatItem[];
  disappointments: StatItem[];
  startMethods: StatItem[];
}

export default function ShopAnalyticsPage() {
  const { shopId } = useParams();
  const router = useRouter();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  // 상품 제안 상태 (Lite, Signature, Black)
  const [proposal, setProposal] = useState({
    lite: { title: '', price: '', desc: '' },
    signature: { title: '', price: '', desc: '' },
    black: { title: '', price: '', desc: '' },
  });

  useEffect(() => {
    fetchAnalytics();
  }, [shopId]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/navigator/shops/${shopId}/analytics`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      toast.error('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProposal = () => {
    toast.success('맞춤 상품 설계가 저장되었습니다. 고객 대상 제안이 가능합니다.');
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-mist">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Navigation & Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate/50 hover:text-obsidian transition-colors font-bold text-sm"
                >
                    <ChevronLeft className="w-4 h-4" /> 뒤로 가기
                </button>
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-black text-obsidian tracking-tighter italic font-serif">Deep Analytics</h1>
                        <Badge className="bg-chapter-accent/10 text-chapter-accent border-none font-black text-[10px] tracking-widest uppercase">Lead Analysis</Badge>
                    </div>
                    <p className="text-slate/60 text-lg font-medium">수집된 사용자 응답을 바탕으로 정밀한 제안 상품을 설계하세요.</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <Button variant="outline" className="rounded-2xl h-14 px-8 border-line font-black">데이터 내보내기</Button>
                <Button 
                    onClick={handleSaveProposal}
                    className="bg-obsidian text-white rounded-2xl h-14 px-8 font-black shadow-xl"
                >
                    <Save className="w-5 h-5 mr-2" /> 설계 저장 및 확정
                </Button>
            </div>
        </div>

        {!stats ? (
            <Card className="rounded-[48px] p-20 text-center border-dashed border-2 border-line bg-transparent">
                <div className="w-20 h-20 bg-mist rounded-full flex items-center justify-center mx-auto mb-6 text-slate/30">
                    <Activity className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-obsidian mb-2">수집된 리드가 아직 없습니다.</h2>
                <p className="text-slate/40 max-w-sm mx-auto font-medium">설문 링크를 배포하여 고객의 니즈를 먼저 파악해 보세요.</p>
            </Card>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Sidebar: Detailed Stats List */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Key Insight Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Stress Points */}
                        <Card className="rounded-[32px] border-line p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-slate uppercase tracking-widest text-xs">Top Stress Points</h3>
                                <Target className="w-4 h-4 text-rose-400" />
                            </div>
                            <div className="space-y-4">
                                {stats.stressPoints.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span className="text-obsidian">{item.label}</span>
                                            <span className="text-slate/40 tracking-widest">{Math.round((item.count / stats.totalLeads) * 100)}%</span>
                                        </div>
                                        <div className="h-1.5 bg-mist rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(item.count / stats.totalLeads) * 100}%` }}
                                                transition={{ duration: 1, delay: 0.1 * idx }}
                                                className="h-full bg-rose-400" 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Budgets */}
                        <Card className="rounded-[32px] border-line p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-slate uppercase tracking-widest text-xs">Preferred Budget</h3>
                                <Activity className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="space-y-4">
                                {stats.budgets.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span className="text-obsidian">{item.label}</span>
                                            <span className="text-slate/40 tracking-widest">{Math.round((item.count / stats.totalLeads) * 100)}%</span>
                                        </div>
                                        <div className="h-1.5 bg-mist rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(item.count / stats.totalLeads) * 100}%` }}
                                                transition={{ duration: 1, delay: 0.1 * idx }}
                                                className="h-full bg-blue-400" 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Detailed Analysis Section */}
                    <Card className="rounded-[40px] border-line p-10 space-y-10">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="w-6 h-6 text-chapter-accent" />
                            <h3 className="text-2xl font-black text-obsidian tracking-tighter">전체 설문 데이터 심층 분석</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Priorities */}
                            <div className="space-y-6">
                                <h4 className="text-sm font-black text-slate/40 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> 가징 바꾸고 싶은 것
                                </h4>
                                <div className="space-y-3">
                                    {stats.priorities.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-mist/30 text-sm font-bold text-obsidian">
                                            <span>{item.label}</span>
                                            <Badge variant="outline" className="text-[10px] font-black">{item.count}명</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Disappointments */}
                            <div className="space-y-6">
                                <h4 className="text-sm font-black text-slate/40 uppercase tracking-widest flex items-center gap-2">
                                    <Info className="w-4 h-4" /> 기존 관리의 아쉬운 점
                                </h4>
                                <div className="space-y-3">
                                    {stats.disappointments.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-mist/30 text-sm font-bold text-obsidian">
                                            <span>{item.label}</span>
                                            <Badge variant="outline" className="text-[10px] font-black">{item.count}명</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Sidebar: Product Proposal Tiering */}
                <div className="space-y-8">
                    <Card className="rounded-[40px] border-none bg-obsidian text-mist p-10 space-y-8 shadow-2xl relative overflow-hidden">
                        <div className="relative z-10 space-y-8">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black italic font-serif tracking-tight">Proposal Builder</h3>
                                <p className="text-mist/40 text-sm font-medium">분석 결과를 토대로 업소 전용 3단계 상품을 설계하세요.</p>
                            </div>

                            <div className="space-y-6">
                                {/* Lite Tier */}
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-slate-500/20 text-slate-300 border-none font-bold text-[9px] uppercase tracking-widest">Lite Tier</Badge>
                                        <Plus className="w-4 h-4 text-mist/20" />
                                    </div>
                                    <div className="space-y-3">
                                        <input 
                                            placeholder="상품명을 입력하세요"
                                            className="w-full bg-transparent border-b border-white/10 py-1 outline-none font-black text-lg placeholder:text-mist/20"
                                        />
                                        <input 
                                            placeholder="가격 (예: 10만원 미만)"
                                            className="w-full bg-transparent border-b border-white/10 py-1 outline-none text-sm font-bold placeholder:text-mist/20"
                                        />
                                    </div>
                                </div>

                                {/* Signature Tier */}
                                <div className="p-6 rounded-3xl bg-chapter-accent/20 border border-chapter-accent/30 space-y-4 shadow-lg ring-1 ring-chapter-accent/50">
                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-chapter-accent text-white border-none font-bold text-[9px] uppercase tracking-widest">Signature (Best)</Badge>
                                        <Heart className="w-4 h-4 text-chapter-accent" />
                                    </div>
                                    <div className="space-y-3">
                                        <input 
                                            placeholder="메인 추천 상품명"
                                            className="w-full bg-transparent border-b border-white/20 py-1 outline-none font-black text-lg text-white placeholder:text-mist/20"
                                        />
                                        <input 
                                            placeholder="가격 (예: 30~70만원)"
                                            className="w-full bg-transparent border-b border-white/20 py-1 outline-none text-sm font-bold text-white/70 placeholder:text-mist/20"
                                        />
                                    </div>
                                </div>

                                {/* Black Tier */}
                                <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-amber-500/20 text-amber-500 border-none font-bold text-[9px] uppercase tracking-widest">Black Tier</Badge>
                                        <Zap className="w-4 h-4 text-amber-500/50" />
                                    </div>
                                    <div className="space-y-3">
                                        <input 
                                            placeholder="최상급 프리미엄 상품명"
                                            className="w-full bg-transparent border-b border-white/10 py-1 outline-none font-black text-lg placeholder:text-mist/20"
                                        />
                                        <input 
                                            placeholder="가격 (예: 150만원 이상)"
                                            className="w-full bg-transparent border-b border-white/10 py-1 outline-none text-sm font-bold placeholder:text-mist/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button 
                                onClick={handleSaveProposal}
                                className="w-full h-16 bg-chapter-accent hover:bg-chapter-accent/90 text-white rounded-2xl font-black text-lg shadow-xl shadow-chapter-accent/20"
                            >
                                구성 완료 및 전송 준비
                            </Button>
                        </div>
                        
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-chapter-accent/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                    </Card>

                    <Card className="rounded-[32px] border-none bg-mist/50 p-6 space-y-3">
                        <div className="flex items-center gap-2 text-slate/40">
                            <Info className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Usage Tips</span>
                        </div>
                        <p className="text-[11px] text-slate/50 leading-relaxed font-medium">
                            가장 많은 응답이 나온 **관심 분야**를 바탕으로 Signature 상품을 구성하는 것이 계약 전환율이 가장 높습니다.
                            Black 상품은 기준점을 잡아주는 역할을 하므로 비교적 높은 가격대로 설정해 보세요.
                        </p>
                    </Card>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
