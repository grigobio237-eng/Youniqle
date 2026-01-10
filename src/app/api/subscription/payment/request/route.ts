import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 나이스페이 설정
        const merchantId = process.env.NICEPAY_MERCHANT_ID || 'grigobio1m';
        const merchantKey = process.env.NICEPAY_MERCHANT_KEY || '';

        // 절대 경로로 변환 (서버 사이드에서 호출되므로 전체 URL 필요)
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const returnUrl = `${baseUrl}/api/subscription/payment/result`;

        // 주문 고유 번호 생성 (SUB_유저ID_타임스탬프)
        const orderId = `SUB_${(session.user as any).id || 'user'}_${Date.now()}`;
        const amount = 9900;
        const productName = '김미정 원장 라운지 1개월 구독';

        // 나이스페이 공식 문서 기준 파라미터 생성
        const ediDate = new Date().toISOString()
            .replace(new RegExp('[-:T' + '.]', 'g'), '')
            .substring(0, 14);

        // 서명 생성 (EdiDate + MID + Amt + MerchantKey)
        const signatureData = `${ediDate}${merchantId}${amount}${merchantKey}`;
        const signature = crypto.createHash('sha256').update(signatureData).digest('hex');

        // 인증 요청 파라미터
        const authParams = {
            MID: merchantId,
            Moid: orderId,
            Amt: amount.toString(),
            GoodsName: productName,
            EdiDate: ediDate,
            SignData: signature,
            BuyerName: session.user.name || '방문자',
            BuyerEmail: session.user.email,
            BuyerTel: '01000000000', // 필수값이지만 없을 경우 더미 데이터
            ReturnURL: returnUrl,
            PayMethod: 'CARD', // 기본 결제 수단
            GoodsCl: '0', // 컨텐츠 (실물 아님)
            TransType: '0', // 일반 거래
            CharSet: 'utf-8',
        };

        return NextResponse.json({
            success: true,
            authUrl: 'https://web.nicepay.co.kr/v3/v3Payment.jsp',
            formData: authParams,
        });

    } catch (error) {
        console.error('Subscription Payment Request Error:', error);
        return NextResponse.json(
            { error: '결제 요청 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
