'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Download, ChevronLeft, CalendarClock, ShieldCheck, HeartPulse, UserCircle, Target, CheckCircle2, Sparkles, MessageSquare, ClipboardCheck, Stethoscope } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';

export default function ReportPage({ params: originalParams }: { params: { id: string } }) {
  const params = useParams() || originalParams;
  const router = useRouter();
  const { addToast } = useToast();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const fetchReport = async (isRetry = false) => {
      try {
        if (!isRetry) setLoading(true);
        const res = await fetch(`/api/consultation/${params.id}`);
        if (!res.ok) {
          throw new Error('리포트를 불러올 권한이 없거나 존재하지 않습니다.');
        }
        const json = await res.json();
        setData(json.consultation);

        // 만약 aiGuide가 아직 생성되지 않았다면 분석 중 상태로 설정하고 폴링 시작
        if (!json.consultation.aiGuide) {
          setIsAnalyzing(true);
          if (!pollInterval) {
            pollInterval = setInterval(() => fetchReport(true), 3000); // 3초마다 재시도
          }
        } else {
          setIsAnalyzing(false);
          if (pollInterval) clearInterval(pollInterval);
        }
      } catch (err: any) {
        addToast({ title: '오류', description: err.message, variant: 'error' });
        if (pollInterval) clearInterval(pollInterval);
      } finally {
        if (!isRetry) setLoading(false);
      }
    };

    fetchReport();

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [params.id]);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setDownloading(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = reportRef.current;
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const margin = 15; // 15mm 여백 설정
      const printableHeight = pageHeight - (margin * 2);

      let position = margin;
      let heightLeft = pdfHeight;
      
      // 첫 페이지 렌더링
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pdfWidth, margin, 'F'); 
      pdf.rect(0, pageHeight - margin, pdfWidth, margin, 'F'); 
      
      heightLeft -= printableHeight;
      
      // 다음 페이지 렌더링
      while (heightLeft > 0) {
        position -= printableHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        
        // 위/아래 여백을 하얀색 박스로 가림 (가상 여백)
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfWidth, margin, 'F');
        pdf.rect(0, pageHeight - margin, pdfWidth, margin, 'F');
        
        heightLeft -= printableHeight;
      }
      
      pdf.save(`Recovery_Design_Report_${data.user?.name || 'User'}.pdf`);

      addToast({ title: '성공', description: 'PDF 다운로드가 완료되었습니다.', variant: 'success' });
    } catch (err) {
      console.error(err);
      addToast({ title: '오류', description: 'PDF 변환에 실패했습니다.', variant: 'error' });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-mist">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-slate font-bold animate-pulse text-sm">유니클 리커버리 매니저가 리포트를 정밀 분석하고 있습니다...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-mist">
        <h2 className="text-xl font-bold mb-4">리포트를 찾을 수 없습니다.</h2>
        <Button onClick={() => router.back()}>돌아가기</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* 헤더 액션 */}
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.push('/')} className="text-slate hover:text-primary">
            <ChevronLeft className="w-5 h-5 mr-1" /> 홈으로 가기
          </Button>
          <Button onClick={handleDownloadPdf} disabled={downloading} className="bg-obsidian text-white rounded-xl shadow-lg hover:bg-obsidian/90">
            {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            PDF 다운로드
          </Button>
        </div>

        {/* 리포트 본문 (A4 비율에 가까운 스타일링 적용) */}
        <div 
          ref={reportRef} 
          className="bg-white p-8 md:p-14 shadow-2xl rounded-2xl relative overflow-hidden text-obsidian min-h-[297mm] box-border"
        >
          {/* Header Mark */}
          <div className="absolute top-0 right-10 w-24 h-32 bg-primary/10 rounded-b-full blur-3xl" />
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-chapter-accent" />

          <div className="mb-10 text-center border-b border-line pb-8">
            <h3 className="text-primary font-black tracking-widest uppercase text-sm mb-4">Perfect Recovery Design</h3>
            <h1 className="text-4xl font-black mb-2 tracking-tight">VIP 맞춤 회복 설계 분석</h1>
            <p className="text-slate font-medium">작성일: {new Date(data.createdAt).toLocaleDateString('ko-KR')}</p>
          </div>

          <div className="flex items-center justify-between bg-mist/50 p-6 rounded-2xl mb-10">
            <div className="flex items-center gap-4">
               {data.user?.image ? (
                 <img src={data.user.image} alt={data.user.name} className="w-16 h-16 rounded-full border-2 border-white shadow-md" />
               ) : (
                 <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-2 border-primary/20 text-primary opacity-50 shadow-md">
                   <UserCircle className="w-10 h-10" />
                 </div>
               )}
               <div>
                 <p className="text-sm font-bold text-primary">고객 정보</p>
                 <p className="text-xl font-black">{data.user?.name || '이름 없음'} 님</p>
                 <p className="text-sm text-slate">{data.user?.email}</p>
               </div>
            </div>
            
            <div className="text-right">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-black border border-primary/20">
                {data.anxiety?.classifiedType || '맞춤 회복형'}
              </span>
              {data.navigator && (
                <p className="text-xs text-slate mt-2 hidden print:block">추천 코드: {data.navigator}</p>
              )}
            </div>
          </div>

          <div className="space-y-12">
            
            {/* 1. Expectation */}
            <section>
              <h2 className="text-2xl font-black flex items-center gap-2 mb-4 text-obsidian">
                <Target className="text-primary w-6 h-6" /> 1. 기대 결과 및 일정
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-line rounded-xl">
                  <p className="text-sm text-slate mb-1">원하는 변화 폭</p>
                  <p className="font-bold text-lg">{data.expectation?.changeScale}</p>
                </div>
                <div className="p-4 border border-line rounded-xl">
                  <p className="text-sm text-slate mb-1">허용 다운타임</p>
                  <p className="font-bold text-lg">{data.expectation?.downtime}</p>
                </div>
                <div className="col-span-1 md:col-span-2 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-sm text-slate mb-2">중요한 약속 및 목적</p>
                  {data.expectation?.importantEvent?.hasEvent ? (
                    <p className="font-medium">{data.expectation.importantEvent.details}</p>
                  ) : (
                    <p className="text-slate italic">특별히 지정된 약속 없음</p>
                  )}
                </div>
              </div>
            </section>

             {/* 2. Medical History */}
             <section>
              <h2 className="text-2xl font-black flex items-center gap-2 mb-4 text-obsidian">
                <HeartPulse className="text-status-good w-6 h-6" /> 2. 메디컬 체크 및 안전성 검토
              </h2>
              <ul className="space-y-4">
                <li className="flex gap-4 items-start p-4 rounded-xl border border-line">
                   <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${data.medicalHistory?.pastExperience?.hasExperience ? 'bg-status-amber' : 'bg-line'}`} />
                   <div>
                     <p className="font-bold mb-1">과거 시술 경험 {data.medicalHistory?.pastExperience?.hasExperience ? '(있음)' : '(없음)'}</p>
                     {data.medicalHistory?.pastExperience?.hasExperience && (
                       <p className="text-sm text-slate whitespace-pre-wrap">{data.medicalHistory.pastExperience.details}</p>
                     )}
                   </div>
                </li>
                 <li className="flex gap-4 items-start p-4 rounded-xl border border-line">
                   <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${data.medicalHistory?.currentMedication?.taking ? 'bg-status-amber' : 'bg-line'}`} />
                   <div>
                     <p className="font-bold mb-1">현재 복용 약 / 영양제 {data.medicalHistory?.currentMedication?.taking ? '(있음 - 주의 필!)' : '(특이사항 없음)'}</p>
                     {data.medicalHistory?.currentMedication?.taking && (
                       <p className="text-sm text-status-amber font-medium whitespace-pre-wrap">{data.medicalHistory.currentMedication.details}</p>
                     )}
                   </div>
                </li>
                <li className="flex gap-4 items-start p-4 rounded-xl border border-line">
                   <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${data.medicalHistory?.healthStatus?.isIssue ? 'bg-status-amber' : 'bg-line'}`} />
                   <div>
                     <p className="font-bold mb-1">최근 컨디션 저하 {data.medicalHistory?.healthStatus?.isIssue ? '(있음)' : '(양호함)'}</p>
                     {data.medicalHistory?.healthStatus?.isIssue && (
                       <p className="text-sm text-slate whitespace-pre-wrap">{data.medicalHistory.healthStatus.details}</p>
                     )}
                   </div>
                </li>
              </ul>
            </section>

             {/* 3. Anxiety & Care Points */}
             <section>
              <h2 className="text-2xl font-black flex items-center gap-2 mb-4 text-obsidian">
                <ShieldCheck className="text-chapter-accent w-6 h-6" /> 3. 핵심 불안 요소 및 해결 전략
              </h2>
              <div className="p-5 border border-chapter-accent/20 bg-chapter-accent/5 rounded-xl">
                 <p className="text-sm font-bold text-chapter-accent mb-3">고객이 특히 우려하는 항목</p>
                 <div className="flex flex-wrap gap-2 mb-4">
                   {data.anxiety?.points?.length > 0 ? (
                     data.anxiety.points.map((pt: string) => (
                       <span key={pt} className="px-3 py-1 bg-white border border-chapter-accent/30 rounded-full text-sm font-medium shadow-sm">
                         {pt}
                       </span>
                     ))
                   ) : (
                     <p className="text-sm text-slate">특별히 우려되는 항목 없음</p>
                   )}
                 </div>
                 
                 {data.anxiety?.points?.includes('프라이버시') && (
                   <div className="mt-4 pt-4 border-t border-chapter-accent/20">
                     <p className="text-sm font-bold text-obsidian mb-1">프라이버시 보호 요청 세부내용:</p>
                     <p className="text-sm text-slate whitespace-pre-wrap">{data.anxiety.privacyDetails}</p>
                   </div>
                 )}
              </div>
            </section>

             {/* 4. Visit Environment */}
             <section>
              <h2 className="text-2xl font-black flex items-center gap-2 mb-4 text-obsidian">
                <CalendarClock className="text-reward-gold w-6 h-6" /> 4. VIP 방문 및 동선 설계
              </h2>
               <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-line">
                    <div className="flex-1">
                      <p className="text-sm text-slate font-medium">동반자 유무</p>
                      <p className="font-bold">{data.visitPlan?.companion?.hasCompanion ? '동반자 있음' : '나홀로 방문'}</p>
                    </div>
                    {data.visitPlan?.companion?.details && data.visitPlan?.companion?.details !== 'none' && (
                      <div className="flex-[2] text-sm text-obsidian bg-mist p-3 rounded-lg border border-line">
                        {data.visitPlan.companion.details}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-line">
                    <div className="flex-1">
                      <p className="text-sm text-slate font-medium">교통/숙소 편의 서비스</p>
                      <p className="font-bold">{data.visitPlan?.transportation?.needsHelp ? '필요함' : '자체 해결'}</p>
                    </div>
                    {data.visitPlan?.transportation?.details && data.visitPlan?.transportation?.details !== 'none' && (
                      <div className="flex-[2] text-sm text-obsidian bg-mist p-3 rounded-lg border border-line">
                         {data.visitPlan.transportation.details}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-line">
                    <div className="flex-1">
                      <p className="text-sm text-slate font-medium">프라이버시 동선 요청</p>
                      <p className="font-bold">{data.visitPlan?.privacyRoute?.wantsPrivacy ? 'VIP 전용 조용한 동선 요청' : '일반 동선 무관'}</p>
                    </div>
                    {data.visitPlan?.privacyRoute?.details && data.visitPlan?.privacyRoute?.details !== 'none' && (
                       <div className="flex-[2] text-sm text-obsidian bg-mist p-3 rounded-lg border border-line">
                         {data.visitPlan.privacyRoute.details}
                      </div>
                    )}
                  </div>
               </div>
            </section>

             {/* 5. Investment or Commitment */}
             <section>
               <h2 className="text-2xl font-black mb-4 flex items-center gap-2 text-obsidian">
                 {data.medicalCategory === 'PLASTIC' ? (
                   <>
                    <span className="text-primary text-2xl font-black">₩</span> 5. 투자 예산 및 추가 서비스
                   </>
                 ) : (
                   <>
                    <ClipboardCheck className="text-primary w-7 h-7" /> 5. 회복을 위한 의료적 다짐 및 준비
                   </>
                 )}
               </h2>
               <div className="flex flex-col md:flex-row gap-6 p-6 border-2 border-primary/20 rounded-2xl bg-white shadow-sm">
                 <div className="flex-1">
                   <p className="text-sm font-bold text-slate mb-1">
                     {data.medicalCategory === 'PLASTIC' ? '예상 투자 비용 구간' : '의료진 전달 사항 및 다짐'}
                   </p>
                   <div className={`${data.medicalCategory !== 'PLASTIC' ? 'bg-mist/30 p-4 rounded-xl border border-line mt-2' : ''}`}>
                     <p className={`${data.medicalCategory === 'PLASTIC' ? 'text-2xl font-black text-primary' : 'text-lg font-bold text-obsidian leading-relaxed'}`}>
                       {data.medicalCategory === 'PLASTIC' 
                         ? (data.investment?.budgetRange === 'custom' ? `직접 입력: ${data.investment?.customBudget}` : data.investment?.budgetRange)
                         : (data.investment?.customBudget || '기록된 다짐이 없습니다.')
                       }
                     </p>
                   </div>
                 </div>
                 <div className="w-px bg-line hidden md:block" />
                 <div className="flex-1 space-y-3">
                   <p className="text-sm font-bold text-slate mb-1">요청하신 집중 프리미엄 서비스 연동</p>
                   <div className="flex items-center gap-2 text-sm font-bold">
                     {data.investment?.focusServices?.needsDedicatedManager ? (
                       <span className="text-primary bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">✅ 전담 마크 매니저 배정</span>
                     ) : (
                       <span className="text-slate/40 line-through">전담 마크 매니저 배정</span>
                     )}
                   </div>
                   <div className="flex items-center gap-2 text-sm font-bold">
                     {data.investment?.focusServices?.needsPremiumKit ? (
                       <span className="text-chapter-accent bg-chapter-accent/10 px-3 py-1 rounded-full whitespace-nowrap">✅ 프리미엄 홈 리커버리 키트 추가</span>
                     ) : (
                       <span className="text-slate/40 line-through">프리미엄 리커버리 키트 추가</span>
                     )}
                   </div>
                 </div>
               </div>
             </section>

             {/* 6. AI Smart Guide (Optimized for Lazy Generation) */}
             <section className="animate-in fade-in slide-in-from-bottom-5 duration-1000">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-obsidian rounded-xl flex items-center justify-center text-primary">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-obsidian tracking-tight">유니클 리커버리 매니저 면담 가이드</h2>
                    <p className="text-xs text-slate font-bold uppercase tracking-widest">Tailored consultation strategy</p>
                  </div>
                </div>

                {isAnalyzing ? (
                  <div className="space-y-6">
                    <div className="bg-obsidian/5 p-8 rounded-[32px] border-2 border-dashed border-primary/20 flex flex-col items-center justify-center py-20 text-center">
                       <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                       <h4 className="text-lg font-black text-obsidian mb-2">AI가 환자 맞춤형 회복 리포트를 생성 중입니다</h4>
                       <p className="text-sm text-slate font-medium">최신 증상 데이터를 기반으로 정밀 분석을 수행하고 있습니다. 잠시만 기다려주세요 (약 30초 소요)</p>
                    </div>
                    {/* Skeleton for questions */}
                    <div className="grid grid-cols-1 gap-4 opacity-50">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-24 bg-mist rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  </div>
                ) : data.aiGuide ? (
                  <>
                    <div className="bg-obsidian text-white p-8 rounded-[32px] shadow-xl relative overflow-hidden group mb-8">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
                       <p className="text-lg font-medium leading-relaxed italic opacity-90 relative z-10">
                           &quot;{data.aiGuide.analysis}&quot;
                       </p>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-lg font-black flex items-center gap-2 px-2">
                         <ClipboardCheck className="text-primary w-5 h-5" /> 의료진에게 반드시 질문하세요
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                         {data.aiGuide.mustAskQuestions.map((item: any, idx: number) => (
                           <div key={idx} className="p-6 bg-mist/30 border border-line rounded-2xl hover:border-primary transition-all group">
                             <div className="flex gap-4">
                               <div className="w-8 h-8 bg-white border border-line rounded-lg flex items-center justify-center font-black text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                 {idx + 1}
                               </div>
                               <div className="flex-1">
                                 <p className="text-lg font-black text-obsidian mb-2">{item.question}</p>
                                 <div className="flex flex-col sm:flex-row gap-3 items-start opacity-80 mt-3 bg-primary/5 p-3 rounded-lg border border-primary/10">
                                   <span className="inline-block shrink-0 text-[10px] font-black uppercase text-primary tracking-widest bg-primary/20 px-2 py-1 rounded">Rationale</span>
                                   <p className="text-sm font-semibold leading-relaxed text-slate">{item.rationale}</p>
                                 </div>
                               </div>
                             </div>
                           </div>
                         ))}
                      </div>
                    </div>

                    <div className="mt-10 p-8 bg-primary/5 border-2 border-primary/20 rounded-[32px]">
                      <h3 className="text-lg font-black flex items-center gap-2 mb-6">
                        <Stethoscope className="text-primary w-5 h-5" /> 전문가 상담 팁
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {data.aiGuide.hospitalTips.map((tip: string, idx: number) => (
                          <div key={idx} className="flex gap-3 items-start">
                             <CheckCircle2 className="w-5 h-5 text-status-good shrink-0 mt-0.5" />
                             <p className="text-sm font-medium leading-relaxed">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-10 text-center bg-mist rounded-3xl">
                    <p className="text-slate font-medium">분석 데이터를 불러올 수 없습니다. 다시 시도해주세요.</p>
                  </div>
                )}
             </section>
          </div>

          <div className="mt-16 pt-8 border-t border-line text-center text-slate text-sm font-medium">
             본 보고서는 Youniqle의 최상위 VIP 회복 설계 프레임워크에 기반하여 작성되었습니다.<br/>
             정교한 설계를 통해 부작용을 최소화하고 완벽한 시술 여정을 돕습니다.
          </div>
        </div>

        {/* Action Buttons Section (Optimized) */}
        <div className="py-16 flex flex-col items-center gap-10">
           <div className="text-center space-y-3">
             <h3 className="text-2xl font-black tracking-tight">회복을 위한 다음 단계를 확인하세요</h3>
             <p className="text-slate font-medium italic opacity-70">분석된 데이터를 바탕으로 정밀한 회복 여정이 설계되었습니다.</p>
           </div>
           
           <Button 
             size="lg" 
             className="h-20 px-12 bg-obsidian text-white rounded-[24px] font-black text-xl shadow-2xl hover:scale-105 transition-all group flex items-center gap-4"
             onClick={() => router.push('/ai-navigator')}
           >
             <Sparkles className="w-6 h-6 text-primary group-hover:animate-spin" />
             나의 리커버리 지표 확인하기
           </Button>
           
           <p className="text-[10px] text-slate font-black uppercase tracking-[0.4em] opacity-30">Security Protocol Locked | Confidential Report</p>
        </div>
      </div>
    </div>
  );
}
