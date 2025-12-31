import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Inquiry from '@/models/Inquiry';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 문의 상세 조회 (관리자)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    await connectDB();

    // Mongoose 모델 등록 보장
    await import('@/models/User');

    const { id: inquiryId } = await params;

    const inquiry = await Inquiry.findOne({ inquiryId })
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .populate('adminId', 'name email');

    if (!inquiry) {
      return NextResponse.json({ error: '문의를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: inquiry,
    });
  } catch (error: any) {
    console.error('문의 상세 조회 오류 (Admin API):', error);
    return NextResponse.json(
      {
        error: error.message || '문의 상세 조회에 실패했습니다.',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// 문의 답변 작성 (관리자)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    await connectDB();

    // Mongoose 모델 등록 보장
    const User = (await import('@/models/User')).default;

    const { id: inquiryId } = await params;
    const { adminAnswer, status, priority, assignedTo } = await request.json();

    const inquiry = await Inquiry.findOne({ inquiryId });

    if (!inquiry) {
      return NextResponse.json({ error: '문의를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (adminAnswer !== undefined) {
      inquiry.adminAnswer = adminAnswer;
      // 세션에서 직접 ID를 가져오거나 DB에서 조회한 이메일 매칭 사용자 사용
      // 여기서는 세션에 이미 id가 포함되어 있다고 가정 (auth.ts에서 설정함)
      inquiry.adminId = (session.user as any).id;
      inquiry.answeredAt = new Date();
      if (inquiry.status === 'pending' || inquiry.status === 'in_progress') {
        inquiry.status = 'resolved';
      }
    }

    if (status) {
      inquiry.status = status;
    }

    if (priority) {
      inquiry.priority = priority;
    }

    if (assignedTo) {
      inquiry.assignedTo = assignedTo;
    }

    await inquiry.save();

    return NextResponse.json({
      success: true,
      message: '문의가 업데이트되었습니다.',
      data: inquiry,
    });
  } catch (error: any) {
    console.error('문의 업데이트 오류 (Admin API):', error);
    return NextResponse.json(
      {
        error: error.message || '문의 업데이트에 실패했습니다.',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
