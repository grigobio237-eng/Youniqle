import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Refund, { RefundStatus } from '@/models/Refund';
import { verifyAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// 환불/교환 상태 변경 (관리자)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', message: '권한이 없습니다.' } },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { status, reason } = body;
    const params = await context.params;

    const refund = await Refund.findById(params.id);
    if (!refund) {
      return NextResponse.json(
        { success: false, error: { code: 'REFUND_NOT_FOUND', message: '환불/교환 내역을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    await refund.updateStatus(
      status as RefundStatus,
      new mongoose.Types.ObjectId(user.id),
      reason
    );

    return NextResponse.json({
      success: true,
      data: { refund },
      message: '상태가 변경되었습니다.',
    });
  } catch (error: any) {
    console.error('Error updating refund status:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '상태 변경 실패' } },
      { status: 500 }
    );
  }
}

