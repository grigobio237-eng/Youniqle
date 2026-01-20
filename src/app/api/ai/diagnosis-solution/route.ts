
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Diagnosis from '@/models/Diagnosis';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const { scores, tScores, userInfo, diagnosisId } = body;

        if (!scores) {
            return NextResponse.json({ error: 'Missing scores' }, { status: 400 });
        }

        await connectDB();

        // 1. If diagnosisId is provided, check if solution already exists
        if (diagnosisId) {
            const existingDiag = await Diagnosis.findById(diagnosisId);
            if (existingDiag?.aiSolution?.analysis) {
                return NextResponse.json(existingDiag.aiSolution);
            }
        }

        // 2. Generate new solution via Gemini
        const solution = await GeminiAIEngine.generateDiagnosisSolution({
            scores,
            tScores,
            userInfo
        });

        // 3. Cache/Save if diagnosisId is provided
        if (diagnosisId) {
            await Diagnosis.findByIdAndUpdate(diagnosisId, {
                aiSolution: solution
            });
            console.log(`✅ AI Solution saved to Diagnosis ${diagnosisId}`);
        }

        return NextResponse.json(solution);

    } catch (error) {
        console.error('Diagnosis Solution API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
