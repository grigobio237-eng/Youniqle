import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Refund from '@/models/Refund';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 환불 상세 조회 (관리자)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'superadmin')) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { id } = await params;

    const refund = await Refund.findById(id)
      .populate('userId', 'name email phone')
      .populate('orderId', 'orderNumber items totalAmount')
      .populate('partnerId', 'name email')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .lean();

    if (!refund) {
      return NextResponse.json({ error: '환불을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: refund,
    });
  } catch (error: any) {
    console.error('환불 상세 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '환불 상세 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 환불 정보 업데이트 (관리자 메모, 답변 등)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'superadmin')) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { id } = await params;
    const { adminNotes, status, rejectionReason } = await request.json();

    const refund = await Refund.findById(id);

    if (!refund) {
      return NextResponse.json({ error: '환불을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (adminNotes !== undefined) {
      refund.adminNotes = adminNotes;
    }

    if (status) {
      await refund.updateStatus(status as any, (session.user as any).id, rejectionReason);
    } else {
      await refund.save();
    }

    return NextResponse.json({
      success: true,
      message: '환불 정보가 업데이트되었습니다.',
      data: refund,
    });
  } catch (error: any) {
    console.error('환불 업데이트 오류:', error);
    return NextResponse.json(
      { error: error.message || '환불 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}

