import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DailyQuestion from '@/models/DailyQuestion';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';
import { DAILY_THEMES } from '@/constants/dailyThemes';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // 1. Get Today's Date (YYYY-MM-DD) in Korean Time or UTC? 
        // Ideally use server time but normalized to date string
        const now = new Date();
        // Simple YYYY-MM-DD format
        const todayStr = now.toISOString().split('T')[0];
        const dayOfWeek = now.getDay(); // 0-6

        // 2. Check DB
        let dailyQ = await DailyQuestion.findOne({ date: todayStr });

        if (!dailyQ) {
            // 3. Generate if not exists
            console.log(`Generating questions for ${todayStr} (Day ${dayOfWeek})...`);

            const themeData = DAILY_THEMES[dayOfWeek] || DAILY_THEMES[1]; // Fallback Monday

            // Call AI
            const questions = await GeminiAIEngine.generateDailyQuestions(themeData.theme, themeData.keywords);

            if (!questions || questions.length === 0) {
                // Fallback if AI fails (use hardcoded fallback or error)
                return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
            }

            // 4. Save to DB with race-condition handling
            try {
                dailyQ = await DailyQuestion.create({
                    date: todayStr,
                    dayOfWeek,
                    theme: themeData.theme,
                    questions
                });
            } catch (createError: any) {
                // E11000: Duplicate key error (someone else saved it while AI was running)
                if (createError.code === 11000) {
                    console.log(`[Race Condition Handled] Fetching existing questions for ${todayStr}`);
                    dailyQ = await DailyQuestion.findOne({ date: todayStr });
                    if (!dailyQ) {
                        console.error(`[Critical] Date ${todayStr} exists in index but not found in DB!`);
                        throw createError;
                    }
                } else {
                    console.error('[Daily Question API] Unexpected DB error during create:', createError);
                    throw createError;
                }
            }
        }

        return NextResponse.json({
            questions: dailyQ.questions,
            theme: dailyQ.theme,
            date: dailyQ.date
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
