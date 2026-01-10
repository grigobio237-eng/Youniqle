import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
// 간단한 테스트를 위해 로그만 남거나 임시 DB 처리를 할 수 있습니다.
// 실제로는 문의(Inquiry) 컬렉션이나 코치 알림 시스템으로 연결되어야 합니다.

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { coachId, coachName, date, time, requestedBy } = body;

        console.log('--- Coaching Request Received ---');
        console.log(`Coach: ${coachName} (${coachId})`);
        console.log(`Date: ${date}`);
        console.log(`Time: ${time || 'FULL_DAY'}`);
        console.log(`User: ${requestedBy}`);
        console.log('---------------------------------');

        // TODO: Save to a CoachingRequest or Inquiry collection in the future.
        // For now, return success to simulate the flow.

        return NextResponse.json({
            success: true,
            message: 'Your coaching request has been sent successfully.'
        });
    } catch (error) {
        console.error('Coaching Request Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
