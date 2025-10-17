import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Refund from '@/models/Refund';
import { verifyAuth } from '@/lib/auth';

// 환불/교환 목록 조회 (관리자)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', message: '권한이 없습니다.' } },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { refundNumber: new RegExp(search, 'i') },
        { userName: new RegExp(search, 'i') },
        { userEmail: new RegExp(search, 'i') },
        { orderNumber: new RegExp(search, 'i') },
      ];
    }

    const refunds = await Refund.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'name email')
      .populate('partnerId', 'name email')
      .lean();

    const total = await Refund.countDocuments(filter);

    // 통계
    const stats = await Refund.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$finalRefundAmount' },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        refunds,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        stats,
      },
    });
  } catch (error: any) {
    console.error('Error fetching refunds:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '조회 실패' } },
      { status: 500 }
    );
  }
}



