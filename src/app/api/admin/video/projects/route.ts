
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import VideoProject from '@/models/VideoProject';
import { getTemplate } from '@/lib/video-workflow/templates';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectDB();
        const projects = await VideoProject.find().sort({ createdAt: -1 });

        return NextResponse.json({ projects });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { topic, productName, projectType, initialAssets = [] } = body;

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        await connectDB();

        // Convert initialAssets to asset model format if provided
        const formattedAssets = initialAssets
            .filter((asset: any) => asset.path) // Filter out optional assets that weren't uploaded
            .map((asset: any, index: number) => ({
                id: `initial-${index}`,
                sceneId: null, // Don't assign to scene yet, use as reference
                type: asset.type,
                role: asset.role,
                path: asset.path,
                description: asset.role === 'product' ? 'Actual product image' : 'Model/Background reference image'
            }));

        const projectTypeVal = projectType || 'shortform';
        const templateSteps = getTemplate(projectTypeVal).steps;

        const project = await VideoProject.create({
            userId: (session.user as any).id,
            topic,
            productName, // Save product name
            projectType: projectTypeVal,
            status: 'pending',
            workflow: {
                template: { steps: templateSteps },
                currentStep: templateSteps[0]?.id || 'trend',
                stepStatus: templateSteps.reduce((acc: any, step: any) => {
                    acc[step.id] = (projectTypeVal === 'product_promo' && (step.id === 'product_asset' || step.id === 'model_asset')) ? 'completed' : 'idle';
                    return acc;
                }, {}),
                results: {},
                data: {
                    assets: formattedAssets // Store initial assets
                },
                errors: []
            }
        });

        return NextResponse.json({
            success: true,
            projectId: project._id,
            message: 'Project created'
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
