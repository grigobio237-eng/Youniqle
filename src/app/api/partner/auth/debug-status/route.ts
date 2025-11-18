import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

/**
 * 디버깅용: 현재 로그인한 사용자의 파트너 상태 확인
 * 프로덕션에서는 제거하거나 관리자만 접근 가능하도록 제한해야 합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        provider: user.provider,
        partnerStatus: user.partnerStatus,
        hasPartnerApplication: !!user.partnerApplication,
        partnerApplication: user.partnerApplication ? {
          businessName: user.partnerApplication.businessName,
          appliedAt: user.partnerApplication.appliedAt,
          approvedAt: user.partnerApplication.approvedAt,
          rejectedAt: user.partnerApplication.rejectedAt,
          rejectedReason: user.partnerApplication.rejectedReason,
        } : null,
        partnerSettings: user.partnerSettings,
      },
      message: user.partnerStatus === 'approved' 
        ? '파트너 승인 완료' 
        : `파트너 상태: ${user.partnerStatus} (승인 필요: approved)`
    });

  } catch (error) {
    console.error('Debug status check error:', error);
    return NextResponse.json(
      { error: '상태 확인에 실패했습니다.' },
      { status: 500 }
    );
  }
}

