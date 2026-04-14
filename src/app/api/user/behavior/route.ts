import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserBehavior from '@/models/UserBehavior';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        const body = await req.json();

        const {
            eventType,
            itemId,
            itemType,
            itemData,
            context,
            behaviorData,
            metadata
        } = body;

        // 1. Identify User
        let userId = null;
        if (session?.user?.email) {
            const user = await User.findOne({ email: session.user.email });
            if (user) userId = user._id;
        }

        // 2. Generate Session ID if not provided
        const sessionId = body.sessionId || req.cookies.get('session_id')?.value || 'anonymous';

        // 3. Create Behavior Record
        const behavior = await UserBehavior.create({
            userId,
            sessionId,
            eventType,
            itemId,
            itemType,
            itemData,
            context: {
                pageUrl: context?.pageUrl || req.headers.get('referer') || '',
                userAgent: req.headers.get('user-agent') || '',
                deviceType: context?.deviceType || 'desktop',
                language: context?.language || 'ko',
                timezone: context?.timezone || 'Asia/Seoul',
                ...context
            },
            behaviorData,
            metadata: {
                source: 'web',
                version: '1.1.0',
                environment: process.env.NODE_ENV,
                ...metadata
            },
            timestamp: new Date()
        });

        return NextResponse.json({ success: true, id: behavior._id });

    } catch (error: any) {
        console.error('[BehaviorAPI] Error logging behavior:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
