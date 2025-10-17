import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Newsletter from '@/models/Newsletter';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, token } = await request.json();

    // 입력 검증
    if (!email) {
      return NextResponse.json(
        { error: '이메일 주소를 입력해주세요.' },
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

    // 구독자 찾기
    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    
    if (!subscriber) {
      return NextResponse.json(
        { error: '구독되지 않은 이메일입니다.' },
        { status: 404 }
      );
    }

    if (subscriber.status === 'unsubscribed') {
      return NextResponse.json(
        { error: '이미 구독 해지된 이메일입니다.' },
        { status: 409 }
      );
    }

    // 구독 해지 처리
    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = new Date();
    subscriber.verificationToken = undefined;
    subscriber.verificationExpires = undefined;
    
    await subscriber.save();

    return NextResponse.json({
      success: true,
      message: '구독이 해지되었습니다. 언제든지 다시 구독하실 수 있습니다.'
    });

  } catch (error) {
    console.error('Newsletter unsubscription error:', error);
    return NextResponse.json(
      { error: '구독 해지 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 토큰을 통한 구독 해지 (이메일 링크)
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
        { error: '만료된 링크입니다.' },
        { status: 400 }
      );
    }

    // 구독 해지 처리
    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = new Date();
    subscriber.verificationToken = undefined;
    subscriber.verificationExpires = undefined;
    
    await subscriber.save();

    return NextResponse.json({
      success: true,
      message: '구독이 해지되었습니다.'
    });

  } catch (error) {
    console.error('Newsletter token unsubscription error:', error);
    return NextResponse.json(
      { error: '구독 해지 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}











