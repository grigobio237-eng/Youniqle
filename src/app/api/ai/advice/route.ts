import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';
import dbConnect from '@/lib/db';
import AiAdvice from '@/models/AiAdvice';
import { getKSTDate } from '@/lib/date';

const adviceLock = (global as any)._adviceLock || new Map<string, Promise<any>>();
(global as any)._adviceLock = adviceLock;

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { scores, yesterdayScore } = body;

        await dbConnect();
        const todayStr = getKSTDate();
        const userId = (session.user as any).id;
        const lockKey = `${userId}-${todayStr}`;

        let adviceData;
        if (adviceLock.has(lockKey)) {
            console.log(`[Lock Hit] Waiting for in-progress advice data for ${lockKey}`);
            adviceData = await adviceLock.get(lockKey);
        } else {
            const requestPromise = (async () => {
                // 1. Check cache (DB)
                const existing = await AiAdvice.findOne({ userId, date: todayStr });
                if (existing) {
                    return {
                        comment: existing.aiComment,
                        actionItem: existing.actionItem,
                        recoveryScore: existing.totalScore,
                        tomorrowForecast: existing.tomorrowForecast
                    };
                }

                // 2. Generate with AI
                console.log(`[Gemini] Generating fresh recovery advice for ${userId} (${todayStr})...`);
                const advice = await GeminiAIEngine.generateNavigatorAdvice({
                    userId,
                    date: todayStr,
                    scores,
                    yesterdayScore
                });

                // 3. Save to DB
                try {
                    await AiAdvice.create({
                        userId,
                        date: todayStr,
                        totalScore: advice.recoveryScore,
                        aiComment: advice.comment,
                        actionItem: advice.actionItem,
                        tomorrowForecast: advice.tomorrowForecast
                    });
                } catch (dbError: any) {
                    if (dbError.code !== 11000) console.error('Failed to save advice:', dbError);
                }

                return {
                    comment: advice.comment,
                    actionItem: advice.actionItem,
                    recoveryScore: advice.recoveryScore,
                    tomorrowForecast: advice.tomorrowForecast
                };
            })();

            adviceLock.set(lockKey, requestPromise);
            try {
                adviceData = await requestPromise;
            } finally {
                adviceLock.delete(lockKey);
            }
        }

        return NextResponse.json(adviceData);

    } catch (error) {
        console.error('Advice API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
