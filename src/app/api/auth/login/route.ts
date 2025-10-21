import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validators';
import { verifyPassword, generateToken, createAuthCookie } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { createSecurityMiddleware, SecurityLogger } from '@/lib/security';
import { rateLimiters } from '@/lib/rateLimiter';
import { InputValidator, commonSchemas } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting 적용
    const rateLimitResult = await rateLimiters.login.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: '로그인 시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': rateLimitResult.retryAfter?.toString() || '0',
          }
        }
      );
    }

    // 보안 검증
    const securityCheck = createSecurityMiddleware()(request);
    if (securityCheck) {
      return securityCheck;
    }

    const body = await request.json();
    
    // 입력 검증 및 정리
    const validator = new InputValidator(loginSchema);
    const validationResult = validator.validate(body);
    
    if (!validationResult.isValid) {
      const securityLogger = SecurityLogger.getInstance();
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
      securityLogger.log('security_violation', 
        clientIP, 
        request.headers.get('user-agent') || 'unknown',
        { type: 'validation_failed', errors: validationResult.errors }
      );
      
      return NextResponse.json(
        { 
          error: '입력 데이터를 확인해주세요.',
          details: validationResult.errors.map(err => ({
            field: err.field,
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.sanitizedData;

    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      const securityLogger = SecurityLogger.getInstance();
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
      securityLogger.log('invalid_auth', 
        clientIP, 
        request.headers.get('user-agent') || 'unknown',
        { type: 'user_not_found', email: validatedData.email }
      );
      
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(validatedData.password, user.passwordHash);
    if (!isPasswordValid) {
      const securityLogger = SecurityLogger.getInstance();
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
      securityLogger.log('invalid_auth', 
        clientIP, 
        request.headers.get('user-agent') || 'unknown',
        { type: 'invalid_password', userId: user._id.toString() }
      );
      
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 보강: 추천 코드가 없으면 생성
    if (!user.referralCode) {
      const base = user._id.toString().slice(-6).toUpperCase();
      user.referralCode = `RF${base}`;
      await user.save();
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
        token: token,
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

    // 보안 헤더 적용
    const { SecurityManager } = await import('@/lib/security');
    const securityManager = new SecurityManager();
    return securityManager.applySecurityHeaders(response);
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


