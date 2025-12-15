import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MockAIEngine } from '@/lib/ai/mock-engine';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // In production, we would require a session.
        // For now, allow anonymous requests for testing if needed, or enforce session.
        // if (!session) {
        //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        const body = await request.json();
        const { scores, yesterdayScore } = body;

        // Validate inputs
        if (!scores) {
            return NextResponse.json({ error: 'Scores are required' }, { status: 400 });
        }

        const advice = await MockAIEngine.generateNavigatorAdvice({
            userId: session?.user?.email || 'anonymous',
            date: new Date().toISOString(),
            scores,
            yesterdayScore
        });

        return NextResponse.json(advice);

    } catch (error) {
        console.error('AI Navigator Error:', error);
        return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
    }
}
