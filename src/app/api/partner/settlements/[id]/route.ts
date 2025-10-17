import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Settlement from '@/models/Settlement';
import { verifyAuth } from '@/lib/auth';

// 파트너 정산 상세 조회
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.role !== 'partner') {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', message: '권한이 없습니다.' } },
        { status: 403 }
      );
    }

    await connectDB();
    const params = await context.params;

    const settlement = await Settlement.findOne({
      _id: params.id,
      partnerId: user.id, // 자신의 정산만 조회 가능
    }).lean();

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

// 파트너 정산에 메모 추가
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.role !== 'partner') {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', message: '권한이 없습니다.' } },
        { status: 403 }
      );
    }

    await connectDB();
    const params = await context.params;

    const body = await request.json();
    const { partnerNotes } = body;

    const settlement = await Settlement.findOne({
      _id: params.id,
      partnerId: user.id,
    });

    if (!settlement) {
      return NextResponse.json(
        { success: false, error: { code: 'SETTLEMENT_NOT_FOUND', message: '정산을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 파트너 메모만 수정 가능
    if (partnerNotes !== undefined) {
      settlement.partnerNotes = partnerNotes;
      await settlement.save();
    }

    return NextResponse.json({
      success: true,
      data: { settlement },
      message: '메모가 저장되었습니다.',
    });
  } catch (error: any) {
    console.error('Error updating settlement notes:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '메모 저장 실패' } },
      { status: 500 }
    );
  }
}
