'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CharacterImage from '@/components/ui/CharacterImage';
import { useLanguage } from '@/contexts/LanguageContext';
import { XCircle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function OrderFailedContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const orderId = searchParams.get('orderId');
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <CharacterImage
                src="/character/youniqle-2.png"
                alt="결제 실패"
                width={100}
                height={100}
                className="w-24 h-24 mx-auto"
              />
              <div className="absolute -bottom-2 -right-2 bg-red-500 rounded-full p-2">
                <XCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            {t('payment.failed')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('payment.orderNumber')}</span>
              <span className="font-semibold">{orderId}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-600 mb-2">{t('payment.errorMessage')}</span>
              <span className="font-medium text-red-600 text-sm bg-red-50 p-2 rounded">
                {error || t('common.error')}
              </span>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-800 text-center">
              {t('payment.failedMessage')}
            </p>
          </div>

          <div className="space-y-2">
            <Button className="w-full" size="lg" asChild>
              <Link href="/checkout">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('payment.retryPayment')}
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

export default function OrderFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <CharacterImage
          src="/character/youniqle-2.png"
          alt="로딩 중"
          width={64}
          height={64}
          className="w-16 h-16 mx-auto animate-bounce"
        />
      </div>
    }>
      <OrderFailedContent />
    </Suspense>
  );
}


