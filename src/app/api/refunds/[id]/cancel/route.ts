import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Refund from '@/models/Refund';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { id: refundId } = await params;

    if (!refundId) {
      return NextResponse.json({ error: '환불 ID가 필요합니다.' }, { status: 400 });
    }

    const refund = await Refund.findById(refundId).populate('orderId');

    if (!refund) {
      return NextResponse.json({ error: '환불 신청을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 사용자 조회
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 주문자 확인
    const orderUserId = typeof refund.orderId === 'object' && refund.orderId !== null
      ? (refund.orderId as any).userId?.toString()
      : null;

    if (orderUserId !== user._id.toString()) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // pending 상태만 취소 가능
    if (refund.status !== 'pending') {
      return NextResponse.json(
        { error: '검토 중인 환불 신청만 취소할 수 있습니다.' },
        { status: 400 }
      );
    }

    // 환불 상태를 취소로 변경
    refund.status = 'cancelled';
    refund.cancelledAt = new Date();
    await refund.save();

    return NextResponse.json({
      success: true,
      message: '환불 신청이 취소되었습니다.',
      data: refund,
    });
  } catch (error: any) {
    console.error('환불 취소 오류:', error);
    return NextResponse.json(
      { error: error.message || '환불 취소에 실패했습니다.' },
      { status: 500 }
    );
  }
}

