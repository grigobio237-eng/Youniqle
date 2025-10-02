import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

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

    // 파트너 권한 확인
    const isPartner = user.partnerStatus === 'approved';
    
    if (!isPartner) {
      return NextResponse.json({
        isPartner: false,
        partnerStatus: user.partnerStatus,
        message: '파트너 승인이 필요한 서비스입니다.'
      });
    }

    return NextResponse.json({
      isPartner: true,
      partnerStatus: user.partnerStatus,
      message: '파트너 권한이 확인되었습니다.'
    });

  } catch (error) {
    console.error('Partner status check error:', error);
    return NextResponse.json(
      { error: '파트너 권한 확인에 실패했습니다.' },
      { status: 500 }
    );
  }
}
