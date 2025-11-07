import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import StockAlert from '@/models/StockAlert';
import Product from '@/models/Product';
import { NotificationService } from '@/lib/notificationService';

// 재입고 알림 발송 (관리자가 호출하거나 크론잡으로 실행)
export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인 (선택적)
    // 실제 환경에서는 관리자 인증이 필요할 수 있습니다.
    
    await connectDB();
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: '상품 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 상품 정보 확인
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 재입고된 경우만 알림 발송 (stock > 0)
    if (product.stock <= 0) {
      return NextResponse.json({
        success: true,
        message: '재고가 없어 알림을 발송하지 않습니다.',
        notifiedCount: 0,
      });
    }

    // 해당 상품의 알림 등록자 조회 (아직 알림 발송 안 된 것만)
    const alerts = await StockAlert.find({
      productId: productId,
      notified: false,
    }).populate('userId', 'email name');

    let notifiedCount = 0;

    // 각 사용자에게 알림 발송
    for (const alert of alerts) {
      try {
        const user: any = alert.userId;
        
        // 이메일 알림 발송
        await NotificationService.sendNotification({
          userId: user._id.toString(),
          type: 'system', // 재입고 알림은 system 타입 사용
          category: 'success',
          title: '재입고 알림',
          message: `관심 상품 "${product.name}"이(가) 재입고되었습니다!`,
          data: {
            productId: product._id.toString(),
            productName: product.name,
            productUrl: `/products/${product._id}`,
          },
          priority: 5,
          source: 'stock_alert',
        });

        // 알림 상태 업데이트
        alert.notified = true;
        alert.notifiedAt = new Date();
        await alert.save();

        notifiedCount++;
      } catch (error) {
        console.error(`사용자 ${(alert.userId as any)?._id} 알림 발송 실패:`, error);
        // 개별 알림 실패는 무시하고 계속 진행
      }
    }

    return NextResponse.json({
      success: true,
      message: `${notifiedCount}명에게 재입고 알림이 발송되었습니다.`,
      notifiedCount,
    });
  } catch (error) {
    console.error('재입고 알림 발송 오류:', error);
    return NextResponse.json(
      { error: '재입고 알림 발송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

