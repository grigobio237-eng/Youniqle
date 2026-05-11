import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import SleepLog from '@/models/SleepLog';
import { getKSTDate } from '@/lib/date';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const userId = (session.user as any).id;
        
        // Fetch last 7 days of sleep logs
        const logs = await SleepLog.find({ userId })
            .sort({ date: -1 })
            .limit(7);

        return NextResponse.json(logs);
    } catch (error) {
        console.error('Sleep GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { date, bedtime, waketime, duration, quality, efficiency, aiAnalysis } = body;

        if (!date || !bedtime || !waketime || duration === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();
        const userId = (session.user as any).id;

        // Upsert today's sleep log
        const log = await SleepLog.findOneAndUpdate(
            { userId, date },
            { 
                bedTime: bedtime,
                wakeTime: waketime,
                duration,
                quality: typeof quality === 'string' ? (quality === 'great' ? 100 : quality === 'good' ? 80 : quality === 'fair' ? 60 : 40) : quality,
                efficiency: efficiency || 0,
                aiAnalysis
            },
            { upsert: true, new: true }
        );

        return NextResponse.json(log);
    } catch (error) {
        console.error('Sleep POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
