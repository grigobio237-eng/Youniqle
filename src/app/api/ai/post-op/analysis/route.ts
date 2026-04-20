import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper: retry with exponential backoff for rate-limited requests
async function generateWithRetry(model: any, content: any[], maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await model.generateContent(content);
        } catch (error: any) {
            const isRateLimit = error?.message?.includes('429') || error?.message?.includes('Resource exhausted');
            if (isRateLimit && attempt < maxRetries) {
                const waitMs = attempt * 2000; 
                console.log(`Post-Op: Rate limited. Attempt ${attempt}/${maxRetries}. Retrying in ${waitMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, waitMs));
                continue;
            }
            throw error; 
        }
    }
}

// Fallback logic: try 2.5-pro first, then 2.0-flash
async function generateWithFallback(content: any[]) {
    const modelsToTry = ["gemini-2.5-pro", "gemini-2.0-flash"];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Post-Op: Starting generation with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            return await generateWithRetry(model, content);
        } catch (error: any) {
            lastError = error;
            const isRateLimit = error?.message?.includes('429') || error?.message?.includes('Resource exhausted');
            const isNotFound = error?.message?.includes('404') || error?.status === 404;

            if (isRateLimit || isNotFound) {
                console.warn(`Post-Op: Model ${modelName} failed (${isRateLimit ? '429' : '404'}). Trying next model...`);
                continue; 
            }
            throw error; 
        }
    }
    throw lastError;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await req.json();
    const { image, answers, surgeryType, userName } = body;

    // 1. 이미지 데이터 처리 (있는 경우)
    const mediaPart = image && image.startsWith('data:image') ? {
      inlineData: {
        data: image.split(',')[1],
        mimeType: "image/webp"
      }
    } : null;

    // 2. 답변 텍스트화
    const answerStr = Object.entries(answers || {})
      .map(([key, value]) => `${key}: ${value}/5점`)
      .join(', ');

    const prompt = `
      [ROLE: Youniqle Expert Recovery AI]
      당신은 프리미엄 회복 라이프스타일 브랜드 '유니클(Youniqle)'의 수술 후 케어 전문가 AI입니다.
      유저 '${userName}'님의 수술(${surgeryType}) 후 문진 답변과 환부 사진을 분석하세요.

      [DATA]
      - 문진 답변: ${answerStr}
      - 수술 종류: ${surgeryType}

      [GOAL]
      1. 사진(있는 경우)을 보고 부기, 멍, 피부 상태 등을 전문적으로 판독하세요.
      2. 답변 점수를 합산하여 회복 점수(0-100)를 산출하세요.
      3. 유저에게 따뜻하고 전문적인 말투로 현재 상태 요약과 조언을 제공하세요.
      4. 결과는 반드시 다음과 같은 JSON 형식이여야 합니다:

      {
        "recoveryScore": 85,
        "summary": "회복이 매우 순조롭습니다.",
        "detailedAnalysis": "사진상에서 부기가 이전에 비해 많이 가라앉은 것이 보입니다. 현재 통증 수치도 정상 범위 내에 있으며...",
        "metrics": {
          "swellingLevel": "상/중/하",
          "pace": "빠름/보통/느림"
        }
      }
    `;

    const result = await generateWithFallback(mediaPart ? [prompt, mediaPart] : [prompt]);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const analysisData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

    return NextResponse.json(analysisData);

  } catch (error: any) {
    console.error('[AI Post-Op Analysis API Error]:', error);
    const isRateLimit = error?.message?.includes('429') || error?.message?.includes('Resource exhausted');
    if (isRateLimit) {
        return NextResponse.json({ 
            error: 'AI 서버가 잠시 바쁩니다. 잠시 후 다시 시도해주세요.' 
        }, { status: 503 });
    }
    return NextResponse.json({ error: '분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
