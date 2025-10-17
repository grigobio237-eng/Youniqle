import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Notice from '@/models/Notice';

// 공지사항 상세 조회 (사용자)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const params = await context.params;

    const notice = await Notice.findOne({
      _id: params.id,
      status: 'published', // 게시된 공지만
    })
      .populate('authorId', 'name')
      .lean();

    if (!notice) {
      return NextResponse.json(
        { success: false, error: { code: 'NOTICE_NOT_FOUND', message: '공지사항을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 조회수 증가
    await Notice.findByIdAndUpdate(params.id, { $inc: { viewCount: 1 } });

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



