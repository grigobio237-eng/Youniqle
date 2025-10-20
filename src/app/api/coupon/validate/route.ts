import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { validateCoupon } from '@/lib/couponValidator';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { code, cartItems, totalAmount } = await request.json();

    // 입력 검증
    if (!code) {
      return NextResponse.json(
        { error: '쿠폰 코드를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: '장바구니에 상품이 없습니다.' },
        { status: 400 }
      );
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { error: '주문 금액이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    // 쿠폰 검증
    const result = await validateCoupon({
      code,
      cartItems,
      totalAmount
    });

    if (!result.isValid) {
      return NextResponse.json({
        success: false,
        error: result.error
      });
    }

    return NextResponse.json({
      success: true,
      coupon: result.coupon,
      discountAmount: result.discountAmount,
      finalAmount: result.finalAmount
    });

  } catch (error) {
    console.error('Coupon validation API error:', error);
    return NextResponse.json(
      { error: '쿠폰 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}















