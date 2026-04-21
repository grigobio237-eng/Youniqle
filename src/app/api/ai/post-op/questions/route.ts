import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { daysSinceSurgery, surgeryType, userName } = body;

    const prompt = `
      [ROLE: Youniqle Recovery specialist]
      당신은 프리미엄 회복 라이프스타일 브랜드 '유니클(Youniqle)'의 전문 회복 가이드입니다.
      수술 후 ${daysSinceSurgery}일차인 유저 '${userName}'님을 위한 맞춤형 '오늘의 회복 문진' 질문 3가지를 생성하세요.
      수술 종류: ${surgeryType || '일반 시술/수술'}

      [GOAL]
      유저가 매일 같은 질문에 지루해하지 않도록, 전문적이면서도 따뜻하고 세심한 말투(해요체)로 질문하세요.
      질문은 유저의 현재 회복 단계(D+${daysSinceSurgery})를 고려해야 합니다.

      [CONSTRAINTS]
      1. 질문은 핵심 지표인 '통증(Pain)', '부기(Swelling)', '심리상태(Mental)'를 골고루 포함해야 합니다.
      2. 각 질문은 객관식(5점 척도) 형태로 만드세요.
      3. 결과는 반드시 다음과 같은 JSON 형식이여야 합니다:
      {
        "questions": [
          {
            "id": "q1",
            "category": "pain | swelling | mental | etc",
            "question": "질문 내용",
            "options": [
              { "label": "매우 그렇다/심하다 등", "score": 1 },
              { "label": "그렇다", "score": 2 },
              { "label": "보통이다", "score": 3 },
              { "label": "아니다", "score": 4 },
              { "label": "전혀 아니다/매우 좋다 등", "score": 5 }
            ]
          }
        ]
      }

      [TONE]
      - 유니클 브랜드의 프리미엄한 느낌을 살려 정중하고 따뜻하게 호칭(${userName}님)을 사용하세요.
      - "오늘은 수술 부위의 욱신거림이 어제보다 조금 더 편안해지셨을까요?"와 같이 매일 변화를 체크하는 느낌을 줍니다.
    `;

    const responseTextRaw = await GeminiAIEngine.generateWithFallback(prompt);
    
    // JSON 추출 최적화: Markdown 코드 블록 제거 및 순수 JSON 추출
    const responseText = responseTextRaw.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const questionsData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

    return NextResponse.json(questionsData);

  } catch (error: any) {
    console.error('[AI Post-Op Questions API Error]:', error);
    return NextResponse.json({ error: '질문 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
