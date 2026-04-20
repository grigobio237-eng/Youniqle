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
        let mimeType = "image/png"; // Default

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

        // Prepare Gemini Model
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // ... (생략된 기존 프롬프트/페르소나 로직 유지) ...
        // 1. Get User Data
        const session = await getServerSession(authOptions);
        let userName = "";
        if (session?.user?.email) {
            const user = await User.findOne({ email: session.user.email });
            if (user) userName = user.name;
        }

        // 2. Persona & Greeting Instruction
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
        2. 말투 지침: 유니클의 이미지에 맞게 고급스러우면서도 따뜻한 한국어 '해요체'를 사용하세요. 전문가의 견해를 친구처럼 부드럽게 전달해야 합니다.
        3. 반드시 유효한 JSON 형식으로만 답변하세요.
        `;

        const result = await model.generateContent([
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
        return NextResponse.json({ error: 'AI 분석 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
