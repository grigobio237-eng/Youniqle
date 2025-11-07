import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/db';
import StockAlert from '@/models/StockAlert';
import Product from '@/models/Product';
import { NotificationService } from '@/lib/notificationService';

// 재입고 알림 등록
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    await connectDB();
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: '상품 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 상품 존재 확인
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사용자 ID 조회 (이메일로)
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 등록된 알림 확인
    const existingAlert = await StockAlert.findOne({
      userId: user._id,
      productId: productId,
    });

    if (existingAlert) {
      if (existingAlert.notified) {
        // 이미 알림이 발송된 경우 재등록 가능
        existingAlert.notified = false;
        existingAlert.notifiedAt = undefined;
        await existingAlert.save();
        return NextResponse.json({
          success: true,
          message: '재입고 알림이 재등록되었습니다.',
        });
      } else {
        return NextResponse.json(
          { error: '이미 재입고 알림이 등록되어 있습니다.' },
          { status: 400 }
        );
      }
    }

    // 재입고 알림 생성
    const stockAlert = new StockAlert({
      userId: user._id,
      productId: productId,
      notified: false,
    });

    await stockAlert.save();

    return NextResponse.json({
      success: true,
      message: '재입고 알림이 등록되었습니다.',
    });
  } catch (error: any) {
    console.error('재입고 알림 등록 오류:', error);
    
    // 중복 키 에러 처리
    if (error.code === 11000) {
      return NextResponse.json(
        { error: '이미 재입고 알림이 등록되어 있습니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '재입고 알림 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 내 재입고 알림 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    await connectDB();

    // 사용자 ID 조회
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 쿼리 파라미터 확인
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    let query: any = {
      userId: user._id,
      notified: false,
    };

    // 특정 상품의 알림만 조회하는 경우
    if (productId) {
      query.productId = productId;
    }

    // 재입고 알림 목록 조회
    const alerts = await StockAlert.find(query)
      .populate('productId', 'name price images stock status')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      alerts: alerts.map((alert: any) => ({
        _id: alert._id,
        product: alert.productId,
        notified: alert.notified,
        createdAt: alert.createdAt,
      })),
    });
  } catch (error) {
    console.error('재입고 알림 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '재입고 알림 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

