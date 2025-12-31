import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        const body = await request.json();
        const { name, category, price, keywords, promotion, targetGender, targetAge, length, referenceImage, isFunding } = body;

        if (!name || !category || !keywords) {
            return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
        }

        const plan = await GeminiAIEngine.planDetailPage({
            name,
            category,
            price: Number(price) || 0,
            promotion,
            keywords,
            targetGender,
            targetAge,
            length: length || 7,
            referenceImage,
            isFunding // Pass isFunding
        });

        return NextResponse.json({ success: true, plan });

    } catch (error: any) {
        console.error('AI Detail Planning Error:', error);
        return NextResponse.json({ error: error.message || '기획안 생성 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
