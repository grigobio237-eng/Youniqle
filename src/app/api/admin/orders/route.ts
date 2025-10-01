import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    await connectDB();
    
    // 관리자 권한 확인
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    // 모든 주문 조회
    const orders = await Order.find({})
      .populate('items.productId', 'name images partnerName')
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
      items: order.items.map((item: any) => ({
        productId: item.productId?._id || item.productId,
        productName: item.productId?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price,
        image: item.productId?.images?.[0]?.url || '/placeholder-product.jpg',
        partnerName: item.productId?.partnerName || '관리자'
      })),
      totalAmount: order.totalAmount,
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
    console.error('관리자 주문 조회 오류:', error);
    return NextResponse.json(
      { error: '주문 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}
