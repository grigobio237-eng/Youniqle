import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import RecoveryScore from '@/models/RecoveryScore';
import SleepLog from '@/models/SleepLog';
import TodoLog from '@/models/TodoLog';
import UserBehavior from '@/models/UserBehavior';
import { getKSTDate } from '@/lib/date';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const userId = (session.user as any).id;
        const today = getKSTDate();

        // 1. Check Rhythm Check (Diagnosis)
        const hasDiagnosis = await RecoveryScore.exists({ userId, date: today });

        // 2. Check Sleep/Todo Log
        const hasSleepLog = await SleepLog.exists({ userId, date: today });
        const hasTodoLog = await TodoLog.exists({ userId, date: today });
        const hasRecoveryLog = hasSleepLog || hasTodoLog;

        // 3. Check Report View (via UserBehavior)
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const hasViewedReport = await UserBehavior.exists({
            userId,
            eventType: 'view',
            'context.pageUrl': { $regex: /\/reports|\/diagnosis\/report/ },
            timestamp: { $gte: startOfDay, $lte: endOfDay }
        });

        return NextResponse.json({
            missions: [
                {
                    id: 'rhythm_check',
                    text: '오늘의 회복 리듬 측정 완료하기',
                    isCompleted: !!hasDiagnosis,
                    href: '/diagnosis?type=daily'
                },
                {
                    id: 'report_view',
                    text: '내 회복 리포트 확인하기',
                    isCompleted: !!hasViewedReport,
                    href: '/reports'
                },
                {
                    id: 'recovery_log',
                    text: '오늘의 회복 기록 남기기 (수면/할일)',
                    isCompleted: !!hasRecoveryLog,
                    href: '/utils'
                }
            ]
        });
    } catch (error) {
        console.error('Missions GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
