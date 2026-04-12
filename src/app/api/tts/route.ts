
import { NextRequest, NextResponse } from 'next/server';
import { getVoiceConfig, UserGender, VoiceMood } from '@/lib/audio/voice-strategy';

export async function POST(req: NextRequest) {
    try {
        const { text, voiceId, gender, mood } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Determine voice config based on specific voiceId or (gender + mood)
        let finalVoiceId = voiceId;
        let speakingRate = 0.95;
        let pitch = 0.0;

        if (!finalVoiceId && (gender || mood)) {
            const config = getVoiceConfig(gender as UserGender, mood as VoiceMood);
            finalVoiceId = config.voiceId;
            speakingRate = config.speakingRate;
            pitch = config.pitch;
        } else if (!finalVoiceId) {
            finalVoiceId = "ko-KR-Neural2-c";
            speakingRate = 0.9;
            pitch = -1.0;
        }

        const apiKey = process.env.GOOGLE_TTS_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
        }

        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: { text },
                voice: { languageCode: 'ko-KR', name: finalVoiceId },
                audioConfig: { audioEncoding: 'MP3', speakingRate, pitch },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('TTS API error:', errorData);
            return NextResponse.json({
                error: errorData.error?.message || 'TTS API failed',
            }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ audioContent: data.audioContent });

    } catch (error) {
        console.error('TTS Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

