import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validators';
import { verifyPassword, generateToken, createAuthCookie } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(validatedData.password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Create response with cookie
    const response = NextResponse.json(
      {
        message: '로그인 성공',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          grade: user.grade,
          points: user.points,
        },
      },
      { status: 200 }
    );

    // Set auth cookie
    response.headers.set('Set-Cookie', createAuthCookie(token));

    return response;
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: '입력 데이터를 확인해주세요.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


