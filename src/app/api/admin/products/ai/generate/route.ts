
import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

export async function POST(request: NextRequest) {
    try {
        const {
            name,
            price,
            category,
            keywords,
            images,
            tone,
            target
        } = await request.json();

        if (!name || !category || !keywords) {
            return NextResponse.json(
                { error: '필수 정보(상품명, 카테고리, 키워드)가 누락되었습니다.' },
                { status: 400 }
            );
        }

        // AI 엔진 호출
        const html = await GeminiAIEngine.generateProductDescriptionHtml({
            name,
            price,
            category,
            keywords,
            images: images || [],
            tone,
            target
        });

        return NextResponse.json({ html });

    } catch (error) {
        console.error('AI Product Generation Error:', error);
        return NextResponse.json(
            { error: '상세페이지 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
            { status: 500 }
        );
    }
}
