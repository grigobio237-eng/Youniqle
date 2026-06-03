'use client';

import React, { useState, useEffect } from "react";
import PostCareForm from "@/components/event/PostCareForm";
import Header from "@/components/layout/Header";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { HeartPulse, Sparkles, ArrowRight, FileText, Loader2, Activity, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AccessControl } from "@/lib/logic/access-control";
import MembershipUpsellDialog from "@/components/auth/MembershipUpsellDialog";

export default function PostCarePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [recentRoadmap, setRecentRoadmap] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);

  const userTier = AccessControl.getUserGroup(session?.user);
  const isLocked = userTier !== 'RESTART' && userTier !== 'BLACK';

  useEffect(() => {
    const checkExisting = async () => {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/user/status?minimal=true');
        const data = await res.json();
        if (data.activeRecoveryPlan) {
          setRecentRoadmap(data.activeRecoveryPlan);
        }
      } catch (err) {
        console.error("Failed to fetch user status:", err);
      } finally {
        setLoading(false);
      }
    };
    checkExisting();
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mist flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-slate font-black animate-pulse uppercase tracking-widest text-xs">Loading Recovery Roadmap Center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist">
      <Header />
      <main className="pt-32 pb-20">
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
                  <Activity className="w-3 h-3" /> Post-Care Intelligence
                </div>
                <h1 className="font-black text-obsidian tracking-tighter leading-tight text-xl md:text-4xl">
                  Recovery <span className="text-primary italic">Roadmap</span>
                </h1>
                <p className="text-slate font-medium max-w-2xl mx-auto leading-relaxed text-xl">
                  시술은 끝났지만, 결과는 이제부터 시작입니다.<br />
                  유니클이 당신의 회복 데이터를 실시간 분석하여 최적의 경로를 설계합니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Status Card */}
                <div className="bg-white border border-line rounded-[40px] p-10 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all group">
                  <div className="w-20 h-20 bg-mist rounded-[30px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform text-4xl">
                    {recentRoadmap ? '🗺️' : '🔋'}
                  </div>
                  <h3 className="text-2xl font-black text-obsidian mb-4">
                    {recentRoadmap ? '작성된 로드맵이 있습니다' : '아직 작성된 로드맵이 없습니다'}
                  </h3>
                  <p className="text-slate font-medium mb-10 opacity-70">
                    {recentRoadmap 
                      ? '시점별 맞춤 케어 플랜과 회복 일정이 설계되어 있습니다.' 
                      : '현재의 불편함이나 경과를 기록하시면 AI가 최적의 회복 스케줄을 생성합니다.'}
                  </p>
                  
                  {recentRoadmap ? (
                    <Button asChild className="w-full h-16 rounded-2xl bg-chapter-accent text-white font-black text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                      <Link href={`/event/post-care/report/${recentRoadmap._id}`}>
                        로드맵 리포트 확인하기 <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => {
                        if (isLocked) {
                          setShowUpsell(true);
                        } else {
                          setShowForm(true);
                        }
                      }} 
                      className="w-full h-16 rounded-2xl bg-obsidian text-white font-black text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      지금 상태 기록하기 <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  )}
                </div>

                {/* Info Card */}
                <div className="bg-white/40 border border-line border-dashed rounded-[40px] p-10 flex flex-col justify-center gap-6">
                  <div className="space-y-4">
                    <h4 className="font-black text-obsidian flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-chapter-accent" /> 회복 로드맵의 가치
                    </h4>
                    <ul className="space-y-3">
                      {[
                        '시술 후 불편 증상 실시간 데이터 모니터링',
                        '시점별(1/3/7일차) 필수 케어 지침 제공',
                        '이상 징후 발생 시 긴급 대응 가이드',
                        '내비게이터와의 1:1 상담 채널 연동'
                      ].map((item, i) => (
                        <li key={i} className="flex gap-3 items-start text-sm font-medium text-slate">
                          <div className="w-1.5 h-1.5 rounded-full bg-chapter-accent mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {recentRoadmap && (
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        if (isLocked) {
                          setShowUpsell(true);
                        } else {
                          setShowForm(true);
                        }
                      }} 
                      className="mt-4 text-chapter-accent font-black flex items-center gap-2 hover:bg-chapter-accent/5 rounded-xl self-start"
                    >
                      <FileText className="w-4 h-4" /> 새로운 경과 기록하기
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="mt-20 p-8 rounded-[32px] bg-chapter-accent text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-chapter-accent/10">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">🧘</div>
                    <div>
                       <h4 className="font-black mb-1 text-xl">프리미엄 리커버리 케어</h4>
                       <p className="text-white/70 text-sm font-medium italic">"안전한 회복은 정교한 데이터에서 시작됩니다."</p>
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
              <div className="container mx-auto px-4 max-w-4xl mb-10 flex justify-between items-center">
                 <Button variant="ghost" onClick={() => setShowForm(false)} className="text-slate font-bold hover:text-chapter-accent">
                    <ArrowRight className="w-5 h-5 mr-1 rotate-180" /> 돌아가기
                 </Button>
                 <div className="text-[10px] font-black text-slate uppercase tracking-[0.5em] opacity-40">Section: Recovery Monitoring</div>
              </div>
              <PostCareForm />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MembershipUpsellDialog 
        open={showUpsell} 
        onOpenChange={setShowUpsell} 
        title="회복 로드맵 설계는 리스타트 등급 전용입니다"
        description="시술 후 경과 모니터링과 AI 맞춤 회복 로드맵 생성을 이용하시려면 멤버십을 업그레이드하세요."
      />
    </div>
  );
}
