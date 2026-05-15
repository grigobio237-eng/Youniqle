import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RecoveryScore from '@/models/RecoveryScore';
import User from '@/models/User';
import { getKSTDate } from '@/lib/date';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        
        // 이번 주(일요일부터) 시작일 계산
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const startOfWeekStr = getKSTDate(startOfWeek);

        // 이번 주 점수 합계 기준 상위 10명 집계
        const leaderboard = await RecoveryScore.aggregate([
            { $match: { date: { $gte: startOfWeekStr } } },
            { $group: {
                _id: '$userId',
                totalWeeklyScore: { $sum: '$totalScore' },
                averageScore: { $avg: '$totalScore' },
                checkinCount: { $sum: 1 }
            }},
            { $sort: { totalWeeklyScore: -1 } },
            { $limit: 10 }
        ]);

        // 유저 정보 결합 및 익명화(Privacy-first)
        const results = [];
        for (let i = 0; i < leaderboard.length; i++) {
            const entry = leaderboard[i];
            const user = await User.findById(entry._id);
            if (!user) continue;

            const name = user.name || '요원';
            const anonymizedName = name.length > 2 
                ? name[0] + '*'.repeat(name.length - 2) + name.slice(-1)
                : name[0] + '*';

            results.push({
                rank: i + 1,
                name: anonymizedName,
                avatar: user.avatar,
                totalScore: entry.totalWeeklyScore,
                averageScore: Math.round(entry.averageScore),
                checkinCount: entry.checkinCount,
                membershipTier: user.membershipTier || 'FREE'
            });
        }

        return NextResponse.json({ success: true, leaderboard: results });
    } catch (error: any) {
        console.error('Leaderboard API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
