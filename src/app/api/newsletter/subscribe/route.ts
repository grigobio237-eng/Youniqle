import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Newsletter from '@/models/Newsletter';
import { generateVerificationToken, generateVerificationExpiry } from '@/lib/verification';
import { sendNewsletterVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, name, preferences, source = 'website' } = await request.json();

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

    // 기존 구독자 확인
    const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    
    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return NextResponse.json(
          { error: '이미 구독된 이메일입니다.' },
          { status: 409 }
        );
      } else if (existingSubscriber.status === 'unsubscribed') {
        // 재구독 처리
        existingSubscriber.status = 'active';
        existingSubscriber.subscribedAt = new Date();
        existingSubscriber.unsubscribedAt = undefined;
        existingSubscriber.isVerified = false;
        existingSubscriber.verificationToken = generateVerificationToken();
        existingSubscriber.verificationExpires = generateVerificationExpiry();
        
        if (preferences) {
          existingSubscriber.preferences = { ...existingSubscriber.preferences, ...preferences };
        }
        
        await existingSubscriber.save();
        
        // 인증 이메일 발송
        await sendNewsletterVerificationEmail(email, existingSubscriber.verificationToken, name || '고객');
        
        return NextResponse.json({
          success: true,
          message: '재구독이 완료되었습니다. 이메일 인증을 완료해주세요.',
          isResubscription: true
        });
      }
    }

    // 새 구독자 생성
    const verificationToken = generateVerificationToken();
    const verificationExpiry = generateVerificationExpiry();

    const subscriber = new Newsletter({
      email: email.toLowerCase(),
      name: name || undefined,
      source,
      preferences: {
        productUpdates: preferences?.productUpdates ?? true,
        promotions: preferences?.promotions ?? true,
        events: preferences?.events ?? true,
        partnerNews: preferences?.partnerNews ?? false
      },
      verificationToken,
      verificationExpires: verificationExpiry
    });

    await subscriber.save();

    // 인증 이메일 발송
    await sendNewsletterVerificationEmail(email, verificationToken, name || '고객');

    return NextResponse.json({
      success: true,
      message: '구독 신청이 완료되었습니다. 이메일 인증을 완료해주세요.'
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: '구독 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: '이메일 주소가 필요합니다.' },
        { status: 400 }
      );
    }

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    
    if (!subscriber) {
      return NextResponse.json({
        subscribed: false,
        message: '구독되지 않은 이메일입니다.'
      });
    }

    return NextResponse.json({
      subscribed: subscriber.status === 'active',
      verified: subscriber.isVerified,
      preferences: subscriber.preferences,
      subscribedAt: subscriber.subscribedAt
    });

  } catch (error) {
    console.error('Newsletter status check error:', error);
    return NextResponse.json(
      { error: '구독 상태 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}















