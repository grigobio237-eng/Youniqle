import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('partner-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: '인증 토큰이 없습니다.' },
        { status: 401 }
      );
    }

    // JWT 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.type !== 'partner') {
      return NextResponse.json(
        { error: '파트너 토큰이 아닙니다.' },
        { status: 401 }
      );
    }

    await connectDB();

    // 파트너 정보 확인 (role은 user여도 partnerStatus가 approved면 파트너)
    const partner = await User.findById(decoded.id)
      .select('-passwordHash');
    
    console.log('파트너 인증 확인:', {
      tokenId: decoded.id,
      partnerFound: !!partner,
      partnerName: partner?.name,
      partnerEmail: partner?.email,
      partnerStatus: partner?.partnerStatus
    });
    
    if (!partner || partner.partnerStatus !== 'approved') {
      return NextResponse.json(
        { error: '승인된 파트너가 아닙니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      partner: {
        id: partner._id,
        email: partner.email,
        name: partner.name,
        role: partner.role,
        partnerStatus: partner.partnerStatus,
        businessName: partner.partnerApplication?.businessName,
        commissionRate: partner.partnerSettings?.commissionRate || 10,
        partnerStats: partner.partnerStats,
        avatar: partner.avatar
      }
    });

  } catch (error) {
    console.error('Partner verify error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

