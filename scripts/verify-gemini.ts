import dotenv from 'dotenv';
import path from 'path';

// .env.local 파일 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyGemini() {
    console.log('[Test] GeminiAIEngine.generateWithFallback 테스트 시작...');

    try {
        // 동적 임포트로 환경 변수 로드 후 초기화 보장
        const { GeminiAIEngine } = await import('../src/lib/ai/gemini-engine');

        const prompt = '트렌드 분석 테스트: "강아지 산책 꿀팁" 주제로 짧은 트렌드 분석을 JSON 형식으로 작성해줘.';
        const result = await GeminiAIEngine.generateWithFallback(prompt);

        console.log('[Test] 결과 수신 성공:');
        console.log(result.substring(0, 200) + '...');
        console.log('\n[Test] ✅ Gemini 모델이 정상적으로 응답합니다.');
    } catch (error: any) {
        console.error('[Test] ❌ 테스트 실패:', error.message);
        if (error.stack) console.error(error.stack);
    }
}

verifyGemini();
