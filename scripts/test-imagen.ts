
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) { console.error('No API Key'); process.exit(1); }

const genAI = new GoogleGenerativeAI(apiKey);

async function testImageGen() {
    try {
        console.log('Testing Imagen 3 via Gemini API...');
        // Note: As of early 2025/2026, standard API keys might support Imagen if enabled.
        // Let's try to get the model.
        const model = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' });

        // This syntax is hypothetical for the standard SDK, mostly it's for text.
        // If this fails, we know we can't easily use the standard key for images.
        // Google often separates this into Vertex AI.
        // Let's try a standard generation content prompt to see if it rejects or hallucinating.
        const result = await model.generateContent('A cute robot holding a flower');
        console.log('Result:', result.response.text());
    } catch (error: any) {
        console.error('Error testing Imagen:', error.message);
    }
}

testImageGen();
