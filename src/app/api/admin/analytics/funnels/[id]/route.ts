import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { FunnelAnalysis, FunnelStep } from '@/models/FunnelAnalysis';
import { FunnelAnalysisEngine } from '@/lib/funnelAnalysisEngine';
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
    const funnel = await FunnelAnalysis.findById(id)
      .populate('metadata.createdBy', 'name email')
      .populate('steps');

    if (!funnel) {
      return NextResponse.json(
        { error: '퍼널 분석을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: funnel
    });

  } catch (error) {
    console.error('Funnel analysis fetch error:', error);
    return NextResponse.json(
      { error: '퍼널 분석을 불러올 수 없습니다.' },
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

    const funnel = await FunnelAnalysis.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).populate('metadata.createdBy', 'name email').populate('steps');

    if (!funnel) {
      return NextResponse.json(
        { error: '퍼널 분석을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: funnel,
      message: '퍼널 분석이 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('Funnel analysis update error:', error);
    return NextResponse.json(
      { error: '퍼널 분석 업데이트에 실패했습니다.' },
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

    // 퍼널 단계 삭제
    const { id } = await params;
    await FunnelStep.deleteMany({ funnelId: id });

    // 퍼널 분석 삭제
    const funnel = await FunnelAnalysis.findByIdAndDelete(id);

    if (!funnel) {
      return NextResponse.json(
        { error: '퍼널 분석을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '퍼널 분석이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Funnel analysis deletion error:', error);
    return NextResponse.json(
      { error: '퍼널 분석 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
