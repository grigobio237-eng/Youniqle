import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import PointTransaction from '@/models/PointTransaction';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json(
                { error: '로그인이 필요합니다.' },
                { status: 401 }
            );
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json(
                { error: '사용자를 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        if (!user.referralCode) {
            return NextResponse.json({
                referralCount: 0,
                totalEarned: 0,
                referrals: []
            });
        }

        // 1. 내가 초대한 친구 목록 조회 (1단계만 표시)
        const directReferrals = await User.find({ referredBy: user.referralCode })
            .select('name email createdAt grade')
            .sort({ createdAt: -1 });

        const referrals = directReferrals.map((referral: any) => ({
            id: referral._id,
            name: referral.name.length > 2 ? referral.name[0] + '*' + referral.name.slice(2) : referral.name[0] + '*', // 간단한 마스킹
            email: referral.email.split('@')[0].slice(0, 3) + '****@' + referral.email.split('@')[1], // 이메일 마스킹
            grade: referral.grade,
            joinedAt: referral.createdAt
        }));

        // 2. 친구 초대로 얻은 총 포인트 계산
        // PointTransaction에서 description에 "친구 초대 리워드" 또는 "1단계 추천인 리워드", "2단계 추천인 리워드"가 포함된 내역 합산
        // 기존에 "친구 초대 리워드"로 남겼고, 새로 "1단계...", "2단계..."로 남기기로 했으므로 모두 포함
        const rewardTransactions = await PointTransaction.find({
            userId: user._id,
            $or: [
                { description: { $regex: '친구 초대 리워드', $options: 'i' } },
                { description: { $regex: '단계 추천인 리워드', $options: 'i' } }
            ],
            type: 'earned'
        });

        const totalEarned = rewardTransactions.reduce((sum: number, tx: any) => sum + tx.amount, 0);

        return NextResponse.json({
            referralCount: referrals.length,
            totalEarned,
            referrals
        });

    } catch (error) {
        console.error('Referral stats error:', error);
        return NextResponse.json(
            { error: '친구 초대 정보를 불러오는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
