import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import Product from '@/models/Product';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
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

    const partner = await User.findById(partnerId);
    if (!partner || partner.partnerStatus !== 'approved') {
      return NextResponse.json(
        { error: '승인된 파트너가 아닙니다.' },
        { status: 403 }
      );
    }

    const partnerObjectId = new mongoose.Types.ObjectId(partnerId);

    // 실시간 알림 데이터 생성
    const notifications = [];

    // 1. 최근 24시간 내 새 주문 확인
    const recentOrders = await Order.find({
      'partnerOrders.partnerId': partnerObjectId,
      'createdAt': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name');

    recentOrders.forEach(order => {
      const partnerOrder = order.partnerOrders.find(
        (po: any) => po.partnerId.toString() === partnerId
      );
      
      if (partnerOrder && partnerOrder.status === 'pending') {
        notifications.push({
          id: order._id.toString(),
          type: 'order',
          title: '새로운 주문',
          message: `${order.userId.name}님의 주문이 들어왔습니다.`,
          createdAt: order.createdAt,
          isRead: false,
          link: `/partner/orders`
        });
      }
    });

    // 2. 재고 부족 상품 확인
    const lowStockProducts = await Product.find({
      partnerId: partnerId,
      status: 'active',
      $expr: {
        $lte: ['$stock', '$minStock']
      }
    }).limit(5);

    lowStockProducts.forEach(product => {
      notifications.push({
        id: `stock-${product._id}`,
        type: 'stock',
        title: '재고 부족 알림',
        message: `"${product.name}" 상품의 재고가 부족합니다. (현재: ${product.stock}개)`,
        createdAt: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000), // 최근 12시간 내 랜덤
        isRead: false,
        link: `/partner/inventory`
      });
    });

    // 3. 품절 상품 확인
    const outOfStockProducts = await Product.find({
      partnerId: partnerId,
      status: 'active',
      stock: 0
    }).limit(3);

    outOfStockProducts.forEach(product => {
      notifications.push({
        id: `outofstock-${product._id}`,
        type: 'stock',
        title: '품절 알림',
        message: `"${product.name}" 상품이 품절되었습니다.`,
        createdAt: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000), // 최근 6시간 내 랜덤
        isRead: false,
        link: `/partner/inventory`
      });
    });

    // 4. 최근 7일 내 완료된 주문 (정산 대상)
    const completedOrders = await Order.find({
      'partnerOrders.partnerId': partnerObjectId,
      'partnerOrders.status': 'delivered',
      'updatedAt': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).limit(2);

    if (completedOrders.length > 0) {
      const totalCommission = completedOrders.reduce((sum, order) => {
        const partnerOrder = order.partnerOrders.find(
          (po: any) => po.partnerId.toString() === partnerId
        );
        return sum + (partnerOrder?.commission || 0);
      }, 0);

      notifications.push({
        id: 'settlement-1',
        type: 'payment',
        title: '정산 예정',
        message: `${completedOrders.length}건의 주문이 정산 대상입니다. (₩${totalCommission.toLocaleString()})`,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isRead: false,
        link: `/partner/analytics`
      });
    }

    // 5. 시스템 공지사항 (샘플)
    if (notifications.length < 5) {
      notifications.push({
        id: 'system-1',
        type: 'system',
        title: '시스템 공지',
        message: '파트너 대시보드가 업데이트되었습니다. 매출 분석 기능이 추가되었습니다.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isRead: false,
        link: `/partner/analytics`
      });
    }

    // 최신순 정렬
    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // 최대 10개로 제한
    const limitedNotifications = notifications.slice(0, 10);

    return NextResponse.json({
      notifications: limitedNotifications,
      unreadCount: limitedNotifications.filter(n => !n.isRead).length
    });

  } catch (error) {
    console.error('Partner notifications error:', error);
    return NextResponse.json(
      { error: '알림을 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

