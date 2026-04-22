import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DailyQuestion from '@/models/DailyQuestion';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';
import { DAILY_THEMES } from '@/constants/dailyThemes';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import { calculateUnifiedScore } from '@/lib/score-engine';


export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const journey = (searchParams.get('journey') || 'WELLNESS') as 'WELLNESS' | 'CLINICAL_PRE' | 'CLINICAL_POST';
        const medicalCategory = searchParams.get('medicalCategory') || null;
        const treatmentType = searchParams.get('treatmentType') || null;

        // AUTH & PERSONALIZATION CONTEXT
        const session = await getServerSession(authOptions);
        let personalContext = '';
        let userId = null;

        if (session?.user?.email) {
            const user = await User.findOne({ email: session.user.email });
            if (user) {
                userId = user._id;
                const scoreData = calculateUnifiedScore(user);
                if (scoreData.categories) {
                    const lowCategories = Object.entries(scoreData.categories)
                        .filter(([_, score]) => (score as number) < 70)
                        .map(([cat, _]) => cat);
                    
                    if (lowCategories.length > 0) {
                        personalContext = `User has low scores in: ${lowCategories.join(', ')}. Focus questions on improving these areas.`;
                    }
                }
            }
        }


        // 1. Get Today's Date (YYYY-MM-DD)
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const dayOfWeek = now.getDay(); // 0-6

        console.log(`[DailyQ] Request for journey: ${journey}, Category: ${medicalCategory} on ${todayStr}`);

        // 2. Check DB (Personalized first, then global)
        let dailyQ = await DailyQuestion.findOne({ 
            date: todayStr, 
            journey: journey,
            medicalCategory: medicalCategory,
            userId: userId
        });


        if (!dailyQ) {
            console.log(`[DailyQ] No existing questions for ${journey}(${medicalCategory}). Generating via AI...`);

            const themeData = DAILY_THEMES[dayOfWeek] || DAILY_THEMES[1];
            
            // 3. Get User Tier & Context
            const { AccessControl } = await import('@/lib/logic/access-control');
            const user = userId ? await User.findById(userId) : null;
            const userTier = user ? AccessControl.getUserGroup(user) : 'NORMAL';
            
            // Premium 유저인 경우 최근 3일간의 스캔/진단 데이터를 추가 컨텍스트로 수집
            let recentData = null;
            if (userTier === 'PREMIUM' && user) {
                recentData = {
                    scans: user.scanTimeline?.slice(-3),
                    diagnosis: user.diagnosisResults?.slice(-3)
                };
            }

            // Call AI with journey, medical context AND personal context + Tier
            const questions = await GeminiAIEngine.generateDailyQuestions(
                themeData.theme, 
                `${themeData.keywords}, ${personalContext}`, 
                journey,
                medicalCategory,
                treatmentType,
                userTier,
                recentData
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
                    theme: `${themeData.theme} (${journey}${medicalCategory ? ` - ${medicalCategory}` : ''})${userId ? ' (Personalized)' : ''}`,
                    questions,
                    journey: journey,
                    medicalCategory: medicalCategory,
                    userId: userId
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
