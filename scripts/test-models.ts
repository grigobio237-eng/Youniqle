
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) { console.error('No API Key'); process.exit(1); }

// Currently the Node SDK doesn't have a direct 'listModels' on the main class in all versions.
// We will try to fetch a known model and if it fails, print the FULL error.
// Also, we can try to use the REST API to list models if SDK fails.

async function test() {
    try {
        // Attempt to use a standard model to verify key
        const genAI = new GoogleGenerativeAI(apiKey as string);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' } as any);
        const result = await model.generateContent('Hello');
        console.log('Gemini 1.5 Flash works:', result.response.text());

        // Now try Imagen again with better error logging
        try {
            const imagen = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' });
            const imgResult = await imagen.generateContent('A ball');
            console.log('Imagen works!');
        } catch (e: any) {
            console.error('Imagen failed. Error details:');
            console.error(e.message);
            console.error(e.response?.data || 'No response data');
        }

    } catch (e: any) {
        console.error('General API Error:', e.message);
    }
}

test();
