import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { CohortDefinition } from '@/models/CohortAnalysis';
import { CohortAnalysisEngine } from '@/lib/cohortAnalysisEngine';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const cohortType = searchParams.get('cohortType');
    const status = searchParams.get('status');

    // 필터 구성
    const filter: any = {};
    if (cohortType) filter.cohortType = cohortType;
    if (status) filter.isActive = status === 'active';

    // 코호트 정의 조회
    const cohorts = await CohortDefinition.find(filter)
      .populate('metadata.createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await CohortDefinition.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: {
        cohorts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Cohort analysis fetch error:', error);
    return NextResponse.json(
      { error: '코호트 분석을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

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

    const cohortData = await request.json();

    // 필수 필드 검증
    if (!cohortData.name || !cohortData.cohortType) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 코호트 정의 생성
    const cohort = new CohortDefinition({
      ...cohortData,
      metadata: {
        ...cohortData.metadata,
        createdBy: decoded.userId,
        version: '1.0.0',
        environment: 'production'
      }
    });

    await cohort.save();

    return NextResponse.json({
      success: true,
      data: cohort,
      message: '코호트 분석이 생성되었습니다.'
    });

  } catch (error) {
    console.error('Cohort analysis creation error:', error);
    return NextResponse.json(
      { error: '코호트 분석 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}















