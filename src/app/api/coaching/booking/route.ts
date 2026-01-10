import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import CoachingBooking from '@/models/CoachingBooking';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        const body = await req.json();
        const {
            coachId,
            coachName,
            programId,
            programTitle,
            amount,
            date,
            time,
            buyerName,
            buyerTel,
            payMethod
        } = body;

        // 필수 값 검증
        if (!coachId || !programId || !amount || !date) {
            return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
        }

        const User = (await import('@/models/User')).default;
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 주문번호 및 예약 ID 생성
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        const orderNumber = `COACH${dateStr}${randomStr}`;
        const bookingId = `B${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // 예약 데이터 생성 (잠금 상태: pending)
        const booking = new CoachingBooking({
            bookingId,
            orderNumber,
            coachId,
            coachName,
            userId: user._id,
            userEmail: user.email,
            userName: buyerName || user.name,
            programId,
            programTitle,
            amount: Number(amount),
            date,
            time,
            status: 'pending',
            paymentStatus: 'pending'
        });

        await booking.save();

        // 나이스페이 인증 요청 파라미터 생성 (api/payment/request 로직 활용)
        const merchantId = process.env.NICEPAY_MERCHANT_ID || 'grigobio1m';
        const merchantKey = process.env.NICEPAY_MERCHANT_KEY || '';
        const returnUrl = `${process.env.NEXTAUTH_URL}/api/coaching/booking/callback`; // 완료 후 콜백

        const ediDate = new Date().toISOString()
            .replace(new RegExp('[-:T' + '.]', 'g'), '')
            .substring(0, 14);

        const signatureData = `${ediDate}${merchantId}${amount}${merchantKey}`;
        const signature = crypto.createHash('sha256').update(signatureData).digest('hex');

        const authParams = {
            MID: merchantId,
            Moid: orderNumber,
            Amt: amount.toString(),
            GoodsName: programTitle,
            EdiDate: ediDate,
            SignData: signature,
            BuyerName: buyerName || user.name,
            BuyerEmail: user.email,
            BuyerTel: buyerTel || '',
            ReturnURL: returnUrl,
            CancelURL: `${process.env.NEXTAUTH_URL}/pavilion`,
            PayMethod: payMethod || 'CARD',
            GoodsCl: '0', // 컨텐츠/서비스
            TransType: '0',
            CharSet: 'EUC-KR',
            Language: 'KOREAN',
            Currency: 'KRW',
            ReqReserved: JSON.stringify({ bookingId, type: 'COACHING' }),
        };

        return NextResponse.json({
            success: true,
            bookingId,
            authUrl: 'https://web.nicepay.co.kr/v3/v3Payment.jsp',
            formData: authParams
        });

    } catch (error) {
        console.error('Coaching Booking Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
