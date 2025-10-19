import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';
import UserCoupon from '@/models/UserCoupon';

// 쿠폰 다운로드
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    await connectDB();

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: '쿠폰 코드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 쿠폰 조회
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return NextResponse.json(
        { error: '존재하지 않는 쿠폰입니다.' },
        { status: 404 }
      );
    }

    // 쿠폰 유효성 검사
    const now = new Date();

    if (coupon.status !== 'active') {
      return NextResponse.json(
        { error: '사용할 수 없는 쿠폰입니다.' },
        { status: 400 }
      );
    }

    if (coupon.validFrom > now) {
      return NextResponse.json(
        { error: '아직 사용할 수 없는 쿠폰입니다.' },
        { status: 400 }
      );
    }

    if (coupon.validUntil < now) {
      return NextResponse.json(
        { error: '만료된 쿠폰입니다.' },
        { status: 400 }
      );
    }

    // 사용 횟수 제한 확인
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: '쿠폰 다운로드 횟수가 모두 소진되었습니다.' },
        { status: 400 }
      );
    }

    // 사용자별 사용 횟수 확인
    const userCouponCount = await UserCoupon.countDocuments({
      userId: (session.user as any).id,
      couponId: coupon._id
    });

    if (coupon.userUsageLimit && userCouponCount >= coupon.userUsageLimit) {
      return NextResponse.json(
        { error: '이미 다운로드한 쿠폰입니다.' },
        { status: 400 }
      );
    }

    // 이미 다운로드한 쿠폰인지 확인 (중복 방지)
    const existingUserCoupon = await UserCoupon.findOne({
      userId: (session.user as any).id,
      couponId: coupon._id,
      status: { $in: ['available', 'used'] }
    });

    if (existingUserCoupon) {
      return NextResponse.json(
        { error: '이미 다운로드한 쿠폰입니다.' },
        { status: 400 }
      );
    }

    // 사용자별 유효기간 계산
    let userValidUntil: Date;
    if (coupon.validityType === 'from_download') {
      // 다운로드 시점부터 유효기간 계산
      const downloadTime = new Date();
      userValidUntil = new Date(downloadTime.getTime() + (coupon.validityDurationDays || 7) * 24 * 60 * 60 * 1000);
    } else {
      // 고정 기간 사용
      userValidUntil = coupon.validUntil;
    }

    // 사용자 쿠폰 생성
    const userCoupon = await UserCoupon.create({
      userId: (session.user as any).id,
      couponId: coupon._id,
      code: coupon.code,
      status: 'available',
      downloadedAt: new Date(),
      validUntil: userValidUntil
    });

    return NextResponse.json({
      success: true,
      message: '쿠폰이 다운로드되었습니다.',
      coupon: {
        _id: userCoupon._id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil
      }
    });

  } catch (error) {
    console.error('쿠폰 다운로드 오류:', error);
    return NextResponse.json(
      { error: '쿠폰 다운로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

