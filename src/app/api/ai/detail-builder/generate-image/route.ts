import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        const body = await request.json();
        const { visualPrompt, keyMessage, referenceImage, sectionId, isStemCellSolution } = body;

        console.log(`[Diagnostic] API Request for section ${sectionId}. API Key present: ${!!process.env.GEMINI_API_KEY} (${process.env.GEMINI_API_KEY?.substring(0, 5)}...)`);

        if (!visualPrompt) {
            return NextResponse.json({ error: '비주얼 프롬프트가 누락되었습니다.' }, { status: 400 });
        }

        // 실제 이미지 생성 로직 호출
        const imageUrl = await GeminiAIEngine.generateDetailImage({
            prompt: visualPrompt,
            keyMessage: keyMessage,
            referenceImage: referenceImage,
            aspectRatio: "9:16",
            isStemCellSolution: !!isStemCellSolution
        });

        return NextResponse.json({
            success: true,
            imageUrl,
            sectionId
        });

    } catch (error: any) {
        console.error('AI Image Generation Full Error Trace:', error);

        // Ensure error is a string for logging/JSON
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : 'No stack trace';

        return NextResponse.json({
            error: '이미지 생성 중 서버 오류가 발생했습니다.',
            message: errorMessage,
            stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
        }, { status: 500 });
    }
}
