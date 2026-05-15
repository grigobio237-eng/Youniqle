import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { UserBadge, Badge } from '@/models/Badge';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // 사용자가 획득한 뱃지 목록 조회 (뱃지 정보 populate)
        const earnedBadges = await UserBadge.find({ userId: user._id })
            .populate('badgeId')
            .sort({ earnedAt: -1 });

        return NextResponse.json({ 
            success: true, 
            badges: earnedBadges.map(ub => ({
                ...ub.badgeId.toObject(),
                earnedAt: ub.earnedAt
            }))
        });
    } catch (error: any) {
        console.error('Fetch Badges Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
