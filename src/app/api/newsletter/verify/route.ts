import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Newsletter from '@/models/Newsletter';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json(
        { error: '잘못된 링크입니다.' },
        { status: 400 }
      );
    }

    // 구독자 찾기
    const subscriber = await Newsletter.findOne({ 
      email: email.toLowerCase(),
      verificationToken: token
    });
    
    if (!subscriber) {
      return NextResponse.json(
        { error: '유효하지 않은 링크입니다.' },
        { status: 404 }
      );
    }

    // 토큰 만료 확인
    if (subscriber.verificationExpires && subscriber.verificationExpires < new Date()) {
      return NextResponse.json(
        { error: '만료된 링크입니다. 다시 구독해주세요.' },
        { status: 400 }
      );
    }

    // 이미 인증된 경우
    if (subscriber.isVerified) {
      return NextResponse.json({
        success: true,
        message: '이미 인증된 이메일입니다.',
        alreadyVerified: true
      });
    }

    // 이메일 인증 완료
    subscriber.isVerified = true;
    subscriber.verificationToken = undefined;
    subscriber.verificationExpires = undefined;
    
    await subscriber.save();

    return NextResponse.json({
      success: true,
      message: '이메일 인증이 완료되었습니다. 뉴스레터를 받아보실 수 있습니다!'
    });

  } catch (error) {
    console.error('Newsletter verification error:', error);
    return NextResponse.json(
      { error: '이메일 인증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}















