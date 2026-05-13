import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Diagnosis from '@/models/Diagnosis';
import RecoveryInsight from '@/models/RecoveryInsight';
import User from '@/models/User';
import GeminiAIEngine from '@/lib/ai/gemini-engine';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 1. Get latest daily diagnosis
        const latestDiagnosis = await Diagnosis.findOne({ 
            userId: user._id, 
            type: { $in: ['daily', 'DAILY', 'FREE'] }
        }).sort({ createdAt: -1 });

        if (!latestDiagnosis) {
            return NextResponse.json({ 
                insight: "아직 데일리 리커버리 체크 기록이 없습니다. 첫 번째 체크를 시작해 보세요!",
                isNew: false
            });
        }

        // 2. Get latest cached insight
        const cachedInsight = await RecoveryInsight.findOne({
            userId: user._id,
            type: 'daily'
        }).sort({ createdAt: -1 });

        // 3. Compare timestamps (Token Diet Logic)
        // If cached insight exists and its analyzed date is same or after the latest diagnosis date
        if (cachedInsight && new Date(cachedInsight.lastAnalyzedAt).getTime() >= new Date(latestDiagnosis.createdAt).getTime()) {
            return NextResponse.json({ 
                insight: cachedInsight.content,
                isNew: false,
                analyzedAt: cachedInsight.lastAnalyzedAt
            });
        }

        // 4. If new data exists, trigger Gemini Analysis
        // Fetch last 7 records for context to analyze trends
        const recentDiagnoses = await Diagnosis.find({
            userId: user._id,
            type: { $in: ['daily', 'DAILY', 'FREE'] }
        }).sort({ createdAt: -1 }).limit(7);

        const analysisPrompt = `
당신은 유니클(Youniqle)의 수석 리커버리 데이터 분석가입니다. 
사용자(${user.name})의 최근 데일리 리커버리 체크 기록들을 분석하여 '읽지 않아도 보이는' 직관적인 인사이트를 제공해야 합니다.

[최근 기록들]
${JSON.stringify(recentDiagnoses.map(d => ({
    date: d.createdAt,
    score: d.totalScore,
    categories: d.categoryScores,
    mainConcerns: d.answers.filter(a => a.score <= 3).map(a => a.question)
})))}

[출력 형식 가이드]
반드시 아래와 같은 JSON 형식으로만 답변하세요. 다른 텍스트는 포함하지 마세요.

{
  "headline": "유저의 상태를 꿰뚫는 한 줄 평 (예: 정신력은 강하시네요! 하지만 몸은 방전 직전입니다.)",
  "statusBadge": "EXCELLENT | GOOD | CAUTION | RISK 중 하나",
  "radarData": [
    { "subject": "Physical", "A": 점수(0-100), "fullMark": 100 },
    { "subject": "Mental", "A": 점수(0-100), "fullMark": 100 },
    { "subject": "Sleep", "A": 점수(0-100), "fullMark": 100 },
    { "subject": "Lifestyle", "A": 점수(0-100), "fullMark": 100 }
  ],
  "summary": "핵심 패턴 분석 2-3문장",
  "missions": [
    { "category": "카테고리명", "title": "넛지형 미션 제목 (예: 오늘 밤 11시, 폰 오프)", "effect": "기대 효과", "reward": "회복 포인트 +50" },
    { "category": "카테고리명", "title": "넛지형 미션 제목", "effect": "기대 효과", "reward": "회복 포인트 +50" }
  ],
  "detailedAnalysis": "원인 추론 및 상세 설명을 포함한 마크다운 텍스트 (아코디언용)"
}

[주의사항]
- headline은 전문적이면서도 따뜻한 넛지(Nudge) 어조를 유지하세요.
- missions는 유저가 오늘 당장 실천 가능한 아주 구체적인 행동이어야 합니다.
- 한국어로 작성하세요.
`;

        const aiResponse = await GeminiAIEngine.generateWithFallback(analysisPrompt, "유니클 리커버리 데이터 분석가 JSON 모드", 0.3);
        
        // JSON 파싱 시 발생할 수 있는 마크다운 백틱 제거
        const cleanJson = aiResponse.replace(/```json|```/g, '').trim();
        const parsedInsight = JSON.parse(cleanJson);

        // 5. Save/Update cache
        if (cachedInsight) {
            cachedInsight.content = JSON.stringify(parsedInsight);
            cachedInsight.lastAnalyzedAt = latestDiagnosis.createdAt;
            await cachedInsight.save();
        } else {
            await RecoveryInsight.create({
                userId: user._id,
                type: 'daily',
                content: JSON.stringify(parsedInsight),
                lastAnalyzedAt: latestDiagnosis.createdAt
            });
        }

        return NextResponse.json({ 
            insight: parsedInsight,
            isNew: true,
            analyzedAt: latestDiagnosis.createdAt
        });

    } catch (error: any) {
        console.error('Daily Trend AI Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
