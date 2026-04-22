import { NextResponse } from 'next/server';
// Force update
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email || 'sin93101190@gmail.com'; // 개발 모드 폴백 유지

        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { AccessControl } = await import('@/lib/logic/access-control');
        const userTier = AccessControl.getUserGroup(user);
        const limits = AccessControl.getLimits(user);

        // 데이터 보존 기간 필터링 (7일, 90일 등)
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - limits.dataRetentionDays);

        const filteredResults = (user.diagnosisResults || []).filter((res: any) => 
            new Date(res.createdAt) >= cutoffDate
        );

        return NextResponse.json({
            email: user.email,
            name: user.name,
            diagnosisResults: filteredResults,
            tier: userTier,
            limits // UI 제어용으로 전달
        });

    } catch (error) {
        console.error('Profile Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email || 'sin93101190@gmail.com';

        const { name, gender } = await req.json();

        const updateData: any = {};
        if (name) updateData.name = name;
        if (gender) updateData.gender = gender;

        const user = await User.findOneAndUpdate(
            { email: userEmail },
            { $set: updateData },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: {
                email: user.email,
                name: user.name,
                gender: user.gender
            }
        });

    } catch (error) {
        console.error('Profile Update Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
