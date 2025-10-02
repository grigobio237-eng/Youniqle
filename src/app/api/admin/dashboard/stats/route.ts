import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Review from '@/models/Review';

export async function GET() {
  try {
    await connectDB();

    // 기본 통계 조회
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalReviews,
      recentUsers,
      recentOrders
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Order.countDocuments(),
      Review.countDocuments(),
      User.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email createdAt role'),
      Order.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('userId totalAmount status createdAt')
    ]);

    // 매출 계산
    const orders = await Order.find({ status: { $in: ['completed', 'delivered'] } });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // 최근 30일간 사용자 증가율 계산
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUserCount = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const previousUserCount = totalUsers - recentUserCount;
    const userGrowth = previousUserCount > 0 
      ? Math.round((recentUserCount / previousUserCount) * 100) 
      : 0;

    // 인기 상품 조회 (주문 수 기준)
    const productSales = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', sales: { $sum: '$items.quantity' } } },
      { $sort: { sales: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);

    // 최근 매출 증가율 계산 (간단한 예시)
    const revenueGrowth = 12; // 실제로는 이전 기간과 비교 계산

    // 오늘 방문자 수 (세션 기반이므로 임시 값)
    const todayVisitors = Math.floor(Math.random() * 100) + 50;

    const stats = {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      todayVisitors,
      totalReviews,
      userGrowth,
      revenueGrowth,
      recentUsers: recentUsers.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        joinedAt: user.createdAt,
        role: user.role
      })),
      recentOrders: recentOrders.map(order => ({
        id: order._id.toString(),
        userId: order.userId._id.toString(),
        userName: order.userId.name,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      })),
      topProducts: productSales.map(item => ({
        id: item.product._id.toString(),
        name: item.product.name,
        sales: item.sales,
        revenue: item.sales * item.product.price
      }))
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: '대시보드 통계를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}
















