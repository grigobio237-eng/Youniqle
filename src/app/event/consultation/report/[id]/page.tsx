'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ChevronLeft, ShieldCheck, HeartPulse, UserCircle, Target, CheckCircle2, Sparkles, ClipboardCheck, Stethoscope, AlertTriangle, Activity, Coffee, Gem, Info } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';

export default function ReportPage({ params: originalParams }: { params: { id: string } }) {
  const params = useParams() || originalParams;
  const router = useRouter();
  const { addToast } = useToast();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [params.id]);

  const fetchReport = async (isRetry = false, pswd?: string) => {
    let pollInterval: NodeJS.Timeout;
    try {
      if (!isRetry) setLoading(true);
      
      const headers: any = {};
      const currentPassword = pswd || password;
      if (currentPassword) {
        headers['x-clinic-password'] = currentPassword;
      }

      const res = await fetch(`/api/consultation/${params.id}`, { headers });
      
      if (res.status === 403) {
        setShowPasswordPrompt(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error('리포트를 불러올 권한이 없거나 존재하지 않습니다.');
      }

      const json = await res.json();
      setData(json.consultation);
      setShowPasswordPrompt(false);

      if (!json.consultation.aiGuide) {
        setIsAnalyzing(true);
        pollInterval = setInterval(async () => {
          const pollRes = await fetch(`/api/consultation/${params.id}`, { headers });
          if (pollRes.ok) {
            const pollJson = await pollRes.json();
            if (pollJson.consultation.aiGuide) {
              setData(pollJson.consultation);
              setIsAnalyzing(false);
              clearInterval(pollInterval);
            }
          }
        }, 3000);
      } else {
        setIsAnalyzing(false);
      }
    } catch (err: any) {
      addToast({ title: '오류', description: err.message, variant: 'error' });
    } finally {
      if (!isRetry) setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    await fetchReport(false, password);
    setIsVerifying(false);
  };

  if (showPasswordPrompt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-mist px-4">
        <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-xl space-y-4 text-center border border-primary/10">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="font-black text-obsidian tracking-tight text-xl">병원 보안 액세스</h2>
            <p className="text-slate font-medium text-xs">
              리포트 열람을 위해<br/>고유 코드를 입력해주세요.
            </p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="고유 코드"
              className="w-full h-12 px-4 bg-mist border-none rounded-xl focus:ring-2 focus:ring-primary text-center font-bold text-base tracking-widest outline-none"
              autoFocus
            />
            <Button 
              type="submit" 
              disabled={isVerifying || !password}
              className="w-full h-12 bg-obsidian text-white rounded-xl font-bold text-base hover:scale-[1.02] transition-all shadow-md"
            >
              {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : '승인'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-mist">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
        <p className="text-slate font-bold animate-pulse text-xs">리포트 정밀 분석 중...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-mist">
        <h2 className="text-lg font-bold mb-3">리포트를 찾을 수 없습니다.</h2>
        <Button onClick={() => router.back()}>돌아가기</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      {/* Header Nav */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-line px-3 py-2 flex items-center justify-between">
        <button onClick={() => router.push('/')} className="p-2 -ml-2 text-slate hover:text-primary transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-obsidian text-sm">VIP 맞춤 설계 분석</h1>
        <div className="w-8" />
      </div>

      <div className="max-w-md mx-auto p-3 space-y-3 mt-2">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-line flex items-center gap-3">
          {data.user?.image ? (
            <img src={data.user.image} alt={data.user.name} className="w-12 h-12 rounded-full border border-line" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-mist flex items-center justify-center text-primary">
              <UserCircle className="w-7 h-7" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-lg font-black">{data.user?.name || '익명'}님</h2>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                {data.medicalCategory}
              </span>
            </div>
            <p className="text-[10px] text-slate">{new Date(data.createdAt).toLocaleDateString('ko-KR')}</p>
          </div>
        </div>

        {/* 1. Chief Complaint & VAS */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-line">
          <h3 className="flex items-center gap-1.5 font-black text-obsidian mb-3 text-sm">
            <Activity className="text-primary w-4 h-4" /> 주요 증상 및 통증
          </h3>
          <div className="space-y-2">
            <div className="bg-mist p-3 rounded-xl">
              <p className="text-[10px] text-slate font-bold mb-1">불편하신 부위 및 증상</p>
              <p className="font-medium text-xs text-obsidian">{data.chiefComplaint?.symptom || '기재 안됨'}</p>
            </div>
            <div className="flex items-center justify-between bg-mist p-3 rounded-xl">
              <div>
                <p className="text-[10px] text-slate font-bold mb-1">지속 기간</p>
                <p className="font-medium text-xs text-obsidian">{data.chiefComplaint?.duration || '알 수 없음'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate font-bold mb-1">통증 지수 (VAS)</p>
                <div className="flex items-end gap-1 justify-end">
                  <span className="font-black text-primary leading-none text-xl">{data.chiefComplaint?.vasScore || 0}</span>
                  <span className="text-[10px] font-bold text-slate mb-0.5">/ 10</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Dynamic Answers */}
        {data.dynamicAnswers && data.dynamicAnswers.q1 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-line">
            <h3 className="flex items-center gap-1.5 font-black text-obsidian mb-3 text-sm">
              <Target className="text-primary w-4 h-4" /> 심층 문진 내역
            </h3>
            <div className="space-y-3">
              {[
                { q: data.dynamicAnswers.q1, a: data.dynamicAnswers.a1 },
                { q: data.dynamicAnswers.q2, a: data.dynamicAnswers.a2 }
              ].map((ans: any, idx: number) => ans.q && (
                <div key={idx} className="space-y-1.5">
                  <div className="bg-obsidian text-white p-2.5 rounded-xl rounded-tl-none text-[11px] font-medium inline-block max-w-[90%]">
                    Q. {ans.q}
                  </div>
                  <div className="bg-primary/10 text-obsidian p-2.5 rounded-xl rounded-tr-none text-[11px] font-medium block max-w-[90%] ml-auto">
                    A. {ans.a || '답변 없음'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Medical History & Allergies */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-line">
          <h3 className="flex items-center gap-1.5 font-black text-obsidian mb-3 text-sm">
            <HeartPulse className="text-status-good w-4 h-4" /> 필수 건강 정보
          </h3>
          <div className="space-y-2">
            {data.medicalHistory?.allergies?.has ? (
              <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-100 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-700 text-[11px]">알레르기 보유</p>
                  <p className="text-[11px] text-red-600 mt-0.5">{data.medicalHistory.allergies.details}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 p-2.5 bg-mist rounded-xl text-[11px] font-medium text-slate">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-good" /> 알레르기 없음
              </div>
            )}

            <div className="p-2.5 bg-mist rounded-xl space-y-0.5">
              <p className="text-[10px] text-slate font-bold">과거 수술/시술 이력</p>
              <p className="text-[11px] text-obsidian font-medium">{data.medicalHistory?.pastSurgery?.has ? data.medicalHistory.pastSurgery.details : '특이사항 없음'}</p>
            </div>
            
            <div className="p-2.5 bg-mist rounded-xl space-y-0.5">
              <p className="text-[10px] text-slate font-bold">현재 복용 약물</p>
              <p className="text-[11px] text-obsidian font-medium">{data.medicalHistory?.currentMedication?.taking ? data.medicalHistory.currentMedication.details : '복용약 없음'}</p>
            </div>
          </div>
        </div>

        {/* 4. Lifestyle & Expectation */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-line">
          <h3 className="flex items-center gap-1.5 font-black text-obsidian mb-3 text-sm">
            <Coffee className="text-chapter-accent w-4 h-4" /> 라이프스타일 및 기대치
          </h3>
          <div className="space-y-2 text-[11px] font-medium text-obsidian">
            <div className="flex justify-between items-center py-1.5 border-b border-line">
              <span className="text-slate">일상생활 지장 정도</span>
              <span>{data.lifestyle?.dailyImpact || '기재 안됨'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-line">
              <span className="text-slate">주된 컨디션 저하</span>
              <span>{data.lifestyle?.conditionDrops || '기재 안됨'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-line">
              <span className="text-slate">치료 방향 선호</span>
              <span className="text-primary font-bold">{data.expectation?.preferredTreatment || '기재 안됨'}</span>
            </div>
            <div className="pt-1.5">
              <span className="text-slate block mb-1.5 text-[10px] font-bold">주요 우려 사항</span>
              <div className="flex flex-wrap gap-1.5">
                {data.expectation?.concerns?.map((c: string) => (
                  <span key={c} className="px-2 py-0.5 bg-chapter-accent/10 text-chapter-accent text-[10px] rounded">{c}</span>
                )) || <span className="text-slate">없음</span>}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Visit & Investment */}
        <div className="bg-obsidian text-white rounded-2xl p-4 shadow-lg border border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl -mr-12 -mt-12" />
          
          <h3 className="flex items-center gap-1.5 font-black mb-4 relative z-10 text-sm">
            <Gem className="text-primary w-4 h-4" /> VIP 방문 설계 및 예산
          </h3>
          
          <div className="space-y-3 relative z-10">
            {/* Budget Card */}
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
              <p className="text-[10px] text-white/60 font-bold mb-1">선택된 프리미엄 예산 범위</p>
              <p className="text-base font-black text-primary">
                {data.investment?.premiumBudget || '기재 안됨'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <p className="text-[9px] text-white/50 font-bold mb-0.5">동행자 여부</p>
                <p className="text-[11px] font-medium">{data.visitPlan?.companion?.has ? data.visitPlan.companion.details : '나홀로 방문'}</p>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <p className="text-[9px] text-white/50 font-bold mb-0.5">진료실 요청사항</p>
                <p className="text-[11px] font-medium truncate">{data.visitPlan?.specialRequest || '특이사항 없음'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 6. AI Smart Guide */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent rounded-2xl p-4 border border-primary/10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-obsidian">AI 매니저 가이드</h2>
              <p className="text-[9px] text-slate font-bold uppercase tracking-widest">Tailored strategy</p>
            </div>
          </div>

          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-6">
               <Loader2 className="w-6 h-6 text-primary animate-spin mb-3" />
               <p className="text-[11px] text-obsidian font-bold">정밀 분석 생성 중...</p>
               <p className="text-[10px] text-slate mt-1">약 20초 정도 소요됩니다.</p>
            </div>
          ) : data.aiGuide ? (
            <div className="space-y-4">
              <p className="text-[11px] font-medium leading-relaxed italic bg-white p-3 rounded-xl shadow-sm border border-line text-obsidian">
                "{data.aiGuide.analysis}"
              </p>
              
              <div>
                <h3 className="text-[11px] font-black flex items-center gap-1.5 mb-2 px-1 text-obsidian">
                  <ClipboardCheck className="w-3.5 h-3.5 text-primary" /> 의료진 확인 필수 질문
                </h3>
                <div className="space-y-2">
                  {data.aiGuide.mustAskQuestions.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-line">
                      <p className="font-bold text-[11px] text-obsidian mb-1.5"><span className="text-primary mr-1">Q.</span>{item.question}</p>
                      <p className="text-[10px] text-slate bg-mist p-1.5 rounded-lg">{item.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-black flex items-center gap-1.5 mb-2 px-1 text-obsidian">
                  <Stethoscope className="w-3.5 h-3.5 text-primary" /> 성공적인 회복을 위한 팁
                </h3>
                <ul className="space-y-1.5">
                  {data.aiGuide.hospitalTips.map((tip: string, idx: number) => (
                    <li key={idx} className="flex gap-1.5 text-[10px] font-medium bg-white p-2.5 rounded-lg border border-line shadow-sm text-obsidian">
                      <CheckCircle2 className="w-3.5 h-3.5 text-status-good shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-[11px] font-medium text-slate">
              분석 데이터를 불러올 수 없습니다.
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 pb-6">
          <Button 
            className="w-full h-12 bg-primary text-white rounded-xl font-black text-sm shadow-lg shadow-primary/30"
            onClick={() => router.push('/ai-navigator')}
          >
            나의 리커버리 지표 확인하기
          </Button>
        </div>

      </div>
    </div>
  );
}
