import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import ConciergeRequest from '@/models/ConciergeRequest';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const latestRequest = await ConciergeRequest.findOne({
            userId: session.user.email
        }).sort({ createdAt: -1 });

        if (!latestRequest) {
            return NextResponse.json(null);
        }

        return NextResponse.json({
            analysis: latestRequest.aiAnalysis,
            plans: latestRequest.suggestedPlans,
            status: latestRequest.status,
            createdAt: latestRequest.createdAt
        });

    } catch (error) {
        console.error('Failed to fetch user concierge request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
