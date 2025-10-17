import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Settlement from '@/models/Settlement';
import { verifyAuth } from '@/lib/auth';

// 파트너 정산 목록 조회
export async function GET(request: NextRequest) {
  try {
    // 파트너 인증 확인
    const user = await verifyAuth(request);
    if (!user || user.role !== 'partner') {
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
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // 필터 조건 구성
    const filter: any = { partnerId: user.id };
    
    if (status) {
      filter.status = status;
    }
    
    // 연도/월별 필터
    if (year) {
      const yearNum = parseInt(year, 10);
      filter.periodStart = { $gte: new Date(yearNum, 0, 1) };
      filter.periodEnd = { $lte: new Date(yearNum, 11, 31, 23, 59, 59) };
      
      if (month) {
        const monthNum = parseInt(month, 10) - 1; // 0-based
        filter.periodStart = { $gte: new Date(yearNum, monthNum, 1) };
        filter.periodEnd = { $lte: new Date(yearNum, monthNum + 1, 0, 23, 59, 59) };
      }
    }

    // 정산 목록 조회
    const settlements = await Settlement.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-items') // 상세 항목은 제외 (목록에서는 요약만)
      .lean();

    const total = await Settlement.countDocuments(filter);

    // 통계 정보
    const stats = await Settlement.aggregate([
      { $match: { partnerId: user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalSettlementAmount' },
        },
      },
    ]);

    // 전체 통계
    const totalStats = await Settlement.aggregate([
      { $match: { partnerId: user.id } },
      {
        $group: {
          _id: null,
          totalSettlements: { $sum: 1 },
          totalEarnings: { $sum: '$totalSettlementAmount' },
          totalCommission: { $sum: '$totalCommissionAmount' },
          totalOrders: { $sum: '$totalOrders' },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        settlements,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        stats,
        totalStats: totalStats[0] || {
          totalSettlements: 0,
          totalEarnings: 0,
          totalCommission: 0,
          totalOrders: 0,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching partner settlements:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '정산 목록 조회 실패' } },
      { status: 500 }
    );
  }
}



