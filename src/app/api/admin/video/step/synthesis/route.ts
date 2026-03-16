import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import VideoProject from '@/models/VideoProject';
import { SynthesisNode } from '@/lib/video-workflow/nodes/SynthesisNode';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { projectId, transitionType, transitionDuration } = body;

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        await connectDB();
        const project = await VideoProject.findById(projectId);
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Gather video clips
        const interactiveClips = project.workflow?.data?.videoClips;
        const oldResultsClips = project.workflow?.results?.['video-1']?.videoClips;
        const videoClips = interactiveClips || oldResultsClips;

        if (!videoClips || videoClips.length === 0) {
            return NextResponse.json({ error: 'No video clips found to synthesize' }, { status: 400 });
        }

        // Sort clips by scene ID to ensure order
        videoClips.sort((a: string, b: string) => {
            const getNum = (str: string) => {
                const match = str.match(/video_scene_(\d+)\.mp4/);
                return match ? parseInt(match[1]) : 0;
            };
            return getNum(a) - getNum(b);
        });

        const mockNode = {
            id: 'synthesis-1',
            type: 'synthesis',
            data: {
                videoClips,
                transitionType: transitionType || 'none',
                transitionDuration: parseFloat(transitionDuration) || 0.5
            }
        };

        const mockContext = {
            projectId,
            nodes: [],
            edges: [],
            results: {},
            status: 'running' as const
        };

        const result = await SynthesisNode.execute(mockNode, mockContext);

        project.workflow.stepStatus.synthesis = 'completed';
        project.workflow.currentStep = 'synthesis';
        project.finalVideoUrl = result.finalVideoUrl;
        project.status = 'completed';

        await project.save();

        return NextResponse.json({ success: true, finalVideoUrl: result.finalVideoUrl });

    } catch (error: any) {
        console.error('Synthesis Step Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
