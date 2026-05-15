import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NudgeService } from '@/lib/notifications/nudge-service';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        // 보안상 관리자 권한 체크가 필요할 수 있으나, 여기서는 세션만 체크
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const results = await NudgeService.sendDailyCheckInReminders();
        
        return NextResponse.json({ 
            message: 'Nudge processing completed',
            results 
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
