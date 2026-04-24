import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { symptom } = body;

        if (!symptom) {
            return NextResponse.json({ error: 'Symptom is required' }, { status: 400 });
        }

        console.log('🤖 유니클 증상 분석 시작:', symptom);
        const result = await GeminiAIEngine.analyzeSymptom(symptom);
        
        // 실시간 맞춤형 문진지 생성
        const dynamicQuestions = await GeminiAIEngine.generateDynamicQuestions(symptom, result.category);
        console.log('✅ 유니클 분석 및 질문지 생성 완료');

        return NextResponse.json({
            ...result,
            dynamicQuestions
        });
    } catch (error: any) {
        console.error('Symptom Analysis API Error:', error);
        return NextResponse.json({ 
            category: 'GENERAL', 
            reason: '서버 오류로 인해 일반 상담으로 안내해 드립니다.' 
        }, { status: 500 });
    }
}
