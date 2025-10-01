import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import jwt from 'jsonwebtoken';
import { validateStatusTransition } from '@/lib/orderStatusRules';
import { sendOrderStatusNotification } from '@/lib/orderNotifications';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    
    // 파트너 토큰 검증
    const token = request.cookies.get('partner-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '파트너 토큰이 필요합니다.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const { status } = await request.json();

    // 유효한 상태인지 확인
    const validStatuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 주문 상태입니다.' },
        { status: 400 }
      );
    }

    await connectDB();

    // 주문 조회 및 권한 확인 (파트너의 상품이 포함된 주문인지 확인)
    const order = await Order.findOne({
      _id: orderId,
      'items.partnerId': decoded.id
    });

    if (!order) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없거나 수정 권한이 없습니다.' },
        { status: 404 }
      );
    }

    // 상태 전환 규칙 검증 (파트너 권한)
    const validation = validateStatusTransition(order.status, status, 'partner', order);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message || '상태 변경이 허용되지 않습니다.' },
        { status: 400 }
      );
    }

    // 주문 상태 업데이트
    order.status = status;
    order.updatedAt = new Date();

    await order.save();

    // 고객에게 알림 발송 (비동기)
    try {
      const User = (await import('@/models/User')).default;
      const customer = await User.findById(order.userId);
      
      if (customer && customer.email) {
        await sendOrderStatusNotification(
          order.orderNumber,
          customer.name || '고객',
          customer.email,
          status as any
        );
      }
    } catch (notificationError) {
      console.error('알림 발송 실패:', notificationError);
      // 알림 발송 실패는 주문 상태 업데이트를 막지 않음
    }

    return NextResponse.json({
      message: '주문 상태가 성공적으로 업데이트되었습니다.',
      order: {
        id: order._id,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });

  } catch (error) {
    console.error('파트너 주문 상태 업데이트 오류:', error);
    return NextResponse.json(
      { error: '주문 상태 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}
