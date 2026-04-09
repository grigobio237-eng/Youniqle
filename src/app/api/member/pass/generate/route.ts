import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import MedicalPassPin from '@/models/MedicalPassPin';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 4자리 무작위 PIN 생성
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    // 기존 PIN이 있다면 업데이트, 없으면 생성 (TTL에 의해 5분 후 자동 삭제됨)
    await MedicalPassPin.findOneAndUpdate(
      { userId: user._id },
      { pin, createdAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      success: true, 
      pin,
      expiresIn: 300 // 5분(300초) 후 만료됨을 클라이언트에 알림
    });
  } catch (error) {
    console.error('[PIN Generate Error]:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
