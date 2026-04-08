import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        // Parse Image
        const { image } = await request.json();
        
        let base64Data = "";
        if (image) {
            const parts = image.split(',');
            base64Data = parts.length > 1 ? parts[1] : parts[0];
        }

        if (!base64Data || base64Data.length < 10) {
            return NextResponse.json({ error: '유효한 이미지 데이터가 없습니다. 다시 촬영해주세요.' }, { status: 400 });
        }

        // Prepare Gemini Prompt
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        [ROLE: Youniqle Posture Specialist]
        당신은 프리미엄 회복 라이프스타일 브랜드 '유니클(Youniqle)'의 AI 자세 분석 전문가입니다.
        제공된 유저의 전신 또는 상반신 사진을 분석하여 거북목(Turtle Neck), 어깨 비대칭(Shoulder Balance) 등 회복을 방해하는 자세 요소를 조언하세요.

        [ANALYSIS TARGETS]
        1. Turtle Neck (거북목): 귀와 어깨 중심선의 수직 정렬 상태 분석.
        2. Shoulder Balance (어깨 수평): 좌우 어깨의 높낮이 차이 분석.
        3. Alignment (정렬): 척추와 골반의 중심 정렬 상태.

        [REQUIRED RESPONSE FORMAT (JSON)]
        {
            "subjectName": "분석된 자세 명칭 (예: 거북목 초기 단계, 좌측 어깨 하향 상태 등)",
            "score": 0~100 사이의 자세 점수 (100점일수록 완벽한 정렬),
            "turtleNeckAngle": "추정되는 거북목 각도 또는 상태 설명",
            "shoulderBalance": "어깨 수평 상태 설명",
            "summary": "자세 상태에 대한 핵심적인 한 줄 피드백",
            "analysisTable": [
                { "label": "측정 항목", "value": "상태/수치", "benefit": "해당 자세가 회복 및 건강에 미치는 영향" }
            ],
            "futureDirection": "고급스러운 교정 가이드 및 추천 스트레칭 (한 문장 내외)"
        }

        [RULES]
        1. 시각적 단서 활용: 사진에서 보여지는 시각적 특징을 기반으로 최대한 구체적으로 설명하세요.
        2. 전문적인 톤: "어깨가 내려갔습니다" 대신 "견갑골의 비대칭적 정렬이 확인됩니다"와 같이 전문가의 언어를 사용하세요.
        3. 브랜드 가치: 유니클의 이미지에 맞게 단정하고 신뢰감 있는 한국어 존댓말을 사용하세요.
        4. 반드시 유효한 JSON 형식으로만 답변하세요.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/png"
                }
            }
        ]);

        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const analysisData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

        return NextResponse.json(analysisData);

    } catch (error: any) {
        console.error('Posture Analysis Error:', error);
        return NextResponse.json({ error: 'AI 분석 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
