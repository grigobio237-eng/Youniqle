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
        const { productName, category } = body;

        if (!productName || !category) {
            return NextResponse.json({ error: '상품명과 카테고리를 입력해주세요.' }, { status: 400 });
        }

        const suggestion = await GeminiAIEngine.suggestProductFeatures(productName, category);

        return NextResponse.json({
            success: true,
            suggestion
        });

    } catch (error: any) {
        console.error('AI Feature Suggestion Error:', error);
        return NextResponse.json({
            error: error.message || '특징 추천 중 오류가 발생했습니다.'
        }, { status: 500 });
    }
}
