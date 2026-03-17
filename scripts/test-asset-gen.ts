
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { AssetGenNode } from '../src/lib/video-workflow/nodes/AssetGenNode';

async function main() {
    console.log('[Test] Testing AssetGenNode character prompt integration...');

    const projectId = 'test-consistency-project';
    const outputDir = path.resolve(process.cwd(), 'temp', projectId);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const mockScene = {
        id: 'test_scene_1',
        visualPrompt: "walking down a busy street in Seoul",
        mainCharacter: "A 30-year-old Korean man with short black hair, wearing a white shirt and blue jeans"
    };

    try {
        console.log(`[Test] Generating image for scene with character: ${mockScene.mainCharacter}`);
        const result = await AssetGenNode.generateImage(mockScene, projectId, outputDir);

        console.log('\n[Test Result]');
        console.log('Result:', result);

        const expectedPath = path.join(outputDir, `scene_${mockScene.id}.png`);
        if (fs.existsSync(expectedPath)) {
            const stats = fs.statSync(expectedPath);
            if (stats.size > 100) {
                console.log(`✅ Image generated successfully at: ${expectedPath} (Size: ${stats.size} bytes)`);
            } else {
                console.log(`⚠️ Image file exists but is too small: ${stats.size} bytes. Might be an error placeholder.`);
                const content = fs.readFileSync(expectedPath, 'utf8');
                console.log('File Content:', content);
            }
        } else {
            console.error('❌ Image file was NOT created.');
        }

    } catch (error) {
        console.error('[Test Failed]', error);
    }
}

main();
