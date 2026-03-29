import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const body = await request.json();
        const { day, symptoms, completedProtocols, totalProtocols } = body;

        const advice = await GeminiAIEngine.generateRecoveryAdvice({
            userName: session?.user?.name || '환자',
            day: day || 1,
            symptoms: symptoms || { pain: '없음', swelling: '정상', fever: '없음' },
            completedProtocols: completedProtocols || 0,
            totalProtocols: totalProtocols || 3
        });

        return NextResponse.json({ advice });

    } catch (error) {
        console.error('Recovery Guide Error:', error);
        return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
    }
}
