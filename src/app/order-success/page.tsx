'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CharacterImage from '@/components/ui/CharacterImage';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle, Home, Package } from 'lucide-react';
import Link from 'next/link';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const tid = searchParams.get('tid');

  // 결제 완료 후 장바구니 개수 업데이트
  useEffect(() => {
    window.dispatchEvent(new Event('cartUpdated'));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <CharacterImage
                src="/character/youniqle-1.png"
                alt="결제 완료"
                width={100}
                height={100}
                className="w-24 h-24 mx-auto"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            {t('payment.success')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('payment.orderNumber')}</span>
              <span className="font-semibold">{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('payment.amount')}</span>
              <span className="font-semibold text-lg text-blue-600">
                {amount ? parseInt(amount).toLocaleString() : 0}원
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('payment.transactionId')}</span>
              <span className="font-mono text-sm">{tid}</span>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              {t('payment.successMessage')}
            </p>
          </div>

          <div className="space-y-2">
            <Button className="w-full" size="lg" asChild>
              <Link href="/orders">
                <Package className="h-4 w-4 mr-2" />
                {t('payment.viewOrders')}
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                {t('payment.goHome')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <CharacterImage
          src="/character/youniqle-1.png"
          alt="로딩 중"
          width={64}
          height={64}
          className="w-16 h-16 mx-auto animate-bounce"
        />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}


