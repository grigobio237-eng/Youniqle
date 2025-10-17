import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { FunnelAnalysis } from '@/models/FunnelAnalysis';
import { FunnelAnalysisEngine } from '@/lib/funnelAnalysisEngine';
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
    const funnel = await FunnelAnalysis.findById(id);
    if (!funnel) {
      return NextResponse.json(
        { error: '퍼널 분석을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (!funnel.isActive) {
      return NextResponse.json(
        { error: '비활성화된 퍼널은 분석할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 퍼널 분석 실행
    const metrics = await FunnelAnalysisEngine.analyzeFunnel(id);

    return NextResponse.json({
      success: true,
      data: metrics,
      message: '퍼널 분석이 완료되었습니다.'
    });

  } catch (error) {
    console.error('Funnel analysis execution error:', error);
    return NextResponse.json(
      { error: '퍼널 분석 실행에 실패했습니다.' },
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
    const compare = searchParams.get('compare') === 'true';
    const comparisonStartDate = searchParams.get('comparisonStartDate');
    const comparisonEndDate = searchParams.get('comparisonEndDate');

    if (compare && comparisonStartDate && comparisonEndDate) {
      // 비교 분석
      const comparison = await FunnelAnalysisEngine.compareFunnels(id, {
        startDate: new Date(comparisonStartDate),
        endDate: new Date(comparisonEndDate)
      });

      return NextResponse.json({
        success: true,
        data: comparison,
        message: '퍼널 비교 분석이 완료되었습니다.'
      });
    } else {
      // 단일 분석
      const metrics = await FunnelAnalysisEngine.analyzeFunnel(id);

      return NextResponse.json({
        success: true,
        data: metrics,
        message: '퍼널 분석이 완료되었습니다.'
      });
    }

  } catch (error) {
    console.error('Funnel analysis fetch error:', error);
    return NextResponse.json(
      { error: '퍼널 분석을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}
