import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// .env.local 파일 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyImageGen() {
    console.log('[Test] 이미지 생성 테스트 시작...');

    // 동적 임포트
    const { GeminiAIEngine } = await import('../src/lib/ai/gemini-engine');

    const prompt = 'A cute golden retriever puppy sitting on a sunny beach, cinematic high quality';
    const outputPath = path.join(process.cwd(), 'scripts', 'test-output.png');

    // 이전 파일 삭제
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    try {
        const resultPath = await GeminiAIEngine.generateImageAndSave(prompt, outputPath);

        if (fs.existsSync(resultPath)) {
            const stats = fs.statSync(resultPath);
            if (stats.size > 1000) {
                console.log(`\n[Test] ✅ 이미지 생성 성공! 경로: ${resultPath} (${stats.size} bytes)`);
            } else {
                console.warn(`\n[Test] ⚠️ 파일은 생성되었으나 크기가 너무 작습니다: ${stats.size} bytes`);
            }
        } else {
            console.error('\n[Test] ❌ 이미지 파일이 생성되지 않았습니다.');
        }
    } catch (error: any) {
        console.error('\n[Test] ❌ 테스트 에러:', error.message);
    }
}

verifyImageGen();
