import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 배송지 추가
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { label, recipient, phone, zip, addr1, addr2, isDefault } = await request.json();

    if (!label || !recipient || !phone || !zip || !addr1) {
      return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    const newAddress = {
      label,
      recipient,
      phone,
      zip,
      addr1,
      addr2: addr2 || '',
    };

    // 기본 배송지로 설정하는 경우, 기존 기본 배송지 해제
    if (isDefault && user.addresses && user.addresses.length > 0) {
      user.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
      (newAddress as any).isDefault = true;
    } else if (!user.addresses || user.addresses.length === 0) {
      // 첫 번째 배송지는 자동으로 기본 배송지
      (newAddress as any).isDefault = true;
    }

    if (!user.addresses) {
      user.addresses = [];
    }

    user.addresses.push(newAddress);
    await user.save();

    return NextResponse.json({
      success: true,
      message: '배송지가 추가되었습니다.',
      data: newAddress,
    });
  } catch (error: any) {
    console.error('배송지 추가 오류:', error);
    return NextResponse.json(
      { error: error.message || '배송지 추가에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 배송지 수정
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { addressId, label, recipient, phone, zip, addr1, addr2, isDefault } = await request.json();

    if (!addressId || !label || !recipient || !phone || !zip || !addr1) {
      return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user || !user.addresses) {
      return NextResponse.json({ error: '사용자 또는 배송지를 찾을 수 없습니다.' }, { status: 404 });
    }

    // addressId를 인덱스로 변환 (문자열이면 숫자로 변환)
    const index = typeof addressId === 'string' && !isNaN(parseInt(addressId))
      ? parseInt(addressId)
      : user.addresses.findIndex((addr: any, idx: number) => 
          addr._id?.toString() === addressId || idx.toString() === addressId
        );

    if (index === -1 || !user.addresses[index]) {
      return NextResponse.json({ error: '배송지를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 기본 배송지로 설정하는 경우, 기존 기본 배송지 해제
    if (isDefault) {
      user.addresses.forEach((addr: any, idx: number) => {
        if (idx !== index) {
          addr.isDefault = false;
        }
      });
    }

    user.addresses[index] = {
      label,
      recipient,
      phone,
      zip,
      addr1,
      addr2: addr2 || '',
      isDefault: isDefault || user.addresses[index].isDefault || false,
    };

    await user.save();

    return NextResponse.json({
      success: true,
      message: '배송지가 수정되었습니다.',
      data: user.addresses[index],
    });
  } catch (error: any) {
    console.error('배송지 수정 오류:', error);
    return NextResponse.json(
      { error: error.message || '배송지 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 배송지 삭제
export async function DELETE(request: NextRequest) {
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

    if (index === -1) {
      return NextResponse.json({ error: '배송지를 찾을 수 없습니다.' }, { status: 404 });
    }

    const wasDefault = user.addresses[index].isDefault;

    user.addresses.splice(index, 1);

    // 기본 배송지가 삭제된 경우, 첫 번째 배송지를 기본으로 설정
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: '배송지가 삭제되었습니다.',
    });
  } catch (error: any) {
    console.error('배송지 삭제 오류:', error);
    return NextResponse.json(
      { error: error.message || '배송지 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}

