
import fs from 'fs';
import path from 'path';

// Load .env manually BEFORE anything else
const envFiles = ['.env.local', '.env'];
for (const file of envFiles) {
    const envPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(envPath)) {
        console.log(`[TestScript] Loading env from ${file}`);
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
                if (key && value && !process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
    }
}

// Main execution
async function testWorkflow() {
    console.log('Importing modules...');
    // Dynamic imports to ensure env vars are loaded first
    const { connectDB } = await import('../src/lib/db');
    const { default: VideoProject } = await import('../src/models/VideoProject');
    const { VideoWorkflowEngine } = await import('../src/lib/video-workflow/VideoWorkflowEngine');
    const mongoose = (await import('mongoose')).default;
    // const { WorkflowNode, WorkflowEdge } = await import('../src/lib/video-workflow/types'); // Types are removed at runtime

    console.log('Connecting to DB...');
    await connectDB();

    console.log('Creating Test Project...');
    const topic = 'Test Topic ' + Date.now();

    const nodes: any[] = [
        { id: 'trend-1', type: 'trend', data: { topic }, position: { x: 0, y: 0 } },
        { id: 'script-1', type: 'script', data: { trendContext: null }, position: { x: 200, y: 0 } },
        { id: 'asset-1', type: 'asset', data: { scriptContext: null, type: 'image' }, position: { x: 400, y: 0 } },
        { id: 'video-1', type: 'video', data: { imageAssetId: 'asset-1', duration: 5 }, position: { x: 600, y: 0 } },
        { id: 'synthesis-1', type: 'synthesis', data: { videoClips: ['video-1'] }, position: { x: 800, y: 0 } }
    ];

    const edges: any[] = [
        { id: 'e1', source: 'trend-1', target: 'script-1' },
        { id: 'e2', source: 'script-1', target: 'asset-1' },
        { id: 'e3', source: 'asset-1', target: 'video-1' },
        { id: 'e4', source: 'video-1', target: 'synthesis-1' }
    ];

    const project = await VideoProject.create({
        userId: new mongoose.Types.ObjectId(), // Fake ID
        topic,
        status: 'pending',
        workflow: { nodes, edges, results: {}, currentStep: 'init', errors: [] }
    });

    console.log(`Project created: ${project._id}`);
    console.log('Starting Workflow Engine...');

    const engine = new VideoWorkflowEngine(project._id.toString(), nodes, edges);
    const context = await engine.execute();

    console.log('Execution finished.');
    console.log('Status:', context.status);
    console.log('Errors:', context.errors);
    console.log('Results Keys:', Object.keys(context.results));

    if (context.status === 'completed') {
        console.log('TEST PASSED');
    } else {
        console.log('TEST FAILED');
    }

    process.exit(0);
}

testWorkflow().catch(err => {
    console.error(err);
    process.exit(1);
});
