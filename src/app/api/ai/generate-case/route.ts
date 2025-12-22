import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { symptom, age, gender } = body;

        if (!symptom) {
            return NextResponse.json(
                { error: 'Symptom is required' },
                { status: 400 }
            );
        }

        const result = await GeminiAIEngine.generateRecoveryCase({
            symptom,
            age,
            gender
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Case Generation API Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate case' },
            { status: 500 }
        );
    }
}
