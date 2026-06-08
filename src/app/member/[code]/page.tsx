'use client';

import { useEffect, useState, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Sparkles, ArrowRight, QrCode, UserCheck, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface MemberInfo {
  name: string;
  grade: string;
  tier: string;
  referralCode: string;
  referredBy: string | null;
  referrerName: string | null;
  memberSince: string;
  latestDiagnosisScore: number | null;
}

interface ApiResponse {
  viewerRole: 'self' | 'partner' | 'guest';
  member: MemberInfo;
  medicalHistory?: any[];
  preConsultation?: any;
  isMedicalAuthenticated?: boolean;
}

const GRADE_LABELS: Record<string, string> = {
  cedar: 'Cedar',
  rooter: 'Rooter',
  bloomer: 'Bloomer',
  glower: 'Glower',
  ecosoul: 'Eco Soul',
  essence: 'Essence',
  balance: 'Balance',
  miracle: 'Miracle',
};

// Next.js 15에서는 클라이언트 컴포넌트에서도 params가 Promise일 수 있음
export default function MemberVerifyPage() {
  const params = useParams();
  const [code, setCode] = useState<string | null>(null);
  const router = useRouter();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visitConfirmed, setVisitConfirmed] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [selectedReportIdx, setSelectedReportIdx] = useState(0);
  const [isMedicalMode, setIsMedicalMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'clinical' | 'psychology'>('clinical');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      setIsMedicalMode(searchParams.get('mode') === 'medical');
    }
  }, []);

  useEffect(() => {
    // useParams가 객체를 반환하는 경우와 Promise를 반환하는 경우 모두 대응
    if (params instanceof Promise) {
      params.then(p => setCode((p as any)?.code || null));
    } else {
      setCode((params as any)?.code || null);
    }
  }, [params]);

  useEffect(() => {
    if (!code) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const searchParams = new URL(window.location.href).searchParams;
        const currentPin = searchParams.get('pin') || pinInput;
        
        const res = await fetch(`/api/member/${code}${currentPin ? `?pin=${currentPin}` : ''}`);
        const json = await res.json();

        if (!res.ok) {
          setError(json.error || '정보를 불러오지 못했습니다.');
        } else {
          // 본인 QR 스캔 시 마이페이지로 이동
          if (json.viewerRole === 'self') {
            router.replace('/me');
            return;
          }
          setData(json);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('서버와 통신 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [code, router, pinInput]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0D10]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0D10] text-white gap-6 px-6">
        <QrCode className="w-16 h-16 text-white/20" />
        <h1 className="text-2xl font-black">유효하지 않은 코드입니다</h1>
        <p className="text-white/50 text-sm text-center">이 QR 코드는 만료되었거나 존재하지 않습니다.</p>
        <Button asChild className="bg-[#D4AF37] text-black font-black hover:bg-[#D4AF37]/80">
          <Link href="/">홈으로</Link>
        </Button>
      </div>
    );
  }

  const { member, viewerRole } = data;

  // ─── 파트너 전용 뷰 ───────────────────────────────────────────
  if (viewerRole === 'partner') {
    return (
      <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-6"
        >
          {/* 파트너 확인 헤더 */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/30 mb-4">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Partner Verification</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">고객 확인</h1>
          </div>

          {/* 회원 카드 */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-6">
            {/* 회원 정보 */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center border border-[#D4AF37]/20">
                <User className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-2xl font-black text-white tracking-tight">{member.name}</p>
                <p className="text-sm text-white/40 font-medium">{GRADE_LABELS[member.grade] || member.grade} · {member.tier}</p>
              </div>
            </div>

            <div className="h-px bg-white/10" />

            {/* 소개 정보 */}
            <div className="space-y-3">
              {member.referrerName ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40 font-medium uppercase tracking-widest">소개인</span>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-black text-green-400">{member.referrerName} 회원 소개</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40 font-medium uppercase tracking-widest">유입 경로</span>
                  <span className="text-sm font-bold text-white/60">직접 방문</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40 font-medium uppercase tracking-widest">회원 코드</span>
                <span className="text-xs font-black text-[#D4AF37] tracking-widest">{member.referralCode}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40 font-medium uppercase tracking-widest">회원 가입일</span>
                <span className="text-sm font-bold text-white/60">
                  {new Date(member.memberSince).toLocaleDateString('ko-KR')}
                </span>
              </div>

              {member.latestDiagnosisScore !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40 font-medium uppercase tracking-widest">최근 회복 점수</span>
                  <span className="text-sm font-black text-[#D4AF37]">{member.latestDiagnosisScore}점</span>
                </div>
              )}
            </div>

            <div className="h-px bg-white/10" />

            {/* 방문 확인 버튼 */}
            {!visitConfirmed ? (
              <Button
                onClick={() => setVisitConfirmed(true)}
                className="w-full h-14 rounded-2xl bg-[#D4AF37] text-black font-black text-sm uppercase tracking-widest hover:bg-[#D4AF37]/80 active:scale-95 transition-all"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                방문 확인 완료
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-14 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-black text-sm uppercase tracking-widest">방문 확인 완료</span>
              </motion.div>
            )}
          </div>

          <p className="text-center text-white/20 text-[10px] font-medium">
            Youniqle · Authenticated Member Card
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── [NEW] 범용 메디컬 패스 뷰 (PIN 인증 전/후) ───────────────────
  if (isMedicalMode) {
    if (!data.isMedicalAuthenticated) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm space-y-8 text-center">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto text-secondary shadow-inner">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-black text-obsidian tracking-tighter italic">MEDICAL PASS</h1>
              <p className="text-foreground/70 text-sm font-medium">데이터 보호를 위해 환자의 <br />보안 PIN 번호 4자리를 입력해주세요.</p>
            </div>
            <div className="flex justify-center gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`w-14 h-16 border-2 rounded-2xl flex items-center justify-center text-2xl font-black transition-all ${pinInput.length > i ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-line bg-surface text-slate-300'}`}>
                  {pinInput[i] ? '●' : ''}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 px-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'back'].map((num, i) => (
                <Button key={i} variant="ghost" onClick={() => {
                  if (num === 'back') setPinInput(p => p.slice(0, -1));
                  else if (num !== '' && pinInput.length < 4) setPinInput(p => p + num);
                }} className="h-16 font-black text-obsidian hover:bg-slate-100 rounded-2xl text-xl">
                  {num === 'back' ? '←' : num}
                </Button>
              ))}
            </div>
            <Button onClick={() => window.location.reload()} disabled={pinInput.length < 4} className="w-full h-14 rounded-2xl bg-secondary text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-100">보고서 열람하기</Button>
          </motion.div>
        </div>
      );
    }

    const history = data.medicalHistory || [];
    const clinicalData = data.preConsultation;
    const currentReport = history[selectedReportIdx];

    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 pb-32">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-line flex items-center justify-center text-secondary">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-obsidian tracking-tighter italic">DIGITAL MEDICAL PASS</h2>
                <div className="flex items-center gap-2 mt-1">
                   <Badge className="bg-secondary-container text-secondary border-none text-[10px] font-black uppercase">Verified Patient</Badge>
                   <span className="text-foreground/70 text-xs font-bold">{member.name} • {member.referralCode}</span>
                </div>
              </div>
            </div>
            <div className="bg-secondary text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-100 font-bold text-xs uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Auth Success
            </div>
          </div>

          {/* New Tab System */}
          <div className="flex bg-slate-100 p-1.5 rounded-[24px] w-full max-w-md">
            <button 
              onClick={() => setActiveTab('clinical')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === 'clinical' ? 'bg-white text-secondary shadow-sm' : 'text-foreground/70 hover:text-obsidian'}`}
            >
              <ShieldCheck className="w-4 h-4" /> 사전 문진 리포트
            </button>
            <button 
              onClick={() => setActiveTab('psychology')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === 'psychology' ? 'bg-white text-secondary shadow-sm' : 'text-foreground/70 hover:text-obsidian'}`}
            >
              <Activity className="w-4 h-4" /> 회복 성향 분석
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {activeTab === 'clinical' ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {clinicalData ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Medical History Card */}
                      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-line space-y-6">
                        <h4 className="flex items-center gap-3 text-lg font-black text-obsidian tracking-tighter uppercase italic">
                          <Activity className="w-5 h-5 text-secondary" /> Medical History
                        </h4>
                        <div className="space-y-4">
                          <div className="p-4 bg-surface rounded-2xl border border-line">
                            <p className="text-[10px] font-black text-foreground/70 uppercase tracking-widest mb-1">과거 경험</p>
                            <p className="text-sm font-bold text-obsidian">
                              {clinicalData.medicalHistory.pastExperience.hasExperience ? `있음: ${clinicalData.medicalHistory.pastExperience.details}` : '없음'}
                            </p>
                          </div>
                          <div className="p-4 bg-surface rounded-2xl border border-line">
                            <p className="text-[10px] font-black text-foreground/70 uppercase tracking-widest mb-1">현재 복용 약물</p>
                            <p className="text-sm font-bold text-obsidian">
                              {clinicalData.medicalHistory.currentMedication.taking ? `있음: ${clinicalData.medicalHistory.currentMedication.details}` : '없음'}
                            </p>
                          </div>
                          <div className="p-4 bg-surface rounded-2xl border border-line">
                            <p className="text-[10px] font-black text-foreground/70 uppercase tracking-widest mb-1">기타 건강 이슈</p>
                            <p className="text-sm font-bold text-obsidian">
                              {clinicalData.medicalHistory.healthStatus.isIssue ? `있음: ${clinicalData.medicalHistory.healthStatus.details}` : '특이사항 없음'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Anxiety & Concerns Card */}
                      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-line space-y-6">
                        <h4 className="flex items-center gap-3 text-lg font-black text-obsidian tracking-tighter uppercase italic">
                          <ShieldCheck className="w-5 h-5 text-secondary" /> Focus Point
                        </h4>
                        <div className="space-y-4">
                          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                            <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2">집중 중점 관리 및 불안 지점</p>
                            <div className="flex flex-wrap gap-2">
                              {(clinicalData.anxiety.points || []).map((p: string, i: number) => (
                                <Badge key={i} className="bg-white text-secondary border-emerald-100 font-bold px-3 py-1">{p}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 bg-surface rounded-2xl border border-line">
                            <p className="text-[10px] font-black text-foreground/70 uppercase tracking-widest mb-1">상세 안내 요청 및 보안</p>
                            <p className="text-sm font-bold text-obsidian">{clinicalData.anxiety.privacyDetails || '특이사항 없음'}</p>
                          </div>
                          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                            <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">환자 성향 분류</p>
                            <p className="text-sm font-black text-indigo-900">{clinicalData.anxiety.classifiedType || '미분류'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expectations Card */}
                    <div className="bg-indigo-900 text-white rounded-[40px] p-10 shadow-xl space-y-8 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                       <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                         <div className="space-y-4">
                            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest leading-none">Treatment Expectations</p>
                            <h5 className="text-2xl font-black tracking-tight">{clinicalData.expectation.changeScale} 지향</h5>
                            <p className="text-indigo-100/60 text-sm font-medium">선호 회복 기간: {clinicalData.expectation.downtime}</p>
                         </div>
                         <div className="space-y-4">
                            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest leading-none">Important Schedule</p>
                            <p className="text-sm font-bold">
                              {clinicalData.expectation.importantEvent.hasEvent ? `일정 있음: ${clinicalData.expectation.importantEvent.details}` : '중요 일정 없음'}
                            </p>
                            <div className="h-px bg-white/10 w-full my-4" />
                            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest leading-none">Visit Plan</p>
                            <p className="text-xs text-indigo-100/70">
                               동반자 {clinicalData.visitPlan.companion.hasCompanion ? clinicalData.visitPlan.companion.details : '없음'} • 
                               이동지원 {clinicalData.visitPlan.transportation.needsHelp ? '필요' : '직접'} • 
                               {clinicalData.visitPlan.privacyRoute.wantsPrivacy ? '프라이빗 경로 선호' : '일반 경로'}
                            </p>
                         </div>
                       </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-[40px] p-20 text-center shadow-sm border border-line flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center text-slate-200">
                      <ShieldCheck className="w-10 h-10" />
                    </div>
                    <p className="text-foreground/70 font-bold">작성된 사전 문진 데이터가 없습니다.</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-line">
                      <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6 px-1">Consultation History</h4>
                      <div className="space-y-2">
                        {history.map((h: any, idx: number) => (
                          <button key={idx} onClick={() => setSelectedReportIdx(idx)} className={`w-full text-left p-4 rounded-2xl transition-all ${selectedReportIdx === idx ? 'bg-indigo-50 border-2 border-secondary/30' : 'bg-surface border-2 border-transparent hover:bg-slate-100'}`}>
                            <p className={`text-xs font-black ${selectedReportIdx === idx ? 'text-indigo-900' : 'text-obsidian'}`}>{h.type === 'PRECISION' ? '정밀 리듬체크' : '간편 리듬체크'}</p>
                            <p className="text-[10px] font-bold text-foreground/70 mt-1">{new Date(h.createdAt).toLocaleDateString()}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-8 space-y-6">
                    {currentReport ? (
                      <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="bg-indigo-900 text-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                          <div className="relative z-10 space-y-6">
                            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">Recovery Score Dashboard</p>
                            <div className="flex items-baseline gap-2">
                              <span className="font-black tracking-tighter text-xl">{currentReport.totalScore}</span>
                              <span className="text-2xl font-bold opacity-40">/ 100</span>
                            </div>
                            <h3 className="text-2xl font-black tracking-tight leading-none">{currentReport.resultTitle}</h3>
                            <p className="text-indigo-100/60 font-medium leading-relaxed max-w-md">{currentReport.resultDescription}</p>
                          </div>
                        </div>

                        {/* Category Scores */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {currentReport.categoryScores && Object.entries(currentReport.categoryScores).map(([key, value]: any) => (
                            <div key={key} className="bg-white p-6 rounded-[28px] shadow-sm border border-line text-center">
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">{key}</p>
                              <p className={`text-2xl font-black ${value < 50 ? 'text-rose-500' : 'text-secondary'}`}>{value}</p>
                            </div>
                          ))}
                        </div>

                        {/* AI Solution */}
                        {currentReport.aiSolution && (
                          <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[40px] space-y-4">
                             <h4 className="flex items-center gap-2 text-secondary text-lg font-black tracking-tighter">
                                <Sparkles className="w-5 h-5" /> 성향 분석 솔루션 요약
                             </h4>
                             <p className="text-sm font-medium text-emerald-900/80 leading-relaxed">{currentReport.aiSolution.analysis}</p>
                          </div>
                        )}

                        {/* Standard Answers (Collapsible) */}
                        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-line">
                          <h4 className="text-lg font-black text-obsidian tracking-tighter mb-8">상세 성향 분석 항목</h4>
                          <div className="space-y-6">
                            {(currentReport.answers || []).map((ans: any, i: number) => (
                              <div key={i} className="flex gap-6 pb-6 border-b border-slate-50 last:border-none">
                                <div className="w-2 h-2 rounded-full bg-indigo-200 mt-2 shrink-0" />
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-foreground/70 uppercase tracking-widest">{ans.category}</p>
                                  <p className="text-sm font-black text-obsidian">{ans.question}</p>
                                  <p className="text-sm font-bold text-secondary mt-1">답변: {ans.answer}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center py-20 text-foreground/70">분석 데이터를 선택해 주세요.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── 일반 방문자(초대장) 뷰 ──────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6 text-center"
      >
        <div className="space-y-4">
          <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-3xl flex items-center justify-center mx-auto border border-[#D4AF37]/20">
            <Sparkles className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">
            {member.name}님의 초대장
          </h1>
          <p className="text-white/50 text-sm leading-relaxed">
            {member.name}님이 Youniqle에 초대합니다.<br />
            가입하고 번아웃 회복을 시작해보세요.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 space-y-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40 uppercase tracking-widest">초대인</span>
            <span className="text-sm font-black text-white">{member.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40 uppercase tracking-widest">추천 코드</span>
            <span className="text-xs font-black text-[#D4AF37] tracking-widest">{member.referralCode}</span>
          </div>
        </div>

        <Button
          asChild
          className="w-full h-16 rounded-2xl bg-[#D4AF37] text-black font-black text-sm uppercase tracking-widest hover:bg-[#D4AF37]/80 active:scale-95 transition-all"
        >
          <Link href={`/auth/signup?ref=${member.referralCode}`}>
            지금 가입하기
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>

        <p className="text-white/20 text-[10px]">
          Youniqle · Private Invitation
        </p>
      </motion.div>
    </div>
  );
}
