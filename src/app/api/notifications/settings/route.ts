import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 알림 설정 조회
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 사용자 알림 설정 반환 (기본값 포함)
    const settings = user.notificationSettings || {
      email: {
        order: true,
        shipping: true,
        coupon: true,
        point: true,
        promotion: false,
        newsletter: false,
      },
      sms: {
        order: true,
        shipping: true,
        coupon: false,
        promotion: false,
      },
      push: {
        order: true,
        shipping: true,
        coupon: true,
        point: true,
        promotion: false,
      },
    };

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error('알림 설정 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '알림 설정 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 알림 설정 저장
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { settings } = await request.json();

    if (!settings) {
      return NextResponse.json({ error: '알림 설정이 필요합니다.' }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 알림 설정 업데이트
    user.notificationSettings = settings;
    await user.save();

    return NextResponse.json({
      success: true,
      message: '알림 설정이 저장되었습니다.',
      settings: user.notificationSettings,
    });
  } catch (error: any) {
    console.error('알림 설정 저장 오류:', error);
    return NextResponse.json(
      { error: error.message || '알림 설정 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}
