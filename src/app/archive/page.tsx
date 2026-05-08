'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Archive, 
  Calendar, 
  ChevronRight, 
  ChevronLeft,
  History, 
  Sparkles, 
  Share2, 
  Download,
  Lock,
  ArrowRight,
  Shield
} from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function ArchivePage() {
  const { data: session } = useSession();

  // Mock past journeys for UI demonstration
  const pastJourneys = [
    {
      id: 'j1',
      date: '2024.04.21 - 04.27',
      identity: 'ECO-ZENITH',
      summary: '밤에 무너지는 수면 리듬',
      status: 'completed',
      color: 'primary',
      image: '/images/characters/char_sleep.png'
    },
    {
      id: 'j2',
      date: '2024.04.14 - 04.20',
      identity: 'RECOVERY-MID',
      summary: '식사 불균형과 감정 과부하',
      status: 'completed',
      color: 'emerald-500',
      image: '/images/characters/char_diagnosis.png'
    }
  ];

  const [assetStats, setAssetStats] = React.useState<any>(null);
  const [userStatus, setUserStatus] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/user/status');
        if (res.ok) {
          const data = await res.json();
          setAssetStats(data.assetStats);
          setUserStatus(data.user);
        }
      } catch (err) {
        console.error('Failed to fetch asset stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const isAdmin = ['admin', 'superadmin'].includes(userStatus?.role);
  const isPremium = isAdmin || (userStatus?.grade && ['RESTART', 'BLACK'].includes(userStatus.grade.toUpperCase()));

  return (
    <ChapterWrapper chapter="archive" className="container mx-auto px-4 py-20 pb-40 min-h-screen">
      {/* Header */}
      <div className="mb-24 text-center space-y-8 max-w-3xl mx-auto">
        <div className="inline-flex items-center px-4 py-1.5 bg-obsidian text-white rounded-full text-[10px] font-black tracking-widest uppercase border border-white/10 shadow-xl">
          <Archive className="w-4 h-4 mr-2 text-primary" />
          Rhythm Archive
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-obsidian tracking-tighter">보관함</h1>
        <p className="text-lg text-slate/60 leading-relaxed font-bold break-keep">
          완주한 7일의 여정들은 흩어지지 않고<br />
          당신의 회복 정체성을 증명하는 기록이 됩니다.
        </p>
      </div>

      {!isPremium ? (
        /* Upsell View for non-premium users */
        <section className="max-w-4xl mx-auto">
          <div className="bg-obsidian p-12 md:p-20 rounded-[60px] text-center space-y-10 relative overflow-hidden shadow-2xl border border-white/5">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[120px] rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 blur-[100px] rounded-full -ml-24 -mb-24" />
            
            <div className="relative z-10 space-y-8 flex flex-col items-center">
              <div className="w-24 h-24 bg-white/10 rounded-[40px] flex items-center justify-center border border-white/10 shadow-inner backdrop-blur-xl animate-bounce-slow">
                <Lock className="w-12 h-12 text-primary" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
                  과거의 기록이<br />잠겨있습니다
                </h2>
                <p className="text-white/40 text-lg font-bold leading-relaxed break-keep max-w-md mx-auto">
                  유니클 라이프 패스로 보관함을 활성화하고,<br />
                  매주 누적되는 당신만의 회복 OS를 완성하세요.
                </p>
              </div>

              <div className="pt-8 w-full max-w-sm">
                <Button asChild className="w-full h-18 bg-primary text-obsidian rounded-[28px] font-black text-xl hover:scale-[1.02] transition-all shadow-2xl shadow-primary/20">
                  <Link href="/membership">보관함 활성화하기</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Premium Archive View */
        <div className="space-y-20 max-w-5xl mx-auto">
          {/* Navigation & Header Actions */}
          <div className="flex items-center justify-between">
            <Button asChild variant="ghost" className="text-slate/60 hover:text-primary font-bold transition-colors">
              <Link href="/ai-navigator" className="flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" />
                리듬체크로 돌아가기
              </Link>
            </Button>
            <div className="flex items-center gap-3 bg-mist/30 px-5 py-2.5 rounded-2xl border border-line/50">
              <Shield className="w-4 h-4 text-primary" />
              <p className="text-xs font-black text-obsidian">보안된 데이터 자산 관리 중</p>
            </div>
          </div>

          {/* Detailed Asset Portfolio Section */}
          <section className="bg-white rounded-[60px] p-10 md:p-16 border border-obsidian/5 space-y-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 relative z-10">
              <div className="space-y-4">
                <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black tracking-widest uppercase">
                  Data Asset Inventory
                </div>
                <h3 className="text-4xl font-black text-obsidian tracking-tighter">나의 회복 자산 인벤토리</h3>
                <p className="text-slate/60 font-bold text-sm">다양한 경로로 수집된 당신만의 회복 데이터를 관리하세요.</p>
              </div>
              <div className="flex items-center gap-4 bg-mist/50 p-6 rounded-[32px] border border-line/50">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate/40 uppercase tracking-tighter">Total Insights</p>
                  <p className="text-3xl font-black text-primary">{assetStats?.totalInsights || 0} Pts</p>
                </div>
                <div className="w-px h-10 bg-line" />
                <div className="flex flex-col items-center">
                  <p className="text-[10px] font-black text-slate/40 uppercase mb-1">Status</p>
                  <Badge className="bg-obsidian text-white font-black px-3 py-1 rounded-lg">TRUSTED</Badge>
                </div>
              </div>
            </div>

            {/* Comprehensive Inventory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {[
                { 
                  label: '정밀 문진 데이터', 
                  count: assetStats?.precisionDiagnosis || 0, total: 10, 
                  icon: <Shield className="w-5 h-5" />, 
                  status: (assetStats?.precisionDiagnosis > 0) ? 'active' : 'unexplored', 
                  desc: '심층 기질 분석 데이터',
                  tooltip: '리듬체크 페이지의 정밀 문진을 통해 수집된 핵심 기질 데이터입니다.',
                  href: '/diagnosis?type=personality'
                },
                { 
                  label: '데일리 리듬 로그', 
                  count: assetStats?.dailyRhythmLog || 0, total: 30, 
                  icon: <Calendar className="w-5 h-5" />, 
                  status: (assetStats?.dailyRhythmLog > 0) ? 'active' : 'unexplored', 
                  desc: '1일 회복 체크 데이터',
                  tooltip: '대시보드와 랜딩 페이지에서 매일 기록한 짧은 문진 데이터의 누적분입니다.',
                  href: '/diagnosis?type=daily'
                },
                { 
                  label: '스캐너 분석 데이터', 
                  count: assetStats?.scannerAnalysis || 0, total: 20, 
                  icon: <History className="w-5 h-5" />, 
                  status: (assetStats?.scannerAnalysis > 0) ? 'active' : 'unexplored', 
                  desc: '신체 및 환경 스캐너 로그',
                  tooltip: '랜딩 페이지의 스캐너 기능을 통해 측정된 데이터 자산입니다.',
                  href: '/utils'
                },
                { 
                  label: '툴킷 활용 로그', 
                  count: assetStats?.toolkitUsage || 0, total: 20, 
                  icon: <Sparkles className="w-5 h-5" />, 
                  status: (assetStats?.toolkitUsage > 0) ? 'active' : 'unexplored', 
                  desc: '비디오/사운드 테라피 활용',
                  tooltip: 'Tool Kit에서 비디오 분석, 사운드 테라피 등을 실행하며 쌓인 경험 데이터입니다.',
                  href: '/utils'
                },
                { 
                  label: '전문가 상담 기록', 
                  count: assetStats?.consultations || 0, total: 5, 
                  icon: <Sparkles className="w-5 h-5" />, 
                  status: (assetStats?.consultations > 0) ? 'active' : 'unexplored', 
                  desc: '네비게이터 상담 데이터',
                  tooltip: '전문 네비게이터와의 상담을 통해 생성되는 고도화된 상담 자산입니다.',
                  href: '/event/consultation'
                },
                { 
                  label: '추천 리포트 자산', 
                  count: assetStats?.reports || 0, total: 10, 
                  icon: <Download className="w-5 h-5" />, 
                  status: (assetStats?.reports > 0) ? 'active' : 'unexplored', 
                  desc: '유니클 생성 리포트 및 제안서',
                  tooltip: '데이터 기반으로 유니클이 생성한 개인별 맞춤 회복 리포트 보관함입니다.',
                  href: '/ai-navigator'
                }
              ].map((item, i) => (
                <Link 
                  key={i} 
                  href={item.href}
                  className={`group p-8 rounded-[40px] border transition-all duration-500 relative ${
                  item.status === 'unexplored' 
                    ? 'bg-mist/10 border-dashed border-line opacity-70 hover:opacity-100 hover:border-primary/40' 
                    : 'bg-white border-line/50 shadow-sm hover:shadow-xl hover:border-primary/40'
                }`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
                    item.status === 'unexplored' ? 'bg-slate/10 text-slate/40' : 'bg-primary/10 text-primary'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-obsidian text-lg">{item.label}</h4>
                      <span className="text-[10px] font-bold text-primary">{item.count}/{item.total}</span>
                    </div>
                    <p className="text-xs font-bold text-slate/50 leading-snug">
                      {item.status === 'unexplored' ? '아직 수집된 데이터가 없습니다' : item.desc}
                    </p>
                    
                    {/* Tooltip-like Explanation */}
                    <div className="pt-4 border-t border-line/30 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] leading-relaxed text-slate/60 font-medium">{item.tooltip}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Asset Insights Footer */}
            <div className="bg-obsidian rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-white">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold opacity-60">Insight Report</p>
                  <p className="text-sm font-black">데이터가 100포인트 이상 쌓이면 유니클 정밀 분석 리포트 생성이 가능합니다.</p>
                </div>
              </div>
              <Button asChild className="bg-reward-gold text-obsidian font-black rounded-2xl px-8 h-12 hover:scale-105 transition-transform shadow-lg shadow-reward-gold/20">
                <Link href="/navigator">데이터 상담 신청하기</Link>
              </Button>
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-2xl font-black text-obsidian flex items-center gap-3">
                <History className="w-6 h-6 text-primary" />
                수집된 리커버리 자산 목록
              </h2>
              <Badge variant="outline" className="border-line font-black text-[10px] tracking-widest">{pastJourneys.length} ASSETS COLLECTED</Badge>
            </div>

            <div className="grid gap-6">
              {pastJourneys.map((journey, idx) => (
                <motion.div 
                  key={journey.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="group hover:border-primary/30 border-line/50 rounded-[40px] transition-all duration-500 overflow-hidden shadow-lg hover:shadow-2xl">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row items-stretch">
                        <div className="bg-mist/30 p-10 flex flex-col justify-center items-center md:w-64 border-b md:border-b-0 md:border-r border-line/50">
                          <div className="w-24 h-24 mb-4 group-hover:scale-110 transition-transform flex items-center justify-center">
                            <img src={journey.image} alt={journey.summary} className="w-full h-full object-contain" />
                          </div>
                          <Badge className="bg-obsidian text-white font-black text-[9px] tracking-tighter uppercase px-3 py-1 rounded-full mb-2">{journey.identity}</Badge>
                          <p className="text-[10px] text-slate/40 font-bold tracking-widest">{journey.date}</p>
                        </div>
                        <div className="flex-1 p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                          <div className="space-y-2 text-center md:text-left">
                            <h3 className="text-2xl font-black text-obsidian">{journey.summary}</h3>
                            <p className="text-sm text-slate/60 font-medium italic">"기록해보니, 피로보다 늦은 식사가 문제였습니다."</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <Button variant="outline" asChild className="h-10 rounded-xl border-line font-black text-[10px] px-4 hover:bg-mist transition-all">
                              <Link href={`/ai-navigator/report?id=${journey.id}`}>리포트 상세</Link>
                            </Button>
                            <Button variant="outline" className="h-10 rounded-xl border-line font-black text-[10px] px-4 hover:bg-mist transition-all">
                              <Download className="w-3.5 h-3.5 mr-2" />
                              PDF 저장
                            </Button>
                            <Button className="h-10 w-10 rounded-xl bg-obsidian text-white flex items-center justify-center p-0 hover:bg-primary hover:text-obsidian transition-all">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* Footer Support */}
      <div className="mt-32 text-center space-y-6">
        <p className="text-slate/30 font-bold text-xs">도움이 필요하신가요? 네비게이터에게 문의하세요.</p>
        <div className="flex justify-center gap-8">
          <Link href="/support" className="text-obsidian/40 hover:text-primary font-black text-[10px] tracking-widest uppercase transition-colors">Support Center</Link>
          <Link href="/privacy" className="text-obsidian/40 hover:text-primary font-black text-[10px] tracking-widest uppercase transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </ChapterWrapper>
  );
}
