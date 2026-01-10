import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@/models/User';
import dbConnect from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        // 나이스페이는 form-data로 응답을 보냄
        const formData = await request.formData();

        const authResultCode = formData.get('AuthResultCode') as string;
        const authResultMsg = formData.get('AuthResultMsg') as string;
        const authToken = formData.get('AuthToken') as string;
        const mid = formData.get('MID') as string;
        const moid = formData.get('Moid') as string; // SUB_UserKey_Timestamp
        const amt = formData.get('Amt') as string;
        const txTid = formData.get('TxTid') as string;
        const nextAppURL = formData.get('NextAppURL') as string;
        const signature = formData.get('Signature') as string;

        const merchantKey = process.env.NICEPAY_MERCHANT_KEY || '';
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        // 1. 인증 실패 처리
        if (authResultCode !== '0000') {
            const failUrl = `${baseUrl}/lounge/subscribe?error=${encodeURIComponent(authResultMsg)}`;
            return NextResponse.redirect(failUrl, 302);
        }

        // 2. 승인 요청 (서버 -> 나이스페이)
        const ediDate = new Date().toISOString()
            .replace(new RegExp('[-:T' + '.]', 'g'), '')
            .substring(0, 14);
        const signData = crypto.createHash('sha256')
            .update(authToken + mid + amt + ediDate + merchantKey)
            .digest('hex');

        const approvalResponse = await fetch(nextAppURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                TID: txTid,
                AuthToken: authToken,
                MID: mid,
                Amt: amt,
                EdiDate: ediDate,
                SignData: signData,
                CharSet: 'utf-8'
            }).toString()
        });

        const approvalResult = await approvalResponse.json().catch(() => null) || {};

        // 나이스페이 API 응답이 JSON이 아닐 수도 있으므로 텍스트 파싱 대비 (보통 JSON)
        // 하지만 실패 시 리디렉션 처리
        const resultCode = approvalResult.ResultCode || approvalResult.resultCode;

        if (resultCode !== '3001' && resultCode !== '0000' && resultCode !== '4000' && resultCode !== '4100') {
            // 실패 시 (3001: 카드 성공, others vary)
            // 엄밀히는 3001(카드), 4000(계좌) 등 성공 코드가 다름. 
            // 여기서는 간단히 성공 코드가 아니라고 판단되면 실패 처리. 
            // 나이스페이는 실패시 0000이 아님. (Card success is 3001 normally)
            // Actually 3001 is typical success for Card.
            console.error('Payment Approval Failed:', approvalResult);
            const failUrl = `${baseUrl}/lounge/subscribe?error=${encodeURIComponent(approvalResult.ResultMsg || '승인 실패')}`;
            return NextResponse.redirect(failUrl, 302);
        }

        // 3. 결제 성공 -> DB 업데이트
        await dbConnect();

        // moid format: SUB_{userId}_{timestamp}
        // Extract userId
        const parts = moid.split('_');
        if (parts.length >= 2) {
            const userId = parts[1];

            const oneMonthLater = new Date();
            oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

            await User.findByIdAndUpdate(userId, {
                $set: {
                    subscription: {
                        status: 'active',
                        plan: 'lounge_chat',
                        expiresAt: oneMonthLater
                    }
                }
            });
        }

        // 4. 성공 페이지로 리디렉션
        const successUrl = `${baseUrl}/lounge?subscribed=true`; // Redirect back to lounge directly

        // 나이스페이가 iframe이 아닌 popup/redirect 방식일 경우 HTML 응답으로 리다이렉트 스크립트를 주는 게 안전할 수 있으나,
        // Next.js NextResponse.redirect도 동작함.
        return NextResponse.redirect(successUrl, 302);

    } catch (error) {
        console.error('Subscription Result Error:', error);
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        return NextResponse.redirect(`${baseUrl}/lounge/subscribe?error=InternalError`, 302);
    }
}
