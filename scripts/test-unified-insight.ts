import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function runTest() {
    console.log('=== Starting Unified Insight Backend Test ===');
    console.log('Loaded MONGODB_URI:', process.env.MONGODB_URI);
    
    const { generateUnifiedInsight } = await import('../src/lib/ai/ai-insight');
    
    const mockData = {
        scans: [
            {
                type: 'POSTURE',
                score: 65,
                metrics: { turtleNeckAngle: 18 },
                createdAt: new Date().toISOString()
            },
            {
                type: 'MEAL',
                score: 40,
                metrics: { nutrition: { protein: 10, carbs: 80, fat: 10 } },
                createdAt: new Date().toISOString()
            }
        ],
        survey: {
            answers: {
                painPoint: 'SHOULDER',
                fatigueLevel: 'HIGH',
                dietGoal: 'MUSCLE'
            },
            createdAt: new Date().toISOString()
        },
        preConsultation: {
            medicalCategory: '자세교정',
            aiGuide: '라운드 숄더 집중 관리가 필요합니다.'
        },
        postCare: null
    };

    try {
        const result = await generateUnifiedInsight(mockData);
        console.log('AI Response Result:');
        console.log(JSON.stringify(result, null, 2));
        if (result && result.title && result.description && result.suggestion && result.habits) {
            console.log('✅ Test PASSED: All expected fields returned.');
        } else {
            console.log('❌ Test FAILED: Missing fields in result.');
        }
    } catch (error) {
        console.error('❌ Test FAILED with exception:', error);
    }
}

runTest();
