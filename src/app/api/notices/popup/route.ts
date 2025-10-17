import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Notice from '@/models/Notice';

// 팝업 공지사항 조회
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const now = new Date();

    // 팝업으로 설정된 게시된 공지사항 조회
    const popupNotices = await Notice.find({
      status: 'published',
      isPopup: true,
      $or: [
        { startDate: { $exists: false }, endDate: { $exists: false } },
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: { $exists: false } },
        { startDate: { $exists: false }, endDate: { $gte: now } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(3) // 최대 3개만
      .lean();

    return NextResponse.json({
      success: true,
      data: { notices: popupNotices },
    });
  } catch (error: any) {
    console.error('Error fetching popup notices:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '팝업 공지 조회 실패' } },
      { status: 500 }
    );
  }
}



