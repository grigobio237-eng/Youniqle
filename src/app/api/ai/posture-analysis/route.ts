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

// 모델 우선순위: 1순위 → 2순위 순으로 자동 Fallback
const MODEL_PRIORITY = [
    'gemini-2.5-pro',     // 1순위: 최신 고성능 모델
    'gemini-2.0-flash',   // 2순위: 예비 모델 (Fallback)
];

/**
 * 우선순위 모델을 순서대로 시도합니다.
 * 429(할당량 초과) 발생 시 다음 모델로 자동 전환합니다.
 */
async function generateWithFallback(content: any[]) {
    let lastError: any = null;

    for (const modelName of MODEL_PRIORITY) {
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                console.log(`[AI] 모델 시도: ${modelName} (attempt ${attempt})`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(content);
                console.log(`[AI] 성공: ${modelName}`);
                return result;
            } catch (error: any) {
                lastError = error;
                const isRateLimit = error?.message?.includes('429') || error?.message?.includes('Resource exhausted');
                const isNotFound = error?.message?.includes('404') || error?.message?.includes('not found');

                if (isNotFound) {
                    console.warn(`[AI] ${modelName} 없음 (404). 다음 모델로 전환합니다.`);
                    break;
                }

                if (isRateLimit && attempt < 2) {
                    console.warn(`[AI] ${modelName} 할당량 초과. 3초 후 재시도...`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    continue;
                }

                if (isRateLimit) {
                    console.warn(`[AI] ${modelName} 재시도 실패. 다음 모델로 전환합니다.`);
                    break;
                }

                throw error;
            }
        }
    }

    throw lastError || new Error('모든 AI 모델이 응답하지 않습니다.');
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        // Parse Image
        const { image } = await request.json();
        
        let base64Data = "";
        let mimeType = "image/png";

        if (image) {
            const match = image.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
                mimeType = match[1];
                base64Data = match[2];
            } else {
                base64Data = image;
            }
        }

        if (!base64Data || base64Data.length < 10) {
            return NextResponse.json({ error: '유효한 이미지 데이터가 없습니다. 다시 촬영해주세요.' }, { status: 400 });
        }

        // Get User Data
        const session = await getServerSession(authOptions);
        let userName = "";
        if (session?.user?.email) {
            const user = await User.findOne({ email: session.user.email });
            if (user) userName = user.name;
        }

        // Build Persona Instruction
        let personaInstruction = "";
        if (!userName) {
            personaInstruction = `사용자는 현재 익명입니다. '고객님' 같은 딱딱한 호칭을 피하고 바로 친근한 말투(~해요)로 정보를 전달하세요. 
            'futureDirection'에는 "로그인하시면 유니클이 메이트님의 자세 교정 데이터를 기록하고 체계적으로 관리해드릴 수 있어요!"와 같은 가입 유도 문구를 자연스럽게 포함하세요.`;
        } else {
            personaInstruction = `사용자의 이름은 '${userName}'입니다. 답변 중 가급적 사용자의 이름을 언급하며(예: "${userName}님, ...") 친근한 전문가로서 답변하세요. 
            격식체(~하십시오) 대신 부드럽고 따뜻한 해요체(~해요, ~해보세요)를 사용하세요.`;
        }

        const prompt = `
        [ROLE: Youniqle Posture Specialist]
        당신은 프리미엄 회복 라이프스타일 브랜드 '유니클(Youniqle)'의 친절하고 전문적인 AI 자세 분석 전문가입니다.
        제공된 유저의 사진을 분석하여 거북목, 어깨 비대칭 등 회복을 방해하는 요소를 찾아 부드럽게 조언하세요.

        [TONE & PERSONA]
        ${personaInstruction}

        [ANALYSIS TARGETS]
        1. Turtle Neck (거북목): 귀와 어깨 중심선의 수직 정렬 상태 분석.
        2. Shoulder Balance (어깨 수평): 좌우 어깨의 높납이 차이 분석.
        3. Alignment (정렬): 척추와 골반의 중심 정렬 상태.

        [REQUIRED RESPONSE FORMAT (JSON)]
        {
            "subjectName": "분석된 자세 명칭 (예: 거북목 초기 단계, 좌측 어깨 하향 상태 등)",
            "score": 0~100 사이의 점수,
            "turtleNeckAngle": "추정되는 거북목 각도 또는 상태 설명",
            "shoulderBalance": "어깨 수평 상태 설명",
            "summary": "자세 상태에 대한 핵심적인 피드백 (호칭 지침 준수)",
            "analysisTable": [
                { "label": "측정 항목", "value": "상태/수치", "benefit": "회복 및 건강에 미치는 영향 (호칭 및 말투 지침 준수)" }
            ],
            "futureDirection": "교정 가이드 및 가입 유도 (호칭 및 말투 지침 준수)"
        }

        [RULES]
        1. 시각적 단서 활용: 사진에서 보여지는 특징을 구체적으로 설명하세요.
        2. 말투 지침: 유니클의 이미지에 맞게 고급스러우면서도 따뜻한 한국어 '해요체'를 사용하세요.
        3. 반드시 유효한 JSON 형식으로만 답변하세요.
        `;

        // Call AI with automatic model fallback
        const result = await generateWithFallback([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            }
        ]);

        let responseText = result.response.text();
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const analysisData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

        return NextResponse.json(analysisData);

    } catch (error: any) {
        console.error('Posture Analysis Error:', error);
        const isRateLimit = error?.message?.includes('429') || error?.message?.includes('Resource exhausted');
        if (isRateLimit) {
            return NextResponse.json({ 
                error: 'AI 서버가 현재 바쁩니다. 잠시 후 다시 시도해주세요.' 
            }, { status: 503 });
        }
        return NextResponse.json({ error: 'AI 분석 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
