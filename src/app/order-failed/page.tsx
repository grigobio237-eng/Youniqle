'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Home, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

function OrderFailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId');
  const error = searchParams?.get('error');

  return (
    <div className="min-h-screen bg-mist flex items-center justify-center p-6">
      <Card className="max-w-xl w-full border-none shadow-2xl rounded-[48px] overflow-hidden bg-white">
        <div className="h-2 bg-status-danger w-full" />
        <CardHeader className="text-center pt-16 pb-8">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-mist rounded-[40px] flex items-center justify-center shadow-inner text-xl">
                ⚠️
              </div>
              <div className="absolute -bottom-2 -right-2 bg-status-danger rounded-full p-3 shadow-lg ring-4 ring-white">
                <XCircle className="h-8 w-8 text-mist" />
              </div>
            </div>
          </div>
          <p className="text-slate font-black uppercase tracking-[0.2em] text-[10px] mb-2">Protocol Interrupted</p>
          <CardTitle className="font-black text-obsidian tracking-tighter text-4xl">
            결제에 실패했습니다
          </CardTitle>
          <p className="mt-4 text-slate font-medium px-8 leading-relaxed">
            결제 처리 중 예상치 못한 오류가 발생했습니다.<br />
            아래 내용을 확인하신 후 다시 시도해 주세요.
          </p>
        </CardHeader>
        <CardContent className="p-10 space-y-10">
          <div className="bg-status-danger/5 p-8 rounded-[32px] border border-status-danger/10 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate uppercase tracking-widest">Order Number</span>
              <span className="font-bold text-obsidian text-sm">{orderId || 'N/A'}</span>
            </div>
            <div className="h-px bg-status-danger/10 w-full" />
            <div className="space-y-2">
              <span className="text-xs font-black text-slate uppercase tracking-widest block">Error Details</span>
              <p className="text-sm font-bold text-status-danger bg-white p-4 rounded-xl border border-status-danger/20 flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                {error || '결제 통신 오류 또는 카드 정보 불일치'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="h-16 rounded-2xl bg-obsidian text-mist font-black text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2" asChild>
              <Link href="/checkout">
                <RefreshCw className="h-5 w-5" />
                다시 결제하기
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
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Secure Error Handling Active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-mist flex items-center justify-center font-black text-obsidian tracking-tighter opacity-10 uppercase">
        Analyzing Error
      </div>
    }>
      <OrderFailedContent />
    </Suspense>
  );
}
