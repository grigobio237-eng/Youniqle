import { NextRequest, NextResponse } from 'next/server';
export const maxDuration = 120; // 120초로 확장 (Vercel Pro 이상 대응 또는 취미 요금제 기본값 보완)
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';
import { drawTextOnImage } from '@/lib/utils/canvas-text';
import dbConnect from '@/lib/db';
import RecoveryScore from '@/models/RecoveryScore';
import Webtoon from '@/models/Webtoon';
import User from '@/models/User';

/**
 * 웹툰 생성 API (Canvas 렌더링 방식)
 * 
 * - action?: 'regenerate-panel' | 'generate-script' | 'generate-character' | 'generate-webtoon' | 'analyze-reference'
 * - characterPrompt?: string (캐릭터 묘사 프롬프트)
 * - characterSheetImage?: string (기준 캐릭터 시트 이미지)
 */

async function getRecoveryData(userId: any, date?: string, topic?: string) {
    if (topic) {
        return {
            totalScore: 70,
            answers: [{ category: '주제', answer: topic }],
            userNote: topic
        };
    }
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    return await RecoveryScore.findOne({ userId, date: targetDate });
}
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const {
            genre,
            visualStyle,
            date,
            topic,
            panelCount = 4, // 새로 추가: 기본값 4
            action,
            panels: existingPanels,
            panelNumber,
            characterPrompt: existingCharPrompt,
            characterSheetImage: existingCharSheet
        } = body;

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // ===== [Case 1] 특정 패널 하나만 재생성 =====
        if (action === 'regenerate-panel') {
            const targetPanel = existingPanels?.find((p: { panelNumber: number; prompt: string; script: string }) => p.panelNumber === panelNumber);
            if (!targetPanel) return NextResponse.json({ error: 'Panel not found' }, { status: 400 });

            if (!existingCharPrompt) return NextResponse.json({ error: 'Character prompt required' }, { status: 400 });

            const cleanImageBase64 = await GeminiAIEngine.generateWebtoonPanelImage({
                panelPrompt: targetPanel.prompt,
                characterPrompt: existingCharPrompt,
                visualStyle: visualStyle || 'premium',
                genre: genre || 'drama'
            });

            const finalImageBase64 = await drawTextOnImage(cleanImageBase64, targetPanel.script);

            return NextResponse.json({
                success: true,
                imageUrl: `data:image/png;base64,${finalImageBase64}`,
                cleanImageUrl: `data:image/png;base64,${cleanImageBase64}`
            });
        }

        // ===== [Case 2] 대본 및 캐릭터 묘사만 생성 (이미지 제외) =====
        if (action === 'generate-script') {
            await dbConnect();
            const user = await User.findOne({ email: session.user.email });
            if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

            // 회복 데이터 또는 자유 주제 준비
            let recoveryData = await getRecoveryData(user._id, date, topic);
            if (!recoveryData) return NextResponse.json({ error: 'Recovery data not found' }, { status: 404 });

            const prevWebtoon = await Webtoon.findOne({ userId: user._id }).sort({ date: -1 });
            const episodeNumber = prevWebtoon ? prevWebtoon.episodeNumber + 1 : 1;

            const scriptData = await GeminiAIEngine.generateWebtoonScript({
                recoveryData,
                prevSummary: prevWebtoon?.summary,
                episodeNumber,
                genre: genre || 'slice-of-life',
                userName: user.name || '사용자',
                panelCount: Number(panelCount),
                topic: topic || undefined // 묘사 추가
            });

            return NextResponse.json({
                success: true,
                ...scriptData,
                episodeNumber,
                genre,
                visualStyle,
                topic
            });
        }

        // ===== [Case 3] 캐릭터 시트만 생성 =====
        if (action === 'generate-character') {
            try {
                const { characterPrompt: charPrompt, visualStyle: vStyle, referenceImage } = body;
                if (!charPrompt && !referenceImage) {
                    return NextResponse.json({ error: '캐릭터 설명 또는 사진이 필요합니다.' }, { status: 400 });
                }

                console.log('[Webtoon Generate] Creating character sheet...');

                let referenceDescription = "";
                if (referenceImage) {
                    try {
                        const base64Data = referenceImage.split(',')[1] || referenceImage;
                        referenceDescription = await GeminiAIEngine.analyzeCharacterImage(base64Data);
                        console.log('[Webtoon Generate] Reference analyzed:', referenceDescription.substring(0, 100));
                    } catch (err: any) {
                        console.error('Reference analysis failed:', err);
                        // 분석 실패해도 계속 진행
                    }
                }

                const finalPrompt = charPrompt || referenceDescription || 'A young adult character with casual clothing';
                const characterSheetResult = await GeminiAIEngine.generateCharacterSheet({
                    characterPrompt: finalPrompt,
                    visualStyle: vStyle || 'premium',
                    referenceDescription
                });

                // URL 또는 Base64 형식 구분
                let characterSheetImage: string;
                if (characterSheetResult.startsWith('http')) {
                    characterSheetImage = characterSheetResult; // URL 그대로 사용
                } else {
                    characterSheetImage = `data:image/png;base64,${characterSheetResult}`;
                }

                return NextResponse.json({
                    success: true,
                    characterSheetImage,
                    analyzedDescription: referenceDescription
                });
            } catch (err: any) {
                console.error('[Webtoon Generate] Character sheet error:', err);
                return NextResponse.json({
                    error: `캐릭터 시트 생성 실패: ${err.message}`,
                    details: err.stack
                }, { status: 500 });
            }
        }

        // ===== [Case 3.5] 듀얼 캐릭터 생성 (전용 API로 이전됨: /api/character/generate-dual) =====
        // 이 로직은 이제 /api/character/generate-dual 엔드포인트에서 처리됩니다.
        if (action === 'generate-dual-characters') {
            return NextResponse.json({
                error: '이 기능은 전용 캐릭터 생성 API(/api/character/generate-dual)로 이전되었습니다.'
            }, { status: 410 });
        }

        // ===== [Case 4] 확정된 캐릭터를 바탕으로 전체 패널 생성 =====
        if (action === 'generate-webtoon' || action === 'generate-images') {
            if (!existingCharPrompt || !existingPanels) {
                console.error('[Webtoon Generate] Missing requirements:', { hasPrompt: !!existingCharPrompt, hasPanels: !!existingPanels });
                return NextResponse.json({ error: 'Panels and character prompt required' }, { status: 400 });
            }

            console.log('[Webtoon Generate] Generating all panel images started...');
            try {
                const panelsWithImages = [];

                for (const panel of existingPanels) {
                    console.log(`[Webtoon Generate] Generating panel ${panel.panelNumber}...`);
                    const cleanImageBase64 = await GeminiAIEngine.generateWebtoonPanelImage({
                        panelPrompt: panel.prompt,
                        characterPrompt: existingCharPrompt,
                        visualStyle: visualStyle || 'premium',
                        genre: genre || 'slice-of-life'
                    });

                    console.log(`[Webtoon Generate] Drawing text for panel ${panel.panelNumber}...`);
                    const finalImageBase64 = await drawTextOnImage(cleanImageBase64, panel.script);

                    panelsWithImages.push({
                        ...panel,
                        cleanImageUrl: `data:image/png;base64,${cleanImageBase64}`,
                        imageUrl: `data:image/png;base64,${finalImageBase64}`
                    });
                }

                console.log('[Webtoon Generate] All panels generated successfully!');
                return NextResponse.json({
                    success: true,
                    panels: panelsWithImages
                });
            } catch (genError: any) {
                console.error('[Webtoon Generate] Generation process failed:', genError);
                return NextResponse.json({ 
                    error: `이미지 생성 프로세스 실패: ${genError.message}`,
                    details: genError.stack
                }, { status: 500 });
            }
        }

        // ===== [Case 5] 레퍼런스 이미지 분석 (신규) =====
        if (action === 'analyze-reference') {
            try {
                const body = await req.json();
                const { image } = body;
                if (!image) return NextResponse.json({ error: 'Image data required' }, { status: 400 });

                const base64Data = image.split(',')[1] || image;
                const description = await GeminiAIEngine.analyzeCharacterImage(base64Data);

                return NextResponse.json({
                    success: true,
                    description
                });
            } catch (err: any) {
                console.error('Analyze reference error:', err);
                return NextResponse.json({
                    error: `이미지 분석 실패: ${err.message}`,
                    details: err.stack
                }, { status: 500 });
            }
        }

        // ===== [Deprecated] 원샷 생성 플로우 (기존 호환성용) =====

        // Step 1: 회복 데이터 또는 자유 주제 준비
        let recoveryData: any;

        if (topic) {
            // 자유 주제 모드: 가상 회복 데이터 생성
            recoveryData = {
                totalScore: 70,
                answers: [{ category: '주제', answer: topic }],
                userNote: topic
            };
        } else {
            // 회복 데이터 모드: 실제 데이터 조회
            const targetDate = date ? new Date(date) : new Date();
            targetDate.setHours(0, 0, 0, 0);

            recoveryData = await RecoveryScore.findOne({
                userId: user._id,
                date: targetDate
            });

            if (!recoveryData) {
                return NextResponse.json({
                    error: '오늘의 회복 데이터를 찾을 수 없습니다. 자유 주제로 시도해보세요.'
                }, { status: 404 });
            }
        }

        // Step 2: 이전 웹툰 정보 조회
        const prevWebtoon = await Webtoon.findOne({ userId: user._id })
            .sort({ date: -1 });

        const episodeNumber = prevWebtoon ? prevWebtoon.episodeNumber + 1 : 1;
        const prevSummary = prevWebtoon?.summary;

        // Step 3: AI 대본 생성
        const scriptData = await GeminiAIEngine.generateWebtoonScript({
            recoveryData,
            prevSummary,
            episodeNumber,
            genre: genre || 'slice-of-life',
            userName: user.name || '사용자',
            panelCount: Number(panelCount) // 전달
        });

        // Step 4: 캐릭터 시트 생성 (일관성 유지용 기준 이미지)
        console.log('[Webtoon Generate] Creating character sheet...');
        const characterSheetBase64 = await GeminiAIEngine.generateCharacterSheet({
            characterPrompt: scriptData.characterPrompt,
            visualStyle: visualStyle || 'premium'
        });

        // Step 5: 모든 패널 이미지 생성 (병렬 처리)
        console.log('[Webtoon Generate] Generating panel images...');
        const panelsWithImages = await Promise.all(
            scriptData.panels.map(async (panel: { panelNumber: number; prompt: string; script: string }) => {
                try {
                    // 5-1. 텍스트 없는 깨끗한 이미지 생성
                    const cleanImageBase64 = await GeminiAIEngine.generateWebtoonPanelImage({
                        panelPrompt: panel.prompt,
                        characterPrompt: scriptData.characterPrompt,
                        visualStyle: visualStyle || 'premium',
                        genre: genre || 'slice-of-life'
                    });

                    return {
                        ...panel,
                        imageUrl: `data:image/png;base64,${cleanImageBase64}` // 원본 이미지 반환 (텍스트 합성은 클라이언트에서 수행)
                    };
                } catch (error) {
                    console.error(`[Webtoon Generate] Panel ${panel.panelNumber} failed:`, error);
                    throw error;
                }
            })
        );

        console.log('[Webtoon Generate] All panels generated successfully!');

        return NextResponse.json({
            success: true,
            episodeNumber,
            panels: panelsWithImages,
            title: scriptData.title,
            summary: scriptData.summary,
            characterPrompt: scriptData.characterPrompt,
            characterSheetImage: `data:image/png;base64,${characterSheetBase64}`,
            genre,
            visualStyle,
            topic: topic || undefined
        });

    } catch (error: any) {
        console.error('[Webtoon Generate API Error]:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
