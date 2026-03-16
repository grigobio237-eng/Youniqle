
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import VideoProject from '@/models/VideoProject';
import { AssetGenNode } from '@/lib/video-workflow/nodes/AssetGenNode';
import path from 'path';
import fs from 'fs';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { projectId, sceneId, voiceName, gender } = body;

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        await connectDB();
        const project = await VideoProject.findById(projectId);
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const scriptData = project.workflow?.data?.script || project.workflow?.results?.['script-1'];
        if (!scriptData || !scriptData.scenes) {
            return NextResponse.json({ error: 'Script data missing' }, { status: 400 });
        }

        const outputDir = path.join(process.cwd(), 'public', 'output', projectId);
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const scenesToProcess = sceneId
            ? scriptData.scenes.filter((s: any) => s.id === sceneId)
            : scriptData.scenes;

        const newAssets = [];

        for (const scene of scenesToProcess) {
            // Force regenerate for audio always if requested (cheap/fast)
            const existingPath = path.join(outputDir, `scene_${scene.id}.mp3`);
            if (fs.existsSync(existingPath)) fs.unlinkSync(existingPath);

            const asset = await AssetGenNode.generateAudio(scene, projectId, outputDir, voiceName, gender);
            newAssets.push(asset);
        }

        project.workflow.data = project.workflow.data || {};
        const currentAssets = project.workflow.data.assets || [];

        const validAssets = currentAssets.filter((a: any) =>
            !scenesToProcess.find((s: any) => s.id === a.sceneId && a.type === 'audio')
        );
        project.workflow.data.assets = [...validAssets, ...newAssets];

        if (!sceneId) {
            project.workflow.stepStatus.audio = 'completed';
            project.workflow.currentStep = 'audio';
        }

        await project.save();

        return NextResponse.json({ success: true, assets: newAssets });

    } catch (error: any) {
        console.error('Audio Step Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
