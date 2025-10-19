import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import UserCoupon from '@/models/UserCoupon';
import Coupon from '@/models/Coupon';
import mongoose from 'mongoose';

// 내 쿠폰 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // available, used, expired
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 필터 설정
    const filter: any = {
      userId: (session.user as any).id
    };

    if (status) {
      filter.status = status;
    }

    // 쿠폰 목록 조회 (쿠폰 정보 populate)
    const userCoupons = await UserCoupon.find(filter)
      .populate({
        path: 'couponId',
        select: 'code name description type value minOrderAmount maxDiscountAmount validFrom validUntil status'
      })
      .sort({ downloadedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // 만료된 쿠폰 상태 업데이트
    const now = new Date();
    for (const userCoupon of userCoupons) {
      if (userCoupon.status === 'available' && userCoupon.couponId) {
        const coupon = userCoupon.couponId as any;
        if (coupon.validUntil < now || coupon.status !== 'active') {
          userCoupon.status = 'expired';
          await userCoupon.save();
        }
      }
    }

    // 총 개수 조회
    const total = await UserCoupon.countDocuments(filter);

    // 상태별 개수 조회
    const stats = await UserCoupon.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId((session.user as any).id) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusCounts = {
      available: 0,
      used: 0,
      expired: 0
    };

    stats.forEach((stat: any) => {
      statusCounts[stat._id as keyof typeof statusCounts] = stat.count;
    });

    return NextResponse.json({
      success: true,
      coupons: userCoupons,
      stats: statusCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('내 쿠폰 조회 오류:', error);
    return NextResponse.json(
      { error: '쿠폰 목록을 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

