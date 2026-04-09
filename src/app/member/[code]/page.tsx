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
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto text-indigo-600 shadow-inner">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">MEDICAL PASS</h1>
              <p className="text-slate-500 text-sm font-medium">데이터 보호를 위해 환자의 <br />보안 PIN 번호 4자리를 입력해주세요.</p>
            </div>
            <div className="flex justify-center gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`w-14 h-16 border-2 rounded-2xl flex items-center justify-center text-2xl font-black transition-all ${pinInput.length > i ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-100 bg-slate-50 text-slate-300'}`}>
                  {pinInput[i] ? '●' : ''}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 px-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'back'].map((num, i) => (
                <Button key={i} variant="ghost" onClick={() => {
                  if (num === 'back') setPinInput(p => p.slice(0, -1));
                  else if (num !== '' && pinInput.length < 4) setPinInput(p => p + num);
                }} className="h-16 text-xl font-black text-slate-700 hover:bg-slate-100 rounded-2xl">
                  {num === 'back' ? '←' : num}
                </Button>
              ))}
            </div>
            <Button onClick={() => window.location.reload()} disabled={pinInput.length < 4} className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-100">보고서 열람하기</Button>
          </motion.div>
        </div>
      );
    }

    const history = data.medicalHistory || [];
    const currentReport = history[selectedReportIdx];

    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">DIGITAL MEDICAL PASS</h2>
                <div className="flex items-center gap-2 mt-1">
                   <Badge className="bg-emerald-100 text-emerald-600 border-none text-[10px] font-black uppercase">Verified Patient</Badge>
                   <span className="text-slate-400 text-xs font-bold">{member.name} • {member.referralCode}</span>
                </div>
              </div>
            </div>
            <div className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-100 font-bold text-xs uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Auth Success
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* History Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6 px-1">Consultation History</h4>
                <div className="space-y-2">
                  {history.map((h: any, idx: number) => (
                    <button key={idx} onClick={() => setSelectedReportIdx(idx)} className={`w-full text-left p-4 rounded-2xl transition-all ${selectedReportIdx === idx ? 'bg-indigo-50 border-2 border-indigo-200' : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'}`}>
                      <p className={`text-xs font-black ${selectedReportIdx === idx ? 'text-indigo-900' : 'text-slate-600'}`}>{h.type === 'PRECISION' ? '정밀 진단' : '간편 진단'}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">{new Date(h.createdAt).toLocaleDateString()}</p>
                    </button>
                  ))}
                  {history.length === 0 && <p className="text-center py-10 text-xs font-bold text-slate-300">이력이 없습니다.</p>}
                </div>
              </div>
            </div>

            {/* Main Report Dashboard */}
            <div className="lg:col-span-8 space-y-6">
              {currentReport ? (
                <motion.div key={selectedReportIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {/* Summary Card */}
                  <div className="bg-indigo-900 text-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative z-10 space-y-6">
                      <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">Recovery Score Dashboard</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-7xl font-black tracking-tighter">{currentReport.totalScore}</span>
                        <span className="text-2xl font-bold opacity-40">/ 100</span>
                      </div>
                      <h3 className="text-2xl font-black tracking-tight leading-none">{currentReport.resultTitle}</h3>
                      <p className="text-indigo-100/60 font-medium leading-relaxed max-w-md">{currentReport.resultDescription}</p>
                    </div>
                  </div>

                  {/* Category Scores */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {currentReport.categoryScores && Object.entries(currentReport.categoryScores).map(([key, value]: any) => (
                      <div key={key} className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 text-center">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">{key}</p>
                        <p className={`text-2xl font-black ${value < 50 ? 'text-rose-500' : 'text-indigo-600'}`}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* AI Solution Sections */}
                  {currentReport.aiSolution && (
                    <div className="space-y-4">
                      <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[40px] space-y-4">
                         <div className="flex items-center gap-2 text-emerald-600 mb-2">
                            <Sparkles className="w-5 h-5" />
                            <h4 className="text-lg font-black tracking-tighter">의료 분석 및 솔루션</h4>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed font-medium text-emerald-900/80">
                            <div className="space-y-2">
                               <p className="font-black text-emerald-800">생활 습관 제안</p>
                               <p>{currentReport.aiSolution.lifestyle || currentReport.aiSolution.nutrition}</p>
                            </div>
                            <div className="space-y-2">
                               <p className="font-black text-emerald-800">회복 전략</p>
                               <p>{currentReport.aiSolution.analysis}</p>
                            </div>
                         </div>
                      </div>
                    </div>
                  )}

                  {/* Detailed Answers */}
                  <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
                    <h4 className="text-lg font-black text-slate-900 tracking-tighter mb-8">상세 문진 답변 내역</h4>
                    <div className="space-y-6">
                      {(currentReport.answers || []).map((ans: any, i: number) => (
                        <div key={i} className="flex gap-6 pb-6 border-b border-slate-50 last:border-none">
                          <div className="w-2 h-2 rounded-full bg-indigo-200 mt-2 shrink-0" />
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{ans.category}</p>
                            <p className="text-sm font-black text-slate-800">{ans.question}</p>
                            <p className="text-sm font-bold text-indigo-600 mt-2 tracking-tight">답변: {ans.answer}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-[40px] p-20 text-center shadow-sm border border-slate-100 flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                    <Activity className="w-10 h-10" />
                  </div>
                  <p className="text-slate-400 font-bold">리포트를 선택해주세요.</p>
                </div>
              )}
            </div>
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
