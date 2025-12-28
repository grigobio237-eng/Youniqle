'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, RefreshCw, ShoppingCart, Shield } from 'lucide-react';
import Link from 'next/link';

function OrderCancelledContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId');
  const error = searchParams?.get('error');

  return (
    <div className="min-h-screen bg-mist flex items-center justify-center p-6">
      <Card className="max-w-xl w-full border-none shadow-2xl rounded-[48px] overflow-hidden bg-white">
        <div className="h-2 bg-status-amber w-full" />
        <CardHeader className="text-center pt-16 pb-8">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-mist rounded-[40px] flex items-center justify-center text-6xl shadow-inner">
                ✋
              </div>
              <div className="absolute -bottom-2 -right-2 bg-status-amber rounded-full p-3 shadow-lg ring-4 ring-white">
                <AlertCircle className="h-8 w-8 text-mist" />
              </div>
            </div>
          </div>
          <p className="text-slate font-black uppercase tracking-[0.2em] text-[10px] mb-2">Protocol Terminated</p>
          <CardTitle className="text-4xl font-black text-obsidian tracking-tighter">
            결제가 취소되었습니다
          </CardTitle>
          <p className="mt-4 text-slate font-medium px-8 leading-relaxed">
            사용자 요청으로 결제가 중단되었습니다.<br />
            장바구니의 상품은 그대로 보관되어 있습니다.
          </p>
        </CardHeader>
        <CardContent className="p-10 space-y-10">
          <div className="bg-status-amber/5 p-8 rounded-[32px] border border-status-amber/10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate uppercase tracking-widest">Order Number</span>
              <span className="font-bold text-obsidian text-sm">{orderId || 'N/A'}</span>
            </div>
            <div className="h-px bg-status-amber/10 w-full" />
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate uppercase tracking-widest">Status</span>
              <span className="font-bold text-status-amber text-sm italic">Payment Suspended</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="h-16 rounded-2xl bg-obsidian text-mist font-black text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                장바구니 확인하기
              </Link>
            </Button>
            <Button variant="outline" className="h-16 rounded-2xl border-line font-black text-lg hover:bg-mist transition-all flex items-center justify-center gap-2" asChild>
              <Link href="/">
                <Home className="h-5 w-5" />
                홈으로 이동
              </Link>
            </Button>
          </div>

          <div className="flex justify-center items-center gap-2 text-slate/50 pt-4">
            <Shield className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">User Privacy Protocol Active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderCancelledPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-mist flex items-center justify-center font-black text-obsidian tracking-tighter opacity-10 uppercase">
        Restoring State
      </div>
    }>
      <OrderCancelledContent />
    </Suspense>
  );
}
