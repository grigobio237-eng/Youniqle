import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { theme, keywords, journey, medicalCategory, treatmentType, userTier } = body;

    // AI 엔진을 통해 맞춤형 5문항 생성
    const questions = await GeminiAIEngine.generateDailyQuestions(
      theme || "신체 및 심리 회복 상태 점검",
      keywords || "회복, 에너지, 통증, 컨디션",
      journey || 'WELLNESS',
      medicalCategory || 'GENERAL',
      treatmentType || 'PROCEDURE',
      userTier || 'NORMAL'
    );

    return NextResponse.json(questions);
  } catch (error: any) {
    console.error('Diagnosis Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
