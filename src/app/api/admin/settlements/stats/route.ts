import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Settlement from '@/models/Settlement';
import { verifyAuth } from '@/lib/auth';

// 정산 통계 조회 (관리자)
export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const user = await verifyAuth(request);
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', message: '권한이 없습니다.' } },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // 기간 필터
    let dateFilter: any = {};
    if (year) {
      const yearNum = parseInt(year, 10);
      dateFilter.periodStart = { $gte: new Date(yearNum, 0, 1) };
      if (month) {
        const monthNum = parseInt(month, 10) - 1;
        dateFilter.periodStart = { $gte: new Date(yearNum, monthNum, 1) };
        dateFilter.periodEnd = { $lte: new Date(yearNum, monthNum + 1, 0, 23, 59, 59) };
      } else {
        dateFilter.periodEnd = { $lte: new Date(yearNum, 11, 31, 23, 59, 59) };
      }
    }

    // 전체 통계
    const overallStats = await Settlement.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalSettlements: { $sum: 1 },
          totalOrders: { $sum: '$totalOrders' },
          totalOrderAmount: { $sum: '$totalOrderAmount' },
          totalCommissionAmount: { $sum: '$totalCommissionAmount' },
          totalSettlementAmount: { $sum: '$totalSettlementAmount' },
        },
      },
    ]);

    // 상태별 통계
    const statusStats = await Settlement.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalSettlementAmount' },
        },
      },
    ]);

    // 파트너별 통계 (상위 10개)
    const topPartners = await Settlement.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: '$partnerId',
          partnerName: { $first: '$partnerName' },
          totalSettlements: { $sum: 1 },
          totalEarnings: { $sum: '$totalSettlementAmount' },
          totalOrders: { $sum: '$totalOrders' },
        },
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: 10 },
    ]);

    // 월별 추이 (최근 12개월)
    const monthlyTrend = await Settlement.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$periodStart' },
            month: { $month: '$periodStart' },
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalSettlementAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // 평균 정산 금액
    const avgStats = await Settlement.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: null,
          avgSettlementAmount: { $avg: '$totalSettlementAmount' },
          avgOrderAmount: { $avg: '$totalOrderAmount' },
          avgCommissionRate: { $avg: { $divide: ['$totalCommissionAmount', '$totalOrderAmount'] } },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overall: overallStats[0] || {
          totalSettlements: 0,
          totalOrders: 0,
          totalOrderAmount: 0,
          totalCommissionAmount: 0,
          totalSettlementAmount: 0,
        },
        statusStats,
        topPartners,
        monthlyTrend,
        averages: avgStats[0] || {
          avgSettlementAmount: 0,
          avgOrderAmount: 0,
          avgCommissionRate: 0,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching settlement stats:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '통계 조회 실패' } },
      { status: 500 }
    );
  }
}



