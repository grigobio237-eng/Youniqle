import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Content from '@/models/Content';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    await connectDB();

    // 날짜 범위 계산
    const now = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

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

    // 매출 계산
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['confirmed', 'preparing', 'shipped', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // 성장률 계산 (이전 기간과 비교)
    const prevStartDate = new Date(startDate);
    const prevEndDate = new Date(startDate);
    const periodDays = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    prevStartDate.setTime(prevStartDate.getTime() - (periodDays * 24 * 60 * 60 * 1000));

    const [
      prevUsers,
      prevPartners,
      prevOrders,
      prevRevenueResult
    ] = await Promise.all([
      User.countDocuments({ 
        createdAt: { $gte: prevStartDate, $lt: prevEndDate }
      }),
      User.countDocuments({ 
        partnerStatus: 'approved',
        createdAt: { $gte: prevStartDate, $lt: prevEndDate }
      }),
      Order.countDocuments({ 
        createdAt: { $gte: prevStartDate, $lt: prevEndDate }
      }),
      Order.aggregate([
        { 
          $match: { 
            status: { $in: ['confirmed', 'preparing', 'shipped', 'delivered'] },
            createdAt: { $gte: prevStartDate, $lt: prevEndDate }
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    const prevRevenue = prevRevenueResult[0]?.total || 0;

    // 성장률 계산 함수
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // 사용자 활동 통계
    const userActivityStats = await User.aggregate([
      {
        $group: {
          _id: null,
          avgSessionTime: { $avg: { $ifNull: ['$sessionTime', 0] } },
          bounceRate: { $avg: { $ifNull: ['$bounceRate', 0] } },
          conversionRate: { $avg: { $ifNull: ['$conversionRate', 0] } }
        }
      }
    ]);

    const avgSessionTime = Math.round(userActivityStats[0]?.avgSessionTime || 0);
    const bounceRate = Math.round(userActivityStats[0]?.bounceRate || 0);
    const conversionRate = Math.round(userActivityStats[0]?.conversionRate || 0);

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

    // 상위 사용자 조회
    const topUsers = await User.aggregate([
      { $match: { role: { $in: ['user', 'member'] } } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders'
        }
      },
      {
        $addFields: {
          orderCount: { $size: '$orders' },
          totalSpent: { $sum: '$orders.totalAmount' }
        }
      },
      { $sort: { orderCount: -1, totalSpent: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: 1,
          email: 1,
          orderCount: 1,
          totalSpent: 1,
          createdAt: 1
        }
      }
    ]);

    // 상위 파트너 조회
    const topPartners = await User.aggregate([
      { $match: { partnerStatus: 'approved' } },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'partnerId',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' },
          totalSales: { $ifNull: ['$partnerStats.totalSales', 0] },
          averageRating: { $ifNull: ['$partnerStats.averageRating', 0] }
        }
      },
      { $sort: { productCount: -1, totalSales: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: 1,
          businessName: 1,
          productCount: 1,
          totalSales: 1,
          averageRating: 1,
          createdAt: 1
        }
      }
    ]);

    // 최근 활동 조회 (가상 데이터)
    const recentActivity = [
      {
        id: '1',
        type: 'user' as const,
        action: '신규 가입',
        user: '새로운 사용자',
        timestamp: new Date().toISOString(),
        details: '소셜 로그인으로 가입'
      },
      {
        id: '2',
        type: 'order' as const,
        action: '새 주문',
        user: '고객 A',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        details: '총 50,000원 주문'
      },
      {
        id: '3',
        type: 'partner' as const,
        action: '파트너 승인',
        user: '새 파트너',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        details: '상품 등록 시작'
      }
    ];

    // 일별 통계 (최근 7일)
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [dailyUsers, dailyOrders, dailyRevenueResult] = await Promise.all([
        User.countDocuments({ 
          createdAt: { $gte: date, $lt: nextDate }
        }),
        Order.countDocuments({ 
          createdAt: { $gte: date, $lt: nextDate }
        }),
        Order.aggregate([
          { 
            $match: { 
              status: { $in: ['confirmed', 'preparing', 'shipped', 'delivered'] },
              createdAt: { $gte: date, $lt: nextDate }
            } 
          },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
      ]);

      dailyStats.push({
        date: date.toISOString().split('T')[0],
        users: dailyUsers,
        orders: dailyOrders,
        revenue: dailyRevenueResult[0]?.total || 0
      });
    }

    const analyticsData = {
      overview: {
        totalUsers,
        totalPartners,
        totalOrders,
        totalRevenue,
        userGrowth: calculateGrowth(newUsers, prevUsers),
        partnerGrowth: calculateGrowth(newPartners, prevPartners),
        orderGrowth: calculateGrowth(newUsers, prevOrders), // 임시로 사용자 증가율 사용
        revenueGrowth: calculateGrowth(totalRevenue, prevRevenue)
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
      recentActivity,
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
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: '분석 데이터를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}
