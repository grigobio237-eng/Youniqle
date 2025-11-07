import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Inquiry from '@/models/Inquiry';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 문의 목록 조회 (관리자)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = {};

    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }
    if (priority) {
      query.priority = priority;
    }

    const skip = (page - 1) * limit;

    const [inquiries, total] = await Promise.all([
      Inquiry.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
        .populate('assignedTo', 'name email')
        .populate('adminId', 'name email')
        .lean(),
      Inquiry.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        inquiries,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('문의 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '문의 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

