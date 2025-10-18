import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { LTVSegment, LTVCalculation, LTVMetrics } from '@/models/LTVAnalysis';
import { LTVAnalysisEngine } from '@/lib/ltvAnalysisEngine';
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
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    // 필터 구성
    const filter: any = {};
    if (category) filter['metadata.category'] = category;
    if (status) filter.isActive = status === 'active';

    // LTV 세그먼트 조회
    const segments = await LTVSegment.find(filter)
      .populate('metadata.createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await LTVSegment.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: {
        segments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('LTV analysis fetch error:', error);
    return NextResponse.json(
      { error: 'LTV 분석을 불러올 수 없습니다.' },
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

    const segmentData = await request.json();

    // 필수 필드 검증
    if (!segmentData.name || !segmentData.criteria) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // LTV 세그먼트 생성
    const segment = new LTVSegment({
      ...segmentData,
      metadata: {
        ...segmentData.metadata,
        createdBy: decoded.userId,
        version: '1.0.0',
        environment: 'production'
      }
    });

    await segment.save();

    return NextResponse.json({
      success: true,
      data: segment,
      message: 'LTV 세그먼트가 생성되었습니다.'
    });

  } catch (error) {
    console.error('LTV segment creation error:', error);
    return NextResponse.json(
      { error: 'LTV 세그먼트 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}













