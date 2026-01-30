import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import ConciergeRequest from '@/models/ConciergeRequest';
import Inquiry from '@/models/Inquiry';
import User from '@/models/User';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 최신 컨시어지 신청 현황 조회 ($or 사용하여 ID 또는 이메일로 검색)
        const latestConcierge = await ConciergeRequest.findOne({
            $or: [
                { userId: user._id },
                { userId: user._id.toString() },
                { userEmail: user.email }
            ]
        }).sort({ createdAt: -1 });

        // 최신 일반 문의 현황 조회
        const latestInquiry = await Inquiry.findOne({
            $or: [
                { userId: user._id },
                { userEmail: user.email }
            ]
        }).sort({ createdAt: -1 });

        return NextResponse.json({
            concierge: latestConcierge ? {
                status: latestConcierge.status,
                createdAt: latestConcierge.createdAt,
                painPoint: latestConcierge.painPoint
            } : null,
            inquiry: latestInquiry ? {
                status: latestInquiry.status,
                createdAt: latestInquiry.createdAt,
                subject: latestInquiry.subject,
                type: latestInquiry.type
            } : null
        });

    } catch (error) {
        console.error('User status fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
