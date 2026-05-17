import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import ConciergeRequest from '@/models/ConciergeRequest';
import Inquiry from '@/models/Inquiry';
import User from '@/models/User';
import NavigatorConsultation from '@/models/NavigatorConsultation';

export async function GET() {
    try {
        console.log('📡 [GET /api/me/status] Request started');
        const session = await getServerSession(authOptions);
        console.log('📡 [GET /api/me/status] Session check:', !!session, session?.user?.email);
        
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        await connectDB();
        
        // 병렬 쿼리 실행으로 성능 최적화
        const [user, latestConcierge, latestInquiry] = await Promise.all([
            User.findOne({ email: session.user.email }).select('_id referralCode isNavigator email').lean(),
            ConciergeRequest.findOne({ 
                $or: [{ userId: session.user.id }, { userEmail: session.user.email }] 
            }).sort({ createdAt: -1 }).select('status createdAt painPoint').lean(),
            Inquiry.findOne({ 
                $or: [{ userId: session.user.id }, { userEmail: session.user.email }] 
            }).sort({ createdAt: -1 }).select('status createdAt subject type').lean()
        ]);

        if (!user) {
            return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 알람 확인 (독립 쿼리)
        let hasNewConsultationFeedback = false;
        if (user.isNavigator) {
            const unreadInquiry = await NavigatorConsultation.findOne({
                navigatorId: user.referralCode,
                status: 'pending',
                isReadByNavigator: false
            }).select('_id').lean();
            hasNewConsultationFeedback = !!unreadInquiry;
        } else {
            const unreadFeedback = await NavigatorConsultation.findOne({
                userId: user._id,
                status: 'answered',
                isReadByUser: false
            }).select('_id').lean();
            hasNewConsultationFeedback = !!unreadFeedback;
        }

        return NextResponse.json({
            concierge: latestConcierge,
            inquiry: latestInquiry,
            hasNewConsultationFeedback
        });

    } catch (error) {
        console.error('User status fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
