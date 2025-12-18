import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import dbConnect from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // In a real app, you would verify payment here.
        // For now, we simulate a successful subscription.

        // 1 month subscription
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                $set: {
                    subscription: {
                        status: 'active',
                        plan: 'lounge_chat',
                        expiresAt: oneMonthLater
                    }
                }
            },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            subscription: user.subscription
        });

    } catch (error) {
        console.error('Subscription error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
