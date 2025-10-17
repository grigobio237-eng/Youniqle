import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AnalyticsEvent from '@/models/AnalyticsEvent';
import User from '@/models/User';
import Order from '@/models/Order';
import Newsletter from '@/models/Newsletter';
import Coupon from '@/models/Coupon';
import Promotion from '@/models/Promotion';
import ABTest from '@/models/ABTest';
import CustomerSegment from '@/models/CustomerSegment';
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
    const period = searchParams.get('period') || '7d';
    const startDate = getStartDate(period);
    const endDate = new Date();

    // 기본 지표 계산
    const [
      totalUsers,
      activeUsers,
      totalEvents,
      totalRevenue,
      totalOrders,
      avgOrderValue,
      conversionRate,
      bounceRate,
      dailyMetrics,
      topPages,
      topCountries,
      deviceBreakdown,
      channelBreakdown,
      campaignPerformance,
      abTestResults,
      segmentPerformance,
      newsletterStats,
      couponStats,
      promotionStats
    ] = await Promise.all([
      getTotalUsers(startDate, endDate),
      getActiveUsers(startDate, endDate),
      getTotalEvents(startDate, endDate),
      getTotalRevenue(startDate, endDate),
      getTotalOrders(startDate, endDate),
      getAvgOrderValue(startDate, endDate),
      getConversionRate(startDate, endDate),
      getBounceRate(startDate, endDate),
      getDailyMetrics(startDate, endDate),
      getTopPages(startDate, endDate),
      getTopCountries(startDate, endDate),
      getDeviceBreakdown(startDate, endDate),
      getChannelBreakdown(startDate, endDate),
      getCampaignPerformance(startDate, endDate),
      getABTestResults(startDate, endDate),
      getSegmentPerformance(startDate, endDate),
      getNewsletterStats(startDate, endDate),
      getCouponStats(startDate, endDate),
      getPromotionStats(startDate, endDate)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalEvents,
          totalRevenue,
          totalOrders,
          avgOrderValue,
          conversionRate,
          bounceRate
        },
        trends: {
          dailyMetrics
        },
        content: {
          topPages
        },
        geography: {
          topCountries
        },
        technology: {
          deviceBreakdown
        },
        marketing: {
          channelBreakdown,
          campaignPerformance,
          abTestResults,
          segmentPerformance,
          newsletterStats,
          couponStats,
          promotionStats
        }
      },
      period,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics dashboard fetch error:', error);
    return NextResponse.json(
      { error: '분석 대시보드 데이터를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

// 유틸리티 함수들
function getStartDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case '1d':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

async function getTotalUsers(startDate: Date, endDate: Date): Promise<number> {
  return await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });
}

async function getActiveUsers(startDate: Date, endDate: Date): Promise<number> {
  const result = await AnalyticsEvent.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
        userId: { $exists: true }
      }
    },
    { $group: { _id: '$userId' } },
    { $count: 'activeUsers' }
  ]);
  return result[0]?.activeUsers || 0;
}

async function getTotalEvents(startDate: Date, endDate: Date): Promise<number> {
  return await AnalyticsEvent.countDocuments({
    timestamp: { $gte: startDate, $lte: endDate }
  });
}

async function getTotalRevenue(startDate: Date, endDate: Date): Promise<number> {
  const result = await AnalyticsEvent.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
        eventType: 'purchase'
      }
    },
    { $group: { _id: null, total: { $sum: '$eventData.totalAmount' } } }
  ]);
  return result[0]?.total || 0;
}

async function getTotalOrders(startDate: Date, endDate: Date): Promise<number> {
  return await Order.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });
}

async function getAvgOrderValue(startDate: Date, endDate: Date): Promise<number> {
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
  ]);
  return result[0]?.avg || 0;
}

async function getConversionRate(startDate: Date, endDate: Date): Promise<number> {
  const [pageViews, conversions] = await Promise.all([
    AnalyticsEvent.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate },
      eventType: 'page_view'
    }),
    AnalyticsEvent.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate },
      eventType: { $in: ['conversion', 'purchase'] }
    })
  ]);
  
  return pageViews > 0 ? (conversions / pageViews) * 100 : 0;
}

