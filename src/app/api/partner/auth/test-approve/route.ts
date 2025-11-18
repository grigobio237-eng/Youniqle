import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

/**
 * 테스트용: 현재 로그인한 사용자를 파트너로 승인
 * ⚠️ 프로덕션에서는 제거하거나 관리자만 접근 가능하도록 제한해야 합니다.
 */
export async function POST(request: NextRequest) {
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

    // 파트너 상태를 approved로 변경
    user.partnerStatus = 'approved';
    
    // 파트너 신청 정보가 없으면 기본값 설정
    if (!user.partnerApplication) {
      user.partnerApplication = {
        businessName: user.name || '테스트 파트너',
        businessNumber: '000-00-00000',
        businessAddress: '테스트 주소',
        businessPhone: user.phone || '010-0000-0000',
        businessDescription: '테스트용 자동 승인',
        bankAccount: '000000000000',
        bankName: '테스트 은행',
        accountHolder: user.name || '테스트',
        appliedAt: new Date(),
        approvedAt: new Date(),
      };
    } else {
      user.partnerApplication.approvedAt = new Date();
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: '파트너로 승인되었습니다.',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        partnerStatus: user.partnerStatus,
      }
    });

  } catch (error) {
    console.error('Test approve error:', error);
    return NextResponse.json(
      { error: '승인 처리에 실패했습니다.' },
      { status: 500 }
    );
  }
}

