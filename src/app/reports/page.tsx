'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { 
  Activity, 
  Brain, 
  Calendar, 
  ClipboardCheck, 
  Clock, 
  FileText, 
  History, 
  Scan, 
  Sparkles, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Moon,
  Heart,
  Smile,
  ChevronRight,
  UserCheck,
  X
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import { Progress } from '@/components/ui/progress';
import { DiagnosisRadarChart } from '@/components/charts/DiagnosisRadarChart';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

export default function ReportsHub() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 통합 히스토리용 상태
  const [historyTab, setHistoryTab] = useState<'daily' | 'scanner' | 'personality'>('daily');
  const [allDiagnoses, setAllDiagnoses] = useState<any[]>([]);
  const [allScans, setAllScans] = useState<any[]>([]);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  
  // 웰니스 명화 추천 시스템 전용 상태
  const [recommendedArtworks, setRecommendedArtworks] = useState<any[]>([]);

  // Fetch and parse all artworks
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch('/api/gallery');
        if (!res.ok) return;
        const artists = await res.json();
        
        const artworks: any[] = [];
        artists.forEach((artist: any) => {
          if (artist.items) {
            artist.items.forEach((item: any) => {
              artworks.push({
                ...item,
                artistName: artist.name
              });
            });
          }
        });
        setRecommendedArtworks(artworks);
      } catch (err) {
        console.error('Error fetching gallery recommendations:', err);
      }
    };

    fetchRecommendations();
  }, []);

  const lowestCategory = React.useMemo(() => {
    const scores = data?.categoryAnalysis?.scores;
    if (!scores) {
      return { key: 'mental', score: 50, label: 'Mental (정신적 회복)', tag: 'sleep-relax', title: '정신적 안정을 위한 명상 갤러리' };
    }
    const items = [
      { key: 'physical', score: scores.physical || 0, label: 'Physical (신체적 회복)', tag: 'energy', title: '활력을 더하는 에너제틱 갤러리' },
      { key: 'mental', score: scores.mental || 0, label: 'Mental (정신적 회복)', tag: 'sleep-relax', title: '정신적 안정을 위한 명상 갤러리' },
      { key: 'sleep', score: scores.sleep || 0, label: 'Sleep (수면 효율)', tag: 'sleep-relax', title: '수면과 깊은 휴식을 위한 딥 슬립 갤러리' },
      { key: 'lifestyle', score: scores.lifestyle || 0, label: 'Lifestyle (생활 습관)', tag: 'recovery-kit', title: '정갈한 라이프스타일을 위한 힐링 갤러리' }
    ];
    items.sort((a, b) => a.score - b.score);
    return items[0];
  }, [data]);

  const recommendedItems = React.useMemo(() => {
    if (!recommendedArtworks.length || !lowestCategory) return [];
    return recommendedArtworks
      .filter((art: any) => art.wellnessCategory === lowestCategory.tag)
      .slice(0, 3);
  }, [recommendedArtworks, lowestCategory]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports/dashboard');
      if (!res.ok) throw new Error('대시보드 데이터를 가져오지 못했습니다.');
      const json = await res.json();
      setData(json);

      // 전체 히스토리 로드
      const [diagRes, scanRes] = await Promise.all([
        fetch('/api/diagnosis'),
        fetch('/api/scan/latest')
      ]);

      if (diagRes.ok) {
        const diagJson = await diagRes.json();
        setAllDiagnoses(diagJson.diagnoses || []);
      }
      if (scanRes.ok) {
        const scanJson = await scanRes.json();
        setAllScans(scanJson ? [scanJson] : []);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleForceAIGeneration = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ai/reports/daily-trend');
      if (res.ok) {
        await fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ChapterWrapper chapter="diagnosis-report">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
          />
          <p className="text-sm font-bold text-slate-500">당신의 모든 회복 로그를 분석하여 보고서를 작성 중입니다...</p>
        </div>
      </ChapterWrapper>
    );
  }

  // 데이터 부족 또는 미가입자 Onboarding State
  const hasMinData = data?.dataAvailability?.hasRecoveryScores || data?.dataAvailability?.hasDiagnosis;

  if (!hasMinData) {
    return (
      <ChapterWrapper chapter="diagnosis-report">
        <div className="max-w-4xl mx-auto pt-6 pb-20 px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center bg-white rounded-[48px] p-10 md:p-20 shadow-2xl border border-line/30 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[120px] rounded-full -mr-40 -mt-40" />
            <div className="relative z-10 space-y-8">
              <div className="inline-flex p-4 bg-primary/10 text-primary rounded-full mb-2">
                <Sparkles className="w-12 h-12 animate-pulse" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-obsidian tracking-tight">
                나만을 위한 프리미엄<br />회복 보고서가 비어 있습니다
              </h2>
              <p className="text-slate/60 text-base md:text-lg max-w-xl mx-auto leading-relaxed break-keep">
                회복 리포트는 유저님의 **60초 데일리 체크**와 **정밀 문진 데이터**를 분석하여 작성됩니다. 지금 첫 측정을 완료하고 프리미엄 인사이트를 무료로 확인해 보세요.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Button asChild size="lg" className="bg-obsidian hover:bg-slate text-white font-black px-10 h-16 rounded-3xl transition-all shadow-xl shadow-obsidian/10">
                  <Link href="/reports/daily">60초 데일리 리듬체크 시작</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-line hover:bg-mist/30 text-obsidian font-black px-10 h-16 rounded-3xl">
                  <Link href="/diagnosis">정밀 회복 문진 참여</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </ChapterWrapper>
    );
  }

  // HSL Status Colors Map
  const badgeColors: Record<string, { bg: string, text: string, border: string, label: string }> = {
    EXCELLENT: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', label: '매우 양호' },
    GOOD: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20', label: '양호' },
    CAUTION: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', label: '주의 필요' },
    RISK: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20', label: '위험 수준' },
  };

  const status = data?.highlights?.statusBadge || 'GOOD';
  const badgeInfo = badgeColors[status] || badgeColors['GOOD'];

  // Detail Viewer Content Helper
  const detailPaneContent = selectedLog ? (
    <div className="space-y-4 md:space-y-6">
      <div className="border-b border-line pb-3 md:pb-4 flex justify-between items-center">
        <div>
          <h4 className="text-sm md:text-base font-black text-obsidian">
            {historyTab === 'daily' ? '60초 데일리 체크 분석 결과'
             : historyTab === 'scanner' ? '유니클 스마트 이미지 스캔 결과'
             : '내면 기질 (Big 5) 프로파일'}
          </h4>
          <span className="text-[10px] md:text-xs font-bold text-slate-400">
            작성일: {new Date(selectedLog.createdAt).toLocaleString()}
          </span>
        </div>

        <Badge className="bg-primary text-obsidian border-none text-[9px] md:text-[10px] font-black tracking-widest px-2.5 py-0.5 md:px-3 md:py-1 rounded-full uppercase">
          verified
        </Badge>
      </div>

      {historyTab === 'daily' && (
        <div className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="bg-white p-3 md:p-4 rounded-xl border border-line/20">
              <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block">종합 점수</span>
              <p className="text-xl md:text-2xl font-black text-obsidian">{selectedLog.totalScore || 0}pt</p>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-xl border border-line/20">
              <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block">감정 온도</span>
              <p className="text-xl md:text-2xl font-black text-obsidian">{selectedLog.metaphor || '양호'}</p>
            </div>
          </div>

          {/* Score Bars */}
          {selectedLog.categoryScores && (
            <div className="space-y-1.5 md:space-y-2.5">
              <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block">상세 항목</span>
              <div className="grid grid-cols-2 gap-2 md:gap-3 text-[10px] md:text-xs">
                {Object.entries(selectedLog.categoryScores).map(([key, val]: any) => (
                  <div key={key} className="bg-white p-2.5 md:p-3 rounded-lg border border-line/20 flex justify-between items-center">
                    <span className="font-bold text-slate-500 capitalize">{key}</span>
                    <span className="font-black text-obsidian">{val}점</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {historyTab === 'daily' ? null : historyTab === 'scanner' && (
        <div className="space-y-3 md:space-y-4">
          <div className="flex gap-3 md:gap-4 items-center">
            {selectedLog.imageUrl && (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border border-line/30 shrink-0 bg-slate-200">
                <img src={selectedLog.imageUrl} alt="Scan Image" className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] md:text-[9px] font-bold uppercase tracking-wider mb-0.5">
                {selectedLog.category || 'General'}
              </Badge>
              <h5 className="text-xs md:text-sm font-black text-obsidian">{selectedLog.summary || '식단/제품 스마트 스캔 분석'}</h5>
              <p className="text-[10px] md:text-xs font-semibold text-slate-400">매칭도/점수: {selectedLog.score || 0}점</p>
            </div>
          </div>

          {selectedLog.metrics && (() => {
            let parsedMetrics: any = null;
            if (typeof selectedLog.metrics === 'string') {
              try {
                // Remove potential markdown block wraps if present
                let cleanJson = selectedLog.metrics.trim();
                if (cleanJson.startsWith('```json')) cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
                else if (cleanJson.startsWith('```')) cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
                
                parsedMetrics = JSON.parse(cleanJson);
              } catch (e) {
                console.warn("Failed to parse scanner metrics JSON:", e);
              }
            } else {
              parsedMetrics = selectedLog.metrics;
            }

            if (parsedMetrics && typeof parsedMetrics === 'object') {
              return (
                <div className="space-y-4">
                  {/* Ingredients Breakdown */}
                  <div className="space-y-2">
                    <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block">AI 이미지 디테일 성분 분석</span>
                    <div className="grid grid-cols-1 gap-2.5">
                      {Object.entries(parsedMetrics).map(([key, val]: any) => {
                        if (isNaN(Number(key))) return null;
                        return (
                          <div key={key} className="bg-slate-50/80 p-3 md:p-3.5 rounded-xl border border-line/30 space-y-1">
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-[11px] md:text-xs font-black text-obsidian flex items-center gap-1.5 min-w-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                <span className="truncate">{val.label}</span>
                              </span>
                              <Badge className="bg-primary/10 text-primary border-none text-[8px] md:text-[9px] font-black px-2 py-0.5 shrink-0">
                                {val.value}
                              </Badge>
                            </div>
                            {val.benefit && (
                              <p className="text-[10px] md:text-xs text-slate-500 font-bold leading-relaxed break-keep pl-3">
                                {val.benefit}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Future Recovery Direction */}
                  {parsedMetrics.futureDirection && (
                    <div className="bg-indigo-50/50 border border-indigo-100/40 p-4 rounded-xl space-y-2">
                      <span className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase tracking-widest block">AI 맞춤형 회복 처방 가이드</span>
                      <div className="text-[10px] md:text-xs text-slate-600 leading-relaxed font-bold space-y-2 break-keep">
                        {parsedMetrics.futureDirection.split('\n').map((line: string, i: number) => {
                          const cleanLine = line.replace(/\*\*/g, '').trim();
                          if (!cleanLine) return null;
                          
                          // Dynamically detect bullet emojis
                          let emoji = '✨';
                          let displayText = cleanLine;
                          if (cleanLine.startsWith('🚨')) {
                            emoji = '🚨';
                            displayText = cleanLine.replace(/^🚨/, '').trim();
                          } else if (cleanLine.startsWith('💡')) {
                            emoji = '💡';
                            displayText = cleanLine.replace(/^💡/, '').trim();
                          } else if (cleanLine.startsWith('🌲')) {
                            emoji = '🌲';
                            displayText = cleanLine.replace(/^🌲/, '').trim();
                          } else if (cleanLine.startsWith('🌳')) {
                            emoji = '🌳';
                            displayText = cleanLine.replace(/^🌳/, '').trim();
                          }

                          return (
                            <div key={i} className="flex items-start gap-1.5">
                              <span className="shrink-0">{emoji}</span>
                              <span>{displayText}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // Robust fallback if parsing fails
            return (
              <div className="bg-white p-3 md:p-4 rounded-xl border border-line/20 space-y-1.5">
                <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block">AI 디테일 성분 분석</span>
                <div className="text-[10px] md:text-xs text-slate-600 leading-relaxed font-bold break-keep">
                  {typeof selectedLog.metrics === 'string' ? selectedLog.metrics : JSON.stringify(selectedLog.metrics)}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {historyTab === 'daily' || historyTab === 'scanner' ? null : historyTab === 'personality' && (
        <div className="space-y-3 md:space-y-4">
          <p className="text-[11px] md:text-sm font-bold text-slate-700 leading-relaxed break-keep">
            {selectedLog.resultDescription || 'Big 5 모델을 적용하여 생활 패턴 및 강점을 분석한 종합 진단입니다.'}
          </p>

          {selectedLog.categoryScores && (
            <div className="space-y-1.5 md:space-y-2">
              {Object.entries(selectedLog.categoryScores).map(([key, val]: any) => (
                <div key={key} className="space-y-0.5 md:space-y-1">
                  <div className="flex justify-between text-[10px] md:text-xs font-bold text-slate-500">
                    <span className="capitalize">{key}</span>
                    <span>{val}%</span>
                  </div>
                  <Progress value={val} className="h-1 md:h-1.5 bg-slate-200" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom detail action links */}
      <div className="pt-3 md:pt-4 border-t border-line/50 flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center text-[10px] md:text-xs mt-3 md:mt-4">
        <span className="font-bold text-slate-400">각 도구별 전용 상세 분석 화면으로 이동합니다.</span>
        <Link 
          href={
            historyTab === 'daily' ? '/reports/daily'
            : historyTab === 'scanner' ? '/reports/scanner'
            : '/reports/personality'
          }
          className="flex items-center gap-1 font-black text-primary hover:underline"
        >
          상세 뷰어로 가기 <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  ) : null;

  return (
    <ChapterWrapper chapter="diagnosis-report">
      <div className="max-w-6xl mx-auto pt-2 pb-24 px-4 md:px-6 space-y-12">

        {/* ═══════════════════════════════════════════════════
            SECTION 1: 리포트 표지 (ReportCover)
            ═══════════════════════════════════════════════════ */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-obsidian text-white rounded-[40px] p-8 md:p-14 shadow-2xl relative overflow-hidden border border-white/5"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[130px] rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -ml-32 -mb-32" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary/20 text-primary border-none px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                  Youniqle Engine v3.1
                </Badge>
                <Badge className="bg-white/10 text-white/70 border-none px-3 py-1.5 rounded-full text-[10px] font-bold">
                  내부 분석 리포트
                </Badge>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-bold text-white/40 tracking-wider">RECOVERY AUDIT REPORT</span>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                  {data?.cover?.userName}님의<br />
                  종합 회복 분석 진단서
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-white/50 pt-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>분석 기간: {data?.cover?.analysisFrom ? new Date(data.cover.analysisFrom).toLocaleDateString() : '시작 기록 없음'} ~ 오늘</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-primary" />
                  <span>평가 대상: {data?.cover?.userName} (본인)</span>
                </div>
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-3 gap-3 w-full md:w-[380px] shrink-0">
              <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col justify-between h-24">
                <span className="text-[10px] font-bold text-white/40">데일리 측정</span>
                <span className="text-2xl font-black text-white flex items-baseline gap-0.5">
                  {data?.cover?.totalRecoveryChecks}<span className="text-xs font-medium text-white/40">회</span>
                </span>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col justify-between h-24">
                <span className="text-[10px] font-bold text-white/40">정밀 분석</span>
                <span className="text-2xl font-black text-white flex items-baseline gap-0.5">
                  {data?.cover?.totalDiagnoses}<span className="text-xs font-medium text-white/40">회</span>
                </span>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col justify-between h-24">
                <span className="text-[10px] font-bold text-white/40">스마트 스캔</span>
                <span className="text-2xl font-black text-white flex items-baseline gap-0.5">
                  {data?.cover?.totalScans}<span className="text-xs font-medium text-white/40">회</span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>


        {/* ═══════════════════════════════════════════════════
            SECTION 2: 회복 하이라이트 (RecoveryHighlights)
            ═══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* Main Hero KPI Card */}
          <Card className="border-none bg-white shadow-2xl shadow-primary/5 rounded-[24px] md:rounded-[32px] overflow-hidden p-4 md:p-8 col-span-1 lg:col-span-2 flex flex-col justify-between gap-4 md:gap-6">
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5 md:space-y-1">
                  <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">CURRENT RECOVERY SCORE</h3>
                  <div className="flex items-baseline gap-1 md:gap-2">
                    <span className="text-4xl md:text-6xl font-black tracking-tighter text-obsidian">
                      {data?.highlights?.latestScore?.totalScore || 0}
                    </span>
                    <span className="text-sm md:text-lg font-bold text-slate-400">/ 100 pt</span>
                  </div>
                </div>

                <Badge className={`${badgeInfo.bg} ${badgeInfo.text} ${badgeInfo.border} border text-[10px] md:text-xs font-black tracking-widest px-3 py-1 md:px-4 md:py-1.5 rounded-full`}>
                  {badgeInfo.label}
                </Badge>
              </div>

              {/* Headline */}
              <div className="bg-mist/30 border border-line/40 rounded-xl md:rounded-2xl p-3 md:p-4 flex gap-2.5 items-start">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs md:text-sm font-bold text-obsidian leading-relaxed break-keep">
                  "{data?.highlights?.headline || '주기적인 데일리 리듬체크를 통해 회복 흐름을 관리해 보세요.'}"
                </p>
              </div>
            </div>

            {/* 7 Days Trend Mini Chart */}
            <div className="space-y-1.5 md:space-y-2">
              <div className="flex justify-between items-center text-[10px] md:text-xs font-bold text-slate-400 px-1">
                <span>7일 회복 트렌드</span>
                <span className="flex items-center gap-1">
                  {data?.highlights?.totalScoreDiff !== null && (
                    <>
                      전주 대비 
                      {data.highlights.totalScoreDiff > 0 ? (
                        <span className="text-emerald-500 flex items-center"><ArrowUpRight className="w-3.5 h-3.5" />+{data.highlights.totalScoreDiff}pt</span>
                      ) : data.highlights.totalScoreDiff < 0 ? (
                        <span className="text-rose-500 flex items-center"><ArrowDownRight className="w-3.5 h-3.5" />{data.highlights.totalScoreDiff}pt</span>
                      ) : (
                        <span>변동 없음</span>
                      )}
                    </>
                  )}
                </span>
              </div>

              <div className="h-28 md:h-32 w-full">
                {data?.trendData && data.trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: '9px', fontWeight: 'bold', fill: '#94a3b8' }} />
                      <YAxis domain={[0, 100]} tickLine={false} axisLine={false} style={{ fontSize: '9px', fontWeight: 'bold', fill: '#94a3b8' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111315', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                        labelStyle={{ fontWeight: 'black', color: '#b9ff66' }}
                      />
                      <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400">충분한 트렌드 데이터가 누적되지 않았습니다.</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* AI Status Panel Card */}
          <Card className="border-none bg-obsidian text-white shadow-2xl shadow-primary/5 rounded-[24px] md:rounded-[32px] overflow-hidden p-4 md:p-8 flex flex-col justify-between h-full gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/10 rounded-lg text-primary">
                  <Brain className="w-4 h-4" />
                </div>
                <h3 className="text-xs md:text-sm font-black tracking-wider text-white/60">AI RECOVERY OUTLOOK</h3>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-primary tracking-widest uppercase block">핵심 패턴 요약</span>
                <p className="text-xs md:text-sm text-white/70 leading-relaxed break-keep font-medium">
                  {data?.variance?.aiSummary || '데일리 회복 체크 및 루틴 활동을 꾸준히 기록하시면 AI 분석 리포트가 자동으로 생성됩니다.'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-white/40 font-bold">인사이트 갱신</span>
                <span className="text-primary font-bold">실시간 완료</span>
              </div>
              <Button 
                onClick={handleForceAIGeneration}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold h-10 md:h-12 rounded-xl md:rounded-2xl text-xs flex gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> AI 분석 새로고침
              </Button>
            </div>
          </Card>
        </div>


        {/* ═══════════════════════════════════════════════════
            SECTION 3: 영역별 정밀 분석 (CategoryAnalysis)
            ═══════════════════════════════════════════════════ */}
        <Card className="border-none bg-white shadow-2xl shadow-primary/5 rounded-[24px] md:rounded-[32px] p-4 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-5 bg-primary rounded-full" />
            <h2 className="text-lg md:text-2xl font-black text-obsidian tracking-tight">영역별 회복 밸런스 분석</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 items-center">
            
            {/* Recharts Radar Chart */}
            <div className="lg:col-span-2 h-56 md:h-72 w-full flex items-center justify-center bg-mist/20 rounded-[24px] md:rounded-[32px] border border-line/40 p-2 md:p-4">
              {data?.categoryAnalysis?.scores ? (
                <DiagnosisRadarChart 
                  data={[
                    { subject: 'physical', score: data.categoryAnalysis.scores.physical || 0, fullMark: 100 },
                    { subject: 'mental', score: data.categoryAnalysis.scores.mental || 0, fullMark: 100 },
                    { subject: 'sleep', score: data.categoryAnalysis.scores.sleep || 0, fullMark: 100 },
                    { subject: 'lifestyle', score: data.categoryAnalysis.scores.lifestyle || 0, fullMark: 100 },
                  ]}
                  color="var(--primary)"
                  className="w-full h-full"
                />
              ) : (
                <div className="text-center space-y-2">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                  <span className="text-[10px] font-bold text-slate-400">데이터가 확보되지 않았습니다.</span>
                </div>
              )}
            </div>

            {/* Category Cards Grid */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-4">
              {[
                { key: 'physical', label: 'Physical (신체적 회복)', score: data?.categoryAnalysis?.scores?.physical, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
                { key: 'mental', label: 'Mental (정신적 회복)', score: data?.categoryAnalysis?.scores?.mental, icon: Smile, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                { key: 'sleep', label: 'Sleep (수면 효율)', score: data?.categoryAnalysis?.scores?.sleep, icon: Moon, color: 'text-sky-500', bg: 'bg-sky-50' },
                { key: 'lifestyle', label: 'Lifestyle (생활 습관)', score: data?.categoryAnalysis?.scores?.lifestyle, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
              ].map((cat) => (
                <div key={cat.key} className="bg-slate-50 border border-line/30 rounded-xl md:rounded-2xl p-4 md:p-5 flex items-center justify-between hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg md:p-2.5 md:rounded-xl ${cat.bg} ${cat.color}`}>
                      <cat.icon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] md:text-xs font-bold text-slate-400 block">{cat.label}</span>
                      <div className="w-24 md:w-32 bg-slate-200 h-1 md:h-1.5 rounded-full overflow-hidden mt-1">
                        <div className={`h-full bg-slate-800`} style={{ width: `${cat.score || 0}%` }} />
                      </div>
                    </div>
                  </div>
                  <span className="text-lg md:text-2xl font-black text-obsidian tracking-tight">
                    {cat.score !== undefined ? `${cat.score}점` : '측정 무'}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </Card>

        {/* ═══════════════════════════════════════════════════
            [NEW] SECTION 3.5: 2E 스코어 맞춤형 힐링 파인 아트 Curation
            ═══════════════════════════════════════════════════ */}
        {recommendedItems.length > 0 && lowestCategory && (
          <Card className="border-none bg-[#F7F9F9] shadow-sm rounded-[24px] md:rounded-[32px] p-6 md:p-10 mb-6 md:mb-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-chapter-accent/5 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-chapter-accent/10 border border-chapter-accent/20 text-chapter-accent text-[10px] font-black uppercase tracking-widest">
                  <Sparkles className="w-3 h-3 animate-pulse" /> 2E Score Personalized Art Therapy
                </div>
                <h2 className="text-xl md:text-3xl font-black text-obsidian tracking-tight font-serif italic">
                  {lowestCategory.title}
                </h2>
                <p className="text-slate/60 text-xs sm:text-sm font-medium">
                  당신의 회복 점수가 가장 취약한 <span className="text-chapter-accent font-bold">{lowestCategory.label}</span> 지표를 케어하기 위해 큐레이팅된 맞춤형 힐링 작품입니다.
                </p>
              </div>
              <Button asChild variant="outline" className="rounded-xl border-line bg-white font-bold hover:bg-slate-50 transition-all text-xs self-start md:self-auto shrink-0 shadow-sm">
                <Link href="/gallery/artworks">전체 갤러리 로비</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedItems.map((art: any) => {
                const itemLink = `/gallery/artworks/${art.id.replace('ext-art-', '')}`;
                return (
                  <div key={art.id} className="bg-white border border-line/45 rounded-[24px] overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                    <Link href={itemLink} className="block relative aspect-[4/3] bg-mist overflow-hidden">
                      <Image 
                        src={art.image || ''} 
                        alt={art.title} 
                        fill 
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-chapter-accent text-white border-none font-black text-[9px] uppercase tracking-widest rounded-full shadow px-2.5 py-0.5">
                          {art.wellnessCategory === 'sleep-relax' ? '수면/안정' : art.wellnessCategory === 'energy' ? '활력/에너지' : '회복'}
                        </Badge>
                      </div>
                    </Link>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="space-y-1 mb-4">
                        <h4 className="text-base font-serif italic font-semibold text-obsidian line-clamp-1 group-hover:text-chapter-accent transition-colors">
                          <Link href={itemLink}>{art.title}</Link>
                        </h4>
                        <p className="text-[10px] font-bold text-slate/40 uppercase tracking-widest">{art.artistName}</p>
                        <p className="text-slate/60 text-xs line-clamp-2 leading-relaxed pt-1">{art.description || `${art.title} 작품`}</p>
                      </div>
                      <div className="pt-3 border-t border-line/50 flex justify-between items-center mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate/30 uppercase">Rental / Purchase</span>
                          <span className="text-sm font-black text-obsidian">₩ {art.price}</span>
                        </div>
                        <Button asChild size="sm" className="h-8 px-3 text-xs font-black bg-obsidian text-mist hover:bg-chapter-accent rounded-lg transition-colors">
                          <Link href={itemLink}>
                            작품 감상 & 렌탈
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}


        {/* ═══════════════════════════════════════════════════
            SECTION 4: 회복 비율 분석 (KeyRatios)
            ═══════════════════════════════════════════════════ */}
        <Card className="border-none bg-obsidian text-white shadow-2xl shadow-primary/5 rounded-[24px] md:rounded-[32px] p-4 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-5 bg-primary rounded-full" />
              <h2 className="text-lg md:text-2xl font-black tracking-tight">핵심 회복 비율 및 성장 지표</h2>
            </div>
            <Badge className="bg-primary/20 text-primary border-none px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest self-start md:self-auto">
              Financial Style KPI Analysis
            </Badge>
          </div>

          <div 
            className="flex overflow-x-auto pb-2 gap-3 snap-x scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-5 md:gap-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[
              {
                label: '회복 속도',
                sub: 'Velocity',
                value: data?.keyRatios?.recoveryVelocity !== null ? `${data.keyRatios.recoveryVelocity}%` : '계산 중',
                desc: '전주 평균 점수 대비 상승율',
                positive: (data?.keyRatios?.recoveryVelocity || 0) >= 0
              },
              {
                label: '컨디션 안정성',
                sub: 'Stability',
                value: data?.keyRatios?.stabilityScore !== null ? `${data.keyRatios.stabilityScore} / 5.0` : '측정 무',
                desc: '측정 점수 표준편차 역비율',
                positive: true
              },
              {
                label: '루틴 완료율',
                sub: 'Routine',
                value: data?.keyRatios?.routineCompletionRate !== null ? `${data.keyRatios.routineCompletionRate}%` : '기록 없음',
                desc: 'AI 맞춤 루틴 실질 이행율',
                positive: true,
                onboarding: data?.keyRatios?.routineCompletionRate === null
              },
              {
                label: '수면 효율',
                sub: 'Sleep',
                value: data?.keyRatios?.sleepEfficiency !== null ? `${data.keyRatios.sleepEfficiency}%` : '분석 중',
                desc: '전체 점수 대비 수면 비율',
                positive: true
              },
              {
                label: '측정 참여율',
                sub: 'Engagement',
                value: data?.keyRatios?.participationRate !== null ? `${data.keyRatios.participationRate}%` : '0%',
                desc: '최근 7일 측정 일수 비중',
                positive: (data?.keyRatios?.participationRate || 0) >= 50
              }
            ].map((ratio, idx) => (
              <div key={idx} className="snap-start shrink-0 w-[140px] md:w-auto bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-5 flex flex-col justify-between h-36 md:h-44 hover:bg-white/10 transition-all duration-300">
                <div className="space-y-0.5">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] md:text-xs font-bold text-white/50">{ratio.label}</span>
                    <Info className="w-3 md:w-3.5 h-3 md:h-3.5 text-white/20" />
                  </div>
                  <span className="text-[9px] font-bold tracking-wider text-primary uppercase block">{ratio.sub}</span>
                </div>

                <div className="space-y-1.5">
                  {ratio.onboarding ? (
                    <Button asChild size="sm" className="bg-primary text-obsidian hover:bg-primary/80 font-black h-7 text-[9px] rounded-xl w-full">
                      <Link href="/ai-navigator">루틴 시작하기</Link>
                    </Button>
                  ) : (
                    <span className="text-xl md:text-2xl font-black tracking-tight text-white block">
                      {ratio.value}
                    </span>
                  )}
                  <p className="text-[9px] font-semibold text-white/40 leading-normal break-keep">{ratio.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>


        {/* ═══════════════════════════════════════════════════
            SECTION 5: 변동 원인 분석 (VarianceAnalysis)
            ═══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          <Card className="border-none bg-white shadow-2xl shadow-primary/5 rounded-[24px] md:rounded-[32px] p-4 md:p-10 flex flex-col justify-between gap-4 md:gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-5 bg-primary rounded-full" />
                <h2 className="text-base md:text-xl font-black text-obsidian tracking-tight">회복력 흐름 및 기여도 분석</h2>
              </div>
              <p className="text-slate-500 font-medium text-[10px] md:text-xs leading-relaxed break-keep">
                회복 점수의 오르내림을 기여 지표별로 분석하여, 어떤 행동이 점수 개선을 방해하고 끌어당겼는지 분석합니다.
              </p>
            </div>

            <div className="space-y-2 md:space-y-4">
              {data?.variance?.categoryDiffs ? (
                Object.entries(data.variance.categoryDiffs).map(([key, diff]: any) => {
                  const titles: Record<string, string> = {
                    physical: '신체적 회복력 기여',
                    mental: '내면 정신 밸런스 기여',
                    sleep: '수면 및 휴식 기여',
                    lifestyle: '생활 속 루틴 기여',
                  };
                  const isPositive = diff >= 0;

                  return (
                    <div key={key} className="flex justify-between items-center p-2.5 md:p-3 bg-slate-50 rounded-xl md:rounded-2xl border border-line/20">
                      <span className="text-[10px] md:text-xs font-bold text-slate-700">{titles[key] || key}</span>
                      <div className="flex items-center gap-2">
                        {isPositive ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] md:text-[10px] font-bold">
                            +{diff}pt 개선
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-500/10 text-rose-600 border-none text-[9px] md:text-[10px] font-bold">
                            {diff}pt 하락
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400">이전 기간 비교용 데이터가 충분히 누적되지 않았습니다.</span>
                </div>
              )}
            </div>
          </Card>

          {/* Strongest vs Weakest Focus Card */}
          <Card className="border-none bg-white shadow-2xl shadow-primary/5 rounded-[24px] md:rounded-[32px] p-4 md:p-10 flex flex-col justify-between gap-4 md:gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-5 bg-primary rounded-full" />
                <h2 className="text-base md:text-xl font-black text-obsidian tracking-tight">강점 및 기회 분석</h2>
              </div>
              <p className="text-slate-500 font-medium text-[10px] md:text-xs leading-relaxed break-keep">
                현재 지표 중에서 가장 강력한 자원과 반대로 보완이 절실히 필요한 영역을 선별하였습니다.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 md:p-5 space-y-1.5">
                <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] md:text-[9px] font-bold tracking-widest uppercase px-2 py-0.5">
                  Best Factor
                </Badge>
                <h4 className="text-sm md:text-base font-black text-obsidian">
                  {data?.variance?.strongestCategory === 'sleep' ? '수면 및 휴식'
                   : data?.variance?.strongestCategory === 'physical' ? '신체 활력'
                   : data?.variance?.strongestCategory === 'mental' ? '멘탈 케어'
                   : data?.variance?.strongestCategory === 'lifestyle' ? '라이프스타일'
                   : '안정화 진행 중'}
                </h4>
                <p className="text-[9px] text-slate-400 font-medium leading-normal break-keep">현재 당신의 회복 흐름을 단단하게 지지해 주는 중심축입니다.</p>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 md:p-5 space-y-1.5">
                <Badge className="bg-amber-500/10 text-amber-600 border-none text-[8px] md:text-[9px] font-bold tracking-widest uppercase px-2 py-0.5">
                  Opportunity
                </Badge>
                <h4 className="text-sm md:text-base font-black text-obsidian">
                  {data?.variance?.weakestCategory === 'sleep' ? '수면 및 휴식'
                   : data?.variance?.weakestCategory === 'physical' ? '신체 활력'
                   : data?.variance?.weakestCategory === 'mental' ? '멘탈 케어'
                   : data?.variance?.weakestCategory === 'lifestyle' ? '라이프스타일'
                   : '기록이 더 필요함'}
                </h4>
                <p className="text-[9px] text-slate-400 font-medium leading-normal break-keep">이 부분을 보완할 때 종합 회복 속도가 크게 가속화됩니다.</p>
              </div>
            </div>
          </Card>
        </div>


        {/* ═══════════════════════════════════════════════════
            SECTION 6: 종합 평가 및 처방 (ConclusionSection)
            ═══════════════════════════════════════════════════ */}
        <Card className="border-none bg-white shadow-2xl shadow-primary/5 rounded-[24px] md:rounded-[32px] p-4 md:p-10 space-y-6 md:space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-5 bg-primary rounded-full" />
            <h2 className="text-lg md:text-2xl font-black text-obsidian tracking-tight">종합 처방 및 금일 실천 가이드</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* Prescriptions & Solutions */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <div className="bg-slate-50 border border-line/40 rounded-2xl md:rounded-3xl p-4 md:p-8 space-y-3 md:space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Medical / Expert AI Solution</span>
                </div>
                <p className="text-xs md:text-sm font-semibold text-slate-700 leading-relaxed break-keep">
                  {data?.conclusion?.aiSolution?.analysis || data?.conclusion?.resultDescription || '문진 분석 결과를 토대로 곧 맞춤 처방이 작성됩니다.'}
                </p>
              </div>

              {/* Recommendations list */}
              {data?.conclusion?.recommendations && data.conclusion.recommendations.length > 0 && (
                <div className="space-y-2.5 md:space-y-3">
                  <h4 className="text-[10px] md:text-xs font-black text-slate-400 tracking-wider">주요 행동 가이드라인</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3">
                    {data.conclusion.recommendations.map((rec: string, idx: number) => (
                      <div key={idx} className="flex gap-2 items-start bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-line/20">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-slate-700 leading-relaxed break-keep">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Daily micro-missions with point rewards */}
            <div className="bg-obsidian text-white rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col justify-between gap-4 md:gap-6">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-primary/20 text-primary border-none text-[8px] md:text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase">
                    Micro Missions
                  </Badge>
                  <span className="text-[9px] md:text-[10px] text-white/40 font-bold">실천 시 포인트 지급</span>
                </div>
                <h3 className="text-base md:text-lg font-black text-white">오늘의 넛지형 회복 행동</h3>
              </div>

              <div className="space-y-2.5 md:space-y-3">
                {data?.conclusion?.missions && data.conclusion.missions.length > 0 ? (
                  data.conclusion.missions.map((mission: any, idx: number) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 space-y-1.5 hover:bg-white/10 transition-all duration-300">
                      <div className="flex justify-between items-center">
                        <Badge className="bg-primary text-obsidian border-none text-[8px] font-black tracking-wider px-2 py-0.5 rounded-full">
                          {mission.category}
                        </Badge>
                        <span className="text-[8px] md:text-[9px] font-black text-primary">{mission.reward}</span>
                      </div>
                      <h4 className="text-xs font-black text-white break-keep">{mission.title}</h4>
                      <p className="text-[9px] font-medium text-white/40 leading-normal">{mission.effect}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5 text-white/30 text-xs">등록된 미션이 없습니다.</div>
                )}
              </div>

              <Button asChild className="w-full bg-white hover:bg-white/90 text-obsidian font-black h-10 md:h-12 rounded-xl md:rounded-2xl text-xs md:text-sm">
                <Link href="/ai-navigator">실천 완료 체크하기</Link>
              </Button>
            </div>

          </div>
        </Card>


        {/* ═══════════════════════════════════════════════════
            INTEGRATED SYSTEM: 전체 과거 로그 및 기록 통합 뷰어
            ═══════════════════════════════════════════════════ */}
        <Card className="border-none bg-white shadow-2xl shadow-primary/5 rounded-[24px] md:rounded-[32px] p-4 md:p-10 space-y-6 md:space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 border-b border-line pb-4 md:pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 md:w-6 md:h-6 text-slate-700" />
                <h2 className="text-lg md:text-2xl font-black text-obsidian tracking-tight">통합 회복 기록 및 이력 관리</h2>
              </div>
              <p className="text-slate-400 font-medium text-[10px] md:text-xs leading-relaxed">유저님이 Youniqle을 통해 기록하고 스캔해 온 모든 데이터를 모아 보실 수 있습니다.</p>
            </div>

            {/* Selection Switcher */}
            <div className="flex items-center gap-1 bg-mist/50 p-1 rounded-xl border border-line/50 w-full overflow-x-auto scrollbar-none md:w-auto md:p-1.5 md:rounded-2xl">
              {[
                { id: 'daily', label: '60초 리듬체크', icon: Activity },
                { id: 'scanner', label: '스마트 스캔', icon: Scan },
                { id: 'personality', label: '내면 기질', icon: Brain },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setHistoryTab(tab.id as any);
                    setSelectedLog(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] sm:text-xs font-black transition-all shrink-0 flex-1 md:flex-initial md:px-4 md:py-2.5 md:rounded-xl ${
                    historyTab === tab.id 
                      ? 'bg-obsidian text-white shadow-md' 
                      : 'text-slate-400 hover:text-obsidian'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* List Sidebar */}
            <div className="col-span-1 md:col-span-1 border border-line/50 rounded-xl md:rounded-2xl p-3 md:p-4 max-h-[280px] md:max-h-[380px] overflow-y-auto space-y-1.5 md:space-y-2 scrollbar-thin">
              {historyTab === 'daily' && (
                allDiagnoses.length > 0 ? (
                  allDiagnoses.map((diag, index) => (
                    <button
                      key={diag._id}
                      onClick={() => setSelectedLog(diag)}
                      className={`w-full text-left p-2.5 md:p-3.5 rounded-lg md:rounded-xl border transition-all flex items-center justify-between ${
                        selectedLog?._id === diag._id
                          ? 'bg-obsidian text-white border-obsidian'
                          : 'bg-slate-50 border-line/20 hover:bg-mist/30 text-obsidian'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-[11px] md:text-xs font-bold block">{new Date(diag.createdAt).toLocaleDateString()}</span>
                        <span className={`text-[9px] md:text-[10px] font-black uppercase ${selectedLog?._id === diag._id ? 'text-primary' : 'text-slate-400'}`}>
                          Score: {diag.totalScore || 0}pt
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-55" />
                    </button>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs font-bold text-slate-300">내역이 존재하지 않습니다.</div>
                )
              )}

              {historyTab === 'scanner' && (
                allScans.length > 0 ? (
                  allScans.map((scan, index) => (
                    <button
                      key={scan._id}
                      onClick={() => setSelectedLog(scan)}
                      className={`w-full text-left p-2.5 md:p-3.5 rounded-lg md:rounded-xl border transition-all flex items-center justify-between ${
                        selectedLog?._id === scan._id
                          ? 'bg-obsidian text-white border-obsidian'
                          : 'bg-slate-50 border-line/20 hover:bg-mist/30 text-obsidian'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-[11px] md:text-xs font-bold block">{new Date(scan.createdAt).toLocaleDateString()}</span>
                        <span className={`text-[9px] md:text-[10px] font-black uppercase ${selectedLog?._id === scan._id ? 'text-primary' : 'text-slate-400'}`}>
                          {scan.category || '스캔'}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-55" />
                    </button>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs font-bold text-slate-300">내역이 존재하지 않습니다.</div>
                )
              )}

              {historyTab === 'personality' && (
                data?.personalityData ? (
                  <button
                    onClick={() => setSelectedLog(data.personalityData)}
                    className={`w-full text-left p-2.5 md:p-3.5 rounded-lg md:rounded-xl border transition-all flex items-center justify-between ${
                      selectedLog?._id === data.personalityData._id
                        ? 'bg-obsidian text-white border-obsidian'
                        : 'bg-slate-50 border-line/20 hover:bg-mist/30 text-obsidian'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-[11px] md:text-xs font-bold block">{new Date(data.personalityData.createdAt).toLocaleDateString()}</span>
                      <span className={`text-[9px] md:text-[10px] font-black uppercase ${selectedLog?._id === data.personalityData._id ? 'text-primary' : 'text-slate-400'}`}>
                        BIG 5 성향 데이터
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-55" />
                  </button>
                ) : (
                  <div className="text-center py-6 text-xs font-bold text-slate-300">내역이 존재하지 않습니다.</div>
                )
              )}
            </div>

            {/* Interactive Detail Viewer Pane (Desktop only) */}
            <div className="hidden md:flex md:col-span-2 bg-slate-50 border border-line/40 rounded-2xl p-6 min-h-[250px] flex-col justify-between">
              {selectedLog ? detailPaneContent : (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="p-3 bg-slate-200/50 rounded-full text-slate-400">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-obsidian">상세 로그 확인</h5>
                    <p className="text-[10px] font-bold text-slate-400">좌측 리스트에서 상세 내역을 선택해 주세요.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

      </div>

      {/* Mobile Full-screen Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="fixed inset-0 bg-black z-[90] md:hidden"
            />
            {/* Modal Container */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-0 bg-slate-50 overflow-y-auto z-[100] md:hidden scrollbar-thin p-6 flex flex-col"
              style={{
                overscrollBehaviorY: 'contain',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <button 
                onClick={() => setSelectedLog(null)}
                className="absolute top-6 right-6 p-2 bg-slate-200/60 hover:bg-slate-200 text-slate-500 rounded-full transition-all z-10"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="pt-6 pb-20">
                {detailPaneContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </ChapterWrapper>
  );
}
