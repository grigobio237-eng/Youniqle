'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Lock, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import Image from 'next/image';

function SubscribeContent() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const error = searchParams?.get('error');
        if (error) {
            alert(`결제 실패: ${error}`);
        }
    }, [searchParams]);

    const handlePayment = async () => {
        if (!session) {
            router.push('/auth/signin?callbackUrl=/lounge/subscribe');
            return;
        }

        setIsLoading(true);

        try {
            // [DEV BYPASS] Call bypass API instead of NicePay
            const res = await fetch('/api/subscription/payment/bypass', { method: 'POST' });
            const data = await res.json();

            if (data.success) {
                // Redirect to lounge with success message
                router.push('/lounge?subscribed=true');
            } else {
                alert(data.error || '구독 처리 실패');
                setIsLoading(false);
            }
        } catch (error) {
            console.error(error);
            alert('구독 처리 중 오류가 발생했습니다.');
            setIsLoading(false);
        }
    };

    return (
        <Card className="max-w-4xl w-full shadow-2xl overflow-hidden border-0">
            <div className="flex flex-col md:flex-row">
                {/* Left: Product Info */}
                <div className="md:w-1/2 bg-[#2c3e50] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

                    <div>
                        <Badge className="bg-[#d4af37] text-white hover:bg-[#c4a030] mb-6">PREMIUM MEMBERSHIP</Badge>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                            김미정 원장의<br />회복 라운지
                        </h1>
                        <p className="text-gray-300 text-lg mb-8">
                            더 깊은 회복을 위한 1:1 맞춤 솔루션.<br />
                            이제 모바일에서 원장님과 직접 소통하세요.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/10 p-2 rounded-lg">
                                <Lock className="w-5 h-5 text-[#d4af37]" />
                            </div>
                            <span>프라이빗 1:1 채팅 상담</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/10 p-2 rounded-lg">
                                <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
                            </div>
                            <span>시크릿 건강 컨텐츠 열람</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/10 p-2 rounded-lg">
                                <Check className="w-5 h-5 text-[#d4af37]" />
                            </div>
                            <span>오프라인 케어 우선 예약</span>
                        </div>
                    </div>
                </div>

                {/* Right: Payment Action */}
                <div className="md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">멤버십 구독</h2>
                        <p className="text-gray-500 font-medium text-sm bg-blue-50 py-2 px-4 rounded-full inline-block">
                            테스트 기간: 즉시 시작 가능합니다
                        </p>
                    </div>

                    <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                            <span className="text-gray-600">상품명</span>
                            <span className="font-medium">라운지 1개월 구독</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">결제 금액</span>
                            <span className="text-2xl font-bold text-[#2c3e50]">9,900원</span>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        className="w-full h-14 text-lg bg-[#2c3e50] hover:bg-[#34495e] transition-all"
                        onClick={handlePayment}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center">
                                <Loader2 className="animate-spin mr-2 h-5 w-5" /> 처리중...
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <CreditCard className="mr-2 w-5 h-5" /> 구독하고 시작하기
                            </span>
                        )}
                    </Button>

                    <p className="text-xs text-center text-gray-400 mt-6">
                        구독 기간 동안 언제든 해지 가능하며,<br />
                        결제 후 7일 이내 미사용 시 100% 환불 가능합니다.
                    </p>
                </div>
            </div>
        </Card>
    );
}

export default function SubscribePage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <Suspense fallback={<div>Loading...</div>}>
                <SubscribeContent />
            </Suspense>
        </div>
    );
}
