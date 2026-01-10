import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import CoachingBooking from '@/models/CoachingBooking';
import PavilionFloor from '@/models/PavilionFloor';

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
                    // Floor 3 고정 (코치 층)
                    const floorData = await PavilionFloor.findOne({ floor: 3 });
                    if (floorData) {
                        const owner = floorData.owners.find((o: any) => o.id === booking.coachId);
                        if (owner && owner.schedule) {
                            const day = owner.schedule.find((s: any) => s.date === booking.date);
                            if (day && day.slots) {
                                const slot = day.slots.find((sl: any) => sl.time === booking.time);
                                if (slot) {
                                    slot.isBooked = true;
                                    slot.bookedBy = booking.userName;
                                }
                            } else if (day && day.type === 'FULL_DAY') {
                                day.isBooked = true; // 대략적인 표현
                            }
                            floorData.markModified('owners');
                            await floorData.save();
                        }
                    }
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
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/pavilion?orderId=${moid}&status=success`;
    return new Response(`
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>결제 완료</title></head>
        <body style="text-align:center; padding:50px; font-family:sans-serif;">
            <h2 style="color:#10b981;">✓ 코칭 예약 및 결제가 완료되었습니다!</h2>
            <p>잠시 후 파빌리온으로 이동합니다...</p>
            <script>setTimeout(function(){ window.location.href = '${redirectUrl}'; }, 2000);</script>
        </body>
        </html>
    `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function renderErrorPage(msg: string) {
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/pavilion?error=${encodeURIComponent(msg)}`;
    return new Response(`
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>결제 실패</title></head>
        <body style="text-align:center; padding:50px; font-family:sans-serif;">
            <h2 style="color:#ef4444;">✗ 결제 중 오류가 발생했습니다</h2>
            <p>${msg}</p>
            <p>잠시 후 파빌리온으로 돌아갑니다...</p>
            <script>setTimeout(function(){ window.location.href = '${redirectUrl}'; }, 2000);</script>
        </body>
        </html>
    `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
