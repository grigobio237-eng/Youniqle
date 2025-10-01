import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import { InventoryManager } from '@/lib/inventoryManagement';
import { AutomationRuleManager } from '@/lib/automationRules';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    await connectDB();

    // 사용자의 주문 내역 조회
    const orders = await Order.find({ userId: session.user.email })
      .populate({
        path: 'items.productId',
        select: 'name images price category'
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('주문 내역 조회 오류:', error);
    return NextResponse.json(
      { error: '주문 내역 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { items, shippingAddress, paymentMethod, totalAmount } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: '주문 상품이 없습니다.' }, { status: 400 });
    }

    if (!shippingAddress || !paymentMethod || !totalAmount) {
      return NextResponse.json({ error: '필수 주문 정보가 누락되었습니다.' }, { status: 400 });
    }

    await connectDB();

    // 사용자 ObjectId 찾기
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 재고 예약 확인 및 처리
    const reservationResults = [];
    for (const item of items) {
      const result = await InventoryManager.reserveStock(item.productId, item.quantity);
      reservationResults.push({ productId: item.productId, result });
      
      if (!result.success) {
        // 예약 실패 시 이전 예약들 모두 취소
        for (const prevItem of items.slice(0, items.indexOf(item))) {
          await InventoryManager.cancelReservation(prevItem.productId, prevItem.quantity);
        }
        return NextResponse.json({ 
          error: `재고 부족: ${result.message}` 
        }, { status: 400 });
      }
    }

    // 주문번호 생성 (YYYYMMDD + 랜덤 6자리)
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderNumber = `${dateStr}${randomStr}`;

    // 주문 생성
    const order = new Order({
      userId: user._id,
      orderNumber,
      items,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress,
      paymentMethod,
    });

    await order.save();

    // 자동화 규칙 실행
    try {
      await AutomationRuleManager.executeOrderRules(order);
    } catch (error) {
      console.error('자동화 규칙 실행 오류:', error);
      // 자동화 규칙 실패는 주문 생성을 막지 않음
    }

    // 생성된 주문을 상품 정보와 함께 조회
    const savedOrder = await Order.findById(order._id)
      .populate({
        path: 'items.productId',
        select: 'name images price category'
      });

    return NextResponse.json({ 
      message: '주문이 성공적으로 생성되었습니다.',
      order: savedOrder 
    }, { status: 201 });

  } catch (error) {
    console.error('주문 생성 오류:', error);
    return NextResponse.json(
      { error: '주문 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
