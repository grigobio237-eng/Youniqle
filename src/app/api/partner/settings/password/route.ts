import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('partner-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.type !== 'partner') {
      return NextResponse.json(
        { error: '파트너 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '현재 비밀번호와 새 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: '새 비밀번호는 8자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    const partnerId = decoded.id;
    await connectDB();

    const partner = await User.findById(partnerId);
    if (!partner || partner.partnerStatus !== 'approved') {
      return NextResponse.json(
        { error: '승인된 파트너가 아닙니다.' },
        { status: 403 }
      );
    }

    // 현재 비밀번호 확인
    if (!partner.passwordHash) {
      return NextResponse.json(
        { error: '비밀번호가 설정되지 않았습니다.' },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, partner.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '현재 비밀번호가 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    // 새 비밀번호 해시화 및 저장
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    partner.passwordHash = newPasswordHash;
    await partner.save();

    return NextResponse.json({ 
      message: '비밀번호가 성공적으로 변경되었습니다.' 
    });

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: '비밀번호 변경에 실패했습니다.' },
      { status: 500 }
    );
  }
}

