import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// 송장 정보 업데이트 (파트너)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // 파트너 토큰 검증
    const token = request.cookies.get('partner-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '파트너 토큰이 필요합니다.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const { id: orderId } = await params;
    const { trackingNumber, courierCompany } = await request.json();

    if (!trackingNumber || !courierCompany) {
      return NextResponse.json({ error: '송장 번호와 택배사를 모두 입력해주세요.' }, { status: 400 });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 파트너의 주문인지 확인 (파트너의 상품이 포함된 주문만 수정 가능)
    const hasPartnerProduct = order.items.some((item: any) => 
      item.partnerId?.toString() === decoded.id
    );

    if (!hasPartnerProduct) {
      return NextResponse.json({ error: '이 주문을 수정할 권한이 없습니다.' }, { status: 403 });
    }

    // Order 레벨에 배송 정보 추가
    (order as any).trackingNumber = trackingNumber;
    (order as any).courierCompany = courierCompany;
    
    // shipped 상태로 변경
    if (order.status !== 'shipped' && order.status !== 'delivered') {
      order.status = 'shipped';
      (order as any).shippedAt = new Date();
    }

    // partnerOrders에도 배송 정보 추가 (해당 파트너의 주문만)
    if (order.partnerOrders && order.partnerOrders.length > 0) {
      order.partnerOrders.forEach((partnerOrder: any) => {
        if (partnerOrder.partnerId?.toString() === decoded.id) {
          partnerOrder.trackingNumber = trackingNumber;
          partnerOrder.courierCompany = courierCompany;
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

