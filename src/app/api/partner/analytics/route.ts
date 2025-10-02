import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // 파트너 토큰에서 파트너 ID 추출
    const token = request.cookies.get('partner-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.type !== 'partner') {
      return NextResponse.json(
        { error: '파트너 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const partnerId = decoded.id;
    await connectDB();

    // 파트너 정보 조회
    const partner = await User.findById(partnerId);
    if (!partner || partner.partnerStatus !== 'approved') {
      return NextResponse.json(
        { error: '승인된 파트너가 아닙니다.' },
        { status: 403 }
      );
    }

    // 기간 파라미터 (기본: month)
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    // 기간 계산
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        previousStartDate = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
        break;
      case 'month':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    }

    // ObjectId 변환
    const partnerObjectId = new mongoose.Types.ObjectId(partnerId);

    // 현재 기간 매출 통계
    const currentStats = await Order.aggregate([
      { $unwind: '$partnerOrders' },
      { 
        $match: { 
          'partnerOrders.partnerId': partnerObjectId,
          'createdAt': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$partnerOrders.subtotal' },
          totalOrders: { $sum: 1 },
          totalCommission: { $sum: '$partnerOrders.commission' }
        }
      }
    ]);

    // 이전 기간 매출 통계
    const previousStats = await Order.aggregate([
      { $unwind: '$partnerOrders' },
      { 
        $match: { 
          'partnerOrders.partnerId': partnerObjectId,
          'createdAt': { $gte: previousStartDate, $lt: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$partnerOrders.subtotal' },
          totalOrders: { $sum: 1 },
          totalCommission: { $sum: '$partnerOrders.commission' }
        }
      }
    ]);

    const current = currentStats[0] || { totalRevenue: 0, totalOrders: 0, totalCommission: 0 };
    const previous = previousStats[0] || { totalRevenue: 0, totalOrders: 0, totalCommission: 0 };

    // 일별 매출 데이터
    const dailyRevenue = await Order.aggregate([
      { $unwind: '$partnerOrders' },
      { 
        $match: { 
          'partnerOrders.partnerId': partnerObjectId,
          'createdAt': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$partnerOrders.subtotal' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      { $limit: 30 }
    ]);

    // 인기 상품 Top 10
    const topProducts = await Order.aggregate([
      { $unwind: '$partnerOrders' },
      { $unwind: '$partnerOrders.items' },
      { 
        $match: { 
          'partnerOrders.partnerId': partnerObjectId,
          'createdAt': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$partnerOrders.items.productId',
          sales: { $sum: '$partnerOrders.items.quantity' },
          revenue: { 
            $sum: { 
              $multiply: ['$partnerOrders.items.price', '$partnerOrders.items.quantity'] 
            } 
          }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
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

    // 카테고리별 매출
    const categoryBreakdown = await Order.aggregate([
      { $unwind: '$partnerOrders' },
      { $unwind: '$partnerOrders.items' },
      { 
        $match: { 
          'partnerOrders.partnerId': partnerObjectId,
          'createdAt': { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'partnerOrders.items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { 
            $sum: { 
              $multiply: ['$partnerOrders.items.price', '$partnerOrders.items.quantity'] 
            } 
          }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // 카테고리 비율 계산
    const totalCategoryRevenue = categoryBreakdown.reduce((sum, cat) => sum + cat.revenue, 0);
    const categoryWithPercentage = categoryBreakdown.map(cat => ({
      category: cat._id || '미분류',
      revenue: cat.revenue,
      percentage: totalCategoryRevenue > 0 ? (cat.revenue / totalCategoryRevenue) * 100 : 0
    }));

    const analytics = {
      summary: {
        totalRevenue: current.totalRevenue,
        previousRevenue: previous.totalRevenue,
        totalOrders: current.totalOrders,
        previousOrders: previous.totalOrders,
        averageOrderValue: current.totalOrders > 0 ? current.totalRevenue / current.totalOrders : 0,
        previousAverageOrderValue: previous.totalOrders > 0 ? previous.totalRevenue / previous.totalOrders : 0,
        totalCommission: current.totalCommission,
        previousCommission: previous.totalCommission
      },
      dailyRevenue: dailyRevenue.map(item => ({
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        revenue: item.revenue,
        orders: item.orders
      })),
      topProducts: topProducts.map(item => ({
        id: item.product._id.toString(),
        name: item.product.name,
        sales: item.sales,
        revenue: item.revenue,
        category: item.product.category || '미분류'
      })),
      categoryBreakdown: categoryWithPercentage
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Partner analytics error:', error);
    return NextResponse.json(
      { error: '매출 분석 데이터를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

