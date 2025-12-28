'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Package, ShoppingBag, ChevronRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId');
  const amount = searchParams?.get('amount');
  const tid = searchParams?.get('tid');

  // 결제 완료 후 장바구니 개수 업데이트
  useEffect(() => {
    window.dispatchEvent(new Event('cartUpdated'));
  }, []);

  return (
    <div className="min-h-screen bg-mist flex items-center justify-center p-6">
      <Card className="max-w-xl w-full border-none shadow-2xl rounded-[48px] overflow-hidden bg-white">
        <div className="h-2 bg-chapter-accent w-full" />
        <CardHeader className="text-center pt-16 pb-8">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-mist rounded-[40px] flex items-center justify-center text-6xl shadow-inner animate-pulse">
                🌱
              </div>
              <div className="absolute -bottom-2 -right-2 bg-chapter-accent rounded-full p-3 shadow-lg ring-4 ring-white">
                <CheckCircle className="h-8 w-8 text-mist" />
              </div>
            </div>
          </div>
          <p className="text-slate font-black uppercase tracking-[0.2em] text-[10px] mb-2">Success Verification Complete</p>
          <CardTitle className="text-4xl font-black text-obsidian tracking-tighter">
            결제가 완료되었습니다!
          </CardTitle>
          <p className="mt-4 text-slate font-medium px-8 leading-relaxed">
            유니클레와 함께하는 회복의 여정이 시작되었습니다.<br />
            정성껏 준비하여 빠르게 배송해 드릴게요.
          </p>
        </CardHeader>
        <CardContent className="p-10 space-y-10">
          <div className="bg-mist/30 p-8 rounded-[32px] border border-line/50 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate uppercase tracking-widest">Order Number</span>
              <span className="font-bold text-obsidian text-sm">{orderId}</span>
            </div>
            <div className="h-px bg-line/30 w-full" />
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate uppercase tracking-widest">Total Paid</span>
              <span className="font-black text-2xl text-obsidian tracking-tighter">
                {amount ? parseInt(amount).toLocaleString() : 0}원
              </span>
            </div>
            {tid && (
              <>
                <div className="h-px bg-line/30 w-full" />
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate uppercase tracking-widest">Transaction ID</span>
                  <span className="font-mono text-[10px] text-slate opacity-60 truncate ml-4">{tid}</span>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="h-16 rounded-2xl bg-obsidian text-mist font-black text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2" asChild>
              <Link href="/me/orders">
                <Package className="h-5 w-5" />
                주문 내역 보기
              </Link>
            </Button>
            <Button variant="outline" className="h-16 rounded-2xl border-line font-black text-lg hover:bg-mist transition-all flex items-center justify-center gap-2" asChild>
              <Link href="/">
                <Home className="h-5 w-5" />
                홈으로 이동
              </Link>
            </Button>
          </div>

          <div className="flex justify-center items-center gap-2 text-status-good pt-4">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Verified by Youniqle Secure Protocol</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-mist flex items-center justify-center font-black text-obsidian tracking-tighter opacity-10 uppercase">
        Verifying Identity
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
