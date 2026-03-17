
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { ScriptingNode } from '../src/lib/video-workflow/nodes/ScriptingNode';
import { WorkflowNode, ExecutionContext } from '../src/lib/video-workflow/types';

async function main() {
    console.log('[Test] Testing ScriptingNode Consistency Logic...');

    const keys = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_STUDIO_API_KEY,
        'AIzaSyDjIcmr3GX_LtYm9n3vnCNfKCZkClOcumY'
    ].filter(Boolean) as string[];

    console.log(`[Test] Using ${keys.length} API keys for testing...`);

    const mockTrendContext = {
        keyword: "직장인 꿀팁",
        source: "YouTube",
        description: "효율적인 업무 처리를 위한 직장인들의 노하우 공유"
    };

    const mockNode: WorkflowNode = {
        id: 'script-node',
        // @ts-ignore
        type: 'scripting',
        data: {
            trendContext: mockTrendContext
        },
        position: { x: 0, y: 0 }
    };

    const mockContext: ExecutionContext = {
        projectId: 'test-project',
        results: {},
        edges: [],
        // @ts-ignore
        nodes: [],
        status: 'running'
    };

    let success = false;
    for (const key of keys) {
        try {
            console.log(`\n[Test] Trying with key: ${key.substring(0, 10)}...`);
            process.env.GEMINI_API_KEY = key; // Temporarily swap key for engine

            const output = await ScriptingNode.execute(mockNode, mockContext);

            console.log('\n[Test Result]');
            console.log('Title:', output.title);
            console.log('Main Character:', output.mainCharacter);

            if (output.mainCharacter) {
                console.log('✅ Main Character generated successfully.');
            } else {
                console.warn('⚠️ Main Character MISSING from output (but script generated).');
            }

            console.log('\n[Scenes]');
            output.scenes.forEach(scene => {
                console.log(`Scene ${scene.id}:`);
                console.log(`- Visual: ${scene.visualPrompt}`);
                console.log(`- Character in Scene Object: ${scene.mainCharacter}`);

                if (scene.visualPrompt.toLowerCase().includes('man') || scene.visualPrompt.toLowerCase().includes('person') || scene.visualPrompt.toLowerCase().includes('office')) {
                    console.log('✅ Visual prompt seems to contain character context.');
                }
            });

            success = true;
            break; // Stop if one key works
        } catch (error: any) {
            console.error(`❌ Key failed: ${error.message}`);
        }
    }

    if (!success) {
        console.error('\n[Fatal] All keys failed to generate script.');
    }
}

main();
