import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Newsletter from '@/models/Newsletter';
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
    const search = searchParams.get('search');

    // 필터 조건 구성
    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    // 총 개수 조회
    const total = await Newsletter.countDocuments(filter);

    // 구독자 목록 조회
    const subscribers = await Newsletter.find(filter)
      .sort({ subscribedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-verificationToken -verificationExpires');

    // 통계 정보
    const stats = await Newsletter.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      subscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        total: total,
        active: statusStats.active || 0,
        unsubscribed: statusStats.unsubscribed || 0,
        bounced: statusStats.bounced || 0
      }
    });

  } catch (error) {
    console.error('Admin newsletter fetch error:', error);
    return NextResponse.json(
      { error: '구독자 목록을 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: '이메일 주소가 필요합니다.' },
        { status: 400 }
      );
    }

    const result = await Newsletter.deleteOne({ email: email.toLowerCase() });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: '구독자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '구독자가 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Admin newsletter delete error:', error);
    return NextResponse.json(
      { error: '구독자 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}














