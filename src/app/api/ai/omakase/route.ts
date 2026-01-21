import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';
import connectDB from '@/lib/db';
import ConciergeRequest from '@/models/ConciergeRequest';

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

        // Save to DB
        await connectDB();
        await ConciergeRequest.create({
            userId: session?.user?.email || 'anonymous',
            userName: session?.user?.name || 'Anonymous',
            userEmail: session?.user?.email,
            painPoint,
            goal,
            budget,
            symptoms: symptoms || [],
            aiAnalysis: plans.analysis,
            suggestedPlans: plans.plans,
            status: 'pending'
        });

        return NextResponse.json(plans);

    } catch (error) {
        console.error('Omakase AI Error:', error);
        return NextResponse.json({ error: 'AI plan generation failed' }, { status: 500 });
    }
}
