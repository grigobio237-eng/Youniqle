import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateVerificationToken, generateVerificationExpiry } from '@/lib/verification';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { 
      name, 
      email, 
      password, 
      marketingConsent, 
      termsAccepted,
      privacyAccepted,
      sensitiveInfoAccepted,
      thirdPartyAccepted,
      referralCode 
    } = await request.json();

    // 입력값 검증 (필수 동의 확인)
    if (!termsAccepted || !privacyAccepted || !sensitiveInfoAccepted || !thirdPartyAccepted) {
      return NextResponse.json(
        { error: '모든 필수 약관에 동의해야 합니다.' },
        { status: 400 }
      );
    }

    // ... (Validation logic remains same)

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // ... (Password validation remains same)

    // 중복 이메일 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      );
    }

    // 추천인 코드 검증 (쿠키 또는 직접 입력)
    let validReferredBy = null;

    // 1. 직접 입력된 추천인 코드 확인
    let codeToCheck = referralCode;

    // 2. 입력된 코드가 없으면 쿠키에서 확인
    if (!codeToCheck) {
      const cookieStore = request.cookies;
      codeToCheck = cookieStore.get('referral_code')?.value;
      if (codeToCheck) {
        console.log(`Referral code from cookie: ${codeToCheck}`);
      }
    }

    // 3. 코드가 있으면 유효성 검증 (대소문자 구분 없이 검색)
    if (codeToCheck) {
      const referrer = await User.findOne({ 
        referralCode: { $regex: new RegExp(`^${codeToCheck}$`, 'i') } 
      });
      if (referrer) {
        validReferredBy = referrer.referralCode;
        console.log(`Referral linked: New user invited by ${referrer.email} (${referrer.referralCode})`);
      } else {
        console.log(`Invalid referral code: ${codeToCheck}`);
      }
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
      termsAcceptedAt: new Date(),
      privacyAcceptedAt: new Date(),
      sensitiveInfoAcceptedAt: new Date(),
      thirdPartyAcceptedAt: new Date(),
      marketingConsent: marketingConsent || false,
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpiry,
      referredBy: validReferredBy, // 추천인 연결
    });

    // 추천 코드 자동 생성 (간단 규칙)
    if (!user.referralCode) {
      const base = user._id.toString().slice(-6).toUpperCase();
      user.referralCode = `RF${base}`;
    }
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