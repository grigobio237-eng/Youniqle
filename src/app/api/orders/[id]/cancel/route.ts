import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import { sendOrderStatusNotification, sendRefundNotification } from '@/lib/orderNotifications';
import { InventoryManager } from '@/lib/inventoryManagement';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { id: orderId } = await params;

    await connectDB();

    // 주문 조회 및 소유자 확인
    const order = await Order.findOne({ 
      _id: orderId,
      userId: session.user.email
    });

    if (!order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 취소 가능한 상태 확인 (pending, confirmed만 취소 가능)
    if (!['pending', 'confirmed'].includes(order.status)) {
      return NextResponse.json({ 
        error: '취소할 수 없는 주문입니다.' 
      }, { status: 400 });
    }

    // 재고 처리
    if (order.paymentStatus === 'paid') {
      // 결제 완료된 주문 취소 시: 재고 반품
      for (const item of order.items) {
        await InventoryManager.returnStock(item.productId, item.quantity);
      }
    } else {
      // 결제 전 주문 취소 시: 예약된 재고 해제
      for (const item of order.items) {
        await InventoryManager.cancelReservation(item.productId, item.quantity);
      }
    }

    // 주문 상태를 cancelled로 변경
    order.status = 'cancelled';
    order.updatedAt = new Date();
    
    await order.save();

    // 고객에게 취소 알림 및 환불 안내 발송
    try {
      const User = (await import('@/models/User')).default;
      const customer = await User.findOne({ email: session.user.email });
      
      if (customer && customer.email) {
        // 주문 취소 알림
        await sendOrderStatusNotification(
          order.orderNumber,
          customer.name || '고객',
          customer.email,
          'cancelled'
        );
        
        // 환불 안내 (결제 완료된 주문인 경우)
        if (order.paymentStatus === 'paid') {
          await sendRefundNotification(
            order.orderNumber,
            customer.name || '고객',
            customer.email,
            order.totalAmount
          );
        }
      }
    } catch (notificationError) {
      console.error('알림 발송 실패:', notificationError);
      // 알림 발송 실패는 주문 취소를 막지 않음
    }

    return NextResponse.json({ 
      message: '주문이 취소되었습니다.',
      order 
    });

  } catch (error) {
    console.error('주문 취소 오류:', error);
    return NextResponse.json(
      { error: '주문 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
