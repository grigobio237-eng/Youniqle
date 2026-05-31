import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import LifeSnap from '@/models/LifeSnap';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
        }

        const scans = await LifeSnap.find({ userId: user._id }).sort({ createdAt: -1 });

        return NextResponse.json({ scans });
    } catch (error: any) {
        console.error('Scan Fetch Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
