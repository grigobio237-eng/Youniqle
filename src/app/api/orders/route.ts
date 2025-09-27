import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';

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

    // 주문번호 생성 (YYYYMMDD + 랜덤 6자리)
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderNumber = `${dateStr}${randomStr}`;

    // 주문 생성
    const order = new Order({
      userId: session.user.email,
      orderNumber,
      items,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress,
      paymentMethod,
    });

    await order.save();

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
