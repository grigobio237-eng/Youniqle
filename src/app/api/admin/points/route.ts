import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { adminGrantPoints, adminDeductPoints } from '@/lib/pointManager';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    await connectDB();

    const admin = await User.findOne({ email: session.user.email });
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { userId, action, amount, description } = await request.json();
    if (!userId || !action || !amount) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    const desc = description || (action === 'grant' ? '관리자 지급' : '관리자 차감');

    if (action === 'grant') {
      const res = await adminGrantPoints(userId, Number(amount), desc);
      if (!res.success) {
        return NextResponse.json({ error: res.error || '포인트 지급 실패' }, { status: 400 });
      }
      return NextResponse.json({ success: true, newBalance: res.newBalance });
    }

    if (action === 'deduct') {
      const res = await adminDeductPoints(userId, Number(amount), desc);
      if (!res.success) {
        return NextResponse.json({ error: res.error || '포인트 차감 실패' }, { status: 400 });
      }
      return NextResponse.json({ success: true, newBalance: res.newBalance });
    }

    return NextResponse.json({ error: '알 수 없는 작업입니다.' }, { status: 400 });
  } catch (error) {
    console.error('관리자 포인트 조정 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}





