import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 환경변수 상태 확인
    const envStatus = {
      MONGODB_URI: !!process.env.MONGODB_URI,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    };

    const missingVars = Object.entries(envStatus)
      .filter(([key, exists]) => !exists)
      .map(([key]) => key);

    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      envStatus,
      missingVariables: missingVars,
      hasAllRequiredVars: missingVars.length === 0,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '환경변수 확인 중 오류 발생',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
