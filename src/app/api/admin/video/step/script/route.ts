
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import VideoProject from '@/models/VideoProject';
import { ScriptingNode } from '@/lib/video-workflow/nodes/ScriptingNode';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'superadmin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { projectId, trendData } = body;

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        await connectDB();
        const project = await VideoProject.findById(projectId);
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Use provided trend data or fallback to saved data
        const trendContext = trendData || project.workflow?.data?.trend;

        if (!trendContext) {
            return NextResponse.json({ error: 'Trend data is missing. Please complete Trend step first.' }, { status: 400 });
        }

        // Execute Script Generation
        const mockNode = {
            id: 'script-1',
            type: 'script',
            data: { trendContext: trendContext }
        };

        // Mock context where we inject the trend result so the node can find it if it looks for edges
        // But our modified Node logic checks config.trendContext too.
        // Let's ensure the node logic handles direct data injection.
        // Looking at ScriptingNode.ts:
        // const trendContext = inputEdge ? context.results[inputEdge.source] : config.trendContext;
        // So passing it in data is perfect.

        const mockContext = {
            projectId,
            nodes: [],
            edges: [],
            results: {}, // No previous results needed if we pass in config
            status: 'running' as const
        };

        const result = await ScriptingNode.execute(mockNode, mockContext);

        // Update Project
        project.workflow.data = project.workflow.data || {};
        project.workflow.data.script = result;
        project.workflow.stepStatus = project.workflow.stepStatus || {};
        project.workflow.stepStatus.script = 'completed';
        project.workflow.currentStep = 'script';

        await project.save();

        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        console.error('Script Step Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
