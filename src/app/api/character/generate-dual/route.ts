import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { 
            prompt, 
            characterPrompt, 
            visualStyle, 
            referenceImage 
        } = body;

        // characterPrompt 또는 prompt 둘 중 하나는 있어야 함
        const finalPrompt = characterPrompt || prompt;

        if (!finalPrompt && !referenceImage) {
            return NextResponse.json({ 
                error: '캐릭터 설명 또는 사진이 필요합니다.' 
            }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log('[Character Generate] Creating dual character sheets...');

        // 1. 레퍼런스 이미지 분석 (있는 경우)
        let referenceDescription = "";
        if (referenceImage) {
            try {
                const base64Data = referenceImage.split(',')[1] || referenceImage;
                referenceDescription = await GeminiAIEngine.analyzeCharacterImage(base64Data);
                console.log('[Character Generate] Reference analyzed:', referenceDescription.substring(0, 100));
            } catch (err: any) {
                console.error('Reference analysis failed:', err);
                // 분석 실패해도 계속 진행
            }
        }

        // 2. 두 가지 캐릭터 병렬 생성
        const [refBasedResult, promptBasedResult] = await Promise.all([
            // 사진 기반 캐릭터 (사진이 있으면 항상 시도)
            referenceImage ? GeminiAIEngine.generateCharacterSheet({
                characterPrompt: referenceDescription || 'A character based on the uploaded reference photo, maintaining the key visual features',
                visualStyle: visualStyle || 'premium',
                referenceDescription: referenceDescription || 'Photo-based character'
            }).catch(e => {
                console.error('Ref-based generation failed:', e);
                return null;
            }) : Promise.resolve(null),

            // 프롬프트 기반 캐릭터 (사용자 입력이 있으면 시도)
            finalPrompt ? GeminiAIEngine.generateCharacterSheet({
                characterPrompt: finalPrompt,
                visualStyle: visualStyle || 'premium'
            }).catch(e => {
                console.error('Prompt-based generation failed:', e);
                return null;
            }) : Promise.resolve(null)
        ]);

        // URL 또는 Base64 형식 정규화
        const normalizeImage = (result: string | null) => {
            if (!result) return null;
            if (result.startsWith('http')) return result;
            return `data:image/png;base64,${result}`;
        };

        const refBasedCharacter = normalizeImage(refBasedResult);
        const promptBasedCharacter = normalizeImage(promptBasedResult);

        // 최소 하나는 성공해야 함
        if (!refBasedCharacter && !promptBasedCharacter) {
            return NextResponse.json({
                error: '캐릭터 생성에 실패했습니다. 다시 시도해 주세요.'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            refBasedImageUrl: refBasedCharacter,      // 사진 분석 기반 캐릭터
            promptBasedImageUrl: promptBasedCharacter,   // AI 프롬프트 기반 캐릭터
            referenceDescription    // 분석된 설명 (피드백용)
        });

    } catch (error: any) {
        console.error('[Character Generate API Error]:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
