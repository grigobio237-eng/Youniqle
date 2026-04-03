import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Diagnosis from '@/models/Diagnosis';
import User from '@/models/User';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
        제공된 이미지에서 음식을 식별하고 다음 형식으로 분석 결과를 반환하세요.
        
        [CONTEXT & PERSONA]
        ${contextInstruction}

        [REQUIRED RESPONSE FORMAT (JSON)]
        {
            "foodName": "음식 명칭",
            "recoveryPoints": ["핵심 영양 성분 1개", "회복 포인트 1개", "주의 사항 또는 팁 1개"],
            "analysis": "존댓말로 작성된 상세 회복 조언 및 영양 분석",
            "matchScore": 0~100 (사용자 여정 및 데이터와의 궁합)
        }

        [RULES]
        1. **영양 정보 통합**: 칼로리, 주요 영양소(탄/단/지/비타민 등) 정보를 표가 아닌 **자연스러운 설명 문장** 속에 녹여내세요. (예: "이 음식은 약 200kcal로 부담이 적으며, 특히 비타민 C가 풍부해...")
        2. **여정별 페르소나 준수**: 선택된 여정(Clinical/Wellness)에 최적화된 용어와 톤앤메너를 사용하세요.
        3. **브랜드 톤**: 유니클의 이미지에 맞게 고급스럽고 전문적이며 다정한 한국어 존댓말을 사용하세요.
        4. **비저장 원칙**: 사용자의 사진 정보는 이 분석 직후 폐기됨을 인지하고 분석에만 집중하세요.
        5. 반드시 유효한 JSON 형식으로만 답변하세요.
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
