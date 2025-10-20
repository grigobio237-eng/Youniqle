import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { CohortAnalysisEngine } from '@/lib/cohortAnalysisEngine';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
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

    const { cohortIds } = await request.json();

    if (!cohortIds || !Array.isArray(cohortIds) || cohortIds.length < 2) {
      return NextResponse.json(
        { error: '비교할 코호트 ID가 2개 이상 필요합니다.' },
        { status: 400 }
      );
    }

    // 코호트 비교 분석 실행
    const comparison = await CohortAnalysisEngine.compareCohorts(cohortIds);

    return NextResponse.json({
      success: true,
      data: comparison,
      message: '코호트 비교 분석이 완료되었습니다.'
    });

  } catch (error) {
    console.error('Cohort comparison error:', error);
    return NextResponse.json(
      { error: '코호트 비교 분석에 실패했습니다.' },
      { status: 500 }
    );
  }
}















