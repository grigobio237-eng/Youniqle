import axios from 'axios';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkOperation(opName: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/${opName}?key=${apiKey}`;

    try {
        console.log(`Checking operation: ${opName}`);
        const response = await axios.get(url);
        const data = response.data;

        fs.writeFileSync(path.join(process.cwd(), 'scripts', 'veo-op-dump.json'), JSON.stringify(data, null, 2));
        console.log('Full Response Data saved to scripts/veo-op-dump.json');

        console.log('Keys in root:', Object.keys(data));
        if (data.response) {
            console.log('Keys in response:', Object.keys(data.response));
            if (data.response.generatedSamples && data.response.generatedSamples[0]) {
                console.log('Keys in generatedSamples[0]:', Object.keys(data.response.generatedSamples[0]));
            }
        }
    } catch (error: any) {
        console.error('Error checking operation:', error.response?.data || error.message);
    }
}

// 터미널 로그에서 확인된 가장 최근 작업 ID 사용
checkOperation('models/veo-3.1-generate-preview/operations/qnwwmy3ueta7');
