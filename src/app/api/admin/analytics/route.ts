import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Content from '@/models/Content';
import { AnalyticsService } from '@/lib/analyticsService';
import { createErrorResponse } from '@/lib/serverErrorHandler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    await connectDB();

    const { startDate, now, prevStartDate, prevEndDate } = AnalyticsService.getPeriodDates(range);

    // 기본 통계 조회
    const [
      totalUsers,
      totalPartners,
      totalOrders,
      totalProducts,
      totalContent,
      newUsers,
      newPartners,
      pendingPartners,
      completedOrders,
      activeUsers,
      activePartners
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ partnerStatus: 'approved' }),
      Order.countDocuments(),
      Product.countDocuments(),
      Content.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ 
        partnerStatus: 'approved',
        createdAt: { $gte: startDate }
      }),
      User.countDocuments({ partnerStatus: 'pending' }),
      Order.countDocuments({ status: 'delivered' }),
      User.countDocuments({ 
        lastLoginAt: { $gte: startDate } 
      }),
      User.countDocuments({ 
        partnerStatus: 'approved',
        'partnerStats.lastActivity': { $gte: startDate }
      })
    ]);

    // 매출 및 이전 매출 계산 (Service 활용)
    const [totalRevenue, prevRevenue] = await Promise.all([
      AnalyticsService.getRevenue(),
      AnalyticsService.getRevenue(prevStartDate, prevEndDate)
    ]);

    // 이전 기간 통계 조회 (성장률 계산용)
    const [
      prevUsers,
      prevPartners,
      prevOrders
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: prevStartDate, $lt: prevEndDate } }),
      User.countDocuments({ partnerStatus: 'approved', createdAt: { $gte: prevStartDate, $lt: prevEndDate } }),
      Order.countDocuments({ createdAt: { $gte: prevStartDate, $lt: prevEndDate } })
    ]);

    // 활동 통계 조회 (Service 활용)
    const { avgSessionTime, bounceRate, conversionRate } = await AnalyticsService.getUserStats();

    // 파트너 활동 통계
    const partnerStats = await User.aggregate([
      { $match: { partnerStatus: 'approved' } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: { $ifNull: ['$partnerStats.totalProducts', 0] } },
          totalSales: { $sum: { $ifNull: ['$partnerStats.totalSales', 0] } },
          avgRating: { $avg: { $ifNull: ['$partnerStats.averageRating', 0] } }
        }
      }
    ]);

    const totalPartnerProducts = partnerStats[0]?.totalProducts || 0;
    const totalPartnerSales = partnerStats[0]?.totalSales || 0;
    const avgPartnerRating = partnerStats[0]?.avgRating || 0;

    // 콘텐츠 통계
    const contentStats = await Content.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: { $ifNull: ['$views', 0] } },
          totalLikes: { $sum: { $ifNull: ['$likes', 0] } },
          totalComments: { $sum: { $ifNull: ['$comments', 0] } },
          avgEngagement: { $avg: { $ifNull: ['$engagementRate', 0] } }
        }
      }
    ]);

    const totalViews = contentStats[0]?.totalViews || 0;
    const totalLikes = contentStats[0]?.totalLikes || 0;
    const totalComments = contentStats[0]?.totalComments || 0;
    const avgEngagement = Math.round(contentStats[0]?.avgEngagement || 0);

    // 상위 사용자/파트너 조회 (기존 로직 유지)
    const [topUsers, topPartners] = await Promise.all([
      User.aggregate([
        { $match: { role: { $in: ['user', 'member'] } } },
        { $lookup: { from: 'orders', localField: '_id', foreignField: 'userId', as: 'orders' } },
        { $addFields: { orderCount: { $size: '$orders' }, totalSpent: { $sum: '$orders.totalAmount' } } },
        { $sort: { orderCount: -1, totalSpent: -1 } },
        { $limit: 5 },
        { $project: { name: 1, email: 1, orderCount: 1, totalSpent: 1, createdAt: 1 } }
      ]),
      User.aggregate([
        { $match: { partnerStatus: 'approved' } },
        { $lookup: { from: 'products', localField: '_id', foreignField: 'partnerId', as: 'products' } },
        { $addFields: { productCount: { $size: '$products' }, totalSales: { $ifNull: ['$partnerStats.totalSales', 0] }, averageRating: { $ifNull: ['$partnerStats.averageRating', 0] } } },
        { $sort: { productCount: -1, totalSales: -1 } },
        { $limit: 5 },
        { $project: { name: 1, businessName: 1, productCount: 1, totalSales: 1, averageRating: 1, createdAt: 1 } }
      ])
    ]);

    // 일별 통계
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [dailyUsers, dailyOrders, dailyRevenue] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: date, $lt: nextDate } }),
        Order.countDocuments({ createdAt: { $gte: date, $lt: nextDate } }),
        AnalyticsService.getRevenue(date, nextDate)
      ]);

      dailyStats.push({
        date: date.toISOString().split('T')[0],
        users: dailyUsers,
        orders: dailyOrders,
        revenue: dailyRevenue
      });
    }

    const analyticsData = {
      overview: {
        totalUsers,
        totalPartners,
        totalOrders,
        totalRevenue,
        userGrowth: AnalyticsService.calculateGrowth(newUsers, prevUsers),
        partnerGrowth: AnalyticsService.calculateGrowth(newPartners, prevPartners),
        orderGrowth: AnalyticsService.calculateGrowth(totalOrders, prevOrders),
        revenueGrowth: AnalyticsService.calculateGrowth(totalRevenue, prevRevenue)
      },
      userActivity: {
        activeUsers,
        newUsers,
        inactiveUsers: totalUsers - activeUsers,
        averageSessionTime: avgSessionTime,
        bounceRate,
        conversionRate
      },
      partnerActivity: {
        activePartners,
        newPartners,
        pendingPartners,
        totalProducts: totalPartnerProducts,
        averageRating: avgPartnerRating,
        totalSales: totalPartnerSales
      },
      contentStats: {
        totalContent,
        totalViews,
        totalLikes,
        totalComments,
        averageEngagement: avgEngagement
      },
      recentActivity: [], // 기존 로직 유지
      topPerformers: {
        topUsers: topUsers.map(user => ({
          name: user.name,
          email: user.email,
          orders: user.orderCount,
          spent: user.totalSpent,
          joinDate: user.createdAt
        })),
        topPartners: topPartners.map(partner => ({
          name: partner.name,
          businessName: partner.businessName || partner.email,
          products: partner.productCount,
          sales: partner.totalSales,
          rating: partner.averageRating,
          joinDate: partner.createdAt
        }))
      },
      trends: {
        dailyStats
      }
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    return createErrorResponse(error as Error, 500, request);
  }
}
