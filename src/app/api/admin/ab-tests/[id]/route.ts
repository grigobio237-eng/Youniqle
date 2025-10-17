import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ABTest from '@/models/ABTest';
import ABTestEvent from '@/models/ABTestEvent';
import { ABTestStatsCalculator } from '@/lib/abTestStats';
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
    const test = await ABTest.findById(id).populate('createdBy', 'name email');
    
    if (!test) {
      return NextResponse.json(
        { error: 'A/B 테스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이벤트 데이터 조회 및 통계 계산
    const events = await ABTestEvent.find({ testId: id });
    
    // 변형별 통계 계산
    const variantStats = new Map();
    
    for (const event of events) {
      const key = event.variantName;
      if (!variantStats.has(key)) {
        variantStats.set(key, {
          name: key,
          sampleSize: 0,
          conversions: 0,
          revenue: 0,
          avgOrderValue: 0
        });
      }
      
      const stats = variantStats.get(key);
      stats.sampleSize++;
      
      if (event.eventType === 'conversion' || event.eventType === 'purchase') {
        stats.conversions++;
        if (event.eventValue) {
          stats.revenue += event.eventValue;
        }
      }
    }

    // 변형별 전환율 계산
    const variants = Array.from(variantStats.values()).map(variant => ({
      ...variant,
      conversionRate: variant.sampleSize > 0 ? variant.conversions / variant.sampleSize : 0,
      avgOrderValue: variant.conversions > 0 ? variant.revenue / variant.conversions : 0
    }));

    // 통계적 유의성 계산
    let results = null;
    if (variants.length >= 2) {
      try {
        results = ABTestStatsCalculator.calculateTestResults(
          variants,
          test.significanceLevel,
          0.95,
          test.endDate ? Math.ceil((test.endDate.getTime() - test.startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
        );
      } catch (error) {
        console.error('Statistics calculation error:', error);
      }
    }

    // 최근 이벤트 (최근 100개)
    const recentEvents = await ABTestEvent.find({ testId: id })
      .sort({ timestamp: -1 })
      .limit(100)
      .populate('userId', 'name email');

    return NextResponse.json({
      test,
      results,
      recentEvents,
      variantStats: variants
    });

  } catch (error) {
    console.error('AB test fetch error:', error);
    return NextResponse.json(
      { error: 'A/B 테스트 정보를 가져올 수 없습니다.' },
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

    const data = await request.json();
    const { action, ...updateData } = data;

    const { id } = await params;
    const test = await ABTest.findById(id);
    
    if (!test) {
      return NextResponse.json(
        { error: 'A/B 테스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 액션별 처리
    switch (action) {
      case 'start':
        if (test.status !== 'draft') {
          return NextResponse.json(
            { error: '초안 상태의 테스트만 시작할 수 있습니다.' },
            { status: 400 }
          );
        }
        test.status = 'running';
        test.startDate = new Date();
        break;

      case 'pause':
        if (test.status !== 'running') {
          return NextResponse.json(
            { error: '실행 중인 테스트만 일시정지할 수 있습니다.' },
            { status: 400 }
          );
        }
        test.status = 'paused';
        break;

      case 'resume':
        if (test.status !== 'paused') {
          return NextResponse.json(
            { error: '일시정지된 테스트만 재개할 수 있습니다.' },
            { status: 400 }
          );
        }
        test.status = 'running';
        break;

      case 'stop':
        if (!['running', 'paused'].includes(test.status)) {
          return NextResponse.json(
            { error: '실행 중이거나 일시정지된 테스트만 중지할 수 있습니다.' },
            { status: 400 }
          );
        }
        test.status = 'completed';
        test.endDate = new Date();
        break;

      case 'cancel':
        if (test.status === 'completed') {
          return NextResponse.json(
            { error: '완료된 테스트는 취소할 수 없습니다.' },
            { status: 400 }
          );
        }
        test.status = 'cancelled';
        test.endDate = new Date();
        break;

      case 'update':
        // 일반 업데이트
        Object.assign(test, updateData);
        break;

      default:
        return NextResponse.json(
          { error: '유효하지 않은 액션입니다.' },
          { status: 400 }
        );
    }

    test.updatedAt = new Date();
    await test.save();

    return NextResponse.json({
      success: true,
      message: 'A/B 테스트가 업데이트되었습니다.',
      test
    });

  } catch (error) {
    console.error('AB test update error:', error);
    return NextResponse.json(
      { error: 'A/B 테스트 업데이트에 실패했습니다.' },
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

    const { id } = await params;
    const test = await ABTest.findById(id);
    
    if (!test) {
      return NextResponse.json(
        { error: 'A/B 테스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 실행 중인 테스트는 삭제할 수 없음
    if (test.status === 'running') {
      return NextResponse.json(
        { error: '실행 중인 테스트는 삭제할 수 없습니다. 먼저 테스트를 중지하세요.' },
        { status: 400 }
      );
    }

    // 관련 이벤트도 삭제
    await ABTestEvent.deleteMany({ testId: id });
    await ABTest.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'A/B 테스트가 삭제되었습니다.'
    });

  } catch (error) {
    console.error('AB test deletion error:', error);
    return NextResponse.json(
      { error: 'A/B 테스트 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
