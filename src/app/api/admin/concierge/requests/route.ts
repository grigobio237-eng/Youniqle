import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ConciergeRequest from '@/models/ConciergeRequest';
import { withAdminAuth } from '@/lib/authMiddleware';

async function getRequestsHandler() {
    try {
        await connectDB();
        const requests = await ConciergeRequest.find({}).sort({ createdAt: -1 });
        return NextResponse.json(requests);
    } catch (error) {
        console.error('Failed to fetch requests:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const GET = withAdminAuth(getRequestsHandler);
