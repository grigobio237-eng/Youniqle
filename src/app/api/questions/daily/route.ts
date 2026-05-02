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
                const scoreData = calculateUnifiedScore(user) as any;
                if (scoreData && scoreData.categories) {
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
            questions: [],
            error: error.message || 'Internal Server Error',
            theme: '에러 발생 (기본 문항로드)'
        }, { status: 200 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { journey, medicalCategory, treatmentType, analysisResult } = body;

        if (!analysisResult) {
            return NextResponse.json({ error: 'Analysis result is required' }, { status: 400 });
        }

        console.log(`[DailyQ] Generating dynamic questions for journey: ${journey}, Category: ${medicalCategory}`);

        const typeLabel = treatmentType === 'SURGERY' ? '수술' : '시술';
        let contextInstruction = "";
        if (journey === 'CLINICAL_PRE') {
            contextInstruction = `사용자는 현재 '${typeLabel} 전' 단계입니다.`;
        } else if (journey === 'CLINICAL_POST') {
            contextInstruction = `사용자는 현재 '${typeLabel} 후' 관리 단계입니다.`;
        } else {
            contextInstruction = `사용자는 '일상 회복(Wellness)' 단계입니다.`;
        }

        const prompt = `[메디컬/라이프케어 회복 전문가 모드]
지침: ${contextInstruction}
진료 분야: ${medicalCategory || '일반'}

사용자가 방금 촬영한 사진의 분석 결과입니다:
- 분석 대상: ${analysisResult.subjectName}
- 매칭 점수: ${analysisResult.matchScore}/100
- 분석 요약: "${analysisResult.summary}"
- 세부 지표: ${JSON.stringify(analysisResult.analysisTable || [])}

위 사진 분석 결과를 바탕으로, 사용자의 상태를 점검하고 맞춤형 회복을 돕는 **5개의 객관식 질문**을 JSON 배열로 생성하세요.
반드시 사진 속 내용(예: 먹은 음식, 피부 상태, 공간 환경 등)의 맥락을 적극적으로 반영한 질문이어야 합니다.

## 제약조건
1. 어조: 전문적이면서도 따뜻함.
2. 질문당 3~4개 선택지 (0=최상/해당없음, 3=보통/주의, 5=나쁨/불안정).
3. 카테고리: [신체, 환경, 심리, 영양, 행동] 중 선택.

## 응답 형식 (JSON Array Only, 마크다운 코드블록 제외)
[
  {
    "id": 1,
    "category": "카테고리",
    "text": "사진 맥락을 반영한 질문 내용",
    "options": [
      { "label": "최상 (또는 해당 없음)", "score": 0 },
      { "label": "보통 (주의 필요)", "score": 3 },
      { "label": "나쁨 (불안정)", "score": 5 }
    ]
  }
]`;

        const text = await GeminiAIEngine.generateWithFallback(prompt, "You are a professional recovery concierge AI.");
        
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        let questions = [];
        
        if (jsonMatch) {
            questions = JSON.parse(jsonMatch[0]);
        } else {
            throw new Error('AI response parsing failed');
        }

        return NextResponse.json({
            questions,
            theme: `${analysisResult.subjectName} 기반 맞춤 문진`,
            date: new Date().toISOString().split('T')[0],
            journey,
            medicalCategory
        });

    } catch (error: any) {
        console.error('[DailyQ POST] API Router Error:', error);
        return NextResponse.json({
            questions: [],
            error: error.message || 'Internal Server Error',
            theme: '기본 문항 로드 실패'
        }, { status: 500 });
    }
}
