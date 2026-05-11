import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import TodoLog from '@/models/TodoLog';
import { getKSTDate } from '@/lib/date';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const userId = (session.user as any).id;
        const date = getKSTDate();
        
        // Fetch today's todo log
        const log = await TodoLog.findOne({ userId, date });

        return NextResponse.json(log || { tasks: [] });
    } catch (error) {
        console.error('Todo GET Error:', error);
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
        const { tasks, summary } = body;
        const date = getKSTDate();

        await dbConnect();
        const userId = (session.user as any).id;

        // Upsert today's todo log
        const log = await TodoLog.findOneAndUpdate(
            { userId, date },
            { tasks, summary },
            { upsert: true, new: true }
        );

        return NextResponse.json(log);
    } catch (error) {
        console.error('Todo POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
