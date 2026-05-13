import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import PreConsultation from '@/models/PreConsultation';
import User from '@/models/User';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find latest pre-consultation document
        const latestConsultation = await PreConsultation.findOne({ user: user._id })
            .sort({ createdAt: -1 });

        return NextResponse.json(latestConsultation);

    } catch (error: any) {
        console.error('Latest Consultation Fetch Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
