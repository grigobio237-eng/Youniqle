
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { AssetGenNode } from '../src/lib/video-workflow/nodes/AssetGenNode';

async function main() {
    console.log('[Test] Verifying Image Generation Fix (Holiday Syndrome)...');

    const projectId = 'test-fix-project';
    const outputDir = path.resolve(process.cwd(), 'temp', projectId);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const mockScene = {
        id: 'fix_test_1',
        visualPrompt: "명절 연휴가 끝난 후, 지저분한 부엌에서 남은 명절 음식 용기들을 보며 한숨을 쉬고 있는 스트레스 받은 30대 한국인 여성의 모습. 실사 같은 느낌.",
        mainCharacter: "30대 한국인 여성, 단발머리, 핑크색 버킷햇, 오버사이즈 블루 스웨터 착용"
    };

    try {
        console.log(`[Test] Scene ID: ${mockScene.id}`);
        console.log(`[Test] Raw Visual Prompt: ${mockScene.visualPrompt}`);

        // Force removal of existing file if any to re-generate
        const finalPath = path.join(outputDir, `scene_${mockScene.id}.png`);
        if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);

        const result = await AssetGenNode.generateImage(mockScene, projectId, outputDir);

        console.log('\n[Test Result]');
        console.log('Result:', result);

        if (fs.existsSync(finalPath)) {
            const stats = fs.statSync(finalPath);
            if (stats.size > 1000) {
                console.log(`✅ SUCCESS: Image generated successfully at: ${finalPath} (Size: ${stats.size} bytes)`);
            } else {
                console.log(`⚠️ WARNING: Image file is suspiciously small (${stats.size} bytes). Might be a placeholder.`);
                const content = fs.readFileSync(finalPath, 'utf8');
                console.log('Content starts with:', content.substring(0, 100));
            }
        } else {
            console.error('❌ FAIL: Image file was NOT created.');
        }

    } catch (error) {
        console.error('[Test Failed]', error);
    }
}

main();
