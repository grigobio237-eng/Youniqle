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

    console.log('사용자 확인됨:', {
      name: user.name,
      email: user.email,
      partnerStatus: user.partnerStatus,
      role: user.role,
      hasPartnerApplication: !!user.partnerApplication,
      _id: user._id.toString()
    });

    // 파트너 권한 확인
    if (user.partnerStatus !== 'approved') {
      const debugInfo = {
        currentStatus: user.partnerStatus,
        expectedStatus: 'approved',
        hasApplication: !!user.partnerApplication,
        applicationStatus: user.partnerApplication ? {
          appliedAt: user.partnerApplication.appliedAt,
          approvedAt: user.partnerApplication.approvedAt,
          rejectedAt: user.partnerApplication.rejectedAt,
          rejectedReason: user.partnerApplication.rejectedReason
        } : null,
        userId: user._id.toString(),
        userEmail: user.email
      };
      
      console.error('❌ 파트너 권한 없음:', JSON.stringify(debugInfo, null, 2));
      console.error('💡 해결 방법: 관리자 페이지(/admin/partners)에서 해당 사용자를 승인하거나, MongoDB에서 직접 partnerStatus를 "approved"로 변경하세요.');
      
      // 상태에 따른 상세 에러 메시지
      let errorParam = 'not-partner';
      if (user.partnerStatus === 'pending') {
        errorParam = 'not-partner&status=pending';
      } else if (user.partnerStatus === 'rejected') {
        errorParam = 'not-partner&status=rejected';
      } else if (user.partnerStatus === 'suspended') {
        errorParam = 'not-partner&status=suspended';
      } else if (user.partnerStatus === 'none' || !user.partnerStatus) {
        errorParam = 'not-partner&status=none';
      }
      
      return NextResponse.redirect(new URL(`/partner/login?error=${errorParam}`, request.url));
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
