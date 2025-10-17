import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Promotion from '@/models/Promotion';
import jwt from 'jsonwebtoken';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 관리자 인증 확인
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '관리자 인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.type !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;
    const { status } = await request.json();

    if (!['draft', 'active', 'paused', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태입니다.' },
        { status: 400 }
      );
    }

    const promotion = await Promotion.findById(id);
    if (!promotion) {
      return NextResponse.json(
        { error: '프로모션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 상태 변경 규칙 검증
    const currentStatus = promotion.status;
    const now = new Date();

    // 활성화 규칙
    if (status === 'active') {
      if (currentStatus === 'completed' || currentStatus === 'cancelled') {
        return NextResponse.json(
          { error: '완료되거나 취소된 프로모션은 활성화할 수 없습니다.' },
          { status: 400 }
        );
      }

      if (promotion.endDate < now) {
        return NextResponse.json(
          { error: '종료일이 지난 프로모션은 활성화할 수 없습니다.' },
          { status: 400 }
        );
      }
    }

    // 완료 규칙
    if (status === 'completed') {
      if (currentStatus === 'cancelled') {
        return NextResponse.json(
          { error: '취소된 프로모션은 완료할 수 없습니다.' },
          { status: 400 }
        );
      }
    }

    // 취소 규칙
    if (status === 'cancelled') {
      if (currentStatus === 'completed') {
        return NextResponse.json(
          { error: '완료된 프로모션은 취소할 수 없습니다.' },
          { status: 400 }
        );
      }
    }

    // 상태 업데이트
    promotion.status = status;
    await promotion.save();

    let message = '';
    switch (status) {
      case 'active':
        message = '프로모션이 활성화되었습니다.';
        break;
      case 'paused':
        message = '프로모션이 일시정지되었습니다.';
        break;
      case 'completed':
        message = '프로모션이 완료되었습니다.';
        break;
      case 'cancelled':
        message = '프로모션이 취소되었습니다.';
        break;
      case 'draft':
        message = '프로모션이 초안으로 변경되었습니다.';
        break;
    }

    return NextResponse.json({
      success: true,
      message,
      promotion
    });

  } catch (error) {
    console.error('Admin promotion status update error:', error);
    return NextResponse.json(
      { error: '프로모션 상태 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
