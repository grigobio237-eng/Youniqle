import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    console.log('🔍 관리자 토큰 검증 시도:', {
      hasToken: !!token,
      tokenLength: token?.length,
      allCookies: request.cookies.getAll().map(c => ({ name: c.name, value: c.value?.substring(0, 20) + '...' }))
    });

    if (!token) {
      console.log('❌ 관리자 토큰이 없음');
      return NextResponse.json(
        { error: '인증 토큰이 없습니다.' },
        { status: 401 }
      );
    }

    // JWT 토큰 검증
    console.log('🔑 JWT 토큰 검증 중...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log('🔑 JWT 토큰 디코딩 결과:', {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      type: decoded.type
    });

    if (decoded.type !== 'admin') {
      console.log('❌ 관리자 토큰이 아님:', decoded.type);
      return NextResponse.json(
        { error: '관리자 토큰이 아닙니다.' },
        { status: 401 }
      );
    }

    await connectDB();

    // 사용자 정보 확인
    const admin = await User.findById(decoded.id).select('-passwordHash');
    
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 없습니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        grade: admin.grade,
        avatar: admin.avatar,
      }
    });

  } catch (error) {
    console.error('Admin verify error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
