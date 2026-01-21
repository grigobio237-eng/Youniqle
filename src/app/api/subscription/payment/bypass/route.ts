import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import dbConnect from '@/lib/db';

/**
 * DEV ONLY: Bypass NicePay and activate subscription directly
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const oneMonthLater = new Date();
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

        await User.findByIdAndUpdate(user._id, {
            $set: {
                subscription: {
                    status: 'active',
                    plan: 'lounge_chat',
                    expiresAt: oneMonthLater
                }
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Subscription Bypass Error:', error);
        return NextResponse.json(
            { error: '구독 처리 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
