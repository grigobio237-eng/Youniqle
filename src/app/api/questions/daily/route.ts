import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DailyQuestion from '@/models/DailyQuestion';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';
import { DAILY_THEMES } from '@/constants/dailyThemes';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const journey = (searchParams.get('journey') || 'WELLNESS') as 'WELLNESS' | 'CLINICAL_PRE' | 'CLINICAL_POST';

        // 1. Get Today's Date (YYYY-MM-DD)
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const dayOfWeek = now.getDay(); // 0-6

        // 2. Check DB (Include journey in search to separate different clinical/wellness sets)
        // Note: If model doesn't have journey field, we can use a composite key or just allow it.
        // For now, let's assume we want to differentiate.
        let dailyQ = await DailyQuestion.findOne({ date: todayStr, journey: journey });

        if (!dailyQ) {
            // 3. Generate if not exists
            console.log(`Generating ${journey} questions for ${todayStr}...`);

            const themeData = DAILY_THEMES[dayOfWeek] || DAILY_THEMES[1];

            // Call AI with journey context
            const questions = await GeminiAIEngine.generateDailyQuestions(themeData.theme, themeData.keywords, journey);

            if (!questions || questions.length === 0) {
                return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
            }

            // 4. Save to DB
            try {
                dailyQ = await DailyQuestion.create({
                    date: todayStr,
                    dayOfWeek,
                    theme: `${themeData.theme} (${journey})`,
                    questions,
                    journey: journey // Ensure this field exists in your Mongoose model or skip if not strict
                });
            } catch (createError: any) {
                if (createError.code === 11000) {
                    dailyQ = await DailyQuestion.findOne({ date: todayStr, journey: journey });
                } else {
                    throw createError;
                }
            }
        }

        return NextResponse.json({
            questions: dailyQ.questions,
            theme: dailyQ.theme,
            date: dailyQ.date,
            journey: dailyQ.journey
        });

    } catch (error: any) {
        console.error('Daily Question API Error:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error.toString(),
            stack: error.stack
        }, { status: 500 });
    }
}
