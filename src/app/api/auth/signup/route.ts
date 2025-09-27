import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateVerificationToken, generateVerificationExpiry } from '@/lib/verification';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { name, email, password, marketingConsent } = await request.json();

    // 입력 검증
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 중복 이메일 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 해시화
    const passwordHash = await bcrypt.hash(password, 12);

    // 인증 토큰 생성
    const verificationToken = generateVerificationToken();
    const verificationExpiry = generateVerificationExpiry();

    // 사용자 생성
    const user = new User({
      name,
      email,
      passwordHash,
      provider: 'local',
      marketingConsent: marketingConsent || false,
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpiry,
    });

    await user.save();

    // 인증 이메일 발송
    const emailResult = await sendVerificationEmail(email, verificationToken, name);

    if (!emailResult.success) {
      // 이메일 발송 실패 시 사용자 삭제
      await User.findByIdAndDelete(user._id);
      return NextResponse.json(
        { error: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: '회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        emailSent: true
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}