
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { text, voiceId = "ko-KR-Neural2-c" } = await req.json(); // Default to Neural2 Female-C (Calm)

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_TTS_API_KEY || process.env.GEMINI_API_KEY; // Using the new dedicated key with fallback
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
                voice: { languageCode: 'ko-KR', name: voiceId },
                audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9, pitch: -1.0 }, // Slightly slower and lower pitch for calmness
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('--- Google TTS API Detailed Error ---');
            console.error('Status:', response.status);
            console.error('Error Body:', JSON.stringify(errorData, null, 2));
            console.error('-------------------------------------');
            return NextResponse.json({
                error: errorData.error?.message || 'TTS API failed',
                details: errorData.error
            }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ audioContent: data.audioContent });

    } catch (error) {
        console.error('TTS Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
