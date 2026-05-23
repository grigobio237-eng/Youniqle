
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Diagnosis from '@/models/Diagnosis';
import RecoveryScore from '@/models/RecoveryScore';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // For development/testing, use test email if no session
        const TEST_USER_EMAIL = 'sin93101190@gmail.com';
        const userEmail = session?.user?.email || TEST_USER_EMAIL;

        await connectDB();

        // Find user to get their ID
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { AccessControl } = await import('@/lib/logic/access-control');
        const limits = AccessControl.getLimits(user);
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - limits.dataRetentionDays);

        // Fetch both diagnoses and recovery scores
        const [diagnoses, recoveryScores] = await Promise.all([
            Diagnosis.find({ 
                userId: user._id,
                createdAt: { $gte: cutoffDate }
            })
                .select('type totalScore categoryScores resultTitle aiSolution createdAt')
                .lean(),
            RecoveryScore.find({
                userId: user._id,
                createdAt: { $gte: cutoffDate }
            })
                .select('rawScore totalScore metaphor answers createdAt')
                .lean()
        ]);

        const mappedRecoveryScores = (recoveryScores || []).map((score: any) => {
            const categoryScores: Record<string, number> = {
                physical: 60,
                mental: 60,
                sleep: 60,
                lifestyle: 60
            };

            if (Array.isArray(score.answers)) {
                score.answers.forEach((ans: any) => {
                    const cat = (ans.category || '').toLowerCase();
                    if (cat.includes('physical') || cat.includes('body')) {
                        categoryScores.physical = Math.round(ans.score * 20);
                    } else if (cat.includes('mental') || cat.includes('psychological')) {
                        categoryScores.mental = Math.round(ans.score * 20);
                    } else if (cat.includes('sleep')) {
                        categoryScores.sleep = Math.round(ans.score * 20);
                    } else if (cat.includes('lifestyle') || cat.includes('nutrition')) {
                        categoryScores.lifestyle = Math.round(ans.score * 20);
                    }
                });
            }

            return {
                _id: score._id.toString(),
                type: 'RECOVERY_RHYTHM',
                totalScore: score.totalScore,
                categoryScores,
                resultTitle: '60초 리듬체크',
                aiSolution: score.metaphor,
                createdAt: score.createdAt
            };
        });

        // Merge and sort by createdAt descending
        const history = [...diagnoses, ...mappedRecoveryScores].sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({
            success: true,
            history
        });

    } catch (error) {
        console.error('Recovery History API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
