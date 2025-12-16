import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        const body = await request.json();
        const { painPoint, goal, budget, symptoms } = body;

        // Validate inputs
        if (!painPoint || !goal || !budget) {
            return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
        }

        const plans = await GeminiAIEngine.generateOmakasePlans({
            userId: session?.user?.email || 'anonymous',
            painPoint,
            goal,
            budget,
            symptoms: symptoms || []
        });

        return NextResponse.json(plans);

    } catch (error) {
        console.error('Omakase AI Error:', error);
        return NextResponse.json({ error: 'AI plan generation failed' }, { status: 500 });
    }
}
