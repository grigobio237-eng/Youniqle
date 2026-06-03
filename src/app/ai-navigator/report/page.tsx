'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Calendar, 
  Sparkles, 
  ChevronRight, 
  Image as ImageIcon,
  Zap,
  Moon,
  Clock,
  Share2,
  Download
} from 'lucide-react';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface RecoveryRecord {
  day: number;
  date: string;
  type: string;
  score: number;
  imageUrl?: string;
  summary?: string;
}

export default function WeeklyReportPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<RecoveryRecord[]>([]);
  const [mappedScores, setMappedScores] = useState<any[]>([]); // 차트용 데이터 상태 추가
  const [averageScore, setAverageScore] = useState(0); // 평균 점수 상태 추가
  const [showMembershipModal, setShowMembershipModal] = useState(false); // 멤버십 모달 상태 추가
  const [userStatus, setUserStatus] = useState<any>(null); // 사용자 권한 상태 추가
  const cardRef = React.useRef<HTMLDivElement>(null);
  const userName = session?.user?.name || '유저';

  const fetchedRef = React.useRef(false);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchWeeklyData();
      fetchedRef.current = true;
    }
  }, []);

  const fetchWeeklyData = async () => {
    try {
      const res = await fetch('/api/recovery/score');
      if (res.ok) {
        const { scores } = await res.json();
        const recentScores = scores.filter((s: any) => s.totalScore > 0).slice(-7);
        
        // 차트 데이터 (모든 점수 포함)
        const chartData = recentScores.map((s: any, idx: number) => ({
          day: idx + 1,
          score: s.totalScore
        }));
        setMappedScores(chartData);

        // 평균 점수 계산
        if (recentScores.length > 0) {
          const avg = Math.round(recentScores.reduce((acc: number, curr: any) => acc + curr.totalScore, 0) / recentScores.length);
          setAverageScore(avg);
        }

        const validScores = recentScores
          .filter((s: any) => s.snapData?.content || s.userNote);
        
        const mapped = validScores.map((s: any, idx: number) => {
          const content = s.snapData?.content || '';
          const isPhoto = s.snapData?.type === 'PHOTO';
          const isValidUrl = content && (content.startsWith('http') || content.startsWith('/') || content.startsWith('data:'));
          
          return {
            day: idx + 1,
            date: s.date,
            type: s.snapData?.type || 'TEXT',
            score: s.totalScore,
            imageUrl: isPhoto && isValidUrl ? content : undefined,
            summary: s.snapData?.type === 'TEXT' ? content : (s.userNote || s.metaphor)
          };
        });
        
        setRecords(mapped);
      }

      // 2. 권한 정보 조회
      const statusRes = await fetch('/api/user/status');
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setUserStatus(statusData.user);
      }
    } catch (error) {
      console.error("Failed to fetch weekly report data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2, // High resolution
        logging: false,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `youniqle-rhythm-card-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('발견 카드가 갤러리에 저장되었습니다.');
    } catch (error) {
      console.error('Failed to download card', error);
      toast.error('카드 저장에 실패했습니다.');
    }
  };



  const isAdmin = ['admin', 'superadmin'].includes(userStatus?.role);
  const isPremium = isAdmin || ['RESTART', 'BLACK'].includes(userStatus?.grade?.toUpperCase());

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full"
        />
      </div>
    );
  }

  return (
    <ChapterWrapper chapter="ai-navigator">
      <div className="min-h-screen bg-background text-text-primary pb-32">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-line">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="rounded-full">
                <Link href="/ai-navigator">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <h1 className="text-base font-black tracking-tight">주간 리듬 해석 리포트</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Download className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 pt-24 max-w-2xl space-y-12">
          {/* Hero Section */}
          <section className="text-center space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black tracking-widest uppercase"
            >
              <Sparkles className="w-3 h-3 mr-2" />
              7-Day Journey Complete
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-black tracking-tighter leading-tight text-3xl md:text-4xl"
            >
              당신의 7일은<br />
              <span className="text-primary underline decoration-primary/30 underline-offset-8">하나의 흐름</span>이 되었습니다.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate font-medium opacity-60"
            >
              완벽하게 회복된 것이 아니라,<br />
              이제 내 흐름을 보기 시작한 것입니다.
            </motion.p>
          </section>

          {/* 1. 7-Day Visual Evidence (The Snapshots) */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-black tracking-tight flex items-center gap-2 text-xl">
                <ImageIcon className="w-5 h-5 text-primary" />
                7일의 자기인식 타임라인
              </h3>
              <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black px-2">VISUAL EVIDENCE</Badge>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 snap-x">
              {records.map((record, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex-shrink-0 w-48 snap-start"
                >
                  <Card className="rounded-[24px] overflow-hidden border-line shadow-sm bg-white h-full flex flex-col">
                    {record.imageUrl ? (
                      /* 1. 이미지 로그 레이아웃 */
                      <>
                        <div className="aspect-[3/4] relative bg-mist">
                          <Image src={record.imageUrl} alt={`Day ${record.day}`} fill className="object-cover" />
                          <div className="absolute top-3 left-3 bg-obsidian/80 backdrop-blur-sm text-white text-[10px] font-black px-2 py-0.5 rounded-lg">
                            DAY {record.day.toString().padStart(2, '0')}
                          </div>
                          {/* 점수 오버레이 */}
                          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-line">
                            <span className="text-[10px] font-black text-primary">{record.score}</span>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <p className="text-[10px] font-bold text-slate/40 mb-1">
                            {new Date(record.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-xs font-black text-obsidian line-clamp-2 leading-relaxed">
                            {record.summary || '기록이 없습니다.'}
                          </p>
                        </CardContent>
                      </>
                    ) : (
                      /* 2. 텍스트 중심 메시지 카드 레이아웃 */
                      <div className="flex-1 flex flex-col bg-mist/30 relative min-h-[200px]">
                        <div className="absolute top-3 left-3 bg-slate/10 text-slate/60 text-[10px] font-black px-2 py-0.5 rounded-lg">
                          DAY {record.day.toString().padStart(2, '0')}
                        </div>
                        
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-8 h-8 bg-primary/5 rounded-full flex items-center justify-center mb-3">
                            <ImageIcon className="w-4 h-4 text-primary/20" />
                          </div>
                          <p className="text-[13px] font-bold text-obsidian leading-relaxed break-keep">
                            "{record.summary || '오늘의 회복 리듬을 기록했습니다'}"
                          </p>
                        </div>

                        <div className="p-4 border-t border-line flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate/40">
                            {new Date(record.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-slate/30 uppercase">Score</span>
                            <span className="text-[11px] font-black text-primary">{record.score}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* 2. Rhythm Interpretation Chart */}
          <section className="space-y-6 bg-surface p-8 rounded-[40px] border border-line shadow-xl">
            <div className="space-y-1">
              <h3 className="font-black tracking-tight text-xl">주간 리듬 해석</h3>
              <p className="text-sm text-slate font-medium opacity-60">지난 7일간 {userName} 님의 회복 에너지 흐름입니다.</p>
            </div>

            <div className="h-64 w-full pt-4 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mappedScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0E3A3A" stopOpacity={0.6}/>
                      <stop offset="60%" stopColor="#0E3A3A" stopOpacity={0.1}/>
                      <stop offset="100%" stopColor="#0E3A3A" stopOpacity={0}/>
                    </linearGradient>
                    {/* 선에 입체감을 주기 위한 글로우 필터 */}
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    {/* 그림자 필터 */}
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0E3A3A" floodOpacity="0.3" />
                    </filter>
                  </defs>
                  
                  {/* 배경 그리드 (입체감 부여) */}
                  <Tooltip
                    cursor={{ stroke: '#0E3A3A', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-obsidian p-4 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Rhythm Index</p>
                            </div>
                            <p className="text-2xl font-black text-white">{payload[0].value}%</p>
                            <p className="text-[10px] font-bold text-primary/60 mt-1 italic">Day {payload[0].payload.day} Flow</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <XAxis 
                    dataKey="day" 
                    tickFormatter={(val) => `D${val}`}
                    tick={{ fontSize: 10, fontWeight: '900', fill: '#0E3A3A', opacity: 0.3 }}
                    axisLine={false}
                    tickLine={false}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis hide domain={[0, 100]} />
                  
                  {/* 메인 영역 (그라데이션 레이어) */}
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="none"
                    fillOpacity={1}
                    fill="url(#colorScore)"
                    animationDuration={2000}
                    connectNulls
                  />

                  {/* 입체적인 라인 레이어 */}
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#0E3A3A"
                    strokeWidth={5}
                    fill="none"
                    filter="url(#shadow)"
                    animationDuration={2500}
                    dot={{ 
                      r: 6, 
                      fill: '#0E3A3A', 
                      strokeWidth: 3, 
                      stroke: '#fff',
                      filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
                    }}
                    activeDot={{ 
                      r: 10, 
                      strokeWidth: 4, 
                      stroke: '#fff', 
                      fill: '#D4AF37',
                      filter: 'drop-shadow(0px 4px 8px rgba(212,175,55,0.4))'
                    }}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-line/50">
              <div>
                <p className="text-[10px] font-bold text-slate/40 uppercase tracking-widest mb-1">Average Flow</p>
                <p className="text-2xl font-black text-obsidian">{averageScore}%</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate/40 uppercase tracking-widest mb-1">Status</p>
                <p className="text-2xl font-black text-[#0E3A3A]">STABLE</p>
              </div>
            </div>
          </section>

          {/* 3. Deep Insight: Disruption Factors & Routines */}
          <section className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-black tracking-tight flex items-center gap-2 text-xl">
                <Zap className="w-5 h-5 text-primary" />
                이번 주 나를 가장 많이 흔든 것
              </h3>
              <div className="grid gap-3">
                {[
                  { icon: '🌙', label: '수면 부족', desc: '새벽 1시 이후 취침이 3회 관찰되었습니다.', color: 'bg-secondary' },
                  { icon: '☕', label: '카페인 과부하', desc: '오후 4시 이후 카페인 섭취가 리듬을 깨뜨렸습니다.', color: 'bg-primary' },
                  { icon: '🏃', label: '불규칙한 활동', desc: '갑작스러운 고강도 활동 후 피로도가 급증했습니다.', color: 'bg-secondary' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-line shadow-sm">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <h4 className="text-sm font-black text-obsidian">{item.label}</h4>
                      <p className="text-xs text-slate font-medium opacity-60">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-black tracking-tight flex items-center gap-2 text-xl">
                <Clock className="w-5 h-5 text-primary" />
                다음 주 작은 실천 루틴
              </h3>
              <div className="grid gap-3">
                {[
                  { label: '밤 11시 스마트폰 멀리하기', time: '10분', type: 'SLEEP' },
                  { label: '오후 3시 가벼운 스트레칭', time: '5분', type: 'BODY' },
                  { label: '기상 직후 미지근한 물 한 잔', time: '1분', type: 'LIFESTYLE' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-primary/5 rounded-3xl border border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircleIcon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-black text-obsidian">{item.label}</span>
                    </div>
                    <Badge variant="outline" className="border-primary/20 text-primary font-black text-[10px]">{item.time}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 4. Anonymous Share Card Preview */}
          <section className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="font-black tracking-tight flex items-center justify-center gap-2 text-xl">
                <Share2 className="w-5 h-5 text-primary" />
                나의 발견 카드
              </h3>
              <p className="text-sm text-slate font-medium opacity-60">민감한 정보는 빼고, 내 흐름의 정체성만 담았습니다.</p>
            </div>

            <div 
              ref={cardRef}
              className="bg-obsidian p-12 rounded-[48px] text-center space-y-8 relative overflow-hidden aspect-[4/5] flex flex-col items-center justify-center shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px] -ml-24 -mb-24" />
              
              <div className="relative z-10 space-y-8 w-full">
                <div className="animate-bounce-slow text-xl">🌃</div>
                <div className="space-y-3">
                  <p className="text-xs font-black text-primary uppercase tracking-[0.4em]">Rhythm Identity</p>
                  <h4 className="text-3xl font-black text-white leading-tight tracking-tighter">
                    나는 밤에 무너지는<br />타입이었습니다.
                  </h4>
                </div>
                <p className="text-white/40 text-xs font-medium max-w-[200px] mx-auto leading-relaxed">
                  기록해보니, 피로보다 늦은 식사와 수면 리듬이 먼저 흔들리고 있었습니다.
                </p>
                
                <div className="pt-8 border-t border-white/10 flex justify-between items-center text-[8px] font-black text-white/20 uppercase tracking-[0.2em] w-full">
                  <span>YOUNIQLE Recovery CGM</span>
                  <span>7-Day Journey COMPLETE</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleDownload}
              className="w-full h-18 bg-obsidian text-white rounded-[24px] font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
            >
              <Download className="w-5 h-5" />
              카드 이미지 저장하기
            </Button>
          </section>

          {/* 5. Value Transition: Storage & Detailed Interpretation */}
          <section className="pt-8 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="font-black tracking-tight text-xl">이 흐름을 계속 이어가고 싶다면</h3>
              <p className="text-sm text-slate font-medium opacity-60">기록은 쌓이면 나를 이해하는 가장 강력한 자산이 됩니다.</p>
            </div>

            <Card className="bg-obsidian border-none rounded-[40px] overflow-hidden shadow-2xl">
              <CardContent className="p-10 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-3xl shadow-inner animate-pulse">
                    {isAdmin || isPremium ? '🔓' : '📦'}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-black text-white text-xl">
                      {isAdmin || isPremium ? '리듬 보관함 활성화됨' : '리듬 보관함 시작하기'}
                    </h4>
                    <p className="text-xs text-white/40 font-medium leading-relaxed">
                      {isAdmin || isPremium 
                        ? '모든 7일 기록이 보관함에 안전하게 저장되고 있습니다. 매주 심층 해석 리포트를 확인하세요.'
                        : '7일의 기록이 휘발되지 않도록 안전하게 보관하고, 매주 데이터 기반의 심층 해석을 받아보세요.'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {isAdmin || isPremium ? (
                    <Button 
                      asChild
                      className="w-full h-16 bg-white/10 text-white border border-white/20 rounded-[24px] font-black text-lg hover:bg-white/20 transition-all"
                    >
                      <Link href="/archive">보관함 데이터 확인하기</Link>
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setShowMembershipModal(true)}
                      className="w-full h-16 bg-[#D4AF37] text-obsidian rounded-[24px] font-black text-lg hover:bg-[#B8962E] hover:scale-[1.02] transition-all shadow-[0_10px_30px_rgba(212,175,55,0.3)]"
                    >
                      보관함 및 주간 해석 시작
                    </Button>
                  )}
                  
                  <div className="pt-8 border-t border-white/10">
                    <Link href="/private-report" className="w-full py-5 px-6 bg-white/10 border border-white/20 hover:bg-white/15 rounded-2xl transition-all flex items-center justify-center gap-4 group shadow-xl">
                      <span className="text-white text-xs font-black uppercase tracking-wider opacity-90">심화 정리가 필요하다면?</span>
                      <span className="text-[#D4AF37] text-xs font-black flex items-center gap-2 group-hover:underline group-hover:translate-x-1 transition-all">
                        조용한 정리 신청하기 <span className="text-xl">→</span>
                      </span>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>

        {/* 멤버십 전환 안내 모달 */}
        {showMembershipModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowMembershipModal(false)}
              className="absolute inset-0 bg-obsidian/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[40px] p-10 overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-6">
                <button 
                  onClick={() => setShowMembershipModal(false)} 
                  className="text-slate/20 hover:text-slate/40 transition-colors"
                  title="닫기"
                >
                  <ArrowLeft className="w-6 h-6 rotate-90" />
                </button>
              </div>

              <div className="space-y-8 text-center mt-4">
                <div className="w-20 h-20 bg-primary/5 rounded-[30px] flex items-center justify-center mx-auto">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-2xl font-black text-obsidian tracking-tight">회복의 흐름을<br />평생의 자산으로</h4>
                  <p className="text-sm text-slate font-medium leading-relaxed">
                    멤버십으로 전환하여 무제한 기록 보관과<br />
                    매주 AI의 심층 분석 리포트를 받아보세요.
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <Button asChild className="w-full h-16 bg-primary text-white font-black text-lg rounded-2xl">
                    <Link href="/membership">멤버십 혜택 확인하기</Link>
                  </Button>
                  <button 
                    onClick={() => setShowMembershipModal(false)}
                    className="text-xs font-bold text-slate/40 hover:text-slate/60"
                  >
                    다음에 할게요
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </ChapterWrapper>
  );
}

function CheckCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
