'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import CharacterImage from '@/components/ui/CharacterImage';

export default function PartnerApplyPage() {
  const router = useRouter();

  useEffect(() => {
    // 마이페이지로 리다이렉트
    router.push('/me');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-background to-primary/10 flex items-center justify-center p-4">
      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            파트너 신청은 마이페이지에서 가능합니다
          </h2>
          <p className="text-text-secondary mb-6">
            파트너 신청 기능이 마이페이지로 이동되었습니다.
            <br />
            잠시 후 마이페이지로 이동합니다.
          </p>
          <Button asChild className="w-full">
            <Link href="/me">
              마이페이지로 이동
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
