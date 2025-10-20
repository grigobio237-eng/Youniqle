import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import PointTransaction from '@/models/PointTransaction';

/**
 * 포인트 내역 조회 API
 * GET /api/points/history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // earned, used, expired, admin_grant, admin_deduct

    // 사용자 조회
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 쿼리 조건 생성
    const query: any = { userId: user._id };
    if (type) {
      query.type = type;
    }

    // 포인트 내역 조회
    const transactions = await PointTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('orderId', 'orderNumber totalAmount')
      .lean();

    // 전체 개수 조회
    const totalCount = await PointTransaction.countDocuments(query);

    // 통계 정보 계산
    const stats = await PointTransaction.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const statsMap = stats.reduce((acc, stat) => {
      acc[stat._id] = {
        totalAmount: stat.totalAmount,
        count: stat.count
      };
      return acc;
    }, {} as any);

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        },
        stats: {
          totalEarned: statsMap.earned?.totalAmount || 0,
          totalUsed: Math.abs(statsMap.used?.totalAmount || 0),
          totalExpired: Math.abs(statsMap.expired?.totalAmount || 0),
          totalAdminGrant: statsMap.admin_grant?.totalAmount || 0,
          totalAdminDeduct: Math.abs(statsMap.admin_deduct?.totalAmount || 0)
        },
        currentBalance: user.points
      }
    });

  } catch (error) {
    console.error('포인트 내역 조회 API 오류:', error);
    return NextResponse.json(
      { error: '포인트 내역 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
