import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Settlement from '@/models/Settlement';
import Order from '@/models/Order';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

// 정산 목록 조회 (관리자)
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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status'); // pending, processing, completed, failed, cancelled
    const partnerId = searchParams.get('partnerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search'); // 파트너명, 정산번호 검색

    // 필터 조건 구성
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (partnerId) {
      filter.partnerId = partnerId;
    }
    
    if (startDate || endDate) {
      filter.periodStart = {};
      if (startDate) filter.periodStart.$gte = new Date(startDate);
      if (endDate) filter.periodStart.$lte = new Date(endDate);
    }
    
    if (search) {
      filter.$or = [
        { settlementNumber: new RegExp(search, 'i') },
        { partnerName: new RegExp(search, 'i') },
        { partnerEmail: new RegExp(search, 'i') },
      ];
    }

    // 정산 목록 조회
    const settlements = await Settlement.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('partnerId', 'name email')
      .populate('approvedBy', 'name email')
      .lean();

    const total = await Settlement.countDocuments(filter);

    // 통계 정보
    const stats = await Settlement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalSettlementAmount' },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        settlements,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        stats,
      },
    });
  } catch (error: any) {
    console.error('Error fetching settlements:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '정산 목록 조회 실패' } },
      { status: 500 }
    );
  }
}

// 정산 생성 (관리자)
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { partnerId, periodStart, periodEnd, type = 'manual' } = body;

    // 유효성 검사
    if (!partnerId || !periodStart || !periodEnd) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '필수 필드가 누락되었습니다.' } },
        { status: 400 }
      );
    }

    // 파트너 정보 조회
    const partner = await User.findById(partnerId);
    if (!partner || partner.role !== 'partner' || partner.partnerStatus !== 'approved') {
      return NextResponse.json(
        { success: false, error: { code: 'PARTNER_NOT_FOUND', message: '유효한 파트너를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 해당 기간의 정산 대상 주문 조회
    const orders = await Order.find({
      partnerId: partnerId,
      status: 'delivered', // 배송 완료된 주문만
      createdAt: {
        $gte: new Date(periodStart),
        $lte: new Date(periodEnd),
      },
    }).populate('items.productId');

    if (orders.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_ORDERS', message: '정산 대상 주문이 없습니다.' } },
        { status: 400 }
      );
    }

    // 정산 항목 계산
    const items = orders.map((order: any) => {
      const orderAmount = order.totalAmount;
      const commissionRate = partner.partnerSettings?.commissionRate || 12;
      const commissionAmount = Math.floor(orderAmount * (commissionRate / 100));
      const settlementAmount = orderAmount - commissionAmount;

      return {
        orderId: order._id,
        orderNumber: order.orderNumber || order._id.toString(),
        productName: order.items.map((item: any) => item.name || item.productId?.name).join(', '),
        quantity: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
        orderAmount,
        commissionRate,
        commissionAmount,
        settlementAmount,
        orderDate: order.createdAt,
        orderStatus: order.status,
      };
    });

    // 합계 계산
    const totalOrders = items.length;
    const totalOrderAmount = items.reduce((sum, item) => sum + item.orderAmount, 0);
    const totalCommissionAmount = items.reduce((sum, item) => sum + item.commissionAmount, 0);
    const totalSettlementAmount = items.reduce((sum, item) => sum + item.settlementAmount, 0);

    // 정산 번호 생성
    const settlementNumber = await Settlement.generateSettlementNumber();

    // 정산 생성
    const settlement = await Settlement.create({
      partnerId,
      partnerName: partner.name,
      partnerEmail: partner.email,
      settlementNumber,
      type,
      status: 'pending',
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      items,
      totalOrders,
      totalOrderAmount,
      totalCommissionAmount,
      totalSettlementAmount,
      bankAccount: {
        bankName: partner.partnerApplication?.bankName || '',
        accountNumber: partner.partnerApplication?.bankAccount || '',
        accountHolder: partner.partnerApplication?.accountHolder || '',
      },
      requestedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: { settlement },
      message: '정산이 생성되었습니다.',
    });
  } catch (error: any) {
    console.error('Error creating settlement:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '정산 생성 실패' } },
      { status: 500 }
    );
  }
}



