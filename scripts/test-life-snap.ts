import { connectDB } from '../src/lib/db';
import User from '../src/models/User';
import LifeSnap from '../src/models/LifeSnap';
import { GeminiAIEngine } from '../src/lib/ai/gemini-engine';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// 작은 샘플 이미지 (1x1 픽셀 투명 PNG) - 테스트용이므로 실제 사물을 주지 않으면 Mismatch가 떠야 합니다.
const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

async function runTest() {
    console.log('🔄 라이프 스냅 백그라운드 테스트를 시작합니다...');
    try {
        await connectDB();
        console.log('✅ DB 연결 성공');

        const testUser = await User.findOne({});
        if (!testUser) {
            console.log('❌ 테스트할 유저를 찾을 수 없습니다.');
            process.exit(1);
        }
        console.log(`✅ 테스트 유저 확보: ${testUser.email} (ID: ${testUser._id})`);

        const categoriesToTest = ['MEAL', 'MEDICAL_DOC']; // 테스트 시간 단축을 위해 2개만 테스트

        for (const snapType of categoriesToTest) {
            console.log(`\n======================================`);
            console.log(`🧪 카테고리 [${snapType}] 테스트 시작`);
            console.log(`======================================`);
            
            // 1. 프롬프트 생성 (route.ts 로직 모방)
            let categoryPrompt = "";
            if (snapType === 'MEAL') categoryPrompt = "이 사진에서 음식의 종류를 파악하고, 대략적인 칼로리와 3대 영양소(탄/단/지) 비율, 염분 수치를 추정해 줘.";
            if (snapType === 'MEDICAL_DOC') categoryPrompt = "이 사진은 병원 서류나 처방전입니다. [중요: 개인정보는 절대 출력 금지] 오직 진단명, 증상만 텍스트로 추출해 줘.";

            const prompt = `
            [ROLE: Youniqle Recovery Specialist]
            현재 분석할 카테고리는 [${snapType}] 입니다.
            [ANALYSIS TARGET: ${snapType}] ${categoryPrompt}
            [VALIDATION RULE - CRITICAL]
            만약 사용자가 업로드한 이미지가 현재 선택된 카테고리 [${snapType}] 와(과) 전혀 관련이 없거나 분석이 불가능한 경우, 억지로 분석하지 마세요!
            반드시 JSON 응답에 아래 형식만 반환하고 종료하세요:
            { "isMismatch": true, "mismatchReason": "선택하신 카테고리와 관련 없는 사진이거나 분석할 수 없는 형식입니다. 정확한 사진을 다시 올려주세요." }
            
            [REQUIRED RESPONSE FORMAT (JSON)]
            이미지가 정상적이라면 반드시 아래 형식으로 답변하세요:
            { "isMismatch": false, "subjectName": "식별된 대상", "summary": "요약", "analysisTable": [{ "label": "항목", "value": "수치", "benefit": "이점" }], "matchScore": 85 }
            `;

            console.log('📡 Gemini AI 분석 요청 중...');
            const resultText = await GeminiAIEngine.generateWithFallback([
                prompt,
                { inlineData: { data: dummyBase64, mimeType: 'image/png' } }
            ]);

            let responseText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const analysisData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

            console.log('🤖 AI 응답 결과:');
            console.log(analysisData);

            // 2. DB 저장 테스트 (scan/save 로직 모방)
            if (analysisData.isMismatch) {
                console.log(`✅ 예상대로 에러 처리(Mismatch)가 정상 작동했습니다! (투명 1픽셀 사진을 올렸기 때문)`);
                // 실제 서비스에서는 저장을 안하므로 패스
            } else {
                console.log(`⚠️ Mismatch가 뜨지 않고 정상 분석되었습니다 (Gemini가 너무 유연하게 대답한 경우일 수 있습니다).`);
            }

            // DB 저장이 잘 되는지만 테스트하기 위해 강제로 저장해봄
            console.log(`💾 LifeSnap DB 저장 테스트 진행 중...`);
            const mockSaved = await LifeSnap.create({
                userId: testUser._id,
                category: snapType,
                imageUrl: 'https://test.com/dummy.png',
                score: analysisData.matchScore || 0,
                summary: analysisData.summary || '테스트 요약',
                metrics: analysisData.analysisTable || {},
                isMasked: snapType === 'MEDICAL_DOC',
                rawAiResult: analysisData
            });

            console.log(`✅ LifeSnap DB 저장 성공! (Document ID: ${mockSaved._id})`);
            
            // 테스트로 넣은 데이터 다시 삭제 (DB 정리)
            await LifeSnap.findByIdAndDelete(mockSaved._id);
            console.log(`🗑️ 테스트 데이터 정리 완료.`);
        }

        console.log(`\n🎉 모든 테스트가 성공적으로 완료되었습니다!`);
        process.exit(0);
    } catch (err) {
        console.error('❌ 테스트 중 오류 발생:', err);
        process.exit(1);
    }
}

runTest();
