import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    console.log('파트너 콜백 API 호출됨');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('세션 없음, 파트너 로그인 페이지로 리다이렉트');
      return NextResponse.redirect(new URL('/partner/login?error=no-session', request.url));
    }

    console.log('세션 확인됨:', session.user.email);

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      console.log('사용자 없음, 파트너 로그인 페이지로 리다이렉트');
      return NextResponse.redirect(new URL('/partner/login?error=user-not-found', request.url));
    }

    console.log('사용자 확인됨:', user.name, user.partnerStatus);

    // 파트너 권한 확인
    if (user.partnerStatus !== 'approved') {
      console.log('파트너 권한 없음, 파트너 로그인 페이지로 리다이렉트');
      return NextResponse.redirect(new URL('/partner/login?error=not-partner', request.url));
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

    console.log('파트너 토큰 생성됨, 대시보드로 리다이렉트');

    // 쿠키에 토큰 설정하고 파트너 대시보드로 리다이렉트
    const response = NextResponse.redirect(new URL('/partner/dashboard', request.url));
    
    response.cookies.set('partner-token', partnerToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
    });

    return response;

  } catch (error) {
    console.error('Partner callback error:', error);
    return NextResponse.redirect(new URL('/partner/login?error=callback-failed', request.url));
  }
}
