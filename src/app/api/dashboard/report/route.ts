import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import RecoveryReport from '@/models/RecoveryReport';
import RecoveryScore from '@/models/RecoveryScore';
import User from '@/models/User';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';
import { getKSTDate, getKSTWeekStart } from '@/lib/date';

const reportLock = (global as any)._reportLock || new Map<string, Promise<any>>();
(global as any)._reportLock = reportLock;

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const today = getKSTDate();
        const weekStart = getKSTWeekStart();
        const lockKey = `${user._id}-${weekStart}`;

        let resultData;
        if (reportLock.has(lockKey)) {
            console.log(`[Lock Hit] Waiting for in-progress report data for ${lockKey}`);
            resultData = await reportLock.get(lockKey);
        } else {
            const requestPromise = (async () => {
                // 1. Check if already generated today
                let report = await RecoveryReport.findOne({ 
                    userId: user._id, 
                    startDate: weekStart,
                    // Check if it was generated today (to see if we need a refresh)
                    updatedAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
                });

                if (report) return { report };

                // 2. Fetch scores for the week
                const scores = await RecoveryScore.find({
                    userId: user._id,
                    date: { $gte: weekStart }
                }).sort({ date: 1 });

                if (scores.length === 0) return { report: null, message: 'No data for this week' };

                // 3. Fetch community insight for context
                const allWeekScores = await RecoveryScore.find({
                    date: { $gte: weekStart }
                }).select('totalScore');
                
                let communityInsights;
                if (allWeekScores.length > 0) {
                    const globalAvg = allWeekScores.reduce((a, b) => a + b, 0) / allWeekScores.length;
                    const userAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
                    
                    // Simple percentile calculation
                    const sortedScores = allWeekScores.map(s => s.totalScore).sort((a, b) => b - a);
                    const rank = sortedScores.findIndex(s => userAvg >= s);
                    const percentile = Math.max(1, Math.round((rank / sortedScores.length) * 100));
                    
                    communityInsights = { avgScore: globalAvg, percentile };
                }

                // 4. Generate with Gemini
                console.log(`[Gemini] Generating weekly recovery report for ${user._id} (${weekStart})...`);
                const aiAnalysis = await GeminiAIEngine.analyzeRecoveryTrend({
                    userName: user.name,
                    scores: scores.map(s => ({
                        date: s.date,
                        score: s.totalScore,
                        metaphor: s.metaphor
                    })),
                    communityInsights
                });

                // 5. Save/Update report
                report = await RecoveryReport.findOneAndUpdate(
                    { userId: user._id, startDate: weekStart },
                    {
                        userId: user._id,
                        startDate: weekStart,
                        endDate: today,
                        summary: aiAnalysis.summary,
                        status: aiAnalysis.status,
                        recommendations: aiAnalysis.recommendations,
                        insight: aiAnalysis.insight,
                        percentileFeedback: aiAnalysis.percentileFeedback // New field
                    },
                    { upsert: true, new: true }
                );

                return { report };
            })();

            reportLock.set(lockKey, requestPromise);
            try {
                resultData = await requestPromise;
            } finally {
                reportLock.delete(lockKey);
            }
        }

        return NextResponse.json(resultData);
    } catch (error) {
        console.error('Recovery Report API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
