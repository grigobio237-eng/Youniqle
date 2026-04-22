import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Settlement from '@/models/Settlement';
import { verifyAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// 정산 상세 조회 (관리자)
export async function GET(
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

    const settlement = await Settlement.findById(params.id)
      .populate('partnerId', 'name email phone partnerApplication')
      .populate('approvedBy', 'name email')
      .lean();

    if (!settlement) {
      return NextResponse.json(
        { success: false, error: { code: 'SETTLEMENT_NOT_FOUND', message: '정산을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { settlement },
    });
  } catch (error: any) {
    console.error('Error fetching settlement:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '정산 조회 실패' } },
      { status: 500 }
    );
  }
}

// 정산 수정 (관리자)
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
    const { adjustmentAmount, adjustmentReason, adminNotes, additionalFees, taxInfo } = body;

    const settlement = await Settlement.findById(params.id);
    if (!settlement) {
      return NextResponse.json(
        { success: false, error: { code: 'SETTLEMENT_NOT_FOUND', message: '정산을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 완료되거나 취소된 정산은 수정 불가
    if (settlement.status === 'completed' || settlement.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: { code: 'SETTLEMENT_LOCKED', message: '완료되거나 취소된 정산은 수정할 수 없습니다.' } },
        { status: 400 }
      );
    }

    // 수정 가능한 필드 업데이트
    if (adjustmentAmount !== undefined) settlement.adjustmentAmount = adjustmentAmount;
    if (adjustmentReason !== undefined) settlement.adjustmentReason = adjustmentReason;
    if (adminNotes !== undefined) settlement.adminNotes = adminNotes;
    if (additionalFees !== undefined) settlement.additionalFees = additionalFees;
    if (taxInfo !== undefined) settlement.taxInfo = taxInfo;

    await settlement.save();

    return NextResponse.json({
      success: true,
      data: { settlement },
      message: '정산이 수정되었습니다.',
    });
  } catch (error: any) {
    console.error('Error updating settlement:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '정산 수정 실패' } },
      { status: 500 }
    );
  }
}

// 정산 삭제 (관리자)
export async function DELETE(
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

    const settlement = await Settlement.findById(params.id);
    if (!settlement) {
      return NextResponse.json(
        { success: false, error: { code: 'SETTLEMENT_NOT_FOUND', message: '정산을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 완료된 정산은 삭제 불가
    if (settlement.status === 'completed') {
      return NextResponse.json(
        { success: false, error: { code: 'SETTLEMENT_COMPLETED', message: '완료된 정산은 삭제할 수 없습니다.' } },
        { status: 400 }
      );
    }

    await Settlement.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: '정산이 삭제되었습니다.',
    });
  } catch (error: any) {
    console.error('Error deleting settlement:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '정산 삭제 실패' } },
      { status: 500 }
    );
  }
}
