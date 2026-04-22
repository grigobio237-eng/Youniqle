import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validateStatusTransition } from '@/lib/orderStatusRules';
import { sendOrderStatusNotification } from '@/lib/orderNotifications';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    
    await connectDB();

    // JWT 토큰으로 사용자 인증
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '인증 토큰이 필요합니다.' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let userId = null;

    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }
    
    // 관리자 권한 확인
    const User = (await import('@/models/User')).default;
    const user = await User.findById(userId);
    
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

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

    // 주문 조회
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 상태 전환 규칙 검증
    const validation = validateStatusTransition(order.status, status, 'admin', order);
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
    console.error('관리자 주문 상태 업데이트 오류:', error);
    return NextResponse.json(
      { error: '주문 상태 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}
