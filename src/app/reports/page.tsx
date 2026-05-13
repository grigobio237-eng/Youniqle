'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  Activity, 
  Brain, 
  Calendar, 
  ClipboardCheck, 
  Clock, 
  FileText, 
  History, 
  LayoutDashboard, 
  Scan, 
  Sparkles, 
  Star, 
  TrendingUp,
  ArrowRight,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ChapterWrapper from '@/components/layout/ChapterWrapper';

interface ReportCardProps {
  title: string;
  desc: string;
  date?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED' | 'NOT_STARTED';
  type: string;
  href: string;
  score?: number;
  icon: React.ElementType;
  isPrimary?: boolean;
}

const ReportCard = ({ title, desc, date, status, type, href, score, icon: Icon, isPrimary }: ReportCardProps) => {
  const statusMap = {
    COMPLETED: { label: '완료', class: 'bg-primary/10 text-primary' },
    IN_PROGRESS: { label: '진행 중', class: 'bg-secondary-container/30 text-on-secondary-container' },
    LOCKED: { label: '잠김', class: 'bg-foreground/5 text-foreground/30' },
    NOT_STARTED: { label: '기록 없음', class: 'bg-mist text-foreground/20' }
  };

  const currentStatus = statusMap[status];

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`relative h-full ${isPrimary ? 'md:col-span-2' : ''}`}
    >
      <Link href={href}>
        <Card className={`h-full overflow-hidden border-none shadow-2xl shadow-primary/5 transition-all duration-500 hover:shadow-primary/10 ${isPrimary ? 'bg-foreground text-white' : 'bg-white'}`}>
          <CardContent className="p-5 md:p-8 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className={`p-2.5 md:p-3 rounded-2xl ${isPrimary ? 'bg-primary/20 text-primary' : 'bg-primary/5 text-primary'}`}>
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex flex-col items-end gap-1.5 md:gap-2">
                <Badge className={`${currentStatus.class} border-none text-[8px] md:text-[10px] font-black tracking-widest px-2.5 py-0.5 md:px-3 md:py-1 rounded-full uppercase`}>
                  {currentStatus.label}
                </Badge>
                {score !== undefined && (
                  <span className={`text-xl md:text-2xl font-black tracking-tighter ${isPrimary ? 'text-primary' : 'text-primary'}`}>
                    {score}<span className="text-[10px] md:text-xs opacity-50 ml-0.5">pt</span>
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1 md:space-y-2 mb-6 md:mb-8 flex-1">
              <h3 className={`text-lg md:text-xl font-bold tracking-tight ${isPrimary ? 'text-white' : 'text-foreground'}`}>
                {title}
              </h3>
              <p className={`text-xs md:text-sm font-medium leading-relaxed break-keep ${isPrimary ? 'text-white/40' : 'text-foreground/40'}`}>
                {desc}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-primary/5">
              <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${isPrimary ? 'text-white/20' : 'text-foreground/20'}`}>
                {date || '최근 기록 없음'}
              </span>
              <div className={`flex items-center gap-1 text-[11px] md:text-sm font-bold ${isPrimary ? 'text-primary' : 'text-primary'}`}>
                자세히 보기 <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default function ReportsHub() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any>({
    daily: null,
    scanner: null,
    personality: null,
    weekly: null,
    roadmap: null,
    consultation: null
  });
  const [activeTab, setActiveTab] = useState('daily');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [diagnosisRes, snapRes, weeklyRes, postCareRes, consultRes] = await Promise.all([
          fetch('/api/diagnosis/latest'),
          fetch('/api/scan/latest'),
          fetch('/api/dashboard/report'),
          fetch('/api/event/post-care/latest'),
          fetch('/api/event/consultation/latest')
        ]);

        const diagnosisData = diagnosisRes.ok ? await diagnosisRes.json() : {};
        const snapData = snapRes.ok ? await snapRes.json() : null;
        const weeklyData = weeklyRes.ok ? await weeklyRes.json() : {};
        const postCareData = postCareRes.ok ? await postCareRes.json() : null;
        const consultData = consultRes.ok ? await consultRes.json() : null;

        setReports({
          daily: diagnosisData.daily || null,
          personality: diagnosisData.personality || null,
          scanner: snapData || null,
          weekly: weeklyData.report || null,
          roadmap: postCareData || null,
          consultation: consultData || null
        });
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchData();
    else setLoading(false);
  }, [session]);

  const getReportHref = (type: string, data: any) => {
    if (!data) {
      // 데이터가 없는 경우 각각의 시작 페이지 또는 리스트 페이지로 연결
      const fallbackMap: Record<string, string> = {
        daily: '/reports/daily',
        scanner: '/reports/scanner',
        personality: '/reports/personality',
        weekly: '/archive',
        roadmap: '/event/post-care',
        consultation: '/event/consultation'
      };
      return fallbackMap[type] || '/reports';
    }

    // 데이터가 있는 경우 상세 페이지로 연결
    switch (type) {
      case 'daily': return '/reports/daily';
      case 'scanner': return '/reports/scanner';
      case 'personality': return '/reports/personality'; 
      case 'weekly': return '/archive';
      case 'roadmap': return `/event/post-care/report/${data._id}`;
      case 'consultation': return `/event/consultation/report/${data._id}`;
      default: return '/reports';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <ChapterWrapper chapter="diagnosis-report">
      <div className="max-w-6xl mx-auto pt-2 pb-12 px-4 md:px-6">
        
        {/* Hero Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-mist/30 rounded-[40px] p-8 md:p-12 border border-primary/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                Overall Status
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                {session?.user?.name || '요원'}님의<br />회복 인사이트가 준비되었습니다.
              </h2>
              <p className="text-foreground/40 font-medium max-w-md">
                데이터는 거짓말을 하지 않습니다. 유니클의 분석을 통해 매일 더 나은 회복을 설계하세요.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:w-80">
              <div className="bg-white p-6 rounded-3xl shadow-xl shadow-primary/5 border border-primary/5">
                <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest block mb-1">Total Reports</span>
                <span className="text-3xl font-black text-primary">06</span>
              </div>
              <div className="bg-foreground p-6 rounded-3xl shadow-xl shadow-primary/5">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-1">Last Update</span>
                <span className="text-lg font-black text-white">Today</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Primary Reports Hub (Tabbed Interface) */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-primary rounded-full" />
              <h2 className="text-2xl font-black tracking-tight">핵심 회복 분석 (Core Analysis)</h2>
            </div>
            
            {/* Tab Menu */}
            <div className="grid grid-cols-2 md:flex items-center gap-1.5 bg-mist/50 p-1.5 rounded-[22px] border border-line/50 w-full md:w-auto">
              {[
                { id: 'daily', label: '60초 리듬체크', icon: Activity },
                { id: 'scanner', label: '스캐너 분석', icon: Scan },
                { id: 'personality', label: '내면 데이터', icon: Brain },
                { id: 'weekly', label: '7일 챌린지', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center md:justify-start gap-2 px-3 md:px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all ${
                    activeTab === tab.id 
                      ? 'bg-obsidian text-white shadow-lg' 
                      : 'text-slate/40 hover:text-obsidian hover:bg-white'
                  }`}
                >
                  <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-primary' : ''}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-[40px] border border-line/50 shadow-2xl overflow-hidden"
          >
            {activeTab === 'daily' && (
              <div className="p-8 md:p-12 space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                        <Activity className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-black text-obsidian tracking-tight">60초 리듬체크</h3>
                        <p className="text-slate/40 font-bold text-sm">최근 측정: {reports.daily?.createdAt ? new Date(reports.daily.createdAt).toLocaleDateString() : '데이터 없음'}</p>
                      </div>
                    </div>
                    <p className="text-slate/60 font-medium text-lg leading-relaxed max-w-2xl break-keep">
                      당신의 심박 변이도와 스트레스 지수를 분석한 실시간 결과입니다. 현재 회복이 가장 필요한 시점입니다.
                    </p>
                  </div>
                  <div className="bg-mist/30 p-8 rounded-[32px] text-center w-full md:w-64 border border-line/50">
                    <p className="text-[10px] font-black text-slate/40 uppercase tracking-widest mb-2">Recovery Score</p>
                    <span className="text-6xl font-black text-primary tracking-tighter">
                      {reports.daily?.score || '--'}<span className="text-xl opacity-30 ml-1">pt</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-mist/10 p-6 rounded-3xl border border-line/30 space-y-3">
                    <p className="text-[10px] font-black text-slate/40 uppercase tracking-widest">Stress Level</p>
                    <p className="text-xl font-black text-obsidian">매우 높음 (82%)</p>
                  </div>
                  <div className="bg-mist/10 p-6 rounded-3xl border border-line/30 space-y-3">
                    <p className="text-[10px] font-black text-slate/40 uppercase tracking-widest">Sleep Quality</p>
                    <p className="text-xl font-black text-obsidian">불규칙함 (45%)</p>
                  </div>
                  <div className="bg-mist/10 p-6 rounded-3xl border border-line/30 space-y-3">
                    <p className="text-[10px] font-black text-slate/40 uppercase tracking-widest">Energy Balance</p>
                    <p className="text-xl font-black text-obsidian">소진됨 (12%)</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-line/30 flex justify-between items-center">
                  <p className="text-sm font-bold text-slate/40 italic">"데이터 기반의 맞춤 솔루션을 확인해 보세요."</p>
                  <Button asChild className="bg-obsidian text-white rounded-2xl px-8 h-12 font-black transition-transform hover:scale-105">
                    <Link href="/reports/daily">상세 리포트 보기</Link>
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'scanner' && (
              <div className="p-8 md:p-12 space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                        <Scan className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-black text-obsidian tracking-tight">유니클 스캐너 분석</h3>
                        <p className="text-slate/40 font-bold text-sm">최근 스캔: {reports.scanner?.createdAt ? new Date(reports.scanner.createdAt).toLocaleDateString() : '데이터 없음'}</p>
                      </div>
                    </div>
                    <p className="text-slate/60 font-medium text-lg leading-relaxed max-w-2xl break-keep">
                      딥러닝 알고리즘이 당신이 촬영한 식단과 제품 이미지를 분석했습니다. 영양 불균형이 감지되었습니다.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 w-full md:w-64">
                    <div className="bg-mist/30 p-6 rounded-[28px] border border-line/50 text-center">
                      <p className="text-[10px] font-black text-slate/40 uppercase tracking-widest mb-1">Detected Items</p>
                      <p className="text-2xl font-black text-obsidian">04 건</p>
                    </div>
                    <div className="bg-primary/5 p-6 rounded-[28px] border border-primary/20 text-center">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Warning Level</p>
                      <p className="text-2xl font-black text-primary">Caution</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="aspect-square bg-mist/20 rounded-2xl border border-line/30 flex items-center justify-center">
                      <Scan className="w-6 h-6 text-slate/20" />
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-line/30 flex justify-between items-center">
                  <p className="text-sm font-bold text-slate/40 italic">"어떤 성분이 당신의 회복을 방해하고 있을까요?"</p>
                  <Button asChild className="bg-obsidian text-white rounded-2xl px-8 h-12 font-black transition-transform hover:scale-105">
                    <Link href="/reports/scanner">상세 분석 확인</Link>
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'personality' && (
              <div className="p-8 md:p-12 space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                        <Brain className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-black text-obsidian tracking-tight">내면 데이터 리포트</h3>
                        <p className="text-slate/40 font-bold text-sm">진단 완료: {reports.personality?.createdAt ? new Date(reports.personality.createdAt).toLocaleDateString() : '데이터 없음'}</p>
                      </div>
                    </div>
                    <p className="text-slate/60 font-medium text-lg leading-relaxed max-w-2xl break-keep">
                      Big 5 모델을 통해 당신의 타고난 기질과 스트레스 취약점을 분석했습니다. 당신은 '회복 탄력성'이 높은 유형입니다.
                    </p>
                  </div>
                  <div className="bg-obsidian p-8 rounded-[32px] text-center w-full md:w-64 shadow-2xl">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Inner Type</p>
                    <span className="text-2xl font-black text-white tracking-tighter">
                      RECOVERY-GENIUS
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-2 w-full bg-mist/30 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[75%]" />
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-slate/40 uppercase tracking-widest">
                    <span>Stress Vulnerability</span>
                    <span>75% Optimization</span>
                  </div>
                </div>

                <div className="pt-8 border-t border-line/30 flex justify-between items-center">
                  <p className="text-sm font-bold text-slate/40 italic">"내면의 힘을 길러주는 맞춤 가이드를 만나보세요."</p>
                  <Button asChild className="bg-obsidian text-white rounded-2xl px-8 h-12 font-black transition-transform hover:scale-105">
                    <Link href="/reports/personality">프리미엄 리포트 읽기</Link>
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'weekly' && (
              <div className="p-8 md:p-12 space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                        <TrendingUp className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-black text-obsidian tracking-tight">7일 챌린지 리포트</h3>
                        <p className="text-slate/40 font-bold text-sm">분석 기간: {reports.weekly?.createdAt ? new Date(reports.weekly.createdAt).toLocaleDateString() : '데이터 없음'}</p>
                      </div>
                    </div>
                    <p className="text-slate/60 font-medium text-lg leading-relaxed max-w-2xl break-keep">
                      지난 7일간의 모든 지표가 우상향하고 있습니다. 당신의 회복 정체성이 성공적으로 구축되고 있습니다.
                    </p>
                  </div>
                  <div className="bg-primary p-8 rounded-[32px] text-center w-full md:w-64 shadow-xl shadow-primary/20">
                    <p className="text-[10px] font-black text-obsidian uppercase tracking-widest mb-2">Weekly Trend</p>
                    <span className="text-4xl font-black text-obsidian tracking-tighter">
                      UPWARD
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 overflow-x-auto pb-4 no-scrollbar">
                  {[1, 2, 3, 4, 5, 6, 7].map(day => (
                    <div key={day} className="flex-col items-center gap-2 text-center shrink-0">
                      <div className={`w-12 h-${12 + (day * 2)} bg-mist/20 rounded-xl mb-2 relative`}>
                        <div className={`absolute bottom-0 w-full h-${8 + day} bg-primary/40 rounded-xl`} />
                      </div>
                      <span className="text-[10px] font-black text-slate/40 uppercase">Day {day}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-line/30 flex justify-between items-center">
                  <p className="text-sm font-bold text-slate/40 italic">"누적된 7일의 기록이 당신의 미래를 바꿉니다."</p>
                  <Button asChild className="bg-obsidian text-white rounded-2xl px-8 h-12 font-black transition-transform hover:scale-105">
                    <Link href="/archive">전체 보관함 보기</Link>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </section>

        {/* Secondary Reports List */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-foreground/20 rounded-full" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground/60">시술 관리 및 정밀 설계 (Support Area)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <ReportCard 
                title="회복 로드맵 (Post-Op)"
                desc="시술 및 수술 후 단계별 회복 지침과 주의사항이 담긴 맞춤 로드맵입니다."
                date={reports.roadmap?.createdAt ? new Date(reports.roadmap.createdAt).toLocaleDateString() : undefined}
                status={reports.roadmap ? 'COMPLETED' : 'NOT_STARTED'}
                type="roadmap"
                href={getReportHref('roadmap', reports.roadmap)}
                icon={ClipboardCheck}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <ReportCard 
                title="방문 전 정밀 문진"
                desc="병원 방문 전 작성한 상세 문진표와 AI 분석 상담 가이드입니다."
                date={reports.consultation?.createdAt ? new Date(reports.consultation.createdAt).toLocaleDateString() : undefined}
                status={reports.consultation ? 'COMPLETED' : 'NOT_STARTED'}
                type="consultation"
                href={getReportHref('consultation', reports.consultation)}
                icon={FileText}
              />
            </motion.div>
          </div>
        </section>

      </div>
    </ChapterWrapper>
  );
}
