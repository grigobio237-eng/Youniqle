import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Notice from '@/models/Notice';

// 팝업 공지사항 조회
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const now = new Date();
    const { searchParams } = new URL(request.url);
    
    // 사용자 타입 확인 (쿠키 또는 헤더에서)
    const userType = searchParams.get('userType') || 'all';
    const isNewUser = searchParams.get('isNewUser') === 'true';
    const userRole = searchParams.get('role') || 'member';

    // 노출 대상 필터 생성
    let targetFilter: any = {};
    
    if (userType === 'new' || isNewUser) {
      // 신규 회원인 경우
      targetFilter = { $in: ['all', 'new'] };
    } else if (userRole === 'partner') {
      // 파트너인 경우
      targetFilter = { $in: ['all', 'partner'] };
    } else if (userRole === 'admin') {
      // 관리자인 경우
      targetFilter = { $in: ['all', 'admin'] };
    } else {
      // 기존 회원인 경우
      targetFilter = { $in: ['all', 'existing'] };
    }

    // 팝업으로 설정된 게시된 공지사항 조회
    const popupNotices = await Notice.find({
      status: 'published',
      isPopup: true,
      targetAudience: targetFilter,
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



