import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';
import dbConnect from '@/lib/db';
import AiAdvice from '@/models/AiAdvice';
import { getKSTDate } from '@/lib/date';

// Global request lock to prevent concurrent AI generations
const navigatorLock = (global as any)._navigatorLock || new Map<string, Promise<any>>();
(global as any)._navigatorLock = navigatorLock;

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        const body = await request.json();
        const { scores, yesterdayScore } = body;

        if (!scores) {
            return NextResponse.json({ error: 'Scores are required' }, { status: 400 });
        }

        await dbConnect();
        const todayStr = getKSTDate();
        const userId = session?.user ? (session.user as any).id : 'anonymous';

        const lockKey = `${userId}-${todayStr}`;
        let adviceData;

        if (navigatorLock.has(lockKey)) {
            console.log(`[Lock Hit] Waiting for in-progress navigator data for ${lockKey}`);
            adviceData = await navigatorLock.get(lockKey);
        } else {
            const requestPromise = (async () => {
                // 1. Check cache (DB)
                if (userId !== 'anonymous') {
                    const existingAdvice = await AiAdvice.findOne({ userId, date: todayStr });
                    if (existingAdvice) {
                        return {
                            comment: existingAdvice.aiComment,
                            actionItem: existingAdvice.actionItem,
                            recoveryScore: existingAdvice.totalScore,
                            tomorrowForecast: existingAdvice.tomorrowForecast
                        };
                    }
                }

                // 2. Generate with AI
                console.log(`[Gemini] Generating fresh navigator advice for ${userId} (${todayStr})...`);
                const advice = await GeminiAIEngine.generateNavigatorAdvice({
                    userId: userId,
                    date: todayStr,
                    scores,
                    yesterdayScore
                });

                const result = {
                    comment: advice?.comment,
                    actionItem: advice?.actionItem,
                    recoveryScore: advice?.recoveryScore,
                    tomorrowForecast: advice?.tomorrowForecast
                };

                // 3. Save to DB asynchronously
                if (userId !== 'anonymous' && advice) {
                    AiAdvice.create({
                        userId,
                        date: todayStr,
                        totalScore: advice.recoveryScore,
                        aiComment: advice.comment,
                        actionItem: advice.actionItem,
                        tomorrowForecast: advice.tomorrowForecast
                    }).catch(err => {
                        if (err.code !== 11000) console.error('Failed to save AI advice cache:', err);
                    });
                }

                return result;
            })();

            navigatorLock.set(lockKey, requestPromise);
            try {
                adviceData = await requestPromise;
            } finally {
                navigatorLock.delete(lockKey);
            }
        }

        return NextResponse.json(adviceData);

    } catch (error) {
        console.error('Navigator API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
