import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const body = await request.json();
        const { message, day, symptoms } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const response = await GeminiAIEngine.generateRecoveryChatResponse(message, {
            userName: session?.user?.name || '환자',
            day: day || 1,
            symptoms: symptoms || { pain: '없음', swelling: '정상', fever: '없음' }
        });

        return NextResponse.json({ response });

    } catch (error) {
        console.error('Recovery Chat Error:', error);
        return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
    }
}
