import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Diagnosis from '@/models/Diagnosis';
import User from '@/models/User';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';
import { getVoiceConfig, determineMood, UserGender, VoiceMood } from '@/lib/audio/voice-strategy';

/**
 * AI 기질/진단 맞춤형 명상 가이드 생성 및 TTS 합성 API
 * POST /api/ai/meditation
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        // 테스트 편의성을 위한 Fallback 이메일 (개발 모드용)
        const userEmail = session?.user?.email || 'sin93101190@gmail.com';
        
        if (!userEmail) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 최신 진단 결과 조회
        const diagnosis: any = await Diagnosis.findOne({ userId: user._id })
            .sort({ createdAt: -1 })
            .lean();

        // 진단 결과가 없을 경우 기본값 세팅
        const categoryScores = diagnosis?.categoryScores || {
            physical: 50,
            mental: 50,
            lifestyle: 50,
            sleep: 50
        };

        const totalScore = diagnosis?.totalScore || 50;

        // 가장 점수가 낮은(취약한) 카테고리 판별
        const scoresArray = [
            { name: '신체', key: 'physical', score: categoryScores.physical },
            { name: '정신', key: 'mental', score: categoryScores.mental },
            { name: '라이프스타일', key: 'lifestyle', score: categoryScores.lifestyle },
            { name: '수면', key: 'sleep', score: categoryScores.sleep }
        ];
        
        scoresArray.sort((a, b) => a.score - b.score);
        const weakest = scoresArray[0]; // 점수가 가장 낮은 것

        // 기질 점수 매핑을 위한 scoreMap 구축 (determineMood용)
        // 만약 IPIP-NEO-60 진단 결과(N, E 등)가 diagnosis에 있으면 그것을 쓰고, 없으면 기본값 설정
        const scoresMap: Record<string, number> = {
            N: diagnosis?.scores?.N || 50,
            E: diagnosis?.scores?.E || 50,
            physical: categoryScores.physical,
            mental: categoryScores.mental,
            lifestyle: categoryScores.lifestyle,
            sleep: categoryScores.sleep
        };

        // 개인화 보이스 배정 전략 설정 (성별 & 기분/점수 기준)
        const gender: UserGender = user.gender || 'other';
        const mood: VoiceMood = determineMood(totalScore, scoresMap);
        const voiceConfig = getVoiceConfig(gender, mood);

        // 1. Gemini AI를 활용한 맞춤 명상 가이드 스크립트 작성
        const systemInstruction = `You are a compassionate mindfulness and meditation guide for Youniqle. 
Your goal is to write a personalized, calming Korean meditation guide script based on the user's recovery profile.
Only output the raw text of the meditation. Do not include any intros/outros, markdown, quote marks, or comments. Just the text to be read aloud.`;

        const prompt = `유저의 회복 진단 결과는 다음과 같습니다:
- 신체 건강도: ${categoryScores.physical}점
- 정신 스트레스 회복도: ${categoryScores.mental}점
- 일상 라이프스타일 지표: ${categoryScores.lifestyle}점
- 수면 퀄리티: ${categoryScores.sleep}점

가장 점수가 낮고 관리가 필요한 취약 부위는 [${weakest.name} (점수: ${weakest.score}점)] 입니다.
이 취약 영역에 최적화하여 지친 마음에 안정을 주고 이완을 유도하는 3~4문장의 명상 가이드 낭독 문구(한국어)를 생성해 주세요.

[규칙]:
1. 낭독 속도를 고려해 아주 부드럽고 차분한 경어체(~요, ~하세요)로 작성하세요.
2. 텍스트만 출력해야 하며, 특수문자, 마크다운 기호(예: **, #, -), 해시태그, 또는 서론/결론("네, 알겠습니다" 등)은 절대로 포함하지 마세요. 오직 명상 가이드로 낭독할 한국어 문장만 반환해야 합니다.`;

        let generatedScript = '';
        try {
            const responseText = await GeminiAIEngine.generateWithFallback(prompt, systemInstruction, 0.6);
            // 혹시 들어올 수 있는 마크다운 기호 및 큰따옴표 정제
            generatedScript = responseText.replace(/[\*#\"\']/g, '').trim();
        } catch (geminiError) {
            console.error('Gemini meditation generation failed, using fallback script:', geminiError);
            generatedScript = `천천히 숨을 들이쉬고 내쉬며, 오늘 하루 지친 내 몸과 마음에 온전히 집중해 봅니다. 가장 약해진 부분을 부드럽게 감싸 안아주고, 내 안의 자연스러운 회복력이 차오르는 것을 느껴보세요. 당신은 지금 이대로도 충분히 편안해질 자격이 있습니다.`;
        }

        // 2. Google Cloud TTS API를 호출하여 스크립트 음성 합성
        const apiKey = process.env.GOOGLE_TTS_API_KEY;
        if (!apiKey) {
            console.warn('GOOGLE_TTS_API_KEY is missing, returning mock success with script only');
            return NextResponse.json({
                success: true,
                script: generatedScript,
                audioContent: null, // Audio content unavailable without key
                voice: voiceConfig
            });
        }

        const ttsResponse = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: { text: generatedScript },
                voice: { languageCode: 'ko-KR', name: voiceConfig.voiceId },
                audioConfig: { 
                    audioEncoding: 'MP3', 
                    speakingRate: voiceConfig.speakingRate, 
                    pitch: voiceConfig.pitch 
                },
            }),
        });

        if (!ttsResponse.ok) {
            const errorData = await ttsResponse.json();
            console.error('TTS API error in meditation route:', errorData);
            // TTS 실패 시 스크립트만이라도 내려주어 화면에 띄울 수 있도록 대비
            return NextResponse.json({
                success: true,
                script: generatedScript,
                audioContent: null,
                error: 'TTS synthesis failed',
                voice: voiceConfig
            });
        }

        const ttsData = await ttsResponse.json();
        return NextResponse.json({
            success: true,
            script: generatedScript,
            audioContent: ttsData.audioContent, // Base64 encoded MP3 content
            voice: voiceConfig
        });

    } catch (error: any) {
        console.error('Meditation API route error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
