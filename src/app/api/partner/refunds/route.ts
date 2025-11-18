import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Refund from '@/models/Refund';

export async function GET(request: NextRequest) {
  try {
    const partner = await verifyAuth(request);
    if (!partner || partner.role !== 'partner') {
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

    const filter: Record<string, any> = { partnerId: partner.id };
    if (status) filter.status = status;
    if (type) filter.type = type;

    if (search) {
      const keyword = new RegExp(search, 'i');
      filter.$or = [
        { refundNumber: keyword },
        { orderNumber: keyword },
        { userName: keyword },
        { userEmail: keyword },
      ];
    }

    const refunds = await Refund.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Refund.countDocuments(filter);

    const stats = await Refund.aggregate([
      { $match: { partnerId: partner.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          finalAmount: { $sum: '$finalRefundAmount' },
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
    console.error('Error fetching partner refunds:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '조회 실패' } },
      { status: 500 }
    );
  }
}





