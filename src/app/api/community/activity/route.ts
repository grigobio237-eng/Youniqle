import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RecoveryScore from '@/models/RecoveryScore';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        
        // 최신 20개의 회복 기록 조회
        const latestActivities = await RecoveryScore.find()
            .sort({ createdAt: -1 })
            .limit(20);

        const results = [];
        for (const act of latestActivities) {
            const user = await User.findById(act.userId);
            const name = user?.name || '요원';
            const anonymizedName = name.length > 2 
                ? name[0] + '*'.repeat(name.length - 2) + name.slice(-1)
                : name[0] + '*';

            results.push({
                id: act._id,
                name: anonymizedName,
                avatar: user?.avatar,
                metaphor: act.metaphor,
                totalScore: act.totalScore,
                date: act.date,
                createdAt: act.createdAt
            });
        }

        return NextResponse.json({ success: true, activities: results });
    } catch (error: any) {
        console.error('Activity Feed API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
