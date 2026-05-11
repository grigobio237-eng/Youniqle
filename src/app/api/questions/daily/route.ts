import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import DailyQuestion from '@/models/DailyQuestion';
import User from '@/models/User';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';
import { getKSTDate } from '@/lib/date';

const dailyQLock = (global as any)._dailyQLock || new Map<string, Promise<any>>();
(global as any)._dailyQLock = dailyQLock;

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const date = getKSTDate();
        const question = await DailyQuestion.findOne({ userId: user._id, date });

        return NextResponse.json({ question });
    } catch (error) {
        console.error('Daily Question GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        
        const userId = user._id;
        const date = getKSTDate();
        const lockKey = `${userId}-${date}`;

        let resultData;
        if (dailyQLock.has(lockKey)) {
            console.log(`[Lock Hit] Waiting for in-progress Daily Question data for ${lockKey}`);
            resultData = await dailyQLock.get(lockKey);
        } else {
            const requestPromise = (async () => {
                // Check if already exists
                let question = await DailyQuestion.findOne({ userId, date });
                if (question) return { question };

                // Generate new questions with Gemini
                console.log(`[Gemini] Generating fresh daily questions for ${userId} (${date})...`);
                
                // Map user info to Gemini parameters
                const questions = await GeminiAIEngine.generateDailyQuestions(
                    '오늘의 회복 리듬',
                    '컨디션, 에너지, 회복',
                    'WELLNESS',
                    null,
                    null,
                    user.tier || 'NORMAL',
                    null,
                    user.medicationHistory?.join(', ') || ''
                );

                const aiResult = {
                    theme: '오늘의 회복 리듬',
                    questions: questions
                };

                if (!aiResult || !aiResult.questions) {
                    throw new Error('Failed to generate questions');
                }

                // Save to DB
                try {
                    question = await DailyQuestion.create({
                        userId,
                        date,
                        questions: aiResult.questions,
                        theme: aiResult.theme || '오늘의 회복 리듬',
                        journey: 'WELLNESS',
                        dayOfWeek: new Date().getDay()
                    });
                } catch (dbError: any) {
                    if (dbError.code === 11000) {
                        question = await DailyQuestion.findOne({ userId, date });
                    } else {
                        throw dbError;
                    }
                }

                return { question };
            })();

            dailyQLock.set(lockKey, requestPromise);
            try {
                resultData = await requestPromise;
            } finally {
                dailyQLock.delete(lockKey);
            }
        }

        return NextResponse.json(resultData);

    } catch (error: any) {
        console.error('Daily Question POST Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
