import axios from 'axios';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkOperation(opName: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/${opName}?key=${apiKey}`;

    try {
        console.log(`Checking operation: ${opName}`);
        const response = await axios.get(url);
        console.log('Full Response Data:');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error: any) {
        console.error('Error checking operation:', error.response?.data || error.message);
    }
}

// 터미널 로그에서 확인된 작업 ID 사용
checkOperation('models/veo-3.1-generate-preview/operations/42l6p3qfhoqd');
