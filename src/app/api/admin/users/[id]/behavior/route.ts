import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import UserBehavior from '@/models/UserBehavior';
import { verifyAdminToken } from '@/lib/auth';
import { isValidObjectId } from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // 관리자 권한 검증
    const auth = await verifyAdminToken(request);
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    // 유효한 ID 형식인지 확인
    if (!isValidObjectId(userId)) {
      return NextResponse.json({ error: '유효하지 않은 사용자 ID 형식입니다.' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');

    await connectDB();

    const [behaviors, total] = await Promise.all([
      UserBehavior.find({ userId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserBehavior.countDocuments({ userId })
    ]);

    return NextResponse.json({
      success: true,
      data: behaviors,
      pagination: {
        total,
        skip,
        limit,
        hasMore: skip + behaviors.length < total
      }
    });

  } catch (error) {
    console.error('Admin user behavior error:', error);
    return NextResponse.json(
      { error: '행동 로그를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}
