import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import RecoveryScore from '@/models/RecoveryScore';
import { getKSTDate } from '@/lib/date';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Calculate date range (last 14 days to be safe)
        const dates: string[] = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(getKSTDate(d));
        }

        const minDate = dates[0];

        // Fetch scores for all users in the range
        const allScores = await RecoveryScore.find({
            date: { $gte: minDate }
        }).select('date totalScore');

        // Group by date
        const grouped: Record<string, number[]> = {};
        allScores.forEach(s => {
            if (!grouped[s.date]) grouped[s.date] = [];
            grouped[s.date].push(s.totalScore);
        });

        // Calculate metrics
        const results = dates.map(date => {
            const scores = grouped[date] || [];
            
            // Fallback to synthetic data if no real data (to ensure UI looks good during early stage)
            if (scores.length === 0) {
                return {
                    date,
                    communityAvg: 65 + Math.random() * 5,
                    top10Avg: 85 + Math.random() * 5,
                    isFallback: true
                };
            }

            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            
            const sorted = [...scores].sort((a, b) => b - a);
            const top10Count = Math.max(1, Math.floor(sorted.length * 0.1));
            const top10 = sorted.slice(0, top10Count);
            const topAvg = top10.reduce((a, b) => a + b, 0) / top10.length;

            return {
                date,
                communityAvg: avg,
                top10Avg: topAvg,
                count: scores.length
            };
        });

        return NextResponse.json({ insights: results });
    } catch (error) {
        console.error('Failed to fetch recovery averages:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
