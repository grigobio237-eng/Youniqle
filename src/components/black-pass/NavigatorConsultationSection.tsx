'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  MessageCircle, 
  Send, 
  User as UserIcon, 
  Sparkles, 
  ChevronRight,
  Loader2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function NavigatorConsultationSection() {
  const { data: session } = useSession();
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [navigatorInfo, setNavigatorInfo] = useState<any>(null);

  useEffect(() => {
    const fetchNavigator = async () => {
      const navId = (session?.user as any)?.passInfo?.navigatorId || (session?.user as any)?.recentNavigator || (session?.user as any)?.referredBy;
      if (navId && navId !== 'ADMIN') {
        try {
          const res = await fetch(`/api/user/by-code?code=${navId}`);
          if (res.ok) {
            const data = await res.json();
            setNavigatorInfo(data.user);
          }
        } catch (error) {
          console.error('Failed to fetch navigator:', error);
        }
      }
    };
    fetchNavigator();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/consultation/navigator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (res.ok) {
        setShowSuccess(true);
        setQuestion('');
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        alert('문의 전송에 실패했습니다. 다시 시도해 주세요.');
      }
    } catch (error) {
      console.error('Inquiry error:', error);
      alert('오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <MessageCircle className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-obsidian">전담 네비게이터 문의</h2>
        </div>
        <Button variant="ghost" asChild className="text-xs font-black text-slate hover:text-indigo-600 hover:bg-indigo-50 rounded-xl px-4">
          <Link href="/me" className="flex items-center gap-1">
            답변 확인 <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      <Card className="bg-white border-line/80 rounded-[32px] md:rounded-[40px] overflow-hidden shadow-xl shadow-obsidian/5 border-2 border-indigo-50">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left: Navigator Info */}
            <div className="lg:col-span-4 bg-indigo-50/50 p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-indigo-100/50 space-y-8">
              <div className="space-y-4">
                <Badge className="bg-indigo-600 text-white border-none font-black text-[10px] tracking-widest px-3 py-1">YOUR NAVIGATOR</Badge>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md border border-indigo-100 overflow-hidden">
                    {navigatorInfo?.avatar ? (
                      <img src={navigatorInfo.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-8 h-8 text-indigo-200" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-obsidian text-xl">{navigatorInfo?.name || '유니클 네비게이터'}</h3>
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">Personal Curator</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-bold text-slate/70 leading-relaxed break-keep">
                  블랙 패스 멤버십 전담 네비게이터입니다. <br/>
                  회복 리포트, 데이터 분석, 맞춤 솔루션에 대해 무엇이든 물어보세요. 24시간 내에 답변해 드립니다.
                </p>
                <div className="flex items-center gap-2 text-indigo-600">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-wider">Expert Guidance v2.0</span>
                </div>
              </div>
            </div>

            {/* Right: Inquiry Form */}
            <div className="lg:col-span-8 p-8 md:p-10 relative">
              <AnimatePresence>
                {showSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center text-center p-10 space-y-4"
                  >
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-obsidian">문의가 정상적으로 접수되었습니다.</h3>
                    <p className="text-slate font-bold">네비게이터가 내용을 확인한 후 마이페이지를 통해 답변해 드립니다.</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSuccess(false)}
                      className="mt-4 rounded-xl font-black border-line"
                    >
                      확인
                    </Button>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate uppercase tracking-widest ml-1">Message to Navigator</label>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-500 uppercase tracking-tight">
                      <Clock className="w-3 h-3" />
                      Avg. Response: 2~4 Hours
                    </div>
                  </div>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="리포트 내용 중 궁금한 점이나, 현재 회복 상태에 대해 네비게이터에게 상담을 요청하세요."
                    className="w-full h-40 p-6 rounded-3xl bg-mist/50 border-2 border-transparent focus:border-indigo-200 focus:bg-white transition-all outline-none resize-none font-bold text-obsidian placeholder:text-slate/30"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] text-slate/40 font-bold leading-tight break-keep">
                    * 문의 내용은 전담 네비게이터에게만 비공개로 전달되며, <br/>
                    답변 알림은 하단 마이페이지 아이콘에 표시됩니다.
                  </p>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !question.trim()}
                    className="h-16 px-10 rounded-[20px] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-600/20 flex items-center gap-2 group transition-all"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        전송하기
                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
