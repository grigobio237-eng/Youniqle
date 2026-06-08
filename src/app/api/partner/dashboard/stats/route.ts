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

    // ObjectId로 변환
    const partnerObjectId = new mongoose.Types.ObjectId(partnerId);

    // 기본 통계 조회
    const [
      totalProducts,
      activeProducts,
      recentOrders,
      partnerOrders
    ] = await Promise.all([
      Product.countDocuments({ partnerId }),
      Product.countDocuments({ partnerId, status: 'active' }),
      Order.find({ 'partnerOrders.partnerId': partnerObjectId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'name email'),
      Order.aggregate([
        { $unwind: '$partnerOrders' },
        { $match: { 'partnerOrders.partnerId': partnerObjectId } },
        { $group: { _id: null, total: { $sum: 1 } } }
      ])
    ]);

    // 주문 통계 계산
    const totalOrders = partnerOrders[0]?.total || 0;
    
    // 대기 중인 주문 수
    const pendingOrders = await Order.countDocuments({
      'partnerOrders.partnerId': partnerObjectId,
      'partnerOrders.status': 'pending'
    });

    // 매출 통계 계산
    const revenueStats = await Order.aggregate([
      { $unwind: '$partnerOrders' },
      { $match: { 'partnerOrders.partnerId': partnerObjectId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$partnerOrders.subtotal' },
          totalCommission: { $sum: '$partnerOrders.commission' },
          monthlyRevenue: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', new Date(new Date().getFullYear(), new Date().getMonth(), 1)] },
                '$partnerOrders.subtotal',
                0
              ]
            }
          }
        }
      }
    ]);

    const totalRevenue = revenueStats[0]?.totalRevenue || 0;
    const totalCommission = revenueStats[0]?.totalCommission || 0;
    const monthlyRevenue = revenueStats[0]?.monthlyRevenue || 0;

    // 미정산 수수료 계산
    const pendingCommission = await Order.aggregate([
      { $unwind: '$partnerOrders' },
      { 
        $match: { 
          'partnerOrders.partnerId': partnerObjectId,
          'partnerOrders.status': { $in: ['pending', 'confirmed', 'shipped', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$partnerOrders.commission' }
        }
      }
    ]);

    // 인기 상품 조회
    const topProducts = await Order.aggregate([
      { $unwind: '$partnerOrders' },
      { $unwind: '$partnerOrders.items' },
      { $match: { 'partnerOrders.partnerId': partnerObjectId } },
      {
        $group: {
          _id: '$partnerOrders.items.productId',
          sales: { $sum: '$partnerOrders.items.quantity' },
          revenue: { $sum: { $multiply: ['$partnerOrders.items.price', '$partnerOrders.items.quantity'] } }
        }
      },
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

    // 알림 데이터 (임시)
    const notifications = [
      {
        id: '1',
        type: 'order',
        title: '새로운 주문이 들어왔습니다',
        message: '고객 김철수님이 상품을 주문했습니다.',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2시간 전
      },
      {
        id: '2',
        type: 'payment',
        title: '정산이 완료되었습니다',
        message: '2024년 1월 정산금이 입금되었습니다.',
        isRead: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1일 전
      },
      {
        id: '3',
        type: 'product',
        title: '재고 부족 알림',
        message: '상품 "프리미엄 티셔츠"의 재고가 부족합니다.',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2일 전
      }
    ];

    // 파트너 유형별 추가 데이터 조회
    let typeSpecificStats = {};
    if (partner.partnerApplication?.partnerType === 'trainer' || partner.partnerApplication?.partnerType === 'medical') {
        const CoachingBooking = (await import('@/models/CoachingBooking')).default;
        const [totalBookings, pendingBookings, upcomingBookings] = await Promise.all([
            CoachingBooking.countDocuments({ coachId: partnerId }),
            CoachingBooking.countDocuments({ coachId: partnerId, status: 'pending' }),
            CoachingBooking.find({ 
                coachId: partnerId, 
                status: 'confirmed',
                date: { $gte: new Date().toISOString().split('T')[0] }
            }).sort({ date: 1, time: 1 }).limit(5)
        ]);
        
        typeSpecificStats = {
            totalBookings,
            pendingBookings,
            upcomingBookings: upcomingBookings.map(b => ({
                id: b._id.toString(),
                userName: b.userName,
                programTitle: b.programTitle,
                date: b.date,
                time: b.time,
                status: b.status
            }))
        };
    }

    if (partner.partnerApplication?.partnerType === 'medical') {
        const Diagnosis = (await import('@/models/Diagnosis')).default;
        // 병/의원의 경우 이 파트너가 추천된 리듬체크 결과 또는 이 파트너와 연계된 고객들의 통계
        // (현재는 전체 리듬체크 트렌드 샘플 또는 연계 로직에 따른 데이터)
        const totalMatchingDiagnosis = await Diagnosis.countDocuments({}); 
        typeSpecificStats = {
            ...typeSpecificStats,
            totalPatients: totalMatchingDiagnosis,
            recoveryTrend: [
                { name: '리듬', value: 40 },
                { name: '집중', value: 35 },
                { name: '프리미엄', value: 25 }
            ]
        };
    }

    const stats = {
      partnerType: partner.partnerApplication?.partnerType || 'commerce',
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      monthlyRevenue,
      totalCommission,
      pendingCommission: pendingCommission[0]?.total || 0,
      recentOrders: recentOrders.map(order => ({
        id: order._id.toString(),
        customerName: order.userId?.name || '알 수 없음',
        totalAmount: order.partnerOrders.find((po: any) => po.partnerId.toString() === partnerId)?.subtotal || 0,
        status: order.partnerOrders.find((po: any) => po.partnerId.toString() === partnerId)?.status || 'pending',
        createdAt: order.createdAt,
        items: order.partnerOrders.find((po: any) => po.partnerId.toString() === partnerId)?.items || []
      })),
      topProducts: topProducts.map(item => ({
        id: item.product._id.toString(),
        name: item.product.name,
        sales: item.sales,
        revenue: item.revenue
      })),
      ...typeSpecificStats,
      notifications
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Partner dashboard stats error:', error);
    return NextResponse.json(
      { error: '대시보드 통계를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}