async function getBounceRate(startDate: Date, endDate: Date): Promise<number> {
  const [totalSessions, bounceSessions] = await Promise.all([
    AnalyticsEvent.distinct('sessionId', {
      timestamp: { $gte: startDate, $lte: endDate }
    }),
    AnalyticsEvent.distinct('sessionId', {
      timestamp: { $gte: startDate, $lte: endDate },
      'sessionInfo.isBounce': true
    })
  ]);
  
  return totalSessions.length > 0 ? (bounceSessions.length / totalSessions.length) * 100 : 0;
}

async function getDailyMetrics(startDate: Date, endDate: Date): Promise<any[]> {
  const result = await AnalyticsEvent.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        users: { $addToSet: '$userId' },
        pageViews: {
          $sum: { $cond: [{ $eq: ['$eventType', 'page_view'] }, 1, 0] }
        },
        events: { $sum: 1 },
        conversions: {
          $sum: { $cond: [{ $in: ['$eventType', ['conversion', 'purchase']] }, 1, 0] }
        },
        revenue: { $sum: '$eventData.totalAmount' }
      }
    },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        users: { $size: '$users' },
        pageViews: 1,
        events: 1,
        conversions: 1,
        revenue: 1
      }
    },
    { $sort: { date: 1 } }
  ]);
  
  return result;
}

async function getTopPages(startDate: Date, endDate: Date): Promise<any[]> {
  const result = await AnalyticsEvent.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
        eventType: 'page_view'
      }
    },
    {
      $group: {
        _id: {
          url: '$eventData.pageUrl',
          title: '$eventData.pageTitle'
        },
        views: { $sum: 1 },
        uniqueViews: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        url: '$_id.url',
        title: '$_id.title',
        views: 1,
        uniqueViews: { $size: '$uniqueViews' }
      }
    },
    { $sort: { views: -1 } },
    { $limit: 10 }
  ]);
  
  return result;
}

async function getTopCountries(startDate: Date, endDate: Date): Promise<any[]> {
  const result = await AnalyticsEvent.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$locationInfo.country',
        users: { $addToSet: '$userId' },
        pageViews: {
          $sum: { $cond: [{ $eq: ['$eventType', 'page_view'] }, 1, 0] }
        },
        conversions: {
          $sum: { $cond: [{ $in: ['$eventType', ['conversion', 'purchase']] }, 1, 0] }
        },
        revenue: { $sum: '$eventData.totalAmount' }
      }
    },
    {
      $project: {
        country: '$_id',
        users: { $size: '$users' },
        pageViews: 1,
        conversions: 1,
        revenue: 1
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 }
  ]);
  
  return result;
}

async function getDeviceBreakdown(startDate: Date, endDate: Date): Promise<any[]> {
  const result = await AnalyticsEvent.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$deviceInfo.deviceType',
        users: { $addToSet: '$userId' },
        pageViews: {
          $sum: { $cond: [{ $eq: ['$eventType', 'page_view'] }, 1, 0] }
        },
        conversions: {
          $sum: { $cond: [{ $in: ['$eventType', ['conversion', 'purchase']] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        device: '$_id',
        users: { $size: '$users' },
        pageViews: 1,
        conversions: 1
      }
    },
    { $sort: { users: -1 } }
  ]);
  
  return result;
}

async function getChannelBreakdown(startDate: Date, endDate: Date): Promise<any[]> {
  const result = await AnalyticsEvent.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          source: '$eventData.utmSource',
          medium: '$eventData.utmMedium'
        },
        users: { $addToSet: '$userId' },
        pageViews: {
          $sum: { $cond: [{ $eq: ['$eventType', 'page_view'] }, 1, 0] }
        },
        conversions: {
          $sum: { $cond: [{ $in: ['$eventType', ['conversion', 'purchase']] }, 1, 0] }
        },
        revenue: { $sum: '$eventData.totalAmount' }
      }
    },
    {
      $project: {
        source: '$_id.source',
        medium: '$_id.medium',
        users: { $size: '$users' },
        pageViews: 1,
        conversions: 1,
        revenue: 1
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 }
  ]);
  
  return result;
}

