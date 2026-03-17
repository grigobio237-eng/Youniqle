
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY is missing');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Listing models is not directly supported in the simple SDK, 
    // but we can try to use one we think should work or use a different method.
    // Actually, let's just test a few specific ones.

    const testModels = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-2.0-flash-exp',
        'gemini-1.0-pro'
    ];

    for (const modelName of testModels) {
        try {
            console.log(`Testing model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            console.log(`✅ ${modelName} works! Response: ${result.response.text().substring(0, 10)}...`);
        } catch (e: any) {
            console.error(`❌ ${modelName} failed: ${e.message}`);
        }
    }
}

main();
