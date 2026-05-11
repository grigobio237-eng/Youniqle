import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';
import dbConnect from '@/lib/db';
import AiRoutineLog from '@/models/AiRoutineLog';
import { getKSTDate } from '@/lib/date';

const routineLock = (global as any)._routineLock || new Map<string, Promise<any>>();
(global as any)._routineLock = routineLock;

const SLOT_MAP: Record<string, string> = {
    '새벽 루틴': 'DAWN',
    '아침 루틴': 'MORNING',
    '오전 루틴': 'MORNING',
    '점심 루틴': 'LUNCH',
    '오후 루틴': 'AFTERNOON',
    '저녁 루틴': 'EVENING',
    '밤 루틴': 'NIGHT',
    '심야 루틴': 'NIGHT',
    '데일리 회복': 'MORNING'
};

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { timeSlot, userStatus, score: providedScore } = body;

        await dbConnect();
        const todayStr = getKSTDate();
        const userId = (session.user as any).id;
        const slotName = timeSlot || '데일리 회복';
        const slot = SLOT_MAP[slotName] || 'MORNING';

        // Fallback to latest recovery score if not provided
        let finalScore = providedScore || (userStatus?.physical ? (userStatus.physical + userStatus.mental + userStatus.sleep) / 3 : 0);
        
        // Normalize score if it's likely from 40-scale diagnosis
        if (finalScore > 0 && finalScore <= 40) {
            finalScore = Math.round((finalScore / 40) * 100);
        }

        if (finalScore === 0) {
            const RecoveryScore = (await import('@/models/RecoveryScore')).default;
            const latestScore = await RecoveryScore.findOne({ userId }).sort({ date: -1 });
            if (latestScore) {
                console.log(`[Routine] No today's score, using latest score from ${latestScore.date}: ${latestScore.totalScore}`);
                finalScore = latestScore.totalScore;
            }
        }

        const lockKey = `${userId}-${todayStr}-${slot}`;
        let routineData;

        if (routineLock.has(lockKey)) {
            console.log(`[Routine] Lock Hit: Waiting for ${lockKey}`);
            routineData = await routineLock.get(lockKey);
        } else {
            const requestPromise = (async () => {
                // 1. Check existing log
                const log = await AiRoutineLog.findOne({ 
                    userId: typeof userId === 'string' ? userId : userId.toString(), 
                    date: todayStr 
                });
                
                if (log) {
                    const existingRoutine = log.routines.find((r: any) => r.slot === slot);
                    if (existingRoutine && existingRoutine.tasks && existingRoutine.tasks.length > 0) {
                        console.log(`[Routine] Cache Hit: ${lockKey}`);
                        return existingRoutine;
                    }
                }

                // 2. Generate with AI
                console.log(`[Routine] Cache Miss: Generating for ${lockKey} (Score: ${finalScore})`);
                const routine = await GeminiAIEngine.generateDailyRoutines({
                    score: finalScore,
                    slotName,
                    slotCode: slot as any
                });

                // 3. Save to DB - Use specific update to avoid duplicates for the same slot
                await AiRoutineLog.updateOne(
                    { userId, date: todayStr },
                    { 
                        $pull: { routines: { slot: slot } } // Remove any existing for this slot just in case
                    },
                    { upsert: true }
                );

                await AiRoutineLog.updateOne(
                    { userId, date: todayStr },
                    { 
                        $push: { routines: routine } 
                    }
                );

                console.log(`[Routine] Created & Saved: ${lockKey}`);
                return routine;
            })();

            routineLock.set(lockKey, requestPromise);
            try {
                routineData = await requestPromise;
            } finally {
                routineLock.delete(lockKey);
            }
        }

        return NextResponse.json(routineData);

    } catch (error) {
        console.error('Routine API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
