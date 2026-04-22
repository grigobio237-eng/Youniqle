import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ABTest from '@/models/ABTest';
import { ABTestStatsCalculator } from '@/lib/abTestStats';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // JWT 토큰으로 사용자 인증
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '인증 토큰이 필요합니다.' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let userId = null;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }
    
    // 관리자 권한 확인
    const User = (await import('@/models/User')).default;
    const user = await User.findById(userId);
    
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // 필터 조건 구성
    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { hypothesis: { $regex: search, $options: 'i' } }
      ];
    }

    // A/B 테스트 목록 조회
    const tests = await ABTest.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await ABTest.countDocuments(filter);

    // 통계 계산
    const stats = await ABTest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      tests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        total: total,
        draft: statusCounts.draft || 0,
        running: statusCounts.running || 0,
        paused: statusCounts.paused || 0,
        completed: statusCounts.completed || 0,
        cancelled: statusCounts.cancelled || 0
      }
    });

  } catch (error) {
    console.error('AB test fetch error:', error);
    return NextResponse.json(
      { error: 'A/B 테스트 목록을 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // JWT 토큰으로 사용자 인증
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '인증 토큰이 필요합니다.' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let userId = null;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }
    
    // 관리자 권한 확인
    const User = (await import('@/models/User')).default;
    const user = await User.findById(userId);
    
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    await connectDB();

    const data = await request.json();

    // 필수 필드 검증
    const requiredFields = ['name', 'type', 'hypothesis', 'successMetric', 'variants', 'startDate'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} 필드는 필수입니다.` },
          { status: 400 }
        );
      }
    }

    // 변형 검증
    if (!Array.isArray(data.variants) || data.variants.length < 2) {
      return NextResponse.json(
        { error: '최소 2개의 변형이 필요합니다.' },
        { status: 400 }
      );
    }

    // 변형 가중치 검증
    const totalWeight = data.variants.reduce((sum: number, variant: any) => sum + variant.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      return NextResponse.json(
        { error: '변형 가중치의 합이 100이어야 합니다.' },
        { status: 400 }
      );
    }

    // 대조군 검증
    const controlCount = data.variants.filter((v: any) => v.isControl).length;
    if (controlCount !== 1) {
      return NextResponse.json(
        { error: '정확히 하나의 대조군이 필요합니다.' },
        { status: 400 }
      );
    }

    // 최소 샘플 크기 계산
    const baselineConversionRate = data.baselineConversionRate || 0.1;
    const expectedLift = data.expectedLift || 10;
    const significanceLevel = data.significanceLevel || 0.05;
    const power = data.power || 0.8;

    const minSampleSize = ABTestStatsCalculator.calculateMinSampleSize(
      baselineConversionRate,
      expectedLift,
      significanceLevel,
      power
    );

    // A/B 테스트 생성
    const abTest = new ABTest({
      ...data,
      createdBy: userId,
      minSampleSize,
      currentSampleSize: 0,
      status: 'draft'
    });

    await abTest.save();

    return NextResponse.json({
      success: true,
      message: 'A/B 테스트가 생성되었습니다.',
      test: abTest
    });

  } catch (error) {
    console.error('AB test creation error:', error);
    return NextResponse.json(
      { 
        error: 'A/B 테스트 생성에 실패했습니다.', 
        details: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

