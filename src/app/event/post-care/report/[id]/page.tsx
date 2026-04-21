"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Download,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Calendar,
  Sparkles,
  Info,
  Send
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import Header from "@/components/layout/Header";
import { useAIProgress } from "@/hooks/use-ai-progress";
import { AIProgressOverlay } from "@/components/shared/AIProgressOverlay";
import { AnimatePresence, motion } from "framer-motion";

export default function PostCareReportPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { addToast } = useToast();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);
  const { progress, statusMessage, finish } = useAIProgress(sending);

  useEffect(() => {
    if (!id) return;
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/post-care/${id}`);
        if (!res.ok) throw new Error("리포트를 찾을 수 없습니다.");
        const json = await res.json();
        setData(json.survey);
      } catch (err: any) {
        addToast({ title: "오류", description: err.message, variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const element = reportRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`Recovery_Roadmap_${data.procedureInfo.name}.pdf`);
      addToast({ title: "성공", description: "PDF 다운로드 완료", variant: "success" });
    } catch (err) {
      addToast({ title: "오류", description: "PDF 다운로드 실패", variant: "error" });
    } finally {
      setDownloading(false);
    }
  };

  const handleSendConsultation = async () => {
    if (!question.trim()) return;
    
    setSending(true);
    
    try {
      const res = await fetch('/api/consultation/navigator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: id,
          question: question.trim()
        })
      });

      if (!res.ok) throw new Error("상담 요청 전송에 실패했습니다.");
      
      finish();
      
      setTimeout(() => {
        setIsModalOpen(false);
        setQuestion("");
        addToast({ title: "전송 완료", description: "내비게이터에게 상담 티켓이 전달되었습니다.", variant: "success" });
        setSending(false);
      }, 1000);
      
    } catch (err: any) {
      setSending(false);
      addToast({ title: "오류", description: err.message, variant: "error" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-mist">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-slate font-black animate-pulse uppercase tracking-widest text-xs">Generating Your Recovery Roadmap...</p>
      </div>
    );
  }

  if (!data) return null;

  const roadmap = data.aiRoadmap;

  return (
    <div className="min-h-screen bg-mist pb-24">
      <Header />
      <div className="max-w-4xl mx-auto pt-32 px-4 space-y-8">

        {/* Actions */}
        <div className="flex justify-between items-center bg-white/50 backdrop-blur-md p-4 rounded-[24px] border border-line">
          <Button variant="ghost" onClick={() => router.push('/')} className="text-slate font-bold">
            <ChevronLeft className="w-5 h-5 mr-1" /> 홈으로 이동
          </Button>
          <Button onClick={handleDownloadPdf} disabled={downloading} className="bg-obsidian text-white rounded-xl shadow-lg">
            {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            로드맵 PDF 보관
          </Button>
        </div>

        {/* Report Content */}
        <div
          ref={reportRef}
          className="bg-white p-8 md:p-16 shadow-2xl rounded-[40px] relative overflow-hidden border border-line/20"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -ml-32 -mb-32" />

          {/* Emergency Alert */}
          {roadmap?.isEmergency && (
            <div className="mb-12 p-6 bg-status-danger/10 border-2 border-status-danger rounded-[30px] flex gap-4 items-start animate-pulse">
              <AlertCircle className="w-8 h-8 text-status-danger shrink-0 mt-1" />
              <div className="space-y-1">
                <h2 className="text-xl font-black text-status-danger">[긴급 내원 권장] 상태 정밀 모니터링 필요</h2>
                <p className="text-sm font-medium text-status-danger/80">현재 기록된 증상 수치가 안정 범위를 벗어났습니다. 지체 없이 시술을 받은 병원이나 가까운 응급실로 연락하시기 바랍니다.</p>
                <Button className="mt-4 bg-status-danger text-white rounded-xl" size="sm" onClick={() => window.open('tel:119')}>긴급 연락처 연결</Button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="border-b border-line pb-12 mb-12 text-center relative z-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-1 bg-primary rounded-full" />
              <Sparkles className="w-5 h-5 text-primary" />
              <div className="w-12 h-1 bg-primary rounded-full" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-obsidian tracking-tighter mb-4">
              <span className="text-primary italic">Recovery</span> Roadmap
            </h1>
            <p className="text-slate font-bold text-lg mb-2">{data.procedureInfo.name} | {data.procedureInfo.daysSince}일차 경과</p>
            <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-xs font-black text-slate border border-line px-4 py-2 rounded-full bg-mist/30">
                <Calendar className="w-3.5 h-3.5 text-primary" /> {new Date(data.procedureInfo.date).toLocaleDateString()} 시술
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-slate border border-line px-4 py-2 rounded-full bg-mist/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-good" /> {roadmap?.recoveryPhase || '회복 분석 중'}
              </div>
            </div>
          </div>

          {/* Expert Analysis */}
          <section className="mb-20">
            <div className="bg-obsidian text-white p-10 rounded-[32px] shadow-2xl relative group">
              <div className="absolute top-4 right-6 text-primary opacity-20">
                <Info className="w-12 h-12" />
              </div>
              <h3 className="text-primary text-xs font-black uppercase tracking-[0.3em] mb-4">Advisor Diagnosis</h3>
              <p className="text-xl md:text-2xl font-bold leading-relaxed relative z-10 italic">
                "{roadmap?.statusAnalysis}"
              </p>
            </div>
          </section>

          {/* Roadmap Timeline */}
          <section className="mb-20">
            <h2 className="text-2xl font-black text-obsidian mb-10 flex items-center gap-3">
              <ArrowRight className="w-6 h-6 text-primary" /> 시점별 집중 케어 로드맵
            </h2>
            <div className="space-y-12">
              {roadmap?.timeline?.map((step: any, idx: number) => (
                <div key={idx} className="relative pl-12 group">
                  {/* Line Connector */}
                  {idx !== roadmap.timeline.length - 1 && (
                    <div className="absolute left-[23px] top-12 bottom-[-48px] w-0.5 bg-gradient-to-b from-primary/30 to-transparent group-hover:from-primary transition-all" />
                  )}
                  {/* Circle Pulse */}
                  <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black border-2 border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                    {idx + 1}
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <span className="px-4 py-1.5 bg-obsidian text-primary rounded-xl text-xs font-black tracking-widest">{step.period}</span>
                      <h3 className="text-2xl font-black text-obsidian">{step.goal}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {step.instructions.map((ins: string, i: number) => (
                        <div key={i} className="flex gap-3 items-start p-5 rounded-2xl border border-line bg-mist/10 hover:border-primary/50 transition-colors">
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <p className="text-sm font-medium text-obsidian/80">{ins}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Expert Advice Grid */}
          <section className="mb-20">
            <h2 className="text-2xl font-black text-obsidian mb-8 flex items-center gap-3">
              <ArrowRight className="w-6 h-6 text-primary" /> 전문가의 핵심 제언
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roadmap?.expertAdvice?.map((advice: string, idx: number) => (
                <div key={idx} className="p-6 bg-primary/5 rounded-[28px] border-2 border-dashed border-primary/20">
                  <p className="text-sm font-bold text-obsidian leading-relaxed">{advice}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Footer Footer */}
          <div className="text-center pt-8 border-t border-line">
            <p className="text-[10px] text-slate font-black uppercase tracking-[0.4em] opacity-40 mb-2">Authenticated Recovery Plan Report No. {data._id.toString().slice(-8)}</p>
            <p className="text-xs text-slate/60 font-bold italic">당신의 완벽한 회복이 결과의 완성입니다. - Youniqle Digital Clinic</p>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="py-16 text-center space-y-10">
          <div className="space-y-4">
            <h3 className="text-2xl font-black">로드맵에 대한 궁금증이 있으신가요?</h3>
            <p className="text-slate font-medium text-lg italic opacity-80 max-w-lg mx-auto leading-relaxed">
              전담 리커버리 내비게이터가 당신의 증상을 더 정밀하게 검토하고 일정을 예약해 드립니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setIsModalOpen(true)}
              className="h-20 px-12 bg-obsidian text-white rounded-[24px] font-black text-xl shadow-2xl hover:scale-105 transition-all group border-none"
            >
              <MessageSquare className="w-6 h-6 mr-4 text-primary group-hover:rotate-12 transition-transform" />
              내비게이터에게 상담 요청
            </Button>
          </div>
        </div>
      </div>

      {/* Consultation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !sending && setIsModalOpen(false)}
              className="absolute inset-0 bg-obsidian/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden p-8 md:p-12"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-mist rounded-2xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-obsidian">상담 요청하기</h2>
                    <p className="text-slate text-sm font-medium">내비게이터가 리포트를 분석하여 직접 답변해 드립니다.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate uppercase tracking-widest">상담 내용</label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="시술 후 궁금한 점이나 불편한 증상을 자세히 적어주세요."
                    className="w-full h-48 p-6 bg-mist/50 border border-line rounded-[24px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none text-obsidian font-medium"
                    disabled={sending}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                    disabled={sending}
                    className="flex-1 h-16 rounded-2xl font-bold text-slate"
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleSendConsultation}
                    disabled={sending || !question.trim()}
                    className="flex-[2] h-16 bg-obsidian text-white rounded-2xl font-black text-lg gap-2"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        상담 요청 보내기
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Progress Overlay when sending */}
              <AIProgressOverlay
                active={sending}
                progress={progress}
                message={statusMessage}
                variant="full"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
