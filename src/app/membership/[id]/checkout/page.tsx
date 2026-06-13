'use client';

import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  CreditCard, 
  Check, 
  ShieldCheck, 
  Loader2,
  Sparkles,
  Zap,
  Lock,
  Users,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import { PASS_SPECS } from '@/lib/constants/passes';

import { useSession } from 'next-auth/react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CheckoutPage({ params }: PageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = use(params);
  const pass = PASS_SPECS[id];

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [navigatorCode, setNavigatorCode] = useState('');
  const [isNavVerified, setIsNavVerified] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [navName, setNavName] = useState('');

  if (!pass) return null;

  const user = session?.user as any;
  const hasNavigator = !!(user?.referredBy || user?.recentNavigator);

  const verifyNavigator = async () => {
    if (!navigatorCode.trim()) return;
    setIsValidating(true);
    try {
      const res = await fetch(`/api/user/by-code?code=${navigatorCode}`);
      if (res.ok) {
        const data = await res.json();
        if (data.user?.isNavigator) {
          setIsNavVerified(true);
          setNavName(data.user.name);
        } else {
          alert('유효한 네비게이터 코드가 아닙니다.');
          setIsNavVerified(false);
        }
      } else {
        alert('네비게이터를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('Nav validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handlePayment = async () => {
    if (!session?.user) {
      alert('로그인이 필요한 서비스입니다.');
      router.push('/login');
      return;
    }


    setIsProcessing(true);

    try {
      // 1. 서버에 멤버십 주문 생성 요청 (DB에 pending 상태로 저장)
      const orderRes = await fetch('/api/membership/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passId: id,
          price: pass.price,
          passName: pass.name
        })
      });

      if (!orderRes.ok) throw new Error('주문 생성에 실패했습니다.');
      const { orderNumber } = await orderRes.json();
      
      // 2. 서버에 나이스페이 인증 요청 파라미터 요청
      const response = await fetch('/api/payment/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderNumber,
          amount: parseInt(pass.price.replace(/,/g, '')),
          productName: `유니클 ${pass.name} 멤버십`,
          buyerName: session.user.name || '유니클회원',
          buyerEmail: session.user.email || '',
          buyerTel: (session.user as any).phone || '',
          payMethod: 'CARD', // 기본 카드결제
          reqReserved: JSON.stringify({
            userId: (session.user as any).id,
            passId: id,
            type: 'MEMBERSHIP_UPGRADE',
            navigatorId: isNavVerified ? navigatorCode : undefined
          })
        })
      });

      if (!response.ok) throw new Error('결제 요청에 실패했습니다.');
      
      const { authUrl, formData } = await response.json();

      // 3. 동적 폼 생성 및 나이스페이로 전송
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = authUrl;
      form.acceptCharset = 'EUC-KR';

      Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      
    } catch (error) {
      console.error('[Checkout] Payment Error:', error);
      alert('결제 준비 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] animate-pulse rounded-full" />
          <div className="relative z-10 space-y-8 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(191,244,66,0.5)]">
              <Check className="w-12 h-12 text-obsidian stroke-[4]" />
            </div>
            <div className="space-y-4">
              <h1 className="font-black text-white tracking-tighter uppercase text-4xl md:text-4xl">
                Lifecare OS Upgraded
              </h1>
              <p className="text-primary font-bold uppercase tracking-widest text-xl">
                {pass.name} v2.5 ACTIVATED
              </p>
            </div>
            <div className="pt-10">
              <div className="flex items-center justify-center gap-2 text-white/40 text-xs font-black uppercase tracking-[0.3em]">
                <Loader2 className="w-3 h-3 animate-spin" />
                Initializing Recovery Assets...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChapterWrapper chapter="membership" className="min-h-screen bg-mist">
      <div className="container mx-auto px-4 pt-12 pb-32">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate/60 hover:text-obsidian transition-colors font-bold text-sm mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          상세 정보로 돌아가기
        </button>

        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-black text-obsidian tracking-tight">멤버십 구독 시작하기</h1>
            <p className="text-slate/60 font-bold mt-2">안전하고 프라이빗한 결제 시스템을 통해 업그레이드됩니다.</p>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-[32px] p-8 shadow-xl border border-line/50">
            <h2 className="text-xs font-black text-slate/40 uppercase tracking-widest mb-6 border-b border-line pb-4">주문 내역</h2>
            <div className="flex justify-between items-center py-4">
              <div className="space-y-1">
                <p className="text-lg font-black text-obsidian">{pass.name}</p>
                <p className="text-xs text-slate/60 font-bold">{pass.position}</p>
              </div>
              <p className="font-black text-obsidian text-xl">{pass.price}원</p>
            </div>
            <div className="flex justify-between items-center py-4 border-t border-line mt-4">
              <p className="text-sm font-bold text-slate/60">이용 기간</p>
              <p className="text-sm font-black text-obsidian">
                {pass.period === '무료체험' ? '1회성' : `매달 (${pass.period})`}
              </p>
            </div>
          </div>


          {/* Payment Method */}
          <div className="bg-white rounded-[32px] p-8 shadow-xl border border-line/50">
            <h2 className="text-xs font-black text-slate/40 uppercase tracking-widest mb-6 border-b border-line pb-4">결제 수단</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-6 rounded-2xl border-2 border-primary bg-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <CreditCard className="w-6 h-6 text-obsidian" />
                  </div>
                  <div>
                    <p className="font-black text-obsidian text-sm">신용/체크카드</p>
                    <p className="text-[10px] text-slate/60 font-bold uppercase tracking-widest">Global Secure Payment</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-obsidian stroke-[3]" />
                </div>
              </div>
            </div>
          </div>

          {/* Security & Compliance */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-6 bg-white rounded-2xl border border-line shadow-sm">
              <input 
                type="checkbox" 
                id="terms-agree"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="w-5 h-5 mt-0.5 accent-obsidian cursor-pointer"
              />
              <label htmlFor="terms-agree" className="text-sm font-bold text-obsidian cursor-pointer select-none">
                [필수] 멤버십 이용약관 및 결제에 동의합니다.
                <button 
                  type="button"
                  onClick={() => window.open('/policies/membership', '_blank')}
                  className="block text-xs text-slate/40 underline mt-1"
                >
                  약관 상세보기
                </button>
              </label>
            </div>

            <div className="flex items-start gap-3 px-4 py-6 bg-slate-100 rounded-2xl">
              <ShieldCheck className="w-5 h-5 text-foreground/70 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate/50 font-bold leading-relaxed">
                본 결제는 정기 결제로, 매달 동일한 날짜에 자동으로 결제됩니다. 결제 정보는 안전하게 관리되며 마이페이지에서 언제든 해지 가능합니다.
              </p>
            </div>
          </div>

          {/* Checkout Button */}
          <button 
            disabled={isProcessing || !isAgreed}
            onClick={handlePayment}
            className="w-full py-6 bg-obsidian text-white rounded-[24px] font-black tracking-tight hover:bg-primary hover:text-obsidian transition-all shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed group text-xl"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                결제를 처리하고 있습니다...
              </>
            ) : (
              <>
                {pass.price}원 정기 구독 시작하기
                <Sparkles className="w-5 h-5 group-hover:scale-125 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </ChapterWrapper>
  );
}
