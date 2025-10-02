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
    
    console.log('관리자 소셜 로그인 사용자 정보:', {
      email: session.user.email,
      name: session.user.name,
      userFound: !!user,
      userRole: user?.role,
      userEmail: user?.email
    });
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 관리자 권한 확인 (admin@youniqle.com 또는 grigobio237@gmail.com)
    const allowedAdminEmails = ['admin@youniqle.com', 'grigobio237@gmail.com'];
    const isAdmin = user.role === 'admin' || allowedAdminEmails.includes(user.email);

    if (!isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요한 서비스입니다.' },
        { status: 403 }
      );
    }

    // 관리자 토큰 생성
    const adminToken = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        type: 'admin',
        name: user.name 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // 쿠키에 토큰 설정
    const response = NextResponse.json({
      message: '관리자 로그인 성공',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

    response.cookies.set('admin-token', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
    });

    return response;

  } catch (error) {
    console.error('Admin social login error:', error);
    return NextResponse.json(
      { error: '관리자 로그인에 실패했습니다.' },
      { status: 500 }
    );
  }
}
