'use client';

import React, { useState } from 'react';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, CheckCircle2, ChevronRight, Smartphone, ShieldAlert, 
  Award, Check, Sun, Users, HelpCircle, ArrowRight, Share2, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SunNudgeFounderLabPage() {
  // --- NextAuth & Router ---
  const { data: session, status } = useSession();
  const router = useRouter();

  // --- States ---
  const [activeTab, setActiveTab] = useState<'free' | 'ticket' | 'pack'>('ticket');

  // Simulator State
  const [simStep, setSimStep] = useState(1);
  const [simActivity, setSimActivity] = useState('');
  const [simTime, setSimTime] = useState('');
  const [simReapply, setSimReapply] = useState('');
  const [simMissedParts, setSimMissedParts] = useState<string[]>([]);
  const [simCompleted, setSimCompleted] = useState(false);

  const toggleMissedPart = (part: string) => {
    if (simMissedParts.includes(part)) {
      setSimMissedParts(simMissedParts.filter(p => p !== part));
    } else {
      setSimMissedParts([...simMissedParts, part]);
    }
  };

  const resetSimulator = () => {
    setSimStep(1);
    setSimActivity('');
    setSimTime('');
    setSimReapply('');
    setSimMissedParts([]);
    setSimCompleted(false);
  };

  // Pre-order / Ticket Form Redirect Handler
  const handlePreorderClick = (type: 'free' | 'ticket') => {
    if (status === 'unauthenticated') {
      alert('로그인 후 사전 예약을 진행하실 수 있습니다.');
      router.push('/login?callbackUrl=/founder-lab/sunnudge');
      return;
    }
    
    // 실제 외부 폼 URL로 이동
    const formUrl = type === 'free' 
      ? 'https://docs.google.com/forms/d/e/1FAIpQLSfw3elXK1yaJDOIgnDCUnJVd3Myy7tMabzbxjpzfiUlPy4BFg/viewform?usp=publish-editor' 
      : 'https://docs.google.com/forms/d/e/1FAIpQLSe_T5FTK-UdKmJYlw3vXBJ20Rr5SLgi3x7n7gLm51-sn0MFxA/viewform?usp=publish-editor';
    window.open(formUrl, '_blank');
  };

  // Simulator Submit handler (Actual DB API call)
  const submitSimulator = async () => {
    if (status === 'unauthenticated') {
      alert('로그인 후 기록을 제출하실 수 있습니다.');
      router.push('/login?callbackUrl=/founder-lab/sunnudge');
      return;
    }

    try {
      const res = await fetch('/api/sunnudge/daily-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityType: simActivity,
          firstApplyTime: simTime,
          didReapply: simReapply,
          missedParts: simMissedParts
        })
      });

      if (res.ok) {
        setSimCompleted(true);
      } else {
        const errData = await res.json();
        alert(errData.error || '기록 저장 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('기록 저장 중 오류가 발생했습니다.');
    }
  };


  return (
    <ChapterWrapper chapter="products" className="min-h-screen bg-[#FDFBF7] text-slate-800 overflow-x-hidden font-sans relative">
      {/* Background Decorative Ambient Sunlight & Sky Breezes (Bright and Active) */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[300px] right-1/4 w-[500px] h-[500px] bg-sky-200/25 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[1200px] left-1/3 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-[400px] right-1/3 w-[500px] h-[500px] bg-amber-100/30 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* 🌟 Zone 1: Hero Section (문제 공감 & 마찰 없는 온보딩 - 밝고 경쾌한 톤) */}
      <section className="relative pt-6 md:pt-24 pb-6 md:pb-32 border-b border-slate-100">
        <div className="container mx-auto px-4 text-center max-w-4xl space-y-4 md:space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> YOUNIQLE Founder Lab 01
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 leading-[1.1] break-keep"
          >
            선크림은 있는데, <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-emerald-600 to-sky-500">
              다시 바르지는 않는 분
            </span>
            을 찾습니다.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-sm md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed break-keep font-semibold"
          >
            YOUNIQLE SunNudge™는 단순한 화장품 한 통을 추가로 더 판매하는 쇼핑몰이 아닙니다. <br className="hidden md:block" />
            정확한 정량 도포를 돕고, 외출 중 손대지 않고 다시 바르고, 간편하게 스마트폰으로 기록하는 <br className="hidden md:block" />
            <strong>7일간의 행동 설계 루틴 키트</strong>를 함께 만들어가는 유니클 1기 공동개발단(Founder) 프로젝트입니다.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 max-w-md mx-auto"
          >
            <Button
              onClick={() => handlePreorderClick('free')}
              className="w-full sm:w-auto px-8 py-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-[0_10px_25px_rgba(5,150,105,0.25)] transition-all duration-300 hover:scale-[1.03]"
            >
              무료 관심자 신청하기
            </Button>
            <Button
              onClick={() => handlePreorderClick('ticket')}
              className="w-full sm:w-auto px-8 py-6 rounded-2xl bg-white hover:bg-amber-50/50 text-amber-700 border-2 border-amber-300 hover:border-amber-400 font-black text-base shadow-[0_10px_25px_rgba(245,158,11,0.05)] transition-all duration-300 hover:scale-[1.03]"
            >
              9,900원 Founder Ticket 참여
            </Button>
          </motion.div>

          <p className="text-[10px] md:text-xs text-slate-400 font-bold">
            ※ 현재 SunNudge™는 제품 생산 전, 1기 공동개발 단원을 안전하게 모집하는 Lab 단계입니다.
          </p>
        </div>
      </section>

      {/* ⚠️ Zone 2-1: 문제 제기 (기존 선크림의 불편함 터치 - 직관적이고 밝은 구성) */}
      <section className="py-8 md:py-28 bg-white/40 backdrop-blur-md">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-4 md:space-y-6">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">The Problem</span>
          <h2 className="text-xl sm:text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight break-keep">
            자외선 차단 지수(SPF)가 아무리 높아도,<br />
            중간에 다시 바르지 않으면 효과가 사라집니다.
          </h2>
          <p className="text-xs md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto break-keep font-medium">
            우리는 누구나 선크림을 가지고 있습니다. 하지만 실제 사용은 다릅니다. 아침에 단 한 번 바르고 끝내며, 야외 활동 중에는 손에 묻혀 덧바르기 찝찝하여 방치합니다. 손등, 귀, 목 등 빼먹기 쉬운 자외선 사각지대는 점점 넓어집니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-6 md:pt-10 text-left">
            <Card className="bg-white border-slate-100 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(245,158,11,0.08)]">
              <span className="text-amber-600 text-xs font-black uppercase tracking-wider block mb-2">01. 사용량의 문제</span>
              <h4 className="text-slate-900 font-extrabold text-lg mb-2">정량을 인지하지 못함</h4>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">효과적인 차단을 위해 필요한 1회 권장 정량을 모른 채 너무 얇게 발라 자외선 방어에 실패합니다.</p>
            </Card>
            <Card className="bg-white border-slate-100 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.08)]">
              <span className="text-emerald-600 text-xs font-black uppercase tracking-wider block mb-2">02. 재도포의 불편함</span>
              <h4 className="text-slate-900 font-extrabold text-lg mb-2">찝찝하고 번거로운 덧바름</h4>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">야외 운동(골프, 테니스, 러닝 등) 도중 더러워진 손으로 선크림을 얼굴에 다시 바르기란 매우 찝찝합니다.</p>
            </Card>
            <Card className="bg-white border-slate-100 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(14,165,233,0.08)]">
              <span className="text-sky-600 text-xs font-black uppercase tracking-wider block mb-2">03. 기록의 부재</span>
              <h4 className="text-slate-900 font-extrabold text-lg mb-2">시각화되지 않는 자외선 자극</h4>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">내 피부가 오늘 얼마만큼의 태양빛 자극을 받았는지 직접 기록하고 추적하는 관리가 없습니다.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* 📦 Zone 2-2: SunNudge 7-Day Routine Kit 소개 (화사하고 밝은 도구 연출) */}
      <section className="py-8 md:py-28 border-b border-slate-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center space-y-4 mb-6 md:mb-16">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">The Solution</span>
            <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tight break-keep">
              행동 변화를 유도하는 7-Day SunNudge™ 루틴 키트
            </h2>
            <p className="text-xs md:text-lg text-slate-600 max-w-xl mx-auto break-keep font-medium">
              단순한 바르는 제품이 아닌, 자외선 노출을 인지하고 기록하도록 돕는 정교한 행동 습관 도구들입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: '선크림 정량 Dose', desc: '1회 도포 시 정확한 권장 사용량을 피부로 실감하게 해주는 일회용 개별 패키지 (제작 예정)' },
              { title: '미니 선스틱', desc: '야외 활동 도중에도 손을 대지 않고 간편하고 산뜻하게 덧바를 수 있는 컴팩트 스틱 (제작 예정)' },
              { title: 'UV 반응 스티커', desc: '자외선 강도에 따라 보라색으로 반응하여 선크림 재도포 타이밍을 눈으로 리마인드하는 패치' },
              { title: '7일 Sun Ticket & QR', desc: '스마트폰 카메라 스캐너로 10초 만에 오늘의 노출량 기록을 남기는 습관 카드' }
            ].map((item, idx) => (
              <div key={idx} className="group relative p-8 rounded-[32px] bg-white border border-slate-100 hover:border-emerald-300 shadow-[0_10px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.05)] transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg mb-6">
                  0{idx + 1}
                </div>
                <h4 className="text-slate-900 font-extrabold text-xl mb-3 group-hover:text-emerald-600 transition-colors">{item.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed font-semibold">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Entry Product 01 & Platform Link (밝은 에메랄드 카드) */}
          <Card className="mt-8 md:mt-16 bg-emerald-50/70 border border-emerald-100 p-5 md:p-10 rounded-[36px] overflow-hidden relative shadow-sm">
            <div className="absolute right-0 bottom-0 w-80 h-80 bg-emerald-200/20 rounded-full blur-[70px] pointer-events-none" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black tracking-wider uppercase">
                  Entry Product 01
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight break-keep">
                  유니클 라이프 회복 데이터 생태계 연결
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-2xl break-keep font-medium">
                  SunNudge™ 7일 챌린지를 마친 습관 기록 데이터는 유니클의 맞춤형 **[오늘 리듬체크]** 및 **[회복 리포트 대시보드]**로 자동 취합됩니다. 일상의 번아웃 극복과 피부 컨디션 회복 루틴을 정성껏 연계 설계해 드립니다.
                </p>
              </div>
              <div className="w-full md:w-auto shrink-0 pt-2 md:pt-0">
                <Button 
                  onClick={() => alert('SunNudge 7일 성공 데이터를 유니클 대시보드와 통합하는 기능 안내입니다.')}
                  className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-6 py-5 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(5,150,105,0.2)]"
                >
                  리커버리 연동 알아보기 <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 📊 Zone 2-3: 참여 단계별 혜택 비교표 (밝은 프리미엄 도록 스타일 테이블) */}
      <section className="py-10 md:py-28 bg-[#F8F6F0]/60">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center space-y-4 mb-8 md:mb-16">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full">Founder Value</span>
            <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tight break-keep">
              1기 Founder 공동개발 혜택안
            </h2>
            <p className="text-xs md:text-lg text-slate-600 max-w-xl mx-auto break-keep font-medium">
              각 단계에 적합한 프리미엄 웰니스 공동개발 혜택을 한눈에 대조해보세요.
            </p>

            {/* Mobile Tab Selectors */}
            <div className="flex lg:hidden bg-slate-200/50 p-1 rounded-2xl max-w-sm mx-auto mt-8 border border-slate-200">
              {[
                { id: 'free', label: '0원 관심자' },
                { id: 'ticket', label: '9,900원 티켓' },
                { id: 'pack', label: '29,800원 팩' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 text-center py-3 text-xs font-black rounded-xl transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white text-amber-700 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="p-6 text-xs sm:text-sm font-black text-slate-700">구분 혜택</th>
                  <th className="p-6 text-xs sm:text-sm font-black text-slate-500 text-center">무료 관심자</th>
                  <th className="p-6 text-xs sm:text-sm font-black text-amber-700 text-center bg-amber-500/5">Founder Credit Ticket</th>
                  <th className="p-6 text-xs sm:text-sm font-black text-emerald-700 text-center">Founder Pack / 공동개발단</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-600 font-semibold">
                <tr>
                  <td className="p-6 font-bold text-slate-800">참여 비용</td>
                  <td className="p-6 text-center text-slate-400">0원</td>
                  <td className="p-6 text-center text-amber-600 font-black bg-amber-500/5">9,900원</td>
                  <td className="p-6 text-center text-emerald-600 font-black">29,800원</td>
                </tr>
                <tr>
                  <td className="p-6 font-bold text-slate-800">제품 디자인 및 방향 투표</td>
                  <td className="p-6 text-center text-emerald-600"><Check className="w-5 h-5 mx-auto font-black" /></td>
                  <td className="p-6 text-center text-emerald-600 bg-amber-500/5"><Check className="w-5 h-5 mx-auto font-black" /></td>
                  <td className="p-6 text-center text-emerald-600"><Check className="w-5 h-5 mx-auto font-black" /></td>
                </tr>
                <tr>
                  <td className="p-6 font-bold text-slate-800">100% 크레딧 전액 전환</td>
                  <td className="p-6 text-center text-slate-300">-</td>
                  <td className="p-6 text-center text-amber-600 font-black bg-amber-500/5">9,900원 스토어 크레딧</td>
                  <td className="p-6 text-center text-slate-400">팩 구성 시 즉각 공제</td>
                </tr>
                <tr>
                  <td className="p-6 font-bold text-slate-800">1차 한정 생산 루틴 키트</td>
                  <td className="p-6 text-center text-slate-300">-</td>
                  <td className="p-6 text-center text-slate-500 bg-amber-500/5">최우선 구매권 제공</td>
                  <td className="p-6 text-center text-emerald-600 font-black">실물 7-Day 키트 선배송</td>
                </tr>
                <tr>
                  <td className="p-6 font-bold text-slate-800">고유 Founder No. 일련번호</td>
                  <td className="p-6 text-center text-slate-300">-</td>
                  <td className="p-6 text-center text-slate-500 bg-amber-500/5">예비 후보군 우선 확보</td>
                  <td className="p-6 text-center text-emerald-600 font-black">정식 한정 번호 발급</td>
                </tr>
                <tr>
                  <td className="p-6 font-bold text-slate-800">가상 QR Sun Check 시뮬레이터</td>
                  <td className="p-6 text-center text-emerald-600"><Check className="w-5 h-5 mx-auto font-black" /></td>
                  <td className="p-6 text-center text-emerald-600 bg-amber-500/5"><Check className="w-5 h-5 mx-auto font-black" /></td>
                  <td className="p-6 text-center text-emerald-600"><Check className="w-5 h-5 mx-auto font-black" /></td>
                </tr>
                <tr>
                  <td className="p-6 font-bold text-slate-800">네이버 밴드 Founder Room</td>
                  <td className="p-6 text-center text-slate-300">-</td>
                  <td className="p-6 text-center text-emerald-600 bg-amber-500/5"><Check className="w-5 h-5 mx-auto font-black" /></td>
                  <td className="p-6 text-center text-emerald-600"><Check className="w-5 h-5 mx-auto font-black" /></td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="p-6 font-black text-slate-900">생산 중단 시 보상 약정</td>
                  <td className="p-6 text-center text-slate-400">해당 없음</td>
                  <td className="p-6 text-center text-amber-600 font-black bg-amber-500/5">100% 즉시 전액 환불</td>
                  <td className="p-6 text-center text-emerald-600 font-black">100% 즉시 전액 환불</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile Card-based Table View */}
          <div className="block lg:hidden mt-6">
            <AnimatePresence mode="wait">
              {activeTab === 'free' && (
                <motion.div
                  key="free"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="bg-white border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <span className="text-slate-400 text-xs font-bold">참여금</span>
                      <span className="text-slate-900 font-black text-lg">0원</span>
                    </div>
                    <ul className="space-y-3 text-xs text-slate-600 font-semibold">
                      <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 제품 구성 및 방향성 투표 가능</li>
                      <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 가상 QR Sun Check 시뮬레이터 이용 가능</li>
                      <li className="flex items-center gap-2.5 text-slate-300"><Check className="w-4 h-4 text-slate-200 shrink-0" /> <span className="line-through">100% 크레딧 전환 불가</span></li>
                      <li className="flex items-center gap-2.5 text-slate-300"><Check className="w-4 h-4 text-slate-200 shrink-0" /> <span className="line-through">실물 패키지 선배송 불가</span></li>
                    </ul>
                    <Button onClick={() => handlePreorderClick('free')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 rounded-xl text-xs">
                      무료 관심자 신청하기
                    </Button>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'ticket' && (
                <motion.div
                  key="ticket"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="bg-white border-amber-300 p-6 rounded-3xl space-y-4 shadow-[0_10px_30px_rgba(245,158,11,0.06)] border-2">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <span className="text-amber-600 text-xs font-black uppercase">참여금</span>
                      <span className="text-amber-500 font-black text-xl">9,900원</span>
                    </div>
                    <ul className="space-y-3 text-xs text-slate-600 font-semibold">
                      <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 9,900원 전액 유니클 스토어 크레딧 100% 환원</li>
                      <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 제품 구성/OEM 진척 상황 공동개발 투표 참가</li>
                      <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 고유 일련번호(Founder No.) 예비 후보 발급</li>
                      <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 1기 비밀 밴드(Founder Room) 입장 권한 부여</li>
                      <li className="flex items-center gap-2.5 text-amber-600 font-black"><Check className="w-4 h-4 text-amber-500 shrink-0" /> 생산 취소/중단 시 100% 전액 안심 환불 보증</li>
                    </ul>
                    <Button onClick={() => handlePreorderClick('ticket')} className="w-full bg-amber-500 hover:bg-amber-400 text-white font-black py-4 rounded-xl text-xs shadow-md">
                      Founder Ticket 결제 참여
                    </Button>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'pack' && (
                <motion.div
                  key="pack"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="bg-white border-emerald-300 p-6 rounded-3xl space-y-4 shadow-[0_10px_30px_rgba(16,185,129,0.06)] border-2">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <span className="text-emerald-600 text-xs font-black uppercase">참여금</span>
                      <span className="text-emerald-500 font-black text-xl">29,800원</span>
                    </div>
                    <ul className="space-y-3 text-xs text-slate-600 font-semibold">
                      <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 7-Day 실물 루틴 키트 1차 전액 무료 선배송</li>
                      <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 정식 고유 일련번호(Founder No.) 1기 영구 부여</li>
                      <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 7일 챌린지 성공 시 리커버리 키트 보상 연계</li>
                      <li className="flex items-center gap-2.5 text-emerald-600 font-black"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> 생산 취소/중단 시 100% 전액 안심 환불 보증</li>
                    </ul>
                    <Button onClick={() => alert('본 Founder Pack(29,800원)은 9,900원 Ticket 참여자분들께 최우선 오픈 및 전환 연계됩니다. 우선 Ticket 신청을 부탁드립니다.')} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl text-xs shadow-md">
                      공동개발단 안내 받기
                    </Button>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 🔄 Zone 3-1: Benefit Unlock (참여자 게이지바 - 밝은 테마) */}
      <section className="py-10 md:py-24 border-b border-slate-100 bg-white/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="bg-white border border-slate-100 p-5 md:p-10 rounded-[36px] space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  함께할수록 커지는 혜택 (Benefit Unlock)
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">현재 1기 공동개발 희망 인원: <span className="text-emerald-600 font-black text-base">142명</span> 신청 완료!</p>
              </div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('주소가 클립보드에 복사되었습니다. 골프/러닝 크루원들에게 링크를 전달해 보세요!');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 px-5 rounded-xl flex items-center gap-1.5 shrink-0"
              >
                <Share2 className="w-4 h-4" /> 크루에게 공유하기
              </Button>
            </div>

            {/* Gauge Bar */}
            <div className="space-y-4 pt-2">
              <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: '47.3%' }} // 142명 / 300명 기준 약 47.3%
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="absolute h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-orange-400 rounded-full"
                />
              </div>
              {/* Scale points */}
              <div className="grid grid-cols-4 text-[10px] md:text-xs text-slate-500 font-bold text-center">
                <div className="text-left flex flex-col items-start">
                  <span className="text-emerald-600 font-black">50명 달성</span>
                  <span className="text-[9px] text-slate-400 font-bold">1차 샘플 제조 (완료)</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-teal-600 font-black">100명 달성</span>
                  <span className="text-[9px] text-slate-400 font-bold">UV 스티커 확정 (완료)</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-slate-600 font-black">200명 목표</span>
                  <span className="text-[9px] text-slate-400 font-bold">리필팩 할인 쿠폰</span>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-slate-600 font-black">300명 최종</span>
                  <span className="text-[9px] text-slate-400 font-bold">Sun Point 보너스</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 📱 Zone 3-2: QR Sun Check 체험형 시뮬레이터 (스마트폰 시뮬레이터도 밝고 상쾌한 테마로 리모델링) */}
      <section className="py-10 md:py-28">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Left Description */}
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> 10-Second QR Checker
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight break-keep">
                스마트폰 QR 스캔 시 만나는 <br />
                10초 썬케어 기록 일기장 미리보기
              </h2>
              <p className="text-xs md:text-base text-slate-600 leading-relaxed break-keep font-medium">
                실물 7-Day 루틴 키트에 인쇄된 고유 QR 칩을 스마트폰으로 스캔하면 열리게 될 **'자외선 노출 기록 일기장'**입니다. 오늘 어떤 야외활동을 하였고, 언제 선크림을 발랐으며, 귀나 목덜미처럼 빼먹기 쉬운 사각지대를 잘 돌보았는지 10초 만에 체크할 수 있습니다. 
                <br /><br />
                우측의 가상 스마트폰 화면을 직접 클릭하여 오늘의 썬체크 습관 기록을 가상으로 시뮬레이션해 보세요!
              </p>
              
              {/* Key Features bullet points */}
              <div className="space-y-3 pt-2">
                {[
                  '야외 활동별 자외선 노출 위험 강도 자동 연동',
                  '자주 빼먹는 사각 부위(귀, 목 뒤, 손등 등) 터치형 안내 패널',
                  '챌린지 성공 시 유니클 웰니스 대시보드로 데이터 100% 통합 자동 동기화'
                ].map((txt, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs md:text-sm text-slate-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{txt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Interactive Phone Simulator (Bright Luxury Phone) */}
            <div className="flex justify-center">
              <div className="relative w-[310px] h-[620px] rounded-[48px] border-[10px] border-zinc-800 bg-[#FCFAF6] shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col justify-between">
                
                {/* Phone Speaker & Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-5 bg-zinc-800 rounded-full z-30 flex items-center justify-center">
                  <div className="w-12 h-1 bg-black rounded-full" />
                </div>

                {/* Phone Content Header (Light theme phone top) */}
                <div className="pt-8 px-4 pb-2 border-b border-slate-100 bg-white flex justify-between items-center z-20">
                  <div className="flex items-center gap-1">
                    <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
                    <span className="text-[9px] font-black tracking-widest text-slate-800">YOUNIQLE SUN CHECK</span>
                  </div>
                  <span className="text-[8px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">SIMULATOR</span>
                </div>

                {/* Phone Screen body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 z-10 scrollbar-none bg-[#FCFAF6]">
                  <AnimatePresence mode="wait">
                    {!simCompleted ? (
                      <motion.div
                        key={simStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4 text-left"
                      >
                        {/* Step 1: 활동 선택 */}
                        {simStep === 1 && (
                          <div className="space-y-3">
                            <span className="text-[9px] text-emerald-600 font-black uppercase tracking-wider block">Step 1 of 4</span>
                            <h4 className="text-slate-800 text-sm font-black leading-tight">오늘 나의 주요 야외 활동 종류는 무엇인가요?</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {['골프 필드', '크루 러닝/산책', '자동차 운전', '캠핑/피크닉', '테니스/서핑', '가벼운 외출'].map(act => (
                                <button
                                  key={act}
                                  onClick={() => setSimActivity(act)}
                                  className={`p-3 text-[11px] font-bold rounded-xl border text-center transition-all ${
                                    simActivity === act 
                                      ? 'bg-emerald-550 bg-emerald-600 text-white border-emerald-650' 
                                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350 hover:text-slate-800 shadow-sm'
                                  }`}
                                >
                                  {act}
                                </button>
                              ))}
                            </div>
                            <Button
                              disabled={!simActivity}
                              onClick={() => setSimStep(2)}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3.5 rounded-xl mt-4 shadow-sm"
                            >
                              다음 단계로 <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </div>
                        )}

                        {/* Step 2: 도포 및 재도포 시간 */}
                        {simStep === 2 && (
                          <div className="space-y-3">
                            <span className="text-[9px] text-emerald-600 font-black uppercase tracking-wider block">Step 2 of 4</span>
                            <h4 className="text-slate-800 text-sm font-black leading-tight">오늘 오전 첫 선크림은 언제 바르셨나요?</h4>
                            <div className="space-y-2">
                              {['오전 8시 이전', '오전 8시 ~ 10시 사이', '오전 10시 ~ 낮 12시 사이', '오늘 아직 안 발랐음'].map(tm => (
                                <button
                                  key={tm}
                                  onClick={() => setSimTime(tm)}
                                  className={`w-full p-3 text-[11px] font-bold rounded-xl border text-left transition-all flex justify-between items-center ${
                                    simTime === tm 
                                      ? 'bg-emerald-600 text-white border-emerald-650' 
                                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350 hover:text-slate-800 shadow-sm'
                                  }`}
                                >
                                  <span>{tm}</span>
                                  {simTime === tm && <Check className="w-3.5 h-3.5" />}
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-2 pt-3">
                              <Button variant="ghost" onClick={() => setSimStep(1)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3.5 rounded-xl border-none">이전</Button>
                              <Button
                                disabled={!simTime}
                                onClick={() => setSimStep(3)}
                                className="flex-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3.5 px-6 rounded-xl"
                              >
                                다음 단계
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Step 3: 외출 중 재도포 여부 */}
                        {simStep === 3 && (
                          <div className="space-y-3">
                            <span className="text-[9px] text-emerald-600 font-black uppercase tracking-wider block">Step 3 of 4</span>
                            <h4 className="text-slate-800 text-sm font-black leading-tight">야외 활동 도중에 선스틱으로 다시 덧바르셨나요?</h4>
                            <div className="grid grid-cols-1 gap-2">
                              {[
                                { id: 'yes', txt: '네! 중간에 1번 이상 다시 발랐어요.' },
                                { id: 'no', txt: '선크림은 있는데 바르는 걸 깜빡했어요.' },
                                { id: 'hand', txt: '손에 묻히기 귀찮고 찝찝해서 안 발랐어요.' }
                              ].map(item => (
                                <button
                                  key={item.id}
                                  onClick={() => setSimReapply(item.id)}
                                  className={`w-full p-3 text-[11px] font-bold rounded-xl border text-left transition-all ${
                                    simReapply === item.id 
                                      ? 'bg-emerald-600 text-white border-emerald-650' 
                                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350 hover:text-slate-800 shadow-sm'
                                  }`}
                                >
                                  {item.txt}
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-2 pt-3">
                              <Button variant="ghost" onClick={() => setSimStep(2)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3.5 rounded-xl border-none">이전</Button>
                              <Button
                                disabled={!simReapply}
                                onClick={() => setSimStep(4)}
                                className="flex-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3.5 px-6 rounded-xl"
                              >
                                다음 단계
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Step 4: 놓치기 쉬운 부위 터치 체크 */}
                        {simStep === 4 && (
                          <div className="space-y-3">
                            <span className="text-[9px] text-emerald-600 font-black uppercase tracking-wider block">Step 4 of 4</span>
                            <h4 className="text-slate-800 text-sm font-black leading-tight">오늘 도포할 때 혹시 놓친 사각지대 부위가 있나요? (중복 선택)</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {['귀 테두리', '광대뼈 양옆', '목 뒷덜미', '양쪽 손등', '정수리 라인', '빼놓지 않고 꼼꼼히 바름!'].map(part => {
                                const isSelected = simMissedParts.includes(part);
                                return (
                                  <button
                                    key={part}
                                    onClick={() => toggleMissedPart(part)}
                                    className={`p-3 text-[10px] font-bold rounded-xl border text-center transition-all ${
                                      isSelected 
                                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm' 
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350 hover:text-slate-800 shadow-sm'
                                    }`}
                                  >
                                    {part}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="flex gap-2 pt-3">
                              <Button variant="ghost" onClick={() => setSimStep(3)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3.5 rounded-xl border-none">이전</Button>
                              <Button
                                onClick={submitSimulator}
                                className="flex-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3.5 px-6 rounded-xl"
                              >
                                습관 일기 제출하기
                              </Button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      /* Success Screen (Light Theme success) */
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-6 space-y-4"
                      >
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold animate-bounce shadow-sm">
                          ✓
                        </div>
                        <h4 className="text-slate-800 text-base font-black">오늘의 썬케어 기록 완료!</h4>
                        <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2 text-left text-[11px] text-slate-600 font-semibold shadow-sm">
                          <p><span className="text-slate-400 font-bold">활동 종류:</span> {simActivity}</p>
                          <p><span className="text-slate-400 font-bold">첫 도포시간:</span> {simTime}</p>
                          <p><span className="text-slate-400 font-bold">재도포 실천:</span> {simReapply === 'yes' ? '실천 성공! 👏' : '기록을 통한 다음 실천'}</p>
                          <p><span className="text-slate-400 font-bold">도포 사각지대:</span> {simMissedParts.length > 0 ? simMissedParts.join(', ') : '없음'}</p>
                        </div>
                        <Card className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-center shadow-sm">
                          <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider block">UNQ SUN POINT SECURED</span>
                          <span className="text-emerald-700 font-black text-lg">+100 SP 획득!</span>
                        </Card>
                        <p className="text-[10px] text-slate-400 leading-relaxed max-w-[220px] mx-auto font-bold">
                          체험 완료! 실물 제품 수령 후 QR을 스캔하면 이와 동일한 10초 폼을 통해 포인트 적립과 7일 루틴 빌드가 실제로 가동됩니다.
                        </p>
                        <Button 
                          onClick={resetSimulator}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] py-2.5 rounded-lg border-none"
                        >
                          다시 테스트하기
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Phone Bottom bar */}
                <div className="pb-4 pt-1 z-20 bg-white flex justify-center border-t border-slate-100">
                  <div className="w-24 h-1 bg-zinc-300 rounded-full" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🗓️ Zone 3-3: 7-Day SunNudge Challenge 로드맵 (밝은 디자인) */}
      <section className="py-8 md:py-28 border-b border-slate-100 bg-[#FAF9F5]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="space-y-4 mb-6 md:mb-16">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">7-Day Journey</span>
            <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tight break-keep">
              7일 챌린지 습관 형성 디자인
            </h2>
            <p className="text-xs md:text-lg text-slate-600 max-w-xl mx-auto break-keep font-medium">
              비밀 밴드 채널과 QR 기록 넛지 시스템을 통하여 일주일 동안 구축하게 될 행동 패턴 강화 경로입니다.
            </p>
          </div>

          {/* Timeline Nodes (Bright Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 text-left">
            {[
              { day: 'Day 1', label: '오전 도포 체크', goal: '루틴 시작 인지' },
              { day: 'Day 2', label: '취약 부위 체크', goal: '빼먹는 부위 인식' },
              { day: 'Day 3', label: 'UV 스티커 확인', goal: '자외선량 시각화' },
              { day: 'Day 4', label: '야외 재도포 실천', goal: '행동 넛지 실행' },
              { day: 'Day 5', label: '야외 활동 기록', goal: '생활 패턴 대조' },
              { day: 'Day 6', label: '밀착 피드백', goal: '사용감 리포팅' },
              { day: 'Day 7', label: '최종 리포트 확인', goal: '웰니스 챌린지 성공' }
            ].map((node, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-slate-100 space-y-2 relative shadow-[0_4px_15px_rgba(0,0,0,0.005)]">
                {/* Connector line for desktop */}
                {i < 6 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-600/30 z-10" />
                )}
                <span className="text-[10px] font-black tracking-widest text-emerald-600 block">{node.day}</span>
                <h4 className="text-slate-800 text-xs font-black leading-tight">{node.label}</h4>
                <p className="text-slate-400 text-[10px] font-bold">{node.goal}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🛡️ Zone 4: 신뢰 보장 및 Risk Control (Risk Reversal) */}
      <section className="py-8 md:py-28 bg-white/40 backdrop-blur-md">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Risk Reversal Message */}
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> 100% Risk Reversal
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight break-keep">
                공동개발단의 참여금은 <br />
                100% 전액 안전하게 보호됩니다.
              </h2>
              <p className="text-xs md:text-base text-slate-600 leading-relaxed break-keep font-medium">
                SunNudge™ Founder Lab은 완제품 쇼핑몰이 아닌, 제품의 최종 구성과 생산 요건을 함께 조율해가는 열린 공동개발 공간입니다. 따라서 생산 조건 미달이나 절차적 불가능 상태 시 참여자분들의 자금은 **단 1원의 소실도 없이 100% 즉시 전액 안전 환불**됩니다. 안 안심하고 1기 창립 멤버 권한을 선점해 보세요.
              </p>
              
              {/* Refund Guarantee card */}
              <Card className="bg-amber-500/[0.03] border border-amber-300 p-6 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-amber-700 font-black text-sm">
                  <Award className="w-5 h-5 text-amber-500" /> 100% 안심 3대 환불 가이드라인
                </div>
                <div className="space-y-2 text-xs text-slate-500 font-bold">
                  <p>1. 제품 1기 생산 조건(참여 인원/수량)이 달성되지 않을 시 전액 즉시 환불</p>
                  <p>2. 관련 행정 승인 절차 지연 및 기능성 수급 차질 시 전액 즉시 환불</p>
                  <p>3. 제품 구성에 중대 변경 발생 시 구매자 동의 하에 즉각 환불 지원</p>
                </div>
              </Card>
            </div>

            {/* FAQ (이탈 방지용 자주 묻는 질문) */}
            <div className="space-y-4 text-left">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600" /> 자주 묻는 질문 (FAQ)
              </h3>
              {[
                {
                  q: '이건 일반 선크림 판매 쇼핑몰 페이지인가요?',
                  a: '아닙니다. SunNudge™는 한 통 판매에 그치지 않고, 야외 활동 중 다시 바르고 스마트하게 기록하게 만드는 7일 행동 제어 루틴 키트(습관 넛지 보조제)입니다.'
                },
                {
                  q: '9,900원 Founder Credit Ticket은 무엇인가요?',
                  a: '단순히 소멸되는 참가비나 예약금이 아닙니다. 본 티켓은 1기 공동개발단 권한 증서이며, 제품 1차 제작 시 9,900원 전액 유니클 스토어 구매 크레딧(포인트)으로 100% 전환되어 제품 구매나 챌린지에 전액 사용하실 수 있습니다.'
                },
                {
                  q: '와디즈 크라우드 펀딩과 다른 점이 있나요?',
                  a: '외부 사이트에서 오픈 펀딩하는 형태가 아니라, 유니클 공식 회원들만 프라이빗하게 입장할 수 있는 전용 밴드 채널(Founder Room)을 통해 OEM 제조 현황과 세부 스티커 구성품 투표를 안전하게 조율해 나가는 우리만의 비공개 공동개발 프로젝트입니다.'
                },
                {
                  q: '제품의 의학적 효능은 보장되나요?',
                  a: '아닙니다. 피부 재생, 치료, 기미 개선 등 의학적 효능은 과장하거나 주장하지 않으며, 자외선 노출을 꼼꼼하게 관리하고 재도포 타이밍을 놓치지 않게 돕는 프리미엄 데일리 생활 케어 루틴 습관 보조 도구입니다.'
                }
              ].map((faq, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white border border-slate-100 space-y-2 shadow-[0_4px_15px_rgba(0,0,0,0.005)]">
                  <h5 className="text-slate-800 text-xs sm:text-sm font-black">Q. {faq.q}</h5>
                  <p className="text-slate-500 text-xs leading-relaxed break-keep font-semibold">{faq.a}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 🚀 Zone 5: Bottom CTA (최종 신청/결제 유도) */}
      <section className="py-12 md:py-32 bg-gradient-to-b from-[#FDFBF7] to-[#FAF8F2] text-center border-t border-slate-100">
        <div className="container mx-auto px-4 max-w-3xl space-y-6">
          <h2 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tight break-keep">
            자외선 아래서도 완전하게 보호받는 <br />
            나만의 7일 습관을 만들어가세요.
          </h2>
          <p className="text-xs md:text-lg text-slate-600 max-w-xl mx-auto break-keep font-medium">
            1기 공동개발단(Founder) 멤버들과 비밀 밴드(Founder Room)에서 제품 구성에 대한 첫 투표가 활기차게 진행 중입니다. 지금 합류해 보세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto pt-6">
            <Button
              onClick={() => handlePreorderClick('free')}
              className="w-full sm:w-auto px-8 py-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-[0_10px_25px_rgba(5,150,105,0.25)] transition-all duration-300 hover:scale-[1.03]"
            >
              무료 관심자 신청
            </Button>
            <Button
              onClick={() => handlePreorderClick('ticket')}
              className="w-full sm:w-auto px-8 py-6 rounded-2xl bg-white hover:bg-amber-50/50 text-amber-700 border-2 border-amber-300 hover:border-amber-400 font-black text-base shadow-[0_10px_25px_rgba(245,158,11,0.05)] transition-all duration-300 hover:scale-[1.03]"
            >
              9,900원 Ticket 참여
            </Button>
          </div>
        </div>
      </section>



    </ChapterWrapper>
  );
}
