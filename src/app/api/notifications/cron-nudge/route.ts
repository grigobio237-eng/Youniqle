import { NextRequest, NextResponse } from 'next/server';
import { NudgeService } from '@/lib/notifications/nudge-service';

/**
 * 외부 크론 서비스(Vercel Cron, GitHub Actions 등)에서 호출하여 넛지를 자동 전송하는 엔드포인트
 */
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        
        // 보안을 위한 시크릿 키 체크
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Starting automated nudge process...');
        
        // 1. 데일리 체크인 리마인더
        const dailyResults = await NudgeService.sendDailyCheckInReminders();
        
        // 2. 스트릭 유도 넛지
        await NudgeService.sendStreakNudges();

        return NextResponse.json({ 
            success: true, 
            timestamp: new Date().toISOString(),
            dailyResults 
        });
    } catch (error: any) {
        console.error('Cron Nudge Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
