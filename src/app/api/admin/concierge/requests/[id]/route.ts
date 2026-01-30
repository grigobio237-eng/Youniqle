import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ConciergeRequest from '@/models/ConciergeRequest';
import { withAdminAuth } from '@/lib/authMiddleware';

async function updateRequestHandler(
    request: NextRequest,
    user: any,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await context.params;
        const { status, notes } = await request.json();

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const updatedRequest = await ConciergeRequest.findByIdAndUpdate(
            id,
            { status, notes, updatedAt: new Date() },
            { new: true }
        );

        if (!updatedRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        return NextResponse.json(updatedRequest);
    } catch (error) {
        console.error('Failed to update concierge request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const PATCH = withAdminAuth(updateRequestHandler as any);
