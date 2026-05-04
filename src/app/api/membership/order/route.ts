import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { passId, price, passName } = body;

    if (!passId || !price) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    await connectDB();

    // 1. 고유 주문 번호 생성 (MEMB_ + 타임스탬프)
    const orderNumber = `MEMB_${passId.toUpperCase()}_${Date.now()}`;

    // 2. 주문 데이터 생성
    const newOrder = await Order.create({
      userId: (session.user as any).id,
      orderNumber,
      items: [
        {
          productId: `membership-${passId}`,
          name: `${passName} 멤버십 업그레이드`,
          quantity: 1,
          price: parseInt(price.replace(/,/g, '')),
        },
      ],
      totalAmount: parseInt(price.replace(/,/g, '')),
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'CARD',
      shippingAddress: {
        label: '디지털',
        recipient: session.user.name || '유니클회원',
        phone: (session.user as any).phone || '010-0000-0000',
        zip: '00000',
        addr1: '디지털 멤버십',
        addr2: '온라인 서비스',
      },
    });

    return NextResponse.json({
      success: true,
      orderNumber: newOrder.orderNumber,
    });
  } catch (error) {
    console.error('[MembershipOrder] Error:', error);
    return NextResponse.json({ error: '주문 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
