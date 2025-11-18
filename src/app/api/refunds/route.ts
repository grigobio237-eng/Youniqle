import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Refund, { RefundType } from '@/models/Refund';
import Order from '@/models/Order';
import { verifyAuth } from '@/lib/auth';

// 환불/교환 신청 (사용자)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_REQUIRED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      orderId,
      type,
      items,
      reason,
      reasonDetail,
      images,
      refundMethod,
      bankAccount,
      pickupAddress,
      exchangeInfo,
    } = body;

    // 유효성 검사
    if (!orderId || !type || !items || !reason || !reasonDetail) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '필수 필드가 누락되었습니다.' } },
        { status: 400 }
      );
    }

    // 주문 조회
    const order = await Order.findById(orderId).populate('items.productId');
    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'ORDER_NOT_FOUND', message: '주문을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 본인 주문 확인
    if (order.userId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', message: '권한이 없습니다.' } },
        { status: 403 }
      );
    }

    // 배송 완료 상태 확인
    if (order.status !== 'delivered') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ORDER_STATUS', message: '배송 완료된 주문만 환불/교환 가능합니다.' } },
        { status: 400 }
      );
    }

    // 배송 완료 후 7일 이내 확인 (단순 변심의 경우)
    if (reason === 'change_of_mind') {
      const deliveredDate = order.deliveredAt || order.updatedAt;
      const daysSinceDelivery = Math.floor(
        (Date.now() - new Date(deliveredDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceDelivery > 7) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'REFUND_PERIOD_EXPIRED', message: '단순 변심은 배송 완료 후 7일 이내만 가능합니다.' },
          },
          { status: 400 }
        );
      }
    }

    // 금액 계산
    let totalAmount = 0;
    let refundAmount = 0;
    const partnerIds = new Set<string>();
    const partnerNameById = new Map<string, string>();

    if (Array.isArray(order.partnerOrders)) {
      order.partnerOrders.forEach((po: any) => {
        if (po?.partnerId) {
          partnerNameById.set(po.partnerId.toString(), po.partnerName);
        }
      });
    }

    const refundItems = items.map((item: any) => {
      const orderItem = order.items.find(
        (oi: any) =>
          (oi.productId?._id?.toString?.() || oi.productId?.toString?.()) === item.productId
      );
      if (!orderItem) {
        throw new Error('주문 상품을 찾을 수 없습니다.');
      }

      const itemTotal = orderItem.price * item.quantity;
      totalAmount += itemTotal;
      refundAmount += itemTotal;

      const matchedPartnerId =
        orderItem.partnerId?.toString?.() ||
        order.partnerOrders?.find((po: any) =>
          po.items?.some?.(
            (poItem: any) =>
              (poItem.productId?._id?.toString?.() || poItem.productId?.toString?.()) === item.productId
          )
        )?.partnerId?.toString?.();

      if (matchedPartnerId) {
        partnerIds.add(matchedPartnerId);
      }

      return {
        productId: item.productId,
        productName: orderItem.productId?.name || orderItem.name,
        quantity: item.quantity,
        price: orderItem.price,
        totalPrice: itemTotal,
        imageUrl: orderItem.productId?.images?.[0]?.url || orderItem.image,
      };
    });

    // 반품 배송비 계산 (단순 변심의 경우)
    const refundShippingFee = reason === 'change_of_mind' ? 3000 : 0;

    // 최종 환불 금액
    const finalRefundAmount = refundAmount - refundShippingFee;

    // 환불/교환 번호 생성
    const refundNumber = await Refund.generateRefundNumber(type as RefundType);

    // 환불/교환 생성
    const refund = await Refund.create({
      refundNumber,
      type,
      orderId,
      orderNumber: order.orderNumber || order._id.toString(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      partnerId: partnerIds.size === 1 ? Array.from(partnerIds)[0] : undefined,
      partnerName:
        partnerIds.size === 1
          ? partnerNameById.get(Array.from(partnerIds)[0]) || order.partnerName
          : undefined,
      items: refundItems,
      reason,
      reasonDetail,
      images: images || [],
      exchangeInfo: type === 'exchange' ? exchangeInfo : undefined,
      totalAmount,
      refundAmount,
      shippingFee: 0,
      refundShippingFee,
      deductionAmount: 0,
      finalRefundAmount,
      refundMethod: refundMethod || 'credit_card',
      bankAccount: refundMethod === 'bank_transfer' ? bankAccount : undefined,
      pickupAddress,
      status: 'pending',
      requestedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: { refund },
      message: type === 'refund' ? '환불 신청이 완료되었습니다.' : '교환 신청이 완료되었습니다.',
    });
  } catch (error: any) {
    console.error('Error creating refund:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message || '신청 실패' } },
      { status: 500 }
    );
  }
}

// 환불/교환 목록 조회 (사용자)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_REQUIRED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const filter: any = { userId: user.id };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const refunds = await Refund.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Refund.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: {
        refunds,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching refunds:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '조회 실패' } },
      { status: 500 }
    );
  }
}



