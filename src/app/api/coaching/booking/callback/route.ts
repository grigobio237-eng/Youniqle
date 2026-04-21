import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import CoachingBooking from '@/models/CoachingBooking';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const authResultCode = formData.get('AuthResultCode') as string;
        const authToken = formData.get('AuthToken') as string;
        const mid = formData.get('MID') as string;
        const moid = formData.get('Moid') as string;
        const amt = formData.get('Amt') as string;
        const txTid = formData.get('TxTid') as string;
        const nextAppURL = formData.get('NextAppURL') as string;
        const responseSignature = formData.get('Signature') as string;

        const isAuthSuccess = authResultCode === '0000';
        const merchantKey = process.env.NICEPAY_MERCHANT_KEY || '';

        // 1. 인증 서명 검증
        if (isAuthSuccess && responseSignature) {
            const authSignature = crypto.createHash('sha256').update(authToken + mid + amt + merchantKey).digest('hex');
            if (authSignature !== responseSignature) {
                return renderErrorPage('인증 응답 무결성 검증 실패');
            }
        }

        if (isAuthSuccess && nextAppURL) {
            // 2. 승인 요청
            const now = new Date();
            const ediDate = now.toISOString()
                .replace(new RegExp('[-:T' + '.]', 'g'), '')
                .substring(0, 14);
            const signData = crypto.createHash('sha256').update(authToken + mid + amt + ediDate + merchantKey).digest('hex');

            const approvalData = new URLSearchParams();
            approvalData.append('TID', txTid);
            approvalData.append('AuthToken', authToken);
            approvalData.append('MID', mid);
            approvalData.append('Amt', amt);
            approvalData.append('EdiDate', ediDate);
            approvalData.append('CharSet', 'utf-8');
            approvalData.append('SignData', signData);

            const res = await fetch(nextAppURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: approvalData.toString(),
            });

            if (!res.ok) return renderErrorPage('결제 승인 요청 실패');

            const approvalResult = await res.text();
            let approvalDataObj: any = {};
            try {
                approvalDataObj = JSON.parse(approvalResult);
            } catch (e) {
                approvalDataObj = Object.fromEntries(new URLSearchParams(approvalResult));
            }

            const resultCode = approvalDataObj.ResultCode || approvalDataObj.resultCode;
            const payMethodResult = approvalDataObj.PayMethod || approvalDataObj.payMethod;

            // 결제 성공 여부 (카드 기준 3001)
            const isPaymentSuccess = (payMethodResult === 'CARD' && resultCode === '3001') || resultCode === '0000' || resultCode === '4000';

            if (isPaymentSuccess) {
                await connectDB();

                // 3. 예약 정보 업데이트
                const booking = await CoachingBooking.findOne({ orderNumber: moid });
                if (booking) {
                    booking.status = 'confirmed';
                    booking.paymentStatus = 'paid';
                    booking.nicepayData = approvalDataObj;
                    await booking.save();

                    // 4. 코치 스케줄 업데이트 (해당 슬롯 점유)
                    // TODO: 코치 모델 분리 및 업데이트 별도 구현 필요
                }

                return renderSuccessPage(moid, amt, txTid);
            } else {
                return renderErrorPage(approvalDataObj.ResultMsg || '결제 승인 실패');
            }
        }

        return renderErrorPage('결제 인증 실패');

    } catch (error) {
        console.error('Coaching Callback Error:', error);
        return renderErrorPage('시스템 오류가 발생했습니다.');
    }
}

function renderSuccessPage(moid: string, amt: string, tid: string) {
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/trainer?orderId=${moid}&status=success`;
    return new Response(`
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>결제 완료</title></head>
        <body style="text-align:center; padding:50px; font-family:sans-serif;">
            <h2 style="color:#10b981;">✓ 코칭 예약 및 결제가 완료되었습니다!</h2>
            <p>잠시 후 코칭 룸으로 이동합니다...</p>
            <script>setTimeout(function(){ window.location.href = '${redirectUrl}'; }, 2000);</script>
        </body>
        </html>
    `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function renderErrorPage(msg: string) {
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/trainer?error=${encodeURIComponent(msg)}`;
    return new Response(`
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>결제 실패</title></head>
        <body style="text-align:center; padding:50px; font-family:sans-serif;">
            <h2 style="color:#ef4444;">✗ 결제 중 오류가 발생했습니다</h2>
            <p>${msg}</p>
            <p>잠시 후 코칭 룸으로 돌아갑니다...</p>
            <script>setTimeout(function(){ window.location.href = '${redirectUrl}'; }, 2000);</script>
        </body>
        </html>
    `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
