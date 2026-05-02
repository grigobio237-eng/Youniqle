import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import LifeSnap from '@/models/LifeSnap';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const endDateParam = searchParams.get('endDate');

        // endDate 기준 설정 (없으면 현재 시간)
        const endDate = endDateParam ? new Date(endDateParam) : new Date();
        
        // startDate는 endDate로부터 7일 전
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 7);

        const query: any = {
            userId: (session.user as any).id,
            createdAt: { $gte: startDate, $lte: endDate }
        };

        if (category && category !== 'ALL') {
            query.category = category;
        }

        const snaps = await LifeSnap.find(query).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: snaps,
            period: { start: startDate, end: endDate }
        });

    } catch (error) {
        console.error('Failed to fetch life snaps:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
