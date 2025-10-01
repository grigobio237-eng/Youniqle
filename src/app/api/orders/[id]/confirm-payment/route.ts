import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import { InventoryManager } from '@/lib/inventoryManagement';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    await connectDB();

    // 주문 조회
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 주문 소유자 확인
    if (order.userId !== session.user.email) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 이미 결제 완료된 주문인지 확인
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({ error: '이미 결제 완료된 주문입니다.' }, { status: 400 });
    }

    // 재고 확정 (예약된 재고를 실제 재고에서 차감)
    for (const item of order.items) {
      const result = await InventoryManager.confirmStock(item.productId, item.quantity);
      if (!result.success) {
        return NextResponse.json({ 
          error: `재고 확정 실패: ${result.message}` 
        }, { status: 400 });
      }
    }

    // 주문 상태 업데이트
    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    order.updatedAt = new Date();
    await order.save();

    return NextResponse.json({
      message: '결제가 완료되었습니다.',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus
      }
    });

  } catch (error) {
    console.error('결제 완료 처리 오류:', error);
    return NextResponse.json(
      { error: '결제 완료 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


