'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Activity, 
  Target, 
  ShieldAlert, 
  Zap, 
  MessageSquare, 
  ClipboardList,
  ChevronRight,
  Printer,
  FileText,
  AlertCircle,
  Loader2,
  TrendingUp,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AccessControl } from '@/lib/logic/access-control';

export default function ClinicPatientDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId;
  
  const [loading, setLoading] = useState(true);
  const [consultation, setConsultation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [passError, setPassError] = useState(false);

  useEffect(() => {
    // 세션 스토리지에서 인증 여부 확인
    const authorized = sessionStorage.getItem('clinic_authorized') === 'true';
    const storedPassword = sessionStorage.getItem('clinic_password') || '';
    if (authorized && storedPassword) {
      setIsAuthorized(true);
      fetchPatientData(storedPassword);
    } else {
      setLoading(false);
    }
  }, [userId]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await fetchPatientData(password);
    if (success) {
      setIsAuthorized(true);
      sessionStorage.setItem('clinic_authorized', 'true');
      sessionStorage.setItem('clinic_password', password);
    } else {
      setPassError(true);
      setLoading(false);
      setTimeout(() => setPassError(false), 2000);
    }
  };

  const fetchPatientData = async (pswd?: string) => {
    try {
      const authPassword = pswd || password || sessionStorage.getItem('clinic_password') || '';
      
      // 1. 먼저 해당 유저의 최신 문진 ID를 가져옴
      const listResponse = await fetch(`/api/consultation?userId=${userId}`, {
        headers: { 'x-clinic-password': authPassword }
      });
      
      if (!listResponse.ok) {
        return false;
      }
      
      const listData = await listResponse.json();
      
      if (listData.consultations && listData.consultations.length > 0) {
        const latestId = listData.consultations[0]._id;
        
        // 2. 개별 상세 API를 호출하여 AI 리포트 생성 트리거 (없을 경우 생성함)
        const detailResponse = await fetch(`/api/consultation/${latestId}`, {
          headers: { 'x-clinic-password': authPassword }
        });
        const detailData = await detailResponse.json();
        
        if (detailData.consultation) {
          setConsultation(detailData.consultation);
          return true;
        } else {
          setError('상세 문진 데이터를 불러올 수 없습니다.');
          return false;
        }
      } else {
        setError('해당 사용자의 문진 기록을 찾을 수 없습니다.');
        return false;
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mist">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-slate/60 font-bold">환자 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Password Auth Screen
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-chapter-accent/5 rounded-full blur-[100px] -ml-48 -mb-48" />
        
        <Card className="max-w-md w-full p-10 text-center space-y-8 rounded-[40px] border-none shadow-2xl bg-white/95 backdrop-blur-xl relative z-10">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-obsidian rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-obsidian tracking-tight">의료진 전용 인증</h2>
              <p className="text-slate/60 font-medium text-sm leading-relaxed">
                이 페이지는 의료진 전용 보호 구역입니다.<br/>
                인증을 위한 비밀번호를 입력해주세요.
              </p>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative">
              <input 
                type="password"
                placeholder="비밀번호 입력"
                className={`w-full h-14 bg-mist rounded-2xl px-6 text-center text-2xl font-black tracking-[0.5em] border-2 transition-all outline-none ${passError ? 'border-red-500 animate-shake' : 'border-transparent focus:border-primary/30'}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              {passError && (
                <p className="text-red-500 text-xs font-bold mt-2">비밀번호가 일치하지 않습니다.</p>
              )}
            </div>
            <Button type="submit" className="w-full h-14 rounded-2xl bg-obsidian text-white font-black text-lg hover:scale-[1.02] transition-transform">
              인증 및 데이터 조회
            </Button>
          </form>

          <div className="pt-4 border-t border-line">
            <p className="text-[10px] text-slate/40 font-bold uppercase tracking-widest leading-loose">
              Security Notice: Unauthorized access is strictly prohibited.<br/>
              Patient data is protected by encryption.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mist p-6">
        <Card className="max-w-md w-full p-8 text-center space-y-6 rounded-[32px] border-none shadow-2xl">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-obsidian">접근 제한</h2>
            <p className="text-slate/60 font-medium">{error}</p>
          </div>
          <Button onClick={() => router.back()} className="w-full h-12 rounded-2xl">뒤로 가기</Button>
        </Card>
      </div>
    );
  }

  if (!consultation) return null;

  const { aiGuide, expectation, medicalHistory, anxiety, visitPlan, investment, user } = consultation;

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-obsidian rounded-2xl flex items-center justify-center text-white">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-obsidian text-xl">{user?.name} 님</h1>
                <Badge className="bg-primary/10 text-primary border-none text-[10px] px-2">BLACK PASS</Badge>
              </div>
              <p className="text-xs text-slate/50 font-bold">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.print()} className="h-10 rounded-xl gap-2 text-slate/60 border-slate/20">
              <Printer className="w-4 h-4" /> 인쇄하기
            </Button>
            <Badge variant="outline" className="h-10 px-4 rounded-xl border-primary/20 text-primary font-black uppercase tracking-tighter">
              Patient ID: {userId?.toString().slice(-8)}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Section 1: AI Recovery Design (Top Focus) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 rounded-[40px] border-none shadow-xl bg-obsidian text-mist overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
            <CardHeader className="p-10 pb-4 relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">AI Recovery Design</CardTitle>
              </div>
              <h2 className="text-3xl font-black tracking-tight leading-tight">
                실시간 데이터 기반 <br/>
                <span className="text-primary italic">AI 시술 전 정밀 분석 리포트</span>
              </h2>
            </CardHeader>
            <CardContent className="p-10 pt-0 relative z-10 space-y-8">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-mist/80 leading-relaxed font-medium text-lg whitespace-pre-wrap">
                  {aiGuide?.analysis || "증상 분석 중입니다..."}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiGuide?.hospitalTips?.map((tip: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl">
                    <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-mist/70">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Critical Questions for Clinic */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <Target className="w-5 h-5 text-obsidian" />
              <h3 className="font-black text-obsidian">상담 필수 체크 리스트</h3>
            </div>
            <div className="space-y-4">
              {aiGuide?.mustAskQuestions?.map((item: any, i: number) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="p-6 bg-white rounded-3xl shadow-sm border border-slate/10 space-y-3 group hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary text-white border-none rounded-full w-5 h-5 p-0 flex items-center justify-center text-[10px] font-black">{i+1}</Badge>
                    <h4 className="font-black text-obsidian text-sm">{item.question}</h4>
                  </div>
                  <p className="text-xs text-slate/50 font-bold leading-relaxed pl-7">
                    <span className="text-primary font-black">의도:</span> {item.rationale}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Patient Detailed Data */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate/10 pb-4">
            <h2 className="text-2xl font-black text-obsidian flex items-center gap-3">
              <ClipboardList className="w-6 h-6" /> 문진 상세 데이터
            </h2>
            <div className="text-xs text-slate/40 font-bold uppercase tracking-widest">
              Submission: {new Date(consultation.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Expectation */}
            <DetailCard 
              icon={<TrendingUp className="w-5 h-5" />} 
              title="희망 기대치 및 일정"
              items={[
                { label: '추구하는 변화', value: expectation?.changeScale === 'definite' ? '확실한 변화' : '자연스러운 변화' },
                { label: '희망 다운타임', value: expectation?.downtime },
                { label: '중요 일정 여부', value: expectation?.importantEvent?.hasEvent ? expectation.importantEvent.details : '없음' }
              ]}
            />

            {/* Medical History */}
            <DetailCard 
              icon={<Heart className="w-5 h-5 text-red-500" />} 
              title="과거 병력 및 안전"
              items={[
                { label: '과거 시술 경험', value: medicalHistory?.pastExperience?.hasExperience ? medicalHistory.pastExperience.details : '없음' },
                { label: '현재 복용 약물', value: medicalHistory?.currentMedication?.taking ? medicalHistory.currentMedication.details : '없음' },
                { label: '기저 질환 여부', value: medicalHistory?.healthStatus?.isIssue ? medicalHistory.healthStatus.details : '없음' }
              ]}
              highlight={medicalHistory?.currentMedication?.taking || medicalHistory?.healthStatus?.isIssue}
            />

            {/* Anxiety */}
            <DetailCard 
              icon={<AlertCircle className="w-5 h-5 text-primary" />} 
              title="불안 요소 및 요청"
              items={[
                { label: '집중 케어 포인트', value: anxiety?.points?.join(', ') || '없음' },
                { label: '상세 요청사항', value: anxiety?.privacyDetails || '없음' },
                { label: '시스템 자동 분류', value: anxiety?.classifiedType || '미지정' }
              ]}
            />

            {/* Visit Plan */}
            <DetailCard 
              icon={<Zap className="w-5 h-5 text-primary" />} 
              title="방문 및 프라이버시"
              items={[
                { label: '동반인 여부', value: visitPlan?.companion?.hasCompanion ? visitPlan.companion.details : '혼자 방문' },
                { label: '이동 지원 필요', value: visitPlan?.transportation?.needsHelp ? '귀가 지원 필요' : '필요 없음' },
                { label: '프라이버시 경로', value: visitPlan?.privacyRoute?.wantsPrivacy ? '전용 경로 희망' : '일반 경로' }
              ]}
            />

            {/* Investment */}
            <DetailCard 
              icon={<FileText className="w-5 h-5 text-secondary" />} 
              title="회복 투자 규모"
              items={[
                { label: '예상 예산 범위', value: investment?.budgetRange === 'large' ? '100만원 이상' : investment?.budgetRange === 'medium' ? '50-100만원' : '50만원 미만' },
                { label: '전담 매니저', value: investment?.focusServices?.needsDedicatedManager ? '희망' : '상관없음' },
                { label: '프리미엄 키트', value: investment?.focusServices?.needsPremiumKit ? '희망' : '상관없음' }
              ]}
            />
          </div>
        </section>

        {/* Footer info */}
        <div className="pt-10 text-center">
          <p className="text-slate/30 text-sm font-medium">
            이 정보는 유니클 Black Pass 멤버십의 AI 분석 결과이며, 최종 진료 판단은 의료진의 책임하에 이루어집니다.
          </p>
        </div>
      </main>
    </div>
  );
}

function DetailCard({ icon, title, items, highlight = false }: { icon: React.ReactNode, title: string, items: { label: string, value: string }[], highlight?: boolean }) {
  return (
    <Card className={`rounded-[32px] border-none shadow-sm overflow-hidden ${highlight ? 'bg-red-50/30 ring-1 ring-red-100' : 'bg-white'}`}>
      <CardHeader className="p-6 border-b border-slate/5">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${highlight ? 'bg-red-100 text-red-50' : 'bg-surface text-obsidian'}`}>
            {icon}
          </div>
          <CardTitle className="text-sm font-black text-obsidian">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {items.map((item, i) => (
          <div key={i} className="space-y-1">
            <p className="text-[10px] font-black text-slate/40 uppercase tracking-widest">{item.label}</p>
            <p className="text-sm font-bold text-obsidian/80 leading-relaxed">{item.value || '-'}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
