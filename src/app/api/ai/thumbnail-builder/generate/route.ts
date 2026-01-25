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
        const { productName, style, includeModel, addText, keywords, referenceImage, isStemCellSolution } = body;

        if (!productName) {
            return NextResponse.json({ error: '상품명을 입력해주세요.' }, { status: 400 });
        }

        // 썸네일 전용 프롬프트 구성
        const styleDescriptions = {
            premium: isStemCellSolution ? "고급스러운 프라이빗 라운지, 정갈하고 깨끗한 의료 공간, 치유의 빛" : "고급스러운 스튜디오 배경, 우아한 조명, 미니멀한 구성",
            lifestyle: "일상적인 공간(거실, 침실 등)에서의 자연스러운 연출, 따뜻한 조명",
            clean: isStemCellSolution ? "전문적인 클리닉 환경, 화이트 톤의 세련된 인테리어, 정비된 장비" : "깨끗한 단색 배경(화이트/그레이), 선명한 제품 강조, 그림자 최소화",
            creative: "역동적인 각도, 예술적인 소품 활용, 화려한 색감과 조명"
        };

        const visualPrompt = isStemCellSolution
            ? `유니클(Youniqle)의 브랜드 철학인 **'회복(Recovery)'**이 느껴지는 프리미엄 메디컬 솔루션 이미지입니다.
스타일: ${styleDescriptions[style as keyof typeof styleDescriptions] || styleDescriptions.premium}
특징: ${keywords || '전문적인 메디컬 케어 환경'}
${includeModel ? '모델(사람)이 전문적인 케어를 통해 생동감을 얻거나 편안하게 회복하는 모습 포함' : '정교한 의료 환경 및 치유 무드'}
브랜드 무드: 치유, 활력, 깨끗함, 과학적 신뢰
절대 금기: 제품 용기(병, 박스, 앰플)를 묘사하지 마세요.
비율: 1:1 정방형`
            : `유니클(Youniqle)의 브랜드 철학인 **'회복(Recovery)'**이 느껴지는 고퀄리티 이커머스 썸네일 이미지입니다.
스타일: ${styleDescriptions[style as keyof typeof styleDescriptions] || styleDescriptions.premium}
특징: ${keywords || '전문적인 제품 샷'}
${includeModel ? '모델(사람)이 제품을 통해 생동감을 얻거나 편안하게 회복하는 자연스러운 모습 포함' : '제품 단독 샷'}
브랜드 무드: 치유, 활력, 깨끗함, 새로운 시작
비율: 1:1 정방형`;

        const imageUrl = await GeminiAIEngine.generateDetailImage({
            prompt: visualPrompt,
            keyMessage: addText ? productName : '',
            referenceImage: referenceImage,
            aspectRatio: "1:1",
            isStemCellSolution: !!isStemCellSolution
        });

        return NextResponse.json({
            success: true,
            imageUrl
        });

    } catch (error: any) {
        console.error('AI Thumbnail Generation Error:', error);
        return NextResponse.json({
            error: error.message || '썸네일 생성 중 오류가 발생했습니다.'
        }, { status: 500 });
    }
}
