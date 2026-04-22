import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Settlement, { SettlementStatus } from '@/models/Settlement';
import { verifyAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// 정산 상태 변경 (관리자)
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
    const params = await context.params;

    const body = await request.json();
    const { status, reason } = body;

    // 유효성 검사
    const validStatuses: SettlementStatus[] = ['pending', 'processing', 'completed', 'failed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: '유효하지 않은 상태입니다.' } },
        { status: 400 }
      );
    }

    const settlement = await Settlement.findById(params.id);
    if (!settlement) {
      return NextResponse.json(
        { success: false, error: { code: 'SETTLEMENT_NOT_FOUND', message: '정산을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 상태 변경 검증
    const currentStatus = settlement.status;

    // 완료된 정산은 상태 변경 불가
    if (currentStatus === 'completed') {
      return NextResponse.json(
        { success: false, error: { code: 'SETTLEMENT_COMPLETED', message: '완료된 정산은 상태를 변경할 수 없습니다.' } },
        { status: 400 }
      );
    }

    // 상태 변경 규칙 검증
    const allowedTransitions: Record<SettlementStatus, SettlementStatus[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['completed', 'failed', 'cancelled'],
      completed: [], // 완료 상태에서는 변경 불가
      failed: ['pending', 'processing', 'cancelled'],
      cancelled: ['pending'], // 취소 상태는 pending으로만 복구 가능
    };

    if (!allowedTransitions[currentStatus].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS_TRANSITION',
            message: `'${currentStatus}'에서 '${status}'로 변경할 수 없습니다.`,
          },
        },
        { status: 400 }
      );
    }

    // 상태 변경 (메서드 사용)
    await settlement.updateStatus(
      status,
      new mongoose.Types.ObjectId(user.id),
      reason
    );

    // 알림 전송 (완료 시)
    if (status === 'completed') {
      settlement.notificationSent = true;
      await settlement.save();
    }

    return NextResponse.json({
      success: true,
      data: { settlement },
      message: `정산 상태가 '${status}'로 변경되었습니다.`,
    });
  } catch (error: any) {
    console.error('Error updating settlement status:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '정산 상태 변경 실패' } },
      { status: 500 }
    );
  }
}
