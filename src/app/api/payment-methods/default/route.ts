import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 기본 결제 수단 설정
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { paymentMethodId } = await request.json();

    if (!paymentMethodId) {
      return NextResponse.json({ error: '결제 수단 ID가 필요합니다.' }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user || !user.paymentMethods) {
      return NextResponse.json({ error: '사용자 또는 결제 수단을 찾을 수 없습니다.' }, { status: 404 });
    }

    const index = user.paymentMethods.findIndex((method: any) => 
      method._id?.toString() === paymentMethodId
    );

    if (index === -1) {
      return NextResponse.json({ error: '결제 수단을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 모든 결제 수단의 기본 설정 해제
    user.paymentMethods.forEach((method: any) => {
      method.isDefault = false;
    });

    // 선택한 결제 수단을 기본 결제 수단으로 설정
    user.paymentMethods[index].isDefault = true;

    await user.save();

    return NextResponse.json({
      success: true,
      message: '기본 결제 수단이 설정되었습니다.',
    });
  } catch (error: any) {
    console.error('기본 결제 수단 설정 오류:', error);
    return NextResponse.json(
      { error: error.message || '기본 결제 수단 설정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

