
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import VideoProject from '@/models/VideoProject';
import { TrendAnalysisNode } from '@/lib/video-workflow/nodes/TrendAnalysisNode';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'superadmin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { projectId, topic } = body;

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        await connectDB();
        const project = await VideoProject.findById(projectId);
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Execute Trend Analysis
        // We create a mock context and node for the execution
        const mockNode = {
            id: 'trend-1',
            type: 'trend',
            data: { topic: topic || project.topic }
        };

        const mockContext = {
            projectId,
            nodes: [],
            edges: [],
            results: {},
            status: 'running' as const
        };

        const result = await TrendAnalysisNode.execute(mockNode, mockContext);

        // Update Project with Result
        project.workflow.data = project.workflow.data || {};
        project.workflow.data.trend = result;
        project.workflow.stepStatus = project.workflow.stepStatus || {};
        project.workflow.stepStatus.trend = 'completed';
        project.workflow.currentStep = 'trend';

        // Also update the main topic if it changed
        if (topic) {
            project.topic = topic;
        }

        await project.save();

        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        console.error('Trend Step Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
