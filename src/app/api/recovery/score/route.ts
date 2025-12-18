import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import RecoveryScore from '@/models/RecoveryScore';
import User from '@/models/User';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Find the user to get the correct ObjectId
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await req.json();
        const { rawScore, totalScore, metaphor, answers, date, userNote } = body;

        // Use provided date or today (normalized to start of day)
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        // Upsert: Update if exists for today, insert if not
        const score = await RecoveryScore.findOneAndUpdate(
            {
                userId: user._id,
                date: targetDate
            },
            {
                userId: user._id,
                date: targetDate,
                rawScore,
                totalScore,
                metaphor,
                answers,
                userNote // Save user note
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ success: true, score });
    } catch (error) {
        console.error('Error saving recovery score:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Find the user to get the correct ObjectId
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get('date');

        const query: any = { userId: user._id };

        if (dateParam) {
            const targetDate = new Date(dateParam);
            targetDate.setHours(0, 0, 0, 0);
            query.date = targetDate;

            const score = await RecoveryScore.findOne(query);
            return NextResponse.json({ score });
        } else {
            // If no date, maybe return recent 7 days? or just all?
            // Let's return recent 30 days for charts
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            query.date = { $gte: thirtyDaysAgo };

            const scores = await RecoveryScore.find(query).sort({ date: 1 });
            return NextResponse.json({ scores });
        }

    } catch (error) {
        console.error('Error fetching recovery score:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
