import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { LTVSegment, LTVMetrics } from '@/models/LTVAnalysis';
import { LTVAnalysisEngine } from '@/lib/ltvAnalysisEngine';
import jwt from 'jsonwebtoken';

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
    const segment = await LTVSegment.findById(segmentId)
      .populate('metadata.createdBy', 'name email');

    if (!segment) {
      return NextResponse.json(
        { error: 'LTV 세그먼트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 최근 메트릭 조회
    const latestMetrics = await LTVMetrics.findOne({ segmentId: segment._id })
      .sort({ calculationDate: -1 });

    return NextResponse.json({
      success: true,
      data: {
        segment,
        latestMetrics
      }
    });

  } catch (error) {
    console.error('LTV segment fetch error:', error);
    return NextResponse.json(
      { error: 'LTV 세그먼트를 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const updateData = await request.json();

    const segment = await LTVSegment.findByIdAndUpdate(
      segmentId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).populate('metadata.createdBy', 'name email');

    if (!segment) {
      return NextResponse.json(
        { error: 'LTV 세그먼트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: segment,
      message: 'LTV 세그먼트가 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('LTV segment update error:', error);
    return NextResponse.json(
      { error: 'LTV 세그먼트 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // LTV 메트릭 삭제
    const { segmentId } = await params;
    await LTVMetrics.deleteMany({ segmentId });

    // LTV 세그먼트 삭제
    const segment = await LTVSegment.findByIdAndDelete(segmentId);

    if (!segment) {
      return NextResponse.json(
        { error: 'LTV 세그먼트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'LTV 세그먼트가 삭제되었습니다.'
    });

  } catch (error) {
    console.error('LTV segment deletion error:', error);
    return NextResponse.json(
      { error: 'LTV 세그먼트 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