async function getCampaignPerformance(startDate: Date, endDate: Date): Promise<any[]> {
  const result = await AnalyticsEvent.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
        'eventData.utmCampaign': { $exists: true }
      }
    },
    {
      $group: {
        _id: '$eventData.utmCampaign',
        users: { $addToSet: '$userId' },
        pageViews: {
          $sum: { $cond: [{ $eq: ['$eventType', 'page_view'] }, 1, 0] }
        },
        conversions: {
          $sum: { $cond: [{ $in: ['$eventType', ['conversion', 'purchase']] }, 1, 0] }
        },
        revenue: { $sum: '$eventData.totalAmount' }
      }
    },
    {
      $project: {
        campaign: '$_id',
        users: { $size: '$users' },
        pageViews: 1,
        conversions: 1,
        revenue: 1
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 }
  ]);
  
  return result;
}

async function getABTestResults(startDate: Date, endDate: Date): Promise<any[]> {
  const result = await AnalyticsEvent.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
        'eventData.abTestId': { $exists: true }
      }
    },
    {
      $group: {
        _id: {
          testName: '$eventData.abTestName',
          variant: '$eventData.variantName'
        },
        users: { $addToSet: '$userId' },
        views: {
          $sum: { $cond: [{ $eq: ['$eventType', 'ab_test_view'] }, 1, 0] }
        },
        conversions: {
          $sum: { $cond: [{ $eq: ['$eventType', 'ab_test_conversion'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        testName: '$_id.testName',
        variant: '$_id.variantName',
        users: { $size: '$users' },
        views: 1,
        conversions: 1
      }
    },
    { $sort: { conversions: -1 } }
  ]);
  
  return result;
}

async function getSegmentPerformance(startDate: Date, endDate: Date): Promise<any[]> {
  const result = await AnalyticsEvent.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
        'userInfo.segmentIds': { $exists: true, $ne: [] }
      }
    },
    { $unwind: '$userInfo.segmentIds' },
    {
      $lookup: {
        from: 'customersegments',
        localField: 'userInfo.segmentIds',
        foreignField: '_id',
        as: 'segment'
      }
    },
    { $unwind: '$segment' },
    {
      $group: {
        _id: '$segment.name',
        users: { $addToSet: '$userId' },
        conversions: {
          $sum: { $cond: [{ $in: ['$eventType', ['conversion', 'purchase']] }, 1, 0] }
        },
        revenue: { $sum: '$eventData.totalAmount' }
      }
    },
    {
      $project: {
        segmentName: '$_id',
        users: { $size: '$users' },
        conversions: 1,
        revenue: 1
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 }
  ]);
  
  return result;
}

async function getNewsletterStats(startDate: Date, endDate: Date): Promise<any> {
  const [total, active, recentSubscriptions, recentUnsubscriptions] = await Promise.all([
    Newsletter.countDocuments(),
    Newsletter.countDocuments({ status: 'active' }),
    Newsletter.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'active'
    }),
    Newsletter.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'unsubscribed'
    })
  ]);
  
  return {
    total,
    active,
    recentSubscriptions,
    recentUnsubscriptions
  };
}

async function getCouponStats(startDate: Date, endDate: Date): Promise<any> {
  const [total, active, totalUsage, recentUsage] = await Promise.all([
    Coupon.countDocuments(),
    Coupon.countDocuments({ isActive: true }),
    Coupon.aggregate([
      { $group: { _id: null, total: { $sum: '$usageCount' } } }
    ]),
    Coupon.aggregate([
      {
        $match: {
          updatedAt: { $gte: startDate, $lte: endDate }
        }
      },
      { $group: { _id: null, total: { $sum: '$usageCount' } } }
    ])
  ]);
  
  return {
    total,
    active,
    totalUsage: totalUsage[0]?.total || 0,
    recentUsage: recentUsage[0]?.total || 0
  };
}

async function getPromotionStats(startDate: Date, endDate: Date): Promise<any> {
  const [total, active, totalUsage, recentUsage] = await Promise.all([
    Promotion.countDocuments(),
    Promotion.countDocuments({ isActive: true }),
    Promotion.aggregate([
      { $group: { _id: null, total: { $sum: '$usageCount' } } }
    ]),
    Promotion.aggregate([
      {
        $match: {
          updatedAt: { $gte: startDate, $lte: endDate }
        }
      },
      { $group: { _id: null, total: { $sum: '$usageCount' } } }
    ])
  ]);
  
  return {
    total,
    active,
    totalUsage: totalUsage[0]?.total || 0,
    recentUsage: recentUsage[0]?.total || 0
  };
}











