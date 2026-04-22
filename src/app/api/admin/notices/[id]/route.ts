import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Notice from '@/models/Notice';
import { verifyAuth } from '@/lib/auth';

// 공지사항 상세 조회 (관리자)
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

    const notice = await Notice.findById(params.id)
      .populate('authorId', 'name email')
      .lean();

    if (!notice) {
      return NextResponse.json(
        { success: false, error: { code: 'NOTICE_NOT_FOUND', message: '공지사항을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { notice },
    });
  } catch (error: any) {
    console.error('Error fetching notice:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '공지사항 조회 실패' } },
      { status: 500 }
    );
  }
}

// 공지사항 수정 (관리자)
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

    const notice = await Notice.findById(params.id);
    if (!notice) {
      return NextResponse.json(
        { success: false, error: { code: 'NOTICE_NOT_FOUND', message: '공지사항을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 수정 가능한 필드 업데이트
    const updateFields = [
      'title', 'content', 'summary', 'type', 'category', 'tags',
      'isPinned', 'isImportant', 'isPopup', 'targetAudience', 'popupSettings',
      'attachments', 'thumbnailImage', 'images', 'startDate', 'endDate', 'status'
    ];

    updateFields.forEach(field => {
      if (body[field] !== undefined) {
        (notice as any)[field] = body[field];
      }
    });

    // 상태 변경 시 날짜 업데이트
    if (body.status === 'published' && !notice.publishedAt) {
      notice.publishedAt = new Date();
    } else if (body.status === 'archived' && !notice.archivedAt) {
      notice.archivedAt = new Date();
    }

    await notice.save();

    return NextResponse.json({
      success: true,
      data: { notice },
      message: '공지사항이 수정되었습니다.',
    });
  } catch (error: any) {
    console.error('Error updating notice:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '공지사항 수정 실패' } },
      { status: 500 }
    );
  }
}

// 공지사항 삭제 (관리자)
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

    const notice = await Notice.findByIdAndDelete(params.id);
    if (!notice) {
      return NextResponse.json(
        { success: false, error: { code: 'NOTICE_NOT_FOUND', message: '공지사항을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '공지사항이 삭제되었습니다.',
    });
  } catch (error: any) {
    console.error('Error deleting notice:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '공지사항 삭제 실패' } },
      { status: 500 }
    );
  }
}



