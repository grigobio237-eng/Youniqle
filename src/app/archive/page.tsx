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
  Shield,
  Award,
  Trophy
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

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
  const [certificateStatus, setCertificateStatus] = React.useState<any>(null);
  const [userStatus, setUserStatus] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/user/status?minimal=true');
        if (res.ok) {
          const data = await res.json();
          setAssetStats(data.assetStats);
          setCertificateStatus(data.certificateStatus);
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
    <ChapterWrapper chapter="archive" className="container mx-auto px-4 pt-8 pb-32 min-h-screen">
      {/* Header */}
      <div className="mb-8 text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center px-4 py-1.5 bg-obsidian text-white rounded-full text-[10px] font-black tracking-widest uppercase border border-white/10 shadow-xl">
          <Archive className="w-4 h-4 mr-2 text-primary" />
          Rhythm Archive
        </div>
        <h1 className="font-black text-obsidian tracking-tighter text-xl md:text-4xl">7일 챌린지 보관함</h1>
        <p className="text-[11px] md:text-sm text-slate/60 leading-relaxed font-bold break-keep">
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
                <h2 className="text-lg md:text-3xl font-black text-white tracking-tighter">
                  과거의 기록이<br />잠겨있습니다
                </h2>
                <p className="text-white/40 text-[11px] md:text-sm font-bold leading-relaxed break-keep max-w-md mx-auto">
                  유니클 라이프 패스로 보관함을 활성화하고,<br />
                  매주 누적되는 당신만의 회복 OS를 완성하세요.
                </p>
              </div>

              <div className="pt-8 w-full max-w-sm">
                <Button asChild className="w-full h-16 md:h-18 bg-primary text-obsidian rounded-[28px] font-black text-lg md:text-xl hover:scale-[1.02] transition-all shadow-2xl shadow-primary/20">
                  <Link href="/membership">보관함 활성화하기</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Premium Archive View */
        <div className="space-y-12 md:space-y-20 max-w-5xl mx-auto">
          <div className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-4">
            <Button asChild variant="ghost" className="text-slate/60 hover:text-primary font-bold transition-colors px-0 md:px-4">
              <Link href="/reports" className="flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" />
                리포트로 돌아가기
              </Link>
            </Button>
            <div className="flex items-center gap-3 bg-mist/30 px-4 py-2 rounded-2xl border border-line/50">
              <Shield className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-black text-obsidian">보안된 데이터 자산 관리 중</p>
            </div>
          </div>

          <section className="bg-white rounded-[40px] p-6 md:p-16 border border-obsidian/5 space-y-12 md:space-y-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
              <div className="space-y-4">
                <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black tracking-widest uppercase">
                  Data Asset Inventory
                </div>
                <h3 className="text-base md:text-xl font-black text-obsidian tracking-tighter">나의 회복 자산 인벤토리</h3>
                <p className="text-slate/60 font-bold text-[11px] md:text-sm">다양한 경로로 수집된 당신만의 회복 데이터를 관리하세요.</p>
              </div>
              <div className="flex items-center gap-4 bg-mist/50 p-4 md:p-6 rounded-[32px] border border-line/50 w-full md:w-auto">
                <div className="text-right flex-1">
                  <p className="text-[10px] font-black text-slate/40 uppercase tracking-tighter">Total Insights</p>
                  <p className="text-2xl md:text-3xl font-black text-primary">{assetStats?.totalInsights || 0} Pts</p>
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
                  className={`group p-4 md:p-5 rounded-[28px] border transition-all duration-500 relative ${
                  item.status === 'unexplored' 
                    ? 'bg-mist/10 border-dashed border-line opacity-70 hover:opacity-100 hover:border-primary/40' 
                    : 'bg-white border-line/50 shadow-sm hover:shadow-xl hover:border-primary/40'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl md:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      item.status === 'unexplored' ? 'bg-slate/10 text-slate/40' : 'bg-primary/10 text-primary'
                    }`}>
                      {React.cloneElement(item.icon as React.ReactElement, { className: 'w-5 h-5 md:w-6 md:h-6' })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="font-black text-obsidian text-sm md:text-base truncate">{item.label}</h4>
                        <span className="text-[10px] font-bold text-primary ml-2 shrink-0">{item.count}/{item.total}</span>
                      </div>
                      <p className="text-[11px] md:text-xs font-bold text-slate/40 truncate">
                        {item.status === 'unexplored' ? '미수집 데이터' : item.desc}
                      </p>
                    </div>
                  </div>
                  
                  <div className="absolute inset-x-4 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <p className="text-[9px] text-slate/40 font-medium text-center">{item.tooltip}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Asset Insights Footer */}
            <div className="bg-obsidian rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-white">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold opacity-60">Insight Report</p>
                  <p className="text-sm font-black">데이터가 100포인트 이상 쌓이면 유니클 정밀 분석 리포트 생성이 가능합니다.</p>
                </div>
              </div>
              <Button asChild className="w-full md:w-auto bg-reward-gold text-obsidian font-black rounded-2xl px-8 h-12 hover:scale-105 transition-transform shadow-lg shadow-reward-gold/20">
                <Link href="/navigator">데이터 상담 신청하기</Link>
              </Button>
            </div>
          </section>

          {/* Completion Certificates Section */}
          <section className="space-y-8 md:space-y-12">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 px-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-obsidian flex items-center gap-3">
                  <Award className="w-6 h-6 text-reward-gold" />
                  완주 증명서 콜렉션
                </h2>
                <p className="text-[10px] md:text-xs font-bold text-slate/40 uppercase tracking-widest">Records of completed 7-day journeys</p>
              </div>
              <Badge variant="outline" className="border-line font-black text-[9px] md:text-[10px] tracking-widest px-3 py-1">
                {(certificateStatus?.issuedCertificates?.length || 0)} CERTIFICATES
              </Badge>
            </div>

            {(!certificateStatus?.issuedCertificates || certificateStatus.issuedCertificates.length === 0) ? (
              <div className="bg-mist/20 border border-dashed border-line/50 rounded-[40px] p-12 text-center space-y-4">
                <Trophy className="w-10 h-10 text-slate/20 mx-auto" />
                <p className="text-sm font-bold text-slate/40">아직 발급된 증명서가 없습니다. <br />첫 번째 7일 챌린지를 완주해 보세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificateStatus.issuedCertificates.map((cert: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link href={`/certificate?cycle=${cert.cycleNumber}`}>
                      <Card className="group relative overflow-hidden rounded-[28px] border-line/50 hover:border-primary hover:shadow-xl transition-all bg-white">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="w-20 h-20 md:w-24 md:h-24 bg-obsidian rounded-[20px] relative overflow-hidden flex flex-col items-center justify-center shrink-0 border border-white/10 transition-transform group-hover:scale-105">
                            <div className="absolute inset-0 bg-gradient-to-br from-reward-gold/20 via-transparent to-primary/20 opacity-50" />
                            <div className="relative z-10 text-center">
                              <Sparkles className="w-6 h-6 text-reward-gold mx-auto mb-1" />
                              <span className="text-white font-black text-[10px] italic block">Cert.</span>
                            </div>
                          </div>
                          <div className="flex-1 space-y-2 min-w-0">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black px-2 py-0.5 rounded-full">
                                {cert.cycleNumber}회차 완주
                              </Badge>
                              <span className="text-[8px] md:text-[9px] font-bold text-slate/30">
                                {cert.startDate && cert.endDate 
                                  ? `${new Date(cert.startDate).toLocaleDateString().replace(/\.$/, '')} - ${new Date(cert.endDate).toLocaleDateString().replace(/\.$/, '')}`
                                  : new Date(cert.issuedAt).toLocaleDateString()
                                }
                              </span>
                            </div>
                            <div>
                              <h3 className="text-sm md:text-base font-black text-obsidian tracking-tight">7일 완주 증명서</h3>
                              <p className="text-[10px] text-slate/40 font-bold truncate">완주를 진심으로 축하드립니다!</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-8 md:space-y-12">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 px-4">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-black text-obsidian flex items-center gap-3">
                  <History className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  수집된 리커버리 자산 목록
                </h2>
                <p className="text-[10px] md:text-xs font-bold text-slate/40 uppercase tracking-widest">Detailed breakdown of your recovery assets</p>
              </div>
              <Badge variant="outline" className="border-line font-black text-[9px] md:text-[10px] tracking-widest px-3 py-1">{pastJourneys.length} ASSETS COLLECTED</Badge>
            </div>

            <div className="grid gap-6">
              {pastJourneys.map((journey, idx) => (
                <motion.div 
                  key={journey.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="group hover:border-primary/30 border-line/50 rounded-[28px] md:rounded-[40px] transition-all duration-500 overflow-hidden shadow-lg hover:shadow-2xl bg-white">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row items-stretch">
                        <div className="bg-mist/30 p-4 md:p-10 flex flex-row md:flex-col items-center gap-4 md:w-56 border-b md:border-b-0 md:border-r border-line/50">
                          <div className="w-16 h-16 md:w-24 md:h-24 group-hover:scale-110 transition-transform flex items-center justify-center shrink-0">
                            <Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized src={journey.image} alt={journey.summary} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 md:flex-none space-y-1 md:text-center">
                            <Badge className="bg-obsidian text-white font-black text-[8px] md:text-[9px] tracking-tighter uppercase px-2 py-0.5 md:px-3 md:py-1 rounded-full">{journey.identity}</Badge>
                            <p className="text-[9px] md:text-[10px] text-slate/40 font-bold tracking-widest">{journey.date}</p>
                          </div>
                        </div>
                        <div className="flex-1 p-5 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                          <div className="space-y-1 md:space-y-2 text-left">
                            <h3 className="text-base md:text-2xl font-black text-obsidian leading-tight">{journey.summary}</h3>
                            <p className="text-xs md:text-sm text-slate/60 font-medium italic">"기록해보니, 피로보다 늦은 식사가 문제였습니다."</p>
                          </div>
                          <div className="flex items-center gap-2 w-full md:w-auto">
                            <Button variant="outline" asChild className="flex-1 md:flex-none h-9 md:h-10 rounded-xl border-line font-black text-[10px] px-3 md:px-4 hover:bg-mist transition-all">
                              <Link href={`/ai-navigator/report?id=${journey.id}`}>리포트 상세</Link>
                            </Button>
                            <Button variant="outline" className="flex-1 md:flex-none h-9 md:h-10 rounded-xl border-line font-black text-[10px] px-3 md:px-4 hover:bg-mist transition-all">
                              <Download className="w-3.5 h-3.5 mr-1 md:mr-2" />
                              PDF
                            </Button>
                            <Button className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-obsidian text-white flex items-center justify-center p-0 hover:bg-primary hover:text-obsidian transition-all shrink-0">
                              <Share2 className="w-3.5 h-3.5" />
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
