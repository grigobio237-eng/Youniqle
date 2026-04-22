import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 일괄 주문 상태 변경
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'superadmin')) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { orderIds, status } = await request.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: '주문 ID가 필요합니다.' }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: '상태가 필요합니다.' }, { status: 400 });
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: '유효하지 않은 상태입니다.' }, { status: 400 });
    }

    // 일괄 업데이트
    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { 
        $set: { 
          status,
          ...(status === 'shipped' && { shippedAt: new Date() }),
          ...(status === 'delivered' && { deliveredAt: new Date() }),
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount}개의 주문이 업데이트되었습니다.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error: any) {
    console.error('일괄 주문 상태 변경 오류:', error);
    return NextResponse.json(
      { error: error.message || '일괄 주문 상태 변경에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 일괄 송장 정보 입력
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'superadmin')) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { orderIds, trackingNumber, courierCompany } = await request.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: '주문 ID가 필요합니다.' }, { status: 400 });
    }

    if (!trackingNumber || !courierCompany) {
      return NextResponse.json({ error: '송장 번호와 택배사를 모두 입력해주세요.' }, { status: 400 });
    }

    // 일괄 업데이트
    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { 
        $set: { 
          trackingNumber,
          courierCompany,
          shippedAt: new Date(),
          status: 'shipped',
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount}개의 주문에 송장 정보가 입력되었습니다.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error: any) {
    console.error('일괄 송장 정보 입력 오류:', error);
    return NextResponse.json(
      { error: error.message || '일괄 송장 정보 입력에 실패했습니다.' },
      { status: 500 }
    );
  }
}

