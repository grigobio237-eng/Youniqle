import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Refund from '@/models/Refund';

const ALLOWED_STATUS_UPDATES = new Set([
  'pickup_requested',
  'pickup_completed',
  'inspecting',
  'completed',
]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await verifyAuth(request);
    if (!partner || partner.role !== 'partner') {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', message: '권한이 없습니다.' } },
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await params;

    const refund = await Refund.findById(id).lean();
    if (!refund || refund.partnerId?.toString() !== partner.id) {
      return NextResponse.json(
        { success: false, error: { code: 'REFUND_NOT_FOUND', message: '환불 신청을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: refund,
    });
  } catch (error: any) {
    console.error('Error fetching partner refund detail:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '조회 실패' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await verifyAuth(request);
    if (!partner || partner.role !== 'partner') {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', message: '권한이 없습니다.' } },
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await params;
    const payload = await request.json();

    const refund = await Refund.findById(id);
    if (!refund || refund.partnerId?.toString() !== partner.id) {
      return NextResponse.json(
        { success: false, error: { code: 'REFUND_NOT_FOUND', message: '환불 신청을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    if (payload.partnerNotes !== undefined) {
      refund.partnerNotes = payload.partnerNotes;
    }

    if (payload.courierCompany !== undefined) {
      refund.courierCompany = payload.courierCompany;
    }

    if (payload.trackingNumber !== undefined) {
      refund.trackingNumber = payload.trackingNumber;
    }

    if (payload.pickupDate) {
      refund.pickupDate = new Date(payload.pickupDate);
    }

    if (payload.status && ALLOWED_STATUS_UPDATES.has(payload.status)) {
      await refund.updateStatus(payload.status, partner.id as any);
    } else {
      await refund.save();
    }

    return NextResponse.json({
      success: true,
      message: '환불 요청이 업데이트되었습니다.',
      data: refund,
    });
  } catch (error: any) {
    console.error('Error updating partner refund:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error?.message || '업데이트 실패' } },
      { status: 500 }
    );
  }
}





