import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { validateCoupon, recordCouponUsage } from '@/lib/couponValidator';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.type !== 'user') {
      return NextResponse.json(
        { error: '사용자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    await connectDB();

    const { code, cartItems, totalAmount, orderId } = await request.json();

    // 입력 검증
    if (!code || !cartItems || !totalAmount || !orderId) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 쿠폰 검증
    const validationResult = await validateCoupon({
      code,
      userId: decoded.id,
      cartItems,
      totalAmount
    });

    if (!validationResult.isValid) {
      return NextResponse.json({
        success: false,
        error: validationResult.error
      });
    }

    // 쿠폰 사용 기록 생성
    const usageRecorded = await recordCouponUsage(
      validationResult.coupon!._id,
      decoded.id,
      orderId,
      code,
      validationResult.discountAmount!,
      totalAmount,
      validationResult.finalAmount!
    );

    if (!usageRecorded) {
      return NextResponse.json(
        { error: '쿠폰 사용 기록 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '쿠폰이 적용되었습니다.',
      coupon: validationResult.coupon,
      discountAmount: validationResult.discountAmount,
      finalAmount: validationResult.finalAmount
    });

  } catch (error) {
    console.error('Coupon usage API error:', error);
    return NextResponse.json(
      { error: '쿠폰 사용 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}















