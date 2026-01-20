
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Diagnosis from '@/models/Diagnosis';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // For development/testing, use test email if no session
        const TEST_USER_EMAIL = 'sin93101190@gmail.com';
        const userEmail = session?.user?.email || TEST_USER_EMAIL;

        await connectDB();

        // Find user to get their ID
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch all diagnoses for this user, sorted by date (newest first)
        const history = await Diagnosis.find({ userId: user._id })
            .select('type totalScore categoryScores resultTitle aiSolution createdAt')
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            history
        });

    } catch (error) {
        console.error('Recovery History API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
