import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 송장 정보 업데이트 (관리자)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { id: orderId } = await params;
    const { trackingNumber, courierCompany } = await request.json();

    if (!trackingNumber || !courierCompany) {
      return NextResponse.json({ error: '송장 번호와 택배사를 모두 입력해주세요.' }, { status: 400 });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
    }

    // Order 레벨에 배송 정보 추가 (메인 주문)
    (order as any).trackingNumber = trackingNumber;
    (order as any).courierCompany = courierCompany;
    
    // shipped 상태로 변경할 때 shippedAt 설정
    if (order.status !== 'shipped' && order.status !== 'delivered') {
      order.status = 'shipped';
      (order as any).shippedAt = new Date();
    }

    // partnerOrders에도 배송 정보 추가 (각 파트너별)
    if (order.partnerOrders && order.partnerOrders.length > 0) {
      order.partnerOrders.forEach((partnerOrder: any) => {
        if (!partnerOrder.trackingNumber) {
          partnerOrder.trackingNumber = trackingNumber;
          partnerOrder.shippedAt = new Date();
          if (partnerOrder.status !== 'shipped' && partnerOrder.status !== 'delivered') {
            partnerOrder.status = 'shipped';
          }
        }
      });
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: '송장 정보가 저장되었습니다.',
      data: order,
    });
  } catch (error: any) {
    console.error('송장 정보 저장 오류:', error);
    return NextResponse.json(
      { error: error.message || '송장 정보 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}

