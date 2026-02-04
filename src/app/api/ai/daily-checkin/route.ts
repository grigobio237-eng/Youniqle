import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { date } = body; // Client local date string

        await connectDB();
        const user = await User.findOne({ email: session.user?.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate context based on time (Always use Asia/Seoul for KST)
        const now = new Date();
        const kstOptions: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Seoul', hour: 'numeric', hour12: false, weekday: 'long' };
        const kstFormatter = new Intl.DateTimeFormat('ko-KR', kstOptions);
        const parts = kstFormatter.formatToParts(now);

        const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
        const dayOfWeek = parts.find(p => p.type === 'weekday')?.value || '오늘';

        let timeOfDay = '아침';
        if (hour >= 12 && hour < 18) timeOfDay = '오후';
        else if (hour >= 18 && hour < 22) timeOfDay = '저녁';
        else if (hour >= 22 || hour < 6) timeOfDay = '밤';

        // TODO: Retrieve recent recovery score context if available
        const recentContext = '';

        const checkInData = await GeminiAIEngine.generateDailyCheckInQuestion({
            userName: user.name || '유니클 멤버',
            dayOfWeek,
            timeOfDay,
            recentContext
        });

        return NextResponse.json(checkInData);

    } catch (error) {
        console.error('Daily Check-in API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
