import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';
import CouponUsage from '@/models/CouponUsage';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '관리자 인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.type !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const type = searchParams.get('type');

    // 필터 조건 구성
    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 총 개수 조회
    const total = await Coupon.countDocuments(filter);

    // 쿠폰 목록 조회
    const coupons = await Coupon.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // 통계 정보
    const stats = await Coupon.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' }
        }
      }
    ]);

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        totalUsage: stat.totalUsage
      };
      return acc;
    }, {} as Record<string, { count: number; totalUsage: number }>);

    return NextResponse.json({
      coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        total: total,
        active: statusStats.active?.count || 0,
        inactive: statusStats.inactive?.count || 0,
        expired: statusStats.expired?.count || 0,
        totalUsage: Object.values(statusStats).reduce((sum, stat: any) => sum + (stat.totalUsage || 0), 0)
      }
    });

  } catch (error) {
    console.error('Admin coupons fetch error:', error);
    return NextResponse.json(
      { error: '쿠폰 목록을 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '관리자 인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.type !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    await connectDB();

    const {
      code,
      name,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      userUsageLimit,
      validFrom,
      validUntil,
      applicableProducts,
      applicableCategories,
      excludedProducts,
      targetAudience,
      conditions
    } = await request.json();

    // 입력 검증
    if (!code || !name || !type || value === undefined) {
      return NextResponse.json(
        { error: '필수 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 쿠폰 코드 중복 확인
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return NextResponse.json(
        { error: '이미 존재하는 쿠폰 코드입니다.' },
        { status: 409 }
      );
    }

    // 유효성 검증
    if (type === 'percentage' && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: '퍼센트 할인은 0-100 사이의 값이어야 합니다.' },
        { status: 400 }
      );
    }

    if (type === 'fixed' && value < 0) {
      return NextResponse.json(
        { error: '고정 할인 금액은 0 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    if (validFrom && validUntil && new Date(validFrom) >= new Date(validUntil)) {
      return NextResponse.json(
        { error: '유효 시작일은 종료일보다 이전이어야 합니다.' },
        { status: 400 }
      );
    }

    // 쿠폰 생성
    const coupon = new Coupon({
      code: code.toUpperCase(),
      name,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      userUsageLimit: userUsageLimit || 1,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: new Date(validUntil),
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      excludedProducts: excludedProducts || [],
      targetAudience: targetAudience || 'all',
      conditions: conditions || {},
      createdBy: decoded.id
    });

    await coupon.save();

    return NextResponse.json({
      success: true,
      message: '쿠폰이 생성되었습니다.',
      coupon
    });

  } catch (error) {
    console.error('Admin coupon creation error:', error);
    return NextResponse.json(
      { error: '쿠폰 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
