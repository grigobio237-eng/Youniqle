
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import VideoProject from '@/models/VideoProject';

// GET Project Detail
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectDB();
        const project = await VideoProject.findById(params.id);

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json({ project });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT Update Project (Manual Edits)
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        // Allow updating specific workflow data fields
        // e.g. { "workflow.data.trend": { ... }, "topic": "..." }

        await connectDB();

        // We use findByIdAndUpdate with $set to support dotted keys if passed directly, 
        // OR we can manually merge. Mongoose supports loose schema if Mixed.
        // Let's assume body contains the exact update object (flat or nested).
        // Safest is to list allowed fields or spread.

        const updateData: any = {};
        if (body.workflow) {
            // Updated to handle both nested and flat structures more robustly
            if (body.workflow.data) {
                // We should probably merge these carefully or replace entirely. 
                // For interactive steps, we usually replace the whole step data.
                if (body.workflow.data.trend) updateData['workflow.data.trend'] = body.workflow.data.trend;
                if (body.workflow.data.script) updateData['workflow.data.script'] = body.workflow.data.script;
                if (body.workflow.data.assets) updateData['workflow.data.assets'] = body.workflow.data.assets;
                if (body.workflow.data.videoClips) updateData['workflow.data.videoClips'] = body.workflow.data.videoClips;
            }
            if (body.workflow.stepStatus) {
                // Allow updating statuses manually if needed
                Object.keys(body.workflow.stepStatus).forEach((k: string) => {
                    updateData[`workflow.stepStatus.${k}`] = (body.workflow.stepStatus as any)[k];
                });
            }
            if (body.workflow.currentStep) {
                updateData['workflow.currentStep'] = body.workflow.currentStep;
            }
        }

        // Also allow direct topic update if needed
        if (body.topic) updateData.topic = body.topic;


        const project = await VideoProject.findByIdAndUpdate(params.id, { $set: updateData }, { new: true });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, project });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectDB();
        await VideoProject.findByIdAndDelete(params.id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
