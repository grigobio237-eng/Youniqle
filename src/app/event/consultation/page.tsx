'use client';

import React, { useState, useEffect } from "react";
import PreProcedureForm from "@/components/event/PreProcedureForm";
import Header from "@/components/layout/Header";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ClipboardList, Sparkles, ArrowRight, FileText, Loader2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AccessControl } from "@/lib/logic/access-control";
import MembershipUpsellDialog from "@/components/auth/MembershipUpsellDialog";
import { useRecovery } from "@/contexts/RecoveryContext";
import { useRouter } from "next/navigation";

export default function ConsultationPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { resetJourney } = useRecovery();
  const [loading, setLoading] = useState(true);
  const [recentReport, setRecentReport] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const userTier = AccessControl.getUserGroup(session?.user);
  const isLocked = userTier !== 'RESTART' && userTier !== 'BLACK';

  useEffect(() => {
    const checkExisting = async () => {
      const action = searchParams?.get('action');
      
      // 새로 작성하기(action=new)인 경우 데이터 조회를 기다리지 않고 즉시 폼 노출
      if (action === 'new' && !isLocked) {
        resetJourney();
        setShowForm(true);
        setLoading(false);
      }

      if (!session?.user?.email) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch('/api/user/status');
        const data = await res.json();
        if (data.activeMedicalGuide) {
          setRecentReport(data.activeMedicalGuide);
        }
      } catch (err) {
        console.error("Failed to fetch user status:", err);
      } finally {
        // action=new가 아닌 경우에만 조회가 끝난 후 로딩 해제
        if (action !== 'new') {
          setLoading(false);
        }
      }
    };
    checkExisting();
  }, [session, searchParams, isLocked]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mist flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-slate font-black animate-pulse uppercase tracking-widest text-xs">Loading Recovery Center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist">
      <div className="pt-4 md:pt-8 pb-20">
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div 
              key="gateway"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-4 max-w-4xl"
            >
              <div className="text-center space-y-6 mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-obsidian text-primary rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                  <Sparkles className="w-3 h-3" /> Professional Consultation
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-obsidian tracking-tighter leading-tight">
                  Perfect <span className="text-primary italic">Recovery</span> Design
                </h1>
                <p className="text-slate font-medium text-xl max-w-2xl mx-auto leading-relaxed">
                  시술은 결과만 보는 것이 아니라 과정을 설계하는 것입니다.<br />
                  유니클과 함께 당신만의 전문적인 회복 여정을 시작하세요.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Status Card */}
                <div className="bg-white border border-line rounded-[40px] p-10 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all group">
                  <div className="w-20 h-20 bg-mist rounded-[30px] flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform">
                    {recentReport ? '📝' : '🔍'}
                  </div>
                  <h3 className="text-2xl font-black text-obsidian mb-4">
                    {recentReport ? '작성된 문진표가 있습니다' : '아직 작성된 문진이 없습니다'}
                  </h3>
                  <p className="text-slate font-medium mb-10 opacity-70">
                    {recentReport 
                      ? '최근 작성된 데이터를 바탕으로 분석된 정밀 리포트를 확인해 보세요.' 
                      : '안전하고 완벽한 시술 결과를 위해 당신의 기대치와 신체 조건을 정밀 분석합니다.'}
                  </p>
                  
                  {recentReport ? (
                    <Button asChild className="w-full h-16 rounded-2xl bg-primary text-background font-black text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                      <Link href={`/event/consultation/report/${recentReport._id}`}>
                        분석 리포트 확인하기 <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => {
                        if (isLocked) {
                          setShowUpsell(true);
                        } else {
                          resetJourney();
                          setShowForm(true);
                        }
                      }} 
                      className="w-full h-16 rounded-2xl bg-obsidian text-white font-black text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      지금 문진 시작하기 <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  )}
                </div>

                {/* Info Card */}
                <div className="bg-white/40 border border-line border-dashed rounded-[40px] p-10 flex flex-col justify-center gap-6">
                  <div className="space-y-4">
                    <h4 className="font-black text-obsidian flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-primary" /> 면담 가이드의 가치
                    </h4>
                    <ul className="space-y-3">
                      {[
                        '시술 전 핵심 불안 요소 정밀 분석',
                        '의료진에게 꼭 물어봐야 할 질문 리스트 생성',
                        'VIP 전용 동선 및 서비스 최적화 설계',
                        '시술 결과의 완성도를 높이는 사후 연계'
                      ].map((item, i) => (
                        <li key={i} className="flex gap-3 items-start text-sm font-medium text-slate">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {recentReport && (
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        if (isLocked) {
                          setShowUpsell(true);
                        } else {
                          resetJourney();
                          setShowForm(true);
                        }
                      }} 
                      className="mt-4 text-primary font-black flex items-center gap-2 hover:bg-primary/5 rounded-xl self-start"
                    >
                      <FileText className="w-4 h-4" /> 새로 작성하기
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="mt-20 p-8 rounded-[32px] bg-obsidian text-white flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-3xl">🤖</div>
                    <div>
                       <h4 className="font-black text-xl mb-1">AI 닥터 내비게이터</h4>
                       <p className="text-primary/70 text-sm font-medium italic">"당신의 데이터가 완벽한 시술을 만듭니다."</p>
                    </div>
                 </div>
                 <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl px-8">
                    <Link href="/ai-navigator">분석 허브로 이동</Link>
                 </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="container mx-auto px-4 max-w-4xl mb-4 md:mb-10 flex justify-between items-center">
                 <Button variant="ghost" onClick={() => {
                    if (searchParams?.get('action') === 'new') {
                      router.back();
                    } else {
                      setShowForm(false);
                    }
                  }} className="text-slate font-bold hover:text-primary px-0">
                    <ArrowRight className="w-5 h-5 mr-1 rotate-180" /> 돌아가기
                 </Button>
                 <div className="text-[10px] font-black text-slate uppercase tracking-[0.5em] opacity-40">Section: Detailed Analysis</div>
              </div>
              <PreProcedureForm />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MembershipUpsellDialog 
        open={showUpsell} 
        onOpenChange={setShowUpsell} 
        title="정밀 회복 설계는 리스타트 등급 전용입니다"
        description="시술 전 정밀 문진과 VIP 맞춤 회복 설계 분석을 이용하시려면 멤버십을 업그레이드하세요."
      />
    </div>
  );
}
