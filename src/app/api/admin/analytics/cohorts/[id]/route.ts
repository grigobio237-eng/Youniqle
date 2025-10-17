import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { CohortDefinition, CohortMember, CohortMetrics } from '@/models/CohortAnalysis';
import { CohortAnalysisEngine } from '@/lib/cohortAnalysisEngine';
import jwt from 'jsonwebtoken';

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
    const cohort = await CohortDefinition.findById(id)
      .populate('metadata.createdBy', 'name email');

    if (!cohort) {
      return NextResponse.json(
        { error: '코호트 분석을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 최근 메트릭 조회
    const latestMetrics = await CohortMetrics.findOne({ cohortId: cohort._id })
      .sort({ calculatedAt: -1 });

    return NextResponse.json({
      success: true,
      data: {
        cohort,
        latestMetrics
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

export async function PUT(
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
    const updateData = await request.json();

    const cohort = await CohortDefinition.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).populate('metadata.createdBy', 'name email');

    if (!cohort) {
      return NextResponse.json(
        { error: '코호트 분석을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cohort,
      message: '코호트 분석이 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('Cohort analysis update error:', error);
    return NextResponse.json(
      { error: '코호트 분석 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // 코호트 멤버 삭제
    const { id } = await params;
    await CohortMember.deleteMany({ cohortId: id });

    // 코호트 메트릭 삭제
    await CohortMetrics.deleteMany({ cohortId: id });

    // 코호트 정의 삭제
    const cohort = await CohortDefinition.findByIdAndDelete(id);

    if (!cohort) {
      return NextResponse.json(
        { error: '코호트 분석을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '코호트 분석이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Cohort analysis deletion error:', error);
    return NextResponse.json(
      { error: '코호트 분석 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
