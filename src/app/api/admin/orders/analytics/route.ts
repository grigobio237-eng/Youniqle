import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    await connectDB();
    
    // 관리자 권한 확인
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d, 1y
    const partnerId = searchParams.get('partnerId');

    // 기간별 날짜 계산
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
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
        startDate.setDate(now.getDate() - 7);
    }

    // 기본 쿼리 조건
    const baseQuery: any = {
      createdAt: { $gte: startDate }
    };

    if (partnerId) {
      baseQuery['items.partnerId'] = partnerId;
    }

    // 1. 전체 통계
    const [
      totalOrders,
      totalRevenue,
      ordersByStatus,
      ordersByPaymentStatus,
      dailyStats,
      partnerStats,
      topProducts,
      recentOrders
    ] = await Promise.all([
      // 전체 주문 수
      Order.countDocuments(baseQuery),
      
      // 전체 매출
      Order.aggregate([
        { $match: baseQuery },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      
      // 상태별 주문 수
      Order.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      // 결제 상태별 주문 수
      Order.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
      ]),
      
      // 일별 통계 (최근 30일)
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
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
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
        { $limit: 30 }
      ]),
      
      // 파트너별 통계
      Order.aggregate([
        { $match: baseQuery },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.partnerId',
            partnerName: { $first: '$items.partnerName' },
            orders: { $sum: 1 },
            revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
            avgOrderValue: { $avg: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ]),
      
      // 인기 상품 (주문 수 기준)
      Order.aggregate([
        { $match: baseQuery },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            productName: { $first: '$items.productName' },
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 }
      ]),
      
      // 최근 주문 (최근 10개)
      Order.find(baseQuery)
        .populate('items.productId', 'name images partnerName')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    // 2. 실시간 알림 (처리 필요한 주문들)
    const urgentOrders = await Order.find({
      status: { $in: ['pending', 'confirmed'] },
      createdAt: { $lt: new Date(now.getTime() - 2 * 60 * 60 * 1000) } // 2시간 이상 처리 안된 주문
    }).countDocuments();

    // 3. 결제 실패 주문
    const failedPayments = await Order.find({
      paymentStatus: 'failed',
      createdAt: { $gte: startDate }
    }).countDocuments();

    // 4. 환불 요청 (취소된 주문 중 결제 완료된 것)
    const refundRequests = await Order.find({
      status: 'cancelled',
      paymentStatus: 'paid',
      createdAt: { $gte: startDate }
    }).countDocuments();

    return NextResponse.json({
      period,
      summary: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        urgentOrders,
        failedPayments,
        refundRequests
      },
      ordersByStatus: ordersByStatus.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      ordersByPaymentStatus: ordersByPaymentStatus.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      dailyStats: dailyStats.map((item: any) => ({
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        orders: item.orders,
        revenue: item.revenue
      })),
      partnerStats: partnerStats.map((item: any) => ({
        partnerId: item._id,
        partnerName: item.partnerName || 'Unknown',
        orders: item.orders,
        revenue: item.revenue,
        avgOrderValue: Math.round(item.avgOrderValue)
      })),
      topProducts: topProducts.map((item: any) => ({
        productId: item._id,
        productName: item.productName,
        totalQuantity: item.totalQuantity,
        totalRevenue: item.totalRevenue,
        orderCount: item.orderCount
      })),
      recentOrders: recentOrders.map((order: any) => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        customer: {
          name: order.userId?.name || 'Unknown',
          email: order.userId?.email || ''
        },
        items: order.items.map((item: any) => ({
          productName: item.productId?.name || 'Unknown Product',
          quantity: item.quantity,
          price: item.price,
          partnerName: item.productId?.partnerName || 'Unknown'
        })),
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt
      }))
    });

  } catch (error) {
    console.error('관리자 주문 분석 조회 오류:', error);
    return NextResponse.json(
      { error: '주문 분석 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}


