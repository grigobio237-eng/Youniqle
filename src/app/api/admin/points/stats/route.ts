import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import PointTransaction from '@/models/PointTransaction';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 포인트 개요 통계 조회
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    // 전체 회원 수
    const totalUsers = await User.countDocuments();

    // 포인트를 보유한 회원 수
    const usersWithPoints = await User.countDocuments({ points: { $gt: 0 } });

    // 전체 보유 포인트
    const totalPointsResult = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);
    const totalPoints = totalPointsResult[0]?.total || 0;

    // 총 적립 포인트
    const totalEarnedResult = await PointTransaction.aggregate([
      {
        $match: {
          type: { $in: ['earned', 'admin_grant'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const totalEarned = totalEarnedResult[0]?.total || 0;

    // 총 사용 포인트
    const totalUsedResult = await PointTransaction.aggregate([
      {
        $match: {
          type: { $in: ['used', 'admin_deduct'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $abs: '$amount' } }
        }
      }
    ]);
    const totalUsed = totalUsedResult[0]?.total || 0;

    // 총 만료 포인트
    const totalExpiredResult = await PointTransaction.aggregate([
      {
        $match: {
          type: 'expired'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $abs: '$amount' } }
        }
      }
    ]);
    const totalExpired = totalExpiredResult[0]?.total || 0;

    // 평균 포인트 계산
    const averagePointsPerUser = totalUsers > 0 ? totalPoints / totalUsers : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalPoints,
        totalEarned,
        totalUsed,
        totalExpired,
        averagePointsPerUser: Math.round(averagePointsPerUser),
        usersWithPoints,
      },
    });
  } catch (error: any) {
    console.error('포인트 통계 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '포인트 통계 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

