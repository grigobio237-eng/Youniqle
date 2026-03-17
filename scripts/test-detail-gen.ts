
import { GeminiAIEngine } from '../src/lib/ai/gemini-engine';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testDetailGen() {
    console.log('[Test] Testing GeminiAIEngine.generateDetailImage...');

    try {
        const result = await GeminiAIEngine.generateDetailImage({
            prompt: 'A futuristic electric car charging in a smart city',
            keyMessage: 'Future of Mobility',
            aspectRatio: '9:16',
            isStemCellSolution: false
        });

        console.log('[Test] Result Type:', result.startsWith('data:image') ? 'Base64 Image (AI Generated)' : 'URL (Fallback)');
        console.log('[Test] Result Value (First 100 chars):', result.substring(0, 100));

    } catch (error) {
        console.error('[Test] Error:', error);
    }
}

testDetailGen();
