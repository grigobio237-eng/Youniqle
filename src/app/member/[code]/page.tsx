'use client';

import { useEffect, useState, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Sparkles, ArrowRight, QrCode, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        const res = await fetch(`/api/member/${code}`);
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
  }, [code, router]);

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

  // ─── 일반 방문자(비회원/일반회원) 뷰 ─────────────────────────
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
