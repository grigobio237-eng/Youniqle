import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import UserMood from '@/models/UserMood';
import User from '@/models/User';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        const { moodScore, timeOfDay, sessionId } = await req.json();

        let userId = null;
        if (session?.user?.email) {
            const user = await User.findOne({ email: session.user.email });
            if (user) userId = user._id;
        }

        const newMood = await UserMood.create({
            userId,
            sessionId: sessionId || 'anonymous',
            moodScore,
            timeOfDay
        });

        return NextResponse.json({ success: true, data: newMood }, { status: 201 });
    } catch (error: any) {
        console.error('Mood save error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
