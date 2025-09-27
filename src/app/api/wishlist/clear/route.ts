import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    await connectDB();

    // 사용자 정보 조회
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 위시리스트 전체 비우기
    user.wishlist = [];
    await user.save();

    return NextResponse.json({ 
      message: '위시리스트가 비워졌습니다.',
      wishlist: [] 
    });

  } catch (error) {
    console.error('위시리스트 비우기 오류:', error);
    return NextResponse.json(
      { error: '위시리스트 비우기 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
