import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import ConciergeRequest from '@/models/ConciergeRequest';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { planId } = await req.json();
        if (!planId) {
            return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
        }

        await connectDB();

        // Get the latest request for this user and update the selected plan
        const updatedRequest = await ConciergeRequest.findOneAndUpdate(
            { userEmail: session.user.email },
            {
                selectedPlanId: planId,
                status: 'pending' // Reset to pending if user re-selects? Or keep 'reviewing'? 
                // Usually 'reviewing' means admin is lookin. Let's keep it 'pending' for a new submission.
            },
            { sort: { createdAt: -1 }, new: true }
        );

        if (!updatedRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedRequest });
    } catch (error) {
        console.error('[API/ConciergeSelect] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
