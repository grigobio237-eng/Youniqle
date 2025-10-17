import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { CohortDefinition } from '@/models/CohortAnalysis';
import { CohortAnalysisEngine } from '@/lib/cohortAnalysisEngine';
import jwt from 'jsonwebtoken';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const cohort = await CohortDefinition.findById(id);
    if (!cohort) {
      return NextResponse.json(
        { error: '코호트 분석을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (!cohort.isActive) {
      return NextResponse.json(
        { error: '비활성화된 코호트는 분석할 수 없습니다.' },
        { status: 400 }
      );
    }

    const { analysisPeriod = 12 } = await request.json();

    // 코호트 분석 실행
    const analysis = await CohortAnalysisEngine.analyzeCohort(id, analysisPeriod);

    return NextResponse.json({
      success: true,
      data: analysis,
      message: '코호트 분석이 완료되었습니다.'
    });

  } catch (error) {
    console.error('Cohort analysis execution error:', error);
    return NextResponse.json(
      { error: '코호트 분석 실행에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const analysisPeriod = parseInt(searchParams.get('analysisPeriod') || '12');

    // 코호트 분석 실행
    const analysis = await CohortAnalysisEngine.analyzeCohort(id, analysisPeriod);

    return NextResponse.json({
      success: true,
      data: analysis,
      message: '코호트 분석이 완료되었습니다.'
    });

  } catch (error) {
    console.error('Cohort analysis fetch error:', error);
    return NextResponse.json(
      { error: '코호트 분석을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}
