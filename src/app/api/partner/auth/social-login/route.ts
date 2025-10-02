import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

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
    
    console.log('소셜 로그인 사용자 정보:', {
      email: session.user.email,
      name: session.user.name,
      userFound: !!user,
      partnerStatus: user?.partnerStatus
    });
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 파트너 권한 확인
    if (user.partnerStatus !== 'approved') {
      return NextResponse.json(
        { error: '파트너 승인이 필요한 서비스입니다.' },
        { status: 403 }
      );
    }

    // 파트너 토큰 생성
    const partnerToken = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        type: 'partner',
        name: user.name 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // 쿠키에 토큰 설정
    const response = NextResponse.json({
      message: '파트너 로그인 성공',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        partnerStatus: user.partnerStatus
      }
    });

    response.cookies.set('partner-token', partnerToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
    });

    return response;

  } catch (error) {
    console.error('Partner social login error:', error);
    return NextResponse.json(
      { error: '파트너 로그인에 실패했습니다.' },
      { status: 500 }
    );
  }
}
