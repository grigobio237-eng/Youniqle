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
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).select('-passwordHash');
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        grade: user.grade,
        points: user.points,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        marketingConsent: user.marketingConsent,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    await connectDB();

    const { phone, marketingConsent, zipCode, address1, address2 } = await request.json();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사용자 정보 업데이트
    if (phone !== undefined) user.phone = phone;
    if (marketingConsent !== undefined) user.marketingConsent = marketingConsent;

    // 주소 정보 업데이트
    if (zipCode && address1) {
      const newAddress = {
        label: '기본 배송지',
        recipient: user.name,
        phone: phone || user.phone || '', // 빈 문자열 허용
        zip: zipCode,
        addr1: address1,
        addr2: address2 || '',
      };

      // 기존 주소가 있으면 업데이트, 없으면 추가
      if (user.addresses && user.addresses.length > 0) {
        user.addresses[0] = newAddress;
      } else {
        user.addresses = [newAddress];
      }
    }

    await user.save();

    return NextResponse.json({
      message: '프로필이 성공적으로 업데이트되었습니다.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        grade: user.grade,
        points: user.points,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        marketingConsent: user.marketingConsent,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

