import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export async function GET(request: NextRequest) {
  try {
    // 파트너 토큰 검증
    const token = request.cookies.get('partner-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '파트너 토큰이 필요합니다.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    await connectDB();

    // 파트너의 상품이 포함된 주문만 조회
    const orders = await Order.find({
      'items.partnerId': decoded.id
    })
    .populate('items.productId', 'name images')
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 });

    // 주문 데이터 변환
    const transformedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      customer: {
        name: order.userId?.name || 'Unknown',
        email: order.userId?.email || '',
        phone: order.userId?.phone || ''
      },
      items: order.items
        .filter((item: any) => item.partnerId?.toString() === decoded.id)
        .map((item: any) => ({
          productId: item.productId?._id || item.productId,
          productName: item.productId?.name || 'Unknown Product',
          quantity: item.quantity,
          price: item.price,
          image: item.productId?.images?.[0]?.url || '/placeholder-product.jpg'
        })),
      totalAmount: order.items
        .filter((item: any) => item.partnerId?.toString() === decoded.id)
        .reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0),
      status: order.status,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    return NextResponse.json({
      orders: transformedOrders
    });

  } catch (error) {
    console.error('파트너 주문 조회 오류:', error);
    return NextResponse.json(
      { error: '주문 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}


