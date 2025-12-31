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
        const { section, referenceImage } = body;

        if (!section) {
            return NextResponse.json({ error: '섹션 정보가 누락되었습니다.' }, { status: 400 });
        }

        const result = await GeminiAIEngine.generateSectionImageContent(section, referenceImage);

        // 실제 이미지 생성 엔진(Imagen 3 등)이 연동되기 전까지는 
        // 시각적 요소와 카피가 포함된 기획안 상태를 반환하거나 
        // 외부 생성 API를 호출하는 로직이 위치함

        return NextResponse.json({ success: true, ...result });

    } catch (error: any) {
        console.error('AI Image Generation Error:', error);
        return NextResponse.json({ error: error.message || '이미지 생성 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
