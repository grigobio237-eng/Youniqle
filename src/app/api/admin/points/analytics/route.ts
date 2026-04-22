import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PointTransaction from '@/models/PointTransaction';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 포인트 분석 데이터 조회
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'superadmin')) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // 7, 30, 90, 365
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // 기본 통계
    const [totalUsersResult, usersWithPointsResult] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ points: { $gt: 0 } }),
    ]);
    
    const totalUsers = totalUsersResult;
    const usersWithPoints = usersWithPointsResult;

    const totalPoints = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);

    // 포인트 적립/사용 통계
    const [earnedStats, usedStats, expiredStats] = await Promise.all([
      PointTransaction.aggregate([
        { 
          $match: { 
            type: { $in: ['earned', 'admin_grant'] },
            createdAt: { $gte: startDate }
          } 
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          } 
        }
      ]),
      PointTransaction.aggregate([
        { 
          $match: { 
            type: { $in: ['used', 'admin_deduct'] },
            createdAt: { $gte: startDate }
          } 
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: { $abs: '$amount' } },
            count: { $sum: 1 }
          } 
        }
      ]),
      PointTransaction.aggregate([
        { 
          $match: { 
            type: 'expired',
            createdAt: { $gte: startDate }
          } 
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: { $abs: '$amount' } },
            count: { $sum: 1 }
          } 
        }
      ]),
    ]);

    const totalEarned = earnedStats[0]?.total || 0;
    const totalUsed = usedStats[0]?.total || 0;
    const totalExpired = expiredStats[0]?.total || 0;

    // 일별 포인트 적립/사용 추이
    const dailyTrend = await PointTransaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          earned: {
            $sum: {
              $cond: [
                { $in: ['$type', ['earned', 'admin_grant']] },
                '$amount',
                0
              ]
            }
          },
          used: {
            $sum: {
              $cond: [
                { $in: ['$type', ['used', 'admin_deduct', 'expired']] },
                { $abs: '$amount' },
                0
              ]
            }
          },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 타입별 통계
    const typeStats = await PointTransaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          total: {
            $sum: {
              $cond: [
                { $in: ['$type', ['used', 'admin_deduct', 'expired']] },
                { $abs: '$amount' },
                '$amount'
              ]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // 사용자별 평균 포인트
    const avgPoints = await User.aggregate([
      {
        $group: {
          _id: null,
          avg: { $avg: '$points' },
          max: { $max: '$points' },
          min: { $min: '$points' }
        }
      }
    ]);

    // 만료 예정 포인트
    const expiringPoints = await PointTransaction.aggregate([
      {
        $match: {
          type: { $in: ['earned', 'admin_grant'] },
          expiresAt: { $gte: new Date(), $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // 포인트 사용 패턴 (주간)
    const weeklyPattern = await PointTransaction.aggregate([
      {
        $match: {
          type: 'used',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          total: { $sum: { $abs: '$amount' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          usersWithPoints,
          totalPoints: totalPoints[0]?.total || 0,
          averagePoints: avgPoints[0]?.avg || 0,
          maxPoints: avgPoints[0]?.max || 0,
          minPoints: avgPoints[0]?.min || 0,
        },
        stats: {
          totalEarned,
          totalUsed,
          totalExpired,
          usageRate: totalEarned > 0 ? (totalUsed / totalEarned) * 100 : 0,
        },
        dailyTrend: dailyTrend.map(item => ({
          date: item._id,
          earned: item.earned,
          used: item.used,
        })),
        typeStats: typeStats.map(item => ({
          type: item._id,
          total: item.total,
          count: item.count,
        })),
        expiringPoints: {
          total: expiringPoints[0]?.total || 0,
          count: expiringPoints[0]?.count || 0,
        },
        weeklyPattern: weeklyPattern.map(item => ({
          dayOfWeek: item._id, // MongoDB의 dayOfWeek는 1-7 (1=일요일)
          total: item.total,
          count: item.count,
        })),
      },
    });
  } catch (error: any) {
    console.error('포인트 분석 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '포인트 분석 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

