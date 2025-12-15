import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import RecoveryScore from '@/models/RecoveryScore';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await req.json();
        const { rawScore, totalScore, metaphor, answers, date } = body;

        // Use provided date or today (normalized to start of day)
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        // Upsert: Update if exists for today, insert if not
        const userId = (session.user as any).id || session.user.email;
        const score = await RecoveryScore.findOneAndUpdate(
            {
                userId: userId,
                date: targetDate
            },
            {
                userId: userId,
                date: targetDate,
                rawScore,
                totalScore,
                metaphor,
                answers
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
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get('date');

        const userId = (session.user as any).id || session.user.email;
        const query: any = { userId: userId };

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
