import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // 승인 대기 중인 파트너 수 조회
    const pendingPartnersCount = await User.countDocuments({
      partnerStatus: 'pending'
    });

    // 기타 알림 카운트 (필요시 확장)
    // 예: 새로운 리뷰, 문의사항 등

    return NextResponse.json({
      pendingPartners: pendingPartnersCount,
      total: pendingPartnersCount
    });

  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json(
      { error: '알림 정보를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}















