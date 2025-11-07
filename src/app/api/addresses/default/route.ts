import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 기본 배송지 설정
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { addressId } = await request.json();

    if (!addressId) {
      return NextResponse.json({ error: '배송지 ID가 필요합니다.' }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user || !user.addresses) {
      return NextResponse.json({ error: '사용자 또는 배송지를 찾을 수 없습니다.' }, { status: 404 });
    }

    // addressId를 인덱스로 변환
    const index = typeof addressId === 'string' && !isNaN(parseInt(addressId))
      ? parseInt(addressId)
      : user.addresses.findIndex((addr: any, idx: number) => 
          addr._id?.toString() === addressId || idx.toString() === addressId
        );

    if (index === -1 || !user.addresses[index]) {
      return NextResponse.json({ error: '배송지를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 모든 배송지의 기본 배송지 해제
    user.addresses.forEach((addr: any) => {
      addr.isDefault = false;
    });

    // 선택한 배송지를 기본 배송지로 설정
    user.addresses[index].isDefault = true;

    await user.save();

    return NextResponse.json({
      success: true,
      message: '기본 배송지가 설정되었습니다.',
      data: user.addresses[index],
    });
  } catch (error: any) {
    console.error('기본 배송지 설정 오류:', error);
    return NextResponse.json(
      { error: error.message || '기본 배송지 설정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

