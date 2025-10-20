import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { FunnelAnalysis, FunnelStep } from '@/models/FunnelAnalysis';
import { FunnelAnalysisEngine } from '@/lib/funnelAnalysisEngine';
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

    // 퍼널 분석 조회
    const funnels = await FunnelAnalysis.find(filter)
      .populate('metadata.createdBy', 'name email')
      .populate('steps')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await FunnelAnalysis.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: {
        funnels,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Funnel analysis fetch error:', error);
    return NextResponse.json(
      { error: '퍼널 분석을 불러올 수 없습니다.' },
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

    const funnelData = await request.json();

    // 필수 필드 검증
    if (!funnelData.name || !funnelData.steps || funnelData.steps.length === 0) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 퍼널 분석 생성
    const funnel = new FunnelAnalysis({
      ...funnelData,
      metadata: {
        ...funnelData.metadata,
        createdBy: decoded.userId,
        version: '1.0.0',
        environment: 'production'
      }
    });

    await funnel.save();

    // 퍼널 단계 생성
    const steps = [];
    for (let i = 0; i < funnelData.steps.length; i++) {
      const stepData = funnelData.steps[i];
      const step = new FunnelStep({
        ...stepData,
        funnelId: funnel._id,
        stepOrder: i + 1
      });
      await step.save();
      steps.push(step);
    }

    // 퍼널에 단계 연결
    funnel.steps = steps.map(step => step._id);
    await funnel.save();

    // 퍼널 분석 실행
    const metrics = await FunnelAnalysisEngine.analyzeFunnel(funnel._id.toString());

    return NextResponse.json({
      success: true,
      data: {
        funnel: await FunnelAnalysis.findById(funnel._id).populate('steps'),
        metrics
      },
      message: '퍼널 분석이 생성되었습니다.'
    });

  } catch (error) {
    console.error('Funnel analysis creation error:', error);
    return NextResponse.json(
      { error: '퍼널 분석 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}















