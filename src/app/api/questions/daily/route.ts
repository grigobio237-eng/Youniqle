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
        const medicalCategory = searchParams.get('medicalCategory') || null;

        // 1. Get Today's Date (YYYY-MM-DD)
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const dayOfWeek = now.getDay(); // 0-6

        console.log(`[DailyQ] Request for journey: ${journey}, Category: ${medicalCategory} on ${todayStr}`);

        // 2. Check DB
        let dailyQ = await DailyQuestion.findOne({ 
            date: todayStr, 
            journey: journey,
            medicalCategory: medicalCategory 
        });

        if (!dailyQ) {
            console.log(`[DailyQ] No existing questions for ${journey}(${medicalCategory}). Generating via AI...`);

            const themeData = DAILY_THEMES[dayOfWeek] || DAILY_THEMES[1];
            
            // Call AI with journey and medical context
            const questions = await GeminiAIEngine.generateDailyQuestions(
                themeData.theme, 
                themeData.keywords, 
                journey,
                medicalCategory
            );

            if (!questions || !Array.isArray(questions) || questions.length === 0) {
                console.error(`[DailyQ] AI Generation failed or returned empty.`);
                return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
            }

            console.log(`[DailyQ] AI Success! Generated ${questions.length} questions. Saving to DB...`);

            // 4. Save to DB
            try {
                dailyQ = await DailyQuestion.create({
                    date: todayStr,
                    dayOfWeek,
                    theme: `${themeData.theme} (${journey}${medicalCategory ? ` - ${medicalCategory}` : ''})`,
                    questions,
                    journey: journey,
                    medicalCategory: medicalCategory
                });
                console.log(`[DailyQ] Created successfully. ID: ${dailyQ._id}`);
            } catch (createError: any) {
                if (createError.code === 11000) {
                    console.warn(`[DailyQ] Index collision. Finding existing record...`);
                    dailyQ = await DailyQuestion.findOne({ 
                        date: todayStr, 
                        journey: journey,
                        medicalCategory: medicalCategory 
                    });
                    
                    if (!dailyQ) {
                        dailyQ = await DailyQuestion.findOne({ date: todayStr, journey: journey });
                    }
                } else {
                    console.error(`[DailyQ] DB Save Error:`, createError);
                    throw createError;
                }
            }
        } else {
            console.log(`[DailyQ] Returning existing record for ${journey}(${medicalCategory}).`);
        }

        if (!dailyQ) {
            return NextResponse.json({ error: '데이터를 불러올 수 없습니다.' }, { status: 404 });
        }

        return NextResponse.json({
            questions: dailyQ.questions || [],
            theme: dailyQ.theme,
            date: dailyQ.date,
            journey: dailyQ.journey,
            medicalCategory: dailyQ.medicalCategory
        });

    } catch (error: any) {
        console.error('[DailyQ] API Router Error:', error);
        return NextResponse.json({
            questions: [], // Return empty array to prevent client crash
            error: error.message || 'Internal Server Error',
            details: error.toString(),
            theme: '에러 발생 (기본 문항로드)'
        }, { status: 200 }); // Return 200 with empty data to allow safe parsing on client
    }
}
