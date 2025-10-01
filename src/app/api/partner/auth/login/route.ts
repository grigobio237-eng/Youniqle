import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log('🔐 파트너 로그인 시도:', { email, passwordLength: password?.length });

    if (!email || !password) {
      console.log('❌ 이메일 또는 비밀번호 누락');
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    await connectDB();

    // 파트너 권한 및 승인 상태 확인 (role이 'partner'이거나 'user'이고 partnerStatus가 'approved'인 경우)
    const partner = await User.findOne({ 
      email: email.toLowerCase(),
      $or: [
        { role: 'partner', partnerStatus: 'approved' },
        { role: 'user', partnerStatus: 'approved' }
      ]
    });

    console.log('👤 파트너 계정 조회 결과:', {
      found: !!partner,
      email: partner?.email,
      role: partner?.role,
      partnerStatus: partner?.partnerStatus,
      hasPasswordHash: !!partner?.passwordHash,
      emailVerified: partner?.emailVerified
    });

    if (!partner) {
      console.log('❌ 승인된 파트너 계정을 찾을 수 없음');
      return NextResponse.json(
        { error: '승인된 파트너가 아닙니다.' },
        { status: 401 }
      );
    }

    if (!partner.passwordHash) {
      console.log('❌ 비밀번호 해시가 없음');
      return NextResponse.json(
        { error: '비밀번호가 설정되지 않았습니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 확인
    console.log('🔑 비밀번호 검증 중...');
    const isPasswordValid = await bcrypt.compare(password, partner.passwordHash);
    console.log('🔑 비밀번호 검증 결과:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ 비밀번호 불일치');
      return NextResponse.json(
        { error: '비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 이메일 인증 확인
    console.log('📧 이메일 인증 상태:', partner.emailVerified);
    if (!partner.emailVerified) {
      console.log('❌ 이메일 인증 필요');
      return NextResponse.json(
        { error: '이메일 인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        id: partner._id,
        email: partner.email,
        role: partner.role,
        type: 'partner'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // 응답 설정
    const response = NextResponse.json({
      message: '로그인 성공',
      partner: {
        id: partner._id,
        email: partner.email,
        name: partner.name,
        role: partner.role,
        partnerStatus: partner.partnerStatus,
        businessName: partner.partnerApplication?.businessName,
        commissionRate: partner.partnerSettings?.commissionRate || 10
      }
    });

    // 파트너 토큰을 쿠키에 설정
    response.cookies.set('partner-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24시간
      path: '/' // 모든 경로에서 쿠키 사용 가능
    });

    console.log('✅ 파트너 로그인 성공:', partner.email);
    return response;

  } catch (error) {
    console.error('Partner login error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

