
import { GeminiAIEngine } from '../src/lib/ai/gemini-engine';
import { DAILY_THEMES } from '../src/constants/dailyThemes';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testAI() {
    console.log('[TEST] Starting AI Generation Test...');
    
    const now = new Date();
    const dayOfWeek = now.getDay();
    const themeData = DAILY_THEMES[dayOfWeek] || DAILY_THEMES[1];
    
    const journey = 'CLINICAL_PRE';
    
    console.log(`[TEST] Journey: ${journey}`);
    console.log(`[TEST] Theme: ${themeData.theme}`);
    console.log(`[TEST] Keywords: ${themeData.keywords}`);

    try {
        console.log('[TEST] Calling GeminiAIEngine.generateDailyQuestions...');
        const startTime = Date.now();
        
        const questions = await GeminiAIEngine.generateDailyQuestions(
            themeData.theme, 
            themeData.keywords, 
            journey as any
        );
        
        const duration = (Date.now() - startTime) / 1000;
        console.log(`[TEST] Success! Took ${duration} seconds.`);
        console.log('[TEST] Questions Length:', questions?.length);
        console.log('[TEST] First Question Sample:', JSON.stringify(questions?.[0], null, 2));

    } catch (error: any) {
        console.error('[TEST] ERROR DETECTED:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        process.exit(0);
    }
}

testAI();
