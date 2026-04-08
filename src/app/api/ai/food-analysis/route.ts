import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Diagnosis from '@/models/Diagnosis';
import User from '@/models/User';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Increase body size limit for high-res images
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

        // 1. Get User Data
        let latestDiagnosis = null;
        let isMissing = true;
        let isStale = false;

        if (session?.user?.email) {
            const user = await User.findOne({ email: session.user.email });
            if (user) {
                latestDiagnosis = await Diagnosis.findOne({ userId: user._id }).sort({ createdAt: -1 });
                if (latestDiagnosis) {
                    isMissing = false;
                    const diffDays = (Date.now() - new Date(latestDiagnosis.createdAt).getTime()) / (1000 * 60 * 60 * 24);
                    if (diffDays > 7) isStale = true;
                }
            }
        }

        // 2. Parse Image and Request
        const { image, journey } = await request.json();
        
        let base64Data = "";
        if (image) {
            // "data:image/png;base64,..." 형식을 처리하고 순수 Base64만 추출
            const parts = image.split(',');
            base64Data = parts.length > 1 ? parts[1] : parts[0];
        }

        if (!base64Data || base64Data.length < 10) {
            return NextResponse.json({ error: '유효한 이미지 데이터가 없습니다. 다시 캡처해주세요.' }, { status: 400 });
        }

        // 3. Prepare Gemini Prompt
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        let contextInstruction = "";
        
        // Journey-based specific instructions
        if (journey === 'CLINICAL') {
            contextInstruction += `[USER JOURNEY: CLINICAL CARE] 
            사용자는 현재 시술이나 수술을 앞두고 있거나 회복 중인 환자 모드입니다. 
            상처 회복, 면역력 강화, 부기 완화, 금기 식품 주의사항 등 '의학적 보조 회복' 관점에서 매우 전문적이고 안심을 주는 조언을 제공하세요. \n`;
        } else if (journey === 'WELLNESS') {
            contextInstruction += `[USER JOURNEY: WELLNESS RHYTHM] 
            사용자는 일상의 활력을 되찾고 번아웃을 예방하려는 웰니스 모드입니다. 
            에너지 부스팅, 수면 질 개선, 스트레스 해소, 생체 리듬 최적화 관점에서 활기차고 동기부여가 되는 조언을 제공하세요. \n`;
        } else {
            contextInstruction += `[USER JOURNEY: GENERAL DISCOVERY] 
            사용자는 가벼운 호기심으로 음식을 스캔했습니다. 
            이 음식이 가진 일반적인 회복 효능을 친절하게 설명하고, 더 깊은 관리를 위해 여정을 선택하도록 유도하는 뉘앙스를 담으세요. \n`;
        }

        // Add Diagnosis context if available
        if (!isMissing) {
            contextInstruction += `[USER DATA] 
            최근 진단 점수: 총점 ${latestDiagnosis.totalScore}/160, 
            신체(${latestDiagnosis.categoryScores.physical}), 정신(${latestDiagnosis.categoryScores.mental}), 
            생활(${latestDiagnosis.categoryScores.lifestyle}), 수면(${latestDiagnosis.categoryScores.sleep}). 
            특히 점수가 낮은 영역을 보완할 수 있는 영양적 가치를 강조하세요. \n`;
        } else {
            contextInstruction += `[USER DATA] 진단 데이터 없음. 보편적인 건강 지표를 기준으로 설명하세요. \n`;
        }

        const prompt = `
        [ROLE: Youniqle Recovery Specialist]
        당신은 프리미엄 회복 라이프스타일 브랜드 '유니클(Youniqle)'의 AI 전문가입니다.
        제공된 이미지에서 대상을 식별하고, 그것이 사용자의 회복(Recovery)에 어떤 과학적/환경적/영양적 이점을 주는지 분석하세요.
        
        [ANALYSIS TARGETS]
        1. Meal (식단): 영양 성분과 회복 효능 분석.
        2. Space (공간/환경): 조명, 온도, 분위기, 가구 배치 등 환경이 신체/정신 회복에 미치는 이점 분석.
        3. State (시술 부위/상태): 시술 전/후 상태나 현재의 신체적 컨디션을 분석하여 회복 관점의 피드백 제공.

        [CONTEXT & PERSONA]
        ${contextInstruction}

        [REQUIRED RESPONSE FORMAT (JSON)]
        {
            "subjectName": "식별된 대상 명칭 (예: 고단백 식단, 차분한 전구색 조명의 공간, 시술 전 피부 상태 등)",
            "type": "MEAL | SPACE | STATE | OTHER",
            "summary": "회복 관점에서의 핵심 가치 한 줄 요약",
            "analysisTable": [
                { "label": "분석 항목", "value": "상태/수치/주요성분", "benefit": "회복에 미치는 구체적이고 과학적인 이점" }
            ],
            "futureDirection": "향후 개선점 또는 추천되는 다음 회복 단계 (한 문장 내외)",
            "matchScore": 85
        }

        [RULES]
        1. 데이터 구조화: 모든 분석 결과는 'analysisTable' 배열에 3~5개의 핵심 항목으로 나누어 담으세요.
        2. 과학적 피드백: "좋습니다"와 같은 모호한 표현 대신 "멜라토닌 분비를 활발하게 합니다", "염증 수치를 낮추는 데 관여합니다" 등 구체적인 원리와 이점(Benefit)을 작성하세요.
        3. 브랜드 톤: 유니클의 이미지에 맞게 고급스럽고 전문적이며 신뢰감 있는 한국어 존댓말을 사용하세요.
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
        // Extract JSON from potential Markdown blocks
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const analysisData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

        return NextResponse.json({
            ...analysisData,
            scoreContext: {
                isMissing,
                isStale,
                lastSeen: latestDiagnosis?.createdAt
            }
        });

    } catch (error: any) {
        console.error('Food Analysis Error:', error);
        return NextResponse.json({ error: 'AI 분석 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
