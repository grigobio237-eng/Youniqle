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

        return NextResponse.json({
            email: user.email,
            name: user.name,
            diagnosisResults: user.diagnosisResults || []
        });

    } catch (error) {
        console.error('Profile Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
