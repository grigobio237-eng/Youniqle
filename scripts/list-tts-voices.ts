import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function listVoices() {
    let client;
    if (process.env.GOOGLE_CREDENTIALS_JSON) {
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
        client = new TextToSpeechClient({ credentials });
    } else {
        client = new TextToSpeechClient({
            keyFilename: path.join(process.cwd(), 'google-tts.json')
        });
    }

    const [result] = await client.listVoices({ languageCode: 'ko-KR' });
    const voices = result.voices || [];

    console.log('--- Korean Voices ---');
    voices.forEach(voice => {
        console.log(`Name: ${voice.name}, Gender: ${voice.ssmlGender}, Engin: ${(voice as any).naturalSampleRateHertz ? 'High' : 'Std'}`);
    });
}

listVoices().catch(console.error);
