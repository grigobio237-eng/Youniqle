
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import VideoProject from '@/models/VideoProject';
import { VideoGenNode } from '@/lib/video-workflow/nodes/VideoGenNode';
import path from 'path';
import fs from 'fs';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'superadmin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { projectId, sceneId, regenerate } = body;

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

        const assets = project.workflow?.data?.assets || project.workflow?.results?.['asset-1']?.assets;
        if (!assets || assets.length === 0) {
            return NextResponse.json({ error: 'Assets missing' }, { status: 400 });
        }

        const outputDir = path.join(process.cwd(), 'public', 'output', projectId);
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const scenesToProcess = sceneId
            ? scriptData.scenes.filter((s: any) => s.id === sceneId)
            : scriptData.scenes;

        const newClips = [];

        for (const scene of scenesToProcess) {
            if (regenerate) {
                const existingPath = path.join(outputDir, `video_scene_${scene.id}.mp4`);
                if (fs.existsSync(existingPath)) fs.unlinkSync(existingPath);
            }

            const imageAsset = assets.find((a: any) => a.sceneId === scene.id && a.type === 'image');
            const audioAsset = assets.find((a: any) => a.sceneId === scene.id && a.type === 'audio');

            if (!imageAsset) {
                console.warn(`Skipping scene ${scene.id}: No image asset found`);
                continue;
            }

            const imagePath = path.join(process.cwd(), 'public', imageAsset.path);
            const audioPath = audioAsset ? path.join(process.cwd(), 'public', audioAsset.path) : '';

            const clipPath = await VideoGenNode.generateVideoClip(scene.id, imagePath, audioPath, projectId, outputDir);
            if (clipPath) {
                newClips.push(clipPath);
            }
        }

        // Update Project Data
        // Store clips in workflow.data.videoClips
        project.workflow.data = project.workflow.data || {};
        const currentClips = project.workflow.data.videoClips || []; // Array of strings (paths)

        // Remove old clips for processed scenes
        // clip path format: /output/.../video_scene_ID.mp4
        const validClips = currentClips.filter((path: string) => {
            const match = path.match(/video_scene_(\d+)\.mp4/);
            if (match) {
                const id = parseInt(match[1]);
                return !scenesToProcess.find((s: any) => s.id === id);
            }
            return true;
        });

        project.workflow.data.videoClips = [...validClips, ...newClips];

        if (!sceneId) {
            project.workflow.stepStatus.video = 'completed';
            project.workflow.currentStep = 'video';
        }

        await project.save();

        return NextResponse.json({ success: true, clips: newClips });

    } catch (error: any) {
        console.error('Video Step Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
