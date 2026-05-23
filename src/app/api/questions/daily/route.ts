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
                // force=true 파라미터가 들어올 경우 기존 오늘자 데이터를 삭제하고 완전히 재생성
                const url = new URL(req.url);
                const forceRefresh = url.searchParams.get('force') === 'true';

                let question = await DailyQuestion.findOne({ userId, date });
                if (question && !forceRefresh) return { question };

                if (question && forceRefresh) {
                    console.log(`[Force Refresh] Deleting existing daily question for ${userId} to regenerate...`);
                    await DailyQuestion.deleteOne({ _id: question._id });
                }

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
                    // 몽고디비 DailyQuestion 스키마의 questions[].id: Number 제약을 위해 문자열 ID를 숫자로 정제
                    const sanitizedQuestions = (aiResult.questions || []).map((q: any, idx: number) => {
                        let numId = idx + 1;
                        if (q.id) {
                            if (typeof q.id === 'number') {
                                numId = q.id;
                            } else if (typeof q.id === 'string') {
                                const matched = q.id.match(/\d+/);
                                if (matched) {
                                    numId = parseInt(matched[0], 10);
                                }
                            }
                        }
                        return {
                            ...q,
                            id: numId
                        };
                    });

                    question = await DailyQuestion.create({
                        userId,
                        date,
                        questions: sanitizedQuestions,
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
