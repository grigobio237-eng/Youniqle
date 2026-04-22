
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import VideoProject from '@/models/VideoProject';
import { VideoWorkflowEngine } from '@/lib/video-workflow/VideoWorkflowEngine';
import { WorkflowNode, WorkflowEdge } from '@/lib/video-workflow/types';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'superadmin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { topic } = body;

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        await connectDB();

        // 1. Create Default Workflow (Linear: Trend -> Script -> Asset -> Video -> Synthesis)
        const nodes: WorkflowNode[] = [
            { id: 'trend-1', type: 'trend', data: { topic }, position: { x: 0, y: 0 } },
            { id: 'script-1', type: 'script', data: { trendContext: null }, position: { x: 200, y: 0 } },
            { id: 'asset-1', type: 'asset', data: { scriptContext: null, type: 'image' }, position: { x: 400, y: 0 } },
            // Asset Node for Audio could be separate or combined. Simplified here.
            { id: 'video-1', type: 'video', data: { imageAssetId: 'asset-1', duration: 5 }, position: { x: 600, y: 0 } },
            { id: 'synthesis-1', type: 'synthesis', data: { videoClips: ['video-1'] }, position: { x: 800, y: 0 } }
        ];

        const edges: WorkflowEdge[] = [
            { id: 'e1', source: 'trend-1', target: 'script-1' },
            { id: 'e2', source: 'script-1', target: 'asset-1' },
            { id: 'e3', source: 'asset-1', target: 'video-1' },
            { id: 'e4', source: 'video-1', target: 'synthesis-1' }
        ];

        // 2. Save Project
        const project = await VideoProject.create({
            userId: (session.user as any).id,
            topic,
            status: 'pending',
            workflow: {
                nodes,
                edges,
                results: {},
                currentStep: 'init',
                errors: []
            }
        });

        // 3. Trigger Workflow Async (Fire and forget, or handle via queue in production)
        // In this implementation, we run it but don't await the full completion for the response.
        // However, Next.js lambda might kill it. For a proper implementation, we need a background worker.
        // For MVP/Demo: We will await it or trust Next.js buffering (unreliable).
        // Better approach for MVP: Await it (long polling) or just start it and hope for the best (or use Edge Runtime/Tasks).
        // Let's run it and update DB status.

        (async () => {
            try {
                const engine = new VideoWorkflowEngine(project._id.toString(), nodes, edges);
                const resultContext = await engine.execute();

                // Extract final video URL from synthesis node
                const synthesisResult = resultContext.results['synthesis-1'];
                const finalVideoUrl = synthesisResult?.finalVideoUrl;

                await VideoProject.findByIdAndUpdate(project._id, {
                    status: 'completed',
                    'workflow.results': resultContext.results,
                    'workflow.status': 'completed',
                    finalVideoUrl: finalVideoUrl
                });
            } catch (err) {
                await VideoProject.findByIdAndUpdate(project._id, {
                    status: 'failed',
                    'workflow.errors': [String(err)]
                });
            }
        })();

        return NextResponse.json({
            success: true,
            projectId: project._id,
            message: 'Workflow started'
        });

    } catch (error: any) {
        console.error('Error creating video project:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'superadmin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectDB();
        const projects = await VideoProject.find().sort({ createdAt: -1 });

        return NextResponse.json({ projects });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
