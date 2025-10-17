import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CustomerSegment from '@/models/CustomerSegment';
import { SegmentationEngine } from '@/lib/segmentationEngine';
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
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // 세그먼트 목록 조회
    const segments = await CustomerSegment.find(filter)
      .populate('createdBy', 'name email')
      .sort({ priority: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await CustomerSegment.countDocuments(filter);

    // 통계 계산
    const stats = await CustomerSegment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalUsers: { $sum: '$stats.totalUsers' }
        }
      }
    ]);

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat._id] = { count: stat.count, totalUsers: stat.totalUsers };
      return acc;
    }, {} as Record<string, { count: number; totalUsers: number }>);

    return NextResponse.json({
      segments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        total: total,
        totalUsers: Object.values(statusCounts).reduce((sum, stat: any) => sum + (stat.totalUsers || 0), 0),
        active: statusCounts.active?.count || 0,
        inactive: statusCounts.inactive?.count || 0,
        archived: statusCounts.archived?.count || 0
      }
    });

  } catch (error) {
    console.error('Segments fetch error:', error);
    return NextResponse.json(
      { error: '세그먼트 목록을 가져올 수 없습니다.' },
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

    const data = await request.json();

    // 필수 필드 검증
    const requiredFields = ['name', 'type', 'rules'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} 필드는 필수입니다.` },
          { status: 400 }
        );
      }
    }

    // 규칙 검증
    if (!Array.isArray(data.rules) || data.rules.length === 0) {
      return NextResponse.json(
        { error: '최소 하나의 규칙이 필요합니다.' },
        { status: 400 }
      );
    }

    // 세그먼트 생성
    const segment = new CustomerSegment({
      ...data,
      createdBy: decoded.id,
      stats: {
        totalUsers: 0,
        activeUsers: 0,
        lastUpdated: new Date(),
        updateCount: 0,
        growthRate: 0,
        avgLifetimeValue: 0,
        avgOrderValue: 0,
        avgOrderFrequency: 0,
        churnRate: 0,
        engagementScore: 0
      }
    });

    await segment.save();

    // 자동 업데이트가 활성화된 경우 즉시 계산
    if (segment.settings.autoUpdate) {
      try {
        await SegmentationEngine.calculateSegment(segment._id.toString());
      } catch (error) {
        console.error('Initial segment calculation failed:', error);
        // 계산 실패해도 세그먼트는 생성됨
      }
    }

    return NextResponse.json({
      success: true,
      message: '세그먼트가 생성되었습니다.',
      segment
    });

  } catch (error) {
    console.error('Segment creation error:', error);
    return NextResponse.json(
      { error: '세그먼트 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
