import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { LTVAnalysisEngine } from '@/lib/ltvAnalysisEngine';
import jwt from 'jsonwebtoken';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // 관리자 인증 확인
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '관리자 인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.type !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    await connectDB();

    // 고객 LTV 분석 실행
    const { userId } = await params;
    const analysis = await LTVAnalysisEngine.analyzeCustomerLTV(userId);

    return NextResponse.json({
      success: true,
      data: analysis,
      message: '고객 LTV 분석이 완료되었습니다.'
    });

  } catch (error) {
    console.error('Customer LTV analysis error:', error);
    return NextResponse.json(
      { error: '고객 LTV 분석에 실패했습니다.' },
      { status: 500 }
    );
  }
}
