import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { isTokenExpired } from '@/lib/verification';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: '인증 토큰이 필요합니다.' },
        { status: 400 }
      );
    }

    await connectDB();

    // 토큰으로 사용자 찾기
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerified: false,
    });

    if (!user) {
      return NextResponse.json(
        { error: '유효하지 않은 인증 토큰입니다.' },
        { status: 400 }
      );
    }

    // 토큰 만료 확인
    if (user.emailVerificationExpires && isTokenExpired(user.emailVerificationExpires)) {
      return NextResponse.json(
        { error: '인증 토큰이 만료되었습니다. 다시 인증해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 인증 완료
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // 환영 이메일 발송
    await sendWelcomeEmail(user.email, user.name);

    return NextResponse.json(
      { 
        message: '이메일 인증이 완료되었습니다!',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: '이메일이 필요합니다.' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email, emailVerified: false });

    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요한 계정을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 새로운 인증 토큰 생성
    const { generateVerificationToken, generateVerificationExpiry } = await import('@/lib/verification');
    const { sendVerificationEmail } = await import('@/lib/email');

    user.emailVerificationToken = generateVerificationToken();
    user.emailVerificationExpires = generateVerificationExpiry();
    await user.save();

    // 인증 이메일 재발송
    const emailResult = await sendVerificationEmail(
      user.email,
      user.emailVerificationToken,
      user.name
    );

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: '인증 이메일이 재발송되었습니다.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

