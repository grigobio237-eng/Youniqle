import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

/**
 * 인스타그램 캡션 생성 API
 * POST /api/webtoon/sns-caption
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { topic, panels } = body;

        if (!panels || !Array.isArray(panels)) {
            return NextResponse.json({ error: 'Panels are required' }, { status: 400 });
        }

        const captionData = await GeminiAIEngine.generateInstagramCaption({
            topic: topic || '오늘의 회복 이야기',
            panels
        });

        return NextResponse.json({
            success: true,
            ...captionData
        });

    } catch (error: any) {
        console.error('SNS Caption API Error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to generate caption',
            success: false,
            description: '오늘의 회복 기록!',
            hashtags: '#유니클 #회복챌린지'
        }, { status: 500 });
    }
}
