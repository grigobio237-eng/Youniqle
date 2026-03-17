/**
 * ElevenLabs 연동 참고 가이드 (나만의 목소리 사용)
 * 
 * 1. ElevenLabs API Key를 .env.local에 추가: ELEVENLABS_API_KEY=...
 * 2. 복제한 Voice ID를 UI에서 선택하거나 직접 입력
 */

export async function generateElevenLabsAudio(text: string, voiceId: string, outputPath: string) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) throw new Error('ElevenLabs API Key is missing');

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey
        },
        body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        })
    });

    if (!response.ok) {
        throw new Error(`ElevenLabs API failed: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    require('fs').writeFileSync(outputPath, Buffer.from(buffer));
    return outputPath;
}
