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
        const { name, category, keywords, sectionId, logicalSection } = body;

        if (!name || !category || !keywords || !sectionId || !logicalSection) {
            return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
        }

        const segment = await GeminiAIEngine.regenerateDetailSegment({
            name,
            category,
            keywords,
            sectionId,
            logicalSection
        });

        return NextResponse.json({ success: true, segment });

    } catch (error: any) {
        console.error('AI Detail Segment Regeneration Error:', error);
        return NextResponse.json({ error: error.message || '섹션 재생성 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
