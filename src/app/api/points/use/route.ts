import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { deductPoints, validatePointUsage } from '@/lib/pointManager';

/**
 * 포인트 사용 API
 * POST /api/points/use
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    await connectDB();

    const { amount, orderAmount, description } = await request.json();

    // 입력 검증
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: '사용할 포인트를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!orderAmount || orderAmount <= 0) {
      return NextResponse.json(
        { error: '주문 금액이 필요합니다.' },
        { status: 400 }
      );
    }

    // 사용자 조회
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 포인트 사용 가능 여부 확인
    const validation = await validatePointUsage(user._id, amount, orderAmount);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: validation.error,
          maxUsable: validation.maxUsable
        },
        { status: 400 }
      );
    }

    // 포인트 사용 처리
    const result = await deductPoints(
      user._id,
      amount,
      description || '포인트 사용',
      undefined // orderId는 주문 생성 시 추가
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${amount}P가 사용되었습니다.`,
      usedPoints: result.usedPoints,
      newBalance: result.newBalance,
      discountAmount: amount
    });

  } catch (error) {
    console.error('포인트 사용 API 오류:', error);
    return NextResponse.json(
      { error: '포인트 사용 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 포인트 사용 가능 여부 확인 API
 * POST /api/points/validate
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
    const amount = parseInt(searchParams.get('amount') || '0');
    const orderAmount = parseInt(searchParams.get('orderAmount') || '0');

    if (!amount || !orderAmount) {
      return NextResponse.json(
        { error: '포인트 금액과 주문 금액이 필요합니다.' },
        { status: 400 }
      );
    }

    // 사용자 조회
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 포인트 사용 가능 여부 확인
    const validation = await validatePointUsage(user._id, amount, orderAmount);

    return NextResponse.json({
      isValid: validation.isValid,
      error: validation.error,
      maxUsable: validation.maxUsable,
      userPoints: user.points
    });

  } catch (error) {
    console.error('포인트 검증 API 오류:', error);
    return NextResponse.json(
      { error: '포인트 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
