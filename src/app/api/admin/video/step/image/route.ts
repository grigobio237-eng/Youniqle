
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

        // Get script data (Source of Truth)
        const scriptData = project.workflow?.data?.script || project.workflow?.results?.['script-1'];
        if (!scriptData || !scriptData.scenes) {
            return NextResponse.json({ error: 'Script data missing' }, { status: 400 });
        }

        const outputDir = path.join(process.cwd(), 'public', 'output', projectId);
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const scenesToProcess = sceneId
            ? scriptData.scenes.filter((s: any) => s.id === sceneId)
            : scriptData.scenes;

        if (scenesToProcess.length === 0) {
            return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
        }

        const newAssets = [];

        // 0. 마스터 앵커(Master Anchor) 확보 시도 (일관성 100% 전략)
        const anchorAsset = await AssetGenNode.ensureMasterAnchor(projectId, outputDir);
        if (anchorAsset) {
            newAssets.push(anchorAsset);
        }

        for (const scene of scenesToProcess) {
            // Delete existing if regenerating
            if (regenerate) {
                const existingPath = path.join(outputDir, `scene_${scene.id}.png`);
                if (fs.existsSync(existingPath)) fs.unlinkSync(existingPath);
            }

            const asset = await AssetGenNode.generateImage(scene, projectId, outputDir, project);
            newAssets.push(asset);
        }

        // Merge assets into project data
        project.workflow.data = project.workflow.data || {};
        const currentAssets = project.workflow.data.assets || [];

        // Remove old assets for processed scenes and master anchor
        const validAssets = currentAssets.filter((a: any) => {
            // 마스터 앵커는 무조건 교체 대상 (중복 방지)
            if (a.role === 'master_anchor') return false;
            // 요청된 장면 이미지들도 교체 대상
            const isProcessedScene = scenesToProcess.find((s: any) => s.id === a.sceneId && a.type === 'image');
            return !isProcessedScene;
        });
        project.workflow.data.assets = [...validAssets, ...newAssets];

        // Update Status only if we did all scenes or if it was already completed
        if (!sceneId) {
            project.workflow.stepStatus.image = 'completed';
            project.workflow.currentStep = 'image';
        }

        await project.save();

        return NextResponse.json({ success: true, assets: newAssets });

    } catch (error: any) {
        console.error('Image Step Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
