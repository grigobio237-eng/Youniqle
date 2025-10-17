import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Newsletter from '@/models/Newsletter';
import Coupon from '@/models/Coupon';
import CouponUsage from '@/models/CouponUsage';
import Promotion from '@/models/Promotion';
import Notification from '@/models/Notification';
import Order from '@/models/Order';
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
    const period = searchParams.get('period') || '30'; // 일수
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // 뉴스레터 통계
    const newsletterStats = await Newsletter.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const newsletterTotal = await Newsletter.countDocuments();
    const newsletterActive = newsletterStats.find(s => s._id === 'active')?.count || 0;
    const newsletterUnsubscribed = newsletterStats.find(s => s._id === 'unsubscribed')?.count || 0;

    // 최근 기간 뉴스레터 구독/해지
    const recentNewsletterStats = await Newsletter.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // 쿠폰 통계
    const couponStats = await Coupon.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' }
        }
      }
    ]);

    const couponTotal = await Coupon.countDocuments();
    const couponActive = couponStats.find(s => s._id === 'active')?.count || 0;
    const couponTotalUsage = couponStats.reduce((sum, s) => sum + s.totalUsage, 0);

    // 최근 기간 쿠폰 사용
    const recentCouponUsage = await CouponUsage.aggregate([
      {
        $match: {
          usedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalDiscount: { $sum: '$discountAmount' }
        }
      }
    ]);

    // 프로모션 통계
    const promotionStats = await Promotion.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' }
        }
      }
    ]);

    const promotionTotal = await Promotion.countDocuments();
    const promotionActive = promotionStats.find(s => s._id === 'active')?.count || 0;
    const promotionTotalUsage = promotionStats.reduce((sum, s) => sum + s.totalUsage, 0);

    // 알림 통계
    const notificationStats = await Notification.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const notificationTotal = await Notification.countDocuments();
    const notificationUnread = notificationStats.find(s => s._id !== 'read')?.count || 0;

    // 최근 기간 알림 전송
    const recentNotificationStats = await Notification.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // 주문 통계 (마케팅 성과 측정)
    const orderStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // 일별 통계 (최근 30일)
    const dailyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // 마케팅 채널별 성과
    const channelPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $unwind: {
          path: '$promotions',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$promotions.promotionId',
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
          discount: { $sum: '$promotions.discountAmount' }
        }
      },
      {
        $lookup: {
          from: 'promotions',
          localField: '_id',
          foreignField: '_id',
          as: 'promotion'
        }
      },
      {
        $unwind: {
          path: '$promotion',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$promotion.type',
          orders: { $sum: '$orders' },
          revenue: { $sum: '$revenue' },
          discount: { $sum: '$discount' }
        }
      }
    ]);

    return NextResponse.json({
      overview: {
        newsletter: {
          total: newsletterTotal,
          active: newsletterActive,
          unsubscribed: newsletterUnsubscribed,
          recentSubscriptions: recentNewsletterStats.find(s => s._id === 'active')?.count || 0,
          recentUnsubscriptions: recentNewsletterStats.find(s => s._id === 'unsubscribed')?.count || 0
        },
        coupon: {
          total: couponTotal,
          active: couponActive,
          totalUsage: couponTotalUsage,
          recentUsage: recentCouponUsage[0]?.count || 0,
          recentDiscount: recentCouponUsage[0]?.totalDiscount || 0
        },
        promotion: {
          total: promotionTotal,
          active: promotionActive,
          totalUsage: promotionTotalUsage
        },
        notification: {
          total: notificationTotal,
          unread: notificationUnread,
          recentSent: recentNotificationStats.reduce((sum, s) => sum + s.count, 0)
        },
        orders: {
          total: orderStats[0]?.totalOrders || 0,
          revenue: orderStats[0]?.totalRevenue || 0,
          avgOrderValue: orderStats[0]?.avgOrderValue || 0
        }
      },
      dailyStats,
      channelPerformance,
      period: parseInt(period)
    });

  } catch (error) {
    console.error('Marketing stats fetch error:', error);
    return NextResponse.json(
      { error: '마케팅 통계를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}











