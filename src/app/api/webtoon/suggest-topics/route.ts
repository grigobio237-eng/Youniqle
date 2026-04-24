import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

/**
 * 웹툰 주제 자동 제안 API
 * 
 * POST /api/webtoon/suggest-topics
 * Body: { genre: string, userContext?: string }
 * Returns: { success: boolean, ideas: string[] }
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { genre, userContext } = body;

        if (!genre) {
            return NextResponse.json(
                { error: 'Genre is required' },
                { status: 400 }
            );
        }

        // 유니클의 5가지 주제 추천
        const ideas = await GeminiAIEngine.suggestWebtoonTopics({
            genre,
            userContext
        });

        return NextResponse.json({
            success: true,
            ideas
        });

    } catch (error: any) {
        console.error('Topic Suggestion API Error:', error);
        return NextResponse.json(
            {
                error: error.message || 'Failed to generate topic suggestions',
                success: false,
                ideas: [] // fallback
            },
            { status: 500 }
        );
    }
}
