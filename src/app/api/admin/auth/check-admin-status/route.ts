import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { isAdmin: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { isAdmin: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 관리자 권한 확인 (admin@youniqle.com 또는 grigobio237@gmail.com)
    const allowedAdminEmails = ['admin@youniqle.com', 'grigobio237@gmail.com'];
    const isAdmin = user.role === 'admin' || allowedAdminEmails.includes(user.email);

    if (isAdmin) {
      return NextResponse.json({ 
        isAdmin: true, 
        adminId: user._id,
        message: '관리자 권한이 확인되었습니다.'
      });
    } else {
      return NextResponse.json(
        { isAdmin: false, error: '관리자 권한이 필요한 서비스입니다.' },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('Check admin status API error:', error);
    return NextResponse.json(
      { isAdmin: false, error: '관리자 상태 확인에 실패했습니다.' },
      { status: 500 }
    );
  }
}
