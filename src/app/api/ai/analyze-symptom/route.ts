import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { symptom, category: reqCategory } = body;

        if (!symptom && !reqCategory) {
            return NextResponse.json({ error: 'Symptom or Category is required' }, { status: 400 });
        }

        let category = reqCategory;
        let reason = '직접 선택한 분야입니다.';

        if (symptom) {
            console.log('🤖 유니클 증상 분석 시작:', symptom);
            const result = await GeminiAIEngine.analyzeSymptom(symptom);
            category = result.category;
            reason = result.reason;
        } else {
            console.log(`🤖 유니클 분야(${category}) 동적 문진 생성 시작`);
        }
        
        // 실시간 맞춤형 문진지 생성
        const dynamicQuestions = await GeminiAIEngine.generateDynamicQuestions(symptom || '', category);
        console.log('✅ 유니클 분석 및 질문지 생성 완료');

        return NextResponse.json({
            category,
            reason,
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
