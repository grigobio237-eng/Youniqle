import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

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
        const session = await getServerSession(authOptions);

        let userName = "회원";
        if (session?.user?.email) {
            const user = await User.findOne({ email: session.user.email });
            if (user) {
                userName = user.name;
            }
        }

        const { image, journey, snapType } = await request.json();
        
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
            return NextResponse.json({ error: '유효한 이미지 데이터가 없습니다.' }, { status: 400 });
        }

        // 프롬프트 라우팅 로직
        let categoryPrompt = "";
        
        switch(snapType) {
            case 'MEAL':
                categoryPrompt = `이 사진에서 음식의 종류를 파악하고, 대략적인 칼로리와 3대 영양소(탄/단/지) 비율, 염분 수치를 추정해 줘.`;
                break;
            case 'HYDRATION':
                categoryPrompt = `이 사진에서 음료(물, 커피, 주스, 주류 등)를 파악하고 수분 섭취, 카페인, 혹은 당분/알콜이 회복에 미치는 영향을 분석해 줘.`;
                break;
            case 'SKIN':
                categoryPrompt = `이 사람의 얼굴이나 피부 상태를 보고 홍조, 모공, 수분감, 피로도 등을 분석해 줘. 스킨케어 팁이나 생활 습관 개선점을 제안해 줘.`;
                break;
            case 'SLEEP':
                categoryPrompt = `이 사진의 침실이나 수면 환경을 평가해 줘. 조도, 청결도, 분위기를 분석하고 숙면을 위한 개선점을 알려 줘.`;
                break;
            case 'ACTIVITY':
                categoryPrompt = `이 사진의 운동이나 산책 환경을 분석해 줘. 신체 활력에 어떤 이점을 주는지 동기부여가 되는 피드백을 제공해 줘.`;
                break;
            case 'ROUTINE':
                categoryPrompt = `이 사진의 영양제나 스킨케어, 관리 제품 루틴을 분석하고 이것이 자기관리에 어떤 긍정적 효과가 있는지 설명해 줘.`;
                break;
            case 'BODY':
                categoryPrompt = `이 사진의 몸 상태(부기, 멍, 자세 등)나 메모를 확인하고, 피로 회복이나 통증 완화를 위한 부드러운 조언을 제공해 줘.`;
                break;
            case 'MEDICAL_DOC':
                categoryPrompt = `이 사진은 병원 서류나 처방전입니다. [중요: 주민등록번호, 환자 이름, 연락처 등 개인정보는 절대 출력하지 마세요.] 오직 진단명, 증상, 혹은 처방된 성분의 목적과 건강상의 권고 사항만 텍스트로 추출하고 분석해 줘.`;
                break;
            case 'OTHER':
            default:
                categoryPrompt = `이 사진이 사용자의 일상과 회복(Recovery)에 어떤 의미를 가질 수 있는지 자유롭게 분석하고 응원의 메시지를 남겨 줘.`;
                break;
        }

        const prompt = `
        [ROLE: Youniqle Recovery Specialist]
        당신은 프리미엄 회복 라이프스타일 브랜드 '유니클(Youniqle)'의 친절하고 전문적인 AI 전문가입니다.
        현재 분석할 카테고리는 [${snapType}] 입니다.

        [ANALYSIS TARGET: ${snapType}]
        ${categoryPrompt}

        [VALIDATION RULE - CRITICAL]
        만약 사용자가 업로드한 이미지가 현재 선택된 카테고리 [${snapType}] 와(과) 전혀 관련이 없거나 분석이 불가능한 경우, 억지로 분석하지 마세요!
        반드시 JSON 응답에 아래 형식만 반환하고 종료하세요:
        {
            "isMismatch": true,
            "mismatchReason": "선택하신 카테고리와 관련 없는 사진이거나 분석할 수 없는 형식입니다. 정확한 사진을 다시 올려주세요."
        }

        [TONE & PERSONA]
        사용자의 이름은 '${userName}'입니다. 답변(summary, benefit, futureDirection 등)에서 가급적 사용자의 이름을 언급하며(예: "${userName}님, ...") 친근한 전문가로서 답변하세요. 격식체(~하십시오) 대신 부드럽고 따뜻한 해요체(~해요, ~해보세요)를 사용하세요.

        [REQUIRED RESPONSE FORMAT (JSON)]
        이미지가 정상적이라면 반드시 아래 형식으로 답변하세요:
        {
            "isMismatch": false,
            "subjectName": "식별된 대상 명칭",
            "summary": "회복 관점에서의 핵심 가치 한 줄 요약",
            "analysisTable": [
                { "label": "항목(예: 칼로리, 조도, 홍조 등)", "value": "상태/수치", "benefit": "회복에 미치는 긍정적 이점" }
            ],
            "futureDirection": "향후 추천되는 다음 회복 단계",
            "matchScore": 85
        }
        `;

        const resultText = await GeminiAIEngine.generateWithFallback([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            }
        ]);

        let responseText = resultText;
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const analysisData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

        return NextResponse.json(analysisData);

    } catch (error: any) {
        console.error('Life Snap AI Failure:', error);
        return NextResponse.json({ error: 'AI 분석 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
