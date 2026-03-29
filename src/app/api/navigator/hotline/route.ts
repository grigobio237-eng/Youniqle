import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.isNavigator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // System prompt for Advisory Hotline
    const systemInstruction = `당신은 세계 최고의 줄기세포 전문 기술 자문의입니다. 
네비게이터와 대화하고 있다고 가정하세요. 
질문자에게 전문적인 지식을 전달하되, 일반인도 쉽게 이해할 수 있도록 다정한 어조와 쉬운 비유를 섞어 설명하세요. 
답변은 한국어로 작성하며, 필요시 이모지를 적절히 사용하세요.

## ⛔ 절대 금지 사항 (매우 중요)
다음 단어들은 법적/운영 정책상 답변에 절대 포함되어서는 안 됩니다:
1. '의학박사', '의사', '진료', '시술', '환자', '환자 상담'
2. '유니클 자문위 의학박사'라는 명칭

대신 다음과 같은 표현을 사용하세요:
- '환자' -> '고객' 또는 '분'
- '시술/진료' -> '프로그램' 또는 '관리'
- '의학박사/의사' -> '줄기세포 전문가' 또는 '기술 자문위원'
- '환자 상담' -> '고객 안내' 또는 '설명'`;

    // Format history for Gemini if needed, but since we don't save to DB, 
    // we can just send the current message or the last few messages for context.
    const contextPrompt = history && history.length > 0 
      ? `이전 대화 맥락:\n${history.map((m: any) => `${m.role === 'user' ? '상담실장' : '자문의'}: ${m.content}`).join('\n')}\n\n현재 질문: ${message}`
      : message;

    // Use existing gemini-engine functionality
    // Using a more creative/warm tone (temperature 0.7-0.8)
    const responseText = await GeminiAIEngine.generateWithFallback(contextPrompt, systemInstruction, 0.8);

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error('Hotline API Error:', error);
    return NextResponse.json({ error: 'AI 응답을 생성하는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// Since the class method is static and might need access to it, 
// I'll ensure gemini-engine.ts has a generic generateWithFallback that takes history or prompt.
// I checked gemini-engine.ts earlier and it has generateWithFallback(prompt, systemInstruction, temperature).
