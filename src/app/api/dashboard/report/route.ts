import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import LifeSnap from '@/models/LifeSnap';
import RecoveryReport from '@/models/RecoveryReport';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

// Helper: Get start of the current week (Monday)
const getWeekStartDate = () => {
    const now = new Date();
    const day = now.getDay() || 7; // Get current day number, converting Sun. to 7
    if (day !== 1) now.setHours(-24 * (day - 1)); // Set to previous Monday
    now.setHours(0, 0, 0, 0);
    return now;
};

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const weekStartDate = getWeekStartDate();
        
        const report = await RecoveryReport.findOne({
            userId: (session.user as any).id,
            weekStartDate: weekStartDate
        });

        return NextResponse.json({
            success: true,
            data: report // will be null if not generated yet
        });

    } catch (error) {
        console.error('Failed to fetch recovery report:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const weekStartDate = getWeekStartDate();
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekEndDate.getDate() + 6);
        weekEndDate.setHours(23, 59, 59, 999);

        // 1. 이미 이번 주 리포트가 있는지 확인
        const existingReport = await RecoveryReport.findOne({ userId, weekStartDate });
        if (existingReport) {
            return NextResponse.json({ success: true, data: existingReport, message: 'Already exists' });
        }

        // 2. 지난 7일간의 LifeSnap 데이터 가져오기
        const past7Days = new Date();
        past7Days.setDate(past7Days.getDate() - 7);

        const snaps = await LifeSnap.find({
            userId,
            createdAt: { $gte: past7Days }
        }).sort({ createdAt: 1 });

        // 스냅 개수 유효성 검사 (최소 1개, 권장 3개 이상이지만 테스트를 위해 1개 이상으로 설정)
        if (snaps.length < 1) {
            return NextResponse.json({ error: '데이터가 부족하여 리포트를 생성할 수 없습니다. (최소 1개의 스냅 필요)' }, { status: 400 });
        }

        // 3. 실제 유니클 샵 상품(Product) 데이터 가져오기 (RAG를 위한 컨텍스트 주입용)
        const Product = (await import('@/models/Product')).default;
        const availableProducts = await Product.find({ status: 'active' }).select('_id name category summary price images').limit(50);
        const productContext = availableProducts.map(p => `- [${p._id}] ${p.name} (가격: ${p.price}원): ${p.summary}`).join('\n');

        // 4. AI 분석용 프롬프트 구성 (최대 10개로 제한하여 컨텍스트 초과 방지)
        const recentSnaps = snaps.slice(-10);
        const snapContext = recentSnaps.map((s, idx) => `
            [스냅 ${idx + 1}] 카테고리: ${s.category}, 점수: ${s.score}, 요약: ${s.summary}
        `).join('\n');

        const prompt = `
        [ROLE: Youniqle LifeCare Analyst]
        당신은 사용자의 지난 7일간의 일상(식단, 수면, 피부 등) 스냅 기록을 종합하여 주간 맞춤형 회복 리포트를 작성하는 AI입니다.

        [AVAILABLE SHOP PRODUCTS]
        ${productContext}

        [USER DATA]
        ${snapContext}

        [INSTRUCTION]
        위 기록들을 종합 분석하여 아래 JSON 형식에 맞춰 응답을 작성해 주세요.
        1. score: 주간 종합 회복 점수 (0~100)
        2. summary: 사용자의 한 주를 요약하는 한 줄 평
        3. strengths: 잘한 점이나 긍정적인 신호 2가지 (배열 형식)
        4. weaknesses: 아쉬운 점이나 개선해야 할 점 2가지 (배열 형식)
        5. actionPlan: 다음 주를 위한 구체적인 행동 가이드라인 1가지
        6. recommendedProducts: (중요) 반드시 위 [AVAILABLE SHOP PRODUCTS] 목록 중에서 사용자의 상태 개선에 가장 적합한 실제 상품 2가지를 골라서 추천하세요. 각 객체는 productId, name, reason, price 필드를 포함해야 합니다.

        [REQUIRED RESPONSE FORMAT (JSON Only)]
        {
            "score": 85,
            "summary": "전반적으로 훌륭한 한 주였지만 수면 개선이 필요합니다.",
            "strengths": ["...", "..."],
            "weaknesses": ["...", "..."],
            "actionPlan": "...",
            "recommendedProducts": [
                { "productId": "...", "name": "...", "reason": "...", "price": 0 },
                { "productId": "...", "name": "...", "reason": "...", "price": 0 }
            ]
        }
        `;

        const resultText = await GeminiAIEngine.generateWithFallback([prompt]);
        let responseText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const aiData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

        // 추천 상품 데이터 보강 (실제 DB 이미지 URL 매핑)
        const enrichedProducts = (aiData.recommendedProducts || []).map((rp: any) => {
            const matchedDbProduct = availableProducts.find(p => p._id.toString() === rp.productId);
            return {
                productId: rp.productId,
                name: matchedDbProduct ? matchedDbProduct.name : rp.name,
                reason: rp.reason,
                price: matchedDbProduct ? matchedDbProduct.price : (rp.price || 0),
                imageUrl: matchedDbProduct?.images?.[0]?.url || ''
            };
        });

        // 5. DB 저장
        const report = await RecoveryReport.create({
            userId,
            weekStartDate,
            weekEndDate,
            analyzedSnapCount: snaps.length,
            score: aiData.score,
            summary: aiData.summary,
            strengths: aiData.strengths,
            weaknesses: aiData.weaknesses,
            actionPlan: aiData.actionPlan,
            recommendedProducts: enrichedProducts
        });

        return NextResponse.json({
            success: true,
            data: report
        });

    } catch (error: any) {
        console.error('Failed to generate recovery report:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
