import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const category = searchParams.get('category');

    // 현재 시간 기준으로 유효한 쿠폰만 조회
    const now = new Date();
    const filter: any = {
      status: 'active',
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    };

    // 타입 필터
    if (type) {
      filter.type = type;
    }

    // 카테고리 필터 (해당 카테고리에 적용 가능한 쿠폰)
    if (category) {
      filter.$or = [
        { applicableCategories: { $in: [category] } },
        { applicableCategories: { $size: 0 } }, // 모든 카테고리에 적용 가능
        { applicableCategories: { $exists: false } }
      ];
    }

    // 총 개수 조회
    const total = await Coupon.countDocuments(filter);

    // 쿠폰 목록 조회
    const coupons = await Coupon.find(filter)
      .select('-createdBy -conditions -applicableProducts -excludedProducts')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // 사용자에게 보여줄 정보만 필터링
    const publicCoupons = coupons.map(coupon => ({
      _id: coupon._id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil,
      isUsable: coupon.isUsable,
      remainingUsage: coupon.remainingUsage
    }));

    return NextResponse.json({
      coupons: publicCoupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Public coupons fetch error:', error);
    return NextResponse.json(
      { error: '쿠폰 목록을 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}















