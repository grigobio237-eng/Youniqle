import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import PointTransaction from '@/models/PointTransaction';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 관리자 권한 확인
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'earned', 'used', 'expired', 'admin_grant', 'admin_deduct', 'review_earned'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (type) {
      filter.type = type;
    }

    const transactions = await PointTransaction.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalTransactions = await PointTransaction.countDocuments(filter);

    // 전체 포인트 통계
    const totalCurrentPoints = (await User.aggregate([
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]))[0]?.total || 0;

    const totalEarned = (await PointTransaction.aggregate([
      { $match: { amount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]))[0]?.total || 0;

    const totalUsed = (await PointTransaction.aggregate([
      { $match: { amount: { $lt: 0 } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]))[0]?.total || 0;

    const totalExpiringPoints = (await PointTransaction.aggregate([
      {
        $match: {
          type: 'earned',
          expiresAt: { $gt: new Date() },
          amount: { $gt: 0 }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]))[0]?.total || 0;

    return NextResponse.json({
      success: true,
      transactions,
      totalTransactions,
      currentPage: page,
      totalPages: Math.ceil(totalTransactions / limit),
      stats: {
        totalCurrentPoints,
        totalEarned,
        totalUsed: Math.abs(totalUsed),
        totalExpiringPoints,
      }
    });
  } catch (error) {
    console.error('관리자 포인트 내역 조회 API 오류:', error);
    return NextResponse.json(
      { error: '포인트 내역 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
