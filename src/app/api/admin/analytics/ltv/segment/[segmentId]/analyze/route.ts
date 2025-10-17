import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { LTVSegment } from '@/models/LTVAnalysis';
import { LTVAnalysisEngine } from '@/lib/ltvAnalysisEngine';
import jwt from 'jsonwebtoken';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ segmentId: string }> }
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

    const { segmentId } = await params;
    const segment = await LTVSegment.findById(segmentId);
    if (!segment) {
      return NextResponse.json(
        { error: 'LTV 세그먼트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (!segment.isActive) {
      return NextResponse.json(
        { error: '비활성화된 세그먼트는 분석할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 세그먼트 LTV 분석 실행
    const analysis = await LTVAnalysisEngine.analyzeSegmentLTV(segmentId);

    return NextResponse.json({
      success: true,
      data: analysis,
      message: '세그먼트 LTV 분석이 완료되었습니다.'
    });

  } catch (error) {
    console.error('Segment LTV analysis execution error:', error);
    return NextResponse.json(
      { error: '세그먼트 LTV 분석 실행에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ segmentId: string }> }
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

    const { segmentId } = await params;
    // 세그먼트 LTV 분석 실행
    const analysis = await LTVAnalysisEngine.analyzeSegmentLTV(segmentId);

    return NextResponse.json({
      success: true,
      data: analysis,
      message: '세그먼트 LTV 분석이 완료되었습니다.'
    });

  } catch (error) {
    console.error('Segment LTV analysis fetch error:', error);
    return NextResponse.json(
      { error: '세그먼트 LTV 분석을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}
